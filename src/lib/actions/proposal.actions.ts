"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ProposalStatus } from "@prisma/client";

export async function createProposal(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  await prisma.proposal.create({
    data: {
      title: formData.get("title") as string,
      status: (formData.get("status") as ProposalStatus) || "DRAFT",
      amount: formData.get("amount") ? parseFloat(formData.get("amount") as string) : null,
      notes: (formData.get("notes") as string) || null,
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
      clientId,
      projectId,
    },
  });
  revalidatePath("/proposals");
  revalidatePath(`/clients/${clientId}`);
}

export async function updateProposal(id: string, formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  await prisma.proposal.update({
    where: { id },
    data: {
      title: formData.get("title") as string,
      status: (formData.get("status") as ProposalStatus) || "DRAFT",
      amount: formData.get("amount") ? parseFloat(formData.get("amount") as string) : null,
      notes: (formData.get("notes") as string) || null,
      expiresAt: formData.get("expiresAt") ? new Date(formData.get("expiresAt") as string) : null,
      clientId,
      projectId,
    },
  });
  revalidatePath("/proposals");
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteProposal(id: string, clientId: string) {
  await prisma.proposal.delete({ where: { id } });
  revalidatePath("/proposals");
  revalidatePath(`/clients/${clientId}`);
}
