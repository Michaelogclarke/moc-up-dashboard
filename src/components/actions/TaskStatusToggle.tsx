"use client";

import { useTransition } from "react";
import { cycleTaskStatus } from "@/lib/actions/task.actions";
import { toast } from "sonner";
import type { TaskStatus } from "@prisma/client";

const labels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const colors: Record<TaskStatus, string> = {
  TODO: "bg-slate-200 text-slate-700 hover:bg-blue-100 hover:text-blue-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700 hover:bg-green-100 hover:text-green-700",
  DONE: "bg-green-100 text-green-700 hover:bg-slate-100 hover:text-slate-500",
};

interface Props {
  id: string;
  status: TaskStatus;
  projectId: string;
}

export default function TaskStatusToggle({ id, status, projectId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await cycleTaskStatus(id, status, projectId);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Click to advance status"
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer ${colors[status]}`}
    >
      {isPending ? "..." : labels[status]}
    </button>
  );
}
