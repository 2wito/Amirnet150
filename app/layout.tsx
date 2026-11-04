import type { Metadata } from "next";
import { Arimo, Heebo } from "next/font/google";
import "./globals.css";

/** Hebrew UI font (navigation, explanations, dashboard). */
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

/**
 * English exam-content font. Arimo is metric-compatible with Arial,
 * which keeps passages close to the look of the NITE computerized exam.
 */
const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EZ AMIRNET — תרגול חינמי למבחן אמירנט",
    template: "%s | EZ AMIRNET",
  },
  description: "סימולציות ותרגול למבחן האמירנט באנגלית, בממשק הדומה למבחן הממוחשב של מאל״ו.",
};

/** Root layout: RTL Hebrew document. Site chrome lives in `(site)/layout.tsx`; the exam is full-screen. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${arimo.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
