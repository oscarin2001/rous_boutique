"use client";

import { useState } from "react";

import { AlertTriangle, Trash2 } from "lucide-react";

import type { SupplierRow } from "@/actions/super-admin/suppliers/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface Props {
  supplier: SupplierRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (confirmPassword: string, reason: string) => void;
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

export function SupplierDeleteDialog({ supplier, open, onOpenChange, onConfirm, isPending }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!supplier) return null;

  const expectedName = supplier.fullName.toLowerCase();
  const nameMatches = confirmation.trim().toLowerCase() === expectedName;
  const reasonValid = reason.trim().length >= 10 && reason.trim().length <= 160;

  const handleClose = (v: boolean) => {
    if (!v) {
      setConfirmation("");
      setPassword("");
      setReason("");
      setStep(1);
      setError(null);
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            <AlertTriangle className="size-4" />
            Eliminar Proveedor
          </DialogTitle>
          <DialogDescription>
            Acción irreversible. Se eliminará al proveedor <strong>{supplier.fullName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-destructive" : "bg-muted"}`} />
          ))}
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-foreground">Información del Proveedor</p>
              <p><strong>Nombre:</strong> {supplier.fullName}</p>
              <p><strong>Teléfono:</strong> {supplier.phone || "No registrado"}</p>
              <p><strong>Email:</strong> {supplier.email || "No registrado"}</p>
              <p><strong>CI:</strong> {supplier.ci || "No registrado"}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Estadísticas</p>
              <p><strong>Compras:</strong> {supplier.purchaseCount}</p>
              <p><strong>Monto Total:</strong> Bs. {supplier.totalPurchaseAmount.toLocaleString()}</p>
              <p><strong>Sucursales:</strong> {supplier.branches.length}</p>
              <p><strong>Gerentes:</strong> {supplier.managers.length}</p>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/50 p-4 text-sm">
              <h4 className="font-medium mb-2 text-destructive">⚠️ Acción Irreversible</h4>
              <p>Eliminar un proveedor es una acción permanente que afectará el sistema de la siguiente manera:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>El proveedor será marcado como eliminado y ya no aparecerá en listas activas</li>
                <li>Sus datos personales permanecerán en el historial de auditoría</li>
                <li>Si tiene compras históricas, estas se mantendrán para integridad financiera</li>
                <li>Si no tiene compras, sus asignaciones a sucursales y gerentes serán removidas</li>
              </ul>
            </div>
            <div className="rounded-md border bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
              <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">💡 Consideraciones</h4>
              <p>Antes de proceder, verifica:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>¿Este proveedor tiene compras pendientes o en proceso?</li>
                <li>¿Es un error de registro o un proveedor que ya no opera?</li>
                <li>¿Los datos son necesarios para cumplimiento tributario?</li>
              </ul>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="space-y-4">
            <div className="rounded-md border bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
              <h4 className="font-medium mb-2 text-amber-800 dark:text-amber-200">📊 Análisis de Impacto</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>Compras realizadas:</strong> {supplier.purchaseCount}</p>
                  <p><strong>Valor total:</strong> Bs. {supplier.totalPurchaseAmount.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>Asignaciones activas:</strong></p>
                  <p>• {supplier.branches.length} sucursales</p>
                  <p>• {supplier.managers.length} gerentes</p>
                </div>
              </div>
              {supplier.purchaseCount > 0 ? (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded border">
                  <p className="text-green-800 dark:text-green-200 font-medium">✅ Se conservarán las asignaciones</p>
                  <p className="text-sm text-muted-foreground">Este proveedor tiene historial de compras, por lo que sus relaciones se mantendrán para integridad de datos.</p>
                </div>
              ) : (
                <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded border">
                  <p className="text-orange-800 dark:text-orange-200 font-medium">⚠️ Se removerán las asignaciones</p>
                  <p className="text-sm text-muted-foreground">Sin historial de compras, las asignaciones serán eliminadas completamente.</p>
                </div>
              )}
            </div>
          </div>
        ) : step === 3 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Razón de eliminación (obligatoria)</Label>
              <textarea
                className="w-full min-h-[80px] p-3 border rounded-md text-sm resize-none"
                placeholder="Describe detalladamente por qué se está eliminando este proveedor..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {reason.length}/160 caracteres. Mínimo 10 caracteres.
              </p>
            </div>
          </div>
        ) : step === 4 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm">Confirma escribiendo: <strong>{supplier.fullName}</strong></Label>
                <Input
                  value={confirmation}
                  onChange={e => setConfirmation(e.target.value)}
                  placeholder={`Escribe "${supplier.fullName}" para confirmar`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Contraseña de administrador</Label>
                <PasswordInput
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                />
              </div>
            </div>
          </div>
        ) : step === 5 ? (
          <div className="space-y-4">
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <h4 className="font-medium mb-3 text-destructive flex items-center gap-2">
                <span className="text-lg">🚨</span>
                Confirmación Final
              </h4>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Proveedor a eliminar:</strong> {supplier.fullName}</p>
                <p><strong>Razón:</strong> {reason.trim()}</p>
                <p><strong>Impacto:</strong> {supplier.purchaseCount > 0 ? "Conservar historial y asignaciones" : "Eliminar completamente"}</p>
                <p><strong>Esta acción no se puede deshacer.</strong></p>
              </div>
            </div>
          </div>
        ) : step === 6 ? (
          <div className="space-y-4">
            <div className="rounded-md border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
              <h4 className="font-medium mb-3 text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <span className="text-lg">🔍</span>
                Verificación del Sistema
              </h4>
              <div className="space-y-3 text-muted-foreground">
                <p>El sistema ha verificado la integridad de los datos relacionados:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Compras activas:</strong> {supplier.purchaseCount > 0 ? "Detectadas - se conservarán" : "Ninguna - eliminación completa"}</li>
                  <li><strong>Asignaciones:</strong> {supplier.branches.length + supplier.managers.length} relaciones identificadas</li>
                  <li><strong>Auditoría:</strong> Registro de eliminación será creado</li>
                  <li><strong>Permisos:</strong> Solo administradores pueden realizar esta acción</li>
                </ul>
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded border">
                  <p className="text-green-800 dark:text-green-200 font-medium">✅ Sistema listo para eliminación</p>
                  <p className="text-sm">Todos los chequeos han pasado correctamente.</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        <DialogFooter>
           <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
           {step > 1 && <Button variant="outline" onClick={() => setStep(s => s - 1)}>Atrás</Button>}
           
           {step < 6 ? (
             <Button
               variant="destructive"
               onClick={() => setStep(s => s + 1)}
               disabled={
                 (step === 3 && !reasonValid) ||
                 (step === 4 && (!nameMatches || !password.trim()))
               }
             >
               Siguiente
             </Button>
           ) : (
               <Button
                 variant="destructive"
                 onClick={() => onConfirm(password, reason.trim())}
                 disabled={isPending || !nameMatches || !password.trim() || !reasonValid}
               >
                 {isPending ? "Eliminando..." : "Eliminar Proveedor"}
               </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

