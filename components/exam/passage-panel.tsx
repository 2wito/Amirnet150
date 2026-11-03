"use client";

import { useState } from "react";
import { AArrowDown, AArrowUp } from "lucide-react";
import { EnglishContent } from "@/components/exam/english-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Passage } from "@/types/exam";

const FONT_STEPS = ["text-sm leading-6", "text-base leading-7", "text-lg leading-8", "text-xl leading-9"] as const;
const DEFAULT_STEP = 1;
const FONT_STORAGE_KEY = "amirnet-passage-font-step";

function readStoredStep(): number {
  try {
    const n = Number(window.localStorage.getItem(FONT_STORAGE_KEY));
    return Number.isInteger(n) && n >= 0 && n < FONT_STEPS.length ? n : DEFAULT_STEP;
  } catch {
    return DEFAULT_STEP;
  }
}

/**
 * Scrollable reading passage with numbered paragraphs and font-size controls.
 * Passage text is strictly LTR; the toolbar is Hebrew RTL. The chosen font
 * size is remembered in localStorage for this browser.
 *
 * Only rendered on the client after the exam store loads, so reading
 * localStorage during the first render is safe.
 */
export function PassagePanel({ passage, className }: { passage: Passage; className?: string }) {
  const [step, setStep] = useState(readStoredStep);

  const changeStep = (delta: number) => {
    setStep((prev) => {
      const next = Math.min(FONT_STEPS.length - 1, Math.max(0, prev + delta));
      try {
        window.localStorage.setItem(FONT_STORAGE_KEY, String(next));
      } catch {
        /* storage unavailable: keep the in-memory value */
      }
      return next;
    });
  };

  return (
    <section
      aria-label="קטע קריאה"
      className={cn("flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card", className)}
    >
      <div dir="rtl" className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">קטע קריאה</span>
        <div role="group" aria-label="גודל גופן" className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => changeStep(-1)}
            disabled={step === 0}
            aria-label="הקטנת גופן"
          >
            <AArrowDown aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => changeStep(1)}
            disabled={step === FONT_STEPS.length - 1}
            aria-label="הגדלת גופן"
          >
            <AArrowUp aria-hidden />
          </Button>
        </div>
      </div>

      <EnglishContent
        // Focusable so keyboard users can scroll the passage.
        tabIndex={0}
        className={cn(
          "scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-7",
          FONT_STEPS[step],
        )}
      >
        <h2 className="mb-5 text-center font-bold">{passage.title}</h2>
        <ol className="space-y-4">
          {passage.paragraphs.map((text, i) => (
            <li key={i} className="grid grid-cols-[2rem_1fr] gap-1">
              <span className="select-none pt-px text-[0.8em] font-medium text-muted-foreground">({i + 1})</span>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </EnglishContent>
    </section>
  );
}
