"use client";

import { useRouter } from "next/navigation";
import { useBookingForm } from "@/hooks/useBookingForm";
import FormProgress from "./FormProgress";
import ServiceTypeStep from "./steps/ServiceTypeStep";
import DateTimeStep from "./steps/DateTimeStep";
import AddressStep from "./steps/AddressStep";
import ContactStep from "./steps/ContactStep";
import ReviewStep from "./steps/ReviewStep";
import { Card, CardContent } from "@/components/ui/card";

export default function BookingForm() {
  const router = useRouter();
  const { step, totalSteps, formData, isSubmitting, submitError, next, back, submit } =
    useBookingForm();

  async function handleSubmit() {
    try {
      const result = await submit({});
      router.push(
        `/confirmation?ref=${result.reference_code}&msg=${encodeURIComponent(result.message)}`,
      );
    } catch {
      // submitError is set inside the hook
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="shadow-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8">
            <FormProgress currentStep={step} totalSteps={totalSteps} />
          </div>

          {step === 1 && (
            <ServiceTypeStep defaultValues={formData} onNext={next} />
          )}
          {step === 2 && (
            <DateTimeStep defaultValues={formData} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <AddressStep defaultValues={formData} onNext={next} onBack={back} />
          )}
          {step === 4 && (
            <ContactStep defaultValues={formData} onNext={next} onBack={back} />
          )}
          {step === 5 && (
            <ReviewStep
              formData={formData}
              onSubmit={handleSubmit}
              onBack={back}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
