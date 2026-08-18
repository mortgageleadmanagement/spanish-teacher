import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config";
import type { WordTiming } from "../services/tts";

/**
 * Karaoke subtitles (spec: yellow word-by-word highlight while she speaks).
 * `progress` is playback position as a fraction of duration [0..1].
 */
export function Subtitles({
  words,
  progress,
  gloss,
}: {
  words: WordTiming[];
  progress: number;
  gloss?: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line}>
        {words.map((w, idx) => {
          const spoken = progress >= w.startFrac;
          const active = progress >= w.startFrac && progress < w.endFrac;
          return (
            <Text
              key={`${idx}-${w.word}`}
              style={[styles.word, spoken && styles.spoken, active && styles.active]}
            >
              {w.word}
              {idx < words.length - 1 ? " " : ""}
            </Text>
          );
        })}
      </View>
      {gloss ? <Text style={styles.gloss}>{gloss}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingHorizontal: 20 },
  line: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  word: { color: COLORS.textDim, fontSize: 24, lineHeight: 34, fontWeight: "600" },
  spoken: { color: COLORS.text },
  active: { color: COLORS.accent },
  gloss: { color: COLORS.textDim, fontSize: 15, marginTop: 8, textAlign: "center" },
});
