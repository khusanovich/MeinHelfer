"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SERVICE_LABELS } from "@/constants/services";
import { formatDate, formatTime } from "@/lib/utils";
import type { BookingFormData } from "@/types/forms";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function ReviewStep({
  formData,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}: {
  formData: Partial<BookingFormData>;
  onSubmit: (data: Partial<BookingFormData>) => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Anfrage überprüfen</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bitte überprüfen Sie Ihre Angaben vor dem Absenden.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Leistung & Termin
        </p>
        <Row
          label="Service"
          value={
            formData.service_type
              ? SERVICE_LABELS[formData.service_type]
              : "–"
          }
        />
        <Row
          label="Datum"
          value={formData.scheduled_date ? formatDate(formData.scheduled_date) : "–"}
        />
        <Row
          label="Uhrzeit"
          value={formData.scheduled_time ? formatTime(formData.scheduled_time) : "–"}
        />
        <Row
          label="Helfer"
          value={`${formData.helper_count ?? "–"} ${formData.helper_count === 1 ? "Person" : "Personen"}`}
        />

        <Separator className="my-3" />

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Adresse
        </p>
        <Row label="Straße" value={formData.address_street ?? "–"} />
        <Row label="PLZ / Stadt" value={`${formData.address_zip ?? ""} ${formData.address_city ?? ""}`} />
        {formData.address_notes && (
          <Row label="Hinweise" value={formData.address_notes} />
        )}

        <Separator className="my-3" />

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kontakt
        </p>
        <Row label="Name" value={formData.customer_name ?? "–"} />
        <Row label="E-Mail" value={formData.customer_email ?? "–"} />
        {formData.customer_phone && (
          <Row label="Telefon" value={formData.customer_phone} />
        )}

        <Separator className="my-3" />

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Beschreibung
        </p>
        <p className="text-sm">{formData.description ?? "–"}</p>
      </div>

      {submitError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          ← Zurück
        </Button>
        <Button
          size="lg"
          onClick={() => onSubmit({})}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gesendet…" : "Anfrage absenden ✓"}
        </Button>
      </div>
    </div>
  );
}
