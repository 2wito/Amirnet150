/**
 * Core domain types for the Amirnet (אמירנט) practice platform.
 *
 * Conventions:
 * - Content shown to the examinee (stems, options, passages) is English / LTR.
 * - `explanation` fields are Hebrew / RTL.
 * - Percentages are expressed on a 0–100 scale throughout.
 * - IDs are plain strings so data can come from static JSON, a CMS, or a DB.
 */

/* -------------------------------------------------------------------------- */
/*                                Primitives                                  */
/* -------------------------------------------------------------------------- */

export type QuestionId = string;
export type PassageId = string;
export type SectionId = string;
export type ExamId = string;
export type AttemptId = string;

/** The three question formats that appear on the Amirnet. */
export type QuestionType =
  | "sentence-completion"
  | "restatement"
  | "reading-comprehension";

/** Every Amirnet question has exactly four answer options. */
export type OptionIndex = 0 | 1 | 2 | 3;

/** Four English answer options; the array position is the option's index. */
export type AnswerOptions = readonly [string, string, string, string];

/** 1 = easiest, 5 = hardest. Used for weighting and analytics. */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/** ISO-8601 timestamp, e.g. "2026-11-03T18:30:00.000Z". */
export type ISODateString = string;

/* -------------------------------------------------------------------------- */
/*                                 Questions                                  */
/* -------------------------------------------------------------------------- */

interface BaseQuestion {
  id: QuestionId;
  type: QuestionType;
  /** English question text (LTR). Meaning depends on `type` — see below. */
  stem: string;
  options: AnswerOptions;
  correctOptionIndex: OptionIndex;
  /** Suggested time for this question, in seconds. */
  timeLimitSeconds: number;
  /** Hebrew explanation of the correct answer (RTL). */
  explanation: string;
  difficulty: DifficultyLevel;
  /** Optional per-option Hebrew notes explaining each distractor. */
  optionExplanations?: Partial<Record<OptionIndex, string>>;
  /** Free-form tags, e.g. ["vocabulary", "connectors", "inference"]. */
  tags?: string[];
  /**
   * Keep options in their authored order when building an exam (e.g. when an
   * option is "Both 1 and 2"). Options are shuffled by default.
   */
  fixedOptionOrder?: boolean;
}

/**
 * Sentence completion: `stem` is a sentence containing a blank
 * (marked with `BLANK_TOKEN`, "____"); pick the option that completes it.
 */
export interface SentenceCompletionQuestion extends BaseQuestion {
  type: "sentence-completion";
}

/**
 * Restatement: `stem` is the original sentence; pick the option that
 * best expresses the same meaning.
 */
export interface RestatementQuestion extends BaseQuestion {
  type: "restatement";
}

/**
 * Reading comprehension: `stem` is a question about a passage.
 * Always linked to exactly one passage.
 */
export interface ReadingComprehensionQuestion extends BaseQuestion {
  type: "reading-comprehension";
  passageId: PassageId;
  /** Paragraph numbers (1-based) the question refers to, if any. */
  referencedParagraphs?: number[];
}

/** Discriminated union of every question type — narrow on `type`. */
export type Question =
  | SentenceCompletionQuestion
  | RestatementQuestion
  | ReadingComprehensionQuestion;

/** Maps a `QuestionType` literal to its concrete interface. */
export type QuestionByType<T extends QuestionType> = Extract<Question, { type: T }>;

/* -------------------------------------------------------------------------- */
/*                                  Passages                                  */
/* -------------------------------------------------------------------------- */

export interface Passage {
  id: PassageId;
  /** English title (LTR). */
  title: string;
  /**
   * Passage body split into paragraphs so the UI can number them
   * (questions reference paragraphs by number).
   */
  paragraphs: string[];
  /** Questions linked to this passage, in display order. */
  questions: ReadingComprehensionQuestion[];
  difficulty?: DifficultyLevel;
  /** Topic in Hebrew for the dashboard, e.g. "ביולוגיה". */
  topic?: string;
}

/* -------------------------------------------------------------------------- */
/*                               Question bank                                */
/* -------------------------------------------------------------------------- */

/** Shape of `data/questions.json`. */
export interface QuestionBank {
  version: number;
  sentenceCompletion: SentenceCompletionQuestion[];
  restatement: RestatementQuestion[];
  readingComprehension: Passage[];
}

