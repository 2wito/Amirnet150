import { Award, GraduationCap, Medal, Sprout, TrendingUp, type LucideIcon } from "lucide-react";
import type { LevelBand } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { EnglishLevel } from "@/types/exam";

/** Color + icon per exemption level (lowest → highest: red → amber → sky → indigo → green). */
const LEVEL_STYLES: Record<EnglishLevel, { className: string; dot: string; icon: LucideIcon }> = {
  "pre-basic": {
    className: "border-level-pre-basic/30 bg-level-pre-basic/10 text-level-pre-basic",
    dot: "bg-level-pre-basic",
    icon: Sprout,
  },
  basic: {
    className: "border-level-basic/35 bg-level-basic/10 text-level-basic",
    dot: "bg-level-basic",
    icon: TrendingUp,
  },
  "advanced-a": {
    className: "border-level-advanced-a/30 bg-level-advanced-a/10 text-level-advanced-a",
    dot: "bg-level-advanced-a",
    icon: GraduationCap,
  },
  "advanced-b": {
    className: "border-level-advanced-b/30 bg-level-advanced-b/10 text-level-advanced-b",
    dot: "bg-level-advanced-b",
    icon: Medal,
  },
  exempt: {
    className: "border-level-exempt/30 bg-level-exempt/10 text-level-exempt",
    dot: "bg-level-exempt",
    icon: Award,
  },
};

export function levelDotClass(level: EnglishLevel): string {
  return LEVEL_STYLES[level].dot;
}

/**
 * Pill showing an exemption level, optionally with its score range.
 * The range is numeric, so it is rendered LTR inside the RTL label.
 */
export function LevelBadge({
  band,
  showRange = false,
  size = "md",
  className,
}: {
  band: LevelBand;
  showRange?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { className: tone, icon: Icon } = LEVEL_STYLES[band.level];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        size === "sm" && "px-2.5 py-0.5 text-xs [&>svg]:size-3.5",
        size === "md" && "px-3 py-1 text-sm [&>svg]:size-4",
        size === "lg" && "px-4 py-1.5 text-base [&>svg]:size-5",
        tone,
        className,
      )}
    >
      <Icon aria-hidden />
      {band.labelHe}
      {showRange && (
        <span dir="ltr" className="font-exam font-medium tabular-nums opacity-80">
          {band.minScore}–{band.maxScore}
        </span>
      )}
    </span>
  );
}
