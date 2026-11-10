import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  buildExamLayoutWithHistory,
  getPoolIds,
  materializeLayout,
  type ExamLayout,
  type ExamRuntimeSection,
} from "@/lib/exam-builder";
import { getSeenIds, markSeen, unmarkSeen } from "@/lib/seen-questions";
import { scoreResponses, type ScoreSummary } from "@/lib/scoring";
import type { ExamMode, OptionIndex, Question, QuestionId, QuestionType } from "@/types/exam";

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

/** Overall time limit for a full exam simulation. */
export const FULL_EXAM_DURATION_SECONDS = 39 * 60;

/** Section order in a full exam. */
export const SECTION_ORDER: readonly QuestionType[] = [
  "sentence-completion",
  "restatement",
  "reading-comprehension",
];

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type ExamStatus = "idle" | "in-progress" | "completed";
export type FinishReason = "submitted" | "time-up";

export type { ExamRuntimeSection };

/** Serializable exam state (no functions). */
export interface ExamData {
  mode: ExamMode | null;
  status: ExamStatus;
  /** Which questions this exam uses and their answer order (randomized per exam). */
  layout: ExamLayout;
  /** `layout` resolved to full questions, with options in display order. */
  sections: readonly ExamRuntimeSection[];
  currentSectionIndex: number;
  currentQuestionIndex: number;
  userAnswers: Record<QuestionId, OptionIndex>;
  /** Total time spent per question in ms, summed across visits. */
  timeSpentMs: Record<QuestionId, number>;

  /* Timing: all timestamps are epoch ms; remaining values are whole seconds. */
  startedAt: number | null;
  finishedAt: number | null;
  /** Deadline for the whole exam (full-exam) or the section (section-practice). */
  totalDeadline: number | null;
  /** Deadline for the current question. Full-exam only; `null` in practice mode. */
  questionDeadline: number | null;
  /** When the current question was entered, for time-spent tracking. */
  questionEnteredAt: number | null;
  totalTimeRemaining: number;
  questionTimeRemaining: number | null;

  finishReason: FinishReason | null;
  result: ScoreSummary | null;
}

export interface ExamActions {
  /**
   * Starts a new exam, discarding any previous one. Questions are drawn at
   * random per `SECTION_BLUEPRINT` and answer options are shuffled.
   */
  startExam: {
    (mode: "full-exam"): void;
    (mode: "section-practice", section: QuestionType): void;
  };
  /**
   * Records an answer. Ignored if no exam is running, the index is not 0–3,
   * or the question isn't in this exam. In full-exam mode only the current
   * question can be answered.
   */
  selectAnswer: (questionId: QuestionId, index: number) => void;
  /** Moves forward. No-op on the last question (call `finishExam`). */
  nextQuestion: () => void;
  /** Moves back. Section-practice only; no-op in full-exam mode. */
  prevQuestion: () => void;
  /** Ends the exam and computes the result. */
  finishExam: () => void;
  /**
   * Updates the timers and applies timeouts: auto-advances when a question
   * timer expires and finishes when the overall timer expires. Called by
   * `useExamTimer`; `now` can be injected for tests.
   */
  tick: (now?: number) => void;
  /** Returns to the idle state and removes the saved exam from sessionStorage. */
  reset: () => void;
}

export type ExamStore = ExamData & ExamActions;

/* -------------------------------------------------------------------------- */
/*                               Pure helpers                                 */
/* -------------------------------------------------------------------------- */

const INITIAL_DATA: ExamData = {
  mode: null,
  status: "idle",
  layout: [],
  sections: [],
  currentSectionIndex: 0,
  currentQuestionIndex: 0,
  userAnswers: {},
  timeSpentMs: {},
  startedAt: null,
  finishedAt: null,
  totalDeadline: null,
  questionDeadline: null,
  questionEnteredAt: null,
  totalTimeRemaining: 0,
  questionTimeRemaining: null,
  finishReason: null,
  result: null,
};

interface Position {
  sectionIndex: number;
  questionIndex: number;
}

