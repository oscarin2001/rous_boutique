"use client";

import { Award, Globe } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type Skill = {
  name: string;
  level: number;
};

type LanguageItem = {
  name: string;
  code: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  certification: string;
};

type Props = {
  skills: Skill[];
  languages: LanguageItem[];
};

const cefrToProgress: Record<LanguageItem["level"], number> = {
  A1: 20,
  A2: 35,
  B1: 55,
  B2: 70,
  C1: 85,
  C2: 100,
};

function skillTone(level: number) {
  if (level >= 80) return "bg-emerald-500";
  if (level >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function levelTone(level: LanguageItem["level"]) {
  if (level >= "C1") return "bg-emerald-100 text-emerald-700";
  if (level >= "B1") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Award;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg border border-border/50 p-2">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export function SkillsLanguagesPanel({ skills, languages }: Props) {
  const sortedSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 8);
  const visibleLanguages = languages.slice(0, 8);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="min-w-0 space-y-4 rounded-2xl border border-border/50 bg-card p-5">
        <SectionHeader
          icon={Award}
          title="Habilidades"
          subtitle="Nivel estimado por habilidad (0 a 100)."
        />

        {sortedSkills.length ? (
          <div className="space-y-3">
            {sortedSkills.map((skill) => (
              <div key={skill.name} className="rounded-lg border border-border/50 p-3">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{skill.name}</p>
                  <p className="text-xs text-muted-foreground">{skill.level}%</p>
                </div>
                <Progress value={skill.level} indicatorClassName={skillTone(skill.level)} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay habilidades registradas.</p>
        )}
      </section>

      <section className="min-w-0 space-y-4 rounded-2xl border border-border/50 bg-card p-5">
        <SectionHeader
          icon={Globe}
          title="Idiomas"
          subtitle="Nivel CEFR y certificacion de cada idioma."
        />

        {visibleLanguages.length ? (
          <div className="space-y-3">
            {visibleLanguages.map((language) => (
              <div key={`${language.code}-${language.name}`} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{language.name}</p>
                  <Badge className={levelTone(language.level)}>{language.level}</Badge>
                </div>
                <p className="mt-1 break-words text-xs text-muted-foreground">{language.certification}</p>
                <div className="mt-2">
                  <Progress
                    value={cefrToProgress[language.level]}
                    indicatorClassName={skillTone(cefrToProgress[language.level])}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay idiomas registrados.</p>
        )}
      </section>
    </div>
  );
}
