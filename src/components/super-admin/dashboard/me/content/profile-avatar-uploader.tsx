"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  initials: string;
  photoUrl: string | null;
  className?: string;
};

export function ProfileAvatarUploader({ initials, photoUrl, className }: Props) {
  return (
    <Avatar className={`ring-1 ring-border/60 ${className ?? ""}`}>
      {photoUrl && <AvatarImage src={photoUrl} alt={`Foto de ${initials}`} />}
      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl font-semibold tracking-tighter">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}