/* -------------------------------------------------------------------------- */
/*                              Exam & Sections                               */
/* -------------------------------------------------------------------------- */

interface BaseExamSection {
  id: SectionId;
  /** Hebrew section label, e.g. "השלמת משפטים". */
  titleHe: string;
  /** Hebrew instructions shown before the section begins. */
  instructionsHe?: string;
  /** Time limit for the whole section, in seconds. Omit for untimed practice. */
  timeLimitSeconds?: number;
  order: number;
}

export interface SentenceCompletionSection extends BaseExamSection {
  type: "sentence-completion";
  questions: SentenceCompletionQuestion[];
}

export interface RestatementSection extends BaseExamSection {
  type: "restatement";
  questions: RestatementQuestion[];
}

export interface ReadingComprehensionSection extends BaseExamSection {
  type: "reading-comprehension";
  /** Questions are nested inside each passage. */
  passages: Passage[];
}

export type ExamSection =
  | SentenceCompletionSection
  | RestatementSection
  | ReadingComprehensionSection;

/**
 * - `full-exam`: all sections in order, 39-minute overall limit, strict
 *   per-question timers, no going back (as on the real computerized test).
 * - `section-practice`: a single section with a section-level timer and
 *   free back/forward navigation.
 */
export type ExamMode = "full-exam" | "section-practice";

export interface Exam {
  id: ExamId;
  titleHe: string;
  mode: ExamMode;
  sections: ExamSection[];
  /** Overall time limit in seconds, if the exam is timed as a whole. */
  totalTimeLimitSeconds?: number;
  createdAt?: ISODateString;
}

/* -------------------------------------------------------------------------- */
/*                               User responses                               */
/* -------------------------------------------------------------------------- */

export interface UserResponse {
  questionId: QuestionId;
  sectionId: SectionId;
  questionType: QuestionType;
  /** `null` when the question was viewed but left unanswered. */
  selectedOptionIndex: OptionIndex | null;
  /** Computed when the response is scored; absent while the exam is live. */
  isCorrect?: boolean;
  /** Time spent on this question in milliseconds (summed across visits). */
  timeSpentMs: number;
  /** Flagged for review via the "mark for review" control. */
  flagged: boolean;
  /** Number of times the user changed their answer. */
  changeCount: number;
  answeredAt?: ISODateString;
}

/** In-progress attempt state, suitable for persisting and resuming. */
export type AttemptStatus = "not-started" | "in-progress" | "completed" | "abandoned";

export interface ExamAttempt {
  id: AttemptId;
  examId: ExamId;
  status: AttemptStatus;
  currentSectionId: SectionId | null;
  currentQuestionId: QuestionId | null;
  responses: Record<QuestionId, UserResponse>;
  startedAt: ISODateString;
  completedAt?: ISODateString;
}

/* -------------------------------------------------------------------------- */
/*                                 Results                                    */
/* -------------------------------------------------------------------------- */

/** Amirnet scaled score, an integer in the range 50–150. */
export type AmirnetScore = number;

/** Israeli higher-education English placement / exemption levels. */
export type EnglishLevel =
  | "pre-basic" // טרום בסיסי
  | "basic" // בסיסי
  | "advanced-a" // מתקדמים א׳
  | "advanced-b" // מתקדמים ב׳
  | "exempt"; // פטור

export interface RawScore {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  /** correct / total, 0–100. */
  percentage: number;
}

export interface TypeBreakdown extends RawScore {
  questionType: QuestionType;
}

export interface SectionResult extends RawScore {
  sectionId: SectionId;
  sectionType: QuestionType;
  timeSpentMs: number;
}

export interface TestResult {
  attemptId: AttemptId;
  examId: ExamId;
  mode: ExamMode;
  raw: RawScore;
  /** Estimated Amirnet score (50–150). */
  estimatedScore: AmirnetScore;
  estimatedLevel: EnglishLevel;
  totalTimeSpentMs: number;
  sectionResults: SectionResult[];
  breakdownByType: Record<QuestionType, TypeBreakdown>;
  responses: UserResponse[];
  startedAt: ISODateString;
  completedAt: ISODateString;
}
