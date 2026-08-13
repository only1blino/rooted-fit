import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { loadCompletionRatings, saveCompletionRatings, type CompletionRating } from "@/lib/rootedfit-profile";

export function CompletionRatingPrompt({ visible, completionKey, title, onClose }: { visible: boolean; completionKey: string; title: string; onClose: () => void }) {
  const [saving, setSaving] = useState(false);

  const saveRating = async (rating: CompletionRating["rating"]) => {
    setSaving(true);
    try {
      const existing = await loadCompletionRatings();
      await saveCompletionRatings([{ completionKey, rating, ratedAt: new Date().toISOString() }, ...existing.filter((item) => item.completionKey !== completionKey)]);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}><View style={styles.backdrop}><View style={styles.card}><Text style={styles.kicker}>OPTIONAL QUICK RATING</Text><Text style={styles.title}>How did {title} feel?</Text><Text style={styles.copy}>This is only a personal note to help you reflect on what fits your real life. You can skip it anytime.</Text><View style={styles.ratingRow}>{([1, 2, 3, 4, 5] as const).map((rating) => <Pressable key={rating} accessibilityRole="button" disabled={saving} onPress={() => saveRating(rating)} style={styles.ratingButton}><Text style={styles.ratingText}>{rating}</Text></Pressable>)}</View><View style={styles.labels}><Text style={styles.label}>Not a fit</Text><Text style={styles.label}>Felt great</Text></View><Pressable accessibilityRole="button" onPress={onClose} style={styles.skipButton}><Text style={styles.skipText}>Skip rating</Text></Pressable></View></View></Modal>;
}

const styles = StyleSheet.create({
  backdrop: { alignItems: "center", backgroundColor: "rgba(22, 36, 29, 0.56)", flex: 1, justifyContent: "center", padding: 22 },
  card: { backgroundColor: "#F8F6EF", borderRadius: 20, maxWidth: 460, padding: 22, width: "100%" },
  kicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 },
  title: { color: "#1F2A25", fontSize: 22, fontWeight: "800", lineHeight: 29 },
  copy: { color: "#526259", fontSize: 14, lineHeight: 21, marginTop: 9 },
  ratingRow: { flexDirection: "row", gap: 8, justifyContent: "space-between", marginTop: 19 },
  ratingButton: { alignItems: "center", backgroundColor: "#EAF3EA", borderColor: "#BFD8C4", borderRadius: 12, borderWidth: 1, height: 44, justifyContent: "center", width: 44 },
  ratingText: { color: "#1D583E", fontSize: 16, fontWeight: "800" },
  labels: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  label: { color: "#6B7A70", fontSize: 11, fontWeight: "700" },
  skipButton: { alignItems: "center", marginTop: 18, padding: 10 },
  skipText: { color: "#2D6A4F", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
});
