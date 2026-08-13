import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Pedometer } from "expo-sensors";

import { ScreenContainer } from "@/components/screen-container";
import {
  buildMotivationalMessage,
  formatToday,
  loadCheckIns,
  loadMeasurements,
  loadProfile,
  numberOrNull,
  saveCheckIns,
  saveMeasurements,
  type BodyMeasurement,
  type DailyCheckIn,
  type UserProfile,
} from "@/lib/rootedfit-profile";

type Mood = DailyCheckIn["mood"];
const MOODS: { label: string; value: Mood }[] = [
  { label: "Low", value: "low" },
  { label: "Steady", value: "steady" },
  { label: "Good", value: "good" },
  { label: "Great", value: "great" },
];

function SmallChoice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.smallChoice, selected && styles.smallChoiceSelected]}><Text style={[styles.smallChoiceText, selected && styles.smallChoiceTextSelected]}>{selected ? "✓ " : ""}{label}</Text></Pressable>;
}

export default function TrackerScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stepsText, setStepsText] = useState("");
  const [mood, setMood] = useState<Mood>("steady");
  const [followedMealIdea, setFollowedMealIdea] = useState(false);
  const [completedMovement, setCompletedMovement] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [weightText, setWeightText] = useState("");
  const [waistText, setWaistText] = useState("");
  const [hipText, setHipText] = useState("");
  const [chestText, setChestText] = useState("");
  const [measurementNote, setMeasurementNote] = useState("");
  const [pedometerStatus, setPedometerStatus] = useState<"checking" | "available" | "unavailable" | "connected">("checking");
  const [liveSteps, setLiveSteps] = useState(0);
  const subscriptionRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);

  useEffect(() => {
    Promise.all([loadProfile(), loadCheckIns(), loadMeasurements()]).then(([savedProfile, savedCheckIns, savedMeasurements]) => {
      setProfile(savedProfile);
      setCheckIns(savedCheckIns);
      setMeasurements(savedMeasurements);
      const todaysCheckIn = savedCheckIns.find((entry) => entry.date === formatToday());
      if (todaysCheckIn) {
        setStepsText(String(todaysCheckIn.steps));
        setMood(todaysCheckIn.mood);
        setFollowedMealIdea(todaysCheckIn.followedMealIdea);
        setCompletedMovement(todaysCheckIn.completedMovement);
        setCheckInNote(todaysCheckIn.note);
      } else if (savedProfile?.dailyStepCount) {
        setStepsText(String(savedProfile.dailyStepCount));
      }
      const latest = savedMeasurements[0];
      if (latest) {
        setWeightText(latest.weightKg ? String(latest.weightKg) : "");
        setWaistText(latest.waistCm ? String(latest.waistCm) : "");
        setHipText(latest.hipCm ? String(latest.hipCm) : "");
        setChestText(latest.chestCm ? String(latest.chestCm) : "");
      }
    }).finally(() => setIsLoading(false));

    Pedometer.isAvailableAsync().then((available) => setPedometerStatus(available ? "available" : "unavailable")).catch(() => setPedometerStatus("unavailable"));
    return () => subscriptionRef.current?.remove();
  }, []);

  const connectPedometer = async () => {
    try {
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Step access was not enabled", "You can continue to type your daily steps manually.");
        return;
      }
      subscriptionRef.current?.remove();
      subscriptionRef.current = Pedometer.watchStepCount((result) => setLiveSteps(result.steps));
      setPedometerStatus("connected");
    } catch {
      Alert.alert("Device steps are unavailable", "You can continue to type your steps manually on this device.");
      setPedometerStatus("unavailable");
    }
  };

  const useDeviceSteps = () => setStepsText(String(liveSteps));

  const saveToday = async () => {
    const steps = numberOrNull(stepsText);
    if (steps === null) {
      Alert.alert("Add today’s steps", "Type a number, even if it is an estimate.");
      return;
    }
    const entry: DailyCheckIn = { id: formatToday(), date: formatToday(), steps, mood, followedMealIdea, completedMovement, note: checkInNote.trim() };
    const next = [entry, ...checkIns.filter((existing) => existing.date !== entry.date)].sort((a, b) => b.date.localeCompare(a.date));
    setCheckIns(next);
    await saveCheckIns(next);
    Alert.alert("Daily check-in saved", "Your log stays on this device and is ready for tomorrow’s reflection.");
  };

  const saveMeasurement = async () => {
    const weightKg = numberOrNull(weightText);
    const waistCm = numberOrNull(waistText);
    const hipCm = numberOrNull(hipText);
    const chestCm = numberOrNull(chestText);
    if ([weightKg, waistCm, hipCm, chestCm].every((value) => value === null)) {
      Alert.alert("Add at least one measurement", "You can track weight, waist, hip, chest, or any combination that feels useful.");
      return;
    }
    const entry: BodyMeasurement = { id: `measurement-${Date.now()}`, date: formatToday(), weightKg, waistCm, hipCm, chestCm, note: measurementNote.trim() };
    const next = [entry, ...measurements].sort((a, b) => b.date.localeCompare(a.date));
    setMeasurements(next);
    await saveMeasurements(next);
    setMeasurementNote("");
    Alert.alert("Weekly measurement saved", "Trends are more informative than a single number. Check in when it works for you.");
  };

  const latestMeasurement = measurements[0];
  const previousMeasurement = measurements[1];
  const currentSteps = numberOrNull(stepsText) ?? 0;
  const motivation = buildMotivationalMessage(checkIns, profile?.goal ?? null);

  if (isLoading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  if (!profile) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><View style={styles.emptyState}><Text style={styles.eyebrow}>ROOTED TRACKING</Text><Text style={styles.title}>Start with your plan first.</Text><Text style={styles.body}>Complete the RootedFit onboarding to unlock daily steps, check-ins, and weekly measurement tracking.</Text></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><Text style={styles.eyebrow}>ROOTED TRACKING</Text><Text style={styles.title}>Your steady progress.</Text><Text style={styles.body}>Log the habits and measures that matter to you. This is for reflection, not judgement.</Text><View style={styles.motivationCard}><Text style={styles.motivationText}>{motivation}</Text></View><View style={styles.card}><Text style={styles.kicker}>TODAY · {formatToday()}</Text><Text style={styles.cardTitle}>Daily check-in</Text><Text style={styles.fieldLabel}>Steps today</Text><View style={styles.stepRow}><TextInput value={stepsText} onChangeText={setStepsText} keyboardType="numeric" placeholder="0" placeholderTextColor="#93A197" style={styles.stepInput} returnKeyType="done" /><Text style={styles.stepSuffix}>steps</Text></View>{pedometerStatus === "available" ? <Pressable onPress={connectPedometer} style={styles.outlineButton}><Text style={styles.outlineButtonText}>Connect device steps</Text></Pressable> : null}{pedometerStatus === "connected" ? <View style={styles.liveStepBox}><Text style={styles.liveStepText}>Live device steps since connecting: {liveSteps}</Text><Pressable onPress={useDeviceSteps}><Text style={styles.linkText}>Use this number</Text></Pressable></View> : null}{pedometerStatus === "unavailable" ? <Text style={styles.helper}>Live device steps are not available here. Manual typing remains fully supported.</Text> : null}<Text style={styles.fieldLabel}>How did the day feel?</Text><View style={styles.moodRow}>{MOODS.map((item) => <SmallChoice key={item.value} label={item.label} selected={mood === item.value} onPress={() => setMood(item.value)} />)}</View><Text style={styles.fieldLabel}>What did you manage?</Text><SmallChoice label="I used a meal idea" selected={followedMealIdea} onPress={() => setFollowedMealIdea((current) => !current)} /><View style={styles.choiceGap} /><SmallChoice label="I completed movement" selected={completedMovement} onPress={() => setCompletedMovement((current) => !current)} /><Text style={[styles.fieldLabel, styles.spacedLabel]}>A short note (optional)</Text><TextInput value={checkInNote} onChangeText={setCheckInNote} placeholder="What helped or made today harder?" placeholderTextColor="#93A197" style={styles.textArea} multiline /><Pressable onPress={saveToday} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Save today’s check-in</Text></Pressable></View><View style={styles.card}><Text style={styles.kicker}>WEEKLY OR WHEN USEFUL</Text><Text style={styles.cardTitle}>Body measurements</Text><Text style={styles.helper}>Measurements are optional. Use the same method and time of day when you want clearer personal trends.</Text><MeasurementField label="Weight" value={weightText} onChangeText={setWeightText} suffix="kg" /><MeasurementField label="Waist" value={waistText} onChangeText={setWaistText} suffix="cm" /><MeasurementField label="Hip" value={hipText} onChangeText={setHipText} suffix="cm" /><MeasurementField label="Chest" value={chestText} onChangeText={setChestText} suffix="cm" /><Text style={styles.fieldLabel}>Note (optional)</Text><TextInput value={measurementNote} onChangeText={setMeasurementNote} placeholder="e.g. measured after waking" placeholderTextColor="#93A197" style={styles.textArea} multiline /><Pressable onPress={saveMeasurement} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Save weekly measurement</Text></Pressable></View><View style={styles.card}><Text style={styles.kicker}>YOUR LATEST TREND</Text><Text style={styles.cardTitle}>A gentle summary</Text>{latestMeasurement ? <View><Text style={styles.summaryText}>Latest record: {latestMeasurement.date}</Text><Text style={styles.summaryText}>Weight: {latestMeasurement.weightKg ?? "Not logged"} · Waist: {latestMeasurement.waistCm ?? "Not logged"}</Text>{previousMeasurement ? <Text style={styles.helper}>Previous record: {previousMeasurement.date}. Compare only when the conditions were similar.</Text> : <Text style={styles.helper}>Log another week when it feels useful; two records create your first comparison point.</Text>}</View> : <Text style={styles.helper}>Your first saved weekly measurement will appear here.</Text>}<Text style={styles.summaryText}>Today’s steps: {currentSteps}</Text><Text style={styles.helper}>Your baseline was {profile.dailyStepCount || "not set"} steps. A value is information, not a grade.</Text></View></ScrollView></ScreenContainer>;
}

