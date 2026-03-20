import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden border-l border-border/60 bg-muted md:block">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-4/5 w-4/5">
          <Image
            src="/branding/logo-rous-boutique.jpg"
            alt="Logo de Rous Boutique"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
