import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Mail, Phone, Globe, Pencil, Trash2 } from "lucide-react";
import ClientForm from "@/components/forms/ClientForm";
import DeleteConfirmDialog from "@/components/forms/DeleteConfirmDialog";
import { deleteClient } from "@/lib/actions/client.actions";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: { include: { tasks: true, invoices: true } },
      invoices: { orderBy: { createdAt: "desc" } },
      proposals: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const totalEarned = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.amount, 0);
  const outstanding = client.invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground">
              Clients
            </Link>
            <span className="text-muted-foreground">/</span>
            <h2 className="text-2xl font-bold">{client.name}</h2>
          </div>
          {client.company && (
            <p className="text-muted-foreground">{client.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <ClientForm
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            }
            defaultValues={client}
          />
          <DeleteConfirmDialog
            trigger={
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            }
            title="Delete client?"
            description={`This will permanently delete ${client.name} and all their associated data.`}
            action={async () => {
              "use server";
              await deleteClient(id);
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {client.phone}
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {client.website}
                </a>
              </div>
            )}
            {client.notes && (
              <p className="text-muted-foreground pt-2 border-t">{client.notes}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total earned</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalEarned)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Outstanding</span>
              <span className={`font-semibold ${outstanding > 0 ? "text-amber-600" : ""}`}>
                {formatCurrency(outstanding)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Invoices</span>
              <span>{client.invoices.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <section>
        <h3 className="font-semibold mb-3">Projects</h3>
        <div className="space-y-2">
          {client.projects.map((p) => {
            const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
            return (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <div className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doneTasks}/{p.tasks.length} tasks done
                    </p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(p.status)}>
                    {p.status}
                  </Badge>
                </div>
              </Link>
            );
          })}
          {client.projects.length === 0 && (
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Invoices</h3>
        <div className="space-y-2">
          {client.invoices.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium text-sm">#{inv.number}</p>
                <p className="text-xs text-muted-foreground">
                  {inv.dueDate ? inv.dueDate.toLocaleDateString("en-GB") : "No due date"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{formatCurrency(inv.amount)}</span>
                <Badge variant="outline" className={getStatusColor(inv.status)}>
                  {inv.status}
                </Badge>
              </div>
            </div>
          ))}
          {client.invoices.length === 0 && (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
