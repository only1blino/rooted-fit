import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { buildMonthlyTrendSeries, buildMonthProgressSummary, formatToday, loadCheckIns, loadMeasurements, loadProfile, type BodyMeasurement, type DailyCheckIn, type UserProfile } from "@/lib/rootedfit-profile";

export default function ProgressOverviewScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadProfile(), loadCheckIns(), loadMeasurements()]).then(([savedProfile, savedCheckIns, savedMeasurements]) => {
      setProfile(savedProfile);
      setCheckIns(savedCheckIns);
      setMeasurements(savedMeasurements);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;
  if (!profile) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><View style={styles.empty}><Text style={styles.eyebrow}>ROOTED TRACKING</Text><Text style={styles.title}>Your progress begins with your plan.</Text><Text style={styles.body}>Finish onboarding first, then this private chart will grow from your own check-ins.</Text><Link href="/" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Open my plan</Text></Pressable></Link></View></ScreenContainer>;

  const trend = buildMonthlyTrendSeries(checkIns);
  const highest = Math.max(1, ...trend.flatMap((point) => [point.movementDays, point.mealDays]));
  const month = buildMonthProgressSummary(checkIns, measurements, formatToday());
  const movementChange = month.currentMovementDays - month.previousMovementDays;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>ROOTED TRACKING</Text><Text style={styles.title}>Your monthly rhythm.</Text><Text style={styles.body}>A visual view of movement and meal-plan days. Your information stays on this device.</Text><View style={styles.summary}><Text style={styles.summaryKicker}>THIS MONTH</Text><Text style={styles.summaryValue}>{month.currentMovementDays}</Text><Text style={styles.summaryLabel}>movement days</Text><Text style={styles.summaryCopy}>{month.comparisonReady ? `${movementChange >= 0 ? "+" : ""}${movementChange} compared with the previous 30 days` : "Keep checking in; your first comparison is building."}</Text></View><View style={styles.chartCard}><View style={styles.chartHeader}><View><Text style={styles.chartKicker}>FOUR-WEEK TREND</Text><Text style={styles.chartTitle}>Your actions at a glance</Text></View><Text style={styles.legend}><Text style={styles.legendMovement}>Movement</Text>{"\n"}<Text style={styles.legendMeals}>Meals</Text></Text></View><View style={styles.bars}>{trend.map((point) => <View key={point.label} style={styles.week}><View style={styles.barSpace}><View style={[styles.bar, styles.movementBar, { height: Math.max(8, (point.movementDays / highest) * 96) }]} /><View style={[styles.bar, styles.mealBar, { height: Math.max(8, (point.mealDays / highest) * 96) }]} /></View><Text style={styles.weekLabel}>{point.label}</Text><Text style={styles.weekValue}>{point.movementDays}/{point.mealDays}</Text></View>)}</View><Text style={styles.chartNote}>Each pair is movement days / meal-plan days. Missing days are simply empty—not failures.</Text></View><View style={styles.detailCard}><Text style={styles.detailKicker}>KEEP YOUR DATA CURRENT</Text><Text style={styles.detailTitle}>Log a day, then return to see the chart move.</Text><Text style={styles.detailCopy}>You can also type steps, save optional measurements, and keep private progress photos in the full tracker.</Text><Link href="/tracker" asChild><Pressable style={styles.primary}><Text style={styles.primaryText}>Open check-in & measurements</Text></Pressable></Link></View></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, empty: { flex: 1, justifyContent: "center", padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 29, fontWeight: "800", lineHeight: 36 }, body: { color: "#526259", fontSize: 15, lineHeight: 23, marginBottom: 18, marginTop: 9 }, summary: { backgroundColor: "#214C3A", borderRadius: 20, marginBottom: 15, padding: 18 }, summaryKicker: { color: "#B9DCC1", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 }, summaryValue: { color: "#FFFFFF", fontSize: 42, fontWeight: "800", lineHeight: 48, marginTop: 5 }, summaryLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" }, summaryCopy: { color: "#D7EEDD", fontSize: 12, lineHeight: 18, marginTop: 7 }, chartCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 20, borderWidth: 1, marginBottom: 15, padding: 17 }, chartHeader: { flexDirection: "row", justifyContent: "space-between" }, chartKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, chartTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800", marginTop: 4 }, legend: { color: "#526259", fontSize: 11, lineHeight: 17, textAlign: "right" }, legendMovement: { color: "#2D6A4F", fontWeight: "800" }, legendMeals: { color: "#C06A3B", fontWeight: "800" }, bars: { alignItems: "flex-end", flexDirection: "row", height: 142, justifyContent: "space-around", marginTop: 16 }, week: { alignItems: "center", width: 48 }, barSpace: { alignItems: "flex-end", flexDirection: "row", gap: 4, height: 100 }, bar: { borderRadius: 6, width: 14 }, movementBar: { backgroundColor: "#2D6A4F" }, mealBar: { backgroundColor: "#E1A471" }, weekLabel: { color: "#1F2A25", fontSize: 11, fontWeight: "800", marginTop: 8 }, weekValue: { color: "#6B7A70", fontSize: 10, marginTop: 2 }, chartNote: { color: "#6B7A70", fontSize: 11, lineHeight: 16, marginTop: 12 }, detailCard: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 20, borderWidth: 1, padding: 17 }, detailKicker: { color: "#9A4A35", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, detailTitle: { color: "#5F442D", fontSize: 18, fontWeight: "800", lineHeight: 24, marginTop: 6 }, detailCopy: { color: "#6B4A2C", fontSize: 13, lineHeight: 20, marginTop: 7 }, primary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 13, marginTop: 16, paddingVertical: 13 }, primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
