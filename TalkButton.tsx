import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config";

export type TalkState = "idle" | "listening" | "speaking" | "thinking" | "disabled";

const LABEL: Record<TalkState, string> = {
  idle: "Tap to talk",
  listening: "Listening… tap when done",
  speaking: "…",
  thinking: "…",
  disabled: "Add your Azure key in Settings",
};

/** Turn-based push-to-talk (spec: never always-listening). */
export function TalkButton({ state, onPress }: { state: TalkState; onPress: () => void }) {
  const active = state === "listening";
  const enabled = state === "idle" || state === "listening";
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={enabled ? onPress : undefined}
        style={[
          styles.button,
          active && styles.buttonActive,
          !enabled && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.icon}>{active ? "◼" : "🎙"}</Text>
      </Pressable>
      <Text style={styles.label}>{LABEL[state]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  button: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.talk,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: { backgroundColor: COLORS.talkActive },
  buttonDisabled: { backgroundColor: COLORS.panelBorder },
  icon: { fontSize: 32, color: COLORS.bg },
  label: { color: COLORS.textDim, fontSize: 13 },
});
