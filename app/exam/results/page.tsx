import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export const metadata: Metadata = { title: "תוצאות המבחן" };

export default function ExamResultsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <ResultsDashboard />
      </main>
    </>
  );
}
