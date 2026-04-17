import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import InvoiceMarkPaidButton from "@/components/actions/InvoiceMarkPaidButton";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true, project: true },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    draft: invoices.filter((i) => i.status === "DRAFT").reduce((s, i) => s + i.amount, 0),
    sent: invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.amount, 0),
    paid: invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Link href="/invoices/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Paid", value: stats.paid, color: "text-green-600" },
          { label: "Sent", value: stats.sent, color: "text-blue-600" },
          { label: "Overdue", value: stats.overdue, color: "text-red-600" },
          { label: "Draft", value: stats.draft, color: "" },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{formatCurrency(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-0 divide-y">
          {invoices.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">No invoices yet.</p>
          )}
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between py-4 gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">#{inv.number}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {inv.client.name}
                  {inv.project && ` · ${inv.project.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatCurrency(inv.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString("en-GB")}` : "No due date"}
                  </p>
                </div>
                <Badge variant="outline" className={getStatusColor(inv.status)}>
                  {inv.status}
                </Badge>
                {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                  <InvoiceMarkPaidButton id={inv.id} clientId={inv.clientId} projectId={inv.projectId} />
                )}
                <Link href={`/invoices/${inv.id}/edit`} className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
