"use server";

import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import type { MilestoneStatus } from "@prisma/client";
import type { ActionResult } from "./types";

export async function createMilestone(formData: FormData): Promise<ActionResult> {
  const projectId = formData.get("projectId") as string;
  try {
    await prisma.milestone.create({
      data: {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        status: (formData.get("status") as MilestoneStatus) || "PENDING",
        dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
        projectId,
      },
    });
  } catch {
    return { error: "Failed to create milestone. Please try again." };
  }
}

export async function updateMilestone(id: string, formData: FormData): Promise<ActionResult> {
  const projectId = formData.get("projectId") as string;
  try {
    await prisma.milestone.update({
      where: { id },
      data: {
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || null,
        status: (formData.get("status") as MilestoneStatus) || "PENDING",
        dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
        completedAt: formData.get("status") === "COMPLETE" ? new Date() : null,
      },
    });
  } catch {
    return { error: "Failed to update milestone. Please try again." };
  }
}

export async function deleteMilestone(id: string, projectId: string): Promise<ActionResult> {
  try {
    await prisma.milestone.delete({ where: { id } });
  } catch {
    return { error: "Failed to delete milestone. Please try again." };
  }
}
