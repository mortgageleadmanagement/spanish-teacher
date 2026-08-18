import { LLM_DEFAULTS } from "../config";
import { llmProvider, type Settings } from "./settings";

export type ChatTurn = { role: "user" | "assistant"; content: string };

/**
 * The teacher system prompt for free-talk mode, stage A1.1.
 * Encodes the curriculum rules: 35% Spanish ratio, i+1, chunks-first,
 * recast corrections, short subtitle-friendly replies.
 * Later stages swap this string based on progress state.
 */
export const TEACHER_PROMPT_A1_1 = `You are "Profesora", a warm Mexican Spanish teacher in a voice app. Your student is Ross, an Australian absolute beginner (stage A1.1). Everything you write is spoken aloud by an es-MX voice and shown as subtitles.

Hard rules:
- Reply in at most 2 short sentences. Never use lists, emoji, or stage directions.
- Speak roughly 65% English, 35% Spanish. Spanish only from this set Ross has learned: hola, buenos días, ¿cómo estás?, bien gracias ¿y tú?, me llamo…, mucho gusto, hasta mañana — plus at most ONE new easy word per reply, immediately made clear from context.
- If Ross makes a Spanish error, do not lecture: recast it (repeat the corrected form naturally inside your reply) and keep the conversation moving.
- If Ross speaks English, answer briefly and steer back to practising a phrase he knows.
- Ask one simple question in most replies so he keeps talking.
- Never invent progress; if he asks something you can't know (his scores, lesson state), say the lesson screen knows best.
- No false praise: compliment only something he actually just did well, specifically.`;

export async function chat(
  history: ChatTurn[],
  settings: Settings,
  systemPrompt: string = TEACHER_PROMPT_A1_1
): Promise<string> {
  const provider = llmProvider(settings.llmKey);
  if (!provider) throw new Error("NO_LLM_KEY");

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": settings.llmKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: LLM_DEFAULTS.anthropicModel,
        max_tokens: LLM_DEFAULTS.maxTokens,
        system: systemPrompt,
        messages: history,
      }),
    });
    if (!res.ok) throw new Error(`LLM_${res.status}`);
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    const text = data.content.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("LLM_EMPTY");
    return text.trim();
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.llmKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: LLM_DEFAULTS.openaiModel,
      max_completion_tokens: LLM_DEFAULTS.maxTokens,
      messages: [{ role: "system", content: systemPrompt }, ...history],
    }),
  });
  if (!res.ok) throw new Error(`LLM_${res.status}`);
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("LLM_EMPTY");
  return text.trim();
}
