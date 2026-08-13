import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { buildWeeklyPlan, loadMealSwaps, loadProfile, saveMealSwaps, saveProfile, type MealFrequency, type MealSwap, type UserProfile } from "@/lib/rootedfit-profile";

const FREQUENCIES: { value: MealFrequency; label: string; description: string }[] = [
  { value: "one_plus_snack", label: "One main meal + snack ideas", description: "One full recipe plus two optional snack ideas each day." },
  { value: "two", label: "Two meals a day", description: "Two planned meal slots, using rotated recipes from the weekly plan." },
  { value: "three", label: "Three meals a day", description: "Breakfast, lunch, and dinner slots, built from the same practical recipe rotation." },
];

export default function ScheduleScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [swaps, setSwaps] = useState<MealSwap[]>([]);

  useEffect(() => { loadProfile().then(setProfile); loadMealSwaps().then(setSwaps); }, []);
  const plan = useMemo(() => profile ? buildWeeklyPlan(profile) : null, [profile]);
  const day = plan?.dailyMeals[dayIndex];

  const updateFrequency = async (mealFrequency: MealFrequency) => {
    if (!profile) return;
    const next = { ...profile, mealFrequency };
    setProfile(next);
    await saveProfile(next);
  };

  const swapMeal = async (slotKey: string, currentTitle: string) => {
    if (!plan) return;
    const currentIndex = swaps.find((entry) => entry.slotKey === slotKey)?.recipeIndex ?? Math.max(0, plan.meals.findIndex((meal) => meal.title === currentTitle));
    const next = [...swaps.filter((entry) => entry.slotKey !== slotKey), { slotKey, recipeIndex: (currentIndex + 1) % plan.meals.length }];
    setSwaps(next);
    await saveMealSwaps(next);
  };

  const mealForSlot = (slotKey: string, fallback: (typeof plan extends null ? never : NonNullable<typeof plan>["meals"][number])) => {
    const swap = swaps.find((entry) => entry.slotKey === slotKey);
    return swap && plan ? plan.meals[swap.recipeIndex % plan.meals.length] : fallback;
  };

  if (!profile || !plan || !day) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>EATING RHYTHM</Text><Text style={styles.title}>Full recipes for your actual day.</Text><Text style={styles.body}>Choose the number of meals you want to plan. RootedFit will use the same coherent weekly recipes in a schedule that matches your preference.</Text><View style={styles.choiceStack}>{FREQUENCIES.map((item) => <Pressable key={item.value} onPress={() => updateFrequency(item.value)} style={[styles.choice, profile.mealFrequency === item.value && styles.choiceSelected]}><Text style={[styles.choiceTitle, profile.mealFrequency === item.value && styles.choiceTitleSelected]}>{profile.mealFrequency === item.value ? "✓  " : ""}{item.label}</Text><Text style={styles.choiceDescription}>{item.description}</Text></Pressable>)}</View><Text style={styles.sectionTitle}>Your seven-day meal schedule</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>{plan.dailyMeals.map((item, index) => <Pressable key={item.label} onPress={() => setDayIndex(index)} style={[styles.dayChip, dayIndex === index && styles.dayChipActive]}><Text style={[styles.dayChipText, dayIndex === index && styles.dayChipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView><View style={styles.scheduleCard}><Text style={styles.cardKicker}>{day.label.toUpperCase()} · {day.slots.length} PLANNED {day.slots.length === 1 ? "MEAL" : "MEALS"}</Text>{day.slots.map((slot) => { const slotKey = `${day.day}-${slot.label}`; const recipe = mealForSlot(slotKey, slot.meal); return <View key={slot.label} style={styles.slot}><Text style={styles.slotLabel}>{slot.label}</Text><Text style={styles.slotTitle}>{recipe.title}</Text><Text style={styles.slotCopy}>Ingredients: {recipe.ingredients.join(" · ")}</Text><Pressable onPress={() => swapMeal(slotKey, recipe.title)} style={styles.swapButton}><Text style={styles.swapButtonText}>Swap this meal →</Text></Pressable><Text style={styles.recipeHeading}>How to make it</Text>{recipe.steps.map((step, index) => <Text key={step} style={styles.recipeStep}>{index + 1}. {step}</Text>)}<Text style={styles.recipeNote}>{recipe.equipmentNote}</Text><Text style={styles.drinkText}>Drink idea: {recipe.drink}</Text></View>; })}{day.snackIdeas.length ? <View style={styles.snacks}><Text style={styles.slotLabel}>Optional snack ideas</Text>{day.snackIdeas.map((item) => <Text key={item} style={styles.snackText}>• {item}</Text>)}</View> : null}</View><Text style={styles.helper}>Swaps are saved on this device. Adjust meal frequency any time; it does not remove the meals you enjoy.</Text></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.3, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 29, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 22, marginTop: 10 }, choiceStack: { gap: 10, marginBottom: 28 }, choice: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 16, borderWidth: 1, padding: 16 }, choiceSelected: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, choiceTitle: { color: "#1F2A25", fontSize: 15, fontWeight: "800" }, choiceTitleSelected: { color: "#1D583E" }, choiceDescription: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 5 }, sectionTitle: { color: "#1F2A25", fontSize: 20, fontWeight: "800", marginBottom: 12 }, daySelector: { gap: 8, marginBottom: 16 }, dayChip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 }, dayChipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, dayChipText: { color: "#385046", fontSize: 13, fontWeight: "800" }, dayChipTextActive: { color: "#FFFFFF" }, scheduleCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, padding: 17 }, cardKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10 }, slot: { borderTopColor: "#E5EBE3", borderTopWidth: 1, paddingVertical: 13 }, slotLabel: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 4 }, slotTitle: { color: "#1F2A25", fontSize: 17, fontWeight: "800", lineHeight: 23 }, slotCopy: { color: "#526259", fontSize: 13, lineHeight: 19, marginTop: 5 }, swapButton: { alignSelf: "flex-start", backgroundColor: "#EAF3EA", borderRadius: 10, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9 }, swapButtonText: { color: "#1D583E", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" }, recipeHeading: { color: "#1F2A25", fontSize: 14, fontWeight: "800", marginTop: 12 }, recipeStep: { color: "#405247", fontSize: 13, lineHeight: 20, marginTop: 5 }, recipeNote: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 10 }, drinkText: { color: "#2D6A4F", fontSize: 13, fontWeight: "800", lineHeight: 19, marginTop: 9 }, snacks: { backgroundColor: "#F1F7F0", borderRadius: 12, marginTop: 4, padding: 13 }, snackText: { color: "#405247", fontSize: 13, lineHeight: 20 }, helper: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 16 },
});
