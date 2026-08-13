import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import {
  buildDailyPlan,
  clearProfile,
  emptyProfile,
  loadProfile,
  saveProfile,
  splitList,
  type ShoppingFrequency,
  type UserProfile,
} from "@/lib/rootedfit-profile";

const KITCHEN_OPTIONS = ["Fridge", "Microwave", "Air fryer", "Stove"];
const RESOURCE_OPTIONS = ["Yoga mat", "Internet for video workouts", "Weights or filled bottles", "Safe floor space"];
const SHOPPING_OPTIONS: { label: string; value: ShoppingFrequency }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Every two weeks", value: "biweekly" },
  { label: "Monthly", value: "monthly" },
];

type Step = 0 | 1 | 2 | 3 | 4 | 5;

function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [styles.primaryButton, disabled && styles.buttonDisabled, pressed && styles.buttonPressed]}
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function ChoiceButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.choicePressed]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{selected ? "✓  " : ""}{label}</Text>
    </Pressable>
  );
}

function NumericField({ label, value, onChange, suffix, helper }: { label: string; value: number; onChange: (next: number) => void; suffix: string; helper?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <View style={styles.stepperRow}>
        <TouchableOpacity accessibilityLabel={`Decrease ${label}`} onPress={() => onChange(Math.max(0, value - 1))} style={styles.stepperButton}>
          <Text style={styles.stepperText}>−</Text>
        </TouchableOpacity>
        <View style={styles.stepperValue}>
          <Text style={styles.stepperValueText}>{value}</Text>
          <Text style={styles.stepperSuffix}>{suffix}</Text>
        </View>
        <TouchableOpacity accessibilityLabel={`Increase ${label}`} onPress={() => onChange(value + 1)} style={styles.stepperButton}>
          <Text style={styles.stepperText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StepHeader({ step }: { step: Step }) {
  if (step === 0 || step === 5) return null;
  return (
    <View style={styles.stepHeader}>
      <Text style={styles.stepLabel}>YOUR CONTEXT</Text>
      <Text style={styles.stepCount}>{step} of 4</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${step * 25}%` }]} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [step, setStep] = useState<Step>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProfile()
      .then((saved) => {
        if (saved) {
          setProfile(saved);
          setStep(5);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const plan = useMemo(() => buildDailyPlan(profile), [profile]);
  const favoriteMealsText = profile.favoriteMeals.join(", ");
  const localIngredientsText = profile.localIngredients.join(", ");

  const toggleOption = (key: "kitchenEquipment" | "workoutResources", option: string) => {
    setProfile((current) => ({
      ...current,
      [key]: current[key].includes(option)
        ? current[key].filter((item) => item !== option)
        : [...current[key], option],
    }));
  };

  const continueOnboarding = () => {
    if (step === 1 && (!profile.city.trim() || profile.electricityHoursPerDay < 1)) {
      Alert.alert("A little more context", "Add your city and typical daily electricity access so the plan can be practical.");
      return;
    }
    if (step === 2 && (!profile.shoppingFrequency || profile.marketMinutesAway < 1)) {
      Alert.alert("A little more context", "Select your shopping rhythm and how long a market trip usually takes.");
      return;
    }
    if (step === 3 && profile.favoriteMeals.length === 0) {
      Alert.alert("Keep your food in the plan", "Add at least one meal you genuinely enjoy.");
      return;
    }
    if (step === 4 && profile.workoutMinutesPerDay < 1) {
      Alert.alert("Make it fit your day", "Choose the amount of time you can realistically give to movement.");
      return;
    }
    setStep((current) => (current + 1) as Step);
  };

  const createPlan = async () => {
    setIsSaving(true);
    try {
      await saveProfile(profile);
      setStep(5);
    } finally {
      setIsSaving(false);
    }
  };

  const startAgain = async () => {
    await clearProfile();
    setProfile(emptyProfile);
    setStep(0);
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loadingScreen}>
        <ActivityIndicator color="#2D6A4F" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <StepHeader step={step} />

          {step === 0 ? (
            <View style={styles.hero}>
              <View style={styles.logoMark}><Text style={styles.logoGlyph}>R</Text></View>
              <Text style={styles.eyebrow}>ROOTEDFIT</Text>
              <Text style={styles.heroTitle}>Health plans that live in the real world.</Text>
              <Text style={styles.heroBody}>Tell us what food, time, power, and equipment you actually have. We will build from there—not from an imagined gym or supermarket.</Text>
              <View style={styles.promiseCard}>
                <Text style={styles.promiseTitle}>Your favourites stay on the table.</Text>
                <Text style={styles.promiseBody}>We help with portions, pairings, preparation, and food storage without calling familiar meals “bad.”</Text>
              </View>
              <PrimaryButton label="Build my realistic plan" onPress={() => setStep(1)} />
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.content}>
              <Text style={styles.title}>Start with your daily reality.</Text>
              <Text style={styles.body}>Electricity shapes what can be safely stored and when food can be prepared.</Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>City or community</Text>
                <TextInput value={profile.city} onChangeText={(city) => setProfile((current) => ({ ...current, city }))} placeholder="e.g. Accra" placeholderTextColor="#93A197" style={styles.input} returnKeyType="done" />
              </View>
              <NumericField label="Typical electricity access" value={profile.electricityHoursPerDay} onChange={(electricityHoursPerDay) => setProfile((current) => ({ ...current, electricityHoursPerDay: Math.min(24, electricityHoursPerDay) }))} suffix="hours each day" helper="An estimate is enough. We use it to avoid meal-prep assumptions that do not fit." />
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.content}>
              <Text style={styles.title}>What does cooking and shopping look like?</Text>
              <Text style={styles.body}>We will only recommend preparation methods and storage patterns that match your home.</Text>
              <NumericField label="Travel time to your usual market" value={profile.marketMinutesAway} onChange={(marketMinutesAway) => setProfile((current) => ({ ...current, marketMinutesAway: marketMinutesAway }))} suffix="minutes away" />
              <Text style={styles.fieldLabel}>How often do you usually shop?</Text>
              <View style={styles.choiceStack}>
                <ChoiceButton label="Daily" selected={profile.shoppingFrequency === "daily"} onPress={() => setProfile((current) => ({ ...current, shoppingFrequency: "daily" }))} />
                <ChoiceButton label="Weekly" selected={profile.shoppingFrequency === "weekly"} onPress={() => setProfile((current) => ({ ...current, shoppingFrequency: "weekly" }))} />
                <ChoiceButton label="Every two weeks" selected={profile.shoppingFrequency === "biweekly"} onPress={() => setProfile((current) => ({ ...current, shoppingFrequency: "biweekly" }))} />
                <ChoiceButton label="Monthly" selected={profile.shoppingFrequency === "monthly"} onPress={() => setProfile((current) => ({ ...current, shoppingFrequency: "monthly" }))} />
              </View>
              <Text style={styles.fieldLabel}>Kitchen equipment you use</Text>
              <View style={styles.choiceStack}>
                <ChoiceButton label="Fridge" selected={profile.kitchenEquipment.includes("Fridge")} onPress={() => toggleOption("kitchenEquipment", "Fridge")} />
                <ChoiceButton label="Microwave" selected={profile.kitchenEquipment.includes("Microwave")} onPress={() => toggleOption("kitchenEquipment", "Microwave")} />
                <ChoiceButton label="Air fryer" selected={profile.kitchenEquipment.includes("Air fryer")} onPress={() => toggleOption("kitchenEquipment", "Air fryer")} />
                <ChoiceButton label="Stove" selected={profile.kitchenEquipment.includes("Stove")} onPress={() => toggleOption("kitchenEquipment", "Stove")} />
              </View>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.content}>
              <Text style={styles.title}>Let’s keep food familiar.</Text>
              <Text style={styles.body}>There is no “good food / bad food” quiz. Start with meals and ingredients you can actually find.</Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Meals you enjoy</Text>
                <Text style={styles.helper}>Separate ideas with commas, such as yam, rice, pepper soup.</Text>
                <TextInput value={favoriteMealsText} onChangeText={(value) => setProfile((current) => ({ ...current, favoriteMeals: splitList(value) }))} placeholder="Your favourite meals" placeholderTextColor="#93A197" style={[styles.input, styles.textArea]} multiline />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Ingredients usually within reach</Text>
                <Text style={styles.helper}>For example: carrots, cucumbers, beans, plantain.</Text>
                <TextInput value={localIngredientsText} onChangeText={(value) => setProfile((current) => ({ ...current, localIngredients: splitList(value) }))} placeholder="Local ingredients" placeholderTextColor="#93A197" style={[styles.input, styles.textArea]} multiline />
              </View>
            </View>
          ) : null}

          {step === 4 ? (
            <View style={styles.content}>
              <Text style={styles.title}>Movement should fit too.</Text>
              <Text style={styles.body}>Your first routine will use the time, space, and resources already available to you.</Text>
              <NumericField label="Usual daily step count" value={profile.dailyStepCount} onChange={(dailyStepCount) => setProfile((current) => ({ ...current, dailyStepCount: dailyStepCount + (dailyStepCount < 500 ? 500 : 0) }))} suffix="steps" helper="A rough estimate is fine. Tap + to add 500 steps at a time." />
              <NumericField label="Time you can give to movement" value={profile.workoutMinutesPerDay} onChange={(workoutMinutesPerDay) => setProfile((current) => ({ ...current, workoutMinutesPerDay: Math.min(120, workoutMinutesPerDay) }))} suffix="minutes daily" />
              <Text style={styles.fieldLabel}>Resources at home</Text>
              <View style={styles.choiceStack}>
                <ChoiceButton label="Yoga mat" selected={profile.workoutResources.includes("Yoga mat")} onPress={() => toggleOption("workoutResources", "Yoga mat")} />
                <ChoiceButton label="Internet for video workouts" selected={profile.workoutResources.includes("Internet for video workouts")} onPress={() => toggleOption("workoutResources", "Internet for video workouts")} />
                <ChoiceButton label="Weights or filled bottles" selected={profile.workoutResources.includes("Weights or filled bottles")} onPress={() => toggleOption("workoutResources", "Weights or filled bottles")} />
                <ChoiceButton label="Safe floor space" selected={profile.workoutResources.includes("Safe floor space")} onPress={() => toggleOption("workoutResources", "Safe floor space")} />
              </View>
            </View>
          ) : null}

          {step === 5 ? (
            <View style={styles.dashboard}>
              <Text style={styles.eyebrow}>TODAY’S ROOTED PLAN</Text>
              <Text style={styles.dashboardTitle}>A plan that starts where you are.</Text>
              <Text style={styles.dashboardIntro}>{plan.contextLine}</Text>
              <View style={[styles.planCard, styles.energyCard]}>
                <Text style={styles.cardKicker}>POWER & STORAGE</Text>
                <Text style={styles.cardText}>{plan.electricityNote}</Text>
              </View>
              <View style={styles.planCard}>
                <Text style={styles.cardKicker}>MEAL IDEA</Text>
                <Text style={styles.cardTitle}>{plan.mealTitle}</Text>
                <Text style={styles.cardText}>{plan.mealDescription}</Text>
                <View style={styles.noteBox}><Text style={styles.noteText}>{plan.mealSafetyNote}</Text></View>
              </View>
              <View style={styles.planCard}>
                <Text style={styles.cardKicker}>SHOPPING RHYTHM</Text>
                <Text style={styles.cardText}>{plan.shoppingNote}</Text>
              </View>
              <View style={[styles.planCard, styles.movementCard]}>
                <Text style={styles.cardKicker}>MOVEMENT</Text>
                <Text style={styles.cardTitle}>{plan.workoutTitle}</Text>
                <Text style={styles.cardText}>{plan.workoutDescription}</Text>
                <Text style={styles.cardFootnote}>{plan.workoutReason}</Text>
              </View>
              <TouchableOpacity onPress={startAgain} accessibilityRole="button" style={styles.textButton}>
                <Text style={styles.textButtonLabel}>Reset the demo profile</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>

        {step > 0 && step < 5 ? (
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => setStep((current) => (current - 1) as Step)} accessibilityRole="button" style={styles.backButton}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            {step === 4 ? <PrimaryButton label={isSaving ? "Creating your plan…" : "Create my plan"} onPress={createPlan} disabled={isSaving} /> : <PrimaryButton label="Continue" onPress={continueOnboarding} />}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" },
  loadingScreen: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 22, paddingVertical: 18 },
  stepHeader: { marginBottom: 26 },
  stepLabel: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  stepCount: { color: "#6B7A70", fontSize: 13, fontWeight: "600", marginTop: 6 },
  progressTrack: { backgroundColor: "#DDE5DA", borderRadius: 10, height: 6, marginTop: 12, overflow: "hidden" },
  progressFill: { backgroundColor: "#2D6A4F", borderRadius: 10, height: "100%" },
  hero: { flex: 1, justifyContent: "center", paddingVertical: 24 },
  logoMark: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 18, height: 56, justifyContent: "center", marginBottom: 20, width: 56 },
  logoGlyph: { color: "#F8F6EF", fontSize: 27, fontWeight: "800" },
  eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 11 },
  heroTitle: { color: "#1F2A25", fontSize: 36, fontWeight: "800", letterSpacing: -0.8, lineHeight: 42, maxWidth: 350 },
  heroBody: { color: "#526259", fontSize: 17, lineHeight: 26, marginTop: 18, maxWidth: 360 },
  promiseCard: { backgroundColor: "#E6F1E7", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 30, marginTop: 30, padding: 18 },
  promiseTitle: { color: "#2D6A4F", fontSize: 16, fontWeight: "800", lineHeight: 22 },
  promiseBody: { color: "#526259", fontSize: 14, lineHeight: 20, marginTop: 7 },
  content: { paddingBottom: 100 },
  title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 },
  body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 28, marginTop: 12 },
  fieldGroup: { marginBottom: 26 },
  fieldLabel: { color: "#1F2A25", fontSize: 15, fontWeight: "800", lineHeight: 21, marginBottom: 8 },
  helper: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginBottom: 10 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, color: "#1F2A25", fontSize: 16, minHeight: 52, paddingHorizontal: 15, paddingVertical: 13 },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  stepperRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  stepperButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 16, borderWidth: 1, height: 52, justifyContent: "center", width: 52 },
  stepperText: { color: "#2D6A4F", fontSize: 25, fontWeight: "700", lineHeight: 27 },
  stepperValue: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 16, flex: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: 8 },
  stepperValueText: { color: "#1F2A25", fontSize: 19, fontWeight: "800" },
  stepperSuffix: { color: "#6B7A70", fontSize: 11, marginTop: 1 },
  choiceStack: { gap: 9, marginBottom: 23 },
  choice: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, flexDirection: "row", minHeight: 50, paddingHorizontal: 15 },
  choiceSelected: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" },
  choicePressed: { opacity: 0.74 },
  choiceText: { color: "#385046", fontSize: 15, fontWeight: "600" },
  choiceTextSelected: { color: "#1D583E", fontWeight: "800" },
  footer: { alignItems: "center", backgroundColor: "#F8F6EF", borderTopColor: "#DDE5DA", borderTopWidth: 1, flexDirection: "row", gap: 12, paddingHorizontal: 22, paddingVertical: 14 },
  backButton: { alignItems: "center", justifyContent: "center", minHeight: 52, paddingHorizontal: 10 },
  backButtonText: { color: "#2D6A4F", fontSize: 15, fontWeight: "800" },
  primaryButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 15, flex: 1, justifyContent: "center", minHeight: 54, paddingHorizontal: 16 },
  buttonDisabled: { backgroundColor: "#8AA693" },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  dashboard: { paddingBottom: 25 },
  dashboardTitle: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 },
  dashboardIntro: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 22, marginTop: 10 },
  planCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 18 },
  energyCard: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4" },
  movementCard: { backgroundColor: "#EEF5EF", borderColor: "#C9DFC9" },
  cardKicker: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 },
  cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25, marginBottom: 8 },
  cardText: { color: "#405247", fontSize: 15, lineHeight: 22 },
  noteBox: { backgroundColor: "#F8F6EF", borderRadius: 11, marginTop: 14, padding: 12 },
  noteText: { color: "#526259", fontSize: 13, fontWeight: "600", lineHeight: 19 },
  cardFootnote: { color: "#526259", fontSize: 13, lineHeight: 19, marginTop: 13 },
  textButton: { alignItems: "center", minHeight: 48, padding: 8 },
  textButtonLabel: { color: "#2D6A4F", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
});
