"use client";

import { AnswerOptions } from "@/components/exam/answer-options";
import { EnglishContent } from "@/components/exam/english-content";
import { PassagePanel } from "@/components/exam/passage-panel";
import { BLANK_TOKEN } from "@/lib/exam-constants";
import { getPassageById } from "@/lib/question-bank";
import { cn } from "@/lib/utils";
import type { OptionIndex, Question, QuestionType, ReadingComprehensionQuestion } from "@/types/exam";

const INSTRUCTIONS_HE: Record<QuestionType, string> = {
  "sentence-completion": "בחרו את המילה או הביטוי המשלימים את המשפט בצורה הטובה ביותר.",
  restatement: "בחרו את המשפט שמשמעותו הקרובה ביותר למשפט המקורי.",
  "reading-comprehension": "קראו את הקטע ובחרו את התשובה הנכונה לשאלה.",
};

export interface QuestionCardProps {
  question: Question;
  /** 1-based number shown to the user. */
  questionNumber: number;
  selectedIndex: OptionIndex | null;
  onSelect: (index: OptionIndex) => void;
}

/**
 * Renders the current question. Sentence completion and restatement use a
 * single centered column; reading comprehension uses a split view with the
 * passage beside the question. Exam content is LTR; instructions are RTL.
 */
export function QuestionCard(props: QuestionCardProps) {
  if (props.question.type === "reading-comprehension") {
    return <ReadingSplitView {...props} question={props.question} />;
  }
  return <StandardQuestion {...props} />;
}

/* -------------------------------------------------------------------------- */
/*                Standard: sentence completion & restatement                 */
/* -------------------------------------------------------------------------- */

function StandardQuestion({ question, questionNumber, selectedIndex, onSelect }: QuestionCardProps) {
  return (
    <article aria-label={`שאלה ${questionNumber}`} className="space-y-5">
      <Instructions type={question.type} />
      <EnglishContent className="space-y-6">
        <QuestionStem question={question} questionNumber={questionNumber} selectedIndex={selectedIndex} />
        <AnswerOptions
          questionId={question.id}
          options={question.options}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      </EnglishContent>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Split view: reading comprehension                    */
/* -------------------------------------------------------------------------- */

function ReadingSplitView({
  question,
  questionNumber,
  selectedIndex,
  onSelect,
}: QuestionCardProps & { question: ReadingComprehensionQuestion }) {
  const passage = getPassageById(question.passageId);

  return (
    // LTR grid so the passage sits on the left, as English readers expect.
    <div dir="ltr" className="grid gap-4 lg:h-full lg:grid-cols-2 lg:gap-6">
      {passage ? (
        // Keyed by passage so scroll position and font size persist across its questions.
        <PassagePanel key={passage.id} passage={passage} className="max-h-[45dvh] lg:max-h-none" />
      ) : (
        <p dir="rtl" className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          קטע הקריאה לא נמצא.
        </p>
      )}

      <article
        key={question.id}
        aria-label={`שאלה ${questionNumber}`}
        className="scrollbar-thin min-h-0 space-y-5 lg:overflow-y-auto lg:pe-1"
      >
        <Instructions type={question.type} />
        <EnglishContent className="space-y-6">
          <QuestionStem question={question} questionNumber={questionNumber} selectedIndex={selectedIndex} />
          <AnswerOptions
            questionId={question.id}
            options={question.options}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
          />
        </EnglishContent>
      </article>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Parts                                    */
/* -------------------------------------------------------------------------- */

function Instructions({ type }: { type: QuestionType }) {
  return (
    <p dir="rtl" className="text-sm text-muted-foreground">
      {INSTRUCTIONS_HE[type]}
    </p>
  );
}

function QuestionStem({
  question,
  questionNumber,
  selectedIndex,
}: {
  question: Question;
  questionNumber: number;
  selectedIndex: OptionIndex | null;
}) {
  const number = <span className="me-2 font-semibold text-muted-foreground">{questionNumber}.</span>;

  if (question.type === "sentence-completion") {
    const [before, ...rest] = question.stem.split(BLANK_TOKEN);
    const after = rest.join(BLANK_TOKEN);
    const filled = selectedIndex !== null ? question.options[selectedIndex] : null;
    return (
      <p className="text-lg leading-loose">
        {number}
        {before}
        {rest.length > 0 && <Blank filledWith={filled} />}
        {after}
      </p>
    );
  }

  if (question.type === "restatement") {
    return (
      <div className="flex gap-1">
        {number}
        <blockquote className="flex-1 rounded-lg border-s-4 border-primary/40 bg-muted/40 px-4 py-3 text-lg leading-relaxed">
          {question.stem}
        </blockquote>
      </div>
    );
  }

  return (
    <p className="text-lg leading-relaxed font-medium">
      {number}
      {question.stem}
    </p>
  );
}

/** The sentence-completion blank; shows the chosen option once one is selected. */
function Blank({ filledWith }: { filledWith: string | null }) {
  return (
    <span
      className={cn(
        "mx-1 inline-block min-w-24 border-b-2 px-1 text-center",
        filledWith ? "border-primary font-semibold text-primary" : "border-foreground/50",
      )}
    >
      {filledWith ?? <span className="sr-only">blank</span>}
    </span>
  );
}
