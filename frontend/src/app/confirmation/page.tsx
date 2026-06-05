import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConfirmationContent from "./ConfirmationContent";

export const metadata: Metadata = {
  title: "Anfrage bestätigt – MeinHelfer",
};

export default function ConfirmationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-muted/20 py-12">
        <div className="container mx-auto max-w-lg px-4">
          <Suspense fallback={<div className="text-center">Laden…</div>}>
            <ConfirmationContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
