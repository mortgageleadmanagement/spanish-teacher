import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../config";
import type { Settings } from "../services/settings";
import { clearTtsCache, synthesize } from "../services/tts";

export function SettingsSheet({
  visible,
  settings,
  onSave,
  onClose,
}: {
  visible: boolean;
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [testMsg, setTestMsg] = useState<string>("");

  // re-seed draft each time the sheet opens
  React.useEffect(() => {
    if (visible) {
      setDraft(settings);
      setTestMsg("");
    }
  }, [visible, settings]);

  async function testAzure() {
    setTestMsg("Testing…");
    try {
      await synthesize("Hola, Ross.", draft);
      setTestMsg("✓ Azure voice works");
    } catch (e) {
      setTestMsg(`✗ ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Settings</Text>

            <Text style={styles.label}>Azure Speech key (required)</Text>
            <TextInput
              style={styles.input}
              value={draft.azureKey}
              onChangeText={(t) => setDraft({ ...draft, azureKey: t.trim() })}
              placeholder="paste key from Azure portal"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <Text style={styles.label}>Azure region</Text>
            <TextInput
              style={styles.input}
              value={draft.azureRegion}
              onChangeText={(t) => setDraft({ ...draft, azureRegion: t.trim().toLowerCase() })}
              placeholder="australiaeast"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>LLM key (optional — unlocks free talk)</Text>
            <TextInput
              style={styles.input}
              value={draft.llmKey}
              onChangeText={(t) => setDraft({ ...draft, llmKey: t.trim() })}
              placeholder="sk-ant-… (Claude) or sk-… (OpenAI)"
              placeholderTextColor={COLORS.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />

            <View style={styles.row}>
              <Pressable style={styles.buttonSecondary} onPress={testAzure}>
                <Text style={styles.buttonSecondaryText}>Test voice</Text>
              </Pressable>
              <Pressable
                style={styles.buttonSecondary}
                onPress={() => {
                  const n = clearTtsCache();
                  setTestMsg(`Cleared ${n} cached clips`);
                }}
              >
                <Text style={styles.buttonSecondaryText}>Clear voice cache</Text>
              </Pressable>
            </View>
            {testMsg ? <Text style={styles.testMsg}>{testMsg}</Text> : null}

            <View style={styles.row}>
              <Pressable style={styles.button} onPress={() => onSave(draft)}>
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable style={styles.buttonGhost} onPress={onClose}>
                <Text style={styles.buttonGhostText}>Cancel</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: {
    backgroundColor: COLORS.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "85%",
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: "700", marginBottom: 16 },
  label: { color: COLORS.textDim, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.bg,
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: 10,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  row: { flexDirection: "row", gap: 12, marginTop: 20 },
  button: {
    backgroundColor: COLORS.talk,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: { color: COLORS.text, fontWeight: "700" },
  buttonGhost: { paddingVertical: 12, paddingHorizontal: 12 },
  buttonGhostText: { color: COLORS.textDim },
  buttonSecondary: {
    borderColor: COLORS.panelBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonSecondaryText: { color: COLORS.text },
  testMsg: { color: COLORS.textDim, marginTop: 10, fontSize: 13 },
});
