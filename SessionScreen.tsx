import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { COLORS, RECOGNITION, VOICE } from "../config";
import { LessonEngine } from "../lessons/engine";
import { lesson01 } from "../lessons/lesson01";
import { chat, type ChatTurn } from "../services/brain";
import { matchIntent } from "../services/intents";
import { loadSettings, saveSettings, type Settings } from "../services/settings";
import { synthesize, type Utterance } from "../services/tts";
import { SettingsSheet } from "../ui/SettingsSheet";
import { Subtitles } from "../ui/Subtitles";
import { TalkButton, type TalkState } from "../ui/TalkButton";

const PROGRESS_KEY = "progress.L01.index";

type Mode = "lesson" | "freetalk";

export function SessionScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<Mode>("lesson");
  const [talkState, setTalkState] = useState<TalkState>("thinking");
  const [subtitle, setSubtitle] = useState<Utterance | null>(null);
  const [gloss, setGloss] = useState<string | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [prompt, setPrompt] = useState<string>("");
  const [heard, setHeard] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [lessonDone, setLessonDone] = useState(false);

  const engine = useMemo(() => new LessonEngine(lesson01), []);
  const player = useRef<AudioPlayer | null>(null);
  const playbackResolve = useRef<(() => void) | null>(null);
  const lastSpoken = useRef<{ text: string; gloss?: string } | null>(null);
  const expectLang = useRef<string>(RECOGNITION.spanish);
  const finalHandled = useRef(false);
  const history = useRef<ChatTurn[]>([]);
  const settingsRef = useRef<Settings | null>(null);
  settingsRef.current = settings;

  // ---------- boot ----------
  useEffect(() => {
    (async () => {
      await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "doNotMix" });
      player.current = createAudioPlayer();
      player.current.addListener("playbackStatusUpdate", (st) => {
        if (st.duration > 0) setProgress(st.currentTime / st.duration);
        if (st.didJustFinish) {
          playbackResolve.current?.();
          playbackResolve.current = null;
        }
      });
      const s = await loadSettings();
      setSettings(s);
      const saved = await AsyncStorage.getItem(PROGRESS_KEY);
      if (saved) engine.restoreTo(parseInt(saved, 10) || 0);
      if (!s.azureKey) {
        setTalkState("disabled");
        setShowSettings(true);
      } else {
        void runLesson();
      }
    })();
    return () => {
      player.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- speaking ----------
  const speak = useCallback(
    async (text: string, opts?: { gloss?: string; slow?: boolean }): Promise<void> => {
      const s = settingsRef.current;
      if (!s?.azureKey) return;
      setTalkState("thinking");
      setStatus("");
      try {
        const utter = await synthesize(text, s, {
          rate: opts?.slow ? VOICE.slowRate : VOICE.defaultRate,
        });
        lastSpoken.current = { text, gloss: opts?.gloss };
        setSubtitle(utter);
        setGloss(opts?.gloss);
        setProgress(0);
        setTalkState("speaking");
        await new Promise<void>((resolve) => {
          playbackResolve.current = resolve;
          player.current?.replace(utter.uri);
          player.current?.play();
          // safety net: never hang the session on a missed finish event
          setTimeout(() => {
            playbackResolve.current?.();
            playbackResolve.current = null;
          }, 45000);
        });
        setProgress(1);
      } catch (e) {
        setStatus(errorLine(e));
      }
    },
    []
  );

  // ---------- lesson loop ----------
  const runLesson = useCallback(async (): Promise<void> => {
    for (;;) {
      const action = engine.next();
      if (action.type === "finished") {
        setLessonDone(true);
        setPrompt("Lesson 1 complete 🎉  Replay it, or switch to free talk.");
        setTalkState("idle");
        return;
      }
      if (action.type === "speak") {
        await speak(action.text, { gloss: action.gloss, slow: action.slow });
        engine.advance();
        await AsyncStorage.setItem(PROGRESS_KEY, String(engine.index));
        continue;
      }
      // listen
      expectLang.current = action.step.lang;
      setPrompt(action.step.prompt);
      setTalkState("idle");
      return;
    }
  }, [engine, speak]);

  // ---------- listening ----------
  const startListening = useCallback(async () => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setStatus("Microphone or speech permission denied — enable it in iOS Settings.");
      return;
    }
    finalHandled.current = false;
    setHeard("");
    ExpoSpeechRecognitionModule.start({
      lang: mode === "freetalk" ? RECOGNITION.english : expectLang.current,
      interimResults: true,
      continuous: false,
    });
    setTalkState("listening");
  }, [mode]);

  const onTalkPress = useCallback(() => {
    if (talkState === "idle") void startListening();
    else if (talkState === "listening") ExpoSpeechRecognitionModule.stop();
  }, [talkState, startListening]);

  useSpeechRecognitionEvent("result", (ev) => {
    const best = ev.results[0]?.transcript ?? "";
    setHeard(best);
    if (ev.isFinal && !finalHandled.current && best.trim().length > 0) {
      finalHandled.current = true;
      void handleTranscript(best);
    }
  });

  useSpeechRecognitionEvent("error", (ev) => {
    if (ev.error !== "aborted" && ev.error !== "no-speech") {
      setStatus(`Recognition error: ${ev.error}`);
    }
    if (!finalHandled.current) setTalkState("idle");
  });

  useSpeechRecognitionEvent("end", () => {
    if (!finalHandled.current) setTalkState("idle");
  });

  // ---------- the turn ----------
  async function handleTranscript(transcript: string): Promise<void> {
    // A correct lesson answer always beats a control phrase — Lesson 2 onward
    // teaches the control phrases themselves as expected answers.
    if (mode === "lesson" && engine.wouldPass(transcript)) {
      const result = engine.answer(transcript);
      if (result.type === "pass") {
        await AsyncStorage.setItem(PROGRESS_KEY, String(engine.index));
        await speak(result.praise);
        await runLesson();
        return;
      }
    }
    const intent = matchIntent(transcript);

    if (intent === "repeat" && lastSpoken.current) {
      await speak(lastSpoken.current.text, { gloss: lastSpoken.current.gloss });
      setTalkState("idle");
      return;
    }
    if (intent === "slower" && lastSpoken.current) {
      await speak(lastSpoken.current.text, { gloss: lastSpoken.current.gloss, slow: true });
      setTalkState("idle");
      return;
    }
    if ((intent === "translate" || intent === "dont_understand") && mode === "lesson") {
      const g = lastSpoken.current?.gloss;
      await speak(g ? `In English: ${g}` : "Let me say that again.", {});
      if (!g && lastSpoken.current) await speak(lastSpoken.current.text, { slow: true });
      setTalkState("idle");
      return;
    }

    if (mode === "freetalk") {
      await freeTalkTurn(transcript);
      return;
    }

    if (intent === "next") {
      engine.skip();
      await AsyncStorage.setItem(PROGRESS_KEY, String(engine.index));
      await runLesson();
      return;
    }

    const result = engine.answer(transcript);
    if (result.type === "pass") {
      await AsyncStorage.setItem(PROGRESS_KEY, String(engine.index));
      await speak(result.praise);
      await runLesson();
      return;
    }
    if (result.type === "retry") {
      await speak(result.hint);
      const step = engine.current();
      if (result.replayModel && step?.kind === "expect" && step.model) {
        await speak(step.model, { slow: true });
      }
      setTalkState("idle");
      return;
    }
    setTalkState("idle");
  }

  async function freeTalkTurn(transcript: string): Promise<void> {
    const s = settingsRef.current;
    if (!s?.llmKey) {
      setStatus("Add an LLM key in Settings to unlock free talk.");
      setTalkState("idle");
      return;
    }
    setTalkState("thinking");
    try {
      history.current.push({ role: "user", content: transcript });
      const reply = await chat(history.current.slice(-16), s);
      history.current.push({ role: "assistant", content: reply });
      await speak(reply);
    } catch (e) {
      setStatus(errorLine(e));
    }
    setTalkState("idle");
  }

  // ---------- mode & lesson controls ----------
  const toggleMode = useCallback(() => {
    if (talkState === "speaking" || talkState === "thinking") return;
    setStatus("");
    if (mode === "lesson") {
      setMode("freetalk");
      setPrompt("Free talk — say anything. She keeps it simple.");
      setTalkState("idle");
    } else {
      setMode("lesson");
      void runLesson();
    }
  }, [mode, talkState, runLesson]);

  const replayLesson = useCallback(() => {
    engine.restoreTo(0);
    setLessonDone(false);
    void AsyncStorage.setItem(PROGRESS_KEY, "0");
    void runLesson();
  }, [engine, runLesson]);

  // ---------- render ----------
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{mode === "lesson" ? lesson01.title : "Charla libre"}</Text>
        <View style={styles.headerButtons}>
          <Pressable onPress={toggleMode} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>{mode === "lesson" ? "Free talk" : "Lesson"}</Text>
          </Pressable>
          <Pressable onPress={() => setShowSettings(true)} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>⚙︎</Text>
          </Pressable>
        </View>
      </View>

      {/* Avatar placeholder — replaced by the animated face later (spec: wave clip + lip-sync). */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatar, talkState === "speaking" && styles.avatarSpeaking]}>
          <Text style={styles.avatarInitial}>D</Text>
        </View>
        <Text style={styles.avatarName}>Dalia</Text>
      </View>

      <View style={styles.subtitleArea}>
        {subtitle ? (
          <Subtitles words={subtitle.words} progress={progress} gloss={gloss} />
        ) : (
          <Text style={styles.placeholder}>
            {settings?.azureKey ? "…" : "Add your Azure Speech key to begin."}
          </Text>
        )}
      </View>

      <View style={styles.promptArea}>
        {prompt ? <Text style={styles.prompt}>{prompt}</Text> : null}
        {heard ? <Text style={styles.heard}>“{heard}”</Text> : null}
        {status ? <Text style={styles.status}>{status}</Text> : null}
        {lessonDone && mode === "lesson" ? (
          <Pressable onPress={replayLesson} style={styles.replayBtn}>
            <Text style={styles.headerBtnText}>Replay Lesson 1</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.talkArea}>
        <TalkButton state={talkState} onPress={onTalkPress} />
      </View>

      {settings ? (
        <SettingsSheet
          visible={showSettings}
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            void saveSettings(s);
            const hadKey = Boolean(settings.azureKey);
            setSettings(s);
            setShowSettings(false);
            if (!hadKey && s.azureKey) void runLesson();
          }}
        />
      ) : null}
    </SafeAreaView>
  );
}

