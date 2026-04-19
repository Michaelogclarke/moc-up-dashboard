"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  FileCheck,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from "lucide-react";

const STORAGE_KEY = "moc-onboarding-dismissed";

const sections = [
  {
    icon: Users,
    color: "bg-indigo-50 text-indigo-600",
    label: "1. Add your clients",
    href: "/clients",
    linkLabel: "Go to Clients →",
    steps: [
      'Click "New Client" in the top-right of the Clients page.',
      "Fill in their name, company, email and any contact details.",
      "Set their status — use Lead for prospects, Active for current clients.",
      "Every project and invoice you create will be linked to a client.",
    ],
  },
  {
    icon: FolderKanban,
    color: "bg-violet-50 text-violet-600",
    label: "2. Create a project",
    href: "/projects",
    linkLabel: "Go to Projects →",
    steps: [
      'On the Projects page, click "New Project" and pick the client it belongs to.',
      "Set a status — Lead → Proposal → Active → Complete is the typical flow.",
      "Add a budget and tech stack so you can track financials per project.",
      "Open the project detail page to manage tasks, milestones, and invoices together.",
    ],
  },
  {
    icon: CheckSquare,
    color: "bg-blue-50 text-blue-600",
    label: "3. Break it into tasks",
    href: "/projects",
    linkLabel: "Open a project →",
    steps: [
      "Inside a project, open the Tasks tab and click Add Task.",
      "Set a priority (Low / Medium / High) and optional due date.",
      "On the Tasks board you can see all tasks across every project in three columns.",
      "Click the status badge on any task card to advance it: To Do → In Progress → Done.",
    ],
  },
  {
    icon: FileCheck,
    color: "bg-purple-50 text-purple-600",
    label: "4. Send a proposal",
    href: "/proposals",
    linkLabel: "Go to Proposals →",
    steps: [
      'On the Proposals page, click "New Proposal" and link it to a client or project.',
      "Add a title, value, and optional expiry date.",
      "Once the client accepts, update the status to Accepted and create a project.",
      "Statuses: Draft → Sent → Accepted / Rejected / Expired.",
    ],
  },
  {
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600",
    label: "5. Invoice and get paid",
    href: "/invoices",
    linkLabel: "Go to Invoices →",
    steps: [
      'Click "New Invoice", choose the client and project, and add line items.',
      "Set a due date and change the status to Sent once you\'ve sent it.",
      'When payment arrives, click "Mark Paid" on the invoice row.',
      "The Dashboard overview will reflect your total revenue and outstanding balance automatically.",
    ],
  },
];

function Section({
  section,
}: {
  section: (typeof sections)[number];
}) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${section.color} shrink-0`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">{section.label}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 bg-muted/20 border-t space-y-3">
          <ol className="space-y-2">
            {section.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-background border text-xs font-semibold text-foreground shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <a
            href={section.href}
            className="inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {section.linkLabel}
          </a>
        </div>
      )}
    </div>
  );
}

export default function OnboardingGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shrink-0">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">Welcome to MóC Up Solutions</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Here's how everything fits together — expand any section to learn more.
              </p>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded cursor-pointer shrink-0"
            aria-label="Dismiss guide"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Badge key={s.label} variant="outline" className="gap-1.5 bg-white">
                <Icon className="h-3 w-3" />
                {s.label.split(". ")[1]}
              </Badge>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {sections.map((s) => (
          <Section key={s.label} section={s} />
        ))}

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            You can reopen this guide from the dashboard at any time by clearing your browser's local storage.
          </p>
          <Button variant="outline" size="sm" onClick={dismiss} className="shrink-0 ml-4">
            Got it, dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
