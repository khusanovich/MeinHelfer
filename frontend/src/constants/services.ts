import type { ServiceType } from "@/types/api";

export interface ServiceOption {
  value: ServiceType;
  label: string;
  description: string;
  icon: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  {
    value: "moving",
    label: "Umzug",
    description: "Wohnungs- und Büroumzüge aller Größen",
    icon: "🚚",
  },
  {
    value: "assembly",
    label: "Montage",
    description: "Möbelaufbau, IKEA-Montage und mehr",
    icon: "🔧",
  },
  {
    value: "loading",
    label: "Be-/Entladen",
    description: "Container, LKW oder Lagerräume",
    icon: "📦",
  },
  {
    value: "cleaning",
    label: "Reinigung",
    description: "Grundreinigung, Umzugsreinigung oder regelmäßige Reinigung",
    icon: "🧹",
  },
  {
    value: "gardening",
    label: "Gartenarbeit",
    description: "Rasen mähen, Hecken schneiden, Garten gestalten",
    icon: "🌿",
  },
  {
    value: "general",
    label: "Allgemeine Hilfe",
    description: "Einkaufen, Behördengänge, sonstige Hilfe",
    icon: "🤝",
  },
];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  moving: "Umzug",
  assembly: "Montage",
  loading: "Be-/Entladen",
  cleaning: "Reinigung",
  gardening: "Gartenarbeit",
  general: "Allgemeine Hilfe",
};
