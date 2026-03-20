"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

type DateInputProps = Omit<ComponentProps<typeof Input>, "type" | "onChange"> & {
  onValueChange?: (value: string) => void;
};

export function DateInput({ className, onValueChange, ...props }: DateInputProps) {
  return (
    <Input
      type="date"
      {...props}
      className={cn(className)}
      onChange={(event) => onValueChange?.(event.target.value)}
    />
  );
}
