import type { RequestStatus } from "@/types/api";

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export const STATUS_OPTIONS: Array<{ value: RequestStatus; label: string }> = [
  { value: "pending", label: "Ausstehend" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
];
