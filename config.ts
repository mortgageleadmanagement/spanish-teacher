/** Global app constants. Curriculum decisions live in the project doc `curriculum.md`. */

export const VOICE = {
  /** Latin American neutral — curriculum §0. Must match the Azure Pronunciation Assessment locale later. */
  name: "es-MX-DaliaNeural",
  locale: "es-MX",
  /** Slightly slower than native for A1 — curriculum i+1 principle. Raise toward 1.0 as stages advance. */
  defaultRate: 0.88,
  slowRate: 0.7,
} as const;

/** Recognition locales. Early lessons: Ross speaks mostly English with Spanish chunks. */
export const RECOGNITION = {
  english: "en-AU",
  spanish: "es-MX",
} as const;

export const COLORS = {
  bg: "#101418",
  panel: "#1a2027",
  panelBorder: "#2a323c",
  text: "#e8ecef",
  textDim: "#8a97a5",
  accent: "#e2b93b", // karaoke highlight yellow (spec: yellow word-by-word)
  accentSoft: "#7c6a2a",
  spanish: "#7ec8a9",
  error: "#e07a6a",
  talk: "#3a7bd5",
  talkActive: "#e2b93b",
} as const;

export const LLM_DEFAULTS = {
  anthropicModel: "claude-haiku-4-5",
  openaiModel: "gpt-5-mini",
  maxTokens: 300,
} as const;
