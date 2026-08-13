import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { ScreenContainer } from "@/components/screen-container";
import { CompletionRatingPrompt } from "@/components/completion-rating-prompt";
import { useAuth } from "@/hooks/use-auth";
import { buildWeeklyPlan, loadExerciseLogs, loadProfile, loadWorkoutSessionStates, saveExerciseLogs, saveProfile, saveWorkoutSessionStates, type LocalExerciseLog, type UserProfile, type WorkoutDifficulty, type WorkoutSessionState } from "@/lib/rootedfit-profile";
import { trpc } from "@/lib/trpc";

const DIFFICULTIES: { value: WorkoutDifficulty; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "More support and a slower start" },
  { value: "intermediate", label: "Intermediate", description: "Use the listed plan" },
  { value: "advanced", label: "Advanced", description: "Optional controlled progression" },
];

const TITLE: Record<string, string> = { weight_loss: "Weight-loss focus", weight_gain: "Weight-gain focus", toning: "Strength & toning focus", core_mobility: "Core & mobility focus", energy: "Energy focus", consistency: "Consistency focus", body_composition: "Body-composition habits" };

export default function WorkoutsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [states, setStates] = useState<WorkoutSessionState[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<LocalExerciseLog[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [activeWorkout, setActiveWorkout] = useState<{ id: string; title: string } | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [setNumber, setSetNumber] = useState("1");
  const [repCount, setRepCount] = useState("");
  const [weightUsedKg, setWeightUsedKg] = useState("");
  const [completedWorkout, setCompletedWorkout] = useState<{ id: string; title: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const syncExerciseLog = trpc.exerciseLogs.create.useMutation();

  useEffect(() => {
    loadProfile().then(setProfile);
    loadWorkoutSessionStates().then(setStates);
    loadExerciseLogs().then(setExerciseLogs);
  }, []);

  const weeklyPlan = useMemo(() => profile ? buildWeeklyPlan(profile) : null, [profile]);
  if (!profile || !weeklyPlan) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  const goal = profile.goal ?? "consistency";
  const workout = weeklyPlan.workouts[selectedDayIndex] ?? weeklyPlan.workouts[0];
  const workoutId = `week-${profile.rotationWeek}-${profile.workoutDifficulty}-${workout.day}-${workout.title}`;
  const state = states.find((entry) => entry.workoutId === workoutId) ?? { workoutId, saved: false, completedAt: null };
  const open = (url: string) => WebBrowser.openBrowserAsync(url, { controlsColor: "#2D6A4F", enableBarCollapsing: true, showTitle: true }).catch(() => Alert.alert("Workout link could not open", "Please check your internet connection and try again."));
  const updateState = async (id: string, update: Partial<WorkoutSessionState>) => {
    const current = states.find((item) => item.workoutId === id) ?? { workoutId: id, saved: false, completedAt: null };
    const next = [...states.filter((item) => item.workoutId !== id), { ...current, ...update }];
    setStates(next);
    await saveWorkoutSessionStates(next);
  };
  const setDifficulty = async (workoutDifficulty: WorkoutDifficulty) => {
    if (profile.workoutDifficulty === workoutDifficulty) return;
    const next = { ...profile, workoutDifficulty };
    setProfile(next);
    setSelectedDayIndex(0);
    await saveProfile(next);
  };
  const markWorkoutComplete = async () => {
    const alreadyComplete = Boolean(state.completedAt);
    await updateState(workoutId, { completedAt: alreadyComplete ? null : new Date().toISOString().slice(0, 10) });
    if (!alreadyComplete) setCompletedWorkout({ id: workoutId, title: workout.title });
  };
  const chooseWorkoutForLog = () => {
    setActiveWorkout({ id: workoutId, title: workout.title });
    if (!exerciseName) setExerciseName("Bodyweight squat");
  };
  const saveSetLog = async () => {
    const set = Math.floor(Number(setNumber));
    const reps = Math.floor(Number(repCount));
    const weight = Number(weightUsedKg);
    if (!activeWorkout || !exerciseName.trim() || !Number.isFinite(set) || set < 1 || !Number.isFinite(reps) || reps < 1) {
      Alert.alert("Add the set details", "Choose a workout, enter an exercise name, set number, and at least one repetition.");
      return;
    }
    const nextLog: LocalExerciseLog = { id: `${Date.now()}-${activeWorkout.id}`, workoutId: activeWorkout.id, exerciseName: exerciseName.trim(), setNumber: set, repCount: reps, weightUsedKg: weightUsedKg.trim() && Number.isFinite(weight) && weight >= 0 ? weight : null, loggedAt: new Date().toISOString() };
    const next = [nextLog, ...exerciseLogs];
    setExerciseLogs(next);
    await saveExerciseLogs(next);
    if (isAuthenticated) {
      try { await syncExerciseLog.mutateAsync({ workoutId: nextLog.workoutId, exerciseName: nextLog.exerciseName, setNumber: nextLog.setNumber, repCount: nextLog.repCount, weightUsedKg: nextLog.weightUsedKg }); } catch { /* Keep the local record if optional sync is unavailable. */ }
    }
    setRepCount("");
    setWeightUsedKg("");
    setSetNumber(String(set + 1));
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>YOUR SEVEN-DAY HOME WORKOUT PLAN</Text>
    <Text style={styles.title}>{TITLE[goal]}</Text>
    <Text style={styles.body}>Choose a day, then choose the difficulty that fits your current experience. You can move through the week in order or select the most practical session for today.</Text>

    <View style={styles.controlCard}><Text style={styles.cardKicker}>CHOOSE YOUR DIFFICULTY</Text><View style={styles.difficultyRow}>{DIFFICULTIES.map((item) => <Pressable key={item.value} accessibilityRole="button" onPress={() => setDifficulty(item.value)} style={[styles.difficultyButton, profile.workoutDifficulty === item.value && styles.difficultyButtonActive]}><Text style={[styles.difficultyTitle, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.label}</Text><Text style={[styles.difficultyCopy, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.description}</Text></Pressable>)}</View></View>

    <Text style={styles.sectionTitle}>Pick a workout day</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>{weeklyPlan.workouts.map((item, index) => <Pressable key={item.day} accessibilityRole="button" onPress={() => setSelectedDayIndex(index)} style={[styles.dayChip, selectedDayIndex === index && styles.dayChipActive]}><Text style={[styles.dayChipText, selectedDayIndex === index && styles.dayChipTextActive]}>{item.label}</Text><Text style={[styles.dayChipCopy, selectedDayIndex === index && styles.dayChipTextActive]}>{item.category.split(" ")[0]}</Text></Pressable>)}</ScrollView>

    <View style={[styles.card, state.completedAt && styles.cardComplete]}><Text style={styles.cardKicker}>{workout.label.toUpperCase()} · {workout.category.toUpperCase()} · {workout.durationMinutes} MIN · {workout.difficulty.toUpperCase()}</Text><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.cardCopy}>{workout.instructions.join(" ")}</Text><Text style={styles.adaptation}>{workout.adaptation}</Text>{state.completedAt ? <Text style={styles.completedNote}>Completed {state.completedAt}</Text> : null}<Text style={styles.instructorLabel}>FOLLOW-ALONG INSTRUCTOR OPTIONS</Text><Text style={styles.instructorCopy}>Your profile sets the first suggestion where available. Both options stay open to you.</Text>{workout.instructorOptions.map((option) => <Pressable key={`${option.label}-${option.videoUrl}`} onPress={() => open(option.videoUrl)} style={styles.openButton}><Text style={styles.optionKicker}>{option.label.toUpperCase()} · {option.name.toUpperCase()}</Text><Text style={styles.openButtonText}>{option.videoTitle} →</Text></Pressable>)}<View style={styles.actionRow}><Pressable onPress={() => updateState(workoutId, { saved: !state.saved })} style={[styles.actionButton, state.saved && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.saved ? "★ Saved" : "☆ Save session"}</Text></Pressable><Pressable onPress={markWorkoutComplete} style={[styles.actionButton, state.completedAt && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.completedAt ? "✓ Completed" : "Mark complete"}</Text></Pressable></View><Pressable onPress={chooseWorkoutForLog} style={styles.logButton}><Text style={styles.logButtonText}>{activeWorkout?.id === workoutId ? "Logging this session" : "Log a home set"}</Text></Pressable></View>

    <View style={styles.logCard}><Text style={styles.cardKicker}>HOME EXERCISE LOG</Text><Text style={styles.cardTitle}>{activeWorkout ? activeWorkout.title : "Choose “Log a home set” above"}</Text><Text style={styles.cardCopy}>Record bodyweight or weighted home variations. Weight is optional and uses kilograms.</Text><TextInput value={exerciseName} onChangeText={setExerciseName} placeholder="Exercise name, e.g. bodyweight squat" placeholderTextColor="#93A197" style={styles.input} returnKeyType="done" /><View style={styles.inputRow}><TextInput value={setNumber} onChangeText={setSetNumber} placeholder="Set" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /><TextInput value={repCount} onChangeText={setRepCount} placeholder="Reps" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /></View><TextInput value={weightUsedKg} onChangeText={setWeightUsedKg} placeholder="Weight used in kg (optional; 0 for bodyweight)" placeholderTextColor="#93A197" keyboardType="decimal-pad" style={styles.input} /><Pressable onPress={saveSetLog} style={styles.logPrimary}><Text style={styles.logPrimaryText}>Save set locally</Text></Pressable>{exerciseLogs.slice(0, 5).map((log) => <Text key={log.id} style={styles.logHistory}>• {log.exerciseName} — set {log.setNumber}: {log.repCount} reps{log.weightUsedKg !== null ? ` · ${log.weightUsedKg} kg` : " · bodyweight"}</Text>)}</View>
    <View style={styles.note}><Text style={styles.noteText}>Saved sessions, completion dates, difficulty selection, and home set logs stay on this device in the current MVP. When signed in, new set logs also try to sync. Pause, modify, or choose a gentler session if anything does not feel right.</Text></View>
  </ScrollView><CompletionRatingPrompt visible={Boolean(completedWorkout)} completionKey={`workout:${completedWorkout?.id ?? ""}:${new Date().toISOString().slice(0, 10)}`} title={completedWorkout?.title ?? "this workout"} onClose={() => setCompletedWorkout(null)} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 20, marginTop: 10 }, sectionTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800", marginBottom: 10 }, controlCard: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 19, padding: 15 }, difficultyRow: { flexDirection: "row", gap: 8, marginTop: 4 }, difficultyButton: { borderColor: "#BFD8C4", borderRadius: 12, borderWidth: 1, flex: 1, padding: 10 }, difficultyButtonActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, difficultyTitle: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, difficultyCopy: { color: "#526259", fontSize: 10, lineHeight: 14, marginTop: 3 }, difficultyTextActive: { color: "#FFFFFF" }, dayChips: { gap: 8, marginBottom: 16 }, dayChip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, minWidth: 75, paddingHorizontal: 12, paddingVertical: 10 }, dayChipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, dayChipText: { color: "#1F2A25", fontSize: 13, fontWeight: "800", textAlign: "center" }, dayChipCopy: { color: "#526259", fontSize: 10, marginTop: 2, textAlign: "center" }, dayChipTextActive: { color: "#FFFFFF" }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 17 }, cardComplete: { backgroundColor: "#F1F7F0", borderColor: "#9BC8A7" }, cardKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 7 }, cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25 }, cardCopy: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 7 }, adaptation: { color: "#1D583E", fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 10 }, completedNote: { color: "#1D583E", fontSize: 13, fontWeight: "800", marginTop: 10 }, instructorLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 16 }, instructorCopy: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 4 }, optionKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 3 }, openButton: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 12, marginTop: 9, minHeight: 46, justifyContent: "center", paddingHorizontal: 12 }, openButtonText: { color: "#1D583E", fontSize: 14, fontWeight: "800", textAlign: "center", textDecorationLine: "underline" }, actionRow: { flexDirection: "row", gap: 9, marginTop: 10 }, actionButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: 8 }, actionButtonActive: { backgroundColor: "#D8EADD", borderColor: "#2D6A4F" }, actionButtonText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, logButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, marginTop: 10, paddingVertical: 10 }, logButtonText: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, logCard: { backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 17 }, input: { backgroundColor: "#F8F9F5", borderColor: "#DDE5DA", borderRadius: 11, borderWidth: 1, color: "#1F2A25", fontSize: 14, marginTop: 10, minHeight: 45, paddingHorizontal: 12 }, inputRow: { flexDirection: "row", gap: 10 }, inputHalf: { flex: 1 }, logPrimary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 12, marginTop: 11, paddingVertical: 13 }, logPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, logHistory: { color: "#405247", fontSize: 13, lineHeight: 20, marginTop: 9 }, note: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginTop: 5, padding: 15 }, noteText: { color: "#6B4A2C", fontSize: 13, lineHeight: 19 },
});
