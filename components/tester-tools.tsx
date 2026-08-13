import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { trpc } from "@/lib/trpc";

const WELCOME_STORAGE_KEY = "rootedfit.web-welcome.v1";

function currentWebUrl() {
  return Platform.OS === "web" && typeof window !== "undefined" ? window.location.href : "";
}

async function copyText(text: string) {
  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}

/** Browser-only floating tools that keep tester onboarding and feedback discoverable. */
export function TesterTools() {
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<"bug" | "idea" | "content" | "other">("bug");
  const submitFeedback = trpc.testerFeedback.submit.useMutation();

  useEffect(() => {
    if (Platform.OS !== "web") return;
    AsyncStorage.getItem(WELCOME_STORAGE_KEY).then((value) => setWelcomeVisible(value !== "seen"));
  }, []);

  if (Platform.OS !== "web") return null;

  const dismissWelcome = async () => {
    setWelcomeVisible(false);
    await AsyncStorage.setItem(WELCOME_STORAGE_KEY, "seen");
  };

  const shareApp = async () => {
    const url = currentWebUrl();
    const shareText = `Try RootedFit’s browser tester beta: ${url}`;
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share({ title: "RootedFit", text: "Try RootedFit’s browser tester beta.", url });
        return;
      }
      if (await copyText(url)) {
        Alert.alert("Link copied", "The RootedFit link is ready to paste into a message for another tester.");
        return;
      }
      Alert.alert("Share RootedFit", shareText);
    } catch {
      // A cancelled share sheet should not be treated as an error.
    }
  };

  const sendFeedback = async () => {
    if (feedback.trim().length < 8) {
      Alert.alert("Add a little more detail", "Please write at least a short sentence so the team can understand the issue or idea.");
      return;
    }
    try {
      await submitFeedback.mutateAsync({ category: feedbackCategory, message: feedback.trim(), pageUrl: currentWebUrl() || undefined });
      setFeedback("");
      setFeedbackVisible(false);
      Alert.alert("Feedback sent", "Thank you. Your note has been recorded for the RootedFit test team.");
    } catch {
      Alert.alert("Feedback could not send", "Please check your connection and try again. Your note is still in the form.");
    }
  };

  return <View pointerEvents="box-none" style={styles.overlay}>
    <View style={styles.floatingStack}>
      <Pressable accessibilityRole="button" accessibilityLabel="Share RootedFit app" onPress={shareApp} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}><Text style={styles.shareButtonText}>Share app</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Provide feedback" onPress={() => setFeedbackVisible(true)} style={({ pressed }) => [styles.feedbackButton, pressed && styles.pressed]}><Text style={styles.feedbackButtonText}>Provide Feedback</Text></Pressable>
    </View>

    <Modal animationType="fade" transparent visible={welcomeVisible} onRequestClose={dismissWelcome}>
      <View style={styles.backdrop}><View style={styles.modalCard}><Text style={styles.kicker}>WELCOME TO ROOTEDFIT</Text><Text style={styles.modalTitle}>A quick guide for browser testing</Text><Text style={styles.modalBody}>Start in Plan to build a routine around your food, power, kitchen, and movement reality. Use Meals for full recipes and grocery checks, Workouts to save or log home sessions, Track for daily notes, and Extras for water and short movement tools.</Text><Text style={styles.modalNote}>Your MVP plan is stored only in this browser. Test a full flow, then use “Provide Feedback” at the bottom-right to copy your notes.</Text><Pressable accessibilityRole="button" onPress={dismissWelcome} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Start exploring</Text></Pressable></View></View>
    </Modal>

    <Modal animationType="fade" transparent visible={feedbackVisible} onRequestClose={() => setFeedbackVisible(false)}>
      <View style={styles.backdrop}><View style={styles.modalCard}><Text style={styles.kicker}>TESTER FEEDBACK</Text><Text style={styles.modalTitle}>What should improve?</Text><Text style={styles.modalBody}>Choose a type, then describe a bug, confusing step, missing food option, or idea. Feedback is submitted directly to the RootedFit test team.</Text><View style={styles.categoryRow}>{(["bug", "idea", "content", "other"] as const).map((category) => <Pressable key={category} accessibilityRole="button" onPress={() => setFeedbackCategory(category)} style={[styles.categoryButton, feedbackCategory === category && styles.categoryButtonActive]}><Text style={[styles.categoryText, feedbackCategory === category && styles.categoryTextActive]}>{category}</Text></Pressable>)}</View><TextInput accessibilityLabel="Feedback message" value={feedback} onChangeText={setFeedback} multiline placeholder="For example: I expected the grocery checklist to..." placeholderTextColor="#8B978F" style={styles.feedbackInput} textAlignVertical="top" /><View style={styles.actionRow}><Pressable accessibilityRole="button" onPress={() => setFeedbackVisible(false)} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" disabled={submitFeedback.isPending} onPress={sendFeedback} style={[styles.primaryButton, submitFeedback.isPending && styles.disabledButton]}><Text style={styles.primaryButtonText}>{submitFeedback.isPending ? "Sending…" : "Send feedback"}</Text></Pressable></View></View></View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  // Keep both browser-only controls clear of the persistent tab bar and the
  // bottom actions used on Workouts and Extras.
  floatingStack: { alignItems: "flex-end", bottom: 96, gap: 9, position: "absolute", right: 20 },
  shareButton: { backgroundColor: "#FFFFFF", borderColor: "#BFD8C4", borderRadius: 999, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 11, shadowColor: "#1F2A25", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.14, shadowRadius: 8 },
  shareButtonText: { color: "#1D583E", fontSize: 13, fontWeight: "800" },
  feedbackButton: { backgroundColor: "#2D6A4F", borderRadius: 999, paddingHorizontal: 17, paddingVertical: 13, shadowColor: "#1F2A25", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10 },
  feedbackButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.98 }] },
  backdrop: { alignItems: "center", backgroundColor: "rgba(22, 36, 29, 0.56)", flex: 1, justifyContent: "center", padding: 22 },
  modalCard: { backgroundColor: "#F8F6EF", borderRadius: 20, maxWidth: 520, padding: 22, width: "100%" },
  kicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 },
  modalTitle: { color: "#1F2A25", fontSize: 22, fontWeight: "800", lineHeight: 29 },
  modalBody: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 10 },
  modalNote: { color: "#6B4A2C", fontSize: 13, lineHeight: 19, marginTop: 13 },
  feedbackInput: { backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 13, borderWidth: 1, color: "#1F2A25", fontSize: 14, marginTop: 14, minHeight: 126, padding: 13 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  categoryButton: { borderColor: "#BFD8C4", borderRadius: 999, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  categoryButtonActive: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" },
  categoryText: { color: "#526259", fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  categoryTextActive: { color: "#1D583E" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 12, flex: 1, minHeight: 46, justifyContent: "center", paddingHorizontal: 14 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  secondaryButton: { alignItems: "center", borderColor: "#2D6A4F", borderRadius: 12, borderWidth: 1, flex: 1, minHeight: 46, justifyContent: "center", paddingHorizontal: 14 },
  secondaryButtonText: { color: "#1D583E", fontSize: 14, fontWeight: "800" },
  disabledButton: { backgroundColor: "#8AA693" },
});
