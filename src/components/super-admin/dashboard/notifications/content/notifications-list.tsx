import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { categoryLabel, type NotificationItem } from "./notifications.types";

type Props = {
  items: NotificationItem[];
  selected: Set<number>;
  onToggleItem: (id: number, checked: boolean) => void;
};

function DateInfo({ item }: { item: NotificationItem }) {
  if (item.showExactTimestamp) {
    return (
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(item.createdAt).toLocaleString("es-BO")} - {item.actorName}
      </p>
    );
  }

  return (
    <p className="mt-1 text-xs text-muted-foreground">
      Ultima conexion: {item.lastConnectionAt ? new Date(item.lastConnectionAt).toLocaleString("es-BO") : "sin dato"}
    </p>
  );
}

export function NotificationsList({ items, selected, onToggleItem }: Props) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-6 text-center text-sm text-muted-foreground">
        No hay notificaciones para este filtro.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="rounded-xl border border-border/50 bg-card p-3">
          <div className="flex items-start gap-3">
            <Checkbox checked={selected.has(item.id)} onCheckedChange={(checked) => onToggleItem(item.id, Boolean(checked))} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{item.title}</p>
                <Badge variant="outline">{categoryLabel[item.category]}</Badge>
                {!item.isRead ? <Badge variant="destructive">Nueva</Badge> : null}
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <DateInfo item={item} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
