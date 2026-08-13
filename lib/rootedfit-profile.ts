import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FoodCountry } from "@/lib/food-catalogue";

export type ShoppingFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type MealFrequency = "one_plus_snack" | "two" | "three";
export type SweetToothPreference = "none" | "healthier_swaps" | "portion_guidance";
export type WellnessGoal = "consistency" | "energy" | "toning" | "core_mobility" | "body_composition" | "weight_loss" | "weight_gain" | null;
export type MeasurementUnit = "ft_in_kg" | "cm_lb";
export type ProgressPhotoAngle = "front" | "side" | "back";

export type UserProfile = {
  city: string;
  country: FoodCountry;
  electricityHoursPerDay: number;
  marketMinutesAway: number;
  shoppingFrequency: ShoppingFrequency | null;
  kitchenEquipment: string[];
  otherKitchenEquipment: string[];
  favoriteMeals: string[];
  favoriteFruits: string[];
  localIngredients: string[];
  dietaryNotes: string;
  dietaryRestrictions: string[];
  dislikedFoods: string[];
  mealFrequency: MealFrequency;
  sweetToothPreference: SweetToothPreference;
  dailyStepCount: number;
  aspirationalStepTarget: number;
  workoutMinutesPerDay: number;
  workoutResources: string[];
  otherWorkoutResources: string[];
  goal: WellnessGoal;
  secondaryFocuses: Exclude<WellnessGoal, null>[];
  genderIdentity: string;
  measurementUnit: MeasurementUnit;
  heightCm: number | null;
  weightKg: number | null;
  baselineWaistCm: number | null;
  baselineHipCm: number | null;
  baselineChestCm: number | null;
};

export type MealDay = {
  day: number;
  label: string;
  title: string;
  focus: string;
  ingredients: string[];
  steps: string[];
  drink: string;
  storageNote: string;
  equipmentNote: string;
};

export type WorkoutDay = {
  day: number;
  label: string;
  title: string;
  category: string;
  durationMinutes: number;
  instructions: string[];
  adaptation: string;
  videoTitle: string;
  videoUrl: string;
  videoProvider: string;
};

export type ShoppingGroup = {
  title: string;
  items: string[];
};

export type WeeklyPlan = {
  goalTitle: string;
  goalMessage: string;
  safetyNote: string;
  electricityNote: string;
  meals: MealDay[];
  dailyMeals: { day: number; label: string; slots: { label: string; meal: MealDay }[]; snackIdeas: string[] }[];
  workouts: WorkoutDay[];
  shoppingGroups: ShoppingGroup[];
};

export type DailyCheckIn = {
  id: string;
  date: string;
  steps: number;
  followedMealIdea: boolean;
  completedMovement: boolean;
  mood: "low" | "steady" | "good" | "great";
  note: string;
};

export type BodyMeasurement = {
  id: string;
  date: string;
  weightKg: number | null;
  waistCm: number | null;
  hipCm: number | null;
  chestCm: number | null;
  upperArmCm: number | null;
  thighCm: number | null;
  unit: MeasurementUnit;
  note: string;
};

export type ProgressPhoto = {
  id: string;
  date: string;
  angle: ProgressPhotoAngle;
  uri: string;
};

export type MealSwap = { slotKey: string; recipeIndex: number };
export type WorkoutSessionState = { workoutId: string; saved: boolean; completedAt: string | null };
export type DailyWaterLog = { date: string; millilitres: number };

export const profileStorageKey = "rootedfit.profile.v2";
const legacyProfileStorageKey = "rootedfit.profile.v1";
export const checkInsStorageKey = "rootedfit.check-ins.v1";
export const measurementsStorageKey = "rootedfit.measurements.v1";
export const progressPhotosStorageKey = "rootedfit.progress-photos.v1";
export const mealSwapsStorageKey = "rootedfit.meal-swaps.v1";
export const workoutSessionsStorageKey = "rootedfit.workout-sessions.v1";
export const waterLogsStorageKey = "rootedfit.water-logs.v1";

