import { Hourglass, Timer } from "lucide-react";
import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  label: string;
  seconds: number;
  /** Turns the timer red with a soft pulse. */
  urgent?: boolean;
  /** Larger, emphasized style for the timer that matters most right now. */
  primary?: boolean;
  variant?: "question" | "total";
}

export function ExamTimer({ label, seconds, urgent = false, primary = false, variant = "total" }: ExamTimerProps) {
  const Icon = variant === "question" ? Timer : Hourglass;

  return (
    <div
      role="timer"
      aria-label={`${label}: ${formatClock(seconds)}`}
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors",
        primary ? "bg-muted/60" : "bg-background",
        urgent && "border-destructive/40 bg-destructive/10 text-destructive motion-safe:animate-timer-pulse",
      )}
    >
      <Icon className={cn("size-4 shrink-0", !urgent && "text-muted-foreground")} aria-hidden />
      <div className="flex flex-col leading-tight">
        <span className={cn("text-[0.7rem]", !urgent && "text-muted-foreground")}>{label}</span>
        <span
          dir="ltr"
          className={cn("font-mono font-semibold tabular-nums", primary ? "text-lg" : "text-base")}
        >
          {formatClock(seconds)}
        </span>
      </div>
    </div>
  );
}
