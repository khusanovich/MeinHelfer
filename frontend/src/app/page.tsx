import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SERVICE_OPTIONS } from "@/constants/services";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Anfrage stellen",
    desc: "Füllen Sie unser einfaches Formular aus — in weniger als 3 Minuten.",
  },
  {
    step: "2",
    title: "Bestätigung erhalten",
    desc: "Wir melden uns persönlich und bestätigen Ihren Termin.",
  },
  {
    step: "3",
    title: "Helfer kommt zu Ihnen",
    desc: "Unser geprüfter Helfer erscheint pünktlich und erledigt die Arbeit.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 py-24">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Zuverlässige Helfer für{" "}
            <span className="text-primary">jeden Bedarf</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Umzug, Möbelmontage, Reinigung, Gartenarbeit und mehr — wir schicken
            Ihnen persönlich ausgewählte, vertrauenswürdige Helfer.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/book">
              <Button size="lg" className="px-8 text-base">
                Jetzt Helfer buchen
              </Button>
            </Link>
            <Link href="/status">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Anfrage prüfen
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Kostenlose Anfrage · Kein Konto erforderlich
          </p>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Unsere Leistungen</h2>
            <p className="mt-3 text-muted-foreground">
              Wir helfen Ihnen bei all Ihren alltäglichen Aufgaben.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_OPTIONS.map((service) => (
              <Card
                key={service.value}
                className="group transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-3 text-3xl">{service.icon}</div>
                  <h3 className="text-lg font-semibold">{service.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/book">
              <Button size="lg">Anfrage stellen</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">So einfach geht's</h2>
            <p className="mt-3 text-muted-foreground">
              In nur drei Schritten zu Ihrem persönlichen Helfer.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-16">
        <div className="container mx-auto max-w-6xl px-4 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Bereit loszulegen?</h2>
          <p className="mt-3 text-primary-foreground/80">
            Stellen Sie jetzt Ihre kostenlose Anfrage — wir melden uns schnell.
          </p>
          <Link href="/book">
            <Button
              size="lg"
              variant="secondary"
              className="mt-6 px-10 text-base"
            >
              Jetzt buchen
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
