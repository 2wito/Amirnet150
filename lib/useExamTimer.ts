"use client";

import { useEffect } from "react";
import { useExamStore } from "@/lib/useExamStore";

/**
 * Drives the exam clock while an exam is in progress. Mount it once in the
 * exam screen. Timing is based on deadlines, so a slow or throttled interval
 * doesn't cause drift; it only makes updates less frequent. The store also
 * ticks immediately when the tab becomes visible again.
 */
export function useExamTimer(intervalMs = 250): void {
  const status = useExamStore((s) => s.status);
  const tick = useExamStore((s) => s.tick);

  useEffect(() => {
    if (status !== "in-progress") return;

    const run = () => tick(Date.now());
    run();
    const id = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", run);
    };
  }, [status, tick, intervalMs]);
}
