type Props = {
  username: string;
  ci: string;
  phone: string | null;
  profession: string | null;
  timezone: string;
  averageSkills: number;
  averageLanguages: number;
  sessionMinutes: number;
};

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border/50 last:border-0 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 break-all text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function formatVisibleUsername(username: string) {
  const value = username.trim();
  if (!value) return "@oculto";
  const localPart = value.includes("@") ? (value.split("@")[0] || "oculto") : value;
  return `@${localPart}`;
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
  const visibleUsername = formatVisibleUsername(username);

  return (
    <div className="min-w-0 rounded-3xl border border-border/60 bg-card p-8 shadow-sm space-y-6">
      <div className="space-y-4">
        <InfoRow label="Usuario" value={visibleUsername} />
        <InfoRow label="CI" value={ci} />
        <InfoRow label="Teléfono" value={phone || "—"} />
        <InfoRow label="Profesión" value={profession || "—"} />
        <InfoRow label="Zona horaria" value={timezone} />
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Promedios</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-emerald-600">{averageSkills}%</div>
            <div className="text-[10px] text-muted-foreground">Habilidades</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-600">{averageLanguages}%</div>
            <div className="text-[10px] text-muted-foreground">Idiomas</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{sessionMinutes}</div>
            <div className="text-[10px] text-muted-foreground">min sesión</div>
          </div>
        </div>
      </div>
    </div>
  );
}