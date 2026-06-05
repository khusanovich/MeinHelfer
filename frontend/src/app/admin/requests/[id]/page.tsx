"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RequestDetail from "@/components/admin/RequestDetail";
import { useRequest } from "@/hooks/useRequests";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useRequest(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/requests"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Zurück zur Liste
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Anfrage Details</h1>
        <p className="text-sm text-muted-foreground">
          Status aktualisieren, Helfer zuweisen und Notizen hinzufügen.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center text-sm text-destructive">
          Anfrage konnte nicht geladen werden. Bitte prüfen Sie die ID oder versuchen Sie es erneut.
        </div>
      )}

      {data && <RequestDetail initial={data} />}
    </div>
  );
}
