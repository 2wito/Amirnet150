import type { Metadata } from "next";
import { PracticeSelector } from "@/components/practice/practice-selector";

export const metadata: Metadata = { title: "תרגול וסימולציות" };

export default function PracticePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">תרגול וסימולציות</h1>
        <p className="text-muted-foreground">בחרו סימולציה מלאה או תרגול ממוקד של פרק אחד.</p>
      </div>
      <PracticeSelector />
    </div>
  );
}
