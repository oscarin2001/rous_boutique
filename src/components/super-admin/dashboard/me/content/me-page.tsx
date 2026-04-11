import { UserRound } from "lucide-react";

import { redirect } from "next/navigation";

import { type Language, parseLanguages, parseSkills } from "@/components/super-admin/dashboard/me/content/me-parsers";
import { ProfileIdentityCard } from "@/components/super-admin/dashboard/me/content/profile-identity-card";
import { ProfileInfoCard } from "@/components/super-admin/dashboard/me/content/profile-info-card";
import { ProfileSummaryCard } from "@/components/super-admin/dashboard/me/content/profile-summary-card";
import { SkillsLanguagesPanel } from "@/components/super-admin/dashboard/me/content/skills-languages-panel";
import { PageHeaderCard } from "@/components/super-admin/dashboard/shared/page-header-card";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function averageLanguageProgress(languages: Language[]) {
  const levels: Record<Language["level"], number> = {
    A1: 20,
    A2: 35,
    B1: 55,
    B2: 70,
    C1: 85,
    C2: 100,
  };
  if (!languages.length) return 0;
  const total = languages.reduce((sum, language) => sum + levels[language.level], 0);
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
    return <p className="text-sm text-muted-foreground">No se pudo cargar el perfil del usuario.</p>;
  }

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const initials = `${employee.firstName[0] ?? ""}${employee.lastName[0] ?? ""}`.toUpperCase();
  const skills = parseSkills(employee.employeeSkills);
  const languages = parseLanguages(employee.employeeLanguages);
  const avgSkill = skills.length ? Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length) : 0;
  const avgLanguage = averageLanguageProgress(languages);

  return (
    <div className="space-y-6">
      <PageHeaderCard
        icon={UserRound}
        eyebrow="Perfil"
        title="Mi perfil"
        description="Vista integral del perfil profesional y accesos rapidos de edicion por seccion."
      />

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="min-w-0 space-y-4">
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
            timezone={employee.employeeSettings?.timezone ?? null}
            averageSkills={avgSkill}
            averageLanguages={avgLanguage}
            sessionMinutes={employee.employeeSettings?.sessionTtlMinutes ?? 480}
          />
        </aside>

        <section className="min-w-0 space-y-4">
          <ProfileSummaryCard aboutMe={employee.employeeProfile?.aboutMe} />
          <SkillsLanguagesPanel skills={skills} languages={languages} />
        </section>
      </section>
    </div>
  );
}
