"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { RequestCreatedResponse } from "@/types/api";
import type { BookingFormData, BookingStep } from "@/types/forms";

export function useBookingForm() {
  const [step, setStep] = useState<BookingStep>(1);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = 5;

  function next(data: Partial<BookingFormData>) {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => (Math.min(prev + 1, totalSteps) as BookingStep));
  }

  function back() {
    setStep((prev) => (Math.max(prev - 1, 1) as BookingStep));
  }

  async function submit(data: Partial<BookingFormData>): Promise<RequestCreatedResponse> {
    const full = { ...formData, ...data } as BookingFormData;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await api.createRequest({
        service_type: full.service_type,
        helper_count: full.helper_count,
        scheduled_date: full.scheduled_date,
        scheduled_time: full.scheduled_time,
        address: {
          street: full.address_street,
          city: full.address_city,
          zip: full.address_zip,
          notes: full.address_notes || undefined,
        },
        customer: {
          name: full.customer_name,
          email: full.customer_email,
          phone: full.customer_phone || undefined,
        },
        description: full.description,
      });
      return result;
    } catch (err) {
      const message =
        err instanceof ApiError ? err.detail : "Ein Fehler ist aufgetreten.";
      setSubmitError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    step,
    totalSteps,
    formData,
    isSubmitting,
    submitError,
    next,
    back,
    submit,
  };
}
