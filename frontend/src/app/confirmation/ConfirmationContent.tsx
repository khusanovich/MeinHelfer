"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmationContent() {
  const params = useSearchParams();
  const refCode = params.get("ref") ?? "–";
  const message = params.get("msg")
    ? decodeURIComponent(params.get("msg")!)
    : "Ihre Anfrage wurde erfolgreich übermittelt.";

  return (
    <Card className="shadow-md">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-green-700">Anfrage erhalten!</h1>
        <p className="mt-3 text-muted-foreground">{message}</p>

        <div className="my-6 rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Ihre Referenznummer</p>
          <p className="mt-1 text-2xl font-mono font-bold tracking-wider text-primary">
            {refCode}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Bitte notieren Sie diese Nummer für Rückfragen.
          </p>
        </div>

        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>Wir werden uns in Kürze per E-Mail bei Ihnen melden.</p>
          <p>Typische Antwortzeit: innerhalb von 2–4 Stunden.</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/status">
            <Button variant="outline">Anfrage verfolgen</Button>
          </Link>
          <Link href="/">
            <Button>Zurück zur Startseite</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
