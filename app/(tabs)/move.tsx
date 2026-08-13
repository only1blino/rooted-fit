import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";

import { ScreenContainer } from "@/components/screen-container";
import { formatToday, loadWaterLogs, saveWaterLogs, type DailyWaterLog } from "@/lib/rootedfit-profile";

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });

const CIRCUIT = ["March gently and roll your shoulders.", "Bodyweight squats or chair sit-to-stands.", "Wall or counter push-ups.", "Alternating reverse steps or supported lunges.", "Standing knee drives with a long exhale.", "Glute bridges or standing hip extensions.", "Easy marching and slow breathing."];
const STRETCHES = ["Look away from the screen and take 3 slow breaths.", "Roll shoulders backward 8 times, then forward 8 times.", "Turn your head gently left and right; pause before any discomfort.", "Open your chest by drawing elbows back or placing hands behind you.", "Circle both wrists, then open and close your hands slowly.", "Stand if comfortable: reach upward, then take 6 relaxed steps."];
const RELEASE_NOTES = [
  { version: "Browser tester update", date: "Current", items: ["Send feedback directly from any page.", "Share the app link with a browser-safe copy fallback.", "See a first-visit guide to Plans, Meals, Workouts, Track, and Extras."] },
  { version: "Meals and grocery update", date: "Recent", items: ["Replace a recipe with a similar option and keep exclusions in future rotations.", "Use categorized, tick-off grocery lists with printable and PDF output.", "Choose lighter protein-forward breakfasts and a two-week meal rotation."] },
  { version: "Workout and tracking update", date: "Recent", items: ["Save and complete follow-along sessions, then record bodyweight or weighted home sets.", "Track water, steps, body measurements, and progress records locally."] },
];

