import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pageCount: number;
  isPending: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function NotificationsPagination({
  page,
  pageCount,
  isPending,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="outline" size="sm" disabled={isPending || page <= 1} onClick={onPrevious}>
        <ChevronLeft className="size-4" />
        Anterior
      </Button>
      <Badge variant="outline">Pagina {page} de {pageCount}</Badge>
      <Button type="button" variant="outline" size="sm" disabled={isPending || page >= pageCount} onClick={onNext}>
        Siguiente
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
