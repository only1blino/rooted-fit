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
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import {
  buildWeeklyPlan,
  clearProfile,
  emptyProfile,
  loadProfile,
  numberOrNull,
  saveProfile,
  splitList,
  type ShoppingFrequency,
  type UserProfile,
  type WellnessGoal,
} from "@/lib/rootedfit-profile";
import { COUNTRY_OPTIONS, suggestedFoods, suggestedFruits, suggestedMeals } from "@/lib/food-catalogue";

const KITCHEN_OPTIONS = ["Fridge", "Freezer", "Stove", "Gas burner", "Microwave", "Air fryer", "Oven", "Kettle", "Blender", "Rice cooker", "Pressure cooker", "Cooler or ice chest"];
const RESOURCE_OPTIONS = ["Yoga mat", "Safe floor space", "Chair", "Stairs or a sturdy step", "Resistance band", "Weights or filled bottles", "Skipping rope", "Internet for video workouts", "Outdoor walking route", "TV or phone"];
const GOALS: { label: string; value: WellnessGoal; description: string }[] = [
  { label: "Build consistency", value: "consistency", description: "Small, repeatable food and movement habits." },
  { label: "Feel more energetic", value: "energy", description: "Steadier routines for everyday energy." },
  { label: "Strength & toning", value: "toning", description: "Home strength sessions without a gym." },
  { label: "Core & mobility", value: "core_mobility", description: "Control, posture, and flexible movement." },
  { label: "Body-composition habits", value: "body_composition", description: "Consistency and trends, never restrictive targets." },
  { label: "Weight loss", value: "weight_loss", description: "Satisfying familiar meals and repeatable movement without extreme rules." },
  { label: "Weight gain", value: "weight_gain", description: "Regular meals and practical additions that fit the foods you already enjoy." },
];

function PrimaryButton({ label, onPress, disabled = false, compact = false }: { label: string; onPress: () => void; disabled?: boolean; compact?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, compact && styles.primaryButtonCompact, disabled && styles.buttonDisabled, pressed && styles.buttonPressed]}><Text style={styles.primaryButtonText}>{label}</Text></Pressable>;
}

function ChoiceButton({ label, selected, onPress, description }: { label: string; selected: boolean; onPress: () => void; description?: string }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [styles.choice, selected && styles.choiceSelected, pressed && styles.choicePressed]}>
      <View style={styles.choiceCopy}>
        <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{selected ? "✓  " : ""}{label}</Text>
        {description ? <Text style={styles.choiceDescription}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

function TextField({ label, value, onChangeText, placeholder, helper, multiline = false, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; helper?: string; multiline?: boolean; keyboardType?: "default" | "numeric" | "decimal-pad" }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#93A197" style={[styles.input, multiline && styles.textArea]} multiline={multiline} keyboardType={keyboardType} returnKeyType="done" />
    </View>
  );
}

function NumberField({ label, value, onChange, suffix, helper, allowDecimal = false }: { label: string; value: string; onChange: (value: string) => void; suffix: string; helper?: string; allowDecimal?: boolean }) {
  const numeric = numberOrNull(value) ?? 0;
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
      <View style={styles.numberRow}>
        <Pressable accessibilityLabel={`Decrease ${label}`} onPress={() => onChange(String(Math.max(0, numeric - (allowDecimal ? 0.5 : 1))))} style={styles.stepperButton}><Text style={styles.stepperText}>−</Text></Pressable>
        <TextInput value={value} onChangeText={onChange} placeholder="0" placeholderTextColor="#93A197" style={styles.numberInput} keyboardType={allowDecimal ? "decimal-pad" : "numeric"} returnKeyType="done" />
        <Text style={styles.numberSuffix}>{suffix}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} onPress={() => onChange(String(numeric + (allowDecimal ? 0.5 : 1)))} style={styles.stepperButton}><Text style={styles.stepperText}>+</Text></Pressable>
      </View>
    </View>
  );
}

