import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MeinHelfer – Zuverlässige Hilfe für jeden Bedarf",
  description:
    "Buchen Sie professionelle Helfer für Umzug, Montage, Reinigung und mehr. Schnell, einfach und zuverlässig.",
  keywords: "Umzug, Helfer, Montage, Reinigung, Gartenarbeit, Haushaltshilfe",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
