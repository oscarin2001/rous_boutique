export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Navbar de la tienda pública irá aquí */}
      <main>{children}</main>
      {/* Footer irá aquí */}
    </div>
  );
}