const secondsLeft = (deadline: number, now: number) => Math.max(0, Math.ceil((deadline - now) / 1000));

function allQuestions(data: ExamData): Question[] {
  return data.sections.flatMap((s) => s.questions);
}

function questionAt(data: ExamData, pos: Position): Question | undefined {
  return data.sections[pos.sectionIndex]?.questions[pos.questionIndex];
}

function currentPosition(data: ExamData): Position {
  return { sectionIndex: data.currentSectionIndex, questionIndex: data.currentQuestionIndex };
}

function nextPosition(data: ExamData): Position | null {
  const { sectionIndex: s, questionIndex: q } = currentPosition(data);
  if (q + 1 < (data.sections[s]?.questions.length ?? 0)) return { sectionIndex: s, questionIndex: q + 1 };
  for (let i = s + 1; i < data.sections.length; i++) {
    if (data.sections[i].questions.length > 0) return { sectionIndex: i, questionIndex: 0 };
  }
  return null;
}

function prevPosition(data: ExamData): Position | null {
  const { sectionIndex: s, questionIndex: q } = currentPosition(data);
  if (q > 0) return { sectionIndex: s, questionIndex: q - 1 };
  for (let i = s - 1; i >= 0; i--) {
    const len = data.sections[i].questions.length;
    if (len > 0) return { sectionIndex: i, questionIndex: len - 1 };
  }
  return null;
}

/** Adds the time spent on the current question up to `at`. */
function accrueTime(data: ExamData, at: number): Record<QuestionId, number> {
  const q = questionAt(data, currentPosition(data));
  if (!q || data.questionEnteredAt == null) return data.timeSpentMs;
  const elapsed = Math.max(0, at - data.questionEnteredAt);
  return { ...data.timeSpentMs, [q.id]: (data.timeSpentMs[q.id] ?? 0) + elapsed };
}

/** Per-question deadline, never later than the overall deadline. */
function questionDeadlineFor(data: ExamData, pos: Position, enteredAt: number): number | null {
  if (data.mode !== "full-exam" || data.totalDeadline == null) return null;
  const q = questionAt(data, pos);
  if (!q) return null;
  return Math.min(enteredAt + q.timeLimitSeconds * 1000, data.totalDeadline);
}

function withRemaining(data: ExamData, now: number): ExamData {
  return {
    ...data,
    totalTimeRemaining: data.totalDeadline == null ? 0 : secondsLeft(data.totalDeadline, now),
    questionTimeRemaining: data.questionDeadline == null ? null : secondsLeft(data.questionDeadline, now),
  };
}

/** Moves to `pos` at time `at`, closing out time spent on the current question. */
function moveTo(data: ExamData, pos: Position, at: number): ExamData {
  return withRemaining(
    {
      ...data,
      timeSpentMs: accrueTime(data, at),
      currentSectionIndex: pos.sectionIndex,
      currentQuestionIndex: pos.questionIndex,
      questionEnteredAt: at,
      questionDeadline: questionDeadlineFor(data, pos, at),
    },
    at,
  );
}

function finish(data: ExamData, at: number, reason: FinishReason): ExamData {
  return {
    ...data,
    status: "completed",
    timeSpentMs: accrueTime(data, at),
    finishedAt: at,
    finishReason: reason,
    questionEnteredAt: null,
    questionDeadline: null,
    totalTimeRemaining: data.totalDeadline == null ? 0 : secondsLeft(data.totalDeadline, at),
    questionTimeRemaining: null,
    result: scoreResponses(allQuestions(data), data.userAnswers),
  };
}

/** Pulls only the data fields out of the store (drops actions). */
function dataOf(store: ExamStore): ExamData {
  const data = {} as Record<string, unknown>;
  for (const key of Object.keys(INITIAL_DATA)) data[key] = store[key as keyof ExamData];
  return data as unknown as ExamData;
}

const isOptionIndex = (n: number): n is OptionIndex => Number.isInteger(n) && n >= 0 && n <= 3;

