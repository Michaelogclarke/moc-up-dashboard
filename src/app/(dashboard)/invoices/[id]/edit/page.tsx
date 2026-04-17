import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/forms/InvoiceForm";
import Link from "next/link";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [invoice, clients, projects] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: true } }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!invoice) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground">
            Invoices
          </Link>
          <span className="text-muted-foreground">/</span>
          <h2 className="text-2xl font-bold">Edit Invoice #{invoice.number}</h2>
        </div>
      </div>
      <InvoiceForm clients={clients} projects={projects} defaultValues={invoice} />
    </div>
  );
}
