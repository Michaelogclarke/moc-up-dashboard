"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "./types";

export async function createClient(formData: FormData): Promise<ActionResult> {
  try {
    await prisma.client.create({
      data: {
        name: formData.get("name") as string,
        company: (formData.get("company") as string) || null,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        website: (formData.get("website") as string) || null,
        notes: (formData.get("notes") as string) || null,
        status: (formData.get("status") as "ACTIVE" | "INACTIVE" | "LEAD") || "ACTIVE",
      },
    });
    revalidatePath("/clients");
    revalidatePath("/dashboard");
  } catch {
    return { error: "Failed to create client. Please try again." };
  }
}

export async function updateClient(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await prisma.client.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        company: (formData.get("company") as string) || null,
        email: (formData.get("email") as string) || null,
        phone: (formData.get("phone") as string) || null,
        website: (formData.get("website") as string) || null,
        notes: (formData.get("notes") as string) || null,
        status: (formData.get("status") as "ACTIVE" | "INACTIVE" | "LEAD") || "ACTIVE",
      },
    });
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    revalidatePath("/dashboard");
  } catch {
    return { error: "Failed to update client. Please try again." };
  }
}

export async function deleteClient(id: string): Promise<ActionResult> {
  try {
    await prisma.client.delete({ where: { id } });
    revalidatePath("/clients");
    revalidatePath("/dashboard");
  } catch {
    return { error: "Failed to delete client. Please try again." };
  }
  redirect("/clients");
}
