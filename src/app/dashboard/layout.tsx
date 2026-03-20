import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/super-admin/dashboard/layout/navigation";
import { DashboardToolbar } from "@/components/super-admin/dashboard/layout/toolbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/super-admin");
  }

  const cookieStore = await cookies();
  const activeBranchCookie = cookieStore.get("rb-active-branch")?.value;
  const defaultBranchId = activeBranchCookie ? Number(activeBranchCookie) : null;

  const branches = await prisma.branch.findMany({
    select: { id: true, name: true, city: true },
    orderBy: { name: "asc" },
  });

  return (
    <SidebarProvider>
      <AppSidebar
        firstName={session.firstName}
        lastName={session.lastName}
        roleCode={session.roleCode}
        branches={branches}
        defaultBranchId={defaultBranchId}
      />
      <SidebarInset>
        <DashboardToolbar />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
