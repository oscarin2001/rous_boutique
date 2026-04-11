import { cn } from "@/lib/utils";

type InlineFieldErrorProps = {
  message?: string | null;
  className?: string;
};

type InlineActionErrorProps = InlineFieldErrorProps;

export function InlineFieldError({ message, className }: InlineFieldErrorProps) {
  if (!message) return null;
  return <p className={cn("mt-1 text-xs text-destructive", className)}>{message}</p>;
}

export function InlineActionError({ message, className }: InlineActionErrorProps) {
  if (!message) return null;
  return <p className={cn("text-sm text-destructive", className)}>{message}</p>;
}