function StepHeader({ step }: { step: number }) {
  if (step === 0 || step > 5) return null;
  return <View style={styles.stepHeader}><Text style={styles.stepLabel}>YOUR CONTEXT</Text><Text style={styles.stepCount}>{step} of 5</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${step * 20}%` }]} /></View></View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [favoriteMealsText, setFavoriteMealsText] = useState("");
  const [favoriteFruitsText, setFavoriteFruitsText] = useState("");
  const [localIngredientsText, setLocalIngredientsText] = useState("");
  const [restrictionsText, setRestrictionsText] = useState("");
  const [dislikedFoodsText, setDislikedFoodsText] = useState("");
  const [otherKitchenText, setOtherKitchenText] = useState("");
  const [otherResourcesText, setOtherResourcesText] = useState("");
  const [foodQuery, setFoodQuery] = useState("");
  const [genderOptionsOpen, setGenderOptionsOpen] = useState(false);
  const [numbers, setNumbers] = useState<Record<string, string>>({ electricity: "", market: "", steps: "", stepTarget: "", movement: "", height: "", weight: "", waist: "", hip: "", chest: "" });

  useEffect(() => {
    loadProfile().then((saved) => {
      if (saved) {
        setProfile(saved);
        setFavoriteMealsText(saved.favoriteMeals.join(", "));
        setFavoriteFruitsText(saved.favoriteFruits.join(", "));
        setLocalIngredientsText(saved.localIngredients.join(", "));
        setRestrictionsText(saved.dietaryRestrictions.join(", "));
        setDislikedFoodsText(saved.dislikedFoods.join(", "));
        setOtherKitchenText(saved.otherKitchenEquipment.join(", "));
        setOtherResourcesText(saved.otherWorkoutResources.join(", "));
        const showLength = (value: number | null) => value === null ? "" : saved.measurementUnit === "ft_in_kg" ? (value / 2.54).toFixed(1) : String(value);
        const showWeight = (value: number | null) => value === null ? "" : saved.measurementUnit === "cm_lb" ? (value * 2.20462).toFixed(1) : String(value);
        setNumbers({ electricity: String(saved.electricityHoursPerDay || ""), market: String(saved.marketMinutesAway || ""), steps: String(saved.dailyStepCount || ""), stepTarget: String(saved.aspirationalStepTarget || ""), movement: String(saved.workoutMinutesPerDay || ""), height: showLength(saved.heightCm), weight: showWeight(saved.weightKg), waist: showLength(saved.baselineWaistCm), hip: showLength(saved.baselineHipCm), chest: showLength(saved.baselineChestCm) });
        setStep(6);
      }
    }).finally(() => setIsLoading(false));
  }, []);

  const weeklyPlan = useMemo(() => buildWeeklyPlan(profile), [profile]);
  const meal = weeklyPlan.meals[selectedDay];
  const workout = weeklyPlan.workouts[selectedDay];
  const daySchedule = weeklyPlan.dailyMeals[selectedDay];

  const updateNumber = (key: string, rawValue: string, profileKey: keyof UserProfile, limit: number, nullable = false) => {
    setNumbers((current) => ({ ...current, [key]: rawValue }));
    const parsed = numberOrNull(rawValue);
    setProfile((current) => ({ ...current, [profileKey]: parsed === null ? (nullable ? null : 0) : Math.min(limit, parsed) }));
  };

  const displayMeasurement = (value: number | null, kind: "length" | "weight", unit = profile.measurementUnit) => {
    if (value === null) return "";
    if (kind === "length") return unit === "ft_in_kg" ? (value / 2.54).toFixed(1) : String(value);
    return unit === "cm_lb" ? (value * 2.20462).toFixed(1) : String(value);
  };
  const updateMeasurementNumber = (key: string, rawValue: string, profileKey: keyof UserProfile, kind: "length" | "weight") => {
    setNumbers((current) => ({ ...current, [key]: rawValue }));
    const parsed = numberOrNull(rawValue);
    const canonical = parsed === null ? null : kind === "length" ? profile.measurementUnit === "ft_in_kg" ? parsed * 2.54 : parsed : profile.measurementUnit === "cm_lb" ? parsed / 2.20462 : parsed;
    setProfile((current) => ({ ...current, [profileKey]: canonical }));
  };
  const switchMeasurementUnit = (measurementUnit: UserProfile["measurementUnit"]) => {
    if (measurementUnit === profile.measurementUnit) return;
    setNumbers((current) => ({ ...current, height: displayMeasurement(profile.heightCm, "length", measurementUnit), weight: displayMeasurement(profile.weightKg, "weight", measurementUnit), waist: displayMeasurement(profile.baselineWaistCm, "length", measurementUnit), hip: displayMeasurement(profile.baselineHipCm, "length", measurementUnit), chest: displayMeasurement(profile.baselineChestCm, "length", measurementUnit) }));
    setProfile((current) => ({ ...current, measurementUnit }));
  };
  const lengthUnit = profile.measurementUnit === "ft_in_kg" ? "in" : "cm";
  const weightUnit = profile.measurementUnit === "ft_in_kg" ? "kg" : "lb";

  const toggleOption = (key: "kitchenEquipment" | "workoutResources", option: string) => setProfile((current) => ({ ...current, [key]: current[key].includes(option) ? current[key].filter((item) => item !== option) : [...current[key], option] }));
  const toggleFoodChoice = (key: "localIngredients" | "favoriteFruits", item: string) => setProfile((current) => {
    if (key === "favoriteFruits" && !current.favoriteFruits.includes(item) && current.favoriteFruits.length >= 4) { Alert.alert("Choose up to four fruits", "Remove one favourite first, or add a different one in the free-text field."); return current; }
    const next = current[key].includes(item) ? current[key].filter((entry) => entry !== item) : [...current[key], item];
    if (key === "localIngredients") setLocalIngredientsText(next.join(", "));
    if (key === "favoriteFruits") setFavoriteFruitsText(next.join(", "));
    return { ...current, [key]: next };
  });
  const foodSuggestions = suggestedFoods(profile.country).filter((item) => item.toLowerCase().includes(foodQuery.toLowerCase()));
  const mealSuggestions = suggestedMeals(profile.country);
  const toggleMealSuggestion = (item: string) => setProfile((current) => {
    const next = current.favoriteMeals.includes(item) ? current.favoriteMeals.filter((entry) => entry !== item) : [...current.favoriteMeals, item];
    setFavoriteMealsText(next.join(", "));
    return { ...current, favoriteMeals: next };
  });

  const continueOnboarding = () => {
    if (step === 1 && (!profile.city.trim() || profile.electricityHoursPerDay < 1)) return Alert.alert("A little more context", "Add your city and typical daily electricity access so the plan can stay practical.");
    if (step === 2 && (!profile.shoppingFrequency || profile.marketMinutesAway < 1)) return Alert.alert("A little more context", "Select your shopping rhythm and how long a market trip usually takes.");
    if (step === 3 && profile.favoriteMeals.length === 0) return Alert.alert("Keep your food in the plan", "Add at least one meal you genuinely enjoy.");
    if (step === 4 && profile.workoutMinutesPerDay < 1) return Alert.alert("Make it fit your day", "Choose the amount of time you can realistically give to movement.");
    if (step === 5 && !profile.goal) return Alert.alert("Choose a starting focus", "Your goal helps us emphasise the right kind of weekly variety.");
    setStep((current) => current + 1);
  };

  const createPlan = async () => {
    setIsSaving(true);
    try { await saveProfile(profile); setStep(6); } finally { setIsSaving(false); }
  };

  const openWorkoutVideo = (url: string) => {
    WebBrowser.openBrowserAsync(url, { controlsColor: "#2D6A4F", enableBarCollapsing: true, showTitle: true }).catch(() => Alert.alert("Workout link could not open", "Please check your internet connection and try again."));
  };

  const resetProfile = async () => {
    await clearProfile();
    setProfile(emptyProfile);
    setFavoriteMealsText(""); setLocalIngredientsText(""); setOtherKitchenText(""); setOtherResourcesText("");
    setNumbers({ electricity: "", market: "", steps: "", stepTarget: "", movement: "", height: "", weight: "", waist: "", hip: "", chest: "" });
    setStep(0);
  };

  if (isLoading) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.loadingScreen}><ActivityIndicator color="#2D6A4F" /></ScreenContainer>;

  if (step === 6) return <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}><ScrollView contentContainerStyle={styles.scrollContent}><View style={styles.plan}><Text style={styles.eyebrow}>YOUR ROOTED WEEK</Text><Text style={styles.dashboardTitle}>{weeklyPlan.goalTitle}</Text><Text style={styles.dashboardIntro}>{weeklyPlan.goalMessage}</Text><View style={styles.planCard}><Text style={styles.cardKicker}>POWER & STORAGE</Text><Text style={styles.cardText}>{weeklyPlan.electricityNote}</Text></View><Text style={styles.sectionTitle}>Today’s plan at a glance</Text><View style={styles.planCard}><Text style={styles.cardKicker}>{meal.label.toUpperCase()} · {weeklyPlan.dailyMeals[selectedDay].slots.length} PLANNED {weeklyPlan.dailyMeals[selectedDay].slots.length === 1 ? "MEAL" : "MEALS"}</Text>{weeklyPlan.dailyMeals[selectedDay].slots.map((slot) => <Text key={slot.label} style={styles.summarySlot}>{slot.label}: {slot.meal.title}</Text>)}<Pressable onPress={() => router.push("/schedule")} style={styles.videoLink}><Text style={styles.videoLinkKicker}>MEALS & GROCERY LIST</Text><Text style={styles.videoLinkText}>Open full recipes for {meal.label}</Text><Text style={styles.videoLinkAction}>View recipes and grocery list →</Text></Pressable></View><View style={[styles.planCard, styles.movementCard]}><Text style={styles.cardKicker}>MOVEMENT · {workout.category.toUpperCase()}</Text><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.cardSubhead}>{workout.durationMinutes} minutes, adjusted to your stated time</Text><Pressable onPress={() => router.push("/workouts")} style={styles.videoLink}><Text style={styles.videoLinkKicker}>WORKOUT LIBRARY</Text><Text style={styles.videoLinkText}>See follow-along options for your focus</Text><Text style={styles.videoLinkAction}>Open workouts →</Text></Pressable></View><View style={styles.safetyCard}><Text style={styles.safetyText}>{weeklyPlan.safetyNote}</Text></View><Pressable onPress={() => setStep(1)} style={styles.textButton}><Text style={styles.textButtonLabel}>Edit my plan details</Text></Pressable><Pressable onPress={resetProfile} style={styles.textButton}><Text style={styles.textButtonLabel}>Reset local demo profile</Text></Pressable></View></ScrollView></ScreenContainer>;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <StepHeader step={step} />
          {step === 0 ? <View style={styles.hero}><View style={styles.logoMark}><Text style={styles.logoGlyph}>R</Text></View><Text style={styles.eyebrow}>ROOTEDFIT</Text><Text style={styles.heroTitle}>Health plans that live in the real world.</Text><Text style={styles.heroBody}>Your food, power, market access, goals, body context, and household resources all shape your plan.</Text><View style={styles.promiseCard}><Text style={styles.promiseTitle}>More realistic than a generic plan.</Text><Text style={styles.promiseBody}>You will receive a varied week of meals, recipes, drinks, movement, and practical shopping guidance—built around what you actually have.</Text></View>{Platform.OS === "web" ? <View style={styles.webTesterCard}><Text style={styles.webTesterTitle}>Browser tester beta</Text><Text style={styles.webTesterBody}>No download is needed. Build a plan in this browser, then explore Meals, Workouts, Track, and Extras. Your MVP data stays locally in the browser you use, so each tester starts privately on their own device.</Text></View> : null}<PrimaryButton compact label={Platform.OS === "web" ? "Start browser plan" : "Build my weekly plan"} onPress={() => setStep(1)} /></View> : null}

          {step === 1 ? <View style={styles.content}><Text style={styles.title}>Start with your daily reality.</Text><Text style={styles.body}>Country, electricity, and market access shape what can be prepared, stored, and bought without waste.</Text><TextField label="City or community" value={profile.city} onChangeText={(city) => setProfile((current) => ({ ...current, city }))} placeholder="e.g. Accra" /><Text style={styles.fieldLabel}>Country food catalogue</Text><Text style={styles.helper}>This powers suggested foods and fruits. Every selection stays fully editable.</Text><View style={styles.choiceStack}>{COUNTRY_OPTIONS.map((country) => <ChoiceButton key={country} label={country} selected={profile.country === country} onPress={() => setProfile((current) => ({ ...current, country, localIngredients: [], favoriteFruits: [] }))} />)}</View><NumberField label="Typical electricity access" value={numbers.electricity} onChange={(value) => updateNumber("electricity", value, "electricityHoursPerDay", 24)} suffix="hours each day" helper="You can type a number directly or use the controls." /></View> : null}

          {step === 2 ? <View style={styles.content}><Text style={styles.title}>What does your kitchen have?</Text><Text style={styles.body}>Select everything available—not just what you use most. The plan only uses equipment you list.</Text><NumberField label="Travel time to your usual market" value={numbers.market} onChange={(value) => updateNumber("market", value, "marketMinutesAway", 600)} suffix="minutes away" /><Text style={styles.fieldLabel}>How often do you usually shop?</Text><View style={styles.choiceStack}>{["Daily", "Weekly", "Every two weeks", "Monthly"].map((label, index) => <ChoiceButton key={label} label={label} selected={profile.shoppingFrequency === (["daily", "weekly", "biweekly", "monthly"] as ShoppingFrequency[])[index]} onPress={() => setProfile((current) => ({ ...current, shoppingFrequency: (["daily", "weekly", "biweekly", "monthly"] as ShoppingFrequency[])[index] }))} />)}</View><Text style={styles.fieldLabel}>Kitchen equipment you have</Text><Text style={styles.helper}>Choose all that apply, then add anything else below.</Text><View style={styles.choiceStack}>{KITCHEN_OPTIONS.map((option) => <ChoiceButton key={option} label={option} selected={profile.kitchenEquipment.includes(option)} onPress={() => toggleOption("kitchenEquipment", option)} />)}</View><TextField label="Other kitchen equipment" value={otherKitchenText} onChangeText={(value) => { setOtherKitchenText(value); setProfile((current) => ({ ...current, otherKitchenEquipment: splitList(value) })); }} placeholder="e.g. solar cooker, charcoal stove" helper="Separate items with commas. Your typing stays intact while you enter each item." /></View> : null}

          {step === 3 ? <View style={styles.content}><Text style={styles.title}>Let’s keep food familiar.</Text><Text style={styles.body}>Comfort foods stay in the plan. You choose meals you enjoy, raw ingredients you can reach, fruit favourites, and any foods you would rather avoid.</Text><TextField label="Meals you enjoy" value={favoriteMealsText} onChangeText={(value) => { setFavoriteMealsText(value); setProfile((current) => ({ ...current, favoriteMeals: splitList(value) })); }} placeholder="e.g. yam, rice, pepper soup" helper="Separate ready-made meals with commas. These stay preferred plan anchors." multiline /><Text style={styles.fieldLabel}>Meal ideas to help you choose</Text><Text style={styles.helper}>These are ready-made meal suggestions, not ingredients. Tap any meals you genuinely enjoy.</Text><View style={styles.choiceStack}>{mealSuggestions.map((item) => <ChoiceButton key={item} label={item} selected={profile.favoriteMeals.includes(item)} onPress={() => toggleMealSuggestion(item)} />)}</View><Text style={styles.fieldLabel}>How often do you want to eat?</Text><Text style={styles.helper}>This decides whether each day shows one main meal with snack ideas, two meals, or three meal slots.</Text><View style={styles.choiceStack}><ChoiceButton label="One main meal + snack ideas" selected={profile.mealFrequency === "one_plus_snack"} onPress={() => setProfile((current) => ({ ...current, mealFrequency: "one_plus_snack" }))} /><ChoiceButton label="Two meals + snack ideas" selected={profile.mealFrequency === "two"} onPress={() => setProfile((current) => ({ ...current, mealFrequency: "two" }))} /><ChoiceButton label="Three meals + snack ideas" selected={profile.mealFrequency === "three"} onPress={() => setProfile((current) => ({ ...current, mealFrequency: "three" }))} /></View><Text style={styles.fieldLabel}>Ingredients within your reach</Text><Text style={styles.helper}>Search raw ingredients if nothing comes to mind, then tap only items that are truly available to you.</Text><TextInput value={foodQuery} onChangeText={setFoodQuery} placeholder="Search raw ingredients" placeholderTextColor="#93A197" style={styles.input} returnKeyType="done" /><View style={styles.choiceStack}>{foodSuggestions.map((item) => <ChoiceButton key={item} label={item} selected={profile.localIngredients.includes(item)} onPress={() => toggleFoodChoice("localIngredients", item)} />)}</View><TextField label="Other ingredients usually within reach" value={localIngredientsText} onChangeText={(value) => { setLocalIngredientsText(value); setProfile((current) => ({ ...current, localIngredients: splitList(value) })); }} placeholder="e.g. carrots, cucumbers, beans" helper="Type ingredients beyond the suggestions, separated with commas." multiline /><Text style={styles.fieldLabel}>Favourite fruits</Text><Text style={styles.helper}>Choose up to four fruit favourites. Fruit stays separate from your cooking ingredients.</Text><View style={styles.choiceStack}>{suggestedFruits(profile.country).map((item) => <ChoiceButton key={item} label={item} selected={profile.favoriteFruits.includes(item)} onPress={() => toggleFoodChoice("favoriteFruits", item)} />)}</View><TextField label="Other favourite fruits" value={favoriteFruitsText} onChangeText={(value) => { const fruits = splitList(value).slice(0, 4); setFavoriteFruitsText(value); setProfile((current) => ({ ...current, favoriteFruits: fruits })); }} placeholder="e.g. mango, watermelon" helper="Type up to four fruits, separated with commas." /><Text style={styles.fieldLabel}>If you have a sweet tooth</Text><Text style={styles.helper}>Choose a realistic approach. No food is banned.</Text><View style={styles.choiceStack}><ChoiceButton label="No special sweet preference" selected={profile.sweetToothPreference === "none"} onPress={() => setProfile((current) => ({ ...current, sweetToothPreference: "none" }))} /><ChoiceButton label="Suggest satisfying alternatives" selected={profile.sweetToothPreference === "healthier_swaps"} onPress={() => setProfile((current) => ({ ...current, sweetToothPreference: "healthier_swaps" }))} /><ChoiceButton label="Include portion guidance" selected={profile.sweetToothPreference === "portion_guidance"} onPress={() => setProfile((current) => ({ ...current, sweetToothPreference: "portion_guidance" }))} /></View><TextField label="Dietary restrictions" value={restrictionsText} onChangeText={(value) => { setRestrictionsText(value); setProfile((current) => ({ ...current, dietaryRestrictions: splitList(value) })); }} placeholder="e.g. peanut allergy, vegetarian, halal" helper="These are hard exclusions. Verify any recipe independently for a severe allergy." multiline /><TextField label="Foods you do not enjoy" value={dislikedFoodsText} onChangeText={(value) => { setDislikedFoodsText(value); setProfile((current) => ({ ...current, dislikedFoods: splitList(value) })); }} placeholder="e.g. mushrooms, liver" helper="These are soft exclusions. We protect enjoyment and avoid unnecessary burnout." multiline /><TextField label="Dietary notes (optional)" value={profile.dietaryNotes} onChangeText={(dietaryNotes) => setProfile((current) => ({ ...current, dietaryNotes }))} placeholder="e.g. family meals matter, no preference" helper="Use this for extra context the plan should respect." multiline /></View> : null}

          {step === 4 ? <View style={styles.content}><Text style={styles.title}>Movement should fit your home too.</Text><Text style={styles.body}>Type what is realistic for a normal day. The weekly plan will rotate toning, Pilates-inspired core, mobility, walking, and recovery options.</Text><NumberField label="Usual daily step count" value={numbers.steps} onChange={(value) => updateNumber("steps", value, "dailyStepCount", 100000)} suffix="steps" helper="Type your estimate directly. You can also adjust it in the tracking page later." /><NumberField label="Aspirational daily step target" value={numbers.stepTarget} onChange={(value) => updateNumber("stepTarget", value, "aspirationalStepTarget", 100000)} suffix="steps" helper="An encouraging next target, not a grade. Choose a number you want to build toward." /><NumberField label="Time you can give to movement" value={numbers.movement} onChange={(value) => updateNumber("movement", value, "workoutMinutesPerDay", 180)} suffix="minutes daily" /><Text style={styles.fieldLabel}>Resources you have at home</Text><Text style={styles.helper}>Select everything available, including simple household items.</Text><View style={styles.choiceStack}>{RESOURCE_OPTIONS.map((option) => <ChoiceButton key={option} label={option} selected={profile.workoutResources.includes(option)} onPress={() => toggleOption("workoutResources", option)} />)}</View><TextField label="Other movement resources" value={otherResourcesText} onChangeText={(value) => { setOtherResourcesText(value); setProfile((current) => ({ ...current, otherWorkoutResources: splitList(value) })); }} placeholder="e.g. backpack, park nearby" helper="Separate items with commas." /></View> : null}

          {step === 5 ? <View style={styles.content}><Text style={styles.title}>What would you like to work toward?</Text><Text style={styles.body}>Choose one primary focus, then any secondary focuses. Body context is optional and stays on this device.</Text><Text style={styles.fieldLabel}>Primary focus</Text><View style={styles.choiceStack}>{GOALS.map((goal) => <ChoiceButton key={goal.value} label={goal.label} description={goal.description} selected={profile.goal === goal.value} onPress={() => setProfile((current) => ({ ...current, goal: goal.value, secondaryFocuses: current.secondaryFocuses.filter((item) => item !== goal.value) }))} />)}</View><Text style={styles.fieldLabel}>Secondary focuses</Text><Text style={styles.helper}>Select any additional areas you care about. They guide variety but do not replace your primary focus.</Text><View style={styles.choiceStack}>{GOALS.filter((goal) => goal.value !== profile.goal).map((goal) => <ChoiceButton key={goal.value} label={goal.label} selected={profile.secondaryFocuses.includes(goal.value as Exclude<WellnessGoal, null>)} onPress={() => setProfile((current) => ({ ...current, secondaryFocuses: current.secondaryFocuses.includes(goal.value as Exclude<WellnessGoal, null>) ? current.secondaryFocuses.filter((item) => item !== goal.value) : [...current.secondaryFocuses, goal.value as Exclude<WellnessGoal, null>] }))} />)}</View><Text style={styles.fieldLabel}>Gender identity (optional)</Text><Pressable onPress={() => setGenderOptionsOpen((open) => !open)} style={styles.dropdownButton}><Text style={styles.dropdownText}>{profile.genderIdentity}</Text><Text style={styles.dropdownArrow}>{genderOptionsOpen ? "⌃" : "⌄"}</Text></Pressable>{genderOptionsOpen ? <View style={styles.dropdownMenu}>{["Woman", "Man", "Non-binary", "Self-describe", "Prefer not to say"].map((option) => <ChoiceButton key={option} label={option} selected={profile.genderIdentity === option} onPress={() => { setProfile((current) => ({ ...current, genderIdentity: option })); setGenderOptionsOpen(false); }} />)}</View> : null}{profile.genderIdentity === "Self-describe" ? <TextField label="Self-description" value="" onChangeText={(genderIdentity) => setProfile((current) => ({ ...current, genderIdentity }))} placeholder="Optional self-description" /> : null}<Text style={styles.fieldLabel}>Measurement units</Text><View style={styles.choiceStack}><ChoiceButton label="Feet/inches + kilograms" selected={profile.measurementUnit === "ft_in_kg"} onPress={() => switchMeasurementUnit("ft_in_kg")} /><ChoiceButton label="Centimetres + pounds" selected={profile.measurementUnit === "cm_lb"} onPress={() => switchMeasurementUnit("cm_lb")} /></View><NumberField label="Height (optional)" value={numbers.height} onChange={(value) => updateMeasurementNumber("height", value, "heightCm", "length")} suffix={lengthUnit} allowDecimal /><Text style={styles.helper}>{profile.measurementUnit === "ft_in_kg" ? "Use inches for this field (for example, 66 inches)." : "Use centimetres for this field."}</Text><NumberField label="Current weight (optional)" value={numbers.weight} onChange={(value) => updateMeasurementNumber("weight", value, "weightKg", "weight")} suffix={weightUnit} allowDecimal /><Text style={styles.sectionTitle}>Optional baseline measurements</Text><Text style={styles.helper}>These support weekly trend tracking. Leave any field blank if it is not useful to you.</Text><NumberField label="Waist" value={numbers.waist} onChange={(value) => updateMeasurementNumber("waist", value, "baselineWaistCm", "length")} suffix={lengthUnit} allowDecimal /><NumberField label="Hip" value={numbers.hip} onChange={(value) => updateMeasurementNumber("hip", value, "baselineHipCm", "length")} suffix={lengthUnit} allowDecimal /><NumberField label="Chest" value={numbers.chest} onChange={(value) => updateMeasurementNumber("chest", value, "baselineChestCm", "length")} suffix={lengthUnit} allowDecimal /></View> : null}

          {step === 6 ? <View style={styles.plan}><Text style={styles.eyebrow}>YOUR ROOTED WEEK</Text><Text style={styles.dashboardTitle}>{weeklyPlan.goalTitle}</Text><Text style={styles.dashboardIntro}>{weeklyPlan.goalMessage}</Text><View style={styles.planCard}><Text style={styles.cardKicker}>POWER & STORAGE</Text><Text style={styles.cardText}>{weeklyPlan.electricityNote}</Text></View><Text style={styles.sectionTitle}>Your 7-day rhythm</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daySelector}>{weeklyPlan.meals.map((item, index) => <Pressable key={item.label} onPress={() => setSelectedDay(index)} style={[styles.dayChip, selectedDay === index && styles.dayChipActive]}><Text style={[styles.dayChipText, selectedDay === index && styles.dayChipTextActive]}>{item.label}</Text></Pressable>)}</ScrollView><View style={styles.planCard}><Text style={styles.cardKicker}>MEAL IDEA · {meal.label.toUpperCase()}</Text><Text style={styles.cardTitle}>{meal.title}</Text><Text style={styles.cardSubhead}>{meal.focus}</Text><Text style={styles.cardText}>Ingredients: {meal.ingredients.join(" • ")}</Text><Text style={styles.recipeHeading}>How to make it</Text>{meal.steps.map((item, index) => <Text key={item} style={styles.recipeStep}>{index + 1}. {item}</Text>)}<View style={styles.noteBox}><Text style={styles.noteText}>{meal.equipmentNote}</Text></View><Text style={styles.drinkText}>Drink idea: {meal.drink}</Text><Text style={styles.storageText}>{meal.storageNote}</Text></View><View style={[styles.planCard, styles.movementCard]}><Text style={styles.cardKicker}>MOVEMENT · {workout.category.toUpperCase()}</Text><Text style={styles.cardTitle}>{workout.title}</Text><Text style={styles.cardSubhead}>{workout.durationMinutes} minutes, adjusted to your stated time</Text>{workout.instructions.map((item, index) => <Text key={item} style={styles.recipeStep}>{index + 1}. {item}</Text>)}<Pressable onPress={() => openWorkoutVideo(workout.videoUrl)} style={styles.videoLink}><Text style={styles.videoLinkKicker}>OPTIONAL FOLLOW-ALONG VIDEO · {workout.videoProvider.toUpperCase()}</Text><Text style={styles.videoLinkText}>{workout.videoTitle}</Text><Text style={styles.videoLinkAction}>Open YouTube workout →</Text></Pressable><Text style={styles.cardFootnote}>{workout.adaptation}</Text></View><View style={styles.planCard}><Text style={styles.cardKicker}>WEEKLY SHOPPING LIST</Text>{weeklyPlan.shoppingGroups.map((group) => <View key={group.title} style={styles.shoppingGroup}><Text style={styles.shoppingTitle}>{group.title}</Text>{group.items.map((item) => <Text key={item} style={styles.shoppingItem}>• {item}</Text>)}</View>)}</View><View style={styles.safetyCard}><Text style={styles.safetyText}>{weeklyPlan.safetyNote}</Text></View><Pressable onPress={() => setStep(1)} style={styles.textButton}><Text style={styles.textButtonLabel}>Edit my plan details</Text></Pressable><Pressable onPress={resetProfile} style={styles.textButton}><Text style={styles.textButtonLabel}>Reset local demo profile</Text></Pressable></View> : null}
          {step === 6 ? <View style={styles.planCard}><Text style={styles.cardKicker}>{daySchedule.label.toUpperCase()} · ALL PLANNED MEALS</Text>{daySchedule.slots.map((slot) => <View key={slot.label} style={styles.shoppingGroup}><Text style={styles.shoppingTitle}>{slot.label}: {slot.meal.title}</Text><Text style={styles.shoppingItem}>{slot.meal.ingredients.slice(0, 3).join(" · ")}</Text></View>)}{daySchedule.snackIdeas.length ? <View style={styles.noteBox}><Text style={styles.noteText}>Snack ideas: {daySchedule.snackIdeas.join(" • ")}</Text></View> : null}<Pressable onPress={() => router.push("/schedule")} style={styles.textButton}><Text style={styles.textButtonLabel}>Check full recipes in Meals →</Text></Pressable></View> : null}
        </ScrollView>
        {step > 0 && step < 6 ? <View style={styles.footer}><Pressable onPress={() => setStep((current) => current - 1)} style={styles.backButton}><Text style={styles.backButtonText}>Back</Text></Pressable>{step === 5 ? <PrimaryButton label={isSaving ? "Creating your week…" : "Create my weekly plan"} onPress={createPlan} disabled={isSaving} /> : <PrimaryButton label="Continue" onPress={continueOnboarding} />}</View> : null}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#F8F6EF" }, loadingScreen: { alignItems: "center", backgroundColor: "#F8F6EF", justifyContent: "center" }, flex: { flex: 1 }, scrollContent: { alignSelf: "center", flexGrow: 1, maxWidth: 760, paddingHorizontal: 22, paddingVertical: 18, width: "100%" },
  stepHeader: { marginBottom: 26 }, stepLabel: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 }, stepCount: { color: "#6B7A70", fontSize: 13, fontWeight: "600", marginTop: 6 }, progressTrack: { backgroundColor: "#DDE5DA", borderRadius: 10, height: 6, marginTop: 12, overflow: "hidden" }, progressFill: { backgroundColor: "#2D6A4F", borderRadius: 10, height: "100%" },
  hero: { flex: 1, justifyContent: "center", paddingVertical: 24 }, logoMark: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 18, height: 56, justifyContent: "center", marginBottom: 20, width: 56 }, logoGlyph: { color: "#F8F6EF", fontSize: 27, fontWeight: "800" }, eyebrow: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.4, marginBottom: 11 }, heroTitle: { color: "#1F2A25", fontSize: 36, fontWeight: "800", letterSpacing: -0.8, lineHeight: 42, maxWidth: 350 }, heroBody: { color: "#526259", fontSize: 17, lineHeight: 26, marginTop: 18, maxWidth: 360 }, promiseCard: { backgroundColor: "#E6F1E7", borderColor: "#C9DFC9", borderRadius: 18, borderWidth: 1, marginBottom: 22, marginTop: 30, padding: 18 }, promiseTitle: { color: "#2D6A4F", fontSize: 16, fontWeight: "800", lineHeight: 22 }, promiseBody: { color: "#526259", fontSize: 14, lineHeight: 20, marginTop: 7 }, webTesterCard: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 18, borderWidth: 1, marginBottom: 18, padding: 18 }, webTesterTitle: { color: "#6B4A2C", fontSize: 15, fontWeight: "800" }, webTesterBody: { color: "#6B4A2C", fontSize: 13, lineHeight: 20, marginTop: 6 },
  content: { paddingBottom: 100 }, title: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, body: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 28, marginTop: 12 }, fieldGroup: { marginBottom: 24 }, fieldLabel: { color: "#1F2A25", fontSize: 15, fontWeight: "800", lineHeight: 21, marginBottom: 8 }, helper: { color: "#6B7A70", fontSize: 13, lineHeight: 19, marginBottom: 10 }, input: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, color: "#1F2A25", fontSize: 16, minHeight: 52, paddingHorizontal: 15, paddingVertical: 13 }, textArea: { minHeight: 104, textAlignVertical: "top" }, numberRow: { alignItems: "center", flexDirection: "row", gap: 9 }, stepperButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 15, borderWidth: 1, height: 52, justifyContent: "center", width: 48 }, stepperText: { color: "#2D6A4F", fontSize: 25, fontWeight: "700", lineHeight: 28 }, numberInput: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, color: "#1F2A25", flex: 1, fontSize: 17, fontWeight: "700", height: 52, paddingHorizontal: 14 }, numberSuffix: { color: "#526259", fontSize: 13, fontWeight: "700", minWidth: 54 },
  choiceStack: { gap: 9, marginBottom: 23 }, choice: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, minHeight: 50, paddingHorizontal: 15, paddingVertical: 13 }, choiceSelected: { backgroundColor: "#EAF3EA", borderColor: "#2D6A4F" }, choicePressed: { opacity: 0.74 }, choiceCopy: { flex: 1 }, choiceText: { color: "#385046", fontSize: 15, fontWeight: "600" }, choiceTextSelected: { color: "#1D583E", fontWeight: "800" }, choiceDescription: { color: "#6B7A70", fontSize: 12, lineHeight: 17, marginTop: 4 }, dropdownButton: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", marginBottom: 8, minHeight: 52, paddingHorizontal: 15 }, dropdownText: { color: "#1F2A25", fontSize: 15, fontWeight: "700" }, dropdownArrow: { color: "#2D6A4F", fontSize: 18, fontWeight: "800" }, dropdownMenu: { gap: 8, marginBottom: 18 }, sectionTitle: { color: "#1F2A25", fontSize: 20, fontWeight: "800", lineHeight: 27, marginBottom: 8, marginTop: 6 },
  footer: { alignItems: "center", backgroundColor: "#F8F6EF", borderTopColor: "#DDE5DA", borderTopWidth: 1, flexDirection: "row", gap: 12, paddingHorizontal: 22, paddingVertical: 14 }, backButton: { alignItems: "center", justifyContent: "center", minHeight: 52, paddingHorizontal: 10 }, backButtonText: { color: "#2D6A4F", fontSize: 15, fontWeight: "800" }, primaryButton: { alignItems: "center", backgroundColor: "#2D6A4F", borderRadius: 15, flex: 1, justifyContent: "center", minHeight: 54, paddingHorizontal: 16 }, primaryButtonCompact: { alignSelf: "flex-start", flexGrow: 0, flexShrink: 0 }, buttonDisabled: { backgroundColor: "#8AA693" }, buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] }, primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  plan: { paddingBottom: 24 }, dashboardTitle: { color: "#1F2A25", fontSize: 30, fontWeight: "800", letterSpacing: -0.5, lineHeight: 36 }, dashboardIntro: { color: "#526259", fontSize: 16, lineHeight: 24, marginBottom: 22, marginTop: 10 }, daySelector: { gap: 8, marginBottom: 16 }, dayChip: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 }, dayChipActive: { backgroundColor: "#2D6A4F", borderColor: "#2D6A4F" }, dayChipText: { color: "#385046", fontSize: 13, fontWeight: "800" }, dayChipTextActive: { color: "#FFFFFF" }, planCard: { backgroundColor: "#FFFFFF", borderColor: "#DDE5DA", borderRadius: 18, borderWidth: 1, marginBottom: 14, padding: 18 }, summarySlot: { borderTopColor: "#E5EBE3", borderTopWidth: 1, paddingVertical: 11 }, summarySlotLabel: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 3 }, summarySlotTitle: { color: "#1F2A25", fontSize: 16, fontWeight: "800", lineHeight: 22 }, summarySlotCopy: { color: "#526259", fontSize: 13, lineHeight: 18, marginTop: 3 }, summaryLink: { alignItems: "center", backgroundColor: "#EAF3EA", borderRadius: 11, marginTop: 13, padding: 12 }, summaryLinkText: { color: "#1D583E", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" }, movementCard: { backgroundColor: "#EEF5EF", borderColor: "#C9DFC9" }, cardKicker: { color: "#2D6A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, marginBottom: 8 }, cardTitle: { color: "#1F2A25", fontSize: 19, fontWeight: "800", lineHeight: 25, marginBottom: 6 }, cardSubhead: { color: "#6B7A70", fontSize: 13, fontWeight: "700", lineHeight: 19, marginBottom: 10 }, cardText: { color: "#405247", fontSize: 15, lineHeight: 22 }, recipeHeading: { color: "#1F2A25", fontSize: 15, fontWeight: "800", marginBottom: 7, marginTop: 15 }, recipeStep: { color: "#405247", fontSize: 14, lineHeight: 21, marginBottom: 7 }, noteBox: { backgroundColor: "#F8F6EF", borderRadius: 11, marginTop: 12, padding: 12 }, noteText: { color: "#526259", fontSize: 13, fontWeight: "600", lineHeight: 19 }, drinkText: { color: "#2D6A4F", fontSize: 14, fontWeight: "700", lineHeight: 20, marginTop: 13 }, storageText: { color: "#9A4A35", fontSize: 13, lineHeight: 19, marginTop: 10 }, videoLink: { backgroundColor: "#D8EADD", borderColor: "#8BB99A", borderRadius: 12, borderWidth: 1, marginTop: 14, padding: 13 }, videoLinkKicker: { color: "#2D6A4F", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 5 }, videoLinkText: { color: "#1D583E", fontSize: 14, fontWeight: "800", lineHeight: 20 }, videoLinkAction: { color: "#2D6A4F", fontSize: 13, fontWeight: "800", marginTop: 8, textDecorationLine: "underline" }, cardFootnote: { color: "#526259", fontSize: 13, lineHeight: 19, marginTop: 13 }, shoppingGroup: { borderTopColor: "#E5EBE3", borderTopWidth: 1, marginTop: 12, paddingTop: 12 }, shoppingTitle: { color: "#1F2A25", fontSize: 15, fontWeight: "800", marginBottom: 5 }, shoppingItem: { color: "#526259", fontSize: 14, lineHeight: 21 }, safetyCard: { backgroundColor: "#FCF3E7", borderColor: "#E8D1A4", borderRadius: 16, borderWidth: 1, marginBottom: 10, padding: 16 }, safetyText: { color: "#6B4A2C", fontSize: 13, lineHeight: 19 }, textButton: { alignItems: "center", minHeight: 48, padding: 8 }, textButtonLabel: { color: "#2D6A4F", fontSize: 14, fontWeight: "800", textDecorationLine: "underline" },
});
