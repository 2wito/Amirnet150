import Image from "next/image";
import { Briefcase, GraduationCap, Layers, Mail, Sparkles, type LucideIcon } from "lucide-react";

/** All user-facing strings for the "About me" section (Hebrew, RTL). */
const COPY = {
  heading: "קצת עליי",
  name: "איתי טויטו",
  nameEn: "Itay Twito",
  photoAlt: "תמונה של איתי טויטו",
  highlights: [
    // U+2068/U+2069 (FSI/PDI) isolate "B.Sc." so its periods don't flip inside the Hebrew run.
    { icon: GraduationCap, text: "בוגר ⁨B.Sc.⁩ במדעי המחשב, ממוצע 96 ורשימת דיקן" },
    { icon: Briefcase, text: "עובד בסטארטאפ בתחומי QA ו-Support" },
    { icon: Layers, text: "מפתח Full-stack בשילוב כלי AI ו-LLM מודרניים" },
    { icon: Sparkles, text: "מעודכן בכל החידושים בעולם ה-AI" },
  ] satisfies readonly { icon: LucideIcon; text: string }[],
  stackLabel: "הסטאק שלי",
  stack: ["Next.js", "Supabase", "Tailwind CSS", "Claude Code", "Cursor"],
  emailLabel: "אימייל",
  email: "hello@claude-code-hebrew.com",
  linkedinLabel: "LinkedIn",
  linkedinHandle: "itay-twito-2083812b9",
  linkedinUrl: "https://www.linkedin.com/in/itay-twito-2083812b9/",
  story: [
    "אני חי ונושם פיתוח עכשווי, וכלי Agentic Coding כמו Claude Code ו-Cursor הפכו לחלק מרכזי ב-Workflow היומיומי שלי.",
    "את EZ AMIRNET בניתי מאותה סיבה שבגללה בניתי את ״המדריך ל-Claude Code בעברית״: כדי לעזור לחברים, למשפחה ולקהילה. זה משאב חינמי ונגיש, שנועד לעזור גם למי שרק מתחיל להתכונן לאמירנט וגם למי שכבר מנוסה ורוצה למקסם את הציון.",
  ],
  closing: "מוזמנים לעיין, ליצור קשר ולשתף פידבק!",
} as const;

/** LinkedIn glyph — lucide-react no longer ships brand logos. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

const contactRowClass =
  "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50";

/** Home-page "About me" section: profile card (photo, highlights, stack, contact) + story column. */
export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto w-full max-w-6xl scroll-mt-24 space-y-5">
      <h2 id="about-title" className="text-xl font-bold">
        {COPY.heading}
      </h2>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        {/* Profile card */}
        <div className="card-elevated space-y-6 rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-4">
            <Image
              src="/itay-twito.jpeg"
              alt={COPY.photoAlt}
              width={80}
              height={80}
              className="size-20 shrink-0 rounded-full object-cover ring-2 ring-primary/70 ring-offset-2 ring-offset-card"
            />
            <div>
              <p className="text-lg font-bold">{COPY.name}</p>
              <p lang="en" dir="ltr" className="text-end text-sm text-muted-foreground">
                {COPY.nameEn}
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {COPY.highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{COPY.stackLabel}</p>
            <ul className="flex flex-wrap gap-2">
              {COPY.stack.map((tag) => (
                <li
                  key={tag}
                  dir="ltr"
                  className="rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-1 border-t pt-4">
            <a href={`mailto:${COPY.email}`} className={contactRowClass}>
              <Mail className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="shrink-0 font-medium">{COPY.emailLabel}</span>
              <span dir="ltr" title={COPY.email} className="ms-auto min-w-0 truncate text-muted-foreground">
                {COPY.email}
              </span>
            </a>
            <a href={COPY.linkedinUrl} target="_blank" rel="noopener noreferrer" className={contactRowClass}>
              <LinkedInIcon className="size-4 shrink-0 text-primary" />
              <span className="shrink-0 font-medium">{COPY.linkedinLabel}</span>
              <span dir="ltr" className="ms-auto min-w-0 truncate text-muted-foreground">
                {COPY.linkedinHandle}
              </span>
            </a>
          </div>
        </div>

        {/* Story */}
        <div className="space-y-5 text-lg leading-8 lg:pt-2">
          {COPY.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="border-s-4 border-primary ps-4 font-semibold">{COPY.closing}</p>
        </div>
      </div>
    </section>
  );
}