export const emptyProfile: UserProfile = {
  city: "",
  country: "Nigeria",
  electricityHoursPerDay: 0,
  marketMinutesAway: 0,
  shoppingFrequency: null,
  kitchenEquipment: [],
  otherKitchenEquipment: [],
  favoriteMeals: [],
  favoriteFruits: [],
  localIngredients: [],
  dietaryNotes: "",
  dietaryRestrictions: [],
  dislikedFoods: [],
  mealFrequency: "three",
  sweetToothPreference: "none",
  dailyStepCount: 0,
  aspirationalStepTarget: 0,
  workoutMinutesPerDay: 0,
  workoutResources: [],
  otherWorkoutResources: [],
  goal: null,
  secondaryFocuses: [],
  genderIdentity: "Prefer not to say",
  measurementUnit: "ft_in_kg",
  heightCm: null,
  weightKg: null,
  baselineWaistCm: null,
  baselineHipCm: null,
  baselineChestCm: null,
};

function normaliseProfile(profile: Partial<UserProfile>): UserProfile {
  const legacyMeasurementUnit = (profile as { measurementUnit?: string }).measurementUnit;
  return {
    ...emptyProfile,
    ...profile,
    kitchenEquipment: profile.kitchenEquipment ?? [],
    otherKitchenEquipment: profile.otherKitchenEquipment ?? [],
    favoriteMeals: profile.favoriteMeals ?? [],
    favoriteFruits: profile.favoriteFruits ?? [],
    localIngredients: profile.localIngredients ?? [],
    dietaryRestrictions: profile.dietaryRestrictions ?? [],
    dislikedFoods: profile.dislikedFoods ?? [],
    workoutResources: profile.workoutResources ?? [],
    otherWorkoutResources: profile.otherWorkoutResources ?? [],
    secondaryFocuses: profile.secondaryFocuses ?? [],
    measurementUnit: legacyMeasurementUnit === "imperial" ? "ft_in_kg" : legacyMeasurementUnit === "metric" ? "cm_lb" : legacyMeasurementUnit === "cm_lb" ? "cm_lb" : "ft_in_kg",
  };
}

