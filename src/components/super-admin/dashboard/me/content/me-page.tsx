import {
  BadgeCheck,
  Globe,
  IdCard,
  Phone,
  User,
} from "lucide-react";

import { redirect } from "next/navigation";

import { SkillsLanguagesPanel } from "@/components/super-admin/dashboard/me/content/skills-languages-panel";
import { Progress } from "@/components/ui/progress";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function parseSkills(raw: string | null | undefined) {
  if (!raw) return [] as Array<{ name: string; level: number }>;

  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [namePart, levelPart] = chunk.split(":");
      const name = namePart?.trim() || "Habilidad";
      const parsed = Number(levelPart?.trim() ?? "70");
      const level = Number.isFinite(parsed) ? Math.max(10, Math.min(100, parsed)) : 70;
      return { name, level };
    });
}

type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type LanguageRow = {
  name: string;
  code: string;
  level: LanguageLevel;
  certification: string;
};

function parseLanguages(raw: string | null | undefined, fallbackLanguageCode: string): LanguageRow[] {
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<{ name?: string; code?: string; level?: string; certification?: string }>;
      const sanitized: LanguageRow[] = parsed
        .map((item) => ({
          name: item.name?.trim() || "Idioma",
          code: item.code?.trim().toLowerCase() || "xx",
          level: ["A1", "A2", "B1", "B2", "C1", "C2"].includes(item.level ?? "") ? (item.level as LanguageLevel) : "A1",
          certification: item.certification?.trim() || "Sin certificacion",
        }))
        .filter((item) => item.code !== "xx");

      if (sanitized.length) return sanitized;
    } catch {
      // Keep fallback defaults when old data is invalid JSON.
    }
  }

  const code = (fallbackLanguageCode || "es").toLowerCase();
  const primary: LanguageRow =
    code === "en"
      ? { name: "Ingles", code: "en", level: "C1" as const, certification: "Business" }
      : code === "pt"
        ? { name: "Portugues", code: "pt", level: "C1" as const, certification: "Profesional" }
        : code === "fr"
          ? { name: "Frances", code: "fr", level: "C1" as const, certification: "Profesional" }
          : { name: "Espanol", code: "es", level: "C2" as const, certification: "Nativo" };

  return [
    primary,
    { name: "Ingles", code: "en", level: (code === "en" ? "C1" : "B2") as LanguageLevel, certification: "IELTS" as const },
  ];
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
      language: true,
      phone: true,
      birthDate: true,
      profession: true,
      photoUrl: true,
      aboutMe: true,
      skills: true,
      languages: true,
      role: { select: { code: true } },
      auth: { select: { id: true, username: true, lastLogin: true } },
      employeeSettings: {
        select: {
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
  const skills = parseSkills(employee.skills);
  const languages = parseLanguages(employee.languages, employee.language);

  return (
    <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <aside className="space-y-4 rounded-xl bg-card/70 p-4 shadow-sm ring-0">
        <div className="flex items-center gap-3">
          <div className="relative grid size-16 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground text-xl font-bold">
            {employee.photoUrl ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${employee.photoUrl})` }} />
            ) : null}
            {!employee.photoUrl ? initials : null}
          </div>
          <div>
            <h1 className="text-xl font-bold">{fullName}</h1>
            <p className="text-sm text-muted-foreground">{employee.role.code}</p>
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
          <p className="flex items-center gap-2"><BadgeCheck className="size-4 text-muted-foreground" />{employee.profession ?? "Profesion no registrada"}</p>
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
      </aside>

      <section className="space-y-4">
        <div className="rounded-xl bg-card/70 p-4 shadow-sm ring-0">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-muted px-2 py-1 font-medium">ABOUT ME</span>
            <span className="rounded-md bg-muted/70 px-2 py-1 text-muted-foreground">SEGURIDAD</span>
            <span className="rounded-md bg-muted/70 px-2 py-1 text-muted-foreground">SETTINGS</span>
          </div>
          <h2 className="text-sm font-semibold">Datos personales y preferencias</h2>
          <p className="mt-2 text-sm text-muted-foreground">{employee.aboutMe?.trim() || "Sin descripcion personal registrada."}</p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-muted-foreground">Nombre:</span> {fullName}</p>
            <p><span className="text-muted-foreground">Nacimiento:</span> {employee.birthDate ? employee.birthDate.toLocaleDateString("es-BO") : "No registrado"}</p>
            <p><span className="text-muted-foreground">Profesion:</span> {employee.profession ?? "No registrada"}</p>
            <p><span className="text-muted-foreground">Zona horaria:</span> {employee.employeeSettings?.timezone ?? "America/La_Paz"}</p>
            <p><span className="text-muted-foreground">Formato:</span> {employee.employeeSettings?.dateFormat ?? "DD/MM/YYYY"} / {employee.employeeSettings?.timeFormat ?? "24h"}</p>
            <p><span className="text-muted-foreground">Moneda:</span> {employee.employeeSettings?.currency ?? "BOB"}</p>
            <p><span className="text-muted-foreground">Notificaciones:</span> {employee.employeeSettings ? "Configuradas" : "Por defecto"}</p>
          </div>
        </div>

        <SkillsLanguagesPanel skills={skills} languages={languages} />

        <div className="rounded-xl bg-card/70 p-4 text-xs text-muted-foreground shadow-sm ring-0">
          <p className="flex items-center gap-2"><BadgeCheck className="size-4" />Seccion preparada para ampliar Sobre mi (foto, bio profesional, enlaces internos y metricas de desempeno). Foto ya persistida como URL temporal en BD.</p>
          <p className="mt-2 flex items-center gap-2"><Globe className="size-4" />URL interna sugerida para compartir perfil dentro del equipo: /dashboard/me</p>
        </div>
      </section>
    </div>
  );
}
