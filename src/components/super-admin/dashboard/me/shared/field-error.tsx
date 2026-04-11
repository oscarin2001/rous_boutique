"use client";

import { InlineFieldError } from "@/components/super-admin/dashboard/shared/forms/inline-feedback";

type FieldErrorProps = {
  message?: string;
};

export function FieldError({ message }: FieldErrorProps) {
  return <InlineFieldError message={message} />;
}
