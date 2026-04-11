"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  initials: string;
  photoUrl: string | null;
  className?: string;
};

export function ProfileAvatarUploader({ initials, photoUrl, className }: Props) {
  return (
    <Avatar className={className}>
      {photoUrl ? <AvatarImage src={photoUrl} alt="Foto de perfil" /> : null}
      <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
