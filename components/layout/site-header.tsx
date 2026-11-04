"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookA, BookOpenCheck, ClipboardList, House, type LucideIcon } from "lucide-react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { cn } from "@/lib/utils";

const NAV_ITEMS: readonly { href: string; label: string; icon: LucideIcon; hideOnMobile?: boolean }[] = [
  { href: "/", label: "ראשי", icon: House, hideOnMobile: true },
  { href: "/practice", label: "תרגול", icon: ClipboardList },
  { href: "/vocabulary", label: "מילים נפוצות", icon: BookA },
];

/** Sticky frosted header with brand, primary navigation and the onboarding modal trigger. */
export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-primary/25">
            <BookOpenCheck className="size-5" aria-hidden />
          </span>
          <span dir="ltr" className="hidden text-lg font-extrabold tracking-tight text-brand-gradient min-[380px]:inline">
            EZ AMIRNET
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <nav aria-label="ניווט ראשי">
            <ul className="flex items-center gap-1 text-sm">
              {NAV_ITEMS.map(({ href, label, icon: Icon, hideOnMobile }) => {
                const active = isActive(href);
                return (
                  <li key={href} className={cn(hideOnMobile && "hidden sm:block")}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-10 items-center gap-1.5 rounded-lg px-2.5 font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-3",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <WelcomeModal />
        </div>
      </div>
    </header>
  );
}
