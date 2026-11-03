import type {
  AmirnetScore,
  EnglishLevel,
  OptionIndex,
  Question,
  QuestionId,
  QuestionType,
  RawScore,
  TypeBreakdown,
  UserResponse,
} from "@/types/exam";

/**
 * Scoring engine for practice exams.
 *
 * IMPORTANT: the real Amirnet is a computerized *adaptive* test scored by NITE
 * with item-response models, and that conversion is not public. The 50–150
 * conversion here is a transparent linear estimate meant for practice
 * feedback, not a prediction of an official score.
 */

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

export const AMIRNET_MIN_SCORE = 50;
export const AMIRNET_MAX_SCORE = 150;

export interface LevelBand {
  level: EnglishLevel;
  labelHe: string;
  labelEn: string;
  minScore: AmirnetScore;
  maxScore: AmirnetScore;
}

/** Israeli higher-education English exemption levels, highest first. */
export const LEVEL_BANDS: readonly LevelBand[] = [
  { level: "exempt", labelHe: "פטור", labelEn: "Exempt", minScore: 134, maxScore: 150 },
  { level: "advanced-b", labelHe: "מתקדמים ב׳", labelEn: "Advanced B", minScore: 120, maxScore: 133 },
  { level: "advanced-a", labelHe: "מתקדמים א׳", labelEn: "Advanced A", minScore: 100, maxScore: 119 },
  { level: "basic", labelHe: "בסיסי", labelEn: "Basic", minScore: 85, maxScore: 99 },
  { level: "pre-basic", labelHe: "טרום בסיסי", labelEn: "Pre-Basic", minScore: 50, maxScore: 84 },
] as const;

/* -------------------------------------------------------------------------- */
/*                                   Inputs                                   */
/* -------------------------------------------------------------------------- */

/**
 * Responses can be passed either as `UserResponse` objects or as a simple
 * map of questionId → selected option (null = unanswered).
 */
export type ResponseInput =
  | ReadonlyArray<Pick<UserResponse, "questionId" | "selectedOptionIndex">>
  | Readonly<Record<QuestionId, OptionIndex | null | undefined>>
  | ReadonlyMap<QuestionId, OptionIndex | null>;

