"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { Bell, CheckCheck, CheckSquare, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert, Trash, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  dismissAllSuperAdminNotificationsByCategoryAction,
  dismissSuperAdminNotificationsAction,
  getSuperAdminNotificationsAction,
  markSuperAdminToolbarNotificationsReadAction,
  setSuperAdminNotificationsReadStateAction,
} from "@/actions/super-admin/user-settings/actions";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  actorName: string;
  category: "security" | "system" | "account";
  showExactTimestamp: boolean;
  lastConnectionAt: string | null;
  isRead: boolean;
};

type CategoryFilter = "all" | "security" | "system" | "account";

const categoryLabel: Record<Exclude<CategoryFilter, "all">, string> = {
  security: "Seguridad",
  system: "Sistema",
  account: "Cuenta",
};

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);

  const load = useCallback((requestedPage = page, requestedFilter = filter) => {
    startTransition(async () => {
      const result = await getSuperAdminNotificationsAction({ page: requestedPage, pageSize: 20, category: requestedFilter });
      if (!result.success || !result.data) {
        toast.error(result.error ?? "No se pudieron cargar las notificaciones");
        return;
      }

      setItems(result.data.items);
      setPage(result.data.page);
      setPageCount(result.data.pageCount);
      setTotal(result.data.total);
      setUnreadCount(result.data.unreadCount);
      setSelected((prev) => new Set([...prev].filter((id) => result.data.items.some((item) => item.id === id))));
    });
  }, [filter, page]);

  useEffect(() => {
    load(1, filter);
    startTransition(async () => {
      await markSuperAdminToolbarNotificationsReadAction();
    });
  }, [filter, load]);

  const visible = useMemo(() => items, [items]);

  const selectedVisibleCount = useMemo(() => {
    return visible.reduce((acc, item) => acc + (selected.has(item.id) ? 1 : 0), 0);
  }, [visible, selected]);

  const allVisibleSelected = visible.length > 0 && selectedVisibleCount === visible.length;

  const toggleItem = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of visible) {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  };

  const dismissSelected = () => {
    const ids = visible.filter((item) => selected.has(item.id)).map((item) => item.id);
    if (!ids.length) {
      toast.info("Selecciona al menos una notificacion");
      return;
    }

    startTransition(async () => {
      const result = await dismissSuperAdminNotificationsAction(ids);
      if (!result.success) {
        toast.error(result.error ?? "No se pudieron eliminar las notificaciones");
        return;
      }
      toast.success(`${result.count} notificaciones eliminadas`);
      load(page, filter);
    });
  };

  const dismissAllInFilter = () => {
    startTransition(async () => {
      const result = await dismissAllSuperAdminNotificationsByCategoryAction(filter);
      if (!result.success) {
        toast.error(result.error ?? "No se pudieron eliminar las notificaciones del filtro");
        return;
      }
      toast.success(`${result.count} notificaciones eliminadas del filtro actual`);
      load(1, filter);
      setConfirmDeleteAllOpen(false);
    });
  };

  const setReadState = (read: boolean) => {
    const ids = visible.filter((item) => selected.has(item.id)).map((item) => item.id);
    if (!ids.length) {
      toast.info("Selecciona al menos una notificacion");
      return;
    }

    startTransition(async () => {
      const result = await setSuperAdminNotificationsReadStateAction(ids, read);
      if (!result.success) {
        toast.error(result.error ?? "No se pudo actualizar el estado de lectura");
        return;
      }
      toast.success(read ? "Notificaciones marcadas como leidas" : "Notificaciones marcadas como no leidas");
      load(page, filter);
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-card/90 p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-base font-semibold"><Bell className="size-4" />Notificaciones del sistema</h1>
            <p className="mt-1 text-xs text-muted-foreground">Se priorizan eventos de seguridad. Los inicios de sesion se agrupan por dispositivo y muestran solo la ultima conexion.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Total: {total}</Badge>
            <Badge variant="outline">No leidas: {unreadCount}</Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card/90 p-3 shadow-sm ring-1 ring-border/40">
        <Button type="button" variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setFilter("all"); }}>Todo</Button>
        <Button type="button" variant={filter === "security" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setFilter("security"); }}><ShieldAlert className="size-4" />Seguridad</Button>
        <Button type="button" variant={filter === "system" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setFilter("system"); }}>Sistema</Button>
        <Button type="button" variant={filter === "account" ? "default" : "outline"} size="sm" onClick={() => { setPage(1); setFilter("account"); }}>Cuenta</Button>
        <Badge variant="outline">Etiqueta activa: {filter === "all" ? "Todo" : categoryLabel[filter]}</Badge>
      </div>

      <div className="rounded-xl bg-card/90 p-3 shadow-sm ring-1 ring-border/40">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={allVisibleSelected} onCheckedChange={(checked) => toggleSelectAllVisible(Boolean(checked))} />
            <span className="inline-flex items-center gap-1"><CheckSquare className="size-4" />Seleccionar todo (visible)</span>
          </label>
          <TooltipProvider delay={120}>
            <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background/60 p-1">
              <Tooltip>
                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Refrescar" disabled={isPending} onClick={() => load(page, filter)} />}>
                  <RefreshCw className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">Refrescar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Marcar leidas" disabled={isPending || selectedVisibleCount === 0} onClick={() => setReadState(true)} />}>
                  <CheckCheck className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">Marcar como leido</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Eliminar seleccionadas" disabled={isPending || selectedVisibleCount === 0} onClick={dismissSelected} />}>
                  <Trash2 className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">Eliminar seleccionadas</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Eliminar todo del filtro" disabled={isPending || total === 0} onClick={() => setConfirmDeleteAllOpen(true)} />}>
                  <Trash className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top">Eliminar todo del filtro</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2">
        {visible.length ? visible.map((item) => (
          <div key={item.id} className="rounded-xl bg-card/90 p-3 shadow-sm ring-1 ring-border/40">
            <div className="flex items-start gap-3">
              <Checkbox checked={selected.has(item.id)} onCheckedChange={(checked) => toggleItem(item.id, Boolean(checked))} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <Badge variant="outline">{categoryLabel[item.category]}</Badge>
                  {!item.isRead ? <Badge variant="destructive">Nueva</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {item.showExactTimestamp ? (
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("es-BO")} - {item.actorName}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">Ultima conexion: {item.lastConnectionAt ? new Date(item.lastConnectionAt).toLocaleString("es-BO") : "sin dato"}</p>
                )}
              </div>
            </div>
          </div>
        )) : <div className="rounded-xl bg-card/90 p-6 text-center text-sm text-muted-foreground shadow-sm ring-1 ring-border/40">No hay notificaciones para este filtro.</div>}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={isPending || page <= 1} onClick={() => load(page - 1, filter)}>
          <ChevronLeft className="size-4" />Anterior
        </Button>
        <Badge variant="outline">Pagina {page} de {pageCount}</Badge>
        <Button type="button" variant="outline" size="sm" disabled={isPending || page >= pageCount} onClick={() => load(page + 1, filter)}>
          Siguiente<ChevronRight className="size-4" />
        </Button>
      </div>

      <Dialog open={confirmDeleteAllOpen} onOpenChange={setConfirmDeleteAllOpen}>
        <DialogContent className="max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Eliminar notificaciones del filtro</DialogTitle>
            <DialogDescription>
              Esta accion eliminara todas las notificaciones visibles del filtro actual: {filter === "all" ? "Todo" : categoryLabel[filter]}. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setConfirmDeleteAllOpen(false)}>Cancelar</Button>
            <Button type="button" variant="destructive" disabled={isPending || total === 0} onClick={dismissAllInFilter}>Eliminar todo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
