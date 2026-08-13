import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";

import { ScreenContainer } from "@/components/screen-container";
import { CompletionRatingPrompt } from "@/components/completion-rating-prompt";
import { useAuth } from "@/hooks/use-auth";
import { applyTodayResourceSubstitutions, buildWeeklyPlan, buildWorkoutSessionPreview, buildWorkoutWhyToday, getTodayResourceSubstituteOptions, loadExerciseLogs, loadPlannedSessionReminder, loadProfile, loadTodayResourceSubstitutions, loadTodayUnavailableResources, loadWorkoutSessionStates, loadResourceChangeFeedback, saveExerciseLogs, savePlannedSessionReminder, saveProfile, saveResourceChangeFeedback, saveTodayResourceSubstitutions, saveTodayUnavailableResources, saveWorkoutSessionStates, type LocalExerciseLog, type LocalResourceChangeFeedback, type PlannedSessionReminder, type TodayResourceSubstitution, type UserProfile, type WorkoutDifficulty, type WorkoutSessionState } from "@/lib/rootedfit-profile";
import { trpc } from "@/lib/trpc";

const DIFFICULTIES: { value: WorkoutDifficulty; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "More support and a slower start" },
  { value: "intermediate", label: "Intermediate", description: "Use the listed plan" },
  { value: "advanced", label: "Advanced", description: "Optional controlled progression" },
];

const TITLE: Record<string, string> = { weight_loss: "Weight-loss focus", weight_gain: "Weight-gain focus", toning: "Strength & toning focus", core_mobility: "Core & mobility focus", energy: "Energy focus", consistency: "Consistency focus", body_composition: "Body-composition habits" };
const RESOURCE_OPTIONS = ["Yoga mat", "Safe floor space", "Chair", "Stairs or a sturdy step", "Resistance band", "Weights or filled bottles", "Skipping rope", "Internet for video workouts", "Outdoor walking route", "TV or phone"];
const REMINDER_OPTIONS = [{ label: "No reminder", time: null }, { label: "Morning · 7:00", time: "07:00" }, { label: "Lunch · 12:30", time: "12:30" }, { label: "Evening · 18:00", time: "18:00" }, { label: "Later · 20:30", time: "20:30" }];

