"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";


import { loginSuperAdmin } from "@/actions/auth";
import type { LoginInput } from "@/actions/auth/schemas/auth.schema";

import { GoogleIcon } from "@/components/super-admin/login/google-icon";
import { LoginHero } from "@/components/super-admin/login/login-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";



import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: LoginInput = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };

    try {
      const result = await loginSuperAdmin(data);
      if (result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Rous Boutique</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Gestión Administrativa — Acceso SuperAdmin
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="username">Usuario</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="admin"
                  required
                  autoComplete="username"
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="size-4 animate-spin" />}
                  Iniciar Sesión
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                O continuar con
              </FieldSeparator>

              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  disabled={loading}
                >
                  <GoogleIcon className="size-4" />
                  Continuar con Google
                </Button>
              </Field>

              <FieldDescription className="text-center text-xs">
                Acceso exclusivo para administradores del sistema.
              </FieldDescription>
            </FieldGroup>
          </form>

          <LoginHero />
        </CardContent>
      </Card>
    </div>
  );
}
