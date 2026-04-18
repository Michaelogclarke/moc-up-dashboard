export const dynamic = 'force-dynamic';

import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-slate-50 pt-14 p-4 lg:pt-8 lg:p-8">
        {children}
      </main>
    </div>
  );
}
