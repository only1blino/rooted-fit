import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Notifications from "expo-notifications";

import { ScreenContainer } from "@/components/screen-container";
import { CompletionRatingPrompt } from "@/components/completion-rating-prompt";
import { useAuth } from "@/hooks/use-auth";
import { applyTodayResourceSubstitutions, buildWeeklyPlan, buildWorkoutSessionPreview, buildWorkoutWhyToday, defaultPlannedSessionReminder, getTodayResourceSubstituteOptions, isReminderPauseActive, loadExerciseLogs, loadPlannedSessionReminder, loadProfile, loadTodayResourceSubstitutions, loadTodayUnavailableResources, loadWorkoutSessionStates, loadResourceChangeFeedback, oneWeekReminderPauseUntil, reminderMotivationText, reminderQuoteOptions, saveExerciseLogs, savePlannedSessionReminder, saveProfile, saveResourceChangeFeedback, saveTodayResourceSubstitutions, saveTodayUnavailableResources, saveWorkoutSessionStates, subscribeProfile, type LocalExerciseLog, type LocalResourceChangeFeedback, type PlannedSessionReminder, type ReminderQuoteId, type ReminderSchedule, type ReminderWeekday, type TodayResourceSubstitution, type UserProfile, type WorkoutDifficulty, type WorkoutSessionState } from "@/lib/rootedfit-profile";
import { trpc } from "@/lib/trpc";

const DIFFICULTIES: { value: WorkoutDifficulty; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "More support and a slower start" },
  { value: "intermediate", label: "Intermediate", description: "Use the listed plan" },
  { value: "advanced", label: "Advanced", description: "Optional controlled progression" },
];

