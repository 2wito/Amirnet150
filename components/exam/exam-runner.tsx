"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExamHeader } from "@/components/exam/exam-header";
import { ExamNavigation } from "@/components/exam/exam-navigation";
import { QuestionCard } from "@/components/exam/question-card";
import { Button } from "@/components/ui/button";
import { useExamHydration } from "@/lib/useExamHydration";
import {
  selectCurrentAnswer,
  selectCurrentQuestion,
  selectQuestionNumber,
  useExamStore,
} from "@/lib/useExamStore";
import { useExamTimer } from "@/lib/useExamTimer";
import { cn } from "@/lib/utils";
import type { OptionIndex } from "@/types/exam";

/** Top-level exam screen: loads saved state, runs the clock, and shows the right view. */
export function ExamRunner() {
  const hydrated = useExamHydration();
  const status = useExamStore((s) => s.status);
  const router = useRouter();
  useExamTimer();

  // Finishing (manually or on time-up) sends the user to the results dashboard.
  useEffect(() => {
    if (hydrated && status === "completed") router.replace("/exam/results");
  }, [hydrated, status, router]);

  if (!hydrated || status === "completed") {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        {status === "completed" ? "מעבר לתוצאות…" : "טוען מבחן…"}
      </div>
    );
  }
  if (status === "idle") return <NoActiveExam />;
  return <ActiveExam />;
}

function ActiveExam() {
  const question = useExamStore(selectCurrentQuestion);
  const questionNumber = useExamStore(selectQuestionNumber);
  const selectedIndex = useExamStore(selectCurrentAnswer);
  const selectAnswer = useExamStore((s) => s.selectAnswer);
  const mainRef = useRef<HTMLElement>(null);

  // Start each new question scrolled to the top.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [question?.id]);

  // Keys 1–4 select an answer.
  useEffect(() => {
    if (!question) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("[role='alertdialog'], textarea, [contenteditable='true'], input[type='text']"))
        return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= 4) selectAnswer(question.id, n - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, selectAnswer]);

  if (!question) return <NoActiveExam />;
  const isReading = question.type === "reading-comprehension";

  return (
    <div className="flex h-dvh flex-col">
      <ExamHeader />
      <main ref={mainRef} className={cn("min-h-0 flex-1 overflow-y-auto", isReading && "lg:overflow-hidden")}>
        <div
          className={cn("mx-auto w-full px-4 py-6 sm:py-8", isReading ? "max-w-7xl lg:h-full" : "max-w-3xl")}
        >
          <QuestionCard
            question={question}
            questionNumber={questionNumber}
            selectedIndex={selectedIndex}
            onSelect={(index: OptionIndex) => selectAnswer(question.id, index)}
          />
        </div>
      </main>
      <ExamNavigation />
    </div>
  );
}

function NoActiveExam() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">אין מבחן פעיל</h1>
      <p className="text-sm text-muted-foreground">בחרו סימולציה או תרגול כדי להתחיל.</p>
      <Button asChild size="lg">
        <Link href="/practice">לבחירת תרגול</Link>
      </Button>
    </div>
  );
}
