"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileText, ListChecks, Repeat2, RotateCcw, Target, type LucideIcon } from "lucide-react";
import { QuestionReview } from "@/components/results/question-review";
import { ScoreBadge } from "@/components/results/score-badge";
import { Button } from "@/components/ui/button";
import { QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import { formatDurationHe } from "@/lib/format";
import { buildCategoryStats, buildReviewItems } from "@/lib/review";
import { useExamHydration } from "@/lib/useExamHydration";
import { useExamStore } from "@/lib/useExamStore";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/exam";

const TYPE_ICONS: Record<QuestionType, LucideIcon> = {
  "sentence-completion": ListChecks,
  restatement: Repeat2,
  "reading-comprehension": FileText,
};

/** Full end-of-exam results: score, stats, per-category breakdown and question-by-question review. */
export function ResultsDashboard() {
  const hydrated = useExamHydration();
  const status = useExamStore((s) => s.status);

  if (!hydrated) {
    return <p className="py-24 text-center text-sm text-muted-foreground">טוען תוצאות…</p>;
  }
  if (status === "in-progress") {
    return (
      <EmptyState title="המבחן עדיין פעיל" body="סיימו את המבחן כדי לראות את התוצאות.">
        <Button asChild size="lg">
          <Link href="/exam">חזרה למבחן</Link>
        </Button>
      </EmptyState>
    );
  }
  if (status !== "completed") {
    return (
      <EmptyState title="אין תוצאות להצגה" body="התחילו מבחן או תרגול, ובסיומו התוצאות יופיעו כאן.">
        <Button asChild size="lg">
          <Link href="/practice">לבחירת תרגול</Link>
        </Button>
      </EmptyState>
    );
  }
  return <CompletedResults />;
}

function CompletedResults() {
  const router = useRouter();
  const result = useExamStore((s) => s.result);
  const mode = useExamStore((s) => s.mode);
  const finishReason = useExamStore((s) => s.finishReason);
  const sections = useExamStore((s) => s.sections);
  const userAnswers = useExamStore((s) => s.userAnswers);
  const timeSpentMs = useExamStore((s) => s.timeSpentMs);
  const startedAt = useExamStore((s) => s.startedAt);
  const finishedAt = useExamStore((s) => s.finishedAt);
  const reset = useExamStore((s) => s.reset);

  const items = useMemo(
    () => buildReviewItems({ sections, userAnswers, timeSpentMs }),
    [sections, userAnswers, timeSpentMs],
  );
  const categories = useMemo(() => buildCategoryStats(items), [items]);

  if (!result) return null;

  const totalTimeMs = startedAt != null && finishedAt != null ? finishedAt - startedAt : null;

  // Navigate first so this page doesn't flash its empty state after reset.
  const startNew = () => {
    router.push("/practice");
    reset();
  };

  return (
    <div className="space-y-10">
      {/* Title + CTA */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {mode === "full-exam" ? "סימולציית מבחן מלא" : "תרגול פרק"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">תוצאות המבחן</h1>
        </div>
        <NewExamButton onClick={startNew} />
      </div>

      {/* Score + headline stats */}
      <section
        aria-label="סיכום"
        className="grid gap-6 rounded-xl border bg-card p-6 md:grid-cols-[1fr_1fr] md:p-8"
      >
        <ScoreBadge score={result.score} level={result.level} />
        <dl className="grid content-center gap-4 sm:grid-cols-2">
          <Stat label="סטטוס הגשה">
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-sm font-medium",
                finishReason === "time-up"
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-primary/30 bg-primary/10 text-primary",
              )}
            >
              {finishReason === "time-up" ? "תום זמן" : "הוגש ידנית"}
            </span>
          </Stat>
          <Stat label="דיוק כללי" icon={Target}>
            <span className="text-2xl font-bold tabular-nums">{Math.round(result.raw.percentage)}%</span>
          </Stat>
          <Stat label="זמן כולל" icon={Clock}>
            <span className="text-2xl font-bold tabular-nums">{formatDurationHe(totalTimeMs)}</span>
          </Stat>
          <Stat label="תשובות">
            <span className="text-sm leading-6">
              <span className="font-semibold text-success">{result.raw.correct} נכונות</span>
              {" · "}
              <span className="font-semibold text-destructive">{result.raw.incorrect} שגויות</span>
              {" · "}
              <span className="text-muted-foreground">{result.raw.unanswered} לא נענו</span>
            </span>
          </Stat>
        </dl>
      </section>

      {/* Category breakdown */}
      <section aria-labelledby="categories-heading" className="space-y-4">
        <h2 id="categories-heading" className="text-lg font-semibold">
          פילוח לפי סוג שאלה
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {categories.map((c) => {
            const Icon = TYPE_ICONS[c.questionType];
            return (
              <li key={c.questionType} className="space-y-4 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-2">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <h3 className="font-semibold">{QUESTION_TYPE_LABELS_HE[c.questionType]}</h3>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">דיוק</span>
                    <span className="text-xl font-bold tabular-nums">{Math.round(c.accuracy)}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`דיוק ב${QUESTION_TYPE_LABELS_HE[c.questionType]}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(c.accuracy)}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.accuracy}%` }} />
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">זמן ממוצע לשאלה</dt>
                  <dd className="text-end tabular-nums">{formatDurationHe(c.averageTimeMs)}</dd>
                  <dt className="text-muted-foreground">נכונות</dt>
                  <dd className="text-end tabular-nums">
                    {c.correct}/{c.total}
                  </dd>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Question review */}
      <section aria-labelledby="review-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="review-heading" className="text-lg font-semibold">
            סקירת שאלות
          </h2>
          <p className="text-sm text-muted-foreground">
            לחצו על שאלה כדי לראות את התשובה הנכונה, התשובה שלכם וההסבר.
          </p>
        </div>
        <QuestionReview items={items} />
      </section>

      <div className="flex flex-col items-center gap-3 border-t pt-8 text-center">
        <NewExamButton onClick={startNew} />
        <p className="max-w-md text-xs text-muted-foreground">
          הציון הוא הערכה לצורך תרגול בלבד ואינו מחליף ציון רשמי של מאל״ו. המבחן האמיתי מותאם לנבחן ומחושב
          בשיטה אחרת.
        </p>
      </div>
    </div>
  );
}

function NewExamButton({ onClick }: { onClick: () => void }) {
  return (
    <Button size="lg" onClick={onClick} className="gap-2">
      <RotateCcw aria-hidden />
      התחל מבחן חדש / תרגול נוסף
    </Button>
  );
}

function Stat({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 rounded-lg bg-muted/40 p-4">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" aria-hidden />}
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{body}</p>
      {children}
    </div>
  );
}