const TITLE: Record<string, string> = { weight_loss: "Weight-loss focus", weight_gain: "Weight-gain focus", toning: "Strength & toning focus", core_mobility: "Core & mobility focus", energy: "Energy focus", consistency: "Consistency focus", body_composition: "Body-composition habits" };
const RESOURCE_OPTIONS = ["Yoga mat", "Safe floor space", "Chair", "Stairs or a sturdy step", "Resistance band", "Weights or filled bottles", "Skipping rope", "Internet for video workouts", "Outdoor walking route", "TV or phone"];
const REMINDER_OPTIONS = [{ label: "No reminder", time: null }, { label: "Morning · 7:00", time: "07:00" }, { label: "Lunch · 12:30", time: "12:30" }, { label: "Evening · 18:00", time: "18:00" }, { label: "Later · 20:30", time: "20:30" }];
const WEEKDAY_OPTIONS: { value: ReminderWeekday; label: string }[] = [{ value: 1, label: "Sun" }, { value: 2, label: "Mon" }, { value: 3, label: "Tue" }, { value: 4, label: "Wed" }, { value: 5, label: "Thu" }, { value: 6, label: "Fri" }, { value: 7, label: "Sat" }];

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
  const [sessionReminder, setSessionReminder] = useState<PlannedSessionReminder>(defaultPlannedSessionReminder());
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
    return subscribeProfile(setProfile);
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
  const reminderDaysLabel = (weekdays: ReminderWeekday[]) => weekdays.length === 7 ? "every day" : WEEKDAY_OPTIONS.filter((day) => weekdays.includes(day.value)).map((day) => day.label).join(", ");
  const updateSessionReminder = async (kind: "workout" | "meal", time: string | null, weekdays: ReminderWeekday[], base = sessionReminder): Promise<PlannedSessionReminder> => {
    const current = base[kind];
    if (Platform.OS !== "web" && current.notificationIds.length) await Promise.all(current.notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    const configured = Boolean(time && weekdays.length);
    let nextSchedule: ReminderSchedule = { time, weekdays, enabled: configured, notificationIds: [] };
    if (configured && !isReminderPauseActive(base.pauseUntil) && Platform.OS !== "web") {
      if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("rootedfit-sessions", { name: "RootedFit sessions", importance: Notifications.AndroidImportance.DEFAULT, vibrationPattern: [0, 120] });
      const permissions = await Notifications.getPermissionsAsync();
      const status = permissions.status === "granted" ? permissions.status : (await Notifications.requestPermissionsAsync()).status;
      if (status === "granted") {
        const [hour, minute] = time!.split(":").map(Number);
        const title = kind === "workout" ? "RootedFit movement check-in" : "RootedFit meal check-in";
        const body = kind === "workout" ? `${reminderMotivationText(base)} Your planned ${workout.durationMinutes}-minute session is ready when you are.` : `${reminderMotivationText(base)} Take a moment for the meal plan that fits your day.`;
        nextSchedule = { ...nextSchedule, notificationIds: await Promise.all(weekdays.map((weekday) => Notifications.scheduleNotificationAsync({ content: { title, body, data: { url: kind === "workout" ? "/workouts" : "/schedule" }, sound: false }, trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute, channelId: Platform.OS === "android" ? "rootedfit-sessions" : undefined } }))) };
      } else setReminderStatus("The schedule is saved, but device permission is needed before reminders can appear.");
    }
    const next = { ...base, [kind]: nextSchedule, updatedAt: new Date().toISOString() };
    setSessionReminder(next);
    await savePlannedSessionReminder(next);
    if (configured && !isReminderPauseActive(next.pauseUntil)) setReminderStatus(`${kind === "workout" ? "Workout" : "Meal"} reminder saved for ${reminderDaysLabel(weekdays)} at ${time}. ${Platform.OS === "web" ? "Browser beta keeps this on this device." : ""}`);
    if (!configured) setReminderStatus(time ? "Choose at least one day to schedule this reminder." : `No ${kind} reminder is planned.`);
    return next;
  };
  const toggleReminderWeekday = async (kind: "workout" | "meal", weekday: ReminderWeekday) => {
    const schedule = sessionReminder[kind];
    const weekdays = schedule.weekdays.includes(weekday) ? schedule.weekdays.filter((day) => day !== weekday) : [...schedule.weekdays, weekday].sort((a, b) => a - b) as ReminderWeekday[];
    await updateSessionReminder(kind, schedule.time, weekdays);
  };
  const toggleReminderPause = async () => {
    if (isReminderPauseActive(sessionReminder.pauseUntil)) {
      let resumed: PlannedSessionReminder = { ...sessionReminder, pauseUntil: null, updatedAt: new Date().toISOString() };
      resumed = await updateSessionReminder("workout", resumed.workout.time, resumed.workout.weekdays, resumed);
      resumed = await updateSessionReminder("meal", resumed.meal.time, resumed.meal.weekdays, resumed);
      setReminderStatus("Reminder pause ended. Your saved schedules are active again.");
      return;
    }
    if (Platform.OS !== "web") await Promise.all([...sessionReminder.workout.notificationIds, ...sessionReminder.meal.notificationIds].map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
    const next = { ...sessionReminder, pauseUntil: oneWeekReminderPauseUntil(), workout: { ...sessionReminder.workout, notificationIds: [] }, meal: { ...sessionReminder.meal, notificationIds: [] }, updatedAt: new Date().toISOString() };
    setSessionReminder(next);
    await savePlannedSessionReminder(next);
    setReminderStatus("All planned reminders are paused for one week. Your schedules stay saved.");
  };
  const updateReminderQuote = async (quoteId: ReminderQuoteId, customQuote = sessionReminder.customQuote) => {
    const next = { ...sessionReminder, quoteId, customQuote, updatedAt: new Date().toISOString() };
    setSessionReminder(next);
    await savePlannedSessionReminder(next);
    setReminderStatus("Your reminder message preference is saved. Existing schedules update the next time you change a day or time.");
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
    <Text style={styles.body}>Pick a day and intensity. Your home setup shapes the session.</Text>
    <View style={styles.heroIllustration}><Image source={{ uri: "/manus-storage/rootedfit-home-movement_58d1f01f.png" }} style={styles.heroImage} resizeMode="cover" /><View style={styles.heroOverlay}><Text style={styles.heroOverlayText}>HOME-READY MOVEMENT</Text></View></View>

    <View style={styles.controlCard}><Text style={styles.cardKicker}>CHOOSE YOUR DIFFICULTY</Text><View style={styles.difficultyRow}>{DIFFICULTIES.map((item) => <Pressable key={item.value} accessibilityRole="button" onPress={() => setDifficulty(item.value)} style={[styles.difficultyButton, profile.workoutDifficulty === item.value && styles.difficultyButtonActive]}><Text style={[styles.difficultyTitle, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.label}</Text><Text style={[styles.difficultyCopy, profile.workoutDifficulty === item.value && styles.difficultyTextActive]}>{item.description}</Text></Pressable>)}</View></View>
    <View style={styles.equipmentCard}><View style={styles.equipmentHeading}><View style={styles.equipmentHeadingCopy}><Text style={styles.cardKicker}>HOME RESOURCES</Text><Text style={styles.equipmentTitle}>{profile.workoutResources.length ? `${profile.workoutResources.length} saved resource${profile.workoutResources.length === 1 ? "" : "s"}` : "No saved equipment"}</Text></View><Pressable onPress={() => setEquipmentEditorOpen((open) => !open)} style={styles.equipmentEditButton}><Text style={styles.equipmentEditText}>{equipmentEditorOpen ? "Done" : "Edit gear"}</Text></Pressable></View><Text style={styles.equipmentBody}>Edit your setup. Recommendations update right away.</Text>{equipmentEditorOpen ? <View style={styles.equipmentOptions}>{RESOURCE_OPTIONS.map((resource) => <Pressable key={resource} onPress={() => toggleSavedResource(resource)} style={[styles.equipmentOption, profile.workoutResources.includes(resource) && styles.equipmentOptionActive]}><Text style={[styles.equipmentOptionText, profile.workoutResources.includes(resource) && styles.equipmentOptionTextActive]}>{profile.workoutResources.includes(resource) ? "✓ " : "+ "}{resource}</Text></Pressable>)}</View> : null}</View>
    {profile.workoutResources.length || profile.otherWorkoutResources.length ? <View style={styles.availabilityCard}><Text style={styles.cardKicker}>AVAILABLE TODAY?</Text><Text style={styles.equipmentBody}>Pause an item for today only.</Text><View style={styles.availabilityOptions}>{Array.from(new Set([...profile.workoutResources, ...profile.otherWorkoutResources])).map((resource) => { const unavailable = todayUnavailableResources.includes(resource); return <Pressable key={resource} onPress={() => toggleTodayAvailability(resource)} style={[styles.availabilityOption, unavailable && styles.availabilityOptionUnavailable]}><Text style={[styles.availabilityOptionText, unavailable && styles.availabilityOptionTextUnavailable]}>{unavailable ? "Unavailable today" : "Available today"}</Text><Text style={[styles.availabilityResource, unavailable && styles.availabilityResourceUnavailable]}>{resource}</Text></Pressable>; })}</View></View> : null}
    {substituteOptions.length ? <View style={styles.substituteCard}><Text style={styles.cardKicker}>ONE-TAP PRACTICAL ALTERNATIVES</Text><Text style={styles.equipmentBody}>Choose a saved alternative or a no-equipment option. This only changes today’s recommendation.</Text>{substituteOptions.map((option) => <Pressable key={`${option.unavailableResource}-${option.substituteResource}`} onPress={() => chooseTodaySubstitute(option)} style={styles.substituteButton}><Text style={styles.substituteText}>Use {option.substituteResource} instead of {option.unavailableResource} today</Text></Pressable>)}</View> : null}
    {resourceChangeContext ? <View style={styles.resourceFeedbackCard}><Text style={styles.cardKicker}>QUICK BETA CHECK</Text><Text style={styles.resourceFeedbackContext}>{resourceChangeContext}</Text>{resourceFeedbackStatus ? <Text style={styles.resourceFeedbackStatus}>{resourceFeedbackStatus}</Text> : <><Text style={styles.equipmentBody}>Did this change make the workout more practical for today?</Text><TextInput value={resourceFeedbackNote} onChangeText={setResourceFeedbackNote} placeholder="Optional note for the test team" placeholderTextColor="#8B978F" style={styles.resourceFeedbackInput} returnKeyType="done" /><View style={styles.resourceFeedbackActions}><Pressable disabled={submitResourceFeedback.isPending} onPress={() => recordResourceFeedback("helpful")} style={styles.feedbackHelpfulButton}><Text style={styles.feedbackHelpfulText}>{submitResourceFeedback.isPending ? "Sending…" : "Yes, practical"}</Text></Pressable><Pressable disabled={submitResourceFeedback.isPending} onPress={() => recordResourceFeedback("needs_adjustment")} style={styles.feedbackAdjustButton}><Text style={styles.feedbackAdjustText}>Needs another option</Text></Pressable></View></>}</View> : null}

    <Text style={styles.sectionTitle}>Pick a workout day</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayChips}>{weeklyPlan.workouts.map((item, index) => <Pressable key={item.day} accessibilityRole="button" onPress={() => setSelectedDayIndex(index)} style={[styles.dayChip, safeDayIndex === index && styles.dayChipActive]}><Text style={[styles.dayChipText, safeDayIndex === index && styles.dayChipTextActive]}>{item.label}</Text><Text style={[styles.dayChipCopy, safeDayIndex === index && styles.dayChipTextActive]}>{item.category.split(" ")[0]}</Text></Pressable>)}</ScrollView>

    <View style={styles.previewCard}><Text style={styles.cardKicker}>UP NEXT · {upcomingPreview.label.toUpperCase()}</Text><Text style={styles.previewTitle}>{upcomingWorkout.title}</Text><Text style={styles.previewMeta}>{upcomingPreview.durationMinutes} minutes · Equipment: {upcomingPreview.equipment.join(", ")}</Text><Text style={styles.previewChecklistTitle}>QUICK SETUP CHECK</Text>{upcomingPreview.setupChecks.map((check) => <Text key={check} style={styles.previewCheck}>• {check}</Text>)}</View>
    <View style={styles.reminderCard}><Text style={styles.cardKicker}>GENTLE REMINDERS</Text><Text style={styles.reminderCopy}>Set different schedules for movement and meals. This is a supportive check-in, not a streak target.</Text>{(["workout", "meal"] as const).map((kind) => { const schedule = sessionReminder[kind]; return <View key={kind} style={styles.reminderSchedule}><Text style={styles.reminderSectionLabel}>{kind === "workout" ? "WORKOUT SCHEDULE" : "MEAL SCHEDULE"}</Text><View style={styles.weekdayOptions}>{WEEKDAY_OPTIONS.map((day) => <Pressable key={day.value} onPress={() => toggleReminderWeekday(kind, day.value)} style={[styles.weekdayOption, schedule.weekdays.includes(day.value) && styles.weekdayOptionActive]}><Text style={[styles.weekdayOptionText, schedule.weekdays.includes(day.value) && styles.weekdayOptionTextActive]}>{day.label}</Text></Pressable>)}</View><View style={styles.reminderOptions}>{REMINDER_OPTIONS.map((option) => <Pressable key={option.label} onPress={() => updateSessionReminder(kind, option.time, schedule.weekdays)} style={[styles.reminderOption, schedule.time === option.time && styles.reminderOptionActive]}><Text style={[styles.reminderOptionText, schedule.time === option.time && styles.reminderOptionTextActive]}>{option.label}</Text></Pressable>)}</View>{schedule.enabled ? <Text style={styles.scheduleSummary}>{reminderDaysLabel(schedule.weekdays)} · {schedule.time}</Text> : null}</View>})}<Text style={styles.reminderSectionLabel}>NOTIFICATION MESSAGE</Text><View style={styles.quoteOptions}>{reminderQuoteOptions.map((quote) => <Pressable key={quote.id} onPress={() => updateReminderQuote(quote.id)} style={[styles.quoteOption, sessionReminder.quoteId === quote.id && styles.quoteOptionActive]}><Text style={[styles.quoteOptionText, sessionReminder.quoteId === quote.id && styles.quoteOptionTextActive]}>{quote.label}</Text></Pressable>)}<Pressable onPress={() => updateReminderQuote("custom")} style={[styles.quoteOption, sessionReminder.quoteId === "custom" && styles.quoteOptionActive]}><Text style={[styles.quoteOptionText, sessionReminder.quoteId === "custom" && styles.quoteOptionTextActive]}>Custom</Text></Pressable></View>{sessionReminder.quoteId === "custom" ? <TextInput value={sessionReminder.customQuote} onChangeText={(value) => updateReminderQuote("custom", value)} placeholder="Write a short supportive reminder" placeholderTextColor="#8B978F" style={styles.reminderQuoteInput} maxLength={180} returnKeyType="done" /> : <Text style={styles.quotePreview}>{reminderMotivationText(sessionReminder)}</Text>}<Pressable onPress={toggleReminderPause} style={[styles.pauseReminderButton, isReminderPauseActive(sessionReminder.pauseUntil) && styles.pauseReminderButtonActive]}><Text style={[styles.pauseReminderText, isReminderPauseActive(sessionReminder.pauseUntil) && styles.pauseReminderTextActive]}>{isReminderPauseActive(sessionReminder.pauseUntil) ? "Resume reminders now" : "Pause reminders for one week"}</Text></Pressable>{reminderStatus ? <Text style={styles.reminderStatus}>{reminderStatus}</Text> : isReminderPauseActive(sessionReminder.pauseUntil) ? <Text style={styles.reminderStatus}>Paused until {new Date(sessionReminder.pauseUntil!).toLocaleDateString()}.</Text> : null}</View>
    <View style={styles.whyTodayCard}><Text style={styles.cardKicker}>WHY THIS WORKOUT TODAY?</Text><Text style={styles.whyTodayText}>{whyToday}</Text></View>
    <View style={[styles.card, state.completedAt && styles.cardComplete]}><Text style={styles.cardKicker}>{workout.label.toUpperCase()} · {workout.category.toUpperCase()} · {workout.durationMinutes} MIN · {workout.difficulty.toUpperCase()}</Text><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.resourceLabel}>BUILT AROUND YOUR HOME SETUP</Text><View style={styles.resourcePillRow}>{workout.resourcesUsed.map((resource) => <View key={resource} style={styles.resourcePill}><Text style={styles.resourcePillText}>{resource}</Text></View>)}</View><Text style={styles.resourceReason}>{workout.resourceRationale}</Text><Text style={styles.cardCopy}>{workout.instructions.join(" ")}</Text><Text style={styles.adaptation}>{workout.adaptation}</Text>{state.completedAt ? <Text style={styles.completedNote}>Completed {state.completedAt}</Text> : null}{workout.videoAvailable ? <><Text style={styles.instructorLabel}>CHOOSE A FOLLOW-ALONG INSTRUCTOR</Text><Text style={styles.instructorCopy}>Switch anytime. The selected difficulty also changes the suggested session.</Text><View style={styles.instructorToggleRow}>{workout.instructorOptions.map((option) => <Pressable key={option.kind} onPress={() => setInstructorChoice(option.kind)} style={[styles.instructorToggle, selectedInstructor.kind === option.kind && styles.instructorToggleActive]}><Text style={[styles.instructorToggleText, selectedInstructor.kind === option.kind && styles.instructorToggleTextActive]}>{option.kind === "man" ? "Man-led" : "Woman-led"}</Text></Pressable>)}</View><Pressable onPress={() => open(selectedInstructor.videoUrl)} style={styles.openButton}><Text style={styles.optionKicker}>{selectedInstructor.label.toUpperCase()} · {selectedInstructor.name.toUpperCase()}</Text><Text style={styles.openButtonText}>{selectedInstructor.videoTitle} →</Text></Pressable>{workout.resourceDemonstrations.length ? <View style={styles.demonstrationBlock}><Text style={styles.instructorLabel}>RESOURCE DEMONSTRATIONS</Text><Text style={styles.instructorCopy}>Optional form demonstrations that match the item this session uses.</Text>{workout.resourceDemonstrations.map((demonstration) => <Pressable key={demonstration.resource} onPress={() => open(demonstration.videoUrl)} style={styles.demonstrationButton}><Text style={styles.optionKicker}>{demonstration.resource.toUpperCase()} · {demonstration.videoProvider.toUpperCase()}</Text><Text style={styles.demonstrationText}>{demonstration.title} →</Text></Pressable>)}</View> : null}</> : <View style={styles.offlineNote}><Text style={styles.offlineNoteTitle}>SELF-GUIDED SESSION</Text><Text style={styles.offlineNoteText}>Streaming was not selected in your available home setup, so this plan is designed to work from the movements above. Mark internet available today or add it to your saved gear if you want follow-along links.</Text></View>}<View style={styles.actionRow}><Pressable onPress={() => updateState(workoutId, { saved: !state.saved })} style={[styles.actionButton, state.saved && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.saved ? "★ Saved" : "☆ Save session"}</Text></Pressable><Pressable onPress={markWorkoutComplete} style={[styles.actionButton, state.completedAt && styles.actionButtonActive]}><Text style={styles.actionButtonText}>{state.completedAt ? "✓ Completed" : "Mark complete"}</Text></Pressable></View><Pressable onPress={chooseWorkoutForLog} style={styles.logButton}><Text style={styles.logButtonText}>{activeWorkout?.id === workoutId ? "Logging this session" : "Log a home set"}</Text></Pressable></View>

    <View style={styles.logCard}><Text style={styles.cardKicker}>HOME EXERCISE LOG</Text><Text style={styles.cardTitle}>{activeWorkout ? activeWorkout.title : "Choose “Log a home set” above"}</Text><Text style={styles.cardCopy}>Record bodyweight or weighted home variations. Weight is optional and uses kilograms.</Text><TextInput value={exerciseName} onChangeText={setExerciseName} placeholder="Exercise name, e.g. bodyweight squat" placeholderTextColor="#93A197" style={styles.input} returnKeyType="done" /><View style={styles.inputRow}><TextInput value={setNumber} onChangeText={setSetNumber} placeholder="Set" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /><TextInput value={repCount} onChangeText={setRepCount} placeholder="Reps" placeholderTextColor="#93A197" keyboardType="number-pad" style={[styles.input, styles.inputHalf]} /></View><TextInput value={weightUsedKg} onChangeText={setWeightUsedKg} placeholder="Weight used in kg (optional; 0 for bodyweight)" placeholderTextColor="#93A197" keyboardType="decimal-pad" style={styles.input} /><Pressable onPress={saveSetLog} style={styles.logPrimary}><Text style={styles.logPrimaryText}>Save set locally</Text></Pressable>{exerciseLogs.slice(0, 5).map((log) => <Text key={log.id} style={styles.logHistory}>• {log.exerciseName} — set {log.setNumber}: {log.repCount} reps{log.weightUsedKg !== null ? ` · ${log.weightUsedKg} kg` : " · bodyweight"}</Text>)}</View>
    <View style={styles.note}><Text style={styles.noteText}>Saved sessions, completion dates, difficulty selection, and home set logs stay on this device in the current MVP. When signed in, new set logs also try to sync. Pause, modify, or choose a gentler session if anything does not feel right.</Text></View>
  </ScrollView><CompletionRatingPrompt visible={Boolean(completedWorkout)} completionKey={`workout:${completedWorkout?.id ?? ""}:${new Date().toISOString().slice(0, 10)}`} title={completedWorkout?.title ?? "this workout"} onClose={() => setCompletedWorkout(null)} /></ScreenContainer>;
}

const styles = StyleSheet.create({
  heroIllustration: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, height: 138, marginBottom: 13, overflow: "hidden" }, heroImage: { height: "100%", width: "100%" }, heroOverlay: { backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 999, left: 12, paddingHorizontal: 10, paddingVertical: 6, position: "absolute", top: 12 }, heroOverlayText: { color: "#1D583E", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, reminderCard: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, reminderCopy: { color: "#405A6C", fontSize: 13, lineHeight: 19 }, reminderSchedule: { borderTopColor: "#D7E5F0", borderTopWidth: 1, marginTop: 13, paddingTop: 2 }, reminderSectionLabel: { color: "#245574", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 13 }, weekdayOptions: { flexDirection: "row", gap: 6, marginTop: 8 }, weekdayOption: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 10, borderWidth: 1, flex: 1, paddingVertical: 8 }, weekdayOptionActive: { backgroundColor: "#245574", borderColor: "#245574" }, weekdayOptionText: { color: "#245574", fontSize: 11, fontWeight: "800" }, weekdayOptionTextActive: { color: "#FFFFFF" }, reminderOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 }, reminderOption: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 }, reminderOptionActive: { backgroundColor: "#245574", borderColor: "#245574" }, reminderOptionText: { color: "#245574", fontSize: 12, fontWeight: "800" }, reminderOptionTextActive: { color: "#FFFFFF" }, scheduleSummary: { color: "#405A6C", fontSize: 12, fontWeight: "700", marginTop: 8 }, quoteOptions: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 8 }, quoteOption: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 }, quoteOptionActive: { backgroundColor: "#245574", borderColor: "#245574" }, quoteOptionText: { color: "#245574", fontSize: 12, fontWeight: "800" }, quoteOptionTextActive: { color: "#FFFFFF" }, quotePreview: { color: "#405A6C", fontSize: 12, fontStyle: "italic", lineHeight: 18, marginTop: 9 }, reminderQuoteInput: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 10, borderWidth: 1, color: "#1F2A25", fontSize: 13, marginTop: 9, minHeight: 43, paddingHorizontal: 11 }, pauseReminderButton: { alignItems: "center", borderColor: "#245574", borderRadius: 11, borderWidth: 1, marginTop: 13, paddingVertical: 11 }, pauseReminderButtonActive: { backgroundColor: "#245574" }, pauseReminderText: { color: "#245574", fontSize: 13, fontWeight: "800" }, pauseReminderTextActive: { color: "#FFFFFF" }, reminderStatus: { color: "#245574", fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 10 },
  whyTodayCard: { backgroundColor: "#EAF3EA", borderColor: "#BFD8C4", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, whyTodayText: { color: "#365548", fontSize: 13, lineHeight: 20 }, substituteCard: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, substituteButton: { backgroundColor: "#FFFFFF", borderColor: "#BCD5E9", borderRadius: 11, borderWidth: 1, marginTop: 9, paddingHorizontal: 12, paddingVertical: 11 }, substituteText: { color: "#245574", fontSize: 13, fontWeight: "800", lineHeight: 18 }, previewCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, previewTitle: { color: "#1F2A25", fontSize: 17, fontWeight: "800", lineHeight: 23 }, previewMeta: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 5 }, previewChecklistTitle: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 12 }, previewCheck: { color: "#405247", fontSize: 12, lineHeight: 18, marginTop: 4 }, resourceFeedbackCard: { backgroundColor: "#FFF9ED", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginBottom: 13, padding: 15 }, resourceFeedbackContext: { color: "#6B4A2C", fontSize: 13, fontWeight: "800", lineHeight: 19 }, resourceFeedbackInput: { backgroundColor: "#FFFFFF", borderColor: "#E8D1A4", borderRadius: 10, borderWidth: 1, color: "#1F2A25", fontSize: 13, marginTop: 10, minHeight: 42, paddingHorizontal: 11 }, resourceFeedbackActions: { flexDirection: "row", gap: 8, marginTop: 10 }, feedbackHelpfulButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 10, flex: 1, minHeight: 42, justifyContent: "center", paddingHorizontal: 8 }, feedbackHelpfulText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", textAlign: "center" }, feedbackAdjustButton: { alignItems: "center", borderColor: "#9D6A31", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 42, justifyContent: "center", paddingHorizontal: 8 }, feedbackAdjustText: { color: "#6B4A2C", fontSize: 12, fontWeight: "800", textAlign: "center" }, resourceFeedbackStatus: { color: "#1D583E", fontSize: 13, fontWeight: "800", lineHeight: 19, marginTop: 9 },
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 20, marginTop: 10 }, sectionTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800", marginBottom: 10 }, controlCard: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 15 }, difficultyRow: { flexDirection: "row", gap: 8, marginTop: 4 }, difficultyButton: { borderColor: "#BFD8C4", borderRadius: 12, borderWidth: 1, flex: 1, padding: 10 }, difficultyButtonActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, difficultyTitle: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, difficultyCopy: { color: "#526259", fontSize: 10, lineHeight: 14, marginTop: 3 }, difficultyTextActive: { color: "#FFFFFF" }, equipmentCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 15 }, equipmentHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, equipmentHeadingCopy: { flex: 1, paddingRight: 10 }, equipmentTitle: { color: "#1F2A25", fontSize: 16, fontWeight: "800" }, equipmentEditButton: { borderColor: "#2D6A4F", borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 }, equipmentEditText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, equipmentBody: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 7 }, equipmentOptions: { gap: 7, marginTop: 12 }, equipmentOption: { borderColor: "#DDE5DA", borderRadius: 10, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9 }, equipmentOptionActive: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, equipmentOptionText: { color: "#405247", fontSize: 13, fontWeight: "700" }, equipmentOptionTextActive: { color: "#1D583E" }, availabilityCard: { backgroundColor: "#F5F8F2", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 19, padding: 15 }, availabilityOptions: { gap: 7, marginTop: 12 }, availabilityOption: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingVertical: 9 }, availabilityOptionUnavailable: { backgroundColor: "#FFF8F3", borderColor: "#E8D1A4" }, availabilityOptionText: { color: "#1D583E", fontSize: 11, fontWeight: "800" }, availabilityOptionTextUnavailable: { color: "#8A4A24" }, availabilityResource: { color: "#405247", fontSize: 13, fontWeight: "700", flex: 1, marginLeft: 10, textAlign: "right" }, availabilityResourceUnavailable: { color: "#6B4A2C", textDecorationLine: "line-through" }, dayChips: { gap: 8, marginBottom: 16 }, dayChip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, minWidth: 75, paddingHorizontal: 12, paddingVertical: 10 }, dayChipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, dayChipText: { color: "#1F2A25", fontSize: 13, fontWeight: "800", textAlign: "center" }, dayChipCopy: { color: "#526259", fontSize: 10, marginTop: 2, textAlign: "center" }, dayChipTextActive: { color: "#FFFFFF" }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 13, padding: 17 }, cardComplete: { backgroundColor: "#F1F7F0", borderColor: "#9BC8A7" }, cardKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 7 }, cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25 }, resourceLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 14 }, resourcePillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 }, resourcePill: { backgroundColor: "#EAF3EA", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }, resourcePillText: { color: "#1D583E", fontSize: 11, fontWeight: "800" }, resourceReason: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 8 }, cardCopy: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 11 }, adaptation: { color: "#1D583E", fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 10 }, completedNote: { color: "#1D583E", fontSize: 13, fontWeight: "800", marginTop: 10 }, instructorLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 16 }, instructorCopy: { color: "#526259", fontSize: 12, lineHeight: 18, marginTop: 4 }, instructorToggleRow: { flexDirection: "row", gap: 8, marginTop: 10 }, instructorToggle: { alignItems: "center", borderColor: "#BFD8C4", borderRadius: 10, borderWidth: 1, flex: 1, paddingVertical: 10 }, instructorToggleActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, instructorToggleText: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, instructorToggleTextActive: { color: "#FFFFFF" }, optionKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.5, marginBottom: 3 }, openButton: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 12, marginTop: 9, minHeight: 46, justifyContent: "center", paddingHorizontal: 12 }, openButtonText: { color: "#1D583E", fontSize: 14, fontWeight: "800", textAlign: "center", textDecorationLine: "underline" }, demonstrationBlock: { marginTop: 4 }, demonstrationButton: { backgroundColor: "#F3F7FB", borderColor: "#BCD5E9", borderRadius: 12, borderWidth: 1, marginTop: 9, minHeight: 46, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 10 }, demonstrationText: { color: "#245574", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" }, offlineNote: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 12 }, offlineNoteTitle: { color: "#6B4A2C", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, offlineNoteText: { color: "#6B4A2C", fontSize: 12, lineHeight: 18, marginTop: 4 }, actionRow: { flexDirection: "row", gap: 9, marginTop: 10 }, actionButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, flex: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: 8 }, actionButtonActive: { backgroundColor: "#D8EADD", borderColor: "#2D6A4F" }, actionButtonText: { color: "#1D583E", fontSize: 12, fontWeight: "800" }, logButton: { alignItems: "center", borderColor: "#C9DFC9", borderRadius: 10, borderWidth: 1, marginTop: 10, paddingVertical: 10 }, logButtonText: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, logCard: { backgroundColor: "#FFFFFF", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 17 }, input: { backgroundColor: "#F8F9F5", borderColor: "#DDE5DA", borderRadius: 11, borderWidth: 1, color: "#1F2A25", fontSize: 14, marginTop: 10, minHeight: 45, paddingHorizontal: 12 }, inputRow: { flexDirection: "row", gap: 10 }, inputHalf: { flex: 1 }, logPrimary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 12, marginTop: 11, paddingVertical: 13 }, logPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, logHistory: { color: "#405247", fontSize: 13, lineHeight: 20, marginTop: 9 }, note: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginTop: 5, padding: 15 }, noteText: { color: "#6B4A2C", fontSize: 13, lineHeight: 19 },
});
