import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

import type {
  CompetenciesSectionErrors,
  CompetenciesSectionInput,
  PersonalSectionErrors,
  PersonalSectionInput,
  SecuritySectionErrors,
  SecuritySectionInput,
} from "../types";

const HUMAN_ENTRY_PART = "[A-Za-z\\u00C0-\\u024F][A-Za-z\\u00C0-\\u024F .'-]{1,39}";
const CERT_ENTRY_PART = "[A-Za-z\\u00C0-\\u024F][A-Za-z\\u00C0-\\u024F .'-]{1,59}";
const SKILL_ENTRY_REGEX = new RegExp(`^\\s*${HUMAN_ENTRY_PART}\\s*:\\s*(100|[1-9]?\\d)\\s*$`, "i");
const LANGUAGE_ENTRY_REGEX = new RegExp(`^\\s*${HUMAN_ENTRY_PART}\\s*:\\s*(A1|A2|B1|B2|C1|C2)\\s*:\\s*${CERT_ENTRY_PART}\\s*$`, "i");
const MAX_SKILLS_ENTRIES = 10;

function hasMinimumAge(date: Date, years: number) {
  const today = new Date();
  const limitDate = new Date(
    Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()),
  );
  return date <= limitDate;
}

export function validatePersonalInput(value: PersonalSectionInput): PersonalSectionErrors {
  const errors: PersonalSectionErrors = {};
  if (value.firstName.trim().length < 2 || value.firstName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.firstName.trim())) errors.firstName = "Nombre invalido";
  if (value.lastName.trim().length < 2 || value.lastName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.lastName.trim())) errors.lastName = "Apellido invalido";

  const birthDate = parseIsoDate(value.birthDate);
  if (!value.birthDate) errors.birthDate = "Ingresa la fecha de nacimiento";
  else if (!birthDate) errors.birthDate = "Fecha de nacimiento invalida";
  else if (birthDate > new Date()) errors.birthDate = "La fecha de nacimiento no puede ser futura";
  else if (!hasMinimumAge(birthDate, 18)) errors.birthDate = "Debe ser mayor de 18 anos";

  if (value.phone && !BOLIVIA_PHONE_REGEX.test(value.phone)) errors.phone = "Telefono invalido";
  if (!/^[A-Za-z0-9-]{5,20}$/.test(value.ci)) errors.ci = "CI invalido";
  if (value.profession && value.profession.trim().length < 3) errors.profession = "Profesion demasiado corta";
  if (value.profession && value.profession.trim().length > 80) errors.profession = "Profesion demasiado larga";
  if (value.profession && /\d/.test(value.profession)) errors.profession = "La profesion no debe incluir numeros";
  if (value.aboutMe && value.aboutMe.trim().length > 600) errors.aboutMe = "Acerca de mi demasiado largo";
  if (value.aboutMe && value.aboutMe.trim().length < 30) errors.aboutMe = "Acerca de mi debe tener al menos 30 caracteres";
  if (!value.currentPassword || value.currentPassword.length > 72) errors.currentPassword = "Ingresa tu contrasena actual";
  return errors;
}

export function validateCompetenciesInput(value: CompetenciesSectionInput): CompetenciesSectionErrors {
  const errors: CompetenciesSectionErrors = {};
  if (value.skills.length > 300) errors.skills = "Habilidades demasiado largas";
  if (value.skills) {
    const entries = value.skills.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.length > MAX_SKILLS_ENTRIES) errors.skills = `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades`;
    else if (entries.some((entry) => !SKILL_ENTRY_REGEX.test(entry))) errors.skills = "Formato invalido en habilidades";
  }
  if (value.languages.length > 500) errors.languages = "Idiomas demasiado largos";
  if (value.languages) {
    const entries = value.languages.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.some((entry) => !LANGUAGE_ENTRY_REGEX.test(entry))) errors.languages = "Formato invalido en idiomas (certificacion sin numeros)";
  }
  if (!value.currentPassword || value.currentPassword.length > 72) errors.currentPassword = "Ingresa tu contrasena actual";
  return errors;
}

export function validateSecurityInput(value: SecuritySectionInput): SecuritySectionErrors {
  const errors: SecuritySectionErrors = {};
  if (!/^[a-z0-9._@-]{3,60}$/.test(value.username)) errors.username = "Usuario invalido";

  const hasPassword = Boolean(value.newPassword);
  const hasConfirm = Boolean(value.newPasswordConfirm);
  if (hasPassword && value.newPassword.length < 8) errors.newPassword = "Minimo 8 caracteres";
  if (hasPassword && !/[A-Z]/.test(value.newPassword)) errors.newPassword = "Debe incluir mayuscula";
  if (hasPassword && !/[a-z]/.test(value.newPassword)) errors.newPassword = "Debe incluir minuscula";
  if (hasPassword && !/[0-9]/.test(value.newPassword)) errors.newPassword = "Debe incluir numero";
  if (hasPassword && !hasConfirm) errors.newPasswordConfirm = "Confirma la nueva contrasena";
  if (!hasPassword && hasConfirm) errors.newPasswordConfirm = "Ingresa primero la nueva contrasena";
  if (hasPassword && hasConfirm && value.newPassword !== value.newPasswordConfirm) errors.newPasswordConfirm = "La confirmacion no coincide";
  if (!value.currentPassword || value.currentPassword.length > 72) errors.currentPassword = "Ingresa tu contrasena actual";
  return errors;
}
