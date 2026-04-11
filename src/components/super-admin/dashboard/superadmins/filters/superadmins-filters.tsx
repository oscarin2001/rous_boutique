import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
};

export function SuperAdminsFilters({ search, onSearchChange, onCreate }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por nombre, usuario, CI o telefono"
        className="md:max-w-sm"
      />
      <Button onClick={onCreate}>
        <PlusCircle className="size-4" />
        Nuevo super admin
      </Button>
    </div>
  );
}
