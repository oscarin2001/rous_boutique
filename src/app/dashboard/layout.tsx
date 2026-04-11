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

  const sidebarProfile = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: {
      firstName: true,
      lastName: true,
      role: { select: { code: true } },
      employeeProfile: { select: { photoUrl: true } },
    },
  });

  return (
    <SidebarProvider>
      <AppSidebar
        firstName={sidebarProfile?.firstName ?? session.firstName}
        lastName={sidebarProfile?.lastName ?? session.lastName}
        roleCode={sidebarProfile?.role.code ?? session.roleCode}
        photoUrl={sidebarProfile?.employeeProfile?.photoUrl ?? null}
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
