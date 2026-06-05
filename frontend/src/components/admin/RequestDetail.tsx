"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_LABELS } from "@/constants/services";
import { STATUS_OPTIONS } from "@/constants/status";
import { api } from "@/lib/api";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import type { AdminRequestDetail as RequestDetailType, RequestStatus } from "@/types/api";
import StatusBadge from "./StatusBadge";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium sm:text-right">{value ?? "–"}</span>
    </div>
  );
}

export default function RequestDetail({ initial }: { initial: RequestDetailType }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<RequestStatus>(initial.status);
  const [helper, setHelper] = useState(initial.assigned_helper ?? "");
  const [notes, setNotes] = useState(initial.admin_notes ?? "");
  const [price, setPrice] = useState(initial.estimated_price?.toString() ?? "");
  const [hours, setHours] = useState(initial.estimated_hours?.toString() ?? "");

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateRequest(initial.id, {
        status: status !== initial.status ? status : undefined,
        assigned_helper: helper || undefined,
        admin_notes: notes || undefined,
        estimated_price: price ? parseFloat(price) : undefined,
        estimated_hours: hours ? parseFloat(hours) : undefined,
      });
      toast.success("Anfrage aktualisiert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: request details */}
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardContent className="divide-y p-5">
            <div className="pb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-lg font-bold text-primary">
                  {initial.reference_code}
                </h2>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Eingegangen: {formatDateTime(initial.created_at)}
              </p>
            </div>

            <div className="py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Leistung & Termin
              </p>
              <InfoRow label="Service" value={SERVICE_LABELS[initial.service_type]} />
              <InfoRow label="Helfer" value={`${initial.helper_count} Person(en)`} />
              <InfoRow
                label="Datum"
                value={`${formatDate(initial.scheduled_date)} · ${formatTime(initial.scheduled_time)}`}
              />
            </div>

            <div className="py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Adresse
              </p>
              <InfoRow label="Straße" value={initial.address.street} />
              <InfoRow
                label="PLZ / Stadt"
                value={`${initial.address.zip} ${initial.address.city}`}
              />
              {initial.address.notes && (
                <InfoRow label="Hinweise" value={initial.address.notes} />
              )}
            </div>

            <div className="py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Kundendaten
              </p>
              <InfoRow label="Name" value={initial.customer.name} />
              <InfoRow label="E-Mail" value={initial.customer.email} />
              {initial.customer.phone && (
                <InfoRow label="Telefon" value={initial.customer.phone} />
              )}
            </div>

            <div className="py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Beschreibung
              </p>
              <p className="whitespace-pre-wrap text-sm">{initial.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Status history */}
        {initial.status_history.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Statusverlauf
              </p>
              <div className="space-y-2">
                {initial.status_history.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                    <span>
                      {log.old_status ? (
                        <>
                          <StatusBadge status={log.old_status} />
                          {" → "}
                        </>
                      ) : null}
                      <StatusBadge status={log.new_status} />
                      {log.note && (
                        <span className="ml-2 text-muted-foreground">· {log.note}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: actions */}
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-semibold">Anfrage bearbeiten</p>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zugewiesener Helfer</Label>
              <Input
                placeholder="Name des Helfers"
                value={helper}
                onChange={(e) => setHelper(e.target.value)}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preis (€)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Stunden</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="0.0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Interne Notizen</Label>
              <Textarea
                placeholder="Notizen (nur für Admin sichtbar)"
                rows={3}
                className="resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Wird gespeichert…" : "Speichern"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
