<div align="center">

# EZ AMIRNET

**A free, community-built practice platform for the Israeli Amirnet English exam.**

**פלטפורמת תרגול חינמית לקהילה, להכנה למבחן האמירנט באנגלית.**

[English](#english) · [עברית](#hebrew) · [Screenshots](#screenshots)

</div>

---

<a id="english"></a>

## English

### Overview

EZ AMIRNET is a web app for practicing for the **Amirnet** (אמירנט), the computerized English placement test used by Israeli higher-education institutions. The exam interface mimics the look of the real computerized test: English content is shown left-to-right inside a fully right-to-left Hebrew UI, and every question type has its own timing rules.

The site is **100% free** and was built for the community.

### Features

| Feature | What it does |
|---|---|
| **Full Exam Simulation** | All three sections in sequence, a per-question timer, no going back, and an overall time limit, like the real test. |
| **Practice Mode** | Practice a single section (Sentence Completion, Restatement, or Reading Comprehension) with a section timer and free navigation. |
| **Randomized Exams** | Every new exam draws different questions and shuffles the answer order. The layout is saved, so a page refresh restores the same exam. |
| **Scoring Engine** | Raw score → estimated Amirnet score (50–150) → exemption level (Pre-Basic → Exempt), with a per-type breakdown and a question-by-question review with Hebrew explanations. |
| **Vocabulary (מילים נפוצות)** | About 100 high-frequency words and phrases in six categories, with search, category filters, Hebrew translations, example sentences, a hide-translations mode, and flip flashcards. Words you mark as known are remembered in your browser. |

> The score is a transparent linear **estimate** for practice only. The real Amirnet is an adaptive test scored by NITE using a non-public method.

### Tech Stack

- **[Next.js 15](https://nextjs.org)** (App Router, Turbopack, static prerendering)
- **TypeScript** (strict domain types in `types/exam.ts`)
- **Tailwind CSS v4** + shadcn/ui primitives (Radix), RTL-first styling
- **Zustand** (exam state, persisted to `sessionStorage`)
- **lucide-react** icons; Heebo (Hebrew UI) and Arimo (English exam content) via `next/font`

### Project Structure

```
app/
  (site)/            Home, Practice, Vocabulary (with header + footer)
  exam/              Full-screen exam runner and results page
components/          UI by area: exam, practice, results, vocabulary, layout
data/
  questions.json     Question bank (validated at build time)
  vocabulary.ts      Vocabulary list
lib/
  exam-builder.ts    Random question selection and option shuffling
  scoring.ts         Raw → 50–150 score → level
  useExamStore.ts    Exam state (Zustand)
```

### Local Setup

Requires **Node.js 20+**.

```bash
git clone https://github.com/2wito/Amirnet150.git
cd Amirnet150
npm install
npm run dev
```

Open <http://localhost:3000>.

Other scripts:

```bash
npm run build   # production build (also validates data/questions.json)
npm run start   # serve the production build
npm run lint    # ESLint
```

### Adding Questions

Add items to `data/questions.json` under `sentenceCompletion`, `restatement`, or `readingComprehension` (a passage with nested questions). Each question needs a unique `id`, exactly four `options`, a `correctOptionIndex` (0–3), and a Hebrew `explanation`. The build fails with a clear message if an item is malformed.

### Deploying to Vercel

The app is fully static and needs no environment variables.

1. Push the repository to GitHub.
2. In the [Vercel dashboard](https://vercel.com/new), choose **Add New → Project** and import the repository. The Next.js framework preset is detected automatically.
3. Click **Deploy**. Every push to `master` then deploys to production, and every pull request gets a preview URL.

Or deploy from the command line:

```bash
npm i -g vercel
vercel          # preview deployment
vercel --prod   # production deployment
```

---

<a id="hebrew"></a>

<div dir="rtl">

## עברית

### על הפלטפורמה

**EZ AMIRNET** היא אתר חינמי לתרגול לקראת מבחן **האמירנט** — מבחן המיון הממוחשב באנגלית של מוסדות ההשכלה הגבוהה בישראל. ממשק המבחן מדמה את המבחן הממוחשב: התוכן באנגלית מוצג משמאל לימין בתוך ממשק עברי מלא, ולכל סוג שאלה יש כללי זמן משלו.

האתר נבנה מרצון טוב, **חינמי לחלוטין** ומיועד לכל הקהילה.

### תכונות מרכזיות

- **סימולציית מבחן מלא:** שלושת הפרקים ברצף, טיימר לכל שאלה, ללא אפשרות לחזור אחורה — כמו במבחן האמיתי.
- **תרגול לפי פרק:** השלמת משפטים, ניסוח מחדש או הבנת הנקרא, עם טיימר לפרק ומעבר חופשי בין שאלות.
- **מבחן חדש בכל פעם:** השאלות וסדר התשובות מוגרלים מחדש בכל התחלה.
- **ציון משוער:** הערכת ציון בסולם 50–150, רמת פטור, פילוח לפי סוג שאלה, וסקירת כל שאלה עם הסבר בעברית.
- **מילים נפוצות:** כ-100 מילים וביטויים בשש קטגוריות, עם חיפוש, סינון, תרגום, משפטי דוגמה, מצב הסתרת תרגום וכרטיסיות.

### שחרור מאחריות

- כל חומרי התרגול, השאלות והערכות הציון באתר נועדו **להערכה עצמית בלבד**, ואין בהם משום ייעוץ לימודי רשמי, ציון מחייב או הכנה רשמית למבחן.
- האתר **עצמאי לחלוטין** ואינו קשור למרכז הארצי לבחינות ולהערכה (מאל״ו), למכון נועם או לכל מכון רשמי אחר להכנה למבחנים.
- **השימוש באתר ובחומרים הינו על אחריות המשתמש בלבד.**
- כל זכויות היוצרים של צדדים שלישיים שייכות לבעליהן. נתקלתם בתוכן שמפר זכויות יוצרים? כתבו ל-<span dir="ltr">[itay2wito@gmail.com](mailto:itay2wito@gmail.com)</span> והתוכן יוסר מיד.

פיתוח: **איתי טויטו**

</div>

---

<a id="screenshots"></a>

## Screenshots

> Placeholders: add PNG screenshots to `public/screenshots/` with these file names.

| Home | Exam |
|---|---|
| ![Home Screen](./public/screenshots/home.png) | ![Exam Screen](./public/screenshots/exam.png) |

| Results | Vocabulary |
|---|---|
| ![Results Screen](./public/screenshots/results.png) | ![Vocabulary Screen](./public/screenshots/vocabulary.png) |

---

<div align="center">

Built with care for the community · Developed by **Itay Twito** · [itay2wito@gmail.com](mailto:itay2wito@gmail.com)

</div>
