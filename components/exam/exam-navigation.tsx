"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { FinishExamButton } from "@/components/exam/finish-exam-button";
import { Button } from "@/components/ui/button";
import { selectCanGoBack, selectIsLastQuestion, useExamStore } from "@/lib/useExamStore";

/** Bottom bar: previous (practice only), next, or finish on the last question. */
export function ExamNavigation() {
  const mode = useExamStore((s) => s.mode);
  const canGoBack = useExamStore(selectCanGoBack);
  const isLast = useExamStore(selectIsLastQuestion);
  const nextQuestion = useExamStore((s) => s.nextQuestion);
  const prevQuestion = useExamStore((s) => s.prevQuestion);

  return (
    <nav aria-label="ניווט בין שאלות" className="border-t bg-background">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {mode === "section-practice" ? (
          <Button variant="outline" size="lg" onClick={prevQuestion} disabled={!canGoBack} className="gap-1">
            {/* RTL: "previous" points right */}
            <ChevronRight aria-hidden />
            הקודמת
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">במבחן מלא לא ניתן לחזור לשאלות קודמות.</p>
        )}

        {isLast ? (
          <FinishExamButton size="lg" />
        ) : (
          <Button size="lg" onClick={nextQuestion} className="gap-1">
            הבאה
            <ChevronLeft aria-hidden />
          </Button>
        )}
      </div>
    </nav>
  );
}
