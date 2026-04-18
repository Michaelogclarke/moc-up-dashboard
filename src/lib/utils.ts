import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "PAID":
    case "ACCEPTED":
    case "DONE":
      return "bg-green-50 text-green-700 border-green-200";
    case "LEAD":
    case "SENT":
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PROPOSAL":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "ON_HOLD":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "OVERDUE":
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    case "COMPLETE":
    case "DRAFT":
    case "TODO":
    case "PENDING":
      return "bg-slate-50 text-slate-600 border-slate-200";
    case "CANCELLED":
    case "EXPIRED":
      return "bg-slate-50 text-slate-400 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}
