/**
 * High-frequency Amirnet / psychometric English vocabulary.
 * `en` and `example` are English (LTR); `he` is the Hebrew translation (RTL).
 */

export type VocabCategory =
  | "connectors"
  | "restatement-keys"
  | "verbs"
  | "adjectives"
  | "nouns"
  | "phrases";

export type PartOfSpeech = "conj." | "adv." | "prep." | "v." | "adj." | "n." | "phr." | "det.";

export interface VocabEntry {
  en: string;
  he: string;
  pos: PartOfSpeech;
  example: string;
  category: VocabCategory;
}

export const VOCAB_CATEGORIES: readonly { id: VocabCategory; labelHe: string; descriptionHe: string }[] = [
  { id: "connectors", labelHe: "מילות קישור", descriptionHe: "ניגוד, סיבה ותוצאה, תוספת — המפתח להשלמת משפטים." },
  { id: "restatement-keys", labelHe: "מפתחות לניסוח מחדש", descriptionHe: "כמתים, שלילה ותדירות שמשנים את משמעות המשפט." },
  { id: "verbs", labelHe: "פעלים אקדמיים", descriptionHe: "פעלים שחוזרים בקטעי קריאה ובשאלות." },
  { id: "adjectives", labelHe: "תארים", descriptionHe: "תארים נפוצים בטקסטים אקדמיים, רבים מהם בזוגות של הפכים." },
  { id: "nouns", labelHe: "שמות עצם", descriptionHe: "מושגים מופשטים מטקסטים אקדמיים." },
  { id: "phrases", labelHe: "ביטויים וצירופים", descriptionHe: "צירופים קבועים שכדאי לזהות כיחידה אחת." },
];

const c = (category: VocabCategory) => (en: string, pos: PartOfSpeech, he: string, example: string): VocabEntry => ({
  en,
  pos,
  he,
  example,
  category,
});

const conn = c("connectors");
const keys = c("restatement-keys");
const verb = c("verbs");
const adj = c("adjectives");
const noun = c("nouns");
const phr = c("phrases");