function MeasurementField({ label, value, onChangeText, suffix }: { label: string; value: string; onChangeText: (value: string) => void; suffix: string }) {
  return <View style={styles.measurementRow}><Text style={styles.measurementLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} keyboardType="decimal-pad" placeholder="Optional" placeholderTextColor="#93A197" style={styles.measurementInput} returnKeyType="done" /><Text style={styles.measurementSuffix}>{suffix}</Text></View>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, emptyState: { flex: 1, justifyContent: "center", padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 20, marginTop: 10 }, motivationCard: { backgroundColor: "#E6F1E7", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 16, padding: 17 }, motivationText: { color: "#1D583E", fontSize: 15, fontWeight: "700", lineHeight: 22 }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 15, padding: 18 }, kicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 }, cardTitle: { color: "#1F2A25", fontSize: 20, fontWeight: "800", lineHeight: 26, marginBottom: 15 }, fieldLabel: { color: "#1F2A25", fontSize: 14, fontWeight: "800", marginBottom: 8 }, stepRow: { alignItems: "center", flexDirection: "row", gap: 9, marginBottom: 10 }, stepInput: { backgroundColor: "#F8F6EF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, color: "#1F2A25", flex: 1, fontSize: 17, fontWeight: "800", height: 52, paddingHorizontal: 14 }, stepSuffix: { color: "#526259", fontSize: 13, fontWeight: "700", width: 43 }, outlineButton: { alignItems: "center", borderColor: "#2D6A4F", borderRadius: 13, borderWidth: 1, minHeight: 45, justifyContent: "center", marginBottom: 14, paddingHorizontal: 12 }, outlineButtonText: { color: "#2D6A4F", fontSize: 14, fontWeight: "800" }, liveStepBox: { backgroundColor: "#EEF5EF", borderRadius: 12, marginBottom: 14, padding: 12 }, liveStepText: { color: "#405247", fontSize: 13, fontWeight: "700", lineHeight: 19 }, linkText: { color: "#2D6A4F", fontSize: 13, fontWeight: "800", marginTop: 7, textDecorationLine: "underline" }, helper: { color: "#6B7A70", fontSize: 12, lineHeight: 18, marginBottom: 12 }, moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }, smallChoice: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 12, borderWidth: 1, minHeight: 40, justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9 }, smallChoiceSelected: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, smallChoiceText: { color: "#385046", fontSize: 13, fontWeight: "700" }, smallChoiceTextSelected: { color: "#1D583E", fontWeight: "800" }, choiceGap: { height: 8 }, spacedLabel: { marginTop: 18 }, textArea: { backgroundColor: "#F8F6EF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, color: "#1F2A25", fontSize: 14, minHeight: 82, padding: 13, textAlignVertical: "top" }, primaryButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 14, justifyContent: "center", marginTop: 14, minHeight: 52, paddingHorizontal: 14 }, primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, measurementRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 10 }, measurementLabel: { color: "#405247", fontSize: 14, fontWeight: "700", width: 58 }, measurementInput: { backgroundColor: "#F8F6EF", borderColor: "#DDE5DA", borderRadius: 12, borderWidth: 1, color: "#1F2A25", flex: 1, fontSize: 14, height: 44, paddingHorizontal: 12 }, measurementSuffix: { color: "#6B7A70", fontSize: 12, fontWeight: "700", width: 23 }, summaryText: { color: "#405247", fontSize: 14, lineHeight: 21, marginBottom: 7 },
});
