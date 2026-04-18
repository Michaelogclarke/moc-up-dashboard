"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { TaskStatus, Priority } from "@prisma/client";
import type { ActionResult } from "./types";

export async function createTask(formData: FormData): Promise<ActionResult> {
  const projectId = formData.get("projectId") as string;
  try {
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
  } catch {
    return { error: "Failed to create task. Please try again." };
  }
}

export async function updateTask(id: string, formData: FormData): Promise<ActionResult> {
  const projectId = formData.get("projectId") as string;
  try {
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
  } catch {
    return { error: "Failed to update task. Please try again." };
  }
}

export async function deleteTask(id: string, projectId: string): Promise<ActionResult> {
  try {
    await prisma.task.delete({ where: { id } });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/tasks");
    revalidatePath("/dashboard");
  } catch {
    return { error: "Failed to delete task. Please try again." };
  }
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export async function cycleTaskStatus(
  id: string,
  currentStatus: TaskStatus,
  projectId: string
): Promise<ActionResult> {
  const next = statusCycle[currentStatus];
  try {
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
  } catch {
    return { error: "Failed to update task status." };
  }
}
