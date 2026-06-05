import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-primary">MeinHelfer</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Zuverlässige Helfer für Umzug, Montage, Reinigung und mehr.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Leistungen
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Umzug</li>
              <li>Möbelmontage</li>
              <li>Be-/Entladen</li>
              <li>Reinigung</li>
              <li>Gartenarbeit</li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Hilfe
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/status" className="text-muted-foreground hover:text-foreground">
                  Anfrage prüfen
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-muted-foreground hover:text-foreground">
                  Jetzt buchen
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} MeinHelfer. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
