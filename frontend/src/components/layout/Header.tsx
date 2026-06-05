import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">MeinHelfer</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#services"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Leistungen
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            So funktioniert's
          </Link>
          <Link href="/status">
            <Button variant="outline" size="sm">
              Anfrage prüfen
            </Button>
          </Link>
          <Link href="/book">
            <Button size="sm">Jetzt buchen</Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/book">
            <Button size="sm">Buchen</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
