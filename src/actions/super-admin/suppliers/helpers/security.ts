import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/session";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 8;
const REAUTH_WINDOW_MS = 5 * 60_000;
const ATTEMPT_WINDOW_MS = 10 * 60_000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MS = 15 * 60_000;

type RateBucket = { count: number; resetAt: number };
type PasswordAttempts = { count: number; startedAt: number; lockedUntil: number | null };

const actionBuckets = new Map<string, RateBucket>();
const passwordAttempts = new Map<string, PasswordAttempts>();
const recentReauth = new Map<string, number>();

const keyForSession = (session: SessionPayload) => `${session.authId}:${session.sessionId}`;

export function enforceSensitiveActionRateLimit(session: SessionPayload): string | null {
  const key = keyForSession(session);
  const now = Date.now();
  const current = actionBuckets.get(key);

  if (!current || current.resetAt <= now) {
    actionBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return "Demasiados intentos en poco tiempo. Espera un minuto e intenta nuevamente";
  }

  current.count += 1;
  actionBuckets.set(key, current);
  return null;
}

export async function enforceAdminPasswordCheck(
  session: SessionPayload,
  password: string,
  allowRecentReauth: boolean
): Promise<string | null> {
  const key = keyForSession(session);
  const now = Date.now();
  const attempts = passwordAttempts.get(key);

  if (attempts?.lockedUntil && attempts.lockedUntil > now) {
    return "Demasiados intentos fallidos. Intenta nuevamente en 15 minutos";
  }

  const trimmed = password.trim();
  const lastReauthAt = recentReauth.get(key) ?? 0;
  const hasRecentReauth = now - lastReauthAt <= REAUTH_WINDOW_MS;

  if (!trimmed && allowRecentReauth && hasRecentReauth) {
    return null;
  }

  if (!trimmed) {
    return "Ingresa la contrasena de administrador";
  }

  const validPassword = await verifySessionPassword(session, trimmed);
  if (validPassword) {
    recentReauth.set(key, now);
    passwordAttempts.delete(key);
    return null;
  }

  const nextAttempts =
    !attempts || now - attempts.startedAt > ATTEMPT_WINDOW_MS
      ? { count: 1, startedAt: now, lockedUntil: null }
      : { ...attempts, count: attempts.count + 1 };

  if (nextAttempts.count >= MAX_FAILED_ATTEMPTS) {
    nextAttempts.lockedUntil = now + LOCK_MS;
  }

  passwordAttempts.set(key, nextAttempts);

  if (nextAttempts.lockedUntil) {
    return "Demasiados intentos fallidos. Intenta nuevamente en 15 minutos";
  }

  return "Contraseña de confirmación inválida";
}

export async function verifySessionPassword(
  session: SessionPayload,
  password: string
): Promise<boolean> {
  const raw = password.trim();
  if (!raw) return false;

  const auth = await prisma.auth.findUnique({
    where: { id: session.authId },
    select: { password: true, isActive: true },
  });

  if (!auth || !auth.isActive) return false;
  return bcrypt.compare(raw, auth.password);
}
