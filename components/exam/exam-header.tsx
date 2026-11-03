"use client";

import { ExamTimer } from "@/components/exam/exam-timer";
import { FinishExamButton } from "@/components/exam/finish-exam-button";
import {
  selectAnsweredCount,
  selectCurrentSection,
  selectQuestionNumber,
  selectTotalQuestions,
  useExamStore,
} from "@/lib/useExamStore";

/** Under this many seconds the question timer turns red and pulses. */
const QUESTION_URGENT_SECONDS = 10;
/** Under this many seconds the overall/section timer turns red. */
const TOTAL_URGENT_SECONDS = 60;

export function ExamHeader() {
  const mode = useExamStore((s) => s.mode);
  const section = useExamStore(selectCurrentSection);
  const questionNumber = useExamStore(selectQuestionNumber);
  const total = useExamStore(selectTotalQuestions);
  const answered = useExamStore(selectAnsweredCount);
  const totalTimeRemaining = useExamStore((s) => s.totalTimeRemaining);
  const questionTimeRemaining = useExamStore((s) => s.questionTimeRemaining);

  const isFullExam = mode === "full-exam";
  const progress = total === 0 ? 0 : Math.round((answered / total) * 100);

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        {/* Section + counters */}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{isFullExam ? "סימולציית מבחן מלא" : "תרגול פרק"}</p>
          <h1 className="truncate font-semibold">{section?.titleHe}</h1>
        </div>

        <div className="text-sm">
          <p className="font-medium" aria-live="polite">
            שאלה {questionNumber} מתוך {total}
          </p>
          <p className="text-xs text-muted-foreground">
            נענו {answered} מתוך {total}
          </p>
        </div>

        {/* Timers */}
        <div className="flex items-center gap-2">
          {isFullExam && questionTimeRemaining !== null && (
            <ExamTimer
              variant="question"
              label="זמן לשאלה"
              seconds={questionTimeRemaining}
              urgent={questionTimeRemaining < QUESTION_URGENT_SECONDS}
              primary
            />
          )}
          <ExamTimer
            variant="total"
            label={isFullExam ? "זמן כולל" : "זמן לפרק"}
            seconds={totalTimeRemaining}
            urgent={totalTimeRemaining < TOTAL_URGENT_SECONDS}
            primary={!isFullExam}
          />
        </div>

        <FinishExamButton className="ms-auto" />
      </div>

      {/* Progress (answered questions); fills from the inline start (right in RTL). */}
      <div
        role="progressbar"
        aria-label="התקדמות במבחן"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-valuetext={`נענו ${answered} מתוך ${total}`}
        className="h-1 w-full bg-muted"
      >
        <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
