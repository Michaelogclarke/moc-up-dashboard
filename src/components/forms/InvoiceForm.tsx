"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInvoice, updateInvoice } from "@/lib/actions/invoice.actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

type LineItem = { id?: string; description: string; quantity: string; unitPrice: string };
type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

type InvoiceData = {
  id: string;
  number: string;
  status: string;
  tax: number;
  dueDate: Date | null;
  notes: string | null;
  clientId: string;
  projectId: string | null;
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
};

interface Props {
  clients: ClientOption[];
  projects: ProjectOption[];
  defaultValues?: InvoiceData;
  nextNumber?: string;
}

export default function InvoiceForm({ clients, projects, defaultValues, nextNumber }: Props) {
  const isEdit = !!defaultValues;
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<LineItem[]>(
    defaultValues?.items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: String(i.quantity),
      unitPrice: String(i.unitPrice),
    })) ?? [{ description: "", quantity: "1", unitPrice: "0" }]
  );

  const total = items.reduce((sum, item) => {
    return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0);
  }, 0);

  function addItem() {
    setItems([...items, { description: "", quantity: "1", unitPrice: "0" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleSubmit(formData: FormData) {
    formData.set("items", JSON.stringify(items));
    startTransition(async () => {
      const result = isEdit
        ? await updateInvoice(defaultValues.id, formData)
        : await createInvoice(formData);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="number">Invoice # *</Label>
          <Input id="number" name="number" required defaultValue={defaultValues?.number ?? nextNumber} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={defaultValues?.status ?? "DRAFT"}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().split("T")[0] : ""}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientId">Client *</Label>
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={defaultValues?.clientId ?? ""}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tax">Tax (£)</Label>
          <Input id="tax" name="tax" type="number" step="0.01" defaultValue={defaultValues?.tax ?? "0"} />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-3">
        <Label>Line Items</Label>
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Description</th>
                <th className="text-right px-3 py-2 font-medium w-24">Qty</th>
                <th className="text-right px-3 py-2 font-medium w-28">Unit Price</th>
                <th className="text-right px-3 py-2 font-medium w-28">Total</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      placeholder="Description"
                      className="h-7 border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      type="number"
                      min="0"
                      step="0.5"
                      className="h-7 text-right border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className="h-7 text-right border-0 shadow-none focus-visible:ring-0 px-0"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0))}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/30 border-t">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-right font-medium">Total</td>
                <td className="px-3 py-2 text-right font-bold">{formatCurrency(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Line Item
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes ?? ""} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Invoice"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
