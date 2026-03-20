import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { LoginForm } from "@/components/super-admin/login/login-form";

import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Iniciar Sesión — SuperAdmin",
};

export default async function SuperAdminLoginPage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
