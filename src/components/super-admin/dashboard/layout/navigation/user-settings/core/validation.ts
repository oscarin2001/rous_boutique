import { BOLIVIA_PHONE_REGEX } from "@/lib/bolivia";
import { HUMAN_NAME_REGEX, parseIsoDate } from "@/lib/field-validation";

import type { CreateAccountFieldErrors, CreateSuperAdminForm, ProfileFieldErrors, ProfileForm } from "./types";

function hasMinimumAge(date: Date, years: number): boolean {
  const today = new Date();
  const limitDate = new Date(Date.UTC(today.getUTCFullYear() - years, today.getUTCMonth(), today.getUTCDate()));
  return date <= limitDate;
}

export function validateProfile(value: ProfileForm): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  if (value.firstName.trim().length < 2 || value.firstName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.firstName.trim())) errors.firstName = "Nombre invalido";
  if (value.lastName.trim().length < 2 || value.lastName.trim().length > 30 || !HUMAN_NAME_REGEX.test(value.lastName.trim())) errors.lastName = "Apellido invalido";
  if (!value.birthDate) errors.birthDate = "Ingresa la fecha de nacimiento";
  const birthDate = value.birthDate ? parseIsoDate(value.birthDate) : null;
  if (value.birthDate && !birthDate) errors.birthDate = "Fecha de nacimiento invalida";
  if (birthDate && !hasMinimumAge(birthDate, 18)) errors.birthDate = "Debe ser mayor de 18 anos";
  if (value.phone && !BOLIVIA_PHONE_REGEX.test(value.phone)) errors.phone = "Telefono invalido";
  if (!/^[A-Za-z0-9-]{5,20}$/.test(value.ci)) errors.ci = "CI invalido";
  if (value.profession && value.profession.trim().length > 80) errors.profession = "Profesion demasiado larga";
  if (value.photoUrl && value.photoUrl.trim().length > 300) errors.photoUrl = "URL de foto demasiado larga";
  if (value.photoUrl && !/^https?:\/\//i.test(value.photoUrl.trim()) && !value.photoUrl.trim().startsWith("/")) errors.photoUrl = "URL de foto invalida";
  if (value.aboutMe && value.aboutMe.trim().length > 600) errors.aboutMe = "Sobre mi demasiado largo";
  if (value.skills && value.skills.trim().length > 300) errors.skills = "Habilidades demasiado largas";

  if (!/^[a-z0-9._@-]{3,60}$/.test(value.username)) errors.username = "Usuario invalido";
  if (value.newPassword && value.newPassword.length < 8) errors.newPassword = "Minimo 8 caracteres";
  if (value.newPassword && !/[A-Z]/.test(value.newPassword)) errors.newPassword = "Debe incluir mayuscula";
  if (value.newPassword && !/[a-z]/.test(value.newPassword)) errors.newPassword = "Debe incluir minuscula";
  if (value.newPassword && !/[0-9]/.test(value.newPassword)) errors.newPassword = "Debe incluir numero";
  if (value.newPassword && !value.newPasswordConfirm) errors.newPasswordConfirm = "Confirma la nueva contrasena";
  if (!value.newPassword && value.newPasswordConfirm) errors.newPasswordConfirm = "Ingresa primero la nueva contrasena";
  if (value.newPassword && value.newPasswordConfirm && value.newPassword !== value.newPasswordConfirm) errors.newPasswordConfirm = "La confirmacion no coincide";
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
