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
    // Project / general
    case "ACTIVE":
      return "text-green-600 border-green-200";
    case "LEAD":
      return "text-blue-600 border-blue-200";
    case "PROPOSAL":
      return "text-purple-600 border-purple-200";
    case "ON_HOLD":
      return "text-amber-600 border-amber-200";
    case "COMPLETE":
      return "text-slate-500 border-slate-200";
    case "CANCELLED":
      return "text-red-400 border-red-100";
    // Invoice
    case "PAID":
      return "text-green-600 border-green-200";
    case "SENT":
      return "text-blue-600 border-blue-200";
    case "OVERDUE":
      return "text-red-600 border-red-200";
    case "DRAFT":
      return "text-slate-500 border-slate-200";
    // Proposal
    case "ACCEPTED":
      return "text-green-600 border-green-200";
    case "REJECTED":
      return "text-red-600 border-red-200";
    case "EXPIRED":
      return "text-slate-400 border-slate-200";
    // Tasks
    case "TODO":
      return "text-slate-500 border-slate-200";
    case "IN_PROGRESS":
      return "text-blue-600 border-blue-200";
    case "DONE":
      return "text-green-600 border-green-200";
    // Milestones
    case "PENDING":
      return "text-slate-500 border-slate-200";
    case "IN-PROGRESS":
      return "text-blue-600 border-blue-200";
    default:
      return "";
  }
}
