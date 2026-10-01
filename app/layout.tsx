import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestion du courtage",
  description: "Démonstration interactive du back-office d'une plateforme de courtage en assurance.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
