export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Mail, Phone, Globe, Plus } from "lucide-react";
import ClientForm from "@/components/forms/ClientForm";

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
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      {c.company && (
                        <p className="text-xs text-muted-foreground">{c.company}</p>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        c.status === "ACTIVE"
                          ? "text-green-600 border-green-200"
                          : c.status === "LEAD"
                          ? "text-blue-600 border-blue-200"
                          : "text-muted-foreground"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    {c.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    )}
                    {c.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3" /> {c.website}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t">
                    <span className="text-muted-foreground">
                      {c._count.projects} project{c._count.projects !== 1 ? "s" : ""}
                      {activeProjects > 0 && ` · ${activeProjects} active`}
                    </span>
                    <span className="font-medium">{formatCurrency(totalPaid)} earned</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {clients.length === 0 && (
        <p className="text-muted-foreground text-sm">No clients yet.</p>
      )}
    </div>
  );
}
