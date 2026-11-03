"use client";

import type { AnswerOptions as AnswerOptionsTuple, OptionIndex, QuestionId } from "@/types/exam";
import { cn } from "@/lib/utils";

interface AnswerOptionsProps {
  questionId: QuestionId;
  options: AnswerOptionsTuple;
  selectedIndex: OptionIndex | null;
  onSelect: (index: OptionIndex) => void;
}

/**
 * The four answer choices as a native radio group (keyboard and screen-reader
 * friendly). Renders English, LTR, so it must sit inside an LTR container.
 */
export function AnswerOptions({ questionId, options, selectedIndex, onSelect }: AnswerOptionsProps) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="sr-only">Answer options</legend>
      {options.map((text, i) => {
        const index = i as OptionIndex;
        const selected = selectedIndex === index;
        return (
          <label
            key={index}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors",
              "hover:border-primary/40 hover:bg-muted/40",
              "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
              selected && "border-primary bg-primary/5 hover:border-primary hover:bg-primary/5",
            )}
          >
            <input
              type="radio"
              name={`answer-${questionId}`}
              value={index}
              checked={selected}
              onChange={() => onSelect(index)}
              className="sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                selected ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {index + 1}
            </span>
            <span className="leading-relaxed">{text}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
