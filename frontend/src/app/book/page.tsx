import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/forms/BookingForm";

export const metadata: Metadata = {
  title: "Jetzt buchen – MeinHelfer",
  description: "Stellen Sie Ihre kostenlose Anfrage für einen zuverlässigen Helfer.",
};

export default function BookPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">Helfer buchen</h1>
            <p className="mt-2 text-muted-foreground">
              Kostenlose Anfrage · Kein Konto erforderlich · Schnelle Rückmeldung
            </p>
          </div>
          <BookingForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
