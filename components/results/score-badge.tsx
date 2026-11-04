import { LevelBadge, levelDotClass } from "@/components/results/level-badge";
import {
  AMIRNET_MAX_SCORE,
  AMIRNET_MIN_SCORE,
  LEVEL_BANDS,
  pointsToNextLevel,
  type LevelBand,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";

const SPAN = AMIRNET_MAX_SCORE - AMIRNET_MIN_SCORE;
/** Bands from lowest to highest, for drawing the scale left → right. */
const ASCENDING = [...LEVEL_BANDS].reverse();

/** Large score (50–150) with its exemption level and a position marker on the level scale. */
export function ScoreBadge({ score, level }: { score: number; level: LevelBand }) {
  const next = pointsToNextLevel(score);
  const markerPct =
    ((Math.min(AMIRNET_MAX_SCORE, Math.max(AMIRNET_MIN_SCORE, score)) - AMIRNET_MIN_SCORE) / SPAN) * 100;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {/* Gradient ring around the score */}
      <div className="rounded-full bg-brand-gradient p-1.5 shadow-lg shadow-primary/20">
        <div className="flex size-40 flex-col items-center justify-center rounded-full bg-card">
          <span className="text-xs font-medium text-muted-foreground">ציון משוער</span>
          <span className="font-exam text-6xl font-bold tabular-nums text-brand-gradient">{score}</span>
          <span className="font-exam text-xs text-muted-foreground" dir="ltr">
            {AMIRNET_MIN_SCORE}–{AMIRNET_MAX_SCORE}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <LevelBadge band={level} showRange size="lg" />
        <p className="text-sm text-muted-foreground">
          {next ? `עוד ${next.points} נקודות לרמת ${next.next.labelHe}` : "הגעת לרמת הפטור"}
        </p>
      </div>

      {/* Level scale. Numeric scales read left → right, so this block is LTR. */}
      <div dir="ltr" className="w-full max-w-sm space-y-1.5" aria-hidden>
        <div className="relative flex h-2.5 gap-0.5 overflow-hidden rounded-full">
          {ASCENDING.map((band) => (
            <div
              key={band.level}
              className={cn(
                "h-full transition-opacity",
                levelDotClass(band.level),
                band.level === level.level ? "opacity-100" : "opacity-25",
              )}
              style={{
                width: `${((band.maxScore - band.minScore + (band.maxScore === AMIRNET_MAX_SCORE ? 0 : 1)) / SPAN) * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative h-3">
          <span
            className="absolute -top-1 size-0 -translate-x-1/2 border-x-[6px] border-b-[7px] border-x-transparent border-b-foreground"
            style={{ left: `${markerPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.65rem] text-muted-foreground">
          {ASCENDING.map((band) => (
            <span
              key={band.level}
              dir="rtl"
              className={cn(band.level === level.level && "font-semibold text-foreground")}
            >
              {band.labelHe}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">
        הציון {score} נמצא ברמת {level.labelHe}.
      </p>
    </div>
  );
}
