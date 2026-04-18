export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink, GitBranch, DollarSign, CheckSquare, Flag, FileText, Pencil, Trash2, Plus } from "lucide-react";
import ProjectForm from "@/components/forms/ProjectForm";
import TaskForm from "@/components/forms/TaskForm";
import MilestoneForm from "@/components/forms/MilestoneForm";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";
import TaskStatusToggle from "@/components/actions/TaskStatusToggle";
import ProjectStatusSelect from "@/components/actions/ProjectStatusSelect";
import { deleteProject } from "@/lib/actions/project.actions";
import { deleteTask as removeTask } from "@/lib/actions/task.actions";
import { deleteMilestone } from "@/lib/actions/milestone.actions";
import type { TaskStatus, ProjectStatus } from "@prisma/client";

async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      milestones: { orderBy: { dueDate: "asc" } },
      tasks: { orderBy: [{ status: "asc" }, { dueDate: "asc" }] },
      invoices: { include: { items: true }, orderBy: { createdAt: "desc" } },
      proposals: { orderBy: { createdAt: "desc" } },
    },
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    getProject(id),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!project) notFound();

  const totalInvoiced = project.invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = project.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = project.invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.amount, 0);
  const budgetUsed = project.budget ? Math.round((totalInvoiced / project.budget) * 100) : null;

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = project.tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const totalMilestones = project.milestones.length;
  const completeMilestones = project.milestones.filter((m) => m.status === "COMPLETE").length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
              Projects
            </Link>
            <span className="text-muted-foreground">/</span>
            <h2 className="text-2xl font-bold">{project.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/clients/${project.clientId}`} className="text-sm text-muted-foreground hover:underline">
              {project.client.name}
            </Link>
            <ProjectStatusSelect id={project.id} status={project.status as ProjectStatus} clientId={project.clientId} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                <GitBranch className="h-3 w-3" /> Repo
              </Badge>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                <ExternalLink className="h-3 w-3" /> Live
              </Badge>
            </a>
          )}
          <ProjectForm
            clients={clients}
            defaultValues={{ ...project, startDate: project.startDate, endDate: project.endDate }}
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            }
          />
          <DeleteConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            }
            title="Delete project?"
            description={`This will permanently delete ${project.name} and all its tasks, milestones, and invoices.`}
            action={async () => {
              "use server";
              await deleteProject(id, project.clientId);
            }}
          />
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <AnalyticsCard icon={<DollarSign className="h-4 w-4" />} label="Total Invoiced" value={formatCurrency(totalInvoiced)} sub={project.budget ? `Budget: ${formatCurrency(project.budget)}` : undefined} />
        <AnalyticsCard icon={<DollarSign className="h-4 w-4 text-green-500" />} label="Paid" value={formatCurrency(totalPaid)} sub={budgetUsed !== null ? `${budgetUsed}% of budget` : undefined} accent="green" />
        <AnalyticsCard icon={<DollarSign className="h-4 w-4 text-amber-500" />} label="Outstanding" value={formatCurrency(totalOutstanding)} accent={totalOutstanding > 0 ? "amber" : undefined} />
        <AnalyticsCard icon={<CheckSquare className="h-4 w-4" />} label="Tasks" value={`${doneTasks} / ${totalTasks}`} sub={`${taskPct}% complete`} />
      </div>

      {/* Progress bars */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Task progress</span>
              <span className="text-muted-foreground">
                {doneTasks} done · {inProgressTasks} in progress · {totalTasks - doneTasks - inProgressTasks} to do
              </span>
            </div>
            <ProgressBar value={taskPct} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Milestones</span>
              <span className="text-muted-foreground">{completeMilestones} / {totalMilestones} complete</span>
            </div>
            <ProgressBar value={totalMilestones > 0 ? Math.round((completeMilestones / totalMilestones) * 100) : 0} color="bg-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">
            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />Tasks ({totalTasks})
          </TabsTrigger>
          <TabsTrigger value="milestones">
            <Flag className="h-3.5 w-3.5 mr-1.5" />Milestones ({totalMilestones})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-3.5 w-3.5 mr-1.5" />Invoices ({project.invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Tasks */}
        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tasks</CardTitle>
                <TaskForm
                  projectId={project.id}
                  trigger={
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Task
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0 divide-y">
              {project.tasks.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No tasks yet.</p>
              )}
              {project.tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={getPriorityColor(t.priority)}>
                      {t.priority}
                    </Badge>
                    <TaskStatusToggle id={t.id} status={t.status as TaskStatus} projectId={project.id} />
                    {t.dueDate && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(t.dueDate).toLocaleDateString("en-GB")}
                      </span>
                    )}
                    <TaskForm
                      projectId={project.id}
                      defaultValues={t}
                      trigger={
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      }
                    />
                    <DeleteConfirmDialog
                      trigger={
                        <button className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      }
                      title="Delete task?"
                      description={`Delete "${t.title}"?`}
                      action={async () => {
                        "use server";
                        await removeTask(t.id, project.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones */}
        <TabsContent value="milestones" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Milestones</CardTitle>
                <MilestoneForm
                  projectId={project.id}
                  trigger={
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add Milestone
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0 divide-y">
              {project.milestones.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No milestones yet.</p>
              )}
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.status === "COMPLETE" ? "line-through text-muted-foreground" : ""}`}>
                      {m.title}
                    </p>
                    {m.description && (
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={getStatusColor(m.status)}>
                      {m.status.replace("_", " ")}
                    </Badge>
                    {m.dueDate && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(m.dueDate).toLocaleDateString("en-GB")}
                      </span>
                    )}
                    <MilestoneForm
                      projectId={project.id}
                      defaultValues={m}
                      trigger={
                        <button className="text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      }
                    />
                    <DeleteConfirmDialog
                      trigger={
                        <button className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      }
                      title="Delete milestone?"
                      description={`Delete "${m.title}"?`}
                      action={async () => {
                        "use server";
                        await deleteMilestone(m.id, project.id);
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Invoices</CardTitle>
                <Link href={`/invoices/new`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> New Invoice
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0 divide-y">
              {project.invoices.length === 0 && (
                <p className="text-sm text-muted-foreground py-4">No invoices yet.</p>
              )}
              {project.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Invoice #{inv.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString("en-GB")}` : "No due date"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{formatCurrency(inv.amount)}</span>
                    <Badge variant="outline" className={getStatusColor(inv.status)}>
                      {inv.status}
                    </Badge>
                    <Link href={`/invoices/${inv.id}/edit`} className="text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {project.description && (
        <Card>
          <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {project.techStack.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tech Stack</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {project.techStack.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AnalyticsCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub?: string; accent?: "green" | "amber" | "red" }) {
  const valueColor = accent === "green" ? "text-green-600" : accent === "amber" ? "text-amber-600" : accent === "red" ? "text-red-600" : "";
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ProgressBar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH": return "text-red-600 border-red-200";
    case "MEDIUM": return "text-amber-600 border-amber-200";
    case "LOW": return "text-slate-500 border-slate-200";
    default: return "";
  }
}
