import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { ScreenContainer } from "@/components/screen-container";
import { loadProfile, loadWorkoutSessionStates, saveWorkoutSessionStates, type UserProfile, type WorkoutSessionState } from "@/lib/rootedfit-profile";

type WorkoutResource = { title: string; duration: string; format: string; why: string; url: string };

const LIBRARY: Record<string, WorkoutResource[]> = {
  weight_loss: [
    { title: "30 Min Low Impact Home Workout", duration: "30 min", format: "Low-impact cardio", why: "A follow-along option for people who prefer a no-jumping home session.", url: "https://www.youtube.com/watch?v=MOz41fYRBvs" },
    { title: "20-Minute Bodyweight Workout for Beginners", duration: "20 min", format: "Bodyweight strength", why: "A compact no-equipment session to build a repeatable movement habit.", url: "https://www.youtube.com/watch?v=C7-xW9mRNiI" },
  ],
  weight_gain: [
    { title: "20 Min Full Body Toning & Strength", duration: "20 min", format: "At-home strength", why: "A strength-focused option for users who have weights or filled bottles available.", url: "https://www.youtube.com/watch?v=YYgYRSkFoJs" },
    { title: "20-Minute Bodyweight Workout for Beginners", duration: "20 min", format: "Bodyweight strength", why: "A practical foundation when equipment is limited.", url: "https://www.youtube.com/watch?v=C7-xW9mRNiI" },
  ],
  toning: [
    { title: "20 Min Full Body Toning & Strength", duration: "20 min", format: "At-home strength", why: "A follow-along strength session; use weights, bottles, or bodyweight as appropriate.", url: "https://www.youtube.com/watch?v=YYgYRSkFoJs" },
    { title: "30 Min Full Body Pilates", duration: "30 min", format: "Pilates", why: "A controlled, no-equipment option for home movement variety.", url: "https://www.youtube.com/watch?v=U5LwQW_IQOc" },
  ],
  core_mobility: [
    { title: "30 Min Full Body Pilates", duration: "30 min", format: "Pilates", why: "A mat-free or mat-optional controlled movement session.", url: "https://www.youtube.com/watch?v=U5LwQW_IQOc" },
    { title: "Beginner Yoga", duration: "20–30 min", format: "Yoga and mobility", why: "A gentler follow-along option for a low-intensity day.", url: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU" },
  ],
  energy: [
    { title: "Beginner Yoga", duration: "20–30 min", format: "Yoga and mobility", why: "A gentle movement break when you want to reset rather than push intensity.", url: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU" },
    { title: "20-Minute Bodyweight Workout for Beginners", duration: "20 min", format: "Bodyweight", why: "A short, simple option for days when energy is better later in the day.", url: "https://www.youtube.com/watch?v=C7-xW9mRNiI" },
  ],
  consistency: [
    { title: "20-Minute Bodyweight Workout for Beginners", duration: "20 min", format: "No equipment", why: "A manageable starting point for keeping a movement routine realistic.", url: "https://www.youtube.com/watch?v=C7-xW9mRNiI" },
    { title: "Beginner Yoga", duration: "20–30 min", format: "Mobility", why: "A low-pressure option for recovery or restart days.", url: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU" },
  ],
  body_composition: [
    { title: "30 Min Low Impact Home Workout", duration: "30 min", format: "Low-impact cardio", why: "A home option that can sit alongside food and movement consistency habits.", url: "https://www.youtube.com/watch?v=MOz41fYRBvs" },
    { title: "20 Min Full Body Toning & Strength", duration: "20 min", format: "At-home strength", why: "A strength-based complement when the equipment and energy are available.", url: "https://www.youtube.com/watch?v=YYgYRSkFoJs" },
  ],
};

const TITLE: Record<string, string> = { weight_loss: "Weight-loss focus", weight_gain: "Weight-gain focus", toning: "Strength & toning focus", core_mobility: "Core & mobility focus", energy: "Energy focus", consistency: "Consistency focus", body_composition: "Body-composition habits" };

export default function WorkoutsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [states, setStates] = useState<WorkoutSessionState[]>([]);
  useEffect(() => { loadProfile().then(setProfile); loadWorkoutSessionStates().then(setStates); }, []);
  if (!profile) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;
  const goal = profile.goal ?? "consistency";
  const resources = LIBRARY[goal] ?? LIBRARY.consistency;
  const open = (url: string) => WebBrowser.openBrowserAsync(url, { controlsColor: "#2D6A4F", enableBarCollapsing: true, showTitle: true }).catch(() => Alert.alert("Workout link could not open", "Please check your internet connection and try again."));
  const updateState = async (workoutId: string, update: Partial<WorkoutSessionState>) => {
    const current = states.find((item) => item.workoutId === workoutId) ?? { workoutId, saved: false, completedAt: null };
    const nextState = { ...current, ...update };
    const next = [...states.filter((item) => item.workoutId !== workoutId), nextState];
    setStates(next);
    await saveWorkoutSessionStates(next);
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>YOUR HOME WORKOUT LIBRARY</Text><Text style={styles.title}>{TITLE[goal]}</Text><Text style={styles.body}>These external follow-along sessions are selected around your primary focus and home-based movement. Choose what feels appropriate for your time, space, and energy today.</Text>{resources.map((item) => { const workoutId = `${goal}-${item.url}`; const state = states.find((entry) => entry.workoutId === workoutId) ?? { workoutId, saved: false, completedAt: null }; return <View key={workoutId} style={[styles.card, state.completedAt && styles.cardComplete]}><Text style={styles.cardKicker}>{item.format.toUpperCase()} · {item.duration.toUpperCase()}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardCopy}>{item.why}</Text>{state.completedAt ? <Text style={styles.completedNote}>Completed {state.completedAt}</Text> : null}<Pressable onPress={() => open(item.url)} style={styles.openButton}><Text style={styles.openButtonText}>Open YouTube session →</Text></Pressable><View style={styles.actionRow}><Pressable onPress={() => updateState(workoutId, { saved: !state.saved })} style={[styles.actionButton, state.saved && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.saved ? "★ Saved" : "☆ Save session"}</Text></Pressable><Pressable onPress={() => updateState(workoutId, { completedAt: state.completedAt ? null : new Date().toISOString().slice(0, 10) })} style={[styles.actionButton, state.completedAt && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.completedAt ? "✓ Completed" : "Mark complete"}</Text></Pressable></View></View>; })}<View style={styles.note}><Text style={styles.noteText}>Saved and completed states remain on this device. These are optional resources, not medical instruction. Pause, modify, or choose a gentler session if anything does not feel right. The Extras tab has the 10-minute timer and desk-stretch tools.</Text></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 20, marginTop: 10 }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 17 }, cardComplete: { backgroundColor: "#F1F7F0", borderColor: "#9BC8A7" }, cardKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 7 }, cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25 }, cardCopy: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 7 }, completedNote: { color: "#1D583E", fontSize: 13, fontWeight: "800", marginTop: 10 }, openButton: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 12, marginTop: 15, minHeight: 46, justifyContent: "center", paddingHorizontal: 12 }, openButtonText: { color: "#1D583E", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" }, actionRow: { flexDirection: "row", gap: 9, marginTop: 10 }, actionButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: 8 }, actionButtonActive: { backgroundColor: "#D8EADD", borderColor: "#2D6A4F" }, actionButtonText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, note: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginTop: 5, padding: 15 }, noteText: { color: "#6B4A2C", fontSize: 13, lineHeight: 19 },
});
