/**
 * Remembers (per browser, in localStorage) which questions and passages the
 * learner has already been given, so new exams prefer material they haven't
 * seen yet. Once every item of a pool has been seen, that pool starts over.
 *
 * All access is best-effort: in private mode or with storage blocked, exams
 * simply fall back to plain random selection.
 */

const STORAGE_KEY = "amirnet:seen-items";

function read(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function write(ids: Set<string>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* storage unavailable — ignore */
  }
}

/** IDs (questions and passages) already served in this browser. Empty on the server. */
export function getSeenIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return read();
}

/** Records that these question / passage IDs were served. */
export function markSeen(ids: readonly string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const seen = read();
  ids.forEach((id) => seen.add(id));
  write(seen);
}

/** Forgets the given IDs (used when a pool is exhausted and starts over). */
export function unmarkSeen(ids: readonly string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const seen = read();
  ids.forEach((id) => seen.delete(id));
  write(seen);
}

/** Clears all history. */
export function resetSeen(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
