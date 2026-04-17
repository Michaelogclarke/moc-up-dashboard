"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProposal, updateProposal } from "@/lib/actions/proposal.actions";

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

type ProposalData = {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  notes: string | null;
  expiresAt: Date | null;
  clientId: string;
  projectId: string | null;
};

interface Props {
  trigger: React.ReactNode;
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultValues?: ProposalData;
}

export default function ProposalForm({ trigger, clients, projects, defaultValues }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!defaultValues;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        await updateProposal(defaultValues.id, formData);
      } else {
        await createProposal(formData);
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Proposal" : "New Proposal"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required defaultValue={defaultValues?.title} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Client *</Label>
              <select
                id="clientId"
                name="clientId"
                required
                defaultValue={defaultValues?.clientId ?? ""}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select client...</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="projectId">Project</Label>
              <select
                id="projectId"
                name="projectId"
                defaultValue={defaultValues?.projectId ?? ""}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">None</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={defaultValues?.status ?? "DRAFT"}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (£)</Label>
              <Input id="amount" name="amount" type="number" step="0.01" defaultValue={defaultValues?.amount ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">Expires At</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={defaultValues?.expiresAt ? new Date(defaultValues.expiresAt).toISOString().split("T")[0] : ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Proposal"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
