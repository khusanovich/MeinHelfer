"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SERVICE_LABELS } from "@/constants/services";
import { STATUS_OPTIONS } from "@/constants/status";
import { useRequests } from "@/hooks/useRequests";
import { formatDate, formatTime } from "@/lib/utils";
import type { RequestStatus } from "@/types/api";
import StatusBadge from "./StatusBadge";

export default function RequestsTable() {
  const [status, setStatus] = useState<RequestStatus | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRequests({ status: status || undefined, search, page });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Name, E-Mail oder Referenz suchen…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : (v as RequestStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Referenz</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Termin</th>
              <th className="px-4 py-3 font-medium">Kunde</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Helfer</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Keine Anfragen gefunden.
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.items.map((req) => (
                <tr
                  key={req.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    {req.reference_code}
                  </td>
                  <td className="px-4 py-3">{SERVICE_LABELS[req.service_type]}</td>
                  <td className="px-4 py-3 text-xs">
                    {formatDate(req.scheduled_date)}{" "}
                    <span className="text-muted-foreground">
                      {formatTime(req.scheduled_time)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{req.customer_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {req.customer_email}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {req.assigned_helper ?? "–"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/requests/${req.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {data.total} Einträge · Seite {data.page} von {data.pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Zurück
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Weiter →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
