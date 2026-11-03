/** Formats seconds as a countdown clock: 75 → "01:15", 3725 → "1:02:05". */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mmss = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${mmss}` : mmss;
}

/** Human-friendly Hebrew duration for summaries: 2340 → "39 דקות". */
export function formatMinutesHe(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  return minutes === 1 ? "דקה אחת" : `${minutes} דקות`;
}

/**
 * Hebrew duration for time-spent figures:
 * 0 → "—", 7300 → "7.3 שנ׳", 83000 → "1:23 דק׳".
 */
export function formatDurationHe(ms: number | null | undefined): string {
  if (ms == null || ms <= 0) return "—";
  // Compare after rounding so 59,960 ms shows as "1:00 דק׳", not "60.0 שנ׳".
  if (Math.round(ms / 100) < 600) return `${(ms / 1000).toFixed(1)} שנ׳`;
  return `${formatClock(Math.round(ms / 1000)).replace(/^0/, "")} דק׳`;
}
