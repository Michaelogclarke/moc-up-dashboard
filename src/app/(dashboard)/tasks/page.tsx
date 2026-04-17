import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import TaskStatusToggle from "@/components/actions/TaskStatusToggle";
import type { TaskStatus } from "@prisma/client";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    include: { project: { include: { client: true } } },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  const todo = tasks.filter((t) => t.status === "TODO");
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS");
  const done = tasks.filter((t) => t.status === "DONE");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tasks</h2>
      <p className="text-sm text-muted-foreground -mt-4">Click a status badge to advance it. Edit tasks from the project page.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <TaskColumn title="To Do" tasks={todo} />
        <TaskColumn title="In Progress" tasks={inProgress} />
        <TaskColumn title="Done" tasks={done} />
      </div>
    </div>
  );
}

function TaskColumn({
  title,
  tasks,
}: {
  title: string;
  tasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate: Date | null;
    project: { id: string; name: string; client: { name: string } };
  }>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          {title}
          <span className="text-muted-foreground font-normal">{tasks.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-xs text-muted-foreground">None.</p>
        )}
        {tasks.map((t) => (
          <Link key={t.id} href={`/projects/${t.project.id}`}>
            <div className="rounded-md border p-3 hover:bg-muted/50 transition-colors space-y-2">
              <p className={`text-sm font-medium ${t.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                {t.title}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate">{t.project.name}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    variant="outline"
                    className={
                      t.priority === "HIGH" ? "text-red-600 border-red-200 text-xs" :
                      t.priority === "MEDIUM" ? "text-amber-600 border-amber-200 text-xs" : "text-xs"
                    }
                  >
                    {t.priority}
                  </Badge>
                  <TaskStatusToggle id={t.id} status={t.status as TaskStatus} projectId={t.project.id} />
                </div>
              </div>
              {t.dueDate && (
                <p className={`text-xs ${t.dueDate < new Date() && t.status !== "DONE" ? "text-red-500" : "text-muted-foreground"}`}>
                  {new Date(t.dueDate).toLocaleDateString("en-GB")}
                </p>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
