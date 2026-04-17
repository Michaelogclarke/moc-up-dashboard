"use client";

import { useTransition } from "react";
import { updateProjectStatus } from "@/lib/actions/project.actions";
import type { ProjectStatus } from "@prisma/client";

const statuses: ProjectStatus[] = ["LEAD", "PROPOSAL", "ACTIVE", "ON_HOLD", "COMPLETE", "CANCELLED"];

interface Props {
  id: string;
  status: ProjectStatus;
  clientId: string;
}

export default function ProjectStatusSelect({ id, status, clientId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ProjectStatus;
    startTransition(() => updateProjectStatus(id, next, clientId));
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="h-7 rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring disabled:opacity-50"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>{s.replace("_", " ")}</option>
      ))}
    </select>
  );
}
