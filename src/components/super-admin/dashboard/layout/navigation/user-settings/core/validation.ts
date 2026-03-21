import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

import type { CreateAccountFieldErrors, CreateSuperAdminForm, ProfileFieldErrors, ProfileForm } from "./types";

const SKILL_ENTRY_REGEX = /^\s*[^:,]{2,40}\s*:\s*(100|[1-9]?\d)\s*$/;
const LANGUAGE_ENTRY_REGEX = /^\s*[^:,]{2,40}\s*:\s*(A1|A2|B1|B2|C1|C2)\s*:\s*[^:,]{2,60}\s*$/i;
const MAX_SKILLS_ENTRIES = 10;

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

export function validateProfile(value: ProfileForm, baseline?: ProfileForm): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const hasChanged = <K extends keyof ProfileForm>(key: K) => !baseline || value[key] !== baseline[key];

  if (hasChanged("firstName") && (value.firstName.trim().length < 2 || value.firstName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.firstName.trim()))) errors.firstName = "Nombre invalido";
  if (hasChanged("lastName") && (value.lastName.trim().length < 2 || value.lastName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.lastName.trim()))) errors.lastName = "Apellido invalido";

  if (hasChanged("birthDate")) {
    if (!value.birthDate) errors.birthDate = "Ingresa la fecha de nacimiento";
    const birthDate = value.birthDate ? parseIsoDate(value.birthDate) : null;
    if (value.birthDate && !birthDate) errors.birthDate = "Fecha de nacimiento invalida";
    if (birthDate && !hasMinimumAge(birthDate, 18)) errors.birthDate = "Debe ser mayor de 18 anos";
  }

  if (hasChanged("phone") && value.phone && !BOLIVIA_PHONE_REGEX.test(value.phone)) errors.phone = "Telefono invalido";
  if (hasChanged("ci") && !/^[A-Za-z0-9-]{5,20}$/.test(value.ci)) errors.ci = "CI invalido";
  if (hasChanged("profession") && value.profession && value.profession.trim().length > 80) errors.profession = "Profesion demasiado larga";
  if (hasChanged("profession") && value.profession && value.profession.trim().length < 3) errors.profession = "Profesion demasiado corta";
  if (hasChanged("profession") && value.profession && /\s{2,}/.test(value.profession.trim())) errors.profession = "Evita espacios dobles en profesion";
  if (hasChanged("photoUrl") && value.photoUrl && value.photoUrl.trim().length > 300) errors.photoUrl = "URL de foto demasiado larga";
  if (hasChanged("photoUrl") && value.photoUrl && !/^https?:\/\//i.test(value.photoUrl.trim()) && !value.photoUrl.trim().startsWith("/")) errors.photoUrl = "URL de foto invalida";
  if (hasChanged("aboutMe") && value.aboutMe && value.aboutMe.trim().length > 600) errors.aboutMe = "Acerca de mi demasiado largo";
  if (hasChanged("aboutMe") && value.aboutMe && value.aboutMe.trim().length < 30) errors.aboutMe = "Acerca de mi debe tener al menos 30 caracteres";
  if (hasChanged("skills") && value.skills && value.skills.trim().length > 300) errors.skills = "Habilidades demasiado largas";
  if (hasChanged("skills") && value.skills) {
    const entries = value.skills.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.length > MAX_SKILLS_ENTRIES) errors.skills = `Puedes registrar maximo ${MAX_SKILLS_ENTRIES} habilidades`;
    if (entries.some((entry) => !SKILL_ENTRY_REGEX.test(entry))) errors.skills = "Formato de habilidades invalido. Usa Nombre:80, Ventas:95";
  }
  if (hasChanged("languages") && value.languages && value.languages.trim().length > 500) errors.languages = "Idiomas demasiado largos";
  if (hasChanged("languages") && value.languages) {
    const entries = value.languages.split(",").map((item) => item.trim()).filter(Boolean);
    if (entries.some((entry) => !LANGUAGE_ENTRY_REGEX.test(entry))) errors.languages = "Formato de idiomas invalido. Usa Espanol:C2:Nativo, Ingles:B2:IELTS";
  }

  const credentialsTouched = hasChanged("username") || Boolean(value.newPassword) || Boolean(value.newPasswordConfirm);
  if (credentialsTouched && !/^[a-z0-9._@-]{3,60}$/.test(value.username)) errors.username = "Usuario invalido";
  if (credentialsTouched && value.newPassword && value.newPassword.length < 8) errors.newPassword = "Minimo 8 caracteres";
  if (credentialsTouched && value.newPassword && !/[A-Z]/.test(value.newPassword)) errors.newPassword = "Debe incluir mayuscula";
  if (credentialsTouched && value.newPassword && !/[a-z]/.test(value.newPassword)) errors.newPassword = "Debe incluir minuscula";
  if (credentialsTouched && value.newPassword && !/[0-9]/.test(value.newPassword)) errors.newPassword = "Debe incluir numero";
  if (credentialsTouched && value.newPassword && !value.newPasswordConfirm) errors.newPasswordConfirm = "Confirma la nueva contrasena";
  if (credentialsTouched && !value.newPassword && value.newPasswordConfirm) errors.newPasswordConfirm = "Ingresa primero la nueva contrasena";
  if (credentialsTouched && value.newPassword && value.newPasswordConfirm && value.newPassword !== value.newPasswordConfirm) errors.newPasswordConfirm = "La confirmacion no coincide";
  return errors;
}

export function validateCreateAccount(value: CreateSuperAdminForm): CreateAccountFieldErrors {
  const errors: CreateAccountFieldErrors = {};
  if (value.firstName.trim().length < 2 || value.firstName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.firstName.trim())) errors.firstName = "Nombre invalido";
  if (value.lastName.trim().length < 2 || value.lastName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.lastName.trim())) errors.lastName = "Apellido invalido";
  const birthDate = parseIsoDate(value.birthDate);
  if (!birthDate || !hasMinimumAge(birthDate, 18)) errors.birthDate = "Debe ser mayor de 18 anos";
  if (!/^[A-Za-z0-9-]{5,20}$/.test(value.ci)) errors.ci = "CI invalido";
  if (value.phone && !BOLIVIA_PHONE_REGEX.test(value.phone)) errors.phone = "Telefono invalido";
  if (!/^[a-z0-9._@-]{3,60}$/.test(value.username)) errors.username = "Usuario invalido";
  if (value.password.length < 8 || !/[A-Z]/.test(value.password) || !/[a-z]/.test(value.password) || !/[0-9]/.test(value.password)) errors.password = "Contrasena debil";
  if (value.password !== value.passwordConfirm) errors.passwordConfirm = "La confirmacion no coincide";
  return errors;
}
