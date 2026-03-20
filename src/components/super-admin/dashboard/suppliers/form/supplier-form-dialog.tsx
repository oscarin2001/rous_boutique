"use client";

import { useEffect, useState } from "react";

import { PlusCircle, SquarePen } from "lucide-react";

import type { SupplierActionResult, SupplierBranchOption, SupplierManagerOption, SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { HUMAN_NAME_REGEX, PLACE_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";

import { SupplierFormFields } from "./supplier-form-fields";
import type { ChangeItem, FieldErrors, SupplierDraft } from "./supplier-form-types";
import { buildDraft, summarizeChanges } from "./supplier-form-utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: SupplierRow | null;
  branchOptions: SupplierBranchOption[];
  managerOptions: SupplierManagerOption[];
  onSubmit: (data: Record<string, unknown>, id?: number) => Promise<SupplierActionResult>;
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

export function SupplierFormDialog({ open, onOpenChange, supplier, branchOptions, managerOptions, onSubmit, isPending }: Props) {
  const isEdit = !!supplier;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<number[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState<SupplierDraft | null>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedBranchIds(supplier?.branches.map((b) => b.id) ?? []);
    setSelectedManagerIds(supplier?.managers.map((m) => m.id) ?? []);
  }, [open, supplier]);

  const reset = () => { setErrors({}); setStep(1); setDraft(null); setChanges([]); setConfirmName(""); setConfirmPassword(""); setConfirmMessage(null); };

  const validateDraft = (data: SupplierDraft): FieldErrors => {
    const next: FieldErrors = {};

    if (data.firstName.length < 2) next.firstName = "Minimo 2 caracteres";
    if (data.firstName.length > 50) next.firstName = "Maximo 50 caracteres";
    if (data.firstName && !HUMAN_NAME_REGEX.test(data.firstName)) next.firstName = "Solo letras y separadores simples";

    if (data.lastName.length < 2) next.lastName = "Minimo 2 caracteres";
    if (data.lastName.length > 50) next.lastName = "Maximo 50 caracteres";
    if (data.lastName && !HUMAN_NAME_REGEX.test(data.lastName)) next.lastName = "Solo letras y separadores simples";

    if (data.phone && !/^[67]\d{7}$/.test(data.phone)) next.phone = "Telefono invalido de Bolivia";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "Correo invalido";

    if (data.address.length > 160) next.address = "Maximo 160 caracteres";
    if (data.city.length > 50) next.city = "Maximo 50 caracteres";
    if (data.department.length > 50) next.department = "Maximo 50 caracteres";
    if (data.country.length > 50) next.country = "Maximo 50 caracteres";
    if (data.notes.length > 500) next.notes = "Maximo 500 caracteres";
    if (data.ci.length > 20) next.ci = "Maximo 20 caracteres";
    if (data.ci && !/^[A-Za-z0-9-]+$/.test(data.ci)) next.ci = "Solo letras, numeros y guion";

    if (data.city && !PLACE_NAME_REGEX.test(data.city)) next.city = "Solo letras y separadores simples";
    if (data.department && !PLACE_NAME_REGEX.test(data.department)) next.department = "Solo letras y separadores simples";
    if (data.country && !PLACE_NAME_REGEX.test(data.country)) next.country = "Solo letras y separadores simples";

    if (data.birthDate && !isValidIsoDate(data.birthDate)) next.birthDate = "Fecha invalida";
    if (data.partnerSince && !isValidIsoDate(data.partnerSince)) next.partnerSince = "Fecha invalida";
    if (data.contractEndAt && !isValidIsoDate(data.contractEndAt)) next.contractEndAt = "Fecha invalida";

    if (data.isIndefinite && data.contractEndAt) next.contractEndAt = "No aplica si el contrato es indefinido";
    if (data.partnerSince && data.contractEndAt && data.contractEndAt < data.partnerSince) {
      next.contractEndAt = "No puede ser anterior a Aliado Desde";
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextDraft = buildDraft(new FormData(event.currentTarget));
    const nextErrors = validateDraft(nextDraft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    if (isEdit && supplier) {
      const nextChanges = summarizeChanges(supplier, nextDraft, branchOptions, managerOptions);
      if (!nextChanges.length) return setConfirmMessage("No hay cambios detectados.");
      setDraft(nextDraft); setChanges(nextChanges); setStep(2); setConfirmMessage(null); return;
    }
    const res = await onSubmit(nextDraft);
    if (!res.success && res.fieldErrors) setErrors(res.fieldErrors);
  };

  const handleConfirmEdit = async () => {
    if (!supplier || !draft) return;
    if (confirmName.trim().toLowerCase() !== supplier.fullName.toLowerCase()) return setConfirmMessage("El nombre no coincide.");
    if (!confirmPassword.trim()) return setConfirmMessage("Ingresa la contrasena de administrador.");
    const res = await onSubmit({ ...draft, confirmPassword }, supplier.id);
    if (!res.success) setConfirmMessage(res.error || "Error al confirmar");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <SquarePen className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>{isEdit ? "Revisa los cambios antes de guardar." : "Completa la informacion del aliado comercial."}</DialogDescription>
        </DialogHeader>
        {isEdit ? (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        ) : null}
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground">Asegurate de que la informacion <strong>atribuya</strong> correctamente. Si los datos <strong>aportan</strong> valor, se reflejaran en compras y sucursales.</div>
            <SupplierFormFields supplier={supplier} branchOptions={branchOptions} managerOptions={managerOptions} selectedBranchIds={selectedBranchIds} onSelectedBranchIdsChange={setSelectedBranchIds} selectedManagerIds={selectedManagerIds} onSelectedManagerIdsChange={setSelectedManagerIds} errors={errors} onFieldInput={(name) => setErrors((prev) => ({ ...prev, [name]: undefined }))} />
            {isEdit && supplier ? (
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
                <p>Creado por: {supplier.createdByName ?? "No disponible"}</p>
                <p>Creado el: {fmtDateTime(supplier.createdAt)}</p>
                <p>Actualizado por: {supplier.updatedByName ?? "No disponible"}</p>
                <p>Actualizado el: {fmtDateTime(supplier.updatedAt)}</p>
              </div>
            ) : null}
            <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Procesando..." : isEdit ? "Revisar Cambios" : "Crear Proveedor"}</Button></DialogFooter>
          </form>
        ) : step === 2 ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-3"><h4 className="mb-2 text-sm font-medium">Resumen de cambios</h4>{changes.map((change) => <p key={`${change.label}-${change.from}-${change.to}`} className="text-xs"><strong>{change.label}:</strong> {change.from} {"->"} {change.to}</p>)}</div>
            {confirmMessage ? <p className="text-xs text-destructive">{confirmMessage}</p> : null}
            <DialogFooter><Button variant="outline" onClick={() => setStep(1)}>Atras</Button><Button onClick={() => { setConfirmMessage(null); setStep(3); }}>Siguiente</Button></DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-confirm-name" className="text-xs">Escribe {supplier?.fullName} para confirmar</Label>
              <Input id="supplier-confirm-name" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
              <Label htmlFor="supplier-confirm-password" className="text-xs">Contrasena de administrador</Label>
              <PasswordInput id="supplier-confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {confirmMessage ? <p className="text-xs text-destructive">{confirmMessage}</p> : null}
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">Confirmacion final: al continuar, los cambios del proveedor se aplicaran de forma inmediata.</div>
            <DialogFooter><Button variant="outline" onClick={() => setStep(2)}>Atras</Button><Button onClick={handleConfirmEdit} disabled={isPending}>{isPending ? "Guardando..." : "Confirmar Edicion"}</Button></DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

