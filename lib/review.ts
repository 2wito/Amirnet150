import { getPassageById } from "@/lib/question-bank";
import type { OptionIndex, Passage, Question, QuestionId, QuestionType } from "@/types/exam";

/**
 * Builds the post-exam review: one item per question in exam order, plus
 * per-category stats. Pure functions over the finished exam's data.
 */

export type ReviewStatus = "correct" | "incorrect" | "unanswered";

export interface ReviewItem {
  /** 1-based position in the exam. */
  number: number;
  question: Question;
  passage: Passage | null;
  selectedIndex: OptionIndex | null;
  status: ReviewStatus;
  timeSpentMs: number;
}

export interface CategoryStats {
  questionType: QuestionType;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  /** correct / total, 0–100. */
  accuracy: number;
  /** Mean time over the questions in this category that were opened; `null` if none were. */
  averageTimeMs: number | null;
}

export interface ExamReviewInput {
  sections: readonly { type: QuestionType; questions: readonly Question[] }[];
  userAnswers: Readonly<Record<QuestionId, OptionIndex>>;
  timeSpentMs: Readonly<Record<QuestionId, number>>;
}

export function buildReviewItems({ sections, userAnswers, timeSpentMs }: ExamReviewInput): ReviewItem[] {
  return sections
    .flatMap((s) => s.questions)
    .map((question, i) => {
      const selectedIndex = userAnswers[question.id] ?? null;
      const status: ReviewStatus =
        selectedIndex === null
          ? "unanswered"
          : selectedIndex === question.correctOptionIndex
            ? "correct"
            : "incorrect";
      return {
        number: i + 1,
        question,
        passage:
          question.type === "reading-comprehension" ? (getPassageById(question.passageId) ?? null) : null,
        selectedIndex,
        status,
        timeSpentMs: timeSpentMs[question.id] ?? 0,
      };
    });
}

export function buildCategoryStats(items: readonly ReviewItem[]): CategoryStats[] {
  const order: QuestionType[] = [];
  const groups = new Map<QuestionType, ReviewItem[]>();
  for (const item of items) {
    const type = item.question.type;
    if (!groups.has(type)) {
      groups.set(type, []);
      order.push(type);
    }
    groups.get(type)!.push(item);
  }

  return order.map((questionType) => {
    const group = groups.get(questionType)!;
    const count = (s: ReviewStatus) => group.filter((i) => i.status === s).length;
    const viewed = group.filter((i) => i.timeSpentMs > 0);
    const correct = count("correct");
    return {
      questionType,
      total: group.length,
      correct,
      incorrect: count("incorrect"),
      unanswered: count("unanswered"),
      accuracy: group.length === 0 ? 0 : Math.round((correct / group.length) * 1000) / 10,
      averageTimeMs:
        viewed.length === 0 ? null : viewed.reduce((n, i) => n + i.timeSpentMs, 0) / viewed.length,
    };
  });
}
