"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SERVICE_OPTIONS } from "@/constants/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BookingFormData } from "@/types/forms";

const schema = z.object({
  service_type: z.enum(
    ["moving", "assembly", "loading", "cleaning", "gardening", "general"],
    { required_error: "Bitte wählen Sie eine Leistung aus." },
  ),
});

type FormValues = Pick<BookingFormData, "service_type">;

export default function ServiceTypeStep({
  defaultValues,
  onNext,
}: {
  defaultValues?: Partial<BookingFormData>;
  onNext: (data: Partial<BookingFormData>) => void;
}) {
  const { setValue, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { service_type: defaultValues?.service_type },
  });

  const selected = watch("service_type");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Welche Leistung benötigen Sie?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wählen Sie eine Kategorie aus, die am besten zu Ihrem Bedarf passt.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SERVICE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue("service_type", opt.value, { shouldValidate: true })}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/70 hover:bg-accent",
              selected === opt.value
                ? "border-primary bg-primary/5"
                : "border-border",
            )}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="font-semibold">{opt.label}</span>
            <span className="text-xs text-muted-foreground">{opt.description}</span>
          </button>
        ))}
      </div>

      {errors.service_type && (
        <p className="text-sm text-destructive">{errors.service_type.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          Weiter →
        </Button>
      </div>
    </form>
  );
}
