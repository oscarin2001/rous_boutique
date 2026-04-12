import { ProfileAvatarUploader } from "./profile-avatar-uploader";

type Props = {
  fullName: string;
  roleCode: string;
  initials: string;
  photoUrl: string | null;
};

export function ProfileIdentityCard({ fullName, roleCode, initials, photoUrl }: Props) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-sm">
      <div className="flex items-center gap-6">
        <ProfileAvatarUploader initials={initials} photoUrl={photoUrl} className="size-24" />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-semibold tracking-tight">{fullName}</h1>
          <p className="mt-1 text-lg text-muted-foreground font-medium">{roleCode}</p>
        </div>
      </div>
    </div>
  );
}