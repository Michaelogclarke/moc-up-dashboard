"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { MilestoneStatus } from "@prisma/client";

export async function createMilestone(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  await prisma.milestone.create({
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as MilestoneStatus) || "PENDING",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      projectId,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateMilestone(id: string, formData: FormData) {
  const projectId = formData.get("projectId") as string;
  await prisma.milestone.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      status: (formData.get("status") as MilestoneStatus) || "PENDING",
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      completedAt:
        formData.get("status") === "COMPLETE" ? new Date() : null,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteMilestone(id: string, projectId: string) {
  await prisma.milestone.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}
