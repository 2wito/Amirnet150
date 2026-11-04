"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  List,
  RotateCcw,
  Search,
  Shuffle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { VOCAB_CATEGORIES, VOCABULARY, type VocabCategory, type VocabEntry } from "@/data/vocabulary";
import { cn } from "@/lib/utils";

type Mode = "list" | "cards";

const KNOWN_STORAGE_KEY = "ez-amirnet:vocab-known";
const CATEGORY_LABEL = Object.fromEntries(VOCAB_CATEGORIES.map((c) => [c.id, c.labelHe])) as Record<
  VocabCategory,
  string
>;

const entryKey = (e: VocabEntry) => `${e.category}:${e.en}`;

/** Deterministic shuffle so a deck keeps its order across re-renders. */
function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let a = seed >>> 0;
  const rand = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Case-insensitive, trimmed form used for search matching. */
const normalize = (s: string) => s.toLowerCase().trim();

/** Words the learner marked as known, kept in localStorage (best-effort). */
function useKnownWords() {
  const [known, setKnown] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KNOWN_STORAGE_KEY);
      if (raw) setKnown(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* storage unavailable: start empty */
    }
  }, []);

  const toggle = useCallback((key: string) => {
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem(KNOWN_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { known, toggle };
}

export function VocabularyExplorer() {
  const [mode, setMode] = useState<Mode>("list");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<VocabCategory | "all">("all");
  const [hideTranslations, setHideTranslations] = useState(false);
  const [hideKnown, setHideKnown] = useState(false);
  const { known, toggle } = useKnownWords();

  const filtered = useMemo(() => {
    const q = normalize(query);
    return VOCABULARY.filter(
      (e) =>
        (category === "all" || e.category === category) &&
        (!hideKnown || !known.has(entryKey(e))) &&
        (!q || normalize(e.en).includes(q) || e.he.includes(q) || normalize(e.example).includes(q)),
    );
  }, [query, category, hideKnown, known]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<VocabCategory, number>> = {};
    for (const e of VOCABULARY) counts[e.category] = (counts[e.category] ?? 0) + 1;
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="glass card-elevated space-y-4 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">חיפוש מילה</span>
            <Search
              className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="חיפוש באנגלית או בעברית…"
              className="h-11 w-full rounded-xl border bg-background/80 ps-9 pe-9 text-base outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="ניקוי חיפוש"
                className="absolute inset-y-0 end-2 my-auto flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </label>

          <div role="group" aria-label="תצוגה" className="flex rounded-xl border bg-muted/60 p-1">
            {(
              [
                { id: "list", label: "רשימה", icon: List },
                { id: "cards", label: "כרטיסיות", icon: Layers },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(id)}
                className={cn(
                  "flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-all duration-200",
                  mode === id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="סינון לפי קטגוריה" className="flex flex-wrap gap-2">
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")} count={VOCABULARY.length}>
            הכול
          </CategoryChip>
          {VOCAB_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(c.id)}
              count={categoryCounts[c.id] ?? 0}
            >
              {c.labelHe}
            </CategoryChip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
          {mode === "list" && (
            <Toggle checked={hideTranslations} onChange={setHideTranslations}>
              הסתרת תרגומים (מצב תרגול)
            </Toggle>
          )}
          <Toggle checked={hideKnown} onChange={setHideKnown}>
            הסתרת מילים שסימנתי כ״יודע/ת״
          </Toggle>
          <span className="ms-auto text-xs text-muted-foreground">
            {known.size} מתוך {VOCABULARY.length} סומנו כידועות
          </span>
        </div>
      </div>

      {category !== "all" && (
        <p className="text-sm text-muted-foreground">
          {VOCAB_CATEGORIES.find((c) => c.id === category)?.descriptionHe}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl px-6 py-16 text-center">
          <p className="font-medium">לא נמצאו מילים</p>
          <p className="mt-1 text-sm text-muted-foreground">נסו מילת חיפוש אחרת או קטגוריה אחרת.</p>
        </div>
      ) : mode === "list" ? (
        <WordList entries={filtered} hideTranslations={hideTranslations} known={known} onToggleKnown={toggle} />
      ) : (
        <Flashcards
          key={`${category}|${query}|${hideKnown}`}
          entries={filtered}
          known={known}
          onToggleKnown={toggle}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    List                                    */
/* -------------------------------------------------------------------------- */

function WordList({
  entries,
  hideTranslations,
  known,
  onToggleKnown,
}: {
  entries: readonly VocabEntry[];
  hideTranslations: boolean;
  known: ReadonlySet<string>;
  onToggleKnown: (key: string) => void;
}) {
  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {entries.length} מילים
      </p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => (
          <WordCard
            key={entryKey(e)}
            entry={e}
            hideTranslation={hideTranslations}
            isKnown={known.has(entryKey(e))}
            onToggleKnown={() => onToggleKnown(entryKey(e))}
          />
        ))}
      </ul>
    </>
  );
}

function WordCard({
  entry,
  hideTranslation,
  isKnown,
  onToggleKnown,
}: {
  entry: VocabEntry;
  hideTranslation: boolean;
  isKnown: boolean;
  onToggleKnown: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const showHe = !hideTranslation || revealed;

  return (
    <li
      className={cn(
        "card-elevated card-hover flex flex-col gap-3 rounded-2xl border bg-card p-4",
        isKnown && "border-success/40 bg-success/[0.04]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div dir="ltr" lang="en" className="flex items-baseline gap-2 font-exam">
          <span className="text-lg font-bold">{entry.en}</span>
          <span className="text-xs text-muted-foreground italic">{entry.pos}</span>
        </div>
        <KnownButton isKnown={isKnown} onClick={onToggleKnown} word={entry.en} />
      </div>

      <div className="min-h-6">
        {showHe ? (
          <p className="font-medium text-primary">{entry.he}</p>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            <Eye className="size-4" aria-hidden />
            הצגת תרגום
          </button>
        )}
      </div>

      <p dir="ltr" lang="en" className="border-s-2 border-primary/20 ps-3 text-start font-exam text-sm text-muted-foreground">
        {entry.example}
      </p>
      <span className="mt-auto w-fit rounded-full bg-muted px-2 py-0.5 text-[0.7rem] text-muted-foreground">
        {CATEGORY_LABEL[entry.category]}
      </span>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Flashcards                                 */
/* -------------------------------------------------------------------------- */

function Flashcards({
  entries,
  known,
  onToggleKnown,
}: {
  entries: readonly VocabEntry[];
  known: ReadonlySet<string>;
  onToggleKnown: (key: string) => void;
}) {
  const [seed, setSeed] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const deck = useMemo(() => (seed == null ? [...entries] : shuffleWithSeed(entries, seed)), [entries, seed]);
  const safeIndex = Math.min(index, deck.length - 1);
  const card = deck[safeIndex];

  const go = useCallback(
    (delta: number) => {
      setFlipped(false);
      setIndex((i) => (Math.min(i, deck.length - 1) + delta + deck.length) % deck.length);
    },
    [deck.length],
  );

  // Keyboard arrows move between cards (RTL: ← is "next"). Space/Enter flip via the card button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      if (e.key === "ArrowLeft") go(1);
      else if (e.key === "ArrowRight") go(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!card) return null;
  const isKnown = known.has(entryKey(card));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between text-sm text-muted-foreground">
        <span aria-live="polite">
          כרטיס <span className="font-semibold text-foreground tabular-nums">{safeIndex + 1}</span> מתוך{" "}
          <span className="tabular-nums">{deck.length}</span>
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={() => {
              setSeed(Math.floor(Math.random() * 2 ** 31));
              setIndex(0);
              setFlipped(false);
            }}
          >
            <Shuffle aria-hidden />
            ערבוב
          </Button>
          {seed != null && (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setSeed(null);
                setIndex(0);
                setFlipped(false);
              }}
            >
              <RotateCcw aria-hidden />
              סדר רגיל
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-brand-gradient transition-[width] duration-300"
          style={{ width: `${((safeIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? `תרגום: ${card.he}. לחצו כדי להפוך חזרה` : `${card.en}. לחצו כדי לראות את התרגום`}
        className="perspective-1000 h-72 w-full cursor-pointer rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-ring/40 sm:h-80"
      >
        <div
          className={cn(
            "preserve-3d relative size-full transition-transform duration-500 ease-out",
            flipped && "rotate-y-180",
          )}
        >
          {/* Front: English */}
          <div className="backface-hidden card-elevated absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border bg-card p-6">
            <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {CATEGORY_LABEL[card.category]}
            </span>
            <span dir="ltr" lang="en" className="font-exam text-4xl font-bold tracking-tight sm:text-5xl">
              {card.en}
            </span>
            <span dir="ltr" className="font-exam text-sm text-muted-foreground italic">
              {card.pos}
            </span>
            <span className="mt-4 text-xs text-muted-foreground">לחצו להצגת התרגום</span>
          </div>
          {/* Back: Hebrew + example */}
          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl bg-brand-gradient p-6 text-white shadow-xl shadow-primary/25">
            <span className="text-3xl font-bold sm:text-4xl">{card.he}</span>
            <span dir="ltr" lang="en" className="max-w-md font-exam text-base text-white/90">
              {card.example}
            </span>
          </div>
        </div>
      </button>

      {/* Controls (RTL: "previous" sits on the right) */}
      <div className="flex w-full items-center justify-between gap-3">
        <Button variant="outline" size="lg" className="h-11 cursor-pointer px-4" onClick={() => go(-1)}>
          <ChevronRight aria-hidden />
          הקודם
        </Button>
        <Button
          size="lg"
          variant={isKnown ? "outline" : "default"}
          className={cn("h-11 cursor-pointer px-5", isKnown && "border-success/50 text-success")}
          onClick={() => onToggleKnown(entryKey(card))}
          aria-pressed={isKnown}
        >
          <Check aria-hidden />
          {isKnown ? "סומן כידוע" : "אני יודע/ת"}
        </Button>
        <Button variant="outline" size="lg" className="h-11 cursor-pointer px-4" onClick={() => go(1)}>
          הבא
          <ChevronLeft aria-hidden />
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        טיפ: אפשר לעבור בין כרטיסים עם החיצים במקלדת.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Small pieces                                */
/* -------------------------------------------------------------------------- */

function CategoryChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-all duration-200",
        active
          ? "border-transparent bg-brand-gradient text-white shadow-md shadow-primary/20"
          : "bg-card/70 text-muted-foreground hover:border-primary/30 hover:text-foreground",
      )}
    >
      {children}
      <span className={cn("text-xs tabular-nums", active ? "text-white/80" : "text-muted-foreground/80")}>
        {count}
      </span>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none">
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-5 w-9 rounded-full bg-muted-foreground/30 transition-colors duration-200 peer-checked:bg-primary peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 after:absolute after:top-0.5 after:start-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:after:-translate-x-4"
      />
      {checked ? <EyeOff className="size-4 text-primary" aria-hidden /> : null}
      <span>{children}</span>
    </label>
  );
}

function KnownButton({ isKnown, onClick, word }: { isKnown: boolean; onClick: () => void; word: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isKnown}
      aria-label={isKnown ? `בטל סימון "${word}" כידועה` : `סמן "${word}" כמילה שאני יודע/ת`}
      title={isKnown ? "סומן כידוע" : "סמן כידוע"}
      className={cn(
        "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors duration-200",
        isKnown
          ? "border-success/50 bg-success text-white"
          : "text-muted-foreground hover:border-success/50 hover:text-success",
      )}
    >
      <Check className="size-4" aria-hidden />
    </button>
  );
}
