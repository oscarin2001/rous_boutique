export function truncateInput(value: string, max: number): string {
  return value.slice(0, max);
}

export function sanitizeHumanNameInput(value: string): string {
  return value
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ '\-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 30);
}

export function sanitizeProfessionInput(value: string): string {
  return value
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ .'/\-]/g, "")
    .replace(/\s{2,}/g, " ")
    .slice(0, 80);
}

export function sanitizePhoneInput(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  const withoutCountryCode = digitsOnly.startsWith("591")
    ? digitsOnly.slice(3)
    : digitsOnly;
  const normalized = withoutCountryCode.slice(0, 8);
  if (!/^[67]/.test(normalized)) return "";

  return normalized;
}

export function sanitizeCiInput(value: string): string {
  return value.replace(/[^A-Za-z0-9-]/g, "").slice(0, 20);
}

export function sanitizeUsernameInput(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._@-]/g, "").slice(0, 60);
}
