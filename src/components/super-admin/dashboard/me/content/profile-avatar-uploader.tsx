"use client";

import { type ChangeEvent, useRef, useState } from "react";

import { Camera } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

import { uploadSuperAdminProfilePhotoAction } from "@/actions/super-admin/user-settings/actions";

import { Button } from "@/components/ui/button";

type Props = {
  initials: string;
  photoUrl: string | null;
};

export function ProfileAvatarUploader({ initials, photoUrl }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onPickFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadSuperAdminProfilePhotoAction(file);
    setIsUploading(false);
    event.target.value = "";

    if (!result.success) {
      toast.error(result.error ?? "No se pudo subir la foto");
      return;
    }

    toast.success("Foto actualizada");
    router.refresh();
  };

  return (
    <div className="relative grid size-20 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground text-xl font-bold">
      {photoUrl ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photoUrl})` }} />
      ) : null}
      {!photoUrl ? initials : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onPickFile}
      />
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        className="absolute right-0 bottom-0 rounded-full"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="size-3.5" />
        <span className="sr-only">Subir foto</span>
      </Button>
    </div>
  );
}
