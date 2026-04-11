type Props = {
  username: string;
  ci: string;
  phone: string | null;
  profession: string | null;
  timezone: string | null;
  averageSkills: number;
  averageLanguages: number;
  sessionMinutes: number;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words font-medium">{value}</span>
    </div>
  );
}

export function ProfileInfoCard({
  username,
  ci,
  phone,
  profession,
  timezone,
  averageSkills,
  averageLanguages,
  sessionMinutes,
}: Props) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/50 bg-card p-6">
      <InfoRow label="Usuario" value={`@${username}`} />
      <InfoRow label="CI" value={ci} />
      <InfoRow label="Telefono" value={phone || "Sin telefono"} />
      <InfoRow label="Profesion" value={profession || "Sin profesion"} />
      <InfoRow label="Zona" value={timezone ?? "America/La_Paz"} />
      <div className="rounded-lg bg-muted/30 p-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <InfoRow label="Prom. habilidades" value={`${averageSkills}%`} />
          <InfoRow label="Prom. idiomas" value={`${averageLanguages}%`} />
          <InfoRow label="Sesion" value={`${sessionMinutes} min`} />
        </div>
      </div>
    </section>
  );
}
