"use server";

import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import type { ProposalStatus } from "@prisma/client";
import type { ActionResult } from "./types";

export async function createProposal(formData: FormData): Promise<ActionResult> {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  try {
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
    revalidateTag("proposals");
  } catch {
    return { error: "Failed to create proposal. Please try again." };
  }
}

export async function updateProposal(id: string, formData: FormData): Promise<ActionResult> {
  const clientId = formData.get("clientId") as string;
  const projectId = (formData.get("projectId") as string) || null;
  try {
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
    revalidateTag("proposals");
  } catch {
    return { error: "Failed to update proposal. Please try again." };
  }
}

export async function deleteProposal(id: string, clientId: string): Promise<ActionResult> {
  try {
    await prisma.proposal.delete({ where: { id } });
    revalidateTag("proposals");
  } catch {
    return { error: "Failed to delete proposal. Please try again." };
  }
}
