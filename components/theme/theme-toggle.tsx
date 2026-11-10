"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const THEME_STORAGE_KEY = "amirnet:theme";

/**
 * Runs in <head> before first paint: applies the saved theme, or the OS
 * preference when nothing is saved, so the page never flashes the wrong theme.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const isDark = () => document.documentElement.classList.contains("dark");

function setTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    /* storage unavailable — theme still applies for this page view */
  }
  listeners.forEach((l) => l());
}

/** Day / night toggle. The choice is remembered in localStorage. */
export function ThemeToggle({ className }: { className?: string }) {
  // `null` on the server: render a neutral placeholder until the real theme is known.
  const dark = useSyncExternalStore(subscribe, isDark, () => null);
  const label = dark ? "מעבר למצב יום" : "מעבר למצב לילה";

  return (
    <button
      type="button"
      onClick={() => setTheme(!dark)}
      aria-label={label}
      title={label}
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300",
          dark === false ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300",
          dark === true ? "scale-100 rotate-0 opacity-100" : "scale-50 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
