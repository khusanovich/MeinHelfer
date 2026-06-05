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
  address_street: z.string().min(3, "Straße und Hausnummer sind erforderlich."),
  address_city: z.string().min(2, "Stadt ist erforderlich."),
  address_zip: z.string().min(4, "Postleitzahl ist erforderlich."),
  address_notes: z.string().max(500).optional(),
});

type FormValues = Pick<
  BookingFormData,
  "address_street" | "address_city" | "address_zip" | "address_notes"
>;

export default function AddressStep({
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
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      address_street: defaultValues?.address_street ?? "",
      address_city: defaultValues?.address_city ?? "",
      address_zip: defaultValues?.address_zip ?? "",
      address_notes: defaultValues?.address_notes ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Wo soll geholfen werden?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Geben Sie die Einsatzadresse ein.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="street">Straße und Hausnummer</Label>
        <Input
          id="street"
          placeholder="Musterstraße 42"
          {...register("address_street")}
        />
        {errors.address_street && (
          <p className="text-xs text-destructive">{errors.address_street.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="zip">Postleitzahl</Label>
          <Input id="zip" placeholder="10115" {...register("address_zip")} />
          {errors.address_zip && (
            <p className="text-xs text-destructive">{errors.address_zip.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Stadt</Label>
          <Input id="city" placeholder="Berlin" {...register("address_city")} />
          {errors.address_city && (
            <p className="text-xs text-destructive">{errors.address_city.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">
          Hinweise zur Adresse{" "}
          <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="notes"
          placeholder="z. B. 3. OG, kein Aufzug, Code 1234"
          {...register("address_notes")}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          ← Zurück
        </Button>
        <Button type="submit" size="lg">
          Weiter →
        </Button>
      </div>
    </form>
  );
}
