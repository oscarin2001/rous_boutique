import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { categoryLabel, type CategoryFilter } from "./notifications.types";

type Props = {
  open: boolean;
  filter: CategoryFilter;
  isPending: boolean;
  total: number;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function NotificationsDeleteDialog({
  open,
  filter,
  isPending,
  total,
  onOpenChange,
  onConfirm,
}: Props) {
  const filterLabel = filter === "all" ? "Todo" : categoryLabel[filter];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Eliminar notificaciones del filtro</DialogTitle>
          <DialogDescription>
            Esta accion eliminara todas las notificaciones visibles del filtro actual: {filterLabel}. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={isPending || total === 0} onClick={onConfirm}>
            Eliminar todo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
