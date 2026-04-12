"use client";

import { Award, Globe, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Skill = { name: string; level: number };
type Language = {
  name: string;
  code: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  certification: string;
};

const cefrToProgress: Record<string, number> = {
  A1: 20, A2: 35, B1: 55, B2: 70, C1: 85, C2: 100,
};

function getSkillColor(level: number) {
  if (level >= 85) return "bg-emerald-500";
  if (level >= 65) return "bg-amber-500";
  return "bg-rose-500";
}

function getLevelBadge(level: string) {
  if (level >= "C1") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
  if (level >= "B1") return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
  return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400";
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-2xl border border-border/70 p-3 bg-card">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

type Props = { skills: Skill[]; languages: Language[] };

export function SkillsLanguagesPanel({ skills, languages }: Props) {
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const visibleLanguages = languages;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Habilidades */}
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
        <SectionHeader
          icon={Award}
          title="Habilidades técnicas"
          subtitle="Nivel estimado (0–100)"
        />

        {sortedSkills.length > 0 ? (
          <div className="mt-8 space-y-6">
            {sortedSkills.map((skill) => (
              <div key={skill.name} className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.name}</span>
                  <span className="tabular-nums text-muted-foreground">{skill.level}%</span>
                </div>
                <Progress
                  value={skill.level}
                  className="h-1.5"
                  indicatorClassName={getSkillColor(skill.level)}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">No hay habilidades registradas aún.</p>
        )}
      </div>

      {/* Idiomas */}
      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
        <SectionHeader
          icon={Globe}
          title="Idiomas"
          subtitle="Nivel CEFR y certificación"
        />

        {visibleLanguages.length > 0 ? (
          <div className="mt-8 space-y-6">
            {visibleLanguages.map((lang, index) => (
              <div key={`${lang.code}-${lang.name}-${index}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lang.name}</span>
                  <Badge variant="secondary" className={getLevelBadge(lang.level)}>
                    {lang.level}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{lang.certification}</p>

                <Progress
                  value={cefrToProgress[lang.level]}
                  className="h-1.5"
                  indicatorClassName={getSkillColor(cefrToProgress[lang.level])}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">No hay idiomas registrados aún.</p>
        )}
      </div>
    </div>
  );
}