export default function ExtrasScreen() {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [running, setRunning] = useState(false);
  const [stretchIndex, setStretchIndex] = useState(0);
  const [reminderMinutes, setReminderMinutes] = useState(60);
  const [remindersOn, setRemindersOn] = useState(false);
  const [waterMl, setWaterMl] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadWaterLogs().then((logs) => setWaterMl(logs.find((log) => log.date === formatToday())?.millilitres ?? 0)); }, []);
  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setSecondsLeft((value) => { if (value <= 1) { setRunning(false); Alert.alert("Ten minutes complete", "A short session still counts."); return 600; } return value - 1; }), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const addWater = async (millilitres: number) => {
    const nextMl = waterMl + millilitres;
    setWaterMl(nextMl);
    const logs = await loadWaterLogs();
    const next: DailyWaterLog[] = [{ date: formatToday(), millilitres: nextMl }, ...logs.filter((log) => log.date !== formatToday())];
    await saveWaterLogs(next);
  };
  const resetWater = async () => {
    setWaterMl(0);
    const logs = await loadWaterLogs();
    await saveWaterLogs([{ date: formatToday(), millilitres: 0 }, ...logs.filter((log) => log.date !== formatToday())]);
  };
  const setReminder = async () => {
    if (Platform.OS === "web") { Alert.alert("Use manual desk breaks on web", "Recurring reminders are available in the mobile app."); return; }
    const current = await Notifications.getPermissionsAsync();
    const status = current.status === "granted" ? "granted" : (await Notifications.requestPermissionsAsync()).status;
    if (status !== "granted") { Alert.alert("Reminders were not enabled", "You can still use the stretch sequence whenever you need it."); return; }
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("rooted-desk-breaks", { name: "Rooted desk breaks", importance: Notifications.AndroidImportance.DEFAULT });
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({ content: { title: "Rooted desk break", body: "Take two minutes to look away, roll your shoulders, and move gently.", sound: false }, trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: reminderMinutes * 60, repeats: true, channelId: "rooted-desk-breaks" } });
    setRemindersOn(true);
  };
  const stopReminders = async () => { await Notifications.cancelAllScheduledNotificationsAsync(); setRemindersOn(false); };
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>EXTRAS FOR REAL LIFE</Text><Text style={styles.title}>Small tools that fit your day.</Text><Text style={styles.body}>Water, quick movement, and posture breaks live here so your main plan stays simple.</Text><View style={styles.card}><Text style={styles.kicker}>WATER TRACKER · TODAY</Text><Text style={styles.cardTitle}>{waterMl} ml logged</Text><Text style={styles.helper}>{(waterMl / 1000).toFixed(1)} L · {(waterMl / 29.5735).toFixed(0)} fl oz. Choose a container size you actually use.</Text><View style={styles.choiceRow}>{[[250, "1 cup"], [500, "bottle"], [750, "large bottle"]].map(([value, label]) => <Pressable key={String(value)} onPress={() => addWater(Number(value))} style={styles.choice}><Text style={styles.choiceText}>+ {label}</Text><Text style={styles.choiceText}>{value} ml</Text></Pressable>)}</View><Pressable onPress={resetWater} style={styles.secondaryWide}><Text style={styles.secondaryText}>Reset today’s count</Text></Pressable></View><Text style={styles.sectionTitle}>Busy Parent · 10 minutes</Text><View style={styles.timerCard}><Text style={styles.timer}>{minutes}:{seconds}</Text><Text style={styles.timerCopy}>{running ? "Keep a pace that lets you stay in control." : "Press start when you have ten minutes and a small safe space."}</Text><View style={styles.row}><Pressable onPress={() => setRunning((value) => !value)} style={styles.primary}><Text style={styles.primaryText}>{running ? "Pause" : "Start 10 minutes"}</Text></Pressable><Pressable onPress={() => { setRunning(false); setSecondsLeft(600); }} style={styles.secondary}><Text style={styles.secondaryText}>Reset</Text></Pressable></View></View><View style={styles.card}><Text style={styles.kicker}>BODYWEIGHT CIRCUIT</Text>{CIRCUIT.map((step, index) => <Text key={step} style={styles.step}>{index + 1}. {step}</Text>)}<Text style={styles.helper}>Stop if pain, dizziness, numbness, or new symptoms occur.</Text></View><Text style={styles.sectionTitle}>Desk fitness · 2 minutes</Text><View style={styles.deskCard}><Text style={styles.kicker}>STEP {stretchIndex + 1} OF {STRETCHES.length}</Text><Text style={styles.deskInstruction}>{STRETCHES[stretchIndex]}</Text><View style={styles.row}><Pressable onPress={() => setStretchIndex((value) => (value + STRETCHES.length - 1) % STRETCHES.length)} style={styles.secondary}><Text style={styles.secondaryText}>Back</Text></Pressable><Pressable onPress={() => setStretchIndex((value) => (value + 1) % STRETCHES.length)} style={styles.primary}><Text style={styles.primaryText}>Next stretch</Text></Pressable></View></View><View style={styles.card}><Text style={styles.kicker}>LOCAL DESK-BREAK REMINDERS</Text><Text style={styles.cardTitle}>{remindersOn ? "Reminders are on" : "Set a gentle reminder"}</Text><View style={styles.choiceRow}>{[30, 60, 90].map((value) => <Pressable key={value} onPress={() => setReminderMinutes(value)} style={[styles.choice, reminderMinutes === value && styles.choiceActive]}><Text style={styles.choiceText}>{value} min</Text></Pressable>)}</View>{remindersOn ? <Pressable onPress={stopReminders} style={styles.secondaryWide}><Text style={styles.secondaryText}>Turn off reminders</Text></Pressable> : <Pressable onPress={setReminder} style={styles.primaryWide}><Text style={styles.primaryText}>Turn on desk reminders</Text></Pressable>}</View><Text style={styles.sectionTitle}>What’s New</Text><View style={styles.card}><Text style={styles.helper}>Recent tester-facing updates and fixes appear here. Please use Provide Feedback if anything does not match your expectations.</Text>{RELEASE_NOTES.map((release) => <View key={release.version} style={styles.release}><View style={styles.releaseHeader}><Text style={styles.releaseTitle}>{release.version}</Text><Text style={styles.releaseDate}>{release.date}</Text></View>{release.items.map((item) => <Text key={item} style={styles.step}>• {item}</Text>)}</View>)}</View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 29, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 18, marginTop: 9 }, sectionTitle: { color: "#1F2A25", fontSize: 22, fontWeight: "800", marginTop: 2, marginBottom: 11 }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 18, padding: 17 }, timerCard: { backgroundColor: "#2D6A4F", borderRadius: 20, marginBottom: 16, padding: 20 }, deskCard: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 16, padding: 18 }, kicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 9 }, cardTitle: { color: "#1F2A25", fontSize: 20, fontWeight: "800", marginBottom: 5 }, helper: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 8 }, timer: { color: "#FFFFFF", fontSize: 48, fontWeight: "800", textAlign: "center" }, timerCopy: { color: "#D9ECDD", fontSize: 14, lineHeight: 20, marginTop: 8, textAlign: "center" }, deskInstruction: { color: "#1D583E", fontSize: 20, fontWeight: "800", lineHeight: 28 }, row: { flexDirection: "row", gap: 10, marginTop: 16 }, choiceRow: { flexDirection: "row", gap: 8, marginTop: 12 }, choice: { alignItems: "center", backgroundColor: "#F8F6EF", borderColor: "#DDE5DA", borderRadius: 12, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 45, paddingHorizontal: 5 }, choiceActive: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, choiceText: { color: "#385046", fontSize: 12, fontWeight: "800", textAlign: "center" }, primary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 13, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 10 }, secondary: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B9D2BD", borderRadius: 13, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 48, paddingHorizontal: 10 }, primaryWide: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 13, justifyContent: "center", marginTop: 14, minHeight: 50 }, secondaryWide: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#B9D2BD", borderRadius: 13, borderWidth: 1, justifyContent: "center", marginTop: 14, minHeight: 50 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, secondaryText: { color: "#2D6A4F", fontSize: 14, fontWeight: "800" }, step: { color: "#405247", fontSize: 14, lineHeight: 21, marginBottom: 8 }, release: { borderTopColor: "#E5EBE3", borderTopWidth: 1, marginTop: 14, paddingTop: 13 }, releaseHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }, releaseTitle: { color: "#1F2A25", fontSize: 15, fontWeight: "800" }, releaseDate: { color: "#6B7A70", fontSize: 12, fontWeight: "700" },
});
