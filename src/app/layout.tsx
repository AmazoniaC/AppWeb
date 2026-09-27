import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amazonia Concrete · ERP",
  description: "ERP de Amazonia Concrete",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
