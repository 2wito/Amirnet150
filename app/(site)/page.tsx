import Link from "next/link";
import {
  ArrowLeft,
  BookA,
  ClipboardCheck,
  FileText,
  Gauge,
  Heart,
  ListChecks,
  Repeat2,
  Shuffle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AboutSection } from "@/components/home/about-section";
import { EnglishContent } from "@/components/exam/english-content";
import { LevelBadge } from "@/components/results/level-badge";
import { VOCABULARY } from "@/data/vocabulary";
import { questionBank } from "@/lib/question-bank";
import { QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import { LEVEL_BANDS } from "@/lib/scoring";
import type { QuestionType } from "@/types/exam";

const TYPE_META: Record<QuestionType, { icon: LucideIcon; descriptionHe: string; count: number }> = {
  "sentence-completion": {
    icon: ListChecks,
    descriptionHe: "משפט עם מילה חסרה — בוחרים את ההשלמה המתאימה.",
    count: questionBank.sentenceCompletion.length,
  },
  restatement: {
    icon: Repeat2,
    descriptionHe: "בוחרים את הניסוח ששומר על המשמעות המקורית.",
    count: questionBank.restatement.length,
  },
  "reading-comprehension": {
    icon: FileText,
    descriptionHe: "קטעי קריאה אקדמיים ושאלות הבנה עליהם.",
    count: questionBank.readingComprehension.reduce((n, p) => n + p.questions.length, 0),
  },
};

const FEATURES: readonly { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ClipboardCheck, title: "סימולציה מלאה", body: "שלושת הפרקים ברצף, עם טיימר לכל שאלה וללא חזרה — כמו במבחן." },
  { icon: Shuffle, title: "מבחן חדש בכל פעם", body: "השאלות וסדר התשובות מוגרלים מחדש בכל התחלה." },
  { icon: Gauge, title: "ציון משוער ורמה", body: "הערכת ציון בסולם 50–150, פילוח לפי סוג שאלה והסבר לכל תשובה." },
  { icon: BookA, title: "מילים נפוצות", body: "אוצר מילים ממוין לקטגוריות עם כרטיסיות ומצב תרגול." },
];

export default function HomePage() {
  const preview = questionBank.sentenceCompletion[0];
  const levelsAscending = [...LEVEL_BANDS].reverse();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-white shadow-2xl shadow-primary/25 sm:px-10 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 -start-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -end-16 size-80 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative max-w-2xl space-y-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Heart className="size-3.5" aria-hidden />
            חינמי לחלוטין, לטובת הקהילה
          </span>
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            הכנה חכמה למבחן <span className="whitespace-nowrap">האמירנט</span>
          </h1>
          <p className="max-w-prose text-lg text-white/85">
            סימולציות בממשק שמדמה את המבחן הממוחשב, תרגול ממוקד לפי פרק, ציון משוער ואוצר מילים — הכול במקום
            אחד.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-12 gap-2 rounded-xl bg-white px-6 text-base text-primary shadow-lg hover:bg-white/90"
            >
              <Link href="/practice">
                להתחלת תרגול
                <ArrowLeft aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 gap-2 rounded-xl border-white/40 bg-white/10 px-6 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link href="/vocabulary">
                <BookA aria-hidden />
                מילים נפוצות
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section aria-labelledby="features-heading" className="space-y-5">
        <h2 id="features-heading" className="text-xl font-bold">
          מה מחכה לכם כאן
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="glass card-elevated card-hover space-y-3 rounded-2xl p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Question types */}
      <section aria-labelledby="types-heading" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="types-heading" className="text-xl font-bold">
            סוגי השאלות במבחן
          </h2>
          <Link
            href="/practice"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            לתרגול לפי פרק
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-3">
          {(Object.keys(QUESTION_TYPE_LABELS_HE) as QuestionType[]).map((type) => {
            const { icon: Icon, descriptionHe, count } = TYPE_META[type];
            return (
              <li key={type} className="card-elevated card-hover flex flex-col gap-3 rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {count} שאלות במאגר
                  </span>
                </div>
                <h3 className="font-semibold">{QUESTION_TYPE_LABELS_HE[type]}</h3>
                <p className="text-sm text-muted-foreground">{descriptionHe}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Levels */}
      <section aria-labelledby="levels-heading" className="space-y-5">
        <div className="space-y-1">
          <h2 id="levels-heading" className="text-xl font-bold">
            רמות הפטור והציונים
          </h2>
          <p className="text-sm text-muted-foreground">
            ציון האמירנט נע בין 50 ל-150. בסוף כל מבחן תקבלו ציון משוער ואת הרמה המתאימה לו.
          </p>
        </div>
        <ul className="glass card-elevated flex flex-wrap gap-3 rounded-2xl p-5">
          {levelsAscending.map((band) => (
            <li key={band.level}>
              <LevelBadge band={band} showRange />
            </li>
          ))}
        </ul>
      </section>

      {/* Preview */}
      {preview && (
        <section aria-labelledby="preview-heading" className="space-y-5">
          <h2 id="preview-heading" className="text-xl font-bold">
            דוגמה לשאלה
          </h2>
          <div className="card-elevated rounded-2xl border bg-card p-6">
            <EnglishContent className="space-y-4">
              <p className="text-lg leading-relaxed">{preview.stem}</p>
              <ol className="grid gap-2 sm:grid-cols-2">
                {preview.options.map((option, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border bg-background/60 px-4 py-2.5">
                    <span className="font-semibold text-muted-foreground">{i + 1}.</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ol>
            </EnglishContent>
          </div>
        </section>
      )}

      <AboutSection />

      <p className="text-center text-xs text-muted-foreground">
        במאגר: {questionBank.sentenceCompletion.length + questionBank.restatement.length + TYPE_META["reading-comprehension"].count}{" "}
        שאלות ו-{VOCABULARY.length} מילים נפוצות.
      </p>
    </div>
  );
}
