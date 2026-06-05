import type { Metadata } from "next";
import RequestsTable from "@/components/admin/RequestsTable";

export const metadata: Metadata = { title: "Anfragen – MeinHelfer Admin" };

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Anfragen</h1>
        <p className="text-sm text-muted-foreground">
          Alle eingegangenen Serviceanfragen verwalten.
        </p>
      </div>
      <RequestsTable />
    </div>
  );
}
