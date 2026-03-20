import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
}

export function WarehousesFilters({ search, onSearchChange, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-card p-3 shadow-sm sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="pl-8"
         
        />
      </div>
      <Button onClick={onCreate}>
        <Plus className="size-4" />
        Nueva Bodega
      </Button>
    </div>
  );
}
