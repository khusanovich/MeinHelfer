"use client";

import DashboardStats, {
  DashboardStatsSkeleton,
} from "@/components/admin/DashboardStats";
import { useDashboard } from "@/hooks/useRequests";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Übersicht aller Anfragen und Aktivitäten.
        </p>
      </div>

      {isLoading && <DashboardStatsSkeleton />}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Fehler beim Laden der Daten.
        </div>
      )}
      {data && <DashboardStats data={data} />}
    </div>
  );
}
