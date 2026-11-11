"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import {
  BookA,
  CircleHelp,
  ClipboardCheck,
  ListChecks,
  Rocket,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEEN_STORAGE_KEY = "ez-amirnet:welcome-seen";
/** Pages where first-time visitors see the modal automatically. */
const AUTO_OPEN_PATHS = new Set(["/", "/practice"]);

const SECTIONS: readonly { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ClipboardCheck,
    title: "סימולציה מלאה (39 דקות)",
    body: "מבחן רציף של שלושת הפרקים עם זמן קצוב לכל שאלה ומעבר אוטומטי בין הפרקים, בדומה למבנה המבחן. בסיום תקבלו ציון משוער בסולם האמירנט (50–150) ואת רמת האנגלית המתאימה.",
  },
  {
    icon: ListChecks,
    title: "תרגול ממוקד לפי פרק",
    body: "אפשר לתרגל כל חלק בנפרד — השלמת משפטים, ניסוח מחדש או הבנת הנקרא — עם טיימר לפרק כולו ומעבר חופשי קדימה ואחורה בין השאלות.",
  },
  {
    icon: BookA,
    title: "אוצר מילים נפוץ",
    body: "מילים וביטויים נפוצים באנגלית אקדמית, עם חיפוש, סינון לפי קטגוריות, מצב הסתרת תרגום וכרטיסיות שמתהפכות בלחיצה.",
  },
  {
    icon: Rocket,
    title: "איך מתחילים?",
    body: "בחרו מצב למידה בעמוד התרגול, ענו על השאלות, ובסיום תקבלו תחקיר מפורט: התשובה הנכונה, התשובה שלכם והסבר בעברית לכל שאלה.",
  },
];

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(SEEN_STORAGE_KEY) === "1";
  } catch {
    // Storage blocked: treat as seen so the modal doesn't reappear on every page.
    return true;
  }
}

function markWelcomeSeen(): void {
  try {
    localStorage.setItem(SEEN_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * Onboarding modal + its "איך זה עובד?" trigger (rendered in the site header).
 * Opens automatically once for first-time visitors on the home and practice
 * pages; closing it in any way remembers that in localStorage.
 */
export function WelcomeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (AUTO_OPEN_PATHS.has(pathname) && !hasSeenWelcome()) setOpen(true);
  }, [pathname]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) markWelcomeSeen();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="איך זה עובד?"
          className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-3"
        >
          <CircleHelp className="size-4" aria-hidden />
          <span className="hidden sm:inline">איך זה עובד?</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[min(90dvh,48rem)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl shadow-primary/20 outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {/* Header */}
          <div className="relative shrink-0 overflow-hidden bg-brand-gradient px-6 pt-7 pb-6 text-white">
            <div aria-hidden className="pointer-events-none absolute -top-16 -start-16 size-48 rounded-full bg-white/10 blur-2xl" />
            <Dialog.Close
              aria-label="סגירה"
              className="absolute top-4 end-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:ring-3 focus-visible:ring-white/60 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden />
            </Dialog.Close>
            <span className="relative mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <Dialog.Title className="relative text-2xl font-extrabold tracking-tight">
              ברוכים הבאים ל-<span dir="ltr">EZ AMIRNET</span>!
            </Dialog.Title>
            <Dialog.Description className="relative mt-2 text-sm leading-relaxed text-white/90">
              האתר מדמה את מבנה מבחן האמירנט הממוחשב — סוגי השאלות, סדר הפרקים וזמנים משוערים — כדי שתגיעו
              למבחן מוכנים ובביטחון. האתר עצמאי ואינו קשור למאל״ו או לכל גוף רשמי.
            </Dialog.Description>
          </div>

          {/* Body */}
          <ul className="scrollbar-thin min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
            {SECTIONS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5 rounded-2xl border bg-background/60 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="space-y-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="shrink-0 border-t bg-muted/30 px-6 py-4">
            <Dialog.Close asChild>
              <Button
                size="lg"
                className="h-12 w-full cursor-pointer rounded-xl bg-brand-gradient text-base font-semibold shadow-lg shadow-primary/25 hover:opacity-90"
              >
                הבנתי, בואו נתחיל!
              </Button>
            </Dialog.Close>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              אפשר לחזור להסבר הזה בכל רגע דרך ״איך זה עובד?״ בראש העמוד.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
