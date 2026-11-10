import { QUESTION_TYPE_LABELS_HE } from "@/lib/exam-constants";
import { getQuestionById, questionBank } from "@/lib/question-bank";
import type { AnswerOptions, OptionIndex, Question, QuestionId, QuestionType } from "@/types/exam";

/**
 * Builds randomized exams from the question bank.
 *
 * An exam is described by a small, serializable `ExamLayout` (which questions,
 * in which order, with which answer order). The layout is what gets saved to
 * sessionStorage; `materializeLayout` turns it back into full questions, so a
 * refresh restores exactly the same exam instead of rolling a new one.
 */

/* -------------------------------------------------------------------------- */
/*                                 Randomness                                 */
/* -------------------------------------------------------------------------- */

/** Returns a float in [0, 1), like `Math.random`. */
export type Rng = () => number;

/** Small deterministic PRNG (mulberry32) for reproducible exams and tests. */
export function createSeededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle. Returns a new array; the input is not modified. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** `count` distinct random items (all of them, shuffled, if there are fewer). */
export function sample<T>(items: readonly T[], count: number, rng: Rng = Math.random): T[] {
  return shuffle(items, rng).slice(0, Math.max(0, count));
}

/* -------------------------------------------------------------------------- */
/*                               Option shuffling                             */
/* -------------------------------------------------------------------------- */

/**
 * `order[i]` is the authored index of the option shown in position `i`.
 * E.g. [2, 0, 3, 1] shows authored option 2 first.
 */
export type OptionOrder = readonly [OptionIndex, OptionIndex, OptionIndex, OptionIndex];

export const IDENTITY_ORDER: OptionOrder = [0, 1, 2, 3];

export function isValidOptionOrder(order: unknown): order is OptionOrder {
  return (
    Array.isArray(order) &&
    order.length === 4 &&
    [...order].sort().join() === "0,1,2,3" &&
    order.every((n) => Number.isInteger(n))
  );
}

export function randomOptionOrder(question: Question, rng: Rng = Math.random): OptionOrder {
  if (question.fixedOptionOrder) return IDENTITY_ORDER;
  return shuffle(IDENTITY_ORDER, rng) as unknown as OptionOrder;
}

/**
 * Returns a copy of the question with its options reordered and
 * `correctOptionIndex` / `optionExplanations` remapped to match.
 */
export function applyOptionOrder<Q extends Question>(question: Q, order: OptionOrder): Q {
  const toDisplayed = (authored: OptionIndex) => order.indexOf(authored) as OptionIndex;

  let optionExplanations = question.optionExplanations;
  if (optionExplanations) {
    optionExplanations = Object.fromEntries(
      Object.entries(optionExplanations).map(([k, v]) => [toDisplayed(Number(k) as OptionIndex), v]),
    ) as Q["optionExplanations"];
  }

  return {
    ...question,
    options: order.map((i) => question.options[i]) as unknown as AnswerOptions,
    correctOptionIndex: toDisplayed(question.correctOptionIndex),
    ...(optionExplanations && { optionExplanations }),
  };
}

/* -------------------------------------------------------------------------- */
/*                                  Blueprint                                 */
/* -------------------------------------------------------------------------- */

/**
 * How much of each section an exam draws. Sentence completion and restatement
 * count questions; reading comprehension counts passages (each passage brings
 * all of its questions, in their original order). Capped by what the bank has.
 */
export const SECTION_BLUEPRINT: Record<QuestionType, number> = {
  "sentence-completion": 8,
  restatement: 6,
  "reading-comprehension": 2,
};

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */

export interface LayoutItem {
  questionId: QuestionId;
  optionOrder: OptionOrder;
}

export interface SectionLayout {
  type: QuestionType;
  items: LayoutItem[];
}

/** Serializable description of one generated exam. */
export type ExamLayout = SectionLayout[];

export interface ExamRuntimeSection {
  type: QuestionType;
  titleHe: string;
  questions: readonly Question[];
}

/**
 * The selectable units of a section: questions for sentence completion and
 * restatement, passages for reading comprehension. Each has an `id`, which is
 * what "seen" history tracks.
 */
function poolFor(type: QuestionType): readonly { id: string }[] {
  if (type === "reading-comprehension") return questionBank.readingComprehension;
  return type === "sentence-completion" ? questionBank.sentenceCompletion : questionBank.restatement;
}

/** IDs of every selectable unit (question or passage) of a section. */
export function getPoolIds(type: QuestionType): string[] {
  return poolFor(type).map((item) => item.id);
}

/**
 * `count` random items, taking unseen ones first and topping up from seen ones
 * only when there aren't enough unseen items left.
 */