function sentenceList(values: string[], fallback: string) {
  if (values.length === 0) return fallback;
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

function cycle(values: string[], index: number, fallback: string) {
  return values.length > 0 ? values[index % values.length] : fallback;
}

function goalCopy(goal: WellnessGoal) {
  switch (goal) {
    case "energy":
      return { title: "More steady energy", message: "Your week pairs regular meals and approachable movement so energy is supported by repeatable routines." };
    case "toning":
      return { title: "Strength and toning", message: "Your week rotates practical full-body strength work with recovery so effort stays sustainable." };
    case "core_mobility":
      return { title: "Core and mobility", message: "Your week emphasises gentle core control, posture, and mobility without needing a specialised studio." };
    case "body_composition":
      return { title: "Body-composition habits", message: "Your week focuses on consistent meals, movement, and trend tracking—not restrictive daily targets." };
    case "weight_loss":
      return { title: "Weight-loss habits", message: "Your week supports regular meals, satisfying familiar foods, and movement you can repeat without extreme rules." };
    case "weight_gain":
      return { title: "Weight-gain habits", message: "Your week supports consistent meals and practical additions that help you meet your energy needs without forcing unfamiliar foods." };
    default:
      return { title: "A consistent routine", message: "Your week is designed around small actions that fit the conditions you described." };
  }
}

function foodStorageNote(profile: UserProfile) {
  const hasFridge = profile.kitchenEquipment.includes("Fridge");
  if (!hasFridge || profile.electricityHoursPerDay <= 12) {
    return "Plan for same-day portions when reliable cold storage is uncertain. Do not use smell or taste alone to decide whether a perishable food is safe.";
  }
  return "Use your fridge for short storage only when it is reliably cold; keep portions small and prioritise fresh food before the next shopping trip.";
}

function cookingMethod(profile: UserProfile) {
  if (profile.kitchenEquipment.includes("Stove") || profile.kitchenEquipment.includes("Gas burner")) return "cook or warm";
  if (profile.kitchenEquipment.includes("Microwave")) return "steam, warm, or reheat";
  if (profile.kitchenEquipment.includes("Air fryer")) return "air-fry or warm";
  if (profile.kitchenEquipment.includes("Kettle")) return "rehydrate or warm with boiled water";
  return "assemble";
}

function movementAdaptation(profile: UserProfile) {
  const parts: string[] = [];
  if (profile.workoutResources.includes("Yoga mat")) parts.push("Use your mat for floor work.");
  if (profile.workoutResources.includes("Chair")) parts.push("Use a chair for supported sit-to-stands or incline work.");
  if (profile.workoutResources.includes("Resistance band")) parts.push("Add a band only where it feels controlled.");
  if (profile.workoutResources.includes("Weights or filled bottles")) parts.push("Filled bottles can add a light load.");
  return parts.length ? parts.join(" ") : "Bodyweight and a small clear space are enough for this session.";
}

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function numberOrNull(value: string): number | null {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatToday() {
  return new Date().toISOString().slice(0, 10);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const current = await AsyncStorage.getItem(profileStorageKey);
  const legacy = current ? null : await AsyncStorage.getItem(legacyProfileStorageKey);
  const saved = current ?? legacy;
  if (!saved) return null;

  try {
    const profile = normaliseProfile(JSON.parse(saved) as Partial<UserProfile>);
    if (legacy) await saveProfile(profile);
    return profile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile) {
  await AsyncStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

export async function clearProfile() {
  await AsyncStorage.multiRemove([profileStorageKey, legacyProfileStorageKey, checkInsStorageKey, measurementsStorageKey, progressPhotosStorageKey, mealSwapsStorageKey, workoutSessionsStorageKey, waterLogsStorageKey]);
}

export async function loadCheckIns(): Promise<DailyCheckIn[]> {
  const saved = await AsyncStorage.getItem(checkInsStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as DailyCheckIn[];
  } catch {
    return [];
  }
}

export async function saveCheckIns(checkIns: DailyCheckIn[]) {
  await AsyncStorage.setItem(checkInsStorageKey, JSON.stringify(checkIns.slice(0, 90)));
}

export async function loadMeasurements(): Promise<BodyMeasurement[]> {
  const saved = await AsyncStorage.getItem(measurementsStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as BodyMeasurement[];
  } catch {
    return [];
  }
}

export async function saveMeasurements(measurements: BodyMeasurement[]) {
  await AsyncStorage.setItem(measurementsStorageKey, JSON.stringify(measurements.slice(0, 52)));
}

export async function loadProgressPhotos(): Promise<ProgressPhoto[]> {
  const saved = await AsyncStorage.getItem(progressPhotosStorageKey);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as ProgressPhoto[];
  } catch {
    return [];
  }
}

export async function saveProgressPhotos(photos: ProgressPhoto[]) {
  await AsyncStorage.setItem(progressPhotosStorageKey, JSON.stringify(photos.slice(0, 60)));
}

export async function loadMealSwaps(): Promise<MealSwap[]> {
  const saved = await AsyncStorage.getItem(mealSwapsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as MealSwap[]; } catch { return []; }
}

export async function saveMealSwaps(swaps: MealSwap[]) {
  await AsyncStorage.setItem(mealSwapsStorageKey, JSON.stringify(swaps.slice(0, 100)));
}

export async function loadWorkoutSessionStates(): Promise<WorkoutSessionState[]> {
  const saved = await AsyncStorage.getItem(workoutSessionsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as WorkoutSessionState[]; } catch { return []; }
}

export async function saveWorkoutSessionStates(states: WorkoutSessionState[]) {
  await AsyncStorage.setItem(workoutSessionsStorageKey, JSON.stringify(states.slice(0, 100)));
}

export async function loadWaterLogs(): Promise<DailyWaterLog[]> {
  const saved = await AsyncStorage.getItem(waterLogsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as DailyWaterLog[]; } catch { return []; }
}

export async function saveWaterLogs(logs: DailyWaterLog[]) {
  await AsyncStorage.setItem(waterLogsStorageKey, JSON.stringify(logs.slice(0, 90)));
}

export function buildWeeklyPlan(profile: UserProfile): WeeklyPlan {
  const localIngredients = profile.localIngredients.length ? profile.localIngredients : ["tomato", "onion", "leafy greens"];
  const storageNote = foodStorageNote(profile);
  const goal = goalCopy(profile.goal);
  const durationMinutes = Math.max(10, Math.min(60, profile.workoutMinutesPerDay || 20));
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const excluded = [...profile.dietaryRestrictions, ...profile.dislikedFoods].map((item) => item.toLowerCase());
  const hasStove = profile.kitchenEquipment.some((item) => ["Stove", "Gas burner", "Oven", "Air fryer"].includes(item));
  const hasMicrowave = profile.kitchenEquipment.includes("Microwave");
  const avoids = (term: string) => excluded.some((item) => item.includes(term) || term.includes(item));
  const usesAnimalFoods = !["vegetarian", "vegan", "chicken", "fish", "egg", "meat"].some(avoids);
  const comfortFood = profile.favoriteMeals[0] || "a favourite family meal";
  const recipeEquipmentNote = hasStove ? "Use a pot and a frying pan or saucepan. Prep the tomato, onion, and pepper before you turn on the heat so the steps stay simple." : hasMicrowave ? "This dish is best made on a stovetop. With a microwave-only kitchen, choose a microwave-ready egg, oats, rice, or bean option instead of forcing this recipe." : "This dish needs a reliable heat source. Keep it for the next day you can use a shared or household stove, and choose a no-cook or ready-cooked option today.";
  const fruit = profile.favoriteFruits[0] || "orange, banana, or another fruit you enjoy";
  const nigeriaRecipes: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote">[] = [
    { title: "Nigerian jollof rice with chicken and cabbage slaw", focus: "A familiar rice meal with a clear one-pot base and fresh crunch", ingredients: ["¾ cup parboiled rice", "2 medium tomatoes", "½ red bell pepper", "½ onion", "1 teaspoon oil", "½ teaspoon curry powder and dried thyme", "1 palm-sized chicken portion", "1 cup shredded cabbage and carrot"], steps: ["Blend the tomatoes, pepper, and half the onion until smooth.", "Fry the remaining onion in the oil for 2 minutes, add the blended mix, curry, thyme, and a pinch of salt; simmer until the sauce thickens.", "Stir in the rice and enough water to come just level with it. Cover and cook on low heat until the rice is tender.", "Cook the chicken separately in the same pan or oven, then serve with the cabbage-and-carrot slaw."], drink: `Serve with water and ${fruit}.` },
    { title: "Beans porridge with ripe plantain", focus: "A complete one-pot comfort meal using durable beans", ingredients: ["¾ cup brown or black-eyed beans", "½ ripe plantain", "½ onion", "1 tablespoon palm oil or preferred oil", "1 teaspoon ground crayfish (optional)", "1 cup spinach, ugu, or other leafy greens"], steps: ["Rinse the beans and cook in fresh water until they begin to soften.", "Add onion, oil, crayfish if using, and a small pinch of salt; continue cooking until creamy.", "Slice the plantain and add it for the last 10–12 minutes so it softens without disappearing.", "Stir in the greens at the end and serve once they wilt."], drink: "Water or unsweetened zobo made with safe drinking water." },
    { title: "Yam and egg sauce", focus: "A straightforward breakfast or dinner using a familiar staple", ingredients: ["2 thick slices yam", "2 eggs", "1 medium tomato", "¼ onion", "½ bell pepper", "1 teaspoon oil", "Pinch of curry or dried thyme"], steps: ["Peel the yam, cut into thick pieces, cover with water, and boil until a fork passes through easily.", "Dice the tomato, onion, and pepper.", "Fry the onion and pepper in the oil for 2 minutes, add tomato and cook until it loses its raw smell.", "Beat the eggs with curry or thyme, pour into the sauce, and fold gently until just set. Serve beside the yam."], drink: `Water and a portion of ${fruit}.` },
    { title: "Efo riro with fish and small semo portion", focus: "Leafy vegetable soup built around the flavour you already know", ingredients: ["2 cups sliced ugu, efo, or spinach", "1 palm-sized fish portion", "1 tomato", "½ red bell pepper", "¼ onion", "1 tablespoon palm oil", "1 small semo portion"], steps: ["Blend tomato, pepper, and onion roughly; cook the mixture in palm oil until it reduces and smells rich.", "Add the fish and a small splash of water; simmer until the fish is cooked through.", "Fold in the greens and cook only until softened and bright.", "Prepare one small semo portion separately and serve with the soup."], drink: "Water or warm unsweetened tea." },
    { title: "Moi moi with pap and cucumber", focus: "A bean-based meal you can prep from familiar market ingredients", ingredients: ["1 cup peeled beans or bean flour", "¼ onion", "½ red bell pepper", "1 teaspoon oil", "Small piece smoked fish or 1 boiled egg (optional)", "1 cup pap", "½ cucumber"], steps: ["Blend soaked peeled beans, onion, pepper, and enough water to make a thick smooth batter, or mix bean flour according to its packet directions.", "Stir in oil, a small pinch of salt, and the fish or egg if using.", "Pour into heat-safe containers and cook in a covered pot of gently simmering water until firm in the centre.", "Prepare pap with hot water and serve with sliced cucumber."], drink: "Water; pap already counts as part of the meal." },
    { title: "Catfish pepper soup with boiled sweet potato", focus: "A simple fresh-market meal with a clear cooking sequence", ingredients: ["1 catfish portion", "1 small sweet potato", "½ onion", "1 teaspoon pepper-soup spice", "Fresh pepper to taste", "Handful scent leaf or parsley (optional)"], steps: ["Peel and cube the sweet potato; boil in a separate pot until tender.", "Place fish, onion, pepper-soup spice, and pepper in a pot with enough water to cover the fish.", "Simmer gently until the fish is cooked and the broth tastes seasoned.", "Add scent leaf or parsley at the end and serve with the boiled sweet potato."], drink: "Water; the pepper soup broth is part of the meal." },
    { title: "Ofada-style rice with tomato stew and vegetables", focus: `A practical version of ${comfortFood} using a separate stew base`, ingredients: ["¾ cup rice", "2 tomatoes", "½ red bell pepper", "½ onion", "1 teaspoon oil", "1 palm-sized chicken or fish portion", "1 cup cabbage, carrot, or green beans"], steps: ["Rinse the rice and cook until tender; drain any excess water.", "Blend tomato, pepper, and onion. Fry in oil until the sauce thickens and the colour deepens.", "Cook the chicken or fish separately, then spoon some of the stew over it.", "Quickly sauté or boil the vegetables and serve them beside the rice and stew."], drink: `Water with a serving of ${fruit} later in the day.` },
  ];
  const ghanaRecipes: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote">[] = [
    { title: "Waakye with tomato-onion relish", focus: "A Ghanaian rice-and-bean meal with a clear pot sequence", ingredients: ["½ cup black-eyed peas or cow beans", "½ cup rice", "2 dried sorghum leaves if available", "½ onion", "1 tomato", "1 teaspoon oil", "Pinch of salt"], steps: ["Soak the beans if using dried beans, then rinse them well.", "Simmer the sorghum leaves in water for 15–20 minutes if you have them; remove the leaves before cooking the beans in the coloured water.", "Cook the beans until nearly tender, then add rinsed rice and cook until both are soft.", "Cook diced onion and tomato in a teaspoon of oil until softened; spoon beside the waakye."], drink: `Water and ${fruit} later in the day.` },
    { title: "Red red-style beans with baked plantain", focus: "A beans-and-plantain comfort meal using straightforward ingredients", ingredients: ["¾ cup black-eyed peas", "½ ripe plantain", "½ onion", "1 tomato", "1 teaspoon palm oil or preferred oil", "Pinch of ginger or chili if enjoyed"], steps: ["Cook the beans in fresh water until tender.", "Cook onion and tomato in the oil until the mixture thickens, then stir in the cooked beans and season to taste.", "Slice the plantain and bake, air-fry, or pan-cook with a small amount of oil until tender.", "Serve the beans with plantain and a side of any greens you have."], drink: "Water or unsweetened hibiscus drink made with safe water." },
    { title: "Kontomire-style greens with boiled yam", focus: "A flexible leafy-green meal that respects what is locally available", ingredients: ["2 cups kontomire, spinach, or other sturdy greens", "2 thick yam slices", "½ onion", "1 tomato", "1 teaspoon oil", "Small fish or egg only if it fits your preferences"], steps: ["Peel and boil the yam until fork-tender.", "Cook onion and tomato in the oil until soft.", "Add greens and a small splash of water; cook until the leaves soften while keeping their colour.", "Add an optional protein if it suits your preferences and serve beside the boiled yam."], drink: `Water with ${fruit}.` },
  ];
  const kenyaRecipes: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote">[] = [
    { title: "Githeri-style maize and beans", focus: "A Kenyan-inspired one-pot maize-and-bean base", ingredients: ["½ cup cooked maize or sweet corn", "½ cup cooked beans", "½ onion", "1 tomato", "1 teaspoon oil", "1 cup kale, spinach, or sukuma wiki"], steps: ["Cook or reheat beans and maize until hot and tender.", "Cook onion and tomato in the oil until soft.", "Stir in the beans and maize with a small splash of water; simmer until the flavours combine.", "Fold in the greens until softened and serve while warm."], drink: `Water and ${fruit} later in the day.` },
    { title: "Sukuma wiki with ugali", focus: "Leafy greens and maize staple with flexible local substitutions", ingredients: ["2 cups sukuma wiki, kale, collards, or spinach", "½ onion", "1 tomato", "1 clove garlic", "1 teaspoon oil", "½ cup maize flour", "1¼ cups water"], steps: ["Bring the water to a boil and gradually stir in maize flour until it becomes a smooth, firm ugali; keep stirring until cooked through.", "Cook onion and garlic in oil, then add tomato and cook until soft.", "Add the greens with a small splash of water and cook until tender.", "Serve the sukuma wiki beside the ugali."], drink: "Water or unsweetened ginger tea." },
    { title: "Chapati-style bean and vegetable stew", focus: "A practical bean stew paired with a familiar flatbread when available", ingredients: ["1 chapati or other flatbread", "½ cup cooked beans", "½ onion", "1 tomato", "½ carrot", "1 teaspoon oil", "Pinch of cumin or coriander if available"], steps: ["Cook onion, carrot, and tomato in the oil until softened.", "Add the beans, season with a pinch of cumin or coriander if you use it, and simmer with a little water for 5 minutes.", "Warm the chapati or use another familiar flatbread.", "Serve the bean stew with the flatbread and any cucumber or greens you have."], drink: `Water with ${fruit}.` },
  ];
  const regionalRecipes = profile.country === "Ghana" ? ghanaRecipes : profile.country === "Kenya" ? kenyaRecipes : nigeriaRecipes;
  const restrictionSafeRecipes = regionalRecipes.filter((recipe) => !excluded.some((item) => `${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(item)));
  const plantBasedRecipes = restrictionSafeRecipes.filter((recipe) => !/(chicken|fish|egg|catfish)/i.test(`${recipe.title} ${recipe.ingredients.join(" ")}`));
  const usableRecipes = usesAnimalFoods ? restrictionSafeRecipes : plantBasedRecipes.length ? plantBasedRecipes : restrictionSafeRecipes;
  const focusAdjustment = profile.goal === "weight_loss" ? { note: "Use the measured staple portion shown and add an extra cup of available vegetables or greens where possible.", adapt: (items: string[]) => [...items.map((item) => item.replace("¾ cup", "½ cup")), "1 extra cup available leafy greens, cabbage, carrot, or cucumber"] } : profile.goal === "weight_gain" ? { note: "Use the fuller staple portion shown and include one extra planned snack or energy-dense addition that fits your preferences.", adapt: (items: string[]) => [...items.map((item) => item.replace("¾ cup", "1 cup").replace("½ cup", "¾ cup")), "1 small planned snack: groundnuts, yoghurt, milk, beans, or seeds if suitable"] } : profile.goal === "toning" ? { note: "Keep a regular staple portion and make the protein component intentional for this meal.", adapt: (items: string[]) => [...items, "1 intentional protein portion: beans, egg, fish, chicken, tofu, or another preferred option"] } : profile.goal === "energy" ? { note: "Keep this meal practical and include the available fruit or vegetable side listed for a steadier rhythm.", adapt: (items: string[]) => [...items, "1 available fruit or vegetable side"] } : { note: "Keep the portion practical for your day and use the ingredients you genuinely have.", adapt: (items: string[]) => items };
  const mealPlan = labels.map((label, index) => { const recipe = usableRecipes.length ? usableRecipes[index % usableRecipes.length] : regionalRecipes[0]; const titleSuffix = profile.goal === "weight_loss" ? " with an extra vegetable side" : profile.goal === "weight_gain" ? " with a planned energy-supporting snack" : profile.goal === "toning" ? " with an intentional protein side" : profile.goal === "energy" ? " with a fruit or vegetable side" : ""; return { ...recipe, title: `${recipe.title}${titleSuffix}`, ingredients: focusAdjustment.adapt(recipe.ingredients), focus: `${recipe.focus}. ${focusAdjustment.note}`, day: index + 1, label, storageNote, equipmentNote: recipeEquipmentNote }; });
  const sweetToothSnack = profile.sweetToothPreference === "healthier_swaps" ? "Fruit with plain yoghurt or a small homemade cocoa-oat snack" : profile.sweetToothPreference === "portion_guidance" ? "A small chosen sweet portion served after a balanced meal, rather than eating from the packet" : "A small cup of pap, yoghurt, or another snack that fits your dietary notes";
  const snackIdeas = [`${fruit} with a small handful of groundnuts if suitable for you`, "Cucumber, carrot, or another crunchy vegetable with a familiar dip", sweetToothSnack];
  const slotLabels = profile.mealFrequency === "one_plus_snack" ? ["Main meal"] : profile.mealFrequency === "two" ? ["First meal", "Second meal"] : ["Breakfast", "Lunch", "Dinner"];
  const dailyMeals = labels.map((label, index) => ({
    day: index + 1,
    label,
    slots: slotLabels.map((slot, slotIndex) => ({ label: slot, meal: { ...mealPlan[(index + slotIndex) % mealPlan.length], day: index + 1, label } })),
    snackIdeas: profile.mealFrequency === "one_plus_snack" ? [snackIdeas[index % 2], snackIdeas[2]] : [],
  }));

  const rounds = durationMinutes >= 30 ? 3 : 2;
  const workoutTemplates: Omit<WorkoutDay, "day" | "label" | "durationMinutes" | "adaptation">[] = [
    { title: "Home toning: full-body foundation", category: "Strength & toning", instructions: ["Warm up for 3 minutes: march in place, shoulder rolls, and hip circles.", `Complete ${rounds} rounds: 10 chair sit-to-stands, 8 wall push-ups, 10 hip hinges, and 12 calf raises.`, "Rest for 45–60 seconds between rounds and finish with 2 minutes of relaxed stretching."], videoTitle: "30 MIN FULL BODY WORKOUT · At-Home Pilates", videoUrl: "https://www.youtube.com/watch?v=lBCBSy9cNT0", videoProvider: "Move With Nicole" },
    { title: "Pilates-inspired core: control block", category: "Core & control", instructions: ["Spend 3 minutes on slow breathing, pelvic tilts, and gentle spinal mobility.", `Complete ${rounds} rounds: 8 heel taps per side, 8 dead-bug reaches per side, and a 20-second supported tabletop hold.`, "Finish with 6 slow cat-cow movements or seated spinal rolls and a side-body stretch."], videoTitle: "30 MIN PILATES CORE WORKOUT · At-Home Pilates Abs", videoUrl: "https://www.youtube.com/watch?v=U5LwQW_IQOc", videoProvider: "Move With Nicole" },
    { title: "Walking rhythm: step builder", category: "Steps & stamina", instructions: ["Start with 3 minutes at an easy walking or marching pace.", `Alternate 2 minutes steady walking with 1 minute brisk walking or higher-knee marching for ${Math.max(4, Math.floor(durationMinutes / 3))} cycles.`, "Cool down for 3 minutes and stretch calves and ankles gently."], videoTitle: "30-Minute Yoga For Beginners", videoUrl: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", videoProvider: "Yoga With Adriene" },
    { title: "Mobility reset: hips, back, shoulders", category: "Mobility & posture", instructions: ["Move through 6 shoulder rolls, 6 neck turns, and 8 ankle circles per side.", `Complete ${rounds} slow rounds: 8 supported squats, 8 standing hip openers per side, and 8 wall slides.`, "Finish with 60 seconds of comfortable breathing and a supported forward fold or chair stretch."], videoTitle: "30-Minute Yoga For Beginners", videoUrl: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", videoProvider: "Yoga With Adriene" },
    { title: "Lower-body and balance block", category: "Strength & balance", instructions: ["Warm up near a stable chair or wall for support.", `Complete ${rounds} rounds: 10 sit-to-stands, 10 side steps per side, 10 glute bridges or standing hip extensions, and 10 calf raises.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."], videoTitle: "30 MIN ABS & BOOTY WORKOUT · No Equipment", videoUrl: "https://www.youtube.com/watch?v=MvSK7dBbt8Q", videoProvider: "Move With Nicole" },
    { title: "Small-space cardio: no-equipment mix", category: "Movement variety", instructions: ["Use 3 minutes of easy marching and step touches to warm up.", `Complete ${rounds} rounds: 45 seconds marching, 45 seconds step touches, 45 seconds shadow boxing, then 45 seconds easy recovery.`, "Finish with 2 minutes of slow breathing and shoulder/leg stretches."], videoTitle: "30 MIN ABS & BOOTY · No Equipment", videoUrl: "https://www.youtube.com/watch?v=pKhKqYBP7qQ", videoProvider: "YouTube" },
    { title: "Recovery flow: restore and reset", category: "Recovery & mobility", instructions: ["Choose a calm space and take 6 slow breaths.", "Move gently through 8 cat-cow or seated spinal rolls, 8 hip circles per side, and 30 seconds of a comfortable child’s pose or chair fold.", "Finish with one sentence about what made movement possible today; no performance target is needed."], videoTitle: "30-Minute Yoga For Beginners", videoUrl: "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", videoProvider: "Yoga With Adriene" },
  ];
  const workoutPlan = labels.map((label, index) => ({
    ...workoutTemplates[index],
    day: index + 1,
    label,
    durationMinutes,
    adaptation: `${movementAdaptation(profile)} Keep the session pain-free; pause or choose a gentler option if anything feels wrong.`,
  }));

  const longerShopping = profile.shoppingFrequency === "biweekly" || profile.shoppingFrequency === "monthly";
  return {
    goalTitle: goal.title,
    goalMessage: goal.message,
    safetyNote: "RootedFit is a general wellness guide. If you are pregnant, managing a medical condition, returning after injury, or experience pain, adapt the plan and consider local professional guidance.",
    electricityNote: `${profile.electricityHoursPerDay || "Your stated"} hours of electricity/day: ${storageNote}`,
    meals: mealPlan,
    dailyMeals,
    workouts: workoutPlan,
    shoppingGroups: [
      { title: "Ingredients from your planned recipes", items: Array.from(new Set(mealPlan.flatMap((meal) => meal.ingredients))).slice(0, 42) },
      { title: "Helpful fresh extras", items: [...localIngredients.slice(0, 6), profile.favoriteFruits[0] ? profile.favoriteFruits[0] : "A fruit you enjoy"] },
      { title: "Storage reminder", items: [longerShopping ? "Choose only quantities you can safely store until your next shop." : "Choose quantities you can use while fresh."] },
    ],
  };
}

export function buildMotivationalMessage(checkIns: DailyCheckIn[], goal: WellnessGoal) {
  const completedToday = checkIns.some((entry) => entry.date === formatToday() && (entry.followedMealIdea || entry.completedMovement));
  if (completedToday) return "You showed up for a practical habit today. Small repeats are the foundation of a rooted routine.";
  if (goal === "toning") return "Strength grows through calm, repeatable effort—not one perfect workout.";
  if (goal === "core_mobility") return "A few controlled minutes can be meaningful movement. Start where your body is today.";
  return "Choose the next realistic action, not the perfect one.";
}
