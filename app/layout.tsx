import type { Metadata } from "next";
import { Arimo, Heebo } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme-toggle";
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

const SITE_URL = "https://amirnet150.vercel.app";
const SITE_DESCRIPTION =
  "סימולציות ותרגול חינמיים לקראת מבחן האמירנט באנגלית: סימולציה מלאה, ציון משוער ואוצר מילים.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Share previews (WhatsApp, Facebook, Telegram, X, LinkedIn). The image itself comes from
  // app/opengraph-image.png and app/twitter-image.png.
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: "/",
    siteName: "EZ AMIRNET",
    title: "EZ AMIRNET — תרגול חינמי למבחן אמירנט",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "EZ AMIRNET — תרגול חינמי למבחן אמירנט",
    description: SITE_DESCRIPTION,
  },
  title: {
    default: "EZ AMIRNET — תרגול חינמי למבחן אמירנט",
    template: "%s | EZ AMIRNET",
  },
  description: "סימולציות ותרגול חינמיים לקראת מבחן האמירנט באנגלית. אתר עצמאי לתרגול עצמי.",
};

/** Root layout: RTL Hebrew document. Site chrome lives in `(site)/layout.tsx`; the exam is full-screen. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${arimo.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
