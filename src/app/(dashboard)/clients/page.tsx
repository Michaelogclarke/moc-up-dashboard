
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Mail, Phone, Globe, Plus, Users } from "lucide-react";
import ClientForm from "@/components/forms/ClientForm";

function ClientAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colours = [
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const colour = colours[name.charCodeAt(0) % colours.length];
  return (
    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold shrink-0 ${colour}`}>
      {initials}
    </div>
  );
}

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: {
      projects: true,
      invoices: true,
      _count: { select: { projects: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clients</h2>
        <ClientForm
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> New Client
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => {
          const totalPaid = c.invoices
            .filter((i) => i.status === "PAID")
            .reduce((s, i) => s + i.amount, 0);
          const activeProjects = c.projects.filter((p) => p.status === "ACTIVE").length;

          return (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer h-full">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ClientAvatar name={c.name} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{c.name}</p>
                        {c.company && (
                          <p className="text-xs text-muted-foreground truncate">{c.company}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(c.status)}>
                      {c.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    {c.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 shrink-0" /> {c.phone}
                      </div>
                    )}
                    {c.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t">
                    <span className="text-muted-foreground">
                      {c._count.projects} project{c._count.projects !== 1 ? "s" : ""}
                      {activeProjects > 0 && ` · ${activeProjects} active`}
                    </span>
                    <span className="font-semibold text-green-700">{formatCurrency(totalPaid)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">No clients yet</p>
          <p className="text-muted-foreground text-sm mt-1">Add your first client to get started.</p>
        </div>
      )}
    </div>
  );
}
