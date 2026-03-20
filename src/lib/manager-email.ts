export const MANAGER_EMAIL_DOMAIN = "rousboutique.com";
export const MANAGER_USERNAME_REGEX = /^[a-z0-9._-]{3,40}$/;

export function normalizeManagerUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

export function buildManagerEmail(username: string): string {
  return `${normalizeManagerUsername(username)}@${MANAGER_EMAIL_DOMAIN}`;
}

export function extractManagerUsername(email: string): string {
  const value = email.trim().toLowerCase();
  const suffix = `@${MANAGER_EMAIL_DOMAIN}`;
  if (value.endsWith(suffix)) {
    return value.slice(0, -suffix.length);
  }
  return value.split("@")[0] ?? "";
}

export function isManagerEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  const suffix = `@${MANAGER_EMAIL_DOMAIN}`;
  if (!email.endsWith(suffix)) return false;
  const username = email.slice(0, -suffix.length);
  return MANAGER_USERNAME_REGEX.test(username);
}
