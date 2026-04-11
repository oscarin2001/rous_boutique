"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import { toast } from "sonner";

import {
  dismissAllSuperAdminNotificationsByCategoryAction,
  dismissSuperAdminNotificationsAction,
  getSuperAdminNotificationsAction,
  markSuperAdminToolbarNotificationsReadAction,
  setSuperAdminNotificationsReadStateAction,
} from "@/actions/super-admin/user-settings/actions";

import { type CategoryFilter, type NotificationItem } from "./notifications.types";

type UseNotificationsPageState = {
  items: NotificationItem[];
  selected: Set<number>;
  filter: CategoryFilter;
  page: number;
  pageCount: number;
  total: number;
  unreadCount: number;
  isPending: boolean;
  confirmDeleteAllOpen: boolean;
  setConfirmDeleteAllOpen: (open: boolean) => void;
  setFilter: (filter: CategoryFilter) => void;
  setPage: (page: number) => void;
  toggleItem: (id: number, checked: boolean) => void;
  toggleSelectAllVisible: (checked: boolean) => void;
  selectedVisibleCount: number;
  allVisibleSelected: boolean;
  load: (requestedPage?: number, requestedFilter?: CategoryFilter) => void;
  dismissSelected: () => void;
  dismissAllInFilter: () => void;
  setReadState: (read: boolean) => void;
};

export function useNotificationsPage(): UseNotificationsPageState {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(() => items, [items]);
  const selectedVisibleCount = useMemo(
    () => visible.reduce((acc, item) => acc + (selected.has(item.id) ? 1 : 0), 0),
    [visible, selected],
  );
  const allVisibleSelected = visible.length > 0 && selectedVisibleCount === visible.length;

  const load = useCallback(
    (requestedPage = page, requestedFilter = filter) => {
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
    },
    [filter, page],
  );

  useEffect(() => {
    load(1, filter);
    startTransition(async () => {
      await markSuperAdminToolbarNotificationsReadAction();
    });
  }, [filter, load]);

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
      visible.forEach((item) => {
        if (checked) next.add(item.id);
        else next.delete(item.id);
      });
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
      setConfirmDeleteAllOpen(false);
      load(1, filter);
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

  return {
    items,
    selected,
    filter,
    page,
    pageCount,
    total,
    unreadCount,
    isPending,
    confirmDeleteAllOpen,
    setConfirmDeleteAllOpen,
    setFilter,
    setPage,
    toggleItem,
    toggleSelectAllVisible,
    selectedVisibleCount,
    allVisibleSelected,
    load,
    dismissSelected,
    dismissAllInFilter,
    setReadState,
  };
}
