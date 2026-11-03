import Link from "next/link";
import { FileText, ListChecks, Repeat2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnglishContent } from "@/components/exam/english-content";
import { questionBank } from "@/lib/question-bank";
import { QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import type { QuestionType } from "@/types/exam";

const TYPE_ICONS: Record<QuestionType, typeof FileText> = {
  "sentence-completion": ListChecks,
  restatement: Repeat2,
  "reading-comprehension": FileText,
};

export default function HomePage() {
  const preview = questionBank.sentenceCompletion[0];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">הכנה למבחן אמירנט</h1>
        <p className="max-w-prose text-muted-foreground">
          תרגול ממוקד לפי סוגי השאלות, בממשק שמדמה את המבחן הממוחשב של מאל״ו.
        </p>
        <Button asChild size="lg">
          <Link href="/practice">להתחלת תרגול</Link>
        </Button>
      </section>

      <section aria-labelledby="types-heading" className="space-y-4">
        <h2 id="types-heading" className="text-lg font-semibold">
          סוגי השאלות במבחן
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(QUESTION_TYPE_LABELS_HE) as QuestionType[]).map((type) => {
            const Icon = TYPE_ICONS[type];
            return (
              <li key={type} className="flex items-center gap-3 rounded-lg border p-4">
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="font-medium">{QUESTION_TYPE_LABELS_HE[type]}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {preview && (
        <section aria-labelledby="preview-heading" className="space-y-4">
          <h2 id="preview-heading" className="text-lg font-semibold">
            דוגמה לשאלה
          </h2>
          <div className="rounded-lg border bg-card p-6">
            <EnglishContent className="space-y-4">
              <p className="text-lg leading-relaxed">{preview.stem}</p>
              <ol className="space-y-2">
                {preview.options.map((option, i) => (
                  <li key={i} className="flex gap-3 rounded-md border px-4 py-2">
                    <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ol>
            </EnglishContent>
          </div>
        </section>
      )}
    </div>
  );
}
