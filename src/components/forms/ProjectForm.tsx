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
import { createProject, updateProject } from "@/lib/actions/project.actions";

type ClientOption = { id: string; name: string };

type ProjectData = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  techStack: string[];
  repoUrl: string | null;
  liveUrl: string | null;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  clientId: string;
};

interface Props {
  trigger: React.ReactNode;
  clients: ClientOption[];
  defaultValues?: ProjectData;
  defaultClientId?: string;
}

export default function ProjectForm({ trigger, clients, defaultValues, defaultClientId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!defaultValues;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        await updateProject(defaultValues.id, formData);
      } else {
        await createProject(formData);
      }
      setOpen(false);
    });
  }

  function formatDate(d: Date | null) {
    if (!d) return "";
    return new Date(d).toISOString().split("T")[0];
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" name="name" required defaultValue={defaultValues?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clientId">Client *</Label>
              <select
                id="clientId"
                name="clientId"
                required
                defaultValue={defaultValues?.clientId ?? defaultClientId ?? ""}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={defaultValues?.status ?? "LEAD"}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="LEAD">Lead</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETE">Complete</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description ?? ""} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="repoUrl">Repo URL</Label>
              <Input id="repoUrl" name="repoUrl" defaultValue={defaultValues?.repoUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="liveUrl">Live URL</Label>
              <Input id="liveUrl" name="liveUrl" defaultValue={defaultValues?.liveUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget">Budget (£)</Label>
              <Input id="budget" name="budget" type="number" step="0.01" defaultValue={defaultValues?.budget ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="techStack">Tech Stack</Label>
              <Input
                id="techStack"
                name="techStack"
                placeholder="Next.js, TypeScript, ..."
                defaultValue={defaultValues?.techStack.join(", ") ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={formatDate(defaultValues?.startDate ?? null)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={formatDate(defaultValues?.endDate ?? null)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
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
