"use client";

import { useState } from "react";

import { Trash2 } from "lucide-react";

import type { WarehouseRow } from "@/actions/super-admin/warehouses/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

interface Props {
  row: WarehouseRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
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

export function WarehouseDeleteDialog({ row, open, onOpenChange, onConfirm, isPending }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  if (!row) return null;

  const close = (v: boolean) => {
    if (!v) { setStep(1); setName(""); setPassword(""); }
    onOpenChange(v);
  };

  const ok = name.trim().toLowerCase() === row.name.toLowerCase();

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sa-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="size-5" />
            Eliminar Bodega
          </DialogTitle>
          <DialogDescription>Proceso irreversible en 3 pasos.</DialogDescription>
        </DialogHeader>
        <div className="mb-2 flex gap-2">{[1, 2, 3].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-destructive" : "bg-muted"}`} />)}</div>
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          <p className="mb-1 font-medium text-foreground">Trazabilidad</p>
          <p>Creado por: {row.createdByName ?? "No disponible"}</p>
          <p>Creado el: {fmtDateTime(row.createdAt)}</p>
          <p>Actualizado por: {row.updatedByName ?? "No disponible"}</p>
          <p>Actualizado el: {fmtDateTime(row.updatedAt)}</p>
        </div>
        {step === 1 ? <div className="rounded-md border bg-muted/50 p-3 text-sm">Si la bodega aporta trazabilidad historica, exporta sus reportes antes de eliminarla.</div> : null}
        {step === 2 ? <div className="space-y-2"><Label>Escribe {row.name} para confirmar</Label><Input value={name} onChange={(e) => setName(e.target.value)} /><Label>Contrasena de administrador</Label><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} /></div> : null}
        {step === 3 ? <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Confirmacion final: la bodega y sus asignaciones se eliminaran.</div> : null}
        <DialogFooter><Button variant="outline" onClick={() => close(false)}>Cancelar</Button>{step > 1 ? <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Atras</Button> : null}{step < 3 ? <Button variant="destructive" onClick={() => setStep((s) => s + 1)} disabled={step === 2 && (!ok || !password.trim())}>Siguiente</Button> : <Button variant="destructive" disabled={isPending || !ok || !password.trim()} onClick={() => onConfirm(password)}>{isPending ? "Eliminando..." : "Confirmar Eliminacion"}</Button>}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

