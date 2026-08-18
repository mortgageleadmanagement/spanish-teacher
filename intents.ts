/**
 * Local control-phrase matcher — no AI call (spec decision).
 * English phrases always work; Spanish forms are live from Lesson 2
 * (curriculum implementation note: never punish a rescue).
 */

export type Intent = "repeat" | "slower" | "dont_understand" | "translate" | "next";

const PHRASES: { intent: Intent; forms: string[] }[] = [
  {
    intent: "repeat",
    forms: ["repeat", "repeat that", "say that again", "again", "otra vez", "puedes repetir", "repite"],
  },
  {
    intent: "slower",
    forms: ["slower", "more slowly", "slow down", "mas despacio", "despacio"],
  },
  {
    intent: "dont_understand",
    forms: ["i don't understand", "i dont understand", "what does that mean", "no entiendo"],
  },
  {
    intent: "translate",
    forms: ["translate", "in english", "what was that in english", "que significa"],
  },
  {
    intent: "next",
    forms: ["next", "continue", "ok next", "keep going", "sigue", "siguiente"],
  },
];

/** lowercase, strip accents + punctuation — matching should survive recognizer quirks */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿¡?!.,;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchIntent(transcript: string): Intent | null {
  const t = normalize(transcript);
  if (t.length === 0 || t.split(" ").length > 6) return null; // long utterances are content, not control
  for (const { intent, forms } of PHRASES) {
    for (const f of forms) {
      if (t === f || t.startsWith(`${f} `) || t.endsWith(` ${f}`)) return intent;
    }
  }
  return null;
}
