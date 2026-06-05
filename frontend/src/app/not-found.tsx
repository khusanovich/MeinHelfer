import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <p className="text-7xl font-extrabold text-primary">404</p>
        <h1 className="text-2xl font-semibold">Seite nicht gefunden</h1>
        <p className="max-w-sm text-muted-foreground">
          Die gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/">
          <Button>Zur Startseite</Button>
        </Link>
        <Link href="/status">
          <Button variant="outline">Anfrage prüfen</Button>
        </Link>
      </div>
    </div>
  );
}
