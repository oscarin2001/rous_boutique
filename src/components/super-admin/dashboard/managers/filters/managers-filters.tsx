"use client";

import { Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ManagersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function ManagersFilters({
  search,
  onSearchChange,
  onCreate,
}: ManagersFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          type="search"
         
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-8"
        />
      </div>
      <Button onClick={onCreate} className="gap-1.5">
        <Plus className="size-4" />
        Nuevo Encargado de sucursal
      </Button>
    </div>
  );
}
