import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ResultsDashboard } from "@/components/results/results-dashboard";

export const metadata: Metadata = { title: "תוצאות המבחן" };

export default function ExamResultsPage() {
  return (
    <div className="page-backdrop flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <ResultsDashboard />
      </main>
      <SiteFooter />
    </div>
  );
}
