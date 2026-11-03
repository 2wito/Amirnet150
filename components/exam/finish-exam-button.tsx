"use client";

import { Flag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectAnsweredCount, selectTotalQuestions, useExamStore } from "@/lib/useExamStore";

interface FinishExamButtonProps {
  className?: string;
  size?: "default" | "lg";
}

/** "סיים מבחן" button with a confirmation dialog that shows how many questions are unanswered. */
export function FinishExamButton({ className, size = "default" }: FinishExamButtonProps) {
  const answered = useExamStore(selectAnsweredCount);
  const total = useExamStore(selectTotalQuestions);
  const finishExam = useExamStore((s) => s.finishExam);
  const unanswered = total - answered;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size={size} className={cn("gap-2", className)}>
          <Flag aria-hidden />
          סיים מבחן
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>לסיים את המבחן?</AlertDialogTitle>
          <AlertDialogDescription>
            ענית על {answered} מתוך {total} שאלות.
            {unanswered > 0 && ` ${unanswered} שאלות שלא נענו ייחשבו כתשובות שגויות.`} לאחר הסיום לא ניתן
            לחזור למבחן.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>חזרה למבחן</AlertDialogCancel>
          <AlertDialogAction onClick={finishExam}>סיים מבחן</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
