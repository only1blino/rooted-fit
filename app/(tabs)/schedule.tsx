import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { ScreenContainer } from "@/components/screen-container";
import { buildWeeklyPlan, formatGroceryChecklistPrintHtml, formatGroceryListExport, loadGroceryChecklist, loadMealSwaps, loadProfile, saveGroceryChecklist, saveMealSwaps, saveProfile, type GroceryChecklistItem, type MealFrequency, type MealSwap, type ServingSize, type UserProfile } from "@/lib/rootedfit-profile";

const FREQUENCIES: { value: MealFrequency; label: string; description: string }[] = [
  { value: "one_plus_snack", label: "One main meal + snack ideas", description: "One full recipe and two snack ideas each day." },
  { value: "two", label: "Two meals + snack ideas", description: "A light protein-forward breakfast and a fuller main meal." },
  { value: "three", label: "Three meals + snack ideas", description: "A light breakfast, then moderate lunch and dinner recipes." },
];

const SERVING_SIZES: { value: ServingSize; label: string; description: string }[] = [
  { value: "lighter", label: "Lighter", description: "Smaller measured staple portions" },
  { value: "regular", label: "Regular", description: "The recipe’s standard serving" },
  { value: "generous", label: "Generous", description: "A larger home serving" },
];

export default function MealsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [swaps, setSwaps] = useState<MealSwap[]>([]);
  const [checklist, setChecklist] = useState<GroceryChecklistItem[]>([]);
  const [dayIndex, setDayIndex] = useState(0);

  useEffect(() => {
    loadProfile().then(setProfile);
    loadMealSwaps().then(setSwaps);
    loadGroceryChecklist().then(setChecklist);
  }, []);

  const plan = useMemo(() => (profile ? buildWeeklyPlan(profile) : null), [profile]);
  const day = plan?.dailyMeals[dayIndex];
  const groceryExport = useMemo(() => (plan ? formatGroceryListExport(plan, profile?.city) : ""), [plan, profile?.city]);
  const checklistItems = useMemo(() => plan ? plan.shoppingGroups.filter((group) => group.title !== "Storage reminder").flatMap((group) => group.items) : [], [plan]);
  const checklistKey = (item: string) => `${profile?.rotationWeek ?? 1}:${profile?.servingSize ?? "regular"}:${item}`;
  const checkedCount = checklistItems.filter((item) => checklist.find((entry) => entry.key === checklistKey(item))?.checked).length;

  const updateProfile = async (patch: Partial<UserProfile>) => {
    if (!profile) return;
    const next = { ...profile, ...patch };
    setProfile(next);
    await saveProfile(next);
  };

  const recipeFor = (slotKey: string, fallback: NonNullable<typeof plan>["meals"][number], breakfast: boolean) => {
    const replacement = swaps.find((swap) => swap.slotKey === slotKey);
    if (!replacement || !plan) return fallback;
    const pool = breakfast ? plan.breakfastMeals : plan.meals;
    return pool[replacement.recipeIndex % pool.length] ?? fallback;
  };

  const swapRecipe = async (slotKey: string, title: string, breakfast: boolean) => {
    if (!plan) return;
    const pool = breakfast ? plan.breakfastMeals : plan.meals;
    const existing = swaps.find((swap) => swap.slotKey === slotKey)?.recipeIndex ?? Math.max(0, pool.findIndex((meal) => meal.title === title));
    const next = [...swaps.filter((swap) => swap.slotKey !== slotKey), { slotKey, recipeIndex: (existing + 1) % pool.length }];
    setSwaps(next);
    await saveMealSwaps(next);
  };

  const toggleGroceryItem = async (item: string) => {
    const key = checklistKey(item);
    const existing = checklist.find((entry) => entry.key === key);
    const next = existing ? checklist.map((entry) => entry.key === key ? { ...entry, checked: !entry.checked } : entry) : [...checklist, { key, checked: true }];
    setChecklist(next);
    await saveGroceryChecklist(next);
  };

  const clearChecklist = async () => {
    const activeKeys = new Set(checklistItems.map(checklistKey));
    const next = checklist.map((entry) => activeKeys.has(entry.key) ? { ...entry, checked: false } : entry);
    setChecklist(next);
    await saveGroceryChecklist(next);
  };

  const excludeRecipe = async (sourceTitle: string, breakfast: boolean) => {
    if (!profile || !plan) return;
    const availableTitles = new Set((breakfast ? plan.breakfastMeals : plan.meals).map((meal) => meal.sourceTitle ?? meal.title));
    if (availableTitles.size <= 1) {
      Alert.alert("Keep one recipe available", "Restore or keep at least one main recipe in the current rotation before excluding another.");
      return;
    }
    await updateProfile({ excludedRecipeTitles: [...profile.excludedRecipeTitles, sourceTitle] });
  };

  const restoreRecipe = async (sourceTitle: string) => {
    if (!profile) return;
    await updateProfile({ excludedRecipeTitles: profile.excludedRecipeTitles.filter((title) => title !== sourceTitle) });
  };

  const printChecklist = async () => {
    try {
      if (Platform.OS === "web") await Print.printAsync({});
      else await Print.printAsync({ html: formatGroceryChecklistPrintHtml(plan!, profile?.city, checklistItems.filter((item) => checklist.find((entry) => entry.key === checklistKey(item))?.checked)) });
    } catch {
      Alert.alert("Print could not open", "Try exporting the grocery list as text instead.");
    }
  };

  const shareGroceryList = async () => {
    try {
      await Share.share({ title: "RootedFit grocery list", message: groceryExport });
    } catch {
      Alert.alert("Sharing is not available", "Copy the list from this screen or try again from a supported sharing app.");
    }
  };

  const exportGroceryList = async () => {
    if (Platform.OS === "web") {
      await shareGroceryList();
      return;
    }
    try {
      const fileUri = `${FileSystem.cacheDirectory}rootedfit-grocery-week-${profile?.rotationWeek ?? 1}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, groceryExport, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { dialogTitle: "Export RootedFit grocery list", mimeType: "text/plain", UTI: "public.plain-text" });
      } else {
        await shareGroceryList();
      }
    } catch {
      Alert.alert("Export could not finish", "Try sharing the grocery-list text directly instead.");
    }
  };

  if (!profile || !plan || !day) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loading}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>MEALS</Text><Text style={styles.title}>Recipes that match your real week.</Text><Text style={styles.body}>Set your meal rhythm, serving preference, and rotation. Breakfast is intentionally lighter, quick to make, and built around a clear protein source.</Text>

    <Text style={styles.sectionTitle}>How often do you want to eat?</Text><View style={styles.choiceStack}>{FREQUENCIES.map((item) => <Pressable key={item.value} onPress={() => updateProfile({ mealFrequency: item.value })} style={[styles.choice, profile.mealFrequency === item.value && styles.choiceActive]}><Text style={styles.choiceTitle}>{profile.mealFrequency === item.value ? "✓ " : ""}{item.label}</Text><Text style={styles.choiceCopy}>{item.description}</Text></Pressable>)}</View>

    <View style={styles.controlCard}><Text style={styles.kicker}>YOUR SERVING PREFERENCE</Text><Text style={styles.controlTitle}>Adjust every recipe portion</Text><Text style={styles.controlCopy}>This changes the ingredient quantities and your grocery list on this device. It is a practical preference, not a medical target.</Text><View style={styles.buttonRow}>{SERVING_SIZES.map((item) => <Pressable key={item.value} onPress={() => updateProfile({ servingSize: item.value })} style={[styles.smallButton, profile.servingSize === item.value && styles.smallButtonActive]}><Text style={[styles.smallButtonText, profile.servingSize === item.value && styles.smallButtonTextActive]}>{item.label}</Text><Text style={[styles.smallButtonCopy, profile.servingSize === item.value && styles.smallButtonTextActive]}>{item.description}</Text></Pressable>)}</View></View>

    <View style={styles.controlCard}><Text style={styles.kicker}>TWO-WEEK ROTATION</Text><Text style={styles.controlTitle}>{plan.rotationLabel}</Text><Text style={styles.controlCopy}>Week 2 replaces the Week 1 main-meal sequence so repeat weeks do not feel identical. Your selected breakfast structure stays light and protein-forward.</Text><View style={styles.rotationRow}>{([1, 2] as const).map((week) => <Pressable key={week} onPress={() => { updateProfile({ rotationWeek: week }); setDayIndex(0); }} style={[styles.rotationButton, profile.rotationWeek === week && styles.rotationButtonActive]}><Text style={[styles.rotationText, profile.rotationWeek === week && styles.rotationTextActive]}>Week {week}</Text></Pressable>)}</View></View>

    <Text style={styles.sectionTitle}>Recipes for your selected day</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{plan.dailyMeals.map((item, index) => <Pressable key={item.label} onPress={() => setDayIndex(index)} style={[styles.chip, dayIndex === index && styles.chipActive]}><Text style={[styles.chipText, dayIndex === index && styles.chipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView>

    <View style={styles.card}><Text style={styles.kicker}>{day.label.toUpperCase()} · {plan.rotationLabel.toUpperCase()}</Text>{day.slots.map((slot) => { const key = `${profile.rotationWeek}-${day.day}-${slot.label}`; const isBreakfast = slot.label === "Breakfast"; const recipe = recipeFor(key, slot.meal, isBreakfast); return <View key={slot.label} style={styles.slot}><Text style={styles.slotLabel}>{slot.label}{isBreakfast ? " · LIGHT & PROTEIN-FORWARD" : ""}</Text><Text style={styles.recipeTitle}>{recipe.title}</Text><Text style={styles.focus}>{recipe.focus}</Text><Text style={styles.ingredients}>Ingredients: {recipe.ingredients.join(" · ")}</Text><View style={styles.exportRow}><Pressable onPress={() => swapRecipe(key, recipe.title, isBreakfast)} style={styles.swap}><Text style={styles.swapText}>Swap this {isBreakfast ? "breakfast" : "meal"} →</Text></Pressable><Pressable onPress={() => excludeRecipe(recipe.sourceTitle ?? recipe.title, isBreakfast)} style={styles.swap}><Text style={styles.swapText}>Remove from rotation</Text></Pressable></View><Text style={styles.methodTitle}>How to make it</Text>{recipe.steps.map((step, index) => <Text key={step} style={styles.method}>{index + 1}. {step}</Text>)}<Text style={styles.note}>{recipe.equipmentNote}</Text><Text style={styles.drink}>Drink idea: {recipe.drink}</Text></View>; })}{day.snackIdeas.length ? <View style={styles.snacks}><Text style={styles.slotLabel}>Optional snack ideas</Text>{day.snackIdeas.map((idea) => <Text key={idea} style={styles.method}>• {idea}</Text>)}</View> : null}</View>

    {profile.excludedRecipeTitles.length ? <View style={styles.card}><Text style={styles.kicker}>REMOVED FROM FUTURE ROTATIONS</Text><Text style={styles.groceryIntro}>Restore any recipe when you want it available again.</Text>{profile.excludedRecipeTitles.map((title) => <View key={title} style={styles.exportRow}><Text style={styles.method}>{title}</Text><Pressable onPress={() => restoreRecipe(title)} style={styles.swap}><Text style={styles.swapText}>Restore</Text></Pressable></View>)}</View> : null}

    <View style={styles.card}><Text style={styles.kicker}>INTERACTIVE GROCERY CHECKLIST</Text><Text style={styles.groceryIntro}>{checkedCount} of {checklistItems.length} items marked. Your ticks stay on this device for this rotation and serving preference.</Text>{plan.shoppingGroups.map((group) => <View key={group.title} style={styles.groceryGroup}><Text style={styles.groceryTitle}>{group.title}</Text>{group.items.map((item) => { const interactive = group.title !== "Storage reminder"; const checked = checklist.find((entry) => entry.key === checklistKey(item))?.checked ?? false; return interactive ? <Pressable key={item} onPress={() => toggleGroceryItem(item)} style={[styles.swap, checked && styles.choiceActive]}><Text style={styles.swapText}>{checked ? "✓" : "□"} {item}</Text></Pressable> : <Text key={item} style={styles.method}>• {item}</Text>; })}</View>)}<Pressable onPress={clearChecklist} style={styles.exportSecondary}><Text style={styles.exportSecondaryText}>Clear this checklist</Text></Pressable><View style={styles.exportRow}><Pressable onPress={printChecklist} style={styles.exportPrimary}><Text style={styles.exportPrimaryText}>Print checklist</Text></Pressable><Pressable onPress={exportGroceryList} style={styles.exportSecondary}><Text style={styles.exportSecondaryText}>Export list</Text></Pressable></View><Pressable onPress={shareGroceryList} style={styles.exportSecondary}><Text style={styles.exportSecondaryText}>Share grocery text</Text></Pressable><Text style={styles.exportNote}>Print opens the native print flow on phones and the browser print dialog on web. Export makes a plain-text grocery file on iOS and Android.</Text></View>
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loading: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, content: { padding: 22 }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 }, title: { color: "#1F2A25", fontSize: 29, fontWeight: "800", lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 22, marginTop: 9 }, sectionTitle: { color: "#1F2A25", fontSize: 20, fontWeight: "800", marginBottom: 11 }, choiceStack: { gap: 9, marginBottom: 18 }, choice: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 15, borderWidth: 1, padding: 15 }, choiceActive: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, choiceTitle: { color: "#1F2A25", fontSize: 15, fontWeight: "800" }, choiceCopy: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 4 }, controlCard: { backgroundColor: "#EAF3EA", borderColor: "#CBE0CC", borderRadius: 18, borderWidth: 1, marginBottom: 16, padding: 16 }, kicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 1, marginBottom: 8 }, controlTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800" }, controlCopy: { color: "#526259", fontSize: 13, lineHeight: 20, marginTop: 6 }, buttonRow: { flexDirection: "row", gap: 8, marginTop: 13 }, smallButton: { borderColor: "#BCD4BF", borderRadius: 12, borderWidth: 1, flex: 1, padding: 10 }, smallButtonActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, smallButtonText: { color: "#244835", fontSize: 13, fontWeight: "800" }, smallButtonTextActive: { color: "#FFFFFF" }, smallButtonCopy: { color: "#526259", fontSize: 10, lineHeight: 14, marginTop: 3 }, rotationRow: { flexDirection: "row", gap: 9, marginTop: 13 }, rotationButton: { backgroundColor: "#FFFFFF", borderColor: "#BCD4BF", borderRadius: 12, borderWidth: 1, flex: 1, padding: 12 }, rotationButtonActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, rotationText: { color: "#1F2A25", fontSize: 14, fontWeight: "800", textAlign: "center" }, rotationTextActive: { color: "#FFFFFF" }, chips: { gap: 8, marginBottom: 15 }, chip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 13, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 }, chipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, chipText: { color: "#385046", fontSize: 13, fontWeight: "800" }, chipTextActive: { color: "#FFFFFF" }, card: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 16, padding: 17 }, slot: { borderTopColor: "#E5EBE3", borderTopWidth: 1, paddingVertical: 13 }, slotLabel: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 5 }, recipeTitle: { color: "#1F2A25", fontSize: 18, fontWeight: "800", lineHeight: 24 }, focus: { color: "#2D6A4F", fontSize: 13, lineHeight: 20, marginTop: 6 }, ingredients: { color: "#526259", fontSize: 13, lineHeight: 20, marginTop: 6 }, swap: { alignSelf: "flex-start", backgroundColor: "#EAF3EA", borderRadius: 10, marginTop: 10, paddingHorizontal: 12, paddingVertical: 9 }, swapText: { color: "#1D583E", fontSize: 13, fontWeight: "800", textDecorationLine: "underline" }, methodTitle: { color: "#1F2A25", fontSize: 14, fontWeight: "800", marginTop: 12 }, method: { color: "#405247", fontSize: 13, lineHeight: 20, marginTop: 5 }, note: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginTop: 10 }, drink: { color: "#2D6A4F", fontSize: 13, fontWeight: "800", lineHeight: 19, marginTop: 8 }, snacks: { backgroundColor: "#F1F7F0", borderRadius: 12, marginTop: 4, padding: 13 }, groceryIntro: { color: "#526259", fontSize: 13, lineHeight: 19, marginBottom: 7 }, groceryGroup: { borderTopColor: "#E5EBE3", borderTopWidth: 1, paddingVertical: 11 }, groceryTitle: { color: "#1F2A25", fontSize: 15, fontWeight: "800", marginBottom: 4 }, exportRow: { flexDirection: "row", gap: 10, marginTop: 8 }, exportPrimary: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 12, flex: 1, paddingVertical: 13 }, exportPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" }, exportSecondary: { alignItems: "center", borderColor: "#2D6A4F", borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 12 }, exportSecondaryText: { color: "#1D583E", fontSize: 14, fontWeight: "800" }, exportNote: { color: "#6B7A70", fontSize: 11, lineHeight: 16, marginTop: 10 },
});
