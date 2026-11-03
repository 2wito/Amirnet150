import type { Metadata } from "next";
import { ExamRunner } from "@/components/exam/exam-runner";

export const metadata: Metadata = { title: "מבחן" };

/** Full-screen exam (no site header), like the computerized test. */
export default function ExamPage() {
  return <ExamRunner />;
}
