import { Copyright, Heart, Mail, ShieldAlert, Unlink } from "lucide-react";

const DEVELOPER_EMAIL = "itay2wito@gmail.com";

const NOTICES = [
  {
    icon: ShieldAlert,
    title: "שחרור מאחריות",
    body: "כל חומרי התרגול, השאלות והערכות הציון באתר נועדו להערכה עצמית בלבד. אין בהם משום ייעוץ לימודי רשמי, ציון מחייב או הכנה רשמית למבחן. השימוש באתר ובחומרים הינו על אחריות המשתמש בלבד.",
  },
  {
    icon: Unlink,
    title: "אתר עצמאי",
    body: "האתר עצמאי לחלוטין ואינו קשור, מטעם או בשיתוף עם המרכז הארצי לבחינות ולהערכה (מאל״ו), מכון נועם או כל מכון רשמי אחר להכנה למבחנים.",
  },
  {
    icon: Copyright,
    title: "זכויות יוצרים",
    body: "כל זכויות היוצרים של צדדים שלישיים שייכות לבעליהן. אם נתקלתם בתוכן שלדעתכם מפר זכויות יוצרים, נשמח שתדווחו לנו במייל והתוכן יוסר מיד.",
  },
] as const;

const linkClass =
  "font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline";

/** Site-wide footer: branding, community notice, legal disclaimer, and credits (RTL Hebrew). */
export function SiteFooter() {
  return (
    <footer className="glass mt-20 border-x-0 border-b-0">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p dir="ltr" className="text-end text-3xl font-extrabold tracking-tight text-brand-gradient sm:text-start">
            EZ AMIRNET
          </p>
          <p className="flex items-start gap-2 text-sm text-muted-foreground sm:max-w-md">
            <Heart className="mt-0.5 size-4 shrink-0 text-rose-500" aria-hidden />
            <span>
              האתר חינמי לחלוטין לטובת הקהילה, ונבנה מרצון טוב כדי לעזור לכם להצליח במבחן האמירנט.
            </span>
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-3">
          {NOTICES.map(({ icon: Icon, title, body }) => (
            <li key={title} className="card-elevated space-y-2 rounded-2xl border bg-card/80 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" aria-hidden />
                </span>
                {title}
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            פיתוח על ידי{" "}
            <a href={`mailto:${DEVELOPER_EMAIL}`} className={`inline-flex items-center gap-1 ${linkClass}`}>
              איתי טויטו
              <Mail className="size-3.5" aria-hidden />
            </a>
          </p>
          <p>
            לדיווח על בעיה או הפרת זכויות:{" "}
            <a href={`mailto:${DEVELOPER_EMAIL}`} dir="ltr" className={linkClass}>
              {DEVELOPER_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
