"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useExamStore } from "@/lib/useExamStore";

const subscribe = (onChange: () => void) => useExamStore.persist.onFinishHydration(onChange);
const getSnapshot = () => useExamStore.persist.hasHydrated();
const getServerSnapshot = () => false;

/**
 * Loads the saved exam from sessionStorage (once per page load) and returns
 * `true` when it's done. Until then, components should render a placeholder
 * instead of reading exam state, and must not start an exam (a late hydration
 * would overwrite it).
 */
export function useExamHydration(): boolean {
  const hydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!useExamStore.persist.hasHydrated()) void useExamStore.persist.rehydrate();
  }, []);

  return hydrated;
}
