import type { QuestionType } from "@/types/exam";

/** Hebrew labels for each question type (UI is RTL Hebrew). */
export const QUESTION_TYPE_LABELS_HE: Record<QuestionType, string> = {
  "sentence-completion": "השלמת משפטים",
  restatement: "ניסוח מחדש",
  "reading-comprehension": "הבנת הנקרא",
};

/** Marks the blank inside a sentence-completion stem. */
export const BLANK_TOKEN = "____";

/** Default per-question time for sentence completion and restatement. */
export const DEFAULT_QUESTION_TIME_LIMIT_SECONDS = 45;

/** Reading-comprehension questions get more time to allow for reading the passage. */
export const READING_QUESTION_TIME_LIMIT_SECONDS = 90;
