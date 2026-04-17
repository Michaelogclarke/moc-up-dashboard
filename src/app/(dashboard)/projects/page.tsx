import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Plus } from "lucide-react";
import ProjectForm from "@/components/forms/ProjectForm";

export default async function ProjectsPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: true,
        tasks: true,
        invoices: true,
        _count: { select: { milestones: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
  ]);

  const byStatus = (status: string) => projects.filter((p) => p.status === status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <ProjectForm
          clients={clients}
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          }
        />
      </div>

      {["ACTIVE", "PROPOSAL", "ON_HOLD", "LEAD", "COMPLETE", "CANCELLED"].map((status) => {
        const group = byStatus(status);
        if (group.length === 0) return null;
        return (
          <section key={status}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              {status.replace("_", " ")} ({group.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((p) => {
                const paid = p.invoices
                  .filter((i) => i.status === "PAID")
                  .reduce((s, i) => s + i.amount, 0);
                const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
                const taskPct =
                  p.tasks.length > 0
                    ? Math.round((doneTasks / p.tasks.length) * 100)
                    : 0;

                return (
                  <Link key={p.id} href={`/projects/${p.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.client.name}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(p.status)}>
                            {p.status}
                          </Badge>
                        </div>

                        {p.tasks.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Tasks</span>
                              <span>{doneTasks}/{p.tasks.length} · {taskPct}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${taskPct}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                          <span>{formatCurrency(paid)} earned</span>
                          {p.budget && <span>Budget: {formatCurrency(p.budget)}</span>}
                        </div>

                        {p.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.techStack.slice(0, 4).map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                            {p.techStack.length > 4 && (
                              <Badge variant="secondary" className="text-xs">+{p.techStack.length - 4}</Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {projects.length === 0 && (
        <p className="text-muted-foreground text-sm">No projects yet.</p>
      )}
    </div>
  );
}
