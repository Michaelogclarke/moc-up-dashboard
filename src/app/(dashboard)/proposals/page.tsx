export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ProposalForm from "@/components/forms/ProposalForm";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";
import { deleteProposal } from "@/lib/actions/proposal.actions";

export default async function ProposalsPage() {
  const [proposals, clients, projects] = await Promise.all([
    prisma.proposal.findMany({
      include: { client: true, project: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Proposals</h2>
        <ProposalForm
          clients={clients}
          projects={projects}
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Proposal
            </Button>
          }
        />
      </div>

      <Card>
        <CardContent className="pt-0 divide-y">
          {proposals.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">No proposals yet.</p>
          )}
          {proposals.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.client.name}
                  {p.project && ` · ${p.project.name}`}
                </p>
                {p.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(p.expiresAt).toLocaleDateString("en-GB")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.amount && (
                  <p className="font-semibold text-sm">{formatCurrency(p.amount)}</p>
                )}
                <Badge variant="outline" className={getStatusColor(p.status)}>
                  {p.status}
                </Badge>
                <ProposalForm
                  clients={clients}
                  projects={projects}
                  defaultValues={p}
                  trigger={
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  }
                />
                <DeleteConfirmDialog
                  trigger={
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  }
                  title="Delete proposal?"
                  description={`Delete "${p.title}"?`}
                  action={async () => {
                    "use server";
                    await deleteProposal(p.id, p.clientId);
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
