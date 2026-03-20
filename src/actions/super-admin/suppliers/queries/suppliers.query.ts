"use server";

import { prisma } from "@/lib/prisma";

import type {
  SupplierBranchOption,
  SupplierManagerOption,
  SupplierMetrics,
  SupplierRow,
} from "../types/supplier";

async function getSupplierAuditNames(supplierIds: number[]) {
  const map = new Map<number, { createdByName: string | null; updatedByName: string | null }>();
  if (supplierIds.length === 0) return map;

  const logs = await prisma.auditLog.findMany({
    where: {
      entity: "Supplier",
      entityId: { in: supplierIds },
      action: { in: ["CREATE", "UPDATE"] },
    },
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  for (const log of logs) {
    const current = map.get(log.entityId) ?? { createdByName: null, updatedByName: null };
    const actorName = log.employee ? `${log.employee.firstName} ${log.employee.lastName}` : null;

    if (log.action === "UPDATE" && current.updatedByName === null) {
      current.updatedByName = actorName;
    }

    if (log.action === "CREATE" && current.createdByName === null) {
      current.createdByName = actorName;
    }

    map.set(log.entityId, current);
  }

  return map;
}

export async function getSuppliers(): Promise<SupplierRow[]> {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { deletedAt: null },
      include: {
        branches: { include: { branch: true } },
        managers: { include: { employee: true } },
        _count: { select: { purchases: true } },
        purchases: { select: { totalAmount: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const auditMap = await getSupplierAuditNames(suppliers.map((supplier) => supplier.id));

    return suppliers.map((s) => ({
      ...(auditMap.get(s.id) ?? { createdByName: null, updatedByName: null }),
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      fullName: `${s.firstName} ${s.lastName}`,
      phone: s.phone,
      email: s.email,
      address: s.address,
      city: s.city,
      department: s.department,
      country: s.country,
      ci: s.ci,
      notes: s.notes,
      birthDate: s.birthDate?.toISOString().slice(0, 10) ?? null,
      partnerSince: s.partnerSince?.toISOString().slice(0, 10) ?? null,
      contractEndAt: s.contractEndAt?.toISOString().slice(0, 10) ?? null,
      isIndefinite: s.isIndefinite,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString() ?? null,
      branches: s.branches.map((b) => ({ id: b.branch.id, name: b.branch.name, city: b.branch.city })),
      managers: s.managers.map((m) => ({ id: m.employee.id, fullName: `${m.employee.firstName} ${m.employee.lastName}` })),
      purchaseCount: s._count.purchases,
      totalPurchaseAmount: s.purchases.reduce((acc, p) => acc + Number(p.totalAmount), 0),
    }));
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export async function getSupplierOptions(): Promise<{
  branches: SupplierBranchOption[];
  managers: SupplierManagerOption[];
}> {
  try {
    const [branches, employees] = await Promise.all([
      prisma.branch.findMany({ select: { id: true, name: true, city: true } }),
      prisma.employee.findMany({
        where: { deletedAt: null, status: "ACTIVE" },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
      }),
    ]);

    return {
      branches: branches.map((b) => ({ id: b.id, name: b.name, city: b.city })),
      managers: employees.map((e) => ({ id: e.id, fullName: `${e.firstName} ${e.lastName}` })),
    };
  } catch (error) {
    console.error("Error fetching supplier options:", error);
    return { branches: [], managers: [] };
  }
}

export async function getSupplierMetrics(): Promise<SupplierMetrics> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [total, active, newThisMonth, totalPurchases] = await Promise.all([
      prisma.supplier.count({ where: { deletedAt: null } }),
      prisma.supplier.count({ where: { deletedAt: null, isActive: true } }),
      prisma.supplier.count({ where: { deletedAt: null, createdAt: { gte: startOfMonth } } }),
      prisma.purchase.count(),
    ]);

    return { totalSuppliers: total, activeSuppliers: active, newThisMonth, totalPurchases };
  } catch (error) {
    console.error("Error fetching supplier metrics:", error);
    return { totalSuppliers: 0, activeSuppliers: 0, newThisMonth: 0, totalPurchases: 0 };
  }
}
