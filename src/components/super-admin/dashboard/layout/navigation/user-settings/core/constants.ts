import { Monitor, Moon, Sun } from "lucide-react";

export const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

export const timezoneOptions = [
  { value: "America/La_Paz", label: "Bolivia (America/La_Paz)" },
  { value: "America/Lima", label: "Peru (America/Lima)" },
  { value: "America/Santiago", label: "Chile (America/Santiago)" },
  { value: "UTC", label: "UTC" },
] as const;

export const sessionTtlOptions = [
  { value: 60, label: "1 hora" },
  { value: 240, label: "4 horas" },
  { value: 480, label: "8 horas" },
  { value: 720, label: "12 horas" },
  { value: 1440, label: "24 horas" },
] as const;
