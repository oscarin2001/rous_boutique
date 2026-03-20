const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

export const HUMAN_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;
export const PLACE_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ .'-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE_REGEX.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return valid ? date : null;
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}
