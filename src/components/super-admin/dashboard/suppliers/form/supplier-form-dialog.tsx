"use client";

import { useEffect, useState } from "react";

import { PlusCircle, SquarePen, User, FileText, ShieldCheck } from "lucide-react";

import type { SupplierActionResult, SupplierBranchOption, SupplierManagerOption, SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { ADMIN_VALIDATION_MESSAGES } from "@/lib/admin-validation-messages";
import { HUMAN_NAME_REGEX, PLACE_NAME_REGEX, isValidIsoDate } from "@/lib/field-validation";

import { SupplierBasicCoreFields, SupplierBasicExtraFields } from "./supplier-basic-fields";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<SupplierDraft | null>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [confirmName, setConfirmName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  const [openSection, setOpenSection] = useState<string>("basic");

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open]);

  const reset = () => {
    setErrors({});
    setStep(1);
    setDraft(null);
    setChanges([]);
    setConfirmName("");
    setConfirmPassword("");
    setConfirmMessage(null);
    setOpenSection("basic");
  };

  const validateDraft = (data: SupplierDraft): FieldErrors => {
    const next: FieldErrors = {};

    if (data.firstName.length < 2) next.firstName = "Mínimo 2 caracteres";
    if (data.firstName.length > 50) next.firstName = "Máximo 50 caracteres";
    if (data.firstName && !HUMAN_NAME_REGEX.test(data.firstName)) next.firstName = "Solo letras y separadores simples";

    if (data.lastName.length < 2) next.lastName = "Mínimo 2 caracteres";
    if (data.lastName.length > 50) next.lastName = "Máximo 50 caracteres";
    if (data.lastName && !HUMAN_NAME_REGEX.test(data.lastName)) next.lastName = "Solo letras y separadores simples";

    if (data.phone && !/^[67]\d{7}$/.test(data.phone)) next.phone = "Teléfono inválido de Bolivia";
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = "Correo inválido";

    if (data.address.length > 160) next.address = "Máximo 160 caracteres";
    if (data.city.length > 50) next.city = "Máximo 50 caracteres";
    if (data.department.length > 50) next.department = "Máximo 50 caracteres";
    if (data.country.length > 50) next.country = "Máximo 50 caracteres";
    if (data.notes.length > 500) next.notes = "Máximo 500 caracteres";
    if (data.ci.length > 20) next.ci = "Máximo 20 caracteres";
    if (data.ci && !/^[A-Za-z0-9-]+$/.test(data.ci)) next.ci = "Solo letras, números y guion";

    if (data.city && !PLACE_NAME_REGEX.test(data.city)) next.city = "Solo letras y separadores simples";
    if (data.department && !PLACE_NAME_REGEX.test(data.department)) next.department = "Solo letras y separadores simples";
    if (data.country && !PLACE_NAME_REGEX.test(data.country)) next.country = "Solo letras y separadores simples";

    if (data.birthDate && !isValidIsoDate(data.birthDate)) next.birthDate = "Fecha inválida";
    if (data.birthDate && new Date(data.birthDate) > new Date()) next.birthDate = "La fecha de nacimiento no puede ser futura";
    if (data.partnerSince && !isValidIsoDate(data.partnerSince)) next.partnerSince = "Fecha inválida";
    if (data.partnerSince && new Date(data.partnerSince) > new Date()) next.partnerSince = "La fecha de alianza no puede ser futura";
    if (data.contractEndAt && !isValidIsoDate(data.contractEndAt)) next.contractEndAt = "Fecha inválida";

    if (data.isIndefinite && data.contractEndAt) next.contractEndAt = "No aplica si el contrato es indefinido";
    if (data.partnerSince && data.contractEndAt && data.contractEndAt < data.partnerSince) {
      next.contractEndAt = "No puede ser anterior a 'Aliado Desde'";
    }

    return next;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextDraft = buildDraft(new FormData(event.currentTarget));
    const nextErrors = validateDraft(nextDraft);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (isEdit && supplier) {
      const nextChanges = summarizeChanges(supplier, nextDraft, branchOptions, managerOptions);
      if (!nextChanges.length) return setConfirmMessage("No hay cambios detectados.");
      setDraft(nextDraft);
      setChanges(nextChanges);
      setStep(2);
      setConfirmMessage(null);
      return;
    }

    const res = await onSubmit(nextDraft);
    if (!res.success && res.fieldErrors) setErrors(res.fieldErrors);
  };

  const handleConfirmEdit = async () => {
    if (!supplier || !draft) return;
    if (confirmName.trim().toLowerCase() !== supplier.fullName.toLowerCase()) {
      return setConfirmMessage("El nombre no coincide.");
    }
    if (!confirmPassword.trim()) {
      return setConfirmMessage(ADMIN_VALIDATION_MESSAGES.adminPasswordRequired);
    }
    setConfirmMessage(null);
    const res = await onSubmit({ ...draft, confirmPassword }, supplier.id);
    if (!res.success) setConfirmMessage(res.error || "Error al confirmar");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
      <DialogContent className="sa-modal-wide max-h-[92vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center gap-4 text-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              {isEdit ? <SquarePen className="size-6 text-primary" /> : <PlusCircle className="size-6 text-primary" />}
            </div>
            <div>
              {isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}
              {isEdit && supplier && (
                <p className="text-lg font-semibold text-foreground mt-1">{supplier.fullName}</p>
              )}
            </div>
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Revisa cuidadosamente los cambios antes de confirmar."
              : "Completa todos los datos del aliado comercial."}
          </DialogDescription>
        </DialogHeader>

        {isEdit && (
          <div className="mb-8 flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Accordion
              type="single"
              collapsible
              value={openSection}
              onValueChange={(value: string | undefined) => setOpenSection(value ?? "basic")}
              className="w-full space-y-4"
            >
              <AccordionItem value="basic" className="border rounded-2xl overflow-hidden shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5 px-6 text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-primary" />
                    Información Básica
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-8 pt-2">
                  <SupplierBasicCoreFields 
                    supplier={supplier} 
                    errors={errors} 
                    onFieldInput={(name) => setErrors((prev) => ({ ...prev, [name]: undefined }))} 
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="extra" className="border rounded-2xl overflow-hidden shadow-sm">
                <AccordionTrigger className="hover:no-underline py-5 px-6 text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    Información Adicional
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-8 pt-2">
                  <SupplierBasicExtraFields 
                    supplier={supplier} 
                    errors={errors} 
                    onFieldInput={(name) => setErrors((prev) => ({ ...prev, [name]: undefined }))} 
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {isEdit && supplier && (
              <>
                <Separator className="my-8" />
                <div className="bg-muted/50 rounded-2xl p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <ShieldCheck className="size-5 text-primary" />
                    <span className="font-semibold text-lg">Información Actual del Proveedor</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Estado</p>
                      <Badge variant={supplier.isActive ? "default" : "secondary"} className="mt-1.5">
                        {supplier.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Compras realizadas</p>
                      <p className="font-semibold text-lg mt-1">{supplier.purchaseCount ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor total compras</p>
                      <p className="font-semibold text-lg mt-1">
                        Bs. {(supplier.totalPurchaseAmount ?? 0).toLocaleString("es-BO")}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <DialogFooter className="pt-8">
              <Button type="submit" disabled={isPending} size="lg" className="w-full sm:w-auto min-w-[200px]">
                {isPending 
                  ? "Procesando..." 
                  : isEdit 
                    ? "Revisar Cambios" 
                    : "Crear Proveedor"
                }
              </Button>
            </DialogFooter>
          </form>
        ) : (
          /* Paso 2 - Confirmación (sin cambios mayores) */
          <div className="space-y-6">
            <div className="rounded-2xl border p-6">
              <h4 className="font-semibold text-lg mb-5">Resumen de Cambios</h4>
              {changes.length === 0 ? (
                <p className="text-muted-foreground">No se detectaron cambios en los datos.</p>
              ) : (
                <div className="space-y-4">
                  {changes.map((change, index) => (
                    <div key={index} className="flex gap-4 p-4 rounded-xl border bg-muted/30">
                      <div className="w-2 h-2 mt-3 rounded-full bg-primary flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{change.label}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                          <span className="line-through">{change.from || "—"}</span>
                          <span className="text-primary">→</span>
                          <span className="font-medium text-foreground">{change.to || "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                <ShieldCheck className="size-5" />
                Confirmación de Seguridad
              </h4>
              <p className="text-sm text-muted-foreground mb-6">
                Para aplicar los cambios, confirma tu identidad como administrador del sistema.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Nombre completo del proveedor
                  </label>
                  <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={supplier?.fullName ?? ""}
                    className="w-full px-4 py-3 rounded-xl border focus-visible:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Contraseña de administrador
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full px-4 py-3 rounded-xl border focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>

            {confirmMessage && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive text-sm">
                {confirmMessage}
              </div>
            )}

            <DialogFooter className="gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep(1)} size="lg">
                Atrás
              </Button>
              <Button
                onClick={handleConfirmEdit}
                disabled={isPending || !confirmName.trim() || !confirmPassword.trim()}
                size="lg"
                className="min-w-[200px]"
              >
                {isPending ? "Guardando..." : "Confirmar y Guardar Cambios"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}