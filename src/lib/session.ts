import { randomUUID } from "crypto";

import { SignJWT, jwtVerify } from "jose";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? "fallback-dev-secret"
);

const COOKIE_NAME = "rb-session";
const DEFAULT_SESSION_TTL_MINUTES = 480;

export interface SessionPayload {
  sessionId: string;
  authId: number;
  employeeId: number;
  username: string;
  roleCode: string;
  firstName: string;
  lastName: string;
}

type SessionMetadata = {
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
};

type CreateSessionOptions = {
  ttlMinutes?: number;
  reuseSessionId?: string;
  metadata?: SessionMetadata;
};

export async function createSession(payload: Omit<SessionPayload, "sessionId">, options?: CreateSessionOptions) {
  const ttlMinutes = options?.ttlMinutes ?? DEFAULT_SESSION_TTL_MINUTES;
  const sessionId = options?.reuseSessionId ?? randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);

  if (options?.reuseSessionId) {
    await prisma.authSession.updateMany({
      where: { sessionId, authId: payload.authId, revokedAt: null },
      data: { expiresAt, lastSeenAt: now },
    });
  } else {
    await prisma.authSession.create({
      data: {
        authId: payload.authId,
        sessionId,
        userAgent: options?.metadata?.userAgent ?? null,
        ipAddress: options?.metadata?.ipAddress ?? null,
        deviceType: options?.metadata?.deviceType ?? null,
        browser: options?.metadata?.browser ?? null,
        os: options?.metadata?.os ?? null,
        expiresAt,
      },
    });
  }

  const token = await new SignJWT({ ...payload, sessionId } as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ttlMinutes * 60,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const session = payload as unknown as SessionPayload;
    if (!session.sessionId) return null;

    const persisted = await prisma.authSession.findUnique({
      where: { sessionId: session.sessionId },
      select: { authId: true, revokedAt: true, expiresAt: true },
    });

    if (!persisted || persisted.authId !== session.authId || persisted.revokedAt || persisted.expiresAt <= new Date()) {
      const cookieStore = await cookies();
      cookieStore.delete(COOKIE_NAME);
      return null;
    }

    await prisma.authSession.update({
      where: { sessionId: session.sessionId },
      data: { lastSeenAt: new Date() },
    });

    return session;
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const sessionId = (payload as { sessionId?: string }).sessionId;
      if (sessionId) {
        await prisma.authSession.updateMany({
          where: { sessionId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
    } catch {
      // Ignore invalid token during logout cleanup.
    }
  }
  cookieStore.delete(COOKIE_NAME);
}
