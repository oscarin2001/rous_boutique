"use server";

import { ensureSuperAdminSession } from "@/actions/super-admin/user-settings/services/common";

import { prisma } from "@/lib/prisma";

type InputSkill = {
  name: string;
  level: number;
};

type InputLanguage = {
  name: string;
  code: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  certification: string;
};

type UpdateCompetenciesInput = {
  skills: InputSkill[];
  languages: InputLanguage[];
};

const ALLOWED_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

function normalizeSkills(skills: InputSkill[]) {
  return skills
    .map((item) => {
      const name = item.name.trim().slice(0, 40);
      if (!name) return null;
      const safeLevel = Math.max(0, Math.min(100, Number(item.level) || 0));
      return { name, level: safeLevel };
    })
    .filter(Boolean) as InputSkill[];
}

function normalizeLanguages(languages: InputLanguage[]) {
  return languages
    .map((item) => {
      const code = item.code.trim().toLowerCase().slice(0, 8);
      const name = item.name.trim().slice(0, 40);
      const certification = item.certification.trim().slice(0, 60);
      const level = ALLOWED_LEVELS.has(item.level) ? item.level : "A1";
      if (!code || !name) return null;
      return { code, name, level, certification };
    })
    .filter(Boolean) as InputLanguage[];
}

export async function updateSuperAdminCompetenciesAction(input: UpdateCompetenciesInput) {
  const session = await ensureSuperAdminSession();
  if (!session) return { success: false, error: "No autorizado" };

  const normalizedSkills = normalizeSkills(input.skills ?? []);
  const normalizedLanguages = normalizeLanguages(input.languages ?? []);

  const existing = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: {
      id: true,
      employeeSkills: { select: { name: true, level: true } },
      employeeLanguages: { select: { language: true, level: true } },
    },
  });

  if (!existing) return { success: false, error: "Perfil no encontrado" };

  await prisma.$transaction(async (tx) => {
    await tx.employeeSkill.deleteMany({ where: { employeeId: existing.id } });
    await tx.employeeLanguage.deleteMany({ where: { employeeId: existing.id } });

    if (normalizedSkills.length > 0) {
      await tx.employeeSkill.createMany({
        data: normalizedSkills.map((item) => ({
          employeeId: existing.id,
          name: item.name,
          level: String(item.level),
        })),
      });
    }

    if (normalizedLanguages.length > 0) {
      await tx.employeeLanguage.createMany({
        data: normalizedLanguages.map((item) => ({
          employeeId: existing.id,
          language: `${item.name} [${item.code}]`,
          level: item.certification ? `${item.level} | ${item.certification}` : item.level,
        })),
      });
    }

    await tx.auditLog.create({
      data: {
        entity: "SuperAdminCompetencies",
        entityId: existing.id,
        action: "UPDATE",
        employeeId: existing.id,
        oldValue: JSON.stringify({
          skills: existing.employeeSkills,
          languages: existing.employeeLanguages,
        }),
        newValue: JSON.stringify({
          skills: normalizedSkills,
          languages: normalizedLanguages,
        }),
      },
    });
  });

  return { success: true };
}
