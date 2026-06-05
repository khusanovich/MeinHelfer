import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_LABELS } from "@/constants/services";
import { STATUS_LABELS } from "@/constants/status";
import { formatDate, formatTime } from "@/lib/utils";
import type { DashboardResponse } from "@/types/api";
import StatusBadge from "./StatusBadge";

function StatCard({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardStats({ data }: { data: DashboardResponse }) {
  const { overview, this_week, by_service_type, upcoming_scheduled } = data;

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gesamt" value={overview.total_requests} />
        <StatCard
          label="Ausstehend"
          value={overview.pending}
          color="text-yellow-600"
        />
        <StatCard
          label="Bestätigt / Aktiv"
          value={overview.confirmed + overview.in_progress}
          color="text-blue-600"
        />
        <StatCard
          label="Abgeschlossen"
          value={overview.completed}
          color="text-green-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* This week */}
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Diese Woche
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold">{this_week.new_requests}</p>
                <p className="text-sm text-muted-foreground">neue Anfragen</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{this_week.completed}</p>
                <p className="text-sm text-muted-foreground">abgeschlossen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* By service type */}
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Nach Leistungsart
            </p>
            <div className="space-y-2">
              {Object.entries(by_service_type)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {SERVICE_LABELS[type as keyof typeof SERVICE_LABELS] ?? type}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming */}
      {upcoming_scheduled.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Bevorstehende Termine (7 Tage)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Referenz</th>
                    <th className="pb-2 font-medium">Service</th>
                    <th className="pb-2 font-medium">Datum</th>
                    <th className="pb-2 font-medium">Kunde</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming_scheduled.map((r) => (
                    <tr key={r.reference_code} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs text-primary">
                        {r.reference_code}
                      </td>
                      <td className="py-2">{SERVICE_LABELS[r.service_type]}</td>
                      <td className="py-2 text-xs">
                        {formatDate(r.scheduled_date)} · {formatTime(r.scheduled_time)}
                      </td>
                      <td className="py-2">{r.customer_name}</td>
                      <td className="py-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
