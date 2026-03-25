"use client";

import { useEffect, useState } from "react";

import { PlusCircle, SquarePen } from "lucide-react";

import type { SupplierActionResult, SupplierBranchOption, SupplierManagerOption, SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
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

export function SupplierFormDialog({ open, onOpenChange, supplier, branchOptions, managerOptions, onSubmit, isPending }: Props) {
  const isEdit = !!supplier;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<number[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
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

    if (!isEdit && data.branchIds.length === 0) {
      next.branchIds = ADMIN_VALIDATION_MESSAGES.branchRequired;
    }

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
    if (!confirmPassword.trim()) return setConfirmMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);
    setConfirmMessage(null);
    const res = await onSubmit({ ...draft, confirmPassword }, supplier.id);
    if (!res.success) setConfirmMessage(res.error || "Error al confirmar");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="sa-modal-wide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <SquarePen className="size-5 text-primary" /> : <PlusCircle className="size-5 text-primary" />}
            {isEdit ? `Editar Proveedor: ${supplier?.fullName ?? ""}` : "Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Proveedor seleccionado: ${supplier?.fullName ?? "No disponible"}. Revisa los cambios antes de guardar.`
              : "Completa la informacion del aliado comercial."}
          </DialogDescription>
        </DialogHeader>
        {isEdit ? (
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
        ) : null}
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <SupplierFormFields supplier={supplier} branchOptions={branchOptions} managerOptions={managerOptions} selectedBranchIds={selectedBranchIds} onSelectedBranchIdsChange={setSelectedBranchIds} selectedManagerIds={selectedManagerIds} onSelectedManagerIdsChange={setSelectedManagerIds} errors={errors} onFieldInput={(name) => setErrors((prev) => ({ ...prev, [name]: undefined }))} />
            {isEdit && supplier ? (
              <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-foreground mb-2">Información Actual</p>
                    <p><strong>Estado:</strong> {supplier.isActive ? "Activo" : "Inactivo"}</p>
                    <p><strong>Compras:</strong> {supplier?.purchaseCount ?? 0}</p>
                    <p><strong>Valor Total:</strong> Bs. {(supplier?.totalPurchaseAmount ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Asignaciones Actuales</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p><strong>Sucursales ({supplier.branches.length}):</strong></p>
                        {supplier.branches.length > 0 ? (
                          <ul className="list-disc list-inside mt-1">
                            {supplier.branches.slice(0, 3).map(b => <li key={b.id}>{b.name}</li>)}
                            {supplier.branches.length > 3 && <li>...y {supplier.branches.length - 3} más</li>}
                          </ul>
                        ) : <p className="text-muted-foreground">Ninguna</p>}
                      </div>
                      <div>
                        <p><strong>Gerentes ({supplier.managers.length}):</strong></p>
                        {supplier.managers.length > 0 ? (
                          <ul className="list-disc list-inside mt-1">
                            {supplier.managers.slice(0, 3).map(m => <li key={m.id}>{m.fullName}</li>)}
                            {supplier.managers.length > 3 && <li>...y {supplier.managers.length - 3} más</li>}
                          </ul>
                        ) : <p className="text-muted-foreground">Ninguno</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "Procesando..." : isEdit ? "Revisar Cambios" : "Crear Proveedor"}</Button></DialogFooter>
          </form>
        ) : step === 2 ? (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-medium flex items-center gap-2">
                <span className="text-primary">📝</span>
                Resumen de Cambios Detectados
              </h4>
              {changes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No se detectaron cambios en los datos del proveedor.</p>
              ) : (
                <div className="space-y-2">
                  {changes.map((change, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{change.label}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span className="line-through">{change.from || "Vacío"}</span>
                          <span className="text-primary">→</span>
                          <span>{change.to || "Vacío"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="mb-3 text-sm font-medium flex items-center gap-2">
                <span className="text-amber-600">⚠️</span>
                Análisis de Impacto de Cambios
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Los cambios propuestos pueden afectar los siguientes aspectos del sistema:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Operaciones activas:</strong> {(supplier?.purchaseCount ?? 0) > 0 ? "Puede requerir notificación a gerentes" : "Sin impacto inmediato"}</li>
                  <li><strong>Asignaciones:</strong> Cambios en sucursales o gerentes afectarán permisos de acceso</li>
                  <li><strong>Auditoría:</strong> Todos los cambios serán registrados con timestamp y autor</li>
                  <li><strong>Notificaciones:</strong> Los gerentes asignados recibirán alertas de cambios</li>
                </ul>
              </div>
            </div>
            <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
              <h4 className="font-medium mb-2 text-primary flex items-center gap-2">
                <span>🔒</span>
                Confirmación de Seguridad
              </h4>
              <p className="text-muted-foreground mb-3">
                Para aplicar estos cambios, debes confirmar tu identidad como administrador del sistema.
              </p>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="supplier-confirm-name" className="text-sm">Escribe exactamente: <strong>{supplier?.fullName ?? "-"}</strong></Label>
                  <Input
                    id="supplier-confirm-name"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={supplier?.fullName ?? ""}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="supplier-confirm-password" className="text-sm">Contraseña de administrador</Label>
                  <PasswordInput
                    id="supplier-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            {confirmMessage ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm text-destructive">{confirmMessage}</p>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Atrás</Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={isPending || !confirmName.trim() || !confirmPassword.trim()}
                className="min-w-[140px]"
              >
                {isPending ? "Guardando..." : "Confirmar Cambios"}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

