"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
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
}

export async function updateClient(id: string, formData: FormData) {
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
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  redirect("/clients");
}