function errorLine(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === "NO_AZURE_KEY") return "Add your Azure Speech key in Settings.";
  if (msg === "NO_LLM_KEY") return "Add an LLM key in Settings to unlock free talk.";
  if (msg.startsWith("AZURE_TTS_401")) return "Azure rejected the key — check key and region.";
  if (msg.startsWith("LLM_401")) return "The LLM key was rejected — check it in Settings.";
  return `Something hiccuped: ${msg}`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: { color: COLORS.text, fontSize: 16, fontWeight: "700", flexShrink: 1 },
  headerButtons: { flexDirection: "row", gap: 8 },
  headerBtn: {
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerBtnText: { color: COLORS.text, fontSize: 13 },
  avatarWrap: { alignItems: "center", marginTop: 24 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.panel,
    borderWidth: 2,
    borderColor: COLORS.panelBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSpeaking: { borderColor: COLORS.accent },
  avatarInitial: { color: COLORS.spanish, fontSize: 48, fontWeight: "800" },
  avatarName: { color: COLORS.textDim, marginTop: 8, fontSize: 14 },
  subtitleArea: { flex: 1, justifyContent: "center", minHeight: 140 },
  placeholder: { color: COLORS.textDim, textAlign: "center", fontSize: 16 },
  promptArea: { paddingHorizontal: 24, alignItems: "center", gap: 6, minHeight: 84 },
  prompt: { color: COLORS.spanish, fontSize: 16, textAlign: "center", fontWeight: "600" },
  heard: { color: COLORS.textDim, fontSize: 14, fontStyle: "italic" },
  status: { color: COLORS.error, fontSize: 13, textAlign: "center" },
  replayBtn: {
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  talkArea: { paddingBottom: 28, alignItems: "center" },
});