/* -------------------------------------------------------------------------- */
/*                                Persistence                                 */
/* -------------------------------------------------------------------------- */

export const EXAM_STORAGE_KEY = "amirnet-exam";

/**
 * What is written to sessionStorage. Only the compact `layout` (question ids and
 * answer order) is saved; full questions are rebuilt from the bank on load. This
 * keeps the payload small (it is rewritten on every timer tick) and restores the
 * same randomized exam after a refresh.
 */
type PersistedExam = Omit<ExamData, "sections">;

function toPersisted(store: ExamStore): PersistedExam {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sections, ...rest } = dataOf(store);
  return rest;
}

function fromPersisted(persisted: unknown, current: ExamStore): ExamStore {
  const p = persisted as Partial<PersistedExam> | null | undefined;
  if (!p || p.status === "idle") return current;
  // A layout referring to questions that no longer exist (bank changed) → drop the saved exam.
  const sections = materializeLayout(p.layout);
  if (!sections) return current;
  const restored: ExamStore = { ...current, ...p, sections };
  if (restored.status === "in-progress" && !questionAt(restored, currentPosition(restored))) return current;
  return restored;
}

/**
 * Saves the served questions / passages to "seen" history. When a section's
 * whole pool has now been seen, its history restarts (keeping only what was
 * just served), so the next exams cycle through the bank again.
 */
