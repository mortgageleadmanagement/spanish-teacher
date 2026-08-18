import * as SecureStore from "expo-secure-store";

export type Settings = {
  azureKey: string;
  azureRegion: string; // e.g. "australiaeast"
  llmKey: string; // Anthropic (sk-ant-...) or OpenAI (sk-...) — provider inferred from prefix
};

const KEYS: (keyof Settings)[] = ["azureKey", "azureRegion", "llmKey"];

export async function loadSettings(): Promise<Settings> {
  const out: Settings = { azureKey: "", azureRegion: "australiaeast", llmKey: "" };
  for (const k of KEYS) {
    const v = await SecureStore.getItemAsync(`settings.${k}`);
    if (v !== null && v !== "") out[k] = v;
  }
  return out;
}

export async function saveSettings(s: Settings): Promise<void> {
  for (const k of KEYS) {
    await SecureStore.setItemAsync(`settings.${k}`, s[k] ?? "");
  }
}

export function llmProvider(llmKey: string): "anthropic" | "openai" | null {
  if (!llmKey) return null;
  return llmKey.startsWith("sk-ant-") ? "anthropic" : "openai";
}
