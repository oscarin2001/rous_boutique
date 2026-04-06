import type { Metadata } from "next";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RousBoutique",
    template: "%s | RousBoutique",
  },
  description: "Tienda de ropa — RousBoutique",
  icons: {
    icon: [{ url: "/branding/logo-rous-boutique.jpg", type: "image/jpeg" }],
    shortcut: ["/branding/logo-rous-boutique.jpg"],
    apple: [{ url: "/branding/logo-rous-boutique.jpg", type: "image/jpeg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

// better-sqlite3
