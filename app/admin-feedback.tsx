import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useMemo, useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";

const FILTERS = ["all", "bug", "idea", "content", "other"] as const;
type FeedbackFilter = (typeof FILTERS)[number];

export default function AdminFeedbackScreen() {
  const [filter, setFilter] = useState<FeedbackFilter>("all");
  const feedbackQuery = trpc.testerFeedback.list.useQuery({ limit: 250 }, { retry: false });
  const feedback = useMemo(() => (feedbackQuery.data ?? []).filter((item) => filter === "all" || item.category === filter), [feedbackQuery.data, filter]);
  const counts = useMemo(() => (feedbackQuery.data ?? []).reduce<Record<string, number>>((accumulator, item) => ({ ...accumulator, [item.category]: (accumulator[item.category] ?? 0) + 1 }), {}), [feedbackQuery.data]);

  if (feedbackQuery.isLoading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;
  if (feedbackQuery.error) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><View style={styles.accessCard}><Text style={styles.eyebrow}>ROOTEDFIT BETA ADMIN</Text><Text style={styles.title}>Feedback review is restricted</Text><Text style={styles.body}>Sign in with the RootedFit project-owner account to review tester submissions. Feedback remains unavailable to public beta visitors.</Text></View></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>ROOTEDFIT BETA ADMIN</Text>
    <Text style={styles.title}>Tester feedback review</Text>
    <Text style={styles.body}>Review direct browser feedback and workout-resource responses collected from beta testing. This page is restricted to administrator accounts.</Text>
    <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{feedbackQuery.data?.length ?? 0}</Text><Text style={styles.summaryLabel}>total submissions</Text><Text style={styles.summaryDetail}>{counts.bug ?? 0} bugs · {counts.idea ?? 0} ideas · {counts.content ?? 0} content notes</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>{FILTERS.map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}><Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item === "all" ? "All feedback" : `${item} · ${counts[item] ?? 0}`}</Text></Pressable>)}</ScrollView>
    {feedback.length ? feedback.map((item) => <View key={item.id} style={styles.feedbackCard}><View style={styles.feedbackTop}><Text style={styles.category}>{item.category}</Text><Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text></View><Text style={styles.message}>{item.message}</Text>{item.pageUrl ? <Text style={styles.url}>{item.pageUrl}</Text> : null}</View>) : <View style={styles.emptyCard}><Text style={styles.emptyTitle}>No feedback in this view yet</Text><Text style={styles.body}>When testers submit a note, it will appear here under its selected category.</Text></View>}
    <Pressable onPress={() => feedbackQuery.refetch()} style={styles.refreshButton}><Text style={styles.refreshText}>Refresh feedback</Text></Pressable>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 9 }, title: { color: "#1F2A25", fontSize: 29, fontWeight: "800", lineHeight: 36 }, body: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 9 }, accessCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, margin: 22, padding: 18 }, summaryCard: { backgroundColor: "#EAF3EA", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginTop: 18, padding: 17 }, summaryNumber: { color: "#1D583E", fontSize: 34, fontWeight: "800" }, summaryLabel: { color: "#1D583E", fontSize: 13, fontWeight: "800" }, summaryDetail: { color: "#526259", fontSize: 12, marginTop: 8 }, filterRow: { gap: 8, marginBottom: 14, marginTop: 17 }, filter: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 }, filterActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, filterText: { color: "#405247", fontSize: 12, fontWeight: "800", textTransform: "capitalize" }, filterTextActive: { color: "#FFFFFF" }, feedbackCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 15, borderWidth: 1, marginBottom: 10, padding: 14 }, feedbackTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, category: { color: "#1D583E", fontSize: 11, fontWeight: "800", textTransform: "uppercase" }, date: { color: "#708077", fontSize: 11 }, message: { color: "#1F2A25", fontSize: 14, lineHeight: 21, marginTop: 9 }, url: { color: "#526259", fontSize: 11, marginTop: 9 }, emptyCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 15, borderWidth: 1, padding: 16 }, emptyTitle: { color: "#1F2A25", fontSize: 16, fontWeight: "800" }, refreshButton: { alignItems: "center", borderColor: "#2D6A4F", borderRadius: 12, borderWidth: 1, marginTop: 6, paddingVertical: 12 }, refreshText: { color: "#1D583E", fontSize: 13, fontWeight: "800" },
});
