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
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
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
        <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardCheck className="size-6" aria-hidden />
            </div>
            <div className="space-y-2">
              <h2 id="full-exam-heading" className="text-lg font-semibold">
                סימולציית מבחן מלא
              </h2>
              <p className="text-sm text-muted-foreground">כל שלושת הפרקים ברצף, בתנאים של המבחן האמיתי.</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li>{formatMinutesHe(FULL_EXAM_DURATION_SECONDS)}</li>
                <li>{FULL_EXAM_QUESTION_COUNT} שאלות</li>
                <li>טיימר לכל שאלה</li>
                <li>ללא חזרה לשאלות קודמות</li>
                <li>שאלות שונות בכל מבחן</li>
              </ul>
            </div>
          </div>
          <Button size="lg" onClick={startFull} disabled={!hydrated} className="gap-2 sm:self-center">
            <Play aria-hidden />
            התחל סימולציה
          </Button>
        </div>
      </section>

      {/* Section practice */}
      <section aria-labelledby="section-practice-heading" className="space-y-4">
        <div className="space-y-1">
          <h2 id="section-practice-heading" className="text-lg font-semibold">
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
              <li key={type} className="flex flex-col gap-4 rounded-xl border bg-card p-5">
                <div className="flex items-center gap-3">
                  <Icon className="size-5 text-primary" aria-hidden />
                  <h3 className="font-semibold">{QUESTION_TYPE_LABELS_HE[type]}</h3>
                </div>
                <p className="flex-1 text-sm text-muted-foreground">{descriptionHe}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.questionCount} שאלות · {formatMinutesHe(stats.seconds)}
                </p>
                <Button
                  variant="outline"
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
