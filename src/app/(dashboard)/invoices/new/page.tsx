
import { prisma } from "@/lib/db";
import InvoiceForm from "@/components/forms/InvoiceForm";
import Link from "next/link";

export default async function NewInvoicePage() {
  const [clients, projects, lastInvoice] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.invoice.findFirst({ orderBy: { number: "desc" } }),
  ]);

  const nextNumber = lastInvoice
    ? `INV-${String(parseInt(lastInvoice.number.replace(/\D/g, "") || "0") + 1).padStart(4, "0")}`
    : "INV-0001";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/invoices" className="text-sm text-muted-foreground hover:text-foreground">
            Invoices
          </Link>
          <span className="text-muted-foreground">/</span>
          <h2 className="text-2xl font-bold">New Invoice</h2>
        </div>
      </div>
      <InvoiceForm clients={clients} projects={projects} nextNumber={nextNumber} />
    </div>
  );
}
