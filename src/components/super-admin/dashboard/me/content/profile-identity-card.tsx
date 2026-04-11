import { ProfileAvatarUploader } from "@/components/super-admin/dashboard/me/content/profile-avatar-uploader";

type Props = {
  fullName: string;
  roleCode: string;
  initials: string;
  photoUrl: string | null;
};

export function ProfileIdentityCard({ fullName, roleCode, initials, photoUrl }: Props) {
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-6">
      <div className="flex items-center gap-4">
        <ProfileAvatarUploader initials={initials} photoUrl={photoUrl} className="size-20" />
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold">{fullName}</h2>
          <p className="text-sm text-muted-foreground">{roleCode}</p>
        </div>
      </div>
    </section>
  );
}
