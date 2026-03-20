import { Filter, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export function SuppliersFilters({ search, onSearchChange }: Props) {
  return (
    <div className="flex items-center gap-3 border-b p-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input placeholder="Buscar por nombre, correo o ciudad..." className="pl-8" value={search} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <Button variant="outline" size="icon">
        <Filter className="size-4" />
      </Button>
    </div>
  );
}
