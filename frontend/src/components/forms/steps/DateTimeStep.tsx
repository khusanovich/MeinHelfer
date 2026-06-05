"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getMinBookingDate } from "@/lib/utils";
import type { BookingFormData } from "@/types/forms";

const schema = z.object({
  scheduled_date: z
    .string()
    .min(1, "Datum ist erforderlich")
    .refine((d) => new Date(d) > new Date(), {
      message: "Das Datum muss in der Zukunft liegen.",
    }),
  scheduled_time: z
    .string()
    .min(1, "Uhrzeit ist erforderlich")
    .refine((t) => {
      const [h] = t.split(":").map(Number);
      return h >= 7 && h <= 20;
    }, { message: "Bitte wählen Sie eine Zeit zwischen 07:00 und 20:00 Uhr." }),
  helper_count: z
    .number({ coerce: true })
    .int()
    .min(1, "Mindestens 1 Helfer")
    .max(10, "Maximal 10 Helfer"),
});

type FormValues = Pick<BookingFormData, "scheduled_date" | "scheduled_time" | "helper_count">;

export default function DateTimeStep({
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
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduled_date: defaultValues?.scheduled_date ?? "",
      scheduled_time: defaultValues?.scheduled_time ?? "09:00",
      helper_count: defaultValues?.helper_count ?? 1,
    },
  });

  const helperCount = watch("helper_count");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Wann brauchen Sie Hilfe?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wählen Sie Datum, Uhrzeit und Anzahl der Helfer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            min={getMinBookingDate()}
            {...register("scheduled_date")}
          />
          {errors.scheduled_date && (
            <p className="text-xs text-destructive">{errors.scheduled_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Uhrzeit</Label>
          <Input id="time" type="time" min="07:00" max="20:00" {...register("scheduled_time")} />
          {errors.scheduled_time && (
            <p className="text-xs text-destructive">{errors.scheduled_time.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Anzahl der Helfer</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setValue("helper_count", Math.max(1, helperCount - 1))}
          >
            −
          </Button>
          <span className="w-8 text-center text-lg font-semibold">{helperCount}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setValue("helper_count", Math.min(10, helperCount + 1))}
          >
            +
          </Button>
          <span className="text-sm text-muted-foreground">
            {helperCount === 1 ? "1 Helfer" : `${helperCount} Helfer`}
          </span>
        </div>
        {errors.helper_count && (
          <p className="text-xs text-destructive">{errors.helper_count.message}</p>
        )}
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
