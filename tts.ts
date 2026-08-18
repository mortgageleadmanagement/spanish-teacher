import { Directory, File, Paths } from "expo-file-system";
import { estimateWordTimings, type WordTiming } from "./timings";
export { estimateWordTimings, type WordTiming } from "./timings";
import { VOICE } from "../config";
import type { Settings } from "./settings";


export type Utterance = {
  uri: string;
  text: string;
  words: WordTiming[];
};

/** djb2 — stable cache key for (voice, rate, text) */
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Synthesize `text` with the Azure es-MX voice, cache the mp3, and return
 * a playable file URI plus estimated word timings.
 */
export async function synthesize(
  text: string,
  settings: Settings,
  opts?: { rate?: number }
): Promise<Utterance> {
  if (!settings.azureKey) throw new Error("NO_AZURE_KEY");
  const rate = opts?.rate ?? VOICE.defaultRate;
  const key = hash(`${VOICE.name}|${rate}|${text}`);
  const file = new File(Paths.cache, `tts_${key}.mp3`);

  if (!file.exists) {
    const ssml =
      `<speak version='1.0' xml:lang='${VOICE.locale}'>` +
      `<voice name='${VOICE.name}'>` +
      `<prosody rate='${Math.round(rate * 100)}%'>${escapeXml(text)}</prosody>` +
      `</voice></speak>`;

    const res = await fetch(
      `https://${settings.azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": settings.azureKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
          "User-Agent": "profesora-personal",
        },
        body: ssml,
      }
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AZURE_TTS_${res.status}${detail ? `: ${detail.slice(0, 120)}` : ""}`);
    }
    const buf = await res.arrayBuffer();
    file.write(new Uint8Array(buf));
  }

  return { uri: file.uri, text, words: estimateWordTimings(text) };
}

/** Delete every cached tts file (settings screen: "clear voice cache"). */
export function clearTtsCache(): number {
  let n = 0;
  for (const entry of new Directory(Paths.cache).list()) {
    if (entry instanceof File && /tts_[a-z0-9]+\.mp3$/.test(entry.uri)) {
      try {
        entry.delete();
        n++;
      } catch {}
    }
  }
  return n;
}
