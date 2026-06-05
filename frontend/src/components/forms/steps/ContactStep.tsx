"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingFormData } from "@/types/forms";

const schema = z.object({
  customer_name: z.string().min(2, "Name ist erforderlich."),
  customer_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  customer_phone: z.string().max(50).optional(),
  description: z
    .string()
    .min(10, "Bitte beschreiben Sie den Auftrag (mindestens 10 Zeichen).")
    .max(2000, "Maximal 2000 Zeichen."),
});

type FormValues = Pick<
  BookingFormData,
  "customer_name" | "customer_email" | "customer_phone" | "description"
>;

export default function ContactStep({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues?: Partial<BookingFormData>;
  onNext: (data: Partial<BookingFormData>) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: defaultValues?.customer_name ?? "",
      customer_email: defaultValues?.customer_email ?? "",
      customer_phone: defaultValues?.customer_phone ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  const description = watch("description") ?? "";

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ihre Kontaktdaten</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Damit wir Sie erreichen können und den Auftrag besser verstehen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Vollständiger Name</Label>
          <Input id="name" placeholder="Anna Müller" {...register("customer_name")} />
          {errors.customer_name && (
            <p className="text-xs text-destructive">{errors.customer_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input
            id="email"
            type="email"
            placeholder="anna@beispiel.de"
            {...register("customer_email")}
          />
          {errors.customer_email && (
            <p className="text-xs text-destructive">{errors.customer_email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Telefonnummer <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+49 151 12345678"
          {...register("customer_phone")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Auftragsbeschreibung</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Beschreiben Sie bitte Ihren Bedarf so genau wie möglich. Z. B. Umfang, besondere Anforderungen, Gewichte, Stockwerke usw."
          className="resize-none"
          {...register("description")}
        />
        <div className="flex justify-between">
          {errors.description ? (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-muted-foreground">{description.length}/2000</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="submit" size="lg">
          Weiter zur Überprüfung →
        </Button>
      </div>
    </form>
  );
}
