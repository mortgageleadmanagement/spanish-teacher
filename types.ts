/** Scripted lesson format — the app-side encoding of the curriculum doc's lessons. */

export type SayStep = {
  kind: "say";
  /** What she speaks (may mix EN/ES — the es-MX voice reading English IS the accent). */
  speak: string;
  /** Optional gloss line shown under the subtitles (usually the English of a Spanish line). */
  gloss?: string;
  /** Speak slower than the default rate (used for first models of new chunks). */
  slow?: boolean;
};

export type ExpectStep = {
  kind: "expect";
  /** Recognition locale for this reply: the language Ross is expected to speak. */
  lang: "en-AU" | "es-MX";
  /** Normalized acceptable answers (see intents.normalize). Substring match counts. */
  accept: string[];
  /** Shown as the prompt while listening, e.g. "Say: Hola, ¿cómo estás?" */
  prompt: string;
  /** She says this if the first try doesn't match. */
  hint: string;
  /** She says this on success (specific praise only — no false praise policy). */
  onPass: string;
  /** The model line to replay when Ross fails twice (defaults to hint). */
  model?: string;
};

export type LessonStep = SayStep | ExpectStep;

export type Lesson = {
  id: string;
  title: string;
  steps: LessonStep[];
};
