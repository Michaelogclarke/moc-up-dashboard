"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InvoiceStatus } from "@prisma/client";

type LineItemInput = { description: string; quantity: string; unitPrice: string };

export async function createInvoice(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  const items: LineItemInput[] = JSON.parse((formData.get("items") as string) || "[]");
  const amount = parseFloat(formData.get("amount") as string) || 0;

  await prisma.invoice.create({
    data: {
      number: formData.get("number") as string,
      status: (formData.get("status") as InvoiceStatus) || "DRAFT",
      amount,
      tax: parseFloat((formData.get("tax") as string) || "0"),
      dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
      notes: (formData.get("notes") as string) || null,
      clientId,
      projectId,
      items: {
        create: items.map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect("/invoices");
}

export async function updateInvoice(id: string, formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  const items: LineItemInput[] = JSON.parse((formData.get("items") as string) || "[]");
  const amount = parseFloat(formData.get("amount") as string) || 0;

  await prisma.$transaction([
    prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }),
    prisma.invoice.update({
      where: { id },
      data: {
        number: formData.get("number") as string,
        status: (formData.get("status") as InvoiceStatus) || "DRAFT",
        amount,
        tax: parseFloat((formData.get("tax") as string) || "0"),
        dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
        notes: (formData.get("notes") as string) || null,
        clientId,
        projectId,
        items: {
          create: items.map((item) => ({
            description: item.description,
            quantity: parseFloat(item.quantity) || 1,
            unitPrice: parseFloat(item.unitPrice) || 0,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/invoices");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  redirect("/invoices");
}

export async function markInvoicePaid(id: string, clientId: string, projectId: string | null) {
  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/invoices");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}

export async function deleteInvoice(id: string, clientId: string, projectId: string | null) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  if (projectId) revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}