function sampleFresh<T extends { id: string }>(
  pool: readonly T[],
  count: number,
  seen: ReadonlySet<string>,
  rng: Rng,
): T[] {
  const unseen = pool.filter((item) => !seen.has(item.id));
  const fresh = sample(unseen, count, rng);
  if (fresh.length >= count) return fresh;
  const rest = sample(
    pool.filter((item) => seen.has(item.id)),
    count - fresh.length,
    rng,
  );
  return shuffle([...fresh, ...rest], rng);
}

/** The units picked for one section: their IDs (for history) and their questions. */
function pickQuestions(type: QuestionType, rng: Rng, seen: ReadonlySet<string>): { unitIds: string[]; questions: Question[] } {
  const count = SECTION_BLUEPRINT[type];
  if (type === "reading-comprehension") {
    const passages = sampleFresh(questionBank.readingComprehension, count, seen, rng);
    return { unitIds: passages.map((p) => p.id), questions: passages.flatMap((p) => p.questions) };
  }
  const pool: readonly Question[] =
    type === "sentence-completion" ? questionBank.sentenceCompletion : questionBank.restatement;
  const questions = sampleFresh(pool, count, seen, rng);
  return { unitIds: questions.map((q) => q.id), questions };
}

/**
 * Randomly selects questions for each section (in the given order) and shuffles
 * their options. Items whose IDs are in `seen` are only used once a section has
 * run out of unseen ones. `servedIds` lists the question / passage IDs used.
 */
export function buildExamLayoutWithHistory(
  types: readonly QuestionType[],
  seen: ReadonlySet<string> = new Set(),
  rng: Rng = Math.random,
): { layout: ExamLayout; servedIds: string[] } {
  const servedIds: string[] = [];
  const layout = types
    .map((type) => {
      const { unitIds, questions } = pickQuestions(type, rng, seen);
      servedIds.push(...unitIds);
      return {
        type,
        items: questions.map((q) => ({ questionId: q.id, optionOrder: randomOptionOrder(q, rng) })),
      };
    })
    .filter((s) => s.items.length > 0);
  return { layout, servedIds };
}

/** Randomly selects questions for each section (in the given order) and shuffles their options. */
export function buildExamLayout(types: readonly QuestionType[], rng: Rng = Math.random): ExamLayout {
  return buildExamLayoutWithHistory(types, new Set(), rng).layout;
}

/**
 * Turns a layout back into full questions with shuffled options.
 * Returns `null` if the layout is malformed or refers to questions that no
 * longer exist (e.g. a saved exam from an older question bank).
 */
export function materializeLayout(layout: unknown): ExamRuntimeSection[] | null {
  if (!Array.isArray(layout)) return null;
  const sections: ExamRuntimeSection[] = [];
  for (const section of layout as SectionLayout[]) {
    if (!section || !(section.type in QUESTION_TYPE_LABELS_HE) || !Array.isArray(section.items)) return null;
    const questions: Question[] = [];
    for (const item of section.items) {
      const question = getQuestionById(item?.questionId);
      if (!question || question.type !== section.type || !isValidOptionOrder(item.optionOrder)) return null;
      questions.push(applyOptionOrder(question, item.optionOrder));
    }
    sections.push({ type: section.type, titleHe: QUESTION_TYPE_LABELS_HE[section.type], questions });
  }
  return sections;
}

/* -------------------------------------------------------------------------- */
/*                                  Estimates                                 */
/* -------------------------------------------------------------------------- */

/**
 * Expected question count and total question time for one section of a
 * generated exam (reading uses the average passage), for display before starting.
 */
export function estimateSection(type: QuestionType): { questionCount: number; seconds: number } {
  const n = SECTION_BLUEPRINT[type];
  if (type === "reading-comprehension") {
    const passages = questionBank.readingComprehension;
    if (passages.length === 0) return { questionCount: 0, seconds: 0 };
    const avg = (f: (qs: Question[]) => number) =>
      passages.reduce((sum, p) => sum + f(p.questions), 0) / passages.length;
    const used = Math.min(n, passages.length);
    return {
      questionCount: Math.round(avg((qs) => qs.length) * used),
      seconds: Math.round(avg((qs) => qs.reduce((s, q) => s + q.timeLimitSeconds, 0)) * used),
    };
  }
  const pool = type === "sentence-completion" ? questionBank.sentenceCompletion : questionBank.restatement;
  const used = Math.min(n, pool.length);
  const avgSeconds = pool.length ? pool.reduce((s, q) => s + q.timeLimitSeconds, 0) / pool.length : 0;
  return { questionCount: used, seconds: Math.round(avgSeconds * used) };
}
