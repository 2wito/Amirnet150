import rawBank from "@/data/questions.json";
import type {
  Passage,
  PassageId,
  Question,
  QuestionBank,
  QuestionByType,
  QuestionId,
  QuestionType,
} from "@/types/exam";

/**
 * Typed access to `data/questions.json`.
 *
 * JSON imports are typed loosely (e.g. `type: string`, `options: string[]`),
 * so the bank is checked once on load. A malformed item fails fast in dev
 * and at build time instead of breaking an exam mid-session.
 */

function assertQuestion(q: Question, expectedType: QuestionType, where: string): void {
  const fail = (msg: string) => {
    throw new Error(`[questions.json] ${where} (${q.id ?? "no id"}): ${msg}`);
  };
  if (!q.id) fail("missing id");
  if (q.type !== expectedType) fail(`expected type "${expectedType}", got "${q.type}"`);
  if (!q.stem?.trim()) fail("missing stem");
  if (!Array.isArray(q.options) || q.options.length !== 4) fail("options must have exactly 4 items");
  if (![0, 1, 2, 3].includes(q.correctOptionIndex)) fail("correctOptionIndex must be 0–3");
  if (!(q.timeLimitSeconds > 0)) fail("timeLimitSeconds must be a positive number");
  if (!q.explanation?.trim()) fail("missing explanation");
}

function validateQuestionBank(bank: QuestionBank): QuestionBank {
  const seen = new Set<string>();
  const checkUnique = (id: string) => {
    if (seen.has(id)) throw new Error(`[questions.json] duplicate id "${id}"`);
    seen.add(id);
  };

  bank.sentenceCompletion.forEach((q, i) => {
    assertQuestion(q, "sentence-completion", `sentenceCompletion[${i}]`);
    checkUnique(q.id);
  });
  bank.restatement.forEach((q, i) => {
    assertQuestion(q, "restatement", `restatement[${i}]`);
    checkUnique(q.id);
  });
  bank.readingComprehension.forEach((p, i) => {
    if (!p.paragraphs?.length) throw new Error(`[questions.json] passage ${p.id}: no paragraphs`);
    checkUnique(p.id);
    p.questions.forEach((q, j) => {
      assertQuestion(q, "reading-comprehension", `readingComprehension[${i}].questions[${j}]`);
      if (q.passageId !== p.id) {
        throw new Error(`[questions.json] ${q.id}: passageId "${q.passageId}" ≠ parent "${p.id}"`);
      }
      checkUnique(q.id);
    });
  });
  return bank;
}

export const questionBank: QuestionBank = validateQuestionBank(rawBank as unknown as QuestionBank);

/** Every question in the bank, flattened (RC questions included). */
export function getAllQuestions(): Question[] {
  return [
    ...questionBank.sentenceCompletion,
    ...questionBank.restatement,
    ...questionBank.readingComprehension.flatMap((p) => p.questions),
  ];
}

export function getQuestionsByType<T extends QuestionType>(type: T): QuestionByType<T>[] {
  return getAllQuestions().filter((q): q is QuestionByType<T> => q.type === type);
}

export function getQuestionById(id: QuestionId): Question | undefined {
  return getAllQuestions().find((q) => q.id === id);
}

export function getPassageById(id: PassageId): Passage | undefined {
  return questionBank.readingComprehension.find((p) => p.id === id);
}
