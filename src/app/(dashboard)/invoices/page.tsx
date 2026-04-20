
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { Plus, Pencil, FileText } from "lucide-react";
import InvoiceMarkPaidButton from "@/components/actions/InvoiceMarkPaidButton";

const getInvoices = unstable_cache(
  () => prisma.invoice.findMany({ include: { client: true, project: true }, orderBy: { createdAt: "desc" } }),
  ["invoices"],
  { tags: ["invoices"] }
);

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const stats = {
    paid:    invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0),
    sent:    invoices.filter((i) => i.status === "SENT").reduce((s, i) => s + i.amount, 0),
    overdue: invoices.filter((i) => i.status === "OVERDUE").reduce((s, i) => s + i.amount, 0),
    draft:   invoices.filter((i) => i.status === "DRAFT").reduce((s, i) => s + i.amount, 0),
  };

  const statCards = [
    { label: "Paid",    value: stats.paid,    border: "border-l-green-500",  text: "text-green-700" },
    { label: "Sent",    value: stats.sent,    border: "border-l-blue-500",   text: "text-blue-700"  },
    { label: "Overdue", value: stats.overdue, border: "border-l-red-500",    text: "text-red-700"   },
    { label: "Draft",   value: stats.draft,   border: "border-l-slate-400",  text: "text-slate-600" },
  ];

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
        {statCards.map(({ label, value, border, text }) => (
          <Card key={label} className={`border-l-4 ${border}`}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-xl font-bold ${text}`}>{formatCurrency(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {invoices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No invoices yet</p>
              <p className="text-muted-foreground text-sm mt-1">Create your first invoice to start tracking payments.</p>
            </div>
          )}
          {invoices.map((inv, i) => (
            <div
              key={inv.id}
              className={`flex items-center justify-between px-5 py-4 gap-4 hover:bg-muted/40 transition-colors ${i < invoices.length - 1 ? "border-b" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">#{inv.number}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {inv.client.name}
                  {inv.project && ` · ${inv.project.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
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
                <Link href={`/invoices/${inv.id}/edit`} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded">
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
