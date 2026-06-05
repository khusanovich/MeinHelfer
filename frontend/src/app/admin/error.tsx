"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Fehler beim Laden</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Die Seite konnte nicht geladen werden. Versuchen Sie es erneut oder gehen Sie zum Dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={reset}>Erneut versuchen</Button>
        <Link href="/admin/dashboard">
          <Button variant="outline">Zum Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
