import { cn } from "@/lib/utils";

const STEP_LABELS = ["Service", "Termin", "Adresse", "Kontakt", "Überprüfung"];

export default function FormProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>Schritt {currentStep} von {totalSteps}</span>
        <span>{STEP_LABELS[currentStep - 1]}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i + 1 < currentStep
                  ? "bg-primary text-primary-foreground"
                  : i + 1 === currentStep
                    ? "border-2 border-primary text-primary"
                    : "border border-muted-foreground/30 text-muted-foreground/50",
              )}
            >
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-[10px] md:block",
                i + 1 === currentStep
                  ? "font-semibold text-primary"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
