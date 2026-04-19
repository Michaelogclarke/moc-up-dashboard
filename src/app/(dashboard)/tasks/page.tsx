
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import TaskStatusToggle from "@/components/actions/TaskStatusToggle";
import type { TaskStatus } from "@prisma/client";
import { Circle, Timer, CheckCircle2 } from "lucide-react";

const columns = [
  {
    key: "TODO",
    title: "To Do",
    icon: Circle,
    color: "text-slate-500",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
  },
  {
    key: "IN_PROGRESS",
    title: "In Progress",
    icon: Timer,
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  {
    key: "DONE",
    title: "Done",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
] as const;

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { project: { include: { client: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tasks</h2>
        <p className="text-sm text-muted-foreground mt-1">Click the status badge on a task to advance it. Edit tasks from the project page.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map(({ key, title, icon: Icon, color, bg, dot }) => {
          const colTasks = tasks.filter((t) => t.status === key);
          return (
            <Card key={key} className="flex flex-col">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${bg}`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className={`text-sm font-semibold ${color}`}>{title}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 ${color}`}>
                    {colTasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-2 px-4 pb-4">
                {colTasks.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-xs text-muted-foreground">No tasks here</p>
                  </div>
                )}
                {colTasks.map((t) => (
                  <Link key={t.id} href={`/projects/${t.project.id}`}>
                    <div className="rounded-lg border bg-card p-3 hover:border-indigo-200 hover:shadow-sm transition-all duration-150 space-y-2 cursor-pointer">
                      <p className={`text-sm font-medium leading-snug ${t.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                          <p className="text-xs text-muted-foreground truncate">{t.project.name}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge
                            variant="outline"
                            className={
                              t.priority === "HIGH"
                                ? "bg-red-50 text-red-700 border-red-200 text-xs"
                                : t.priority === "MEDIUM"
                                ? "bg-amber-50 text-amber-700 border-amber-200 text-xs"
                                : "bg-slate-50 text-slate-500 border-slate-200 text-xs"
                            }
                          >
                            {t.priority}
                          </Badge>
                          <TaskStatusToggle id={t.id} status={t.status as TaskStatus} projectId={t.project.id} />
                        </div>
                      </div>
                      {t.dueDate && (
                        <p className={`text-xs ${t.dueDate < new Date() && t.status !== "DONE" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                          Due {new Date(t.dueDate).toLocaleDateString("en-GB")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
