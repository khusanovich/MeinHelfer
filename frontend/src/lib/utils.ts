import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr.substring(0, 5) + " Uhr";
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMinBookingDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}
