import Image from "next/image";

export function LoginHero() {
  return (
    <div className="relative hidden overflow-hidden bg-muted md:block">
      <Image
        src="/branding/logo-rous-boutique.jpg"
        alt="Logo de Rous Boutique"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
