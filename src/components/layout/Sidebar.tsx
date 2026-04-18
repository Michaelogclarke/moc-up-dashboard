"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  FileCheck,
  CheckSquare,
  Menu,
  X,
  LogOut,
  Boxes,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients",   label: "Clients",   icon: Users },
  { href: "/projects",  label: "Projects",  icon: FolderKanban },
  { href: "/invoices",  label: "Invoices",  icon: FileText },
  { href: "/proposals", label: "Proposals", icon: FileCheck },
  { href: "/tasks",     label: "Tasks",     icon: CheckSquare },
];

function Brand() {
  return (
    <div className="mb-8 px-2 flex items-center gap-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shrink-0">
        <Boxes className="h-4 w-4 text-white" />
      </div>
      <div>
        <h1 className="font-bold text-sm tracking-tight text-white leading-tight">MóC Up Solutions</h1>
        <p className="text-[11px] text-slate-400">Business Dashboard</p>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-500")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors duration-150 w-full cursor-pointer"
    >
      <LogOut className="h-4 w-4 shrink-0 text-slate-500" />
      Sign out
    </button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-slate-900 px-4 h-14 shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600">
            <Boxes className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">MóC Up Solutions</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-1.5 rounded-md cursor-pointer transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-slate-900 px-3 py-6 shrink-0 border-r border-slate-800">
        <Brand />
        <NavLinks pathname={pathname} />
        <div className="mt-4 pt-4 border-t border-slate-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-900 px-3 py-6 shadow-2xl border-r border-slate-800">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-indigo-600">
                  <Boxes className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-tight text-white">MóC Up Solutions</h1>
                  <p className="text-[11px] text-slate-400">Business Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-4 pt-4 border-t border-slate-800">
              <SignOutButton />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
