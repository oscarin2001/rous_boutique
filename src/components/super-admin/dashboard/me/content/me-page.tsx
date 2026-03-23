import {
  BadgeCheck,
  IdCard,
  Phone,
  User,
} from "lucide-react";

import { redirect } from "next/navigation";

import { ProfileAvatarUploader } from "@/components/super-admin/dashboard/me/content/profile-avatar-uploader";
import { Progress } from "@/components/ui/progress";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function parseSkills(rows: { name: string; level: string | null }[]) {
  if (!rows.length) return [] as Array<{ name: string; level: number }>;

  return rows.map((item) => {
    const parsed = Number(item.level ?? "70");
    const level = Number.isFinite(parsed) ? Math.max(10, Math.min(100, parsed)) : 70;
    return { name: item.name, level };
  });
}

type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type LanguageRow = {
  name: string;
  code: string;
  level: LanguageLevel;
  certification: string;
};

function cefrToProgress(level: LanguageLevel) {
  if (level === "C2") return 100;
  if (level === "C1") return 85;
  if (level === "B2") return 70;
  if (level === "B1") return 55;
  if (level === "A2") return 35;
  return 20;
}

function parseLanguages(rows: { language: string; level: string | null }[]): LanguageRow[] {
  if (rows.length) {
    const parsed = rows.map((item) => {
      const rawLanguage = item.language.trim();
      const languageName = rawLanguage.includes("[")
        ? rawLanguage.slice(0, rawLanguage.indexOf("[")).trim()
        : rawLanguage;
      const languageCode = rawLanguage.includes("[") && rawLanguage.includes("]")
        ? rawLanguage.slice(rawLanguage.indexOf("[") + 1, rawLanguage.indexOf("]")).trim().toLowerCase()
        : languageName.slice(0, 2).toLowerCase();
      const rawLevel = (item.level ?? "A1").trim();
      const [levelPart, certificationPart] = rawLevel.includes("|")
        ? rawLevel.split("|").map((part) => part.trim())
        : [rawLevel, "Sin certificacion"];

      return {
        name: languageName || "Idioma",
        code: languageCode || "xx",
        level: ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelPart.toUpperCase())
          ? (levelPart.toUpperCase() as LanguageLevel)
          : "A1",
        certification: certificationPart || "Sin certificacion",
      };
    });

    const sanitized = parsed.filter((item) => item.code !== "xx");
    if (sanitized.length) return sanitized;
  }

  return [];
}

