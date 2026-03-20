"use server";

import bcrypt from "bcryptjs";

import { headers } from "next/headers";

import { loginSchema, type LoginInput } from "@/actions/auth/schemas/auth.schema";
import type { AuthResult } from "@/actions/auth/types/auth";

import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";


function parseDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  const deviceType = /mobile|iphone|android/.test(ua) ? "MOBILE" : "WEB";
  const browser = ua.includes("edg") ? "Edge" : ua.includes("chrome") ? "Chrome" : ua.includes("firefox") ? "Firefox" : ua.includes("safari") ? "Safari" : "Unknown";
  const os = ua.includes("windows") ? "Windows" : ua.includes("mac") ? "macOS" : ua.includes("linux") ? "Linux" : ua.includes("android") ? "Android" : ua.includes("iphone") ? "iOS" : "Unknown";
  return { deviceType, browser, os };
}

export async function loginSuperAdmin(data: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { username, password } = parsed.data;

  const auth = await prisma.auth.findUnique({
    where: { username },
    include: {
      employee: {
        include: { role: true },
      },
    },
  });

  if (!auth || !auth.isActive) {
    return { success: false, error: "Credenciales inválidas" };
  }

  const validPassword = await bcrypt.compare(password, auth.password);
  if (!validPassword) {
    return { success: false, error: "Credenciales inválidas" };
  }

  if (!auth.employee || auth.employee.role.code !== "SUPERADMIN") {
    return {
      success: false,
      error: "Acceso denegado: solo usuarios SUPERADMIN pueden iniciar sesión",
    };
  }

  if (auth.employee.status !== "ACTIVE") {
    return { success: false, error: "Cuenta de empleado desactivada" };
  }

  const settings = await prisma.employeeSettings.findUnique({
    where: { employeeId: auth.employee.id },
    select: { sessionTtlMinutes: true },
  });

  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const forwardedFor = requestHeaders.get("x-forwarded-for");
  const realIp = requestHeaders.get("x-real-ip");
  const ipAddress = forwardedFor?.split(",")[0]?.trim() ?? realIp ?? null;
  const device = parseDevice(userAgent);

  await prisma.auth.update({
    where: { id: auth.id },
    data: { lastLogin: new Date() },
  });

  await createSession({
    authId: auth.id,
    employeeId: auth.employee.id,
    username: auth.username,
    roleCode: auth.employee.role.code,
    firstName: auth.employee.firstName,
    lastName: auth.employee.lastName,
  }, {
    ttlMinutes: settings?.sessionTtlMinutes ?? 480,
    metadata: {
      userAgent,
      ipAddress,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
    },
  });

  await prisma.auditLog.create({
    data: {
      entity: "SuperAdminLogin",
      entityId: auth.employee.id,
      action: "CREATE",
      employeeId: auth.employee.id,
      ipAddress,
      userAgent,
      newValue: JSON.stringify({
        username: auth.username,
        fullName: `${auth.employee.firstName} ${auth.employee.lastName}`,
        role: auth.employee.role.code,
        deviceType: device.deviceType,
        browser: device.browser,
        os: device.os,
      }),
    },
  });

  return { success: true };
}
