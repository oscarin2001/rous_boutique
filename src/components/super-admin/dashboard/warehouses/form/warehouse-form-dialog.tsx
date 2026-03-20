"use client";

import { useEffect, useState } from "react";

import { PlusCircle, SquarePen } from "lucide-react";

import type { WarehouseActionResult, WarehouseOptionBranch, WarehouseOptionManager, WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { BOLIVIA_COUNTRY, BOLIVIA_DEPARTMENTS } from "@/lib/bolivia";
import { PLACE_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";

import { WarehouseFormFields } from "./warehouse-form-fields";
import type { ChangeItem, FieldErrors } from "./warehouse-form-types";
import { buildWarehouseDraft, summarizeWarehouseChanges } from "./warehouse-form-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: WarehouseRow | null;
  branches: WarehouseOptionBranch[];
  managers: WarehouseOptionManager[];
  onSubmit: (data: Record<string, unknown>, id?: number) => Promise<WarehouseActionResult>;
  isPending: boolean;
}

function fmtDateTime(value: string | null): string {
  if (!value) return "No disponible";
  return new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function WarehouseFormDialog({ open, onOpenChange, row, branches, managers, onSubmit, isPending }: Props) {
  const isEdit = !!row;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<number[]>([]);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedBranchIds(row?.branches.map((b) => b.id) ?? []);
    setSelectedManagerIds(row?.managers.map((m) => m.id) ?? []);
  }, [open, row]);

  const reset = () => { setStep(1); setErrors({}); setDraft(null); setChanges([]); setConfirmName(""); setConfirmPassword(""); setConfirmMessage(null); };

  const validateDraft = (data: Record<string, unknown>): FieldErrors => {
    const next: FieldErrors = {};
    const name = String(data.name ?? "");
    const phone = String(data.phone ?? "");
    const address = String(data.address ?? "");
    const city = String(data.city ?? "");
    const department = String(data.department ?? "");
    const country = String(data.country ?? "");
    const openedAt = String(data.openedAt ?? "");

    if (name.length < 2) next.name = "Minimo 2 caracteres";
    if (name.length > 80) next.name = "Maximo 80 caracteres";
    if (name && !PLACE_NAME_REGEX.test(name)) next.name = "Solo letras y separadores simples";

    if (phone && !/^[67]\d{7}$/.test(phone)) next.phone = "Telefono invalido";

    if (address.length < 5) next.address = "Minimo 5 caracteres";
    if (address.length > 300) next.address = "Maximo 300 caracteres";

    if (city.length < 2) next.city = "Minimo 2 caracteres";
    if (city.length > 50) next.city = "Maximo 50 caracteres";
    if (city && !PLACE_NAME_REGEX.test(city)) next.city = "Solo letras y separadores simples";

    if (!department) next.department = "Selecciona un departamento";
    if (department && !BOLIVIA_DEPARTMENTS.includes(department as (typeof BOLIVIA_DEPARTMENTS)[number])) {
      next.department = "Selecciona un departamento valido";
    }

    if (country !== BOLIVIA_COUNTRY) next.country = "El pais debe ser Bolivia";

    if (openedAt && !isValidIsoDate(openedAt)) next.openedAt = "Fecha invalida";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = buildWarehouseDraft(new FormData(event.currentTarget));
    const nextErrors = validateDraft(parsed);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (isEdit && row) {
      const nextChanges = summarizeWarehouseChanges(row, parsed, branches, managers);
      if (!nextChanges.length) return setConfirmMessage("No hay cambios detectados.");
      setDraft(parsed); setChanges(nextChanges); setConfirmMessage(null); setStep(2); return;
    }
    const result = await onSubmit(parsed);
    if (!result.success && result.fieldErrors) setErrors(result.fieldErrors);
  };

  const handleConfirm = async () => {
    if (!row || !draft) return;
    if (confirmName.trim().toLowerCase() !== row.name.toLowerCase()) return setConfirmMessage("El nombre no coincide.");
    const result = await onSubmit({ ...draft, confirmPassword }, row.id);
    if (!result.success) setConfirmMessage(result.error || "No se pudo confirmar la edicion");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <SquarePen className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Editar Bodega" : "Nueva Bodega"}
          </DialogTitle>
          <DialogDescription>{isEdit ? "Revisa y confirma en 3 pasos" : "Completa los datos de la bodega"}</DialogDescription>
        </DialogHeader>
        {isEdit ? <div className="mb-2 flex gap-2">{[1, 2, 3].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />)}</div> : null}
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <WarehouseFormFields row={row} branches={branches} managers={managers} selectedBranchIds={selectedBranchIds} selectedManagerIds={selectedManagerIds} onSelectedBranchIdsChange={setSelectedBranchIds} onSelectedManagerIdsChange={setSelectedManagerIds} errors={errors} />
            {isEdit && row ? (
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
                <p>Creado por: {row.createdByName ?? "No disponible"}</p>
                <p>Creado el: {fmtDateTime(row.createdAt)}</p>
                <p>Actualizado por: {row.updatedByName ?? "No disponible"}</p>
                <p>Actualizado el: {fmtDateTime(row.updatedAt)}</p>
              </div>
            ) : null}
            <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : isEdit ? "Revisar Cambios" : "Crear Bodega"}</Button></DialogFooter>
          </form>
        ) : step === 2 ? (
          <div className="space-y-3"><div className="rounded-lg border p-3 text-sm">{changes.map((c) => <p key={`${c.label}-${c.from}-${c.to}`}><strong>{c.label}:</strong> {c.from} {"->"} {c.to}</p>)}</div>{confirmMessage ? <p className="text-xs text-destructive">{confirmMessage}</p> : null}<DialogFooter><Button variant="outline" onClick={() => setStep(1)}>Atras</Button><Button onClick={() => setStep(3)}>Siguiente</Button></DialogFooter></div>
        ) : (
          <div className="space-y-3"><Label htmlFor="wh-confirm-name">Escribe {row?.name} para confirmar</Label><Input id="wh-confirm-name" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} /><Label htmlFor="wh-confirm-password">Contrasena de administrador</Label><PasswordInput id="wh-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />{confirmMessage ? <p className="text-xs text-destructive">{confirmMessage}</p> : null}<DialogFooter><Button variant="outline" onClick={() => setStep(2)}>Atras</Button><Button onClick={handleConfirm} disabled={isPending}>{isPending ? "Confirmando..." : "Confirmar Edicion"}</Button></DialogFooter></div>
        )}
      </DialogContent>
    </Dialog>
  );
}

