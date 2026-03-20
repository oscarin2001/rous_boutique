import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/session";

export async function verifySessionPassword(
  session: SessionPayload,
  password: string
): Promise<boolean> {
  const value = password.trim();
  if (!value) return false;

  const auth = await prisma.auth.findUnique({
    where: { id: session.authId },
    select: { password: true, isActive: true },
  });

  if (!auth || !auth.isActive) return false;
  return bcrypt.compare(value, auth.password);
}
