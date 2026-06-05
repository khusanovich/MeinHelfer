import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import RequestDetail from "@/components/admin/RequestDetail";
import { api } from "@/lib/api";

export const metadata: Metadata = { title: "Anfrage Details – MeinHelfer Admin" };

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let request;
  try {
    request = await api.getRequest(id);
  } catch {
    notFound();
  }

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

      <RequestDetail initial={request} />
    </div>
  );
}
