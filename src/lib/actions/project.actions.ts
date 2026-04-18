"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import type { ActionResult } from "./types";

function parseProject(formData: FormData) {
  return {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: (formData.get("status") as ProjectStatus) || "LEAD",
    techStack:
      formData
        .get("techStack")
        ?.toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [],
    repoUrl: (formData.get("repoUrl") as string) || null,
    liveUrl: (formData.get("liveUrl") as string) || null,
    budget: formData.get("budget") ? parseFloat(formData.get("budget") as string) : null,
    startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
    endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
    clientId: formData.get("clientId") as string,
  };
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const data = parseProject(formData);
  try {
    await prisma.project.create({ data });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${data.clientId}`);
  } catch {
    return { error: "Failed to create project. Please try again." };
  }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  const data = parseProject(formData);
  try {
    await prisma.project.update({ where: { id }, data });
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${data.clientId}`);
  } catch {
    return { error: "Failed to update project. Please try again." };
  }
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
  clientId: string
): Promise<ActionResult> {
  try {
    await prisma.project.update({ where: { id }, data: { status } });
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${clientId}`);
  } catch {
    return { error: "Failed to update status." };
  }
}

export async function deleteProject(id: string, clientId: string): Promise<ActionResult> {
  try {
    await prisma.project.delete({ where: { id } });
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    revalidatePath(`/clients/${clientId}`);
  } catch {
    return { error: "Failed to delete project. Please try again." };
  }
  redirect("/projects");
}
