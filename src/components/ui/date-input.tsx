"use client";

import { useEffect, useMemo, useState } from "react";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

type DateInputProps = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
};

function normalizeToIsoDate(value?: string | null): string {
  if (!value) return "";
  if (value.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(value: string): string {
  if (!value) return "Seleccionar fecha";
  const date = parseIsoDate(value);
  if (!date) return "Seleccionar fecha";

  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function DateInput({
  id,
  name,
  value,
  defaultValue,
  min,
  max,
  required,
  disabled,
  className,
  placeholder,
  onValueChange,
}: DateInputProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(normalizeToIsoDate(defaultValue));
  const currentValue = isControlled ? normalizeToIsoDate(value) : internalValue;

  useEffect(() => {
    if (isControlled) return;
    setInternalValue(normalizeToIsoDate(defaultValue));
  }, [defaultValue, isControlled]);

  const minDate = useMemo(() => parseIsoDate(normalizeToIsoDate(min)), [min]);
  const maxDate = useMemo(() => parseIsoDate(normalizeToIsoDate(max)), [max]);

  const setDateValue = (nextValue: string) => {
    if (!isControlled) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  };

  const selectedDate = parseIsoDate(currentValue);

  return (
    <div className="space-y-1">
      {name ? <input id={id} name={name} type="hidden" value={currentValue} required={required} /> : null}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-8 w-full justify-between px-2.5 font-normal",
                !currentValue && "text-muted-foreground",
                className
              )}
            >
              <span>{currentValue ? formatDateLabel(currentValue) : (placeholder ?? "Seleccionar fecha")}</span>
              <CalendarIcon className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="w-auto p-0" sideOffset={6}>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => setDateValue(date ? formatIsoDate(date) : "")}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
