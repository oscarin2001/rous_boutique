"use client";

import { useMemo, useState } from "react";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { updateSuperAdminCompetenciesAction } from "@/actions/super-admin/me/competencies.actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Skill = {
  name: string;
  level: number;
};

type Props = {
  skills: Skill[];
  languages: LanguageItem[];
};

const skillChartConfig = {
  level: {
    label: "Nivel",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type LanguageItem = {
  name: string;
  code: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  certification: string;
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

function languageTone(level: LanguageItem["level"]) {
  if (level === "C1" || level === "C2") return "bg-emerald-100 text-emerald-700";
  if (level === "B1" || level === "B2") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

export function SkillsLanguagesPanel({ skills, languages }: Props) {
  const [editableSkills, setEditableSkills] = useState(skills);
  const [editableLanguages, setEditableLanguages] = useState(languages);
  const [isSaving, setIsSaving] = useState(false);

  const chartData = editableSkills.slice(0, 6).map((item) => ({
    skill: item.name,
    level: item.level,
  }));

  const topBadges = editableSkills.slice(0, 6);
  const payloadFingerprint = JSON.stringify({ skills: editableSkills, languages: editableLanguages });
  const initialFingerprint = useMemo(() => JSON.stringify({ skills, languages }), [skills, languages]);
  const hasChanges = payloadFingerprint !== initialFingerprint;

  const saveCompetencies = async () => {
    if (!hasChanges || isSaving) return;
    setIsSaving(true);
    const result = await updateSuperAdminCompetenciesAction({
      skills: editableSkills,
      languages: editableLanguages,
    });
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.error ?? "No se pudieron guardar los cambios");
      return;
    }

    toast.success("Skills e idiomas guardados");
  };

  return (
    <Card className="bg-card/70 shadow-sm ring-0">
      <CardHeader>
        <CardTitle>Skills e idiomas</CardTitle>
        <CardDescription>Vista ejecutiva sin bordes duros para evaluar capacidades del perfil.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="skills" className="gap-4">
          <TabsList variant="line" className="w-full justify-start p-0">
            <TabsTrigger value="skills" className="data-active:bg-transparent">Habilidades</TabsTrigger>
            <TabsTrigger value="languages" className="data-active:bg-transparent">Idiomas</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {topBadges.length ? topBadges.map((skill) => (
                <Badge key={`badge-${skill.name}`} variant="secondary">{skill.name}</Badge>
              )) : <p className="text-xs text-muted-foreground">Sin habilidades registradas.</p>}
            </div>

            <div className="space-y-2">
              {editableSkills.length ? editableSkills.map((skill) => (
                <div key={`progress-${skill.name}`} className="rounded-lg bg-muted/40 p-3">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>{skill.name}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="bg-muted" indicatorClassName={skillTone(skill.level)} />
                  <div className="mt-2">
                    <Select
                      value={String(skill.level)}
                      onValueChange={(next) => {
                        const parsed = Math.max(0, Math.min(100, Number(next) || 0));
                        setEditableSkills((prev) => prev.map((item) => (
                          item.name === skill.name ? { ...item, level: parsed } : item
                        )));
                      }}
                    >
                      <SelectTrigger className="h-7 border-0 bg-muted/70 ring-0 focus-visible:ring-0" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20%</SelectItem>
                        <SelectItem value="40">40%</SelectItem>
                        <SelectItem value="60">60%</SelectItem>
                        <SelectItem value="80">80%</SelectItem>
                        <SelectItem value="100">100%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )) : null}
            </div>

            {chartData.length ? (
              <ChartContainer config={skillChartConfig} className="h-64 w-full">
                <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="skill" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={26} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="level" radius={8} fill="var(--color-level)" />
                </BarChart>
              </ChartContainer>
            ) : null}
          </TabsContent>

          <TabsContent value="languages" className="space-y-4">
            <Table className="[&_tr]:border-0">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Idioma</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Progreso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableLanguages.map((item) => (
                  <TableRow key={item.code} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Select
                        value={item.level}
                        onValueChange={(next) => {
                          setEditableLanguages((prev) => prev.map((lang) => (
                            lang.code === item.code ? { ...lang, level: next as LanguageItem["level"] } : lang
                          )));
                        }}
                      >
                        <SelectTrigger className="h-8 border-0 bg-muted/60 ring-0 focus-visible:ring-0" size="sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A1">A1</SelectItem>
                          <SelectItem value="A2">A2</SelectItem>
                          <SelectItem value="B1">B1</SelectItem>
                          <SelectItem value="B2">B2</SelectItem>
                          <SelectItem value="C1">C1</SelectItem>
                          <SelectItem value="C2">C2</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge className={languageTone(item.level)}>{item.certification}</Badge></TableCell>
                    <TableCell>
                      <div className="min-w-36">
                        <Progress value={cefrToProgress[item.level]} className="bg-muted" indicatorClassName={skillTone(cefrToProgress[item.level])} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={saveCompetencies} disabled={!hasChanges || isSaving}>
            {isSaving ? "Guardando..." : "Guardar skills e idiomas"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}