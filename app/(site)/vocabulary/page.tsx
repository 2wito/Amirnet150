import type { Metadata } from "next";
import { BookA } from "lucide-react";
import { VocabularyExplorer } from "@/components/vocabulary/vocabulary-explorer";
import { VOCABULARY } from "@/data/vocabulary";

export const metadata: Metadata = {
  title: "מילים נפוצות",
  description: "אוצר מילים נפוץ למבחן האמירנט והפסיכומטרי: חיפוש, סינון לפי קטגוריות, תרגום לעברית וכרטיסיות.",
};

export default function VocabularyPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/25">
          <BookA className="size-6" aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold tracking-tight">מילים נפוצות</h1>
          <p className="max-w-prose text-muted-foreground">
            {VOCABULARY.length} מילים וביטויים נפוצים באנגלית אקדמית, שימושיים לתרגול לאמירנט ולפסיכומטרי. חפשו, סננו לפי קטגוריה,
            הסתירו את התרגום כדי לבחון את עצמכם, או עברו למצב כרטיסיות.
          </p>
        </div>
      </div>
      <VocabularyExplorer />
    </div>
  );
}
