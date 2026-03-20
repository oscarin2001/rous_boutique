"use client";

import { useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  showLabel?: string;
  hideLabel?: string;
};

export function PasswordInput({
  className,
  showLabel = "Mostrar contrasena",
  hideLabel = "Ocultar contrasena",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isDisabled = Boolean(props.disabled);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        disabled={isDisabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setShowPassword((current) => !current)}
        aria-label={showPassword ? hideLabel : showLabel}
        title={showPassword ? hideLabel : showLabel}
      >
        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