export async function MePage() {
  const session = await getSession();
  if (!session) redirect("/super-admin");

  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: {
      firstName: true,
      lastName: true,
      ci: true,
      phone: true,
      employeeProfile: { select: { birthDate: true, profession: true, photoUrl: true, aboutMe: true } },
      employeeSkills: { select: { name: true, level: true }, orderBy: { createdAt: "asc" } },
      employeeLanguages: { select: { language: true, level: true }, orderBy: { createdAt: "asc" } },
      role: { select: { code: true } },
      auth: { select: { id: true, username: true, lastLogin: true } },
      employeeSettings: {
        select: {
          language: true,
          timezone: true,
          dateFormat: true,
          timeFormat: true,
          currency: true,
          sessionTtlMinutes: true,
        },
      },
    },
  });

  if (!employee) return <p className="text-sm text-muted-foreground">No se pudo cargar tu perfil.</p>;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const initials = `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
  const username = employee.auth.username;
  const skills = parseSkills(employee.employeeSkills);
  const languages = parseLanguages(employee.employeeLanguages);
  const aboutMeText = employee.employeeProfile?.aboutMe?.trim() || "Sin cargar.";
  const skillsText = skills.length
    ? skills.map((item) => `${item.name} (${item.level}%)`).join(", ")
    : "Sin habilidades registradas.";
  const languagesText = languages.length
    ? languages.map((item) => `${item.name} ${item.level}`).join(", ")
    : "Sin cargar.";

  return (
    <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <aside className="space-y-4 rounded-xl bg-card/70 p-4 shadow-sm ring-0">
        <div className="flex items-center gap-3">
          <ProfileAvatarUploader initials={initials} photoUrl={employee.employeeProfile?.photoUrl ?? null} />
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{employee.role.code}</p>
            <p className="text-xs text-muted-foreground">{employee.employeeProfile?.profession ?? "Profesion no registrada"} - Idioma {(employee.employeeSettings?.language ?? "es").toUpperCase()}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Perfil ejecutivo del superadmin para control de identidad y configuracion profesional.</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-muted/40 p-2"><p className="text-lg font-semibold">{skills.length}</p><p className="text-muted-foreground">Habilidades</p></div>
          <div className="rounded-lg bg-muted/40 p-2"><p className="text-lg font-semibold">{employee.employeeSettings ? "OK" : "Base"}</p><p className="text-muted-foreground">Preferencias</p></div>
          <div className="rounded-lg bg-muted/40 p-2"><p className="text-lg font-semibold">{employee.employeeSettings?.sessionTtlMinutes ?? 480}</p><p className="text-muted-foreground">TTL min</p></div>
        </div>
        <div className="space-y-2 rounded-lg bg-muted/40 p-3 text-sm">
          <p className="flex items-center gap-2"><User className="size-4 text-muted-foreground" />@{username}</p>
          <p className="flex items-center gap-2"><IdCard className="size-4 text-muted-foreground" />CI {employee.ci}</p>
          <p className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" />{employee.phone ?? "Sin telefono"}</p>
          <p className="flex items-center gap-2"><BadgeCheck className="size-4 text-muted-foreground" />{employee.employeeProfile?.profession ?? "Profesion no registrada"}</p>
        </div>
        <div className="space-y-2 rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Habilidades</p>
          {skills.length ? skills.map((skill) => (
            <div key={skill.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{skill.name}</span>
                <span className="text-muted-foreground">{skill.level}%</span>
              </div>
              <Progress value={skill.level} />
            </div>
          )) : <p className="text-xs text-muted-foreground">Sin habilidades registradas.</p>}
        </div>
        <div className="space-y-2 rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Idiomas</p>
          {languages.length ? languages.map((item) => (
            <div key={`${item.code}-${item.level}`}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.level}</span>
              </div>
              <Progress value={cefrToProgress(item.level)} />
            </div>
          )) : <p className="text-xs text-muted-foreground">Sin idiomas registrados.</p>}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-xl bg-card/70 p-4 shadow-sm ring-0">
          <h2 className="text-sm font-semibold">Datos personales y preferencias</h2>
          <div className="mt-3 rounded-lg bg-muted/40 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Acerca de mi</h3>
            <p className="mt-2 text-sm text-muted-foreground">{aboutMeText}</p>
          </div>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Nombre:</span> {fullName}</p>
            <p><span className="text-muted-foreground">Nacimiento:</span> {employee.employeeProfile?.birthDate ? employee.employeeProfile.birthDate.toLocaleDateString("es-BO") : "No registrado"}</p>
            <p><span className="text-muted-foreground">Profesion:</span> {employee.employeeProfile?.profession ?? "No registrada"}</p>
            <p><span className="text-muted-foreground">Zona horaria:</span> {employee.employeeSettings?.timezone ?? "America/La_Paz"}</p>
            <p><span className="text-muted-foreground">Formato:</span> {employee.employeeSettings?.dateFormat ?? "DD/MM/YYYY"} / {employee.employeeSettings?.timeFormat ?? "24h"}</p>
            <p><span className="text-muted-foreground">Moneda:</span> {employee.employeeSettings?.currency ?? "BOB"}</p>
            <p><span className="text-muted-foreground">Notificaciones:</span> {employee.employeeSettings ? "Configuradas" : "Por defecto"}</p>
          </div>
          <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
            <p><span className="font-medium">Perfil profesional:</span> {employee.employeeProfile?.profession ?? "No registrado"}. {employee.employeeProfile?.aboutMe?.trim() || "Completa tu descripcion en User Settings para un perfil mas completo."}</p>
            <p className="mt-2"><span className="font-medium">Idiomas:</span> {languagesText}</p>
            <p className="mt-2"><span className="font-medium">Habilidades clave:</span> {skillsText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
