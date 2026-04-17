"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { TaskStatus, Priority } from "@prisma/client";

export async function createTask(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  await prisma.task.create({
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as TaskStatus) || "TODO",
      priority: (formData.get("priority") as Priority) || "MEDIUM",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      projectId,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTask(id: string, formData: FormData) {
  const projectId = formData.get("projectId") as string;
  await prisma.task.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as TaskStatus) || "TODO",
      priority: (formData.get("priority") as Priority) || "MEDIUM",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string, projectId: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export async function cycleTaskStatus(id: string, currentStatus: TaskStatus, projectId: string) {
  const next = statusCycle[currentStatus];
  await prisma.task.update({
    where: { id },
    data: {
      status: next,
      completedAt: next === "DONE" ? new Date() : null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
