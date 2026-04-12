import { UserRound } from "lucide-react";

import { redirect } from "next/navigation";

import { PageHeaderCard } from "@/components/super-admin/dashboard/shared/page-header-card";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";


import { parseSkills, parseLanguages, type Language, type LanguageLevel } from "./me-parsers";
import { ProfileIdentityCard } from "./profile-identity-card";
import { ProfileInfoCard } from "./profile-info-card";
import { ProfileSummaryCard } from "./profile-summary-card";
import { SkillsLanguagesPanel } from "./skills-languages-panel";

function averageLanguageProgress(languages: Language[]) {
  const levels: Record<LanguageLevel, number> = {
    A1: 20, A2: 35, B1: 55, B2: 70, C1: 85, C2: 100,
  };
  if (!languages.length) return 0;
  const total = languages.reduce((sum: number, lang) => sum + levels[lang.level], 0);
  return Math.round(total / languages.length);
}

export async function MePage() {
  const session = await getSession();
  if (!session?.employeeId) redirect("/super-admin");

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: {
      firstName: true,
      lastName: true,
      ci: true,
      phone: true,
      role: { select: { code: true } },
      auth: { select: { username: true } },
      employeeProfile: { select: { birthDate: true, profession: true, photoUrl: true, aboutMe: true } },
      employeeSkills: { select: { name: true, level: true } },
      employeeLanguages: { select: { language: true, level: true } },
      employeeSettings: { select: { timezone: true, sessionTtlMinutes: true } },
    },
  });

  if (!employee) {
    return (
      <p className="text-sm text-muted-foreground py-12 text-center">
        No se pudo cargar el perfil del usuario.
      </p>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();

  const skills = parseSkills(employee.employeeSkills);
  const languages = parseLanguages(employee.employeeLanguages);

  const avgSkill = skills.length
    ? Math.round(skills.reduce((sum: number, skill) => sum + skill.level, 0) / skills.length)
    : 0;

  const avgLanguage = averageLanguageProgress(languages);

  return (
    <div className="w-full min-w-0 space-y-8">
      <PageHeaderCard
        icon={UserRound}
        eyebrow="Perfil"
        title="Mi perfil"
        description="Vista integral de tu información profesional con accesos directos a edición."
      />

      <div className="grid w-full min-w-0 gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Sidebar */}
        <aside className="min-w-0 space-y-6">
          <ProfileIdentityCard
            fullName={fullName}
            roleCode={employee.role.code}
            initials={initials}
            photoUrl={employee.employeeProfile?.photoUrl ?? null}
          />

          <ProfileInfoCard
            username={employee.auth.username}
            ci={employee.ci}
            phone={employee.phone}
            profession={employee.employeeProfile?.profession ?? null}
            timezone={employee.employeeSettings?.timezone ?? "America/La_Paz"}
            averageSkills={avgSkill}
            averageLanguages={avgLanguage}
            sessionMinutes={employee.employeeSettings?.sessionTtlMinutes ?? 480}
          />
        </aside>

        {/* Main Content */}
        <div className="min-w-0 space-y-6">
          <ProfileSummaryCard aboutMe={employee.employeeProfile?.aboutMe} />
          <SkillsLanguagesPanel skills={skills} languages={languages} />
        </div>
      </div>
    </div>
  );
}