export default function WorkoutsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [states, setStates] = useState<WorkoutSessionState[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<LocalExerciseLog[]>([]);
  const [todayUnavailableResources, setTodayUnavailableResources] = useState<string[]>([]);
  const [todaySubstitutions, setTodaySubstitutions] = useState<TodayResourceSubstitution[]>([]);
  const [equipmentEditorOpen, setEquipmentEditorOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [instructorChoice, setInstructorChoice] = useState<"man" | "woman" | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<{ id: string; title: string } | null>(null);
  const [exerciseName, setExerciseName] = useState("");
  const [setNumber, setSetNumber] = useState("1");
  const [repCount, setRepCount] = useState("");
  const [weightUsedKg, setWeightUsedKg] = useState("");
  const [completedWorkout, setCompletedWorkout] = useState<{ id: string; title: string } | null>(null);
  const [resourceChangeContext, setResourceChangeContext] = useState<string | null>(null);
  const [resourceFeedbackNote, setResourceFeedbackNote] = useState("");
  const [resourceFeedbackStatus, setResourceFeedbackStatus] = useState<string | null>(null);
  const [resourceFeedbackHistory, setResourceFeedbackHistory] = useState<LocalResourceChangeFeedback[]>([]);
  const [sessionReminder, setSessionReminder] = useState<PlannedSessionReminder>({ time: null, enabled: false, notificationId: null, updatedAt: "" });
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const syncExerciseLog = trpc.exerciseLogs.create.useMutation();
  const submitResourceFeedback = trpc.testerFeedback.submit.useMutation();

  useEffect(() => {
    loadProfile().then(setProfile);
    loadWorkoutSessionStates().then(setStates);
    loadExerciseLogs().then(setExerciseLogs);
    loadTodayUnavailableResources().then(setTodayUnavailableResources);
    loadTodayResourceSubstitutions().then(setTodaySubstitutions);
    loadResourceChangeFeedback().then(setResourceFeedbackHistory);
    loadPlannedSessionReminder().then(setSessionReminder);
  }, []);

  const effectiveProfile = useMemo(() => profile ? applyTodayResourceSubstitutions(profile, todayUnavailableResources, todaySubstitutions) : null, [profile, todaySubstitutions, todayUnavailableResources]);
  const weeklyPlan = useMemo(() => effectiveProfile ? buildWeeklyPlan(effectiveProfile) : null, [effectiveProfile]);
  if (!profile || !weeklyPlan) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  const goal = profile.goal ?? "consistency";
  const safeDayIndex = Math.min(selectedDayIndex, weeklyPlan.workouts.length - 1);
  const workout = weeklyPlan.workouts[safeDayIndex] ?? weeklyPlan.workouts[0];
  const selectedInstructor = workout.instructorOptions.find((option) => option.kind === instructorChoice) ?? workout.instructorOptions[0];
  const upcomingWorkout = weeklyPlan.workouts[(safeDayIndex + 1) % weeklyPlan.workouts.length] ?? workout;
  const upcomingPreview = buildWorkoutSessionPreview(upcomingWorkout);
  const whyToday = buildWorkoutWhyToday(profile, todayUnavailableResources, workout, todaySubstitutions);
  const substituteOptions = getTodayResourceSubstituteOptions(profile, todayUnavailableResources);
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
    await saveProfile(next);
  };
  const toggleSavedResource = async (resource: string) => {
    const selected = profile.workoutResources.includes(resource);
    const next = { ...profile, workoutResources: selected ? profile.workoutResources.filter((item) => item !== resource) : [...profile.workoutResources, resource] };
    setProfile(next);
    const nextUnavailable = todayUnavailableResources.filter((item) => item !== resource);
    setTodayUnavailableResources(nextUnavailable);
    await Promise.all([saveProfile(next), saveTodayUnavailableResources(nextUnavailable)]);
    setResourceChangeContext(`${selected ? "Removed" : "Added"} ${resource} in your saved home setup.`);
    setResourceFeedbackNote("");
    setResourceFeedbackStatus(null);
  };
  const toggleTodayAvailability = async (resource: string) => {
    const next = todayUnavailableResources.includes(resource) ? todayUnavailableResources.filter((item) => item !== resource) : [...todayUnavailableResources, resource];
    const nextSubstitutions = todaySubstitutions.filter((substitution) => substitution.unavailableResource !== resource);
    setTodayUnavailableResources(next);
    setTodaySubstitutions(nextSubstitutions);
    await Promise.all([saveTodayUnavailableResources(next), saveTodayResourceSubstitutions(nextSubstitutions)]);
    setResourceChangeContext(`${next.includes(resource) ? "Paused" : "Restored"} ${resource} for today.`);
    setResourceFeedbackNote("");
    setResourceFeedbackStatus(null);
  };
  const chooseTodaySubstitute = async (option: TodayResourceSubstitution) => {
    const next = [...todaySubstitutions.filter((substitution) => substitution.unavailableResource !== option.unavailableResource), option];
    setTodaySubstitutions(next);
    await saveTodayResourceSubstitutions(next);
    setResourceChangeContext(`Using ${option.substituteResource} instead of ${option.unavailableResource} for today.`);
    setResourceFeedbackNote("");
    setResourceFeedbackStatus(null);
  };
  const recordResourceFeedback = async (outcome: "helpful" | "needs_adjustment") => {
    if (!resourceChangeContext) return;
    const localEntry: LocalResourceChangeFeedback = { id: `${Date.now()}-resource-change`, changeContext: resourceChangeContext, outcome, note: resourceFeedbackNote.trim(), createdAt: new Date().toISOString(), synced: false };
    const nextHistory = [localEntry, ...resourceFeedbackHistory];
    setResourceFeedbackHistory(nextHistory);
    await saveResourceChangeFeedback(nextHistory);
    try {
      await submitResourceFeedback.mutateAsync({ category: outcome === "helpful" ? "idea" : "bug", message: `Workout resource change: ${resourceChangeContext} Tester response: ${outcome === "helpful" ? "This feels practical." : "This needs a different option."}${resourceFeedbackNote.trim() ? ` Note: ${resourceFeedbackNote.trim()}` : ""}`, pageUrl: "/workouts" });
      const syncedHistory = nextHistory.map((entry) => entry.id === localEntry.id ? { ...entry, synced: true } : entry);
      setResourceFeedbackHistory(syncedHistory);
      await saveResourceChangeFeedback(syncedHistory);
      setResourceFeedbackStatus(outcome === "helpful" ? "Thank you — this practical match has been recorded." : "Thank you — the test team will review this resource match.");
    } catch {
      setResourceFeedbackStatus("Saved on this device. It can be shared with the test team when you are next connected.");
    }
  };
  const updateSessionReminder = async (time: string | null) => {
    if (Platform.OS !== "web" && sessionReminder.notificationId) await Notifications.cancelScheduledNotificationAsync(sessionReminder.notificationId).catch(() => undefined);
    if (!time) {
      const next = { time: null, enabled: false, notificationId: null, updatedAt: new Date().toISOString() };
      setSessionReminder(next);
      await savePlannedSessionReminder(next);
      setReminderStatus("No session reminder is planned.");
      return;
    }
    if (Platform.OS === "web") {
      const next = { time, enabled: true, notificationId: null, updatedAt: new Date().toISOString() };
      setSessionReminder(next);
      await savePlannedSessionReminder(next);
      setReminderStatus(`Gentle reminder saved for ${time}. Browser beta keeps this plan on this device; native app reminders can appear outside the app after permission.`);
      return;
    }
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("rootedfit-sessions", { name: "RootedFit sessions", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 120] });
    const permissions = await Notifications.getPermissionsAsync();
    const status = permissions.status === "granted" ? permissions.status : (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") {
      const next = { time, enabled: false, notificationId: null, updatedAt: new Date().toISOString() };
      setSessionReminder(next);
      await savePlannedSessionReminder(next);
      setReminderStatus("The time is saved, but reminders need device permission before they can appear.");
      return;
    }
    const [hour, minute] = time.split(":").map(Number);
    const notificationId = await Notifications.scheduleNotificationAsync({ content: { title: "RootedFit movement check-in", body: `Your planned ${workout.durationMinutes}-minute ${workout.category.toLowerCase()} session is ready when you are.`, data: { url: "/workouts" }, sound: false }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: Platform.OS === "android" ? "rootedfit-sessions" : undefined } });
    const next = { time, enabled: true, notificationId, updatedAt: new Date().toISOString() };
    setSessionReminder(next);
    await savePlannedSessionReminder(next);
    setReminderStatus(`A gentle daily ${time} reminder is scheduled on this device.`);
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
    <Text style={styles.body}>Choose a day, then choose the difficulty that fits your current experience. Every session is built around the resources you selected in your home setup; you can move through the week in order or choose the most practical session for today.</Text>

    <View style={styles.controlCard}><Text style={styles.cardKicker}>CHOOSE YOUR DIFFICULTY</Text><View style={styles.difficultyRow}>{DIFFICULTIES.map((item) => <Pressable key={item.value} accessibilityRole="button" onPress={() => setDifficulty(item.value)} style={[styles.difficultyButton, profile.workoutDifficulty === item.value && styles.difficultyButtonActive]}><Text style={[styles.difficultyTitle, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.label}</Text><Text style={[styles.difficultyCopy, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.description}</Text></Pressable>)}</View></View>
    <View style={styles.equipmentCard}><View style={styles.equipmentHeading}><View style={styles.equipmentHeadingCopy}><Text style={styles.cardKicker}>HOME RESOURCES</Text><Text style={styles.equipmentTitle}>{profile.workoutResources.length ? `${profile.workoutResources.length} saved resource${profile.workoutResources.length === 1 ? "" : "s"}` : "No saved equipment"}</Text></View><Pressable onPress={() => setEquipmentEditorOpen((open) => !open)} style={styles.equipmentEditButton}><Text style={styles.equipmentEditText}>{equipmentEditorOpen ? "Done" : "Edit gear"}</Text></Pressable></View><Text style={styles.equipmentBody}>Update your lasting home setup here. Changes save locally and refresh your workout recommendations immediately.</Text>{equipmentEditorOpen ? <View style={styles.equipmentOptions}>{RESOURCE_OPTIONS.map((resource) => <Pressable key={resource} onPress={() => toggleSavedResource(resource)} style={[styles.equipmentOption, profile.workoutResources.includes(resource) && styles.equipmentOptionActive]}><Text style={[styles.equipmentOptionText, profile.workoutResources.includes(resource) && styles.equipmentOptionTextActive]}>{profile.workoutResources.includes(resource) ? "✓ " : "+ "}{resource}</Text></Pressable>)}</View> : null}</View>
    {profile.workoutResources.length || profile.otherWorkoutResources.length ? <View style={styles.availabilityCard}><Text style={styles.cardKicker}>AVAILABLE FOR TODAY?</Text><Text style={styles.equipmentBody}>Temporarily pause any item you cannot use today. Your saved home setup stays unchanged and the plan resets tomorrow.</Text><View style={styles.availabilityOptions}>{Array.from(new Set([...profile.workoutResources, ...profile.otherWorkoutResources])).map((resource) => { const unavailable = todayUnavailableResources.includes(resource); return <Pressable key={resource} onPress={() => toggleTodayAvailability(resource)} style={[styles.availabilityOption, unavailable && styles.availabilityOptionUnavailable]}><Text style={[styles.availabilityOptionText, unavailable && styles.availabilityOptionTextUnavailable]}>{unavailable ? "Unavailable today" : "Available today"}</Text><Text style={[styles.availabilityResource, unavailable && styles.availabilityResourceUnavailable]}>{resource}</Text></Pressable>; })}</View></View> : null}
    {substituteOptions.length ? <View style={styles.substituteCard}><Text style={styles.cardKicker}>ONE-TAP PRACTICAL ALTERNATIVES</Text><Text style={styles.equipmentBody}>Choose a saved alternative or a no-equipment option. This only changes today’s recommendation.</Text>{substituteOptions.map((option) => <Pressable key={`${option.unavailableResource}-${option.substituteResource}`} onPress={() => chooseTodaySubstitute(option)} style={styles.substituteButton}><Text style={styles.substituteText}>Use {option.substituteResource} instead of {option.unavailableResource} today</Text></Pressable>)}</View> : null}
    {resourceChangeContext ? <View style={styles.resourceFeedbackCard}><Text style={styles.cardKicker}>QUICK BETA CHECK</Text><Text style={styles.resourceFeedbackContext}>{resourceChangeContext}</Text>{resourceFeedbackStatus ? <Text style={styles.resourceFeedbackStatus}>{resourceFeedbackStatus}</Text> : <><Text style={styles.equipmentBody}>Did this change make the workout more practical for today?</Text><TextInput value={resourceFeedbackNote} onChangeText={setResourceFeedbackNote} placeholder="Optional note for the test team" placeholderTextColor="#8B978F" style={styles.resourceFeedbackInput} returnKeyType="done" /><View style={styles.resourceFeedbackActions}><Pressable disabled={submitResourceFeedback.isPending} onPress={() => recordResourceFeedback("helpful")} style={styles.feedbackHelpfulButton}><Text style={styles.feedbackHelpfulText}>{submitResourceFeedback.isPending ? "Sending…" : "Yes, practical"}</Text></Pressable><Pressable disabled={submitResourceFeedback.isPending} onPress={() => recordResourceFeedback("needs_adjustment")} style={styles.feedbackAdjustButton}><Text style={styles.feedbackAdjustText}>Needs another option</Text></Pressable></View></>}</View> : null}

    <Text style={styles.sectionTitle}>Pick a workout day</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>{weeklyPlan.workouts.map((item, index) => <Pressable key={item.day} accessibilityRole="button" onPress={() => setSelectedDayIndex(index)} style={[styles.dayChip, safeDayIndex === index && styles.dayChipActive]}><Text style={[styles.dayChipText, safeDayIndex === index && styles.dayChipTextActive]}>{item.label}</Text><Text style={[styles.dayChipCopy, safeDayIndex === index && styles.dayChipTextActive]}>{item.category.split(" ")[0]}</Text></Pressable>)}</ScrollView>

    <View style={styles.previewCard}><Text style={styles.cardKicker}>UP NEXT · {upcomingPreview.label.toUpperCase()}</Text><Text style={styles.previewTitle}>{upcomingWorkout.title}</Text><Text style={styles.previewMeta}>{upcomingPreview.durationMinutes} minutes · Equipment: {upcomingPreview.equipment.join(", ")}</Text><Text style={styles.previewChecklistTitle}>QUICK SETUP CHECK</Text>{upcomingPreview.setupChecks.map((check) => <Text key={check} style={styles.previewCheck}>• {check}</Text>)}</View>
    <View style={styles.reminderCard}><Text style={styles.cardKicker}>GENTLE SESSION REMINDER</Text><Text style={styles.reminderCopy}>Choose a time that fits your real day. This is a supportive check-in, not a streak target.</Text><View style={styles.reminderOptions}>{REMINDER_OPTIONS.map((option) => <Pressable key={option.label} onPress={() => updateSessionReminder(option.time)} style={[styles.reminderOption, sessionReminder.time === option.time && styles.reminderOptionActive]}><Text style={[styles.reminderOptionText, sessionReminder.time === option.time && styles.reminderOptionTextActive]}>{option.label}</Text></Pressable>)}</View>{reminderStatus ? <Text style={styles.reminderStatus}>{reminderStatus}</Text> : sessionReminder.enabled && sessionReminder.time ? <Text style={styles.reminderStatus}>Planned for {sessionReminder.time} on this device.</Text> : null}</View>
    <View style={styles.whyTodayCard}><Text style={styles.cardKicker}>WHY THIS WORKOUT TODAY?</Text><Text style={styles.whyTodayText}>{whyToday}</Text></View>
    <View style={[styles.card, state.completedAt && styles.cardComplete]}><Text style={styles.cardKicker}>{workout.label.toUpperCase()} · {workout.category.toUpperCase()} · {workout.durationMinutes} MIN · {workout.difficulty.toUpperCase()}</Text><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.resourceLabel}>BUILT AROUND YOUR HOME SETUP</Text><View style={styles.resourcePillRow}>{workout.resourcesUsed.map((resource) => <View key={resource} style={styles.resourcePill}><Text style={styles.resourcePillText}>{resource}</Text></View>)}</View><Text style={styles.resourceReason}>{workout.resourceRationale}</Text><Text style={styles.cardCopy}>{workout.instructions.join(" ")}</Text><Text style={styles.adaptation}>{workout.adaptation}</Text>{state.completedAt ? <Text style={styles.completedNote}>Completed {state.completedAt}</Text> : null}{workout.videoAvailable ? <><Text style={styles.instructorLabel}>CHOOSE A FOLLOW-ALONG INSTRUCTOR</Text><Text style={styles.instructorCopy}>Switch anytime. The selected difficulty also changes the suggested session.</Text><View style={styles.instructorToggleRow}>{workout.instructorOptions.map((option) => <Pressable key={option.kind} onPress={() => setInstructorChoice(option.kind)} style={[styles.instructorToggle, selectedInstructor.kind === option.kind && styles.instructorToggleActive]}><Text style={[styles.instructorToggleText, selectedInstructor.kind === option.kind && styles.instructorToggleTextActive]}>{option.kind === "man" ? "Man-led" : "Woman-led"}</Text></Pressable>)}</View><Pressable onPress={() => open(selectedInstructor.videoUrl)} style={styles.openButton}><Text style={styles.optionKicker}>{selectedInstructor.label.toUpperCase()} · {selectedInstructor.name.toUpperCase()}</Text><Text style={styles.openButtonText}>{selectedInstructor.videoTitle} →</Text></Pressable>{workout.resourceDemonstrations.length ? <View style={styles.demonstrationBlock}><Text style={styles.instructorLabel}>RESOURCE DEMONSTRATIONS</Text><Text style={styles.instructorCopy}>Optional form demonstrations that match the item this session uses.</Text>{workout.resourceDemonstrations.map((demonstration) => <Pressable key={demonstration.resource} onPress={() => open(demonstration.videoUrl)} style={styles.demonstrationButton}><Text style={styles.optionKicker}>{demonstration.resource.toUpperCase()} · {demonstration.videoProvider.toUpperCase()}</Text><Text style={styles.demonstrationText}>{demonstration.title} →</Text></Pressable>)}</View> : null}</> : <View style={styles.offlineNote}><Text style={styles.offlineNoteTitle}>SELF-GUIDED SESSION</Text><Text style={styles.offlineNoteText}>Streaming was not selected in your available home setup, so this plan is designed to work from the movements above. Mark internet available today or add it to your saved gear if you want follow-along links.</Text></View>}<View style={styles.actionRow}><Pressable onPress={() => updateState(workoutId, { saved: !state.saved })} style={[styles.actionButton, state.saved && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.saved ? "★ Saved" : "☆ Save session"}</Text></Pressable><Pressable onPress={markWorkoutComplete} style={[styles.actionButton, state.completedAt && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.completedAt ? "✓ Completed" : "Mark complete"}</Text></Pressable></View><Pressable onPress={chooseWorkoutForLog} style={styles.logButton}><Text style={styles.logButtonText}>{activeWorkout?.id === workoutId ? "Logging this session" : "Log a home set"}</Text></Pressable></View>

    <View style={styles.logCard}><Text style={styles.cardKicker}>HOME EXERCISE LOG</Text><Text style={styles.cardTitle}>{activeWorkout ? activeWorkout.title : "Choose “Log a home set” above"}</Text><Text style={styles.cardCopy}>Record bodyweight or weighted home variations. Weight is optional and uses kilograms.</Text><TextInput value={exerciseName} onChangeText={setExerciseName} placeholder="Exercise name, e.g. bodyweight squat" placeholderTextColor="#93A197" style={styles.input} returnKeyType="done" /><View style={styles.inputRow}><TextInput value={setNumber} onChangeText={setSetNumber} placeholder="Set" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /><TextInput value={repCount} onChangeText={setRepCount} placeholder="Reps" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /></View><TextInput value={weightUsedKg} onChangeText={setWeightUsedKg} placeholder="Weight used in kg (optional; 0 for bodyweight)" placeholderTextColor="#93A197" keyboardType="decimal-pad" style={styles.input} /><Pressable onPress={saveSetLog} style={styles.logPrimary}><Text style={styles.logPrimaryText}>Save set locally</Text></Pressable>{exerciseLogs.slice(0, 5).map((log) => <Text key={log.id} style={styles.logHistory}>• {log.exerciseName} — set {log.setNumber}: {log.repCount} reps{log.weightUsedKg !== null ? ` · ${log.weightUsedKg} kg` : " · bodyweight"}</Text>)}</View>
    <View style={styles.note}><Text style={styles.noteText}>Saved sessions, completion dates, difficulty selection, and home set logs stay on this device in the current MVP. When signed in, new set logs also try to sync. Pause, modify, or choose a gentler session if anything does not feel right.</Text></View>
  </ScrollView><CompletionRatingPrompt visible={Boolean(completedWorkout)} completionKey={`workout:${completedWorkout?.id ?? ""}:${new Date().toISOString().slice(0, 10)}`} title={completedWorkout?.title ?? "this workout"} onClose={() => setCompletedWorkout(null)} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  reminderCard: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, reminderCopy: { color: "#405A6C", fontSize: 13, lineHeight: 19 }, reminderOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 11 }, reminderOption: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 }, reminderOptionActive: { backgroundColor: "#245574", borderColor: "#245574" }, reminderOptionText: { color: "#245574", fontSize: 12, fontWeight: "800" }, reminderOptionTextActive: { color: "#FFFFFF" }, reminderStatus: { color: "#245574", fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 10 },
  whyTodayCard: { backgroundColor: "#EAF3EA", borderColor: "#BFD8C4", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, whyTodayText: { color: "#365548", fontSize: 13, lineHeight: 20 }, substituteCard: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, substituteButton: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 11, borderWidth: 1, marginTop: 9, paddingHorizontal: 12, paddingVertical: 11 }, substituteText: { color: "#245574", fontSize: 13, fontWeight: "800", lineHeight: 18 }, previewCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, previewTitle: { color: "#1F2A25", fontSize: 17, fontWeight: "800", lineHeight: 23 }, previewMeta: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 5 }, previewChecklistTitle: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 12 }, previewCheck: { color: "#405247", fontSize: 12, lineHeight: 18, marginTop: 4 }, resourceFeedbackCard: { backgroundColor: "#FFF9ED", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, resourceFeedbackContext: { color: "#6B4A2C", fontSize: 13, fontWeight: "800", lineHeight: 19 }, resourceFeedbackInput: { backgroundColor: "#FFFFFF", borderColor: "#E8D1A4", borderRadius: 10, borderWidth: 1, color: "#1F2A25", fontSize: 13, marginTop: 10, minHeight: 42, paddingHorizontal: 11 }, resourceFeedbackActions: { flexDirection: "row", gap: 8, marginTop: 10 }, feedbackHelpfulButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 10, flex: 1, minHeight: 42, justifyContent: "center", paddingHorizontal: 8 }, feedbackHelpfulText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", textAlign: "center" }, feedbackAdjustButton: { alignItems: "center", borderColor: "#9D6A31", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 42, justifyContent: "center", paddingHorizontal: 8 }, feedbackAdjustText: { color: "#6B4A2C", fontSize: 12, fontWeight: "800", textAlign: "center" }, resourceFeedbackStatus: { color: "#1D583E", fontSize: 13, fontWeight: "800", lineHeight: 19, marginTop: 9 },
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 20, marginTop: 10 }, sectionTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800", marginBottom: 10 }, controlCard: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 15 }, difficultyRow: { flexDirection: "row", gap: 8, marginTop: 4 }, difficultyButton: { borderColor: "#BFD8C4", borderRadius: 12, borderWidth: 1, flex: 1, padding: 10 }, difficultyButtonActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, difficultyTitle: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, difficultyCopy: { color: "#526259", fontSize: 10, lineHeight: 14, marginTop: 3 }, difficultyTextActive: { color: "#FFFFFF" }, equipmentCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 15 }, equipmentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, equipmentHeadingCopy: { flex: 1, paddingRight: 10 }, equipmentTitle: { color: "#1F2A25", fontSize: 16, fontWeight: "800" }, equipmentEditButton: { borderColor: "#2D6A4F", borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 }, equipmentEditText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, equipmentBody: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 7 }, equipmentOptions: { gap: 7, marginTop: 12 }, equipmentOption: { borderColor: "#DDE5DA", borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9 }, equipmentOptionActive: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, equipmentOptionText: { color: "#405247", fontSize: 13, fontWeight: "700" }, equipmentOptionTextActive: { color: "#1D583E" }, availabilityCard: { backgroundColor: "#F5F8F2", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 19, padding: 15 }, availabilityOptions: { gap: 7, marginTop: 12 }, availabilityOption: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 9 }, availabilityOptionUnavailable: { backgroundColor: "#FFF8F3", borderColor: "#E8D1A4" }, availabilityOptionText: { color: "#1D583E", fontSize: 11, fontWeight: "800" }, availabilityOptionTextUnavailable: { color: "#8A4A24" }, availabilityResource: { color: "#405247", fontSize: 13, fontWeight: "700", flex: 1, marginLeft: 10, textAlign: "right" }, availabilityResourceUnavailable: { color: "#6B4A2C", textDecorationLine: "line-through" }, dayChips: { gap: 8, marginBottom: 16 }, dayChip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, minWidth: 75, paddingHorizontal: 12, paddingVertical: 10 }, dayChipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, dayChipText: { color: "#1F2A25", fontSize: 13, fontWeight: "800", textAlign: "center" }, dayChipCopy: { color: "#526259", fontSize: 10, marginTop: 2, textAlign: "center" }, dayChipTextActive: { color: "#FFFFFF" }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 17 }, cardComplete: { backgroundColor: "#F1F7F0", borderColor: "#9BC8A7" }, cardKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 7 }, cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25 }, resourceLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 14 }, resourcePillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 }, resourcePill: { backgroundColor: "#EAF3EA", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }, resourcePillText: { color: "#1D583E", fontSize: 11, fontWeight: "800" }, resourceReason: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 8 }, cardCopy: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 11 }, adaptation: { color: "#1D583E", fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 10 }, completedNote: { color: "#1D583E", fontSize: 13, fontWeight: "800", marginTop: 10 }, instructorLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 16 }, instructorCopy: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 4 }, instructorToggleRow: { flexDirection: "row", gap: 8, marginTop: 10 }, instructorToggle: { alignItems: "center", borderColor: "#BFD8C4", borderRadius: 10, borderWidth: 1, flex: 1, paddingVertical: 10 }, instructorToggleActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, instructorToggleText: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, instructorToggleTextActive: { color: "#FFFFFF" }, optionKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 3 }, openButton: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 12, marginTop: 9, minHeight: 46, justifyContent: "center", paddingHorizontal: 12 }, openButtonText: { color: "#1D583E", fontSize: 14, fontWeight: "800", textAlign: "center", textDecorationLine: "underline" }, demonstrationBlock: { marginTop: 4 }, demonstrationButton: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 12, borderWidth: 1, marginTop: 9, minHeight: 46, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 10 }, demonstrationText: { color: "#245574", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" }, offlineNote: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 12 }, offlineNoteTitle: { color: "#6B4A2C", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, offlineNoteText: { color: "#6B4A2C", fontSize: 12, lineHeight: 18, marginTop: 4 }, actionRow: { flexDirection: "row", gap: 9, marginTop: 10 }, actionButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: 8 }, actionButtonActive: { backgroundColor: "#D8EADD", borderColor: "#2D6A4F" }, actionButtonText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, logButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, marginTop: 10, paddingVertical: 10 }, logButtonText: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, logCard: { backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 17 }, input: { backgroundColor: "#F8F9F5", borderColor: "#DDE5DA", borderRadius: 11, borderWidth: 1, color: "#1F2A25", fontSize: 14, marginTop: 10, minHeight: 45, paddingHorizontal: 12 }, inputRow: { flexDirection: "row", gap: 10 }, inputHalf: { flex: 1 }, logPrimary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 12, marginTop: 11, paddingVertical: 13 }, logPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, logHistory: { color: "#405247", fontSize: 13, lineHeight: 20, marginTop: 9 }, note: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginTop: 5, padding: 15 }, noteText: { color: "#6B4A2C", fontSize: 13, lineHeight: 19 },
});
