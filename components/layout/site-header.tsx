import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "ראשי" },
  { href: "/practice", label: "תרגול וסימולציות" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <BookOpenCheck className="size-5" aria-hidden />
          <span dir="ltr" className="font-extrabold tracking-tight">EZ AMIRNET</span>
        </Link>
        <nav aria-label="ניווט ראשי">
          <ul className="flex items-center gap-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