function recordServed(types: readonly QuestionType[], servedIds: readonly string[]): void {
  markSeen(servedIds);
  const seen = getSeenIds();
  const served = new Set(servedIds);
  for (const type of types) {
    const pool = getPoolIds(type);
    if (pool.every((id) => seen.has(id))) unmarkSeen(pool.filter((id) => !served.has(id)));
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Store                                   */
/* -------------------------------------------------------------------------- */

/**
 * The store saves itself to sessionStorage, so a refresh mid-exam resumes where
 * it left off. Timers are deadline-based, so time keeps running while the page
 * is closed, as on the real exam. Hydration is manual (`skipHydration`) to avoid
 * SSR mismatches; components call `useExamHydration()` before reading state.
 */
export const useExamStore = create<ExamStore>()(
  persist(
    (set, get, api) => {
      const startExam = (mode: ExamMode, section?: QuestionType): void => {
        const types = mode === "full-exam" ? SECTION_ORDER : section ? [section] : [];
        const { layout, servedIds } = buildExamLayoutWithHistory(types, getSeenIds());
        const sections = materializeLayout(layout) ?? [];
        const questionCount = sections.reduce((n, s) => n + s.questions.length, 0);
        if (questionCount === 0) {
          console.warn(
            `[exam] startExam: no questions available for ${mode}${section ? ` / ${section}` : ""}`,
          );
          return;
        }

        const now = Date.now();
        // Section practice: the section gets the sum of its questions' time limits.
        const totalSeconds =
          mode === "full-exam"
            ? FULL_EXAM_DURATION_SECONDS
            : sections[0].questions.reduce((sum, q) => sum + q.timeLimitSeconds, 0);

        const base: ExamData = {
          ...INITIAL_DATA,
          mode,
          status: "in-progress",
          layout,
          sections,
          startedAt: now,
          totalDeadline: now + totalSeconds * 1000,
        };
        recordServed(types, servedIds);
        // Drop any previous exam from sessionStorage before saving the new one.
        // `persist` is absent when sessionStorage is unavailable; the exam still works, unsaved.
        api.persist?.clearStorage();
        set(moveTo(base, { sectionIndex: 0, questionIndex: 0 }, now));
      };

      return {
        ...INITIAL_DATA,

        startExam,

        selectAnswer: (questionId, index) => {
          const data = dataOf(get());
          if (data.status !== "in-progress" || !isOptionIndex(index)) return;
          if (data.mode === "full-exam") {
            if (questionAt(data, currentPosition(data))?.id !== questionId) return;
          } else if (!allQuestions(data).some((q) => q.id === questionId)) {
            return;
          }
          set({ userAnswers: { ...data.userAnswers, [questionId]: index } });
        },

        nextQuestion: () => {
          const data = dataOf(get());
          if (data.status !== "in-progress") return;
          const next = nextPosition(data);
          if (next) set(moveTo(data, next, Date.now()));
        },

        prevQuestion: () => {
          const data = dataOf(get());
          if (data.status !== "in-progress" || data.mode === "full-exam") return;
          const prev = prevPosition(data);
          if (prev) set(moveTo(data, prev, Date.now()));
        },

        finishExam: () => {
          const data = dataOf(get());
          if (data.status !== "in-progress") return;
          set(finish(data, Date.now(), "submitted"));
        },

        tick: (now = Date.now()) => {
          let data = dataOf(get());
          if (data.status !== "in-progress" || data.totalDeadline == null) return;

          // Overall time is up.
          if (now >= data.totalDeadline) {
            set(finish(data, data.totalDeadline, "time-up"));
            return;
          }

          // Question timeouts. Loop so that a long pause (sleeping laptop, throttled
          // tab) uses up each expired question in turn; each next question starts
          // at the previous deadline rather than at `now`.
          while (data.questionDeadline != null && now >= data.questionDeadline) {
            const expiredAt = data.questionDeadline;
            const next = nextPosition(data);
            if (!next) {
              set(finish(data, expiredAt, "time-up"));
              return;
            }
            data = moveTo(data, next, expiredAt);
          }

          const updated = withRemaining(data, now);
          const prev = get();
          // Skip the update (and the re-renders) when nothing visible changed.
          if (
            updated.currentSectionIndex === prev.currentSectionIndex &&
            updated.currentQuestionIndex === prev.currentQuestionIndex &&
            updated.totalTimeRemaining === prev.totalTimeRemaining &&
            updated.questionTimeRemaining === prev.questionTimeRemaining
          ) {
            return;
          }
          set(updated);
        },

        reset: () => {
          set(INITIAL_DATA);
          // `set` re-saves the idle state; remove the entry so nothing is left behind.
          // `persist` is absent when sessionStorage is unavailable; the exam still works, unsaved.
          api.persist?.clearStorage();
        },
      };
    },
    {
      name: EXAM_STORAGE_KEY,
      // v2: saves the randomized `layout`. Older saves (v1) are discarded.
      version: 2,
      migrate: () => ({}),
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: toPersisted,
      merge: fromPersisted,
      // Catch up on time that passed while the page was closed.
      onRehydrateStorage: () => (state) => state?.tick(),
    },
  ),
);

/* -------------------------------------------------------------------------- */
/*                                  Selectors                                 */
/* -------------------------------------------------------------------------- */
// Each selector returns a primitive or an existing reference, so they are
// safe to pass straight to `useExamStore(selector)` without `useShallow`.

export const selectCurrentSection = (s: ExamStore): ExamRuntimeSection | null =>
  s.sections[s.currentSectionIndex] ?? null;

export const selectCurrentQuestion = (s: ExamStore): Question | null =>
  s.sections[s.currentSectionIndex]?.questions[s.currentQuestionIndex] ?? null;

export const selectCurrentAnswer = (s: ExamStore): OptionIndex | null => {
  const q = selectCurrentQuestion(s);
  return q ? (s.userAnswers[q.id] ?? null) : null;
};

/** 1-based position of the current question across all sections. */
export const selectQuestionNumber = (s: ExamStore): number =>
  s.sections.slice(0, s.currentSectionIndex).reduce((n, sec) => n + sec.questions.length, 0) +
  s.currentQuestionIndex +
  1;

export const selectTotalQuestions = (s: ExamStore): number =>
  s.sections.reduce((n, sec) => n + sec.questions.length, 0);

export const selectAnsweredCount = (s: ExamStore): number => Object.keys(s.userAnswers).length;

export const selectIsLastQuestion = (s: ExamStore): boolean =>
  s.status === "in-progress" && nextPosition(s) === null;

export const selectCanGoBack = (s: ExamStore): boolean =>
  s.status === "in-progress" && s.mode === "section-practice" && prevPosition(s) !== null;
