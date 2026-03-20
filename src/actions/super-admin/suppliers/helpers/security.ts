import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/session";

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
