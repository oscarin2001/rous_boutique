"use client";

import { Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  text: string;
};

export function InfoHint({ text }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Informacion"
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent side="top">{text}</TooltipContent>
    </Tooltip>
  );
}