function toAnswerMap(responses: ResponseInput): ReadonlyMap<QuestionId, OptionIndex | null> {
  if (responses instanceof Map) return responses;
  const map = new Map<QuestionId, OptionIndex | null>();
  if (Array.isArray(responses)) {
    for (const r of responses) map.set(r.questionId, r.selectedOptionIndex);
  } else {
    for (const [id, value] of Object.entries(responses)) map.set(id, value ?? null);
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Round to one decimal place, avoiding floating-point noise in percentages. */
const round1 = (value: number) => Math.round(value * 10) / 10;

export function isCorrect(question: Question, selected: OptionIndex | null | undefined): boolean {
  return selected != null && selected === question.correctOptionIndex;
}

/* -------------------------------------------------------------------------- */
/*                              1. Raw percentage                             */
/* -------------------------------------------------------------------------- */

/**
 * Counts correct / incorrect / unanswered over `questions` and returns the
 * raw percentage (0–100, one decimal). Unanswered questions count as wrong,
 * as on the real exam (no guessing penalty). Responses to questions not in
 * `questions` are ignored.
 */
export function calculateRawScore(questions: readonly Question[], responses: ResponseInput): RawScore {
  const answers = toAnswerMap(responses);
  let correct = 0;
  let unanswered = 0;

  for (const q of questions) {
    const selected = answers.get(q.id);
    if (selected == null) unanswered++;
    else if (isCorrect(q, selected)) correct++;
  }

  const total = questions.length;
  return {
    total,
    correct,
    incorrect: total - correct - unanswered,
    unanswered,
    percentage: total === 0 ? 0 : round1((correct / total) * 100),
  };
}

/**
 * Like the raw percentage, but each question counts by its difficulty (1–5),
 * so harder questions are worth more. Approximates adaptive scoring, where
 * solving harder items raises the estimate more. Returns 0–100.
 */
export function calculateWeightedPercentage(questions: readonly Question[], responses: ResponseInput): number {
  const answers = toAnswerMap(responses);
  let earned = 0;
  let possible = 0;
  for (const q of questions) {
    possible += q.difficulty;
    if (isCorrect(q, answers.get(q.id))) earned += q.difficulty;
  }
  return possible === 0 ? 0 : round1((earned / possible) * 100);
}

/* -------------------------------------------------------------------------- */
/*                        2. Raw → Amirnet scale (50–150)                     */
/* -------------------------------------------------------------------------- */

/**
 * Linear conversion: 0% → 50, 100% → 150, rounded to an integer.
 * Input is clamped to 0–100.
 */
export function rawToAmirnetScore(percentage: number): AmirnetScore {
  const p = clamp(Number.isFinite(percentage) ? percentage : 0, 0, 100);
  const score = AMIRNET_MIN_SCORE + (p / 100) * (AMIRNET_MAX_SCORE - AMIRNET_MIN_SCORE);
  return Math.round(score);
}

/* -------------------------------------------------------------------------- */
/*                            3. Score → level                                */
/* -------------------------------------------------------------------------- */

/** Maps a 50–150 score to its exemption level. Out-of-range input is clamped. */
export function getLevelForScore(score: AmirnetScore): LevelBand {
  const s = clamp(Math.round(score), AMIRNET_MIN_SCORE, AMIRNET_MAX_SCORE);
  // Bands are contiguous and cover 50–150, so a match always exists.
  return LEVEL_BANDS.find((b) => s >= b.minScore)!;
}

/** Points still needed to reach the next level, or `null` if already exempt. */
export function pointsToNextLevel(score: AmirnetScore): { next: LevelBand; points: number } | null {
  const current = getLevelForScore(score);
  const idx = LEVEL_BANDS.indexOf(current);
  if (idx === 0) return null;
  const next = LEVEL_BANDS[idx - 1];
  return { next, points: next.minScore - Math.round(score) };
}

/* -------------------------------------------------------------------------- */
/*                               Full pipeline                                */
/* -------------------------------------------------------------------------- */

export type ScoringMethod = "raw" | "difficulty-weighted";

export interface ScoreSummary {
  raw: RawScore;
  /** Percentage actually used for conversion (raw or weighted). */
  scoredPercentage: number;
  method: ScoringMethod;
  score: AmirnetScore;
  level: LevelBand;
  breakdownByType: Record<QuestionType, TypeBreakdown>;
}

const QUESTION_TYPES: readonly QuestionType[] = [
  "sentence-completion",
  "restatement",
  "reading-comprehension",
];

/** Raw scores per question type, so the dashboard can show strengths and weaknesses. */
export function calculateBreakdownByType(
  questions: readonly Question[],
  responses: ResponseInput,
): Record<QuestionType, TypeBreakdown> {
  const answers = toAnswerMap(responses);
  return Object.fromEntries(
    QUESTION_TYPES.map((type) => [
      type,
      { questionType: type, ...calculateRawScore(questions.filter((q) => q.type === type), answers) },
    ]),
  ) as Record<QuestionType, TypeBreakdown>;
}

/**
 * Scores a set of responses: raw → scaled (50–150) → level, plus per-type breakdown.
 *
 * @example
 * const summary = scoreResponses(getAllQuestions(), { "sc-001": 1, "rs-002": 0 });
 * summary.score;        // e.g. 61
 * summary.level.labelHe // "טרום בסיסי"
 */
export function scoreResponses(
  questions: readonly Question[],
  responses: ResponseInput,
  options: { method?: ScoringMethod } = {},
): ScoreSummary {
  const method = options.method ?? "raw";
  const answers = toAnswerMap(responses);
  const raw = calculateRawScore(questions, answers);
  const scoredPercentage =
    method === "difficulty-weighted" ? calculateWeightedPercentage(questions, answers) : raw.percentage;
  const score = rawToAmirnetScore(scoredPercentage);

  return {
    raw,
    scoredPercentage,
    method,
    score,
    level: getLevelForScore(score),
    breakdownByType: calculateBreakdownByType(questions, answers),
  };
}
