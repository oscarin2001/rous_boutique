export type Skill = { name: string; level: number };
export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Language = {
  name: string;
  code: string;
  level: LanguageLevel;
  certification: string;
};

export function parseSkills(rows: { name: string; level: string | null }[]): Skill[] {
  return rows.map((item) => {
    const parsed = Number(item.level ?? "70");
    const level = Number.isFinite(parsed) ? Math.max(10, Math.min(100, parsed)) : 70;
    return { name: item.name.trim(), level };
  });
}

export function parseLanguages(rows: { language: string; level: string | null }[]): Language[] {
  return rows
    .map((item) => {
      const raw = item.language.trim();
      const name = raw.includes("[") ? raw.slice(0, raw.indexOf("[")).trim() : raw;
      const code = raw.includes("[")
        ? raw.slice(raw.indexOf("[") + 1, raw.indexOf("]")).toLowerCase()
        : name.slice(0, 2).toLowerCase();

      const [levelPart = "A1", certPart = ""] = (item.level ?? "A1")
        .split("|")
        .map((value) => value.trim());

      const level: LanguageLevel = ["A1", "A2", "B1", "B2", "C1", "C2"].includes(levelPart)
        ? (levelPart as LanguageLevel)
        : "A1";

      return {
        name: name || "Idioma",
        code: code || "xx",
        level,
        certification: certPart || "Sin certificacion",
      };
    })
    .filter((item) => item.code !== "xx");
}
