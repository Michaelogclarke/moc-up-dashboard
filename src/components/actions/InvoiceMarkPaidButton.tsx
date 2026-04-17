"use client";

import { useTransition } from "react";
import { markInvoicePaid } from "@/lib/actions/invoice.actions";
import { Button } from "@/components/ui/button";

interface Props {
  id: string;
  clientId: string;
  projectId: string | null;
}

export default function InvoiceMarkPaidButton({ id, clientId, projectId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => markInvoicePaid(id, clientId, projectId));
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={isPending}
      className="text-green-700 border-green-300 hover:bg-green-50 text-xs h-7">
      {isPending ? "..." : "Mark Paid"}
    </Button>
  );
}
