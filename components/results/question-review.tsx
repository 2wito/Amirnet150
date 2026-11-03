"use client";

import { useMemo, useState } from "react";
import { Check, Clock, X } from "lucide-react";
import { EnglishContent } from "@/components/exam/english-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BLANK_TOKEN, QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import { formatDurationHe } from "@/lib/format";
import type { ReviewItem, ReviewStatus } from "@/lib/review";
import { cn } from "@/lib/utils";

const STATUS_META: Record<ReviewStatus, { label: string; className: string }> = {
  correct: { label: "נכון", className: "border-success/30 bg-success/10 text-success" },
  incorrect: { label: "שגוי", className: "border-destructive/30 bg-destructive/10 text-destructive" },
  unanswered: { label: "לא נענה", className: "border-border bg-muted text-muted-foreground" },
};

type Filter = "all" | ReviewStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "הכל" },
  { value: "incorrect", label: "שגויות" },
  { value: "unanswered", label: "לא נענו" },
  { value: "correct", label: "נכונות" },
];

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

/** Every question in exam order, filterable by status, each expandable to the full review. */
export function QuestionReview({ items }: { items: readonly ReviewItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.status === filter)),
    [items, filter],
  );
  const countFor = (f: Filter) => (f === "all" ? items.length : items.filter((i) => i.status === f).length);

  return (
    <div className="space-y-4">
      <div role="group" aria-label="סינון שאלות" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              filter === f.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {f.label} <span className="tabular-nums opacity-75">({countFor(f.value)})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          אין שאלות בקטגוריה זו.
        </p>
      ) : (
        <Accordion type="multiple" dir="rtl" className="divide-y rounded-xl border">
          {visible.map((item) => (
            <AccordionItem key={item.question.id} value={item.question.id} className="px-4">
              <AccordionTrigger className="items-center gap-3 py-3 hover:no-underline">
                <span className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">שאלה {item.number}</span>
                  <span className="text-xs text-muted-foreground">
                    {QUESTION_TYPE_LABELS_HE[item.question.type]}
                  </span>
                  <StatusBadge status={item.status} />
                  <span className="ms-auto flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                    <Clock className="size-3.5" aria-hidden />
                    {formatDurationHe(item.timeSpentMs)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-5">
                <ReviewDetail item={item} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}

function ReviewDetail({ item }: { item: ReviewItem }) {
  const { question, passage, selectedIndex } = item;
  const referenced = new Set(
    question.type === "reading-comprehension" ? (question.referencedParagraphs ?? []) : [],
  );

  return (
    <div className="space-y-5">
      {passage && (
        <details className="group rounded-lg border bg-muted/30">
          <summary className="cursor-pointer list-none px-4 py-2 text-sm font-medium marker:hidden">
            <span className="text-muted-foreground group-open:hidden">הצג את קטע הקריאה</span>
            <span className="hidden text-muted-foreground group-open:inline">הסתר את קטע הקריאה</span>
          </summary>
          <EnglishContent className="scrollbar-thin max-h-96 space-y-3 overflow-y-auto border-t px-5 py-4 leading-7">
            <h4 className="text-center font-bold">{passage.title}</h4>
            {passage.paragraphs.map((text, i) => (
              <p key={i} className={cn("rounded px-1", referenced.has(i + 1) && "bg-primary/10")}>
                <span className="me-2 text-xs text-muted-foreground">({i + 1})</span>
                {text}
              </p>
            ))}
          </EnglishContent>
        </details>
      )}

      <div className="space-y-2">
        {question.type === "restatement" && <p className="text-xs text-muted-foreground">המשפט המקורי</p>}
        <EnglishContent>
          {question.type === "restatement" ? (
            <blockquote className="rounded-lg border-s-4 border-primary/40 bg-muted/40 px-4 py-3 text-base leading-relaxed">
              {question.stem}
            </blockquote>
          ) : (
            <p className="text-base leading-relaxed font-medium">
              {question.type === "sentence-completion" ? renderBlank(question.stem) : question.stem}
            </p>
          )}
        </EnglishContent>
      </div>

      <EnglishContent as="ol" className="space-y-2">
        {question.options.map((text, i) => {
          const isCorrect = i === question.correctOptionIndex;
          const isSelected = i === selectedIndex;
          return (
            <li
              key={i}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2",
                isCorrect && "border-success/40 bg-success/10",
                isSelected && !isCorrect && "border-destructive/40 bg-destructive/10",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] font-semibold",
                  isCorrect && "border-success bg-success text-white",
                  isSelected && !isCorrect && "border-destructive bg-destructive text-white",
                )}
              >
                {isCorrect ? <Check className="size-3" /> : isSelected ? <X className="size-3" /> : i + 1}
              </span>
              <span className="flex-1 leading-relaxed">{text}</span>
              {(isCorrect || isSelected) && (
                <span dir="rtl" className="shrink-0 text-xs font-medium">
                  {isCorrect && isSelected
                    ? "התשובה שלך · נכונה"
                    : isCorrect
                      ? "התשובה הנכונה"
                      : "התשובה שלך"}
                </span>
              )}
            </li>
          );
        })}
      </EnglishContent>
      {selectedIndex === null && <p className="text-xs text-muted-foreground">לא נבחרה תשובה לשאלה זו.</p>}

      <div className="rounded-lg border-s-4 border-primary bg-primary/5 px-4 py-3">
        <p className="mb-1 text-xs font-semibold text-primary">הסבר</p>
        <p className="leading-relaxed">{question.explanation}</p>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        זמן בשאלה: <span className="tabular-nums">{formatDurationHe(item.timeSpentMs)}</span>
      </p>
    </div>
  );
}

function renderBlank(stem: string) {
  const parts = stem.split(BLANK_TOKEN);
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <span key={i} className="mx-1 inline-block w-16 border-b-2 border-foreground/50 align-baseline">
            <span className="sr-only">blank</span>
          </span>,
          part,
        ],
  );
}