export const VOCABULARY: readonly VocabEntry[] = [
  /* ------------------------------- Connectors ------------------------------ */
  conn("although", "conj.", "למרות ש..., אף על פי ש...", "Although it was raining, the match continued."),
  conn("despite", "prep.", "למרות (+ שם עצם)", "Despite the cost, the project was approved."),
  conn("nevertheless", "adv.", "אף על פי כן, בכל זאת", "The task was difficult; nevertheless, she finished it on time."),
  conn("however", "adv.", "אולם, עם זאת", "The plan was simple. However, it did not work."),
  conn("whereas", "conj.", "בעוד ש... (ניגוד)", "Some students prefer mornings, whereas others work better at night."),
  conn("therefore", "adv.", "לכן, משום כך", "The road was closed; therefore, we took another route."),
  conn("consequently", "adv.", "כתוצאה מכך", "He missed the bus and consequently arrived late."),
  conn("due to", "prep.", "בשל, עקב", "The flight was delayed due to bad weather."),
  conn("owing to", "prep.", "בגלל, הודות ל...", "Owing to a lack of funds, the library closed early."),
  conn("thus", "adv.", "כך, לפיכך", "The data were incomplete; thus, no conclusion could be drawn."),
  conn("moreover", "adv.", "יתרה מזאת, בנוסף", "The hotel was cheap. Moreover, it was close to the beach."),
  conn("furthermore", "adv.", "יתר על כן", "The method is fast; furthermore, it is very accurate."),
  conn("unless", "conj.", "אלא אם כן", "You will not pass unless you study."),
  conn("whether", "conj.", "האם; בין אם", "It is unclear whether the theory is correct."),
  conn("instead of", "prep.", "במקום", "She walked instead of taking the car."),
  conn("in contrast", "adv.", "לעומת זאת", "Cats are independent. In contrast, dogs need constant attention."),
  conn("similarly", "adv.", "באופן דומה", "Prices rose in May. Similarly, they increased in June."),

  /* ---------------------------- Restatement keys --------------------------- */
  keys("few", "det.", "מעט (כמעט אין) — משמעות שלילית", "Few people understood the lecture."),
  keys("a few", "det.", "כמה, מספר קטן — משמעות חיובית", "A few students stayed after class."),
  keys("hardly", "adv.", "בקושי, כמעט לא", "I could hardly hear the speaker."),
  keys("barely", "adv.", "בקושי, רק בדוחק", "He barely passed the exam."),
  keys("seldom", "adv.", "לעיתים רחוקות", "She seldom eats meat."),
  keys("rarely", "adv.", "לעיתים נדירות", "Such mistakes rarely happen."),
  keys("scarcely", "adv.", "כמעט לא", "There was scarcely any food left."),
  keys("no sooner... than", "phr.", "אך... ומיד, רק... וכבר", "No sooner had we arrived than it began to rain."),
  keys("not until", "phr.", "רק כאשר, לא לפני ש...", "It was not until 1990 that the law changed."),
  keys("by no means", "phr.", "בשום אופן לא", "The problem is by no means simple."),
  keys("far from", "phr.", "רחוק מ..., כלל לא", "Far from being easy, the test was very hard."),
  keys("regardless of", "prep.", "בלי קשר ל..., ללא תלות ב...", "Everyone can join, regardless of age."),
  keys("unlikely", "adj.", "לא סביר", "It is unlikely that he will come."),
  keys("hardly any", "phr.", "כמעט אף, כמעט שום", "There were hardly any visitors."),
  keys("the more... the more", "phr.", "ככל ש... כך...", "The more you practice, the better you become."),
  keys("were it not for", "phr.", "אלמלא", "Were it not for her help, I would have failed."),

  /* --------------------------------- Verbs --------------------------------- */
  verb("acquire", "v.", "לרכוש, להשיג", "Children acquire language quickly."),
  verb("assume", "v.", "להניח", "We assumed that the store would be open."),
  verb("claim", "v.", "לטעון", "The company claims that its product is safe."),
  verb("decline", "v.", "לרדת, לפחות; לסרב", "The number of bees has declined sharply."),
  verb("enhance", "v.", "לשפר, להגביר", "Music can enhance concentration."),
  verb("emerge", "v.", "לצוץ, להופיע", "New evidence emerged during the trial."),
  verb("indicate", "v.", "להצביע על, להראות", "The results indicate a strong link."),
  verb("maintain", "v.", "לשמור על; לטעון", "It is hard to maintain a healthy diet."),
  verb("postpone", "v.", "לדחות (במועד)", "The meeting was postponed until Monday."),
  verb("reject", "v.", "לדחות, לסרב לקבל", "The committee rejected the proposal."),
  verb("reveal", "v.", "לחשוף, לגלות", "The study revealed surprising results."),
  verb("suppress", "v.", "לדכא, להשתיק", "The government tried to suppress the news."),
  verb("undermine", "v.", "לערער, להחליש", "Constant criticism can undermine confidence."),
  verb("facilitate", "v.", "להקל, לאפשר", "Technology facilitates communication."),
  verb("replicate", "v.", "לשחזר (ניסוי)", "Other scientists could not replicate the results."),
  verb("attribute", "v.", "לייחס", "He attributed his success to hard work."),
  verb("exceed", "v.", "לעלות על, לחרוג", "The cost exceeded our expectations."),

  /* ------------------------------- Adjectives ------------------------------ */
  adj("abundant", "adj.", "שופע, בשפע", "Fresh water is abundant in this region."),
  adj("scarce", "adj.", "נדיר, מועט", "Food was scarce during the war."),
  adj("ambiguous", "adj.", "דו-משמעי", "The instructions were ambiguous."),
  adj("vague", "adj.", "מעורפל, לא ברור", "He gave only a vague answer."),
  adj("accurate", "adj.", "מדויק", "The map was surprisingly accurate."),
  adj("obsolete", "adj.", "מיושן, שאבד עליו הכלח", "Fax machines are almost obsolete."),
  adj("reluctant", "adj.", "מסרב, לא ששׂ", "She was reluctant to speak in public."),
  adj("eager", "adj.", "להוט, משתוקק", "The students were eager to begin."),
  adj("fragile", "adj.", "שביר", "Handle the vase carefully; it is fragile."),
  adj("crucial", "adj.", "מכריע, חיוני", "Sleep is crucial for memory."),
  adj("inevitable", "adj.", "בלתי נמנע", "Some mistakes are inevitable."),
  adj("remote", "adj.", "מרוחק, נידח", "They live in a remote village."),
  adj("diverse", "adj.", "מגוון", "The city has a diverse population."),
  adj("reliable", "adj.", "אמין", "We need a reliable source of energy."),
  adj("hostile", "adj.", "עוין", "The audience was hostile to the speaker."),
  adj("preliminary", "adj.", "ראשוני, מקדים", "These are only preliminary results."),

  /* ---------------------------------- Nouns -------------------------------- */
  noun("evidence", "n.", "ראיה, ראיות", "There is no evidence that the drug works."),
  noun("hypothesis", "n.", "השערה", "The experiment tested a new hypothesis."),
  noun("shortage", "n.", "מחסור", "There is a shortage of nurses."),
  noun("decline", "n.", "ירידה, שקיעה", "The empire's decline took centuries."),
  noun("approach", "n.", "גישה", "We need a new approach to the problem."),
  noun("consequence", "n.", "תוצאה, השלכה", "Pollution has serious consequences."),
  noun("phenomenon", "n.", "תופעה", "Rainbows are a natural phenomenon."),
  noun("threat", "n.", "איום", "Climate change is a threat to many species."),
  noun("survey", "n.", "סקר", "The survey included 2,000 people."),
  noun("issue", "n.", "סוגיה, נושא", "Housing is a major political issue."),
  noun("feature", "n.", "תכונה, מאפיין", "The phone has many useful features."),
  noun("obstacle", "n.", "מכשול", "Lack of money was the main obstacle."),
  noun("benefit", "n.", "תועלת, יתרון", "Exercise has many health benefits."),
  noun("drawback", "n.", "חיסרון", "The main drawback is the price."),
  noun("trait", "n.", "תכונה (אופי)", "Curiosity is a common trait of scientists."),
  noun("outcome", "n.", "תוצאה", "Nobody could predict the outcome of the election."),

  /* --------------------------------- Phrases ------------------------------- */
  phr("as a result", "phr.", "כתוצאה מכך", "He trained hard and, as a result, won the race."),
  phr("in spite of", "phr.", "למרות", "In spite of the noise, the baby slept."),
  phr("on the other hand", "phr.", "מצד שני", "The job pays well. On the other hand, the hours are long."),
  phr("in addition to", "phr.", "בנוסף ל...", "In addition to English, she speaks French."),
  phr("rather than", "phr.", "במקום, ולא", "He chose to walk rather than drive."),
  phr("draw a conclusion", "phr.", "להסיק מסקנה", "It is too early to draw any conclusions."),
  phr("take into account", "phr.", "להביא בחשבון", "The judge took his age into account."),
  phr("pose a threat", "phr.", "להוות איום", "Plastic poses a threat to marine life."),
  phr("play a role", "phr.", "למלא תפקיד", "Genes play a role in many diseases."),
  phr("to some extent", "phr.", "במידה מסוימת", "To some extent, the critics were right."),
  phr("in terms of", "phr.", "מבחינת, במונחים של", "In terms of cost, the plan is reasonable."),
  phr("give rise to", "phr.", "לגרום ל..., להוביל ל...", "The discovery gave rise to new questions."),
  phr("account for", "phr.", "להסביר; להוות (חלק)", "Women account for half of the workforce."),
  phr("with regard to", "phr.", "בנוגע ל..., בהתייחס ל...", "With regard to your request, we agree."),
  phr("in the long run", "phr.", "בטווח הארוך", "Recycling saves money in the long run."),
  phr("by and large", "phr.", "באופן כללי, בסך הכול", "By and large, the trip was a success."),
];
