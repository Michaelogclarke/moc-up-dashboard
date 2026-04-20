
import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { TrendingUp, FolderKanban, FileText, CheckSquare } from "lucide-react";
import OnboardingGuide from "@/components/dashboard/OnboardingGuide";

const getDashboardData = unstable_cache(async () => {
  const [
    totalRevenue,
    outstanding,
    activeProjects,
    overdueInvoices,
    recentProjects,
    upcomingTasks,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["SENT", "OVERDUE"] } },
      _sum: { amount: true },
    }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.project.findMany({
      where: { status: { in: ["ACTIVE", "PROPOSAL"] } },
      include: { client: true, tasks: true, invoices: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { status: { not: "DONE" }, dueDate: { not: null } },
      include: { project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  return {
    totalRevenue: totalRevenue._sum.amount ?? 0,
    outstanding: outstanding._sum.amount ?? 0,
    activeProjects,
    overdueInvoices,
    recentProjects,
    upcomingTasks,
  };
}, ["dashboard-data"], { tags: ["dashboard"] });

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl">
      <OnboardingGuide />

      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground mt-1">Welcome back, Michael.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          accent="emerald"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Outstanding"
          value={formatCurrency(data.outstanding)}
          accent={data.outstanding > 0 ? "amber" : "slate"}
          highlight={data.outstanding > 0}
        />
        <StatCard
          icon={<FolderKanban className="h-5 w-5" />}
          label="Active Projects"
          value={String(data.activeProjects)}
          accent="indigo"
        />
        <StatCard
          icon={<CheckSquare className="h-5 w-5" />}
          label="Overdue Invoices"
          value={String(data.overdueInvoices)}
          accent={data.overdueInvoices > 0 ? "red" : "slate"}
          highlight={data.overdueInvoices > 0}
        />
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* Active Projects */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentProjects.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No active projects.</p>
            )}
            {data.recentProjects.map((p) => {
              const paid = p.invoices
                .filter((i) => i.status === "PAID")
                .reduce((s, i) => s + i.amount, 0);
              const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
              const totalTasks = p.tasks.length;

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors duration-150 cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.client.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className={getStatusColor(p.status)}>
                      {p.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(paid)} · {doneTasks}/{totalTasks} tasks
                    </p>
                  </div>
                </Link>
              );
            })}
            <Link
              href="/projects"
              className="block text-center text-xs text-muted-foreground hover:text-indigo-600 pt-2 transition-colors"
            >
              View all projects →
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.upcomingTasks.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming tasks.</p>
            )}
            {data.upcomingTasks.map((t) => {
              const isOverdue = t.dueDate && t.dueDate < new Date();
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.project.name}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isOverdue
                        ? "text-red-600 border-red-200 bg-red-50"
                        : "text-slate-600 border-slate-200"
                    }
                  >
                    {t.dueDate ? t.dueDate.toLocaleDateString("en-GB") : "No date"}
                  </Badge>
                </div>
              );
            })}
            <Link
              href="/tasks"
              className="block text-center text-xs text-muted-foreground hover:text-indigo-600 pt-2 transition-colors"
            >
              View all tasks →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const accentClasses: Record<string, { bg: string; icon: string }> = {
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600"   },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600"  },
  red:     { bg: "bg-red-50",     icon: "text-red-600"     },
  slate:   { bg: "bg-slate-100",  icon: "text-slate-500"   },
};

function StatCard({
  icon,
  label,
  value,
  highlight,
  accent = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  accent?: keyof typeof accentClasses;
}) {
  const { bg, icon: iconColor } = accentClasses[accent] ?? accentClasses.slate;
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-5 pb-5">
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} ${iconColor} mb-3`}>
          {icon}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
          {label}
        </p>
        <p className={`text-2xl font-bold tracking-tight ${highlight ? "text-destructive" : "text-foreground"}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
