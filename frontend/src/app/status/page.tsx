"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { SERVICE_LABELS } from "@/constants/services";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants/status";
import { formatDate, formatTime } from "@/lib/utils";
import type { RequestStatusResponse } from "@/types/api";

export default function StatusPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RequestStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.getRequestStatus(code.trim().toUpperCase());
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Keine Anfrage mit dieser Referenznummer gefunden.");
      } else {
        setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-muted/20 py-12">
        <div className="container mx-auto max-w-md px-4">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Anfrage prüfen</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Geben Sie Ihre Referenznummer ein, um den Status zu sehen.
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refcode">Referenznummer</Label>
                  <Input
                    id="refcode"
                    placeholder="MH-2026-0001"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono uppercase"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !code.trim()}>
                  {loading ? "Wird gesucht…" : "Status prüfen"}
                </Button>
              </form>

              {error && (
                <div className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-primary">
                      {result.reference_code}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLORS[result.status]}`}
                    >
                      {STATUS_LABELS[result.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Leistung</p>
                      <p className="font-medium">{SERVICE_LABELS[result.service_type]}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Termin</p>
                      <p className="font-medium">
                        {formatDate(result.scheduled_date)} · {formatTime(result.scheduled_time)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Noch keine Anfrage?{" "}
            <Link href="/book" className="text-primary hover:underline">
              Jetzt buchen
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
