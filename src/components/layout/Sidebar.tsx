"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  FileCheck,
  CheckSquare,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/proposals", label: "Proposals", icon: FileCheck },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-slate-900 px-3 py-6 shrink-0">
      <div className="mb-8 px-3">
        <h1 className="font-bold text-base tracking-tight text-white">MóC Up Solutions</h1>
        <p className="text-xs text-slate-400 mt-0.5">Business Dashboard</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-slate-800 pt-4 mt-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          onClick={() => {}}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
