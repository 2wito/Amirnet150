"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardCheck, FileText, ListChecks, Play, Repeat2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import { formatMinutesHe } from "@/lib/format";
import { estimateSection } from "@/lib/exam-builder";
import { useExamHydration } from "@/lib/useExamHydration";
import { FULL_EXAM_DURATION_SECONDS, SECTION_ORDER, useExamStore } from "@/lib/useExamStore";
import type { QuestionType } from "@/types/exam";

const SECTION_META: Record<QuestionType, { icon: LucideIcon; descriptionHe: string }> = {
  "sentence-completion": {
    icon: ListChecks,
    descriptionHe: "משפט עם מילה חסרה. בוחרים את המילה או הביטוי שמשלימים אותו.",
  },
  restatement: {
    icon: Repeat2,
    descriptionHe: "משפט מקורי וארבעה ניסוחים. בוחרים את הניסוח שמשמעותו זהה.",
  },
  "reading-comprehension": {
    icon: FileText,
    descriptionHe: "קטע קריאה באנגלית ושאלות הבנה עליו.",
  },
};

/** Precomputed once: questions per generated exam and section-practice durations. */
const SECTION_STATS = Object.fromEntries(
  SECTION_ORDER.map((type) => [type, estimateSection(type)]),
) as Record<QuestionType, { questionCount: number; seconds: number }>;

const FULL_EXAM_QUESTION_COUNT = SECTION_ORDER.reduce((n, t) => n + SECTION_STATS[t].questionCount, 0);

/**
 * Practice dashboard: start a full exam simulation or a single-section practice.
 * Buttons stay disabled until the saved exam (if any) has loaded, so starting
 * can't be overwritten by a late restore.
 */
export function PracticeSelector() {
  const router = useRouter();
  const hydrated = useExamHydration();
  const status = useExamStore((s) => s.status);
  const startExam = useExamStore((s) => s.startExam);

  const hasActiveExam = hydrated && status === "in-progress";

  const startFull = () => {
    startExam("full-exam");
    router.push("/exam");
  };
  const startSection = (type: QuestionType) => {
    startExam("section-practice", type);
    router.push("/exam");
  };

  return (
    <div className="space-y-10">
      {hasActiveExam && (
        <div
          role="status"
          className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border-primary/30 px-4 py-3"
        >
          <p className="text-sm">
            <span className="font-medium">יש לך מבחן פעיל.</span>{" "}
            <span className="text-muted-foreground">התחלת מבחן חדש תבטל אותו.</span>
          </p>
          <Button asChild size="sm">
            <Link href="/exam">המשך מבחן</Link>
          </Button>
        </div>
      )}

      {/* Full exam */}
      <section aria-labelledby="full-exam-heading">
        <div className="card-elevated relative flex flex-col gap-6 overflow-hidden rounded-3xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 start-0 w-1.5 bg-brand-gradient" />
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/25">
              <ClipboardCheck className="size-6" aria-hidden />
            </div>
            <div className="space-y-2">
              <h2 id="full-exam-heading" className="text-xl font-bold">
                סימולציית מבחן מלא
              </h2>
              <p className="text-sm text-muted-foreground">כל שלושת הפרקים ברצף, בתנאים של המבחן האמיתי.</p>
              <ul className="flex flex-wrap gap-2 pt-1 text-xs">
                {[
                  formatMinutesHe(FULL_EXAM_DURATION_SECONDS),
                  `${FULL_EXAM_QUESTION_COUNT} שאלות`,
                  "טיימר לכל שאלה",
                  "ללא חזרה לשאלות קודמות",
                  "שאלות שונות בכל מבחן",
                ].map((label) => (
                  <li key={label} className="rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button
            size="lg"
            onClick={startFull}
            disabled={!hydrated}
            className="h-12 cursor-pointer gap-2 rounded-xl bg-brand-gradient px-6 text-base shadow-lg shadow-primary/25 hover:opacity-90 sm:self-center"
          >
            <Play aria-hidden />
            התחל סימולציה
          </Button>
        </div>
      </section>

      {/* Section practice */}
      <section aria-labelledby="section-practice-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="section-practice-heading" className="text-xl font-bold">
            תרגול לפי פרק
          </h2>
          <p className="text-sm text-muted-foreground">
            טיימר לפרק כולו, עם אפשרות לנוע קדימה ואחורה בין השאלות. השאלות וסדר התשובות מוגרלים מחדש בכל
            תרגול.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {SECTION_ORDER.map((type) => {
            const { icon: Icon, descriptionHe } = SECTION_META[type];
            const stats = SECTION_STATS[type];
            return (
              <li key={type} className="glass card-elevated card-hover flex flex-col gap-4 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="font-semibold">{QUESTION_TYPE_LABELS_HE[type]}</h3>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{descriptionHe}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  {stats.questionCount} שאלות · {formatMinutesHe(stats.seconds)}
                </p>
                <Button
                  variant="outline"
                  className="h-10 cursor-pointer rounded-xl hover:border-primary/40 hover:text-primary"
                  onClick={() => startSection(type)}
                  disabled={!hydrated || stats.questionCount === 0}
                >
                  התחל תרגול
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
