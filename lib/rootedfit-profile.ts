import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FoodCountry } from "@/lib/food-catalogue";

export type ShoppingFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type WellnessGoal = "consistency" | "energy" | "toning" | "core_mobility" | "body_composition" | null;
export type MeasurementUnit = "metric" | "imperial";
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
  dailyStepCount: number;
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

export const profileStorageKey = "rootedfit.profile.v2";
const legacyProfileStorageKey = "rootedfit.profile.v1";
export const checkInsStorageKey = "rootedfit.check-ins.v1";
export const measurementsStorageKey = "rootedfit.measurements.v1";
export const progressPhotosStorageKey = "rootedfit.progress-photos.v1";

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
  dailyStepCount: 0,
  workoutMinutesPerDay: 0,
  workoutResources: [],
  otherWorkoutResources: [],
  goal: null,
  secondaryFocuses: [],
  genderIdentity: "Prefer not to say",
  measurementUnit: "metric",
  heightCm: null,
  weightKg: null,
  baselineWaistCm: null,
  baselineHipCm: null,
  baselineChestCm: null,
};

function normaliseProfile(profile: Partial<UserProfile>): UserProfile {
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
  await AsyncStorage.multiRemove([profileStorageKey, legacyProfileStorageKey, checkInsStorageKey, measurementsStorageKey, progressPhotosStorageKey]);
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

export function buildWeeklyPlan(profile: UserProfile): WeeklyPlan {
  const localIngredients = profile.localIngredients.length ? profile.localIngredients : ["a locally available vegetable", "a seasonal fruit", "a protein option"];
  const meals = profile.favoriteMeals.length ? profile.favoriteMeals : ["a familiar meal you enjoy", "a local staple", "a simple home meal"];
  const method = cookingMethod(profile);
  const storageNote = foodStorageNote(profile);
  const goal = goalCopy(profile.goal);
  const durationMinutes = Math.max(10, Math.min(60, profile.workoutMinutesPerDay || 20));
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const excluded = [...profile.dietaryRestrictions, ...profile.dislikedFoods].map((item) => item.toLowerCase());
  const allowed = (item: string) => !excluded.some((excludedItem) => item.toLowerCase().includes(excludedItem) || excludedItem.includes(item.toLowerCase()));
  const protein = ["2 eggs", "¾ cup cooked beans", "1 palm-sized fish portion", "¾ cup tofu", "1 palm-sized chicken portion"].find(allowed) ?? "¾ cup of a protein you have confirmed is suitable";
  const fruit = profile.favoriteFruits.find(allowed) ?? "a locally available fruit";
  const mealFocuses = ["Familiar plate, measured ingredients", "Pantry-and-produce bowl", "Vegetable and protein pairing", "Simple lunch or dinner plate", "Comfort food with practical additions", "Market-day fresh meal", "Use-what-you-have reset"];
  const mealPlan = labels.map((label, index) => {
    const anchor = cycle(meals, index, "a familiar local meal");
    const ingredient = cycle(localIngredients, index, "a locally available ingredient");
    const secondIngredient = cycle(localIngredients, index + 1, "onion or another available vegetable");
    const portions = [`1 cup prepared ${anchor}`, `1 cup ${ingredient}`, `½ cup ${secondIngredient}`, protein, "1 teaspoon cooking oil or the amount your recipe normally needs"];
    const pattern = [
      { title: `${anchor} with ${ingredient} and protein`, steps: [`Set out ${portions[0]}, ${portions[1]}, and ${portions[3]}.`, `${method[0].toUpperCase()}${method.slice(1)} ${ingredient} with the oil and add it beside or into ${anchor}.`, `Prepare ${protein} using only your listed kitchen equipment.`, "Serve the meal while fresh; do not plan leftovers unless you can confirm cold storage is safe."], drink: `Serve safe drinking water with 1 sliced ${fruit} or a fruit portion on the side.` },
      { title: `${anchor} one-bowl mix`, steps: [`Measure ${portions[0]} and ${portions[1]}.`, `${method[0].toUpperCase()}${method.slice(1)} ${ingredient} and ${secondIngredient} until tender.`, `Stir in or serve with ${protein}; season using flavours you already enjoy.`, "Eat the prepared portion the same day when cold storage is uncertain."], drink: `Make a simple ${fruit} and water drink only when safe water and the equipment are available.` },
      { title: `Colourful ${anchor} plate`, steps: [`Place ${portions[0]} on a plate or bowl.`, `Add 1 cup ${ingredient} and ½ cup ${secondIngredient} as a cooked or washed fresh side.`, `Add ${protein}.`, "Keep the familiar meal at the centre; the additions are for variety, not replacement."], drink: `Have water, unsweetened tea, or ${fruit} with the meal.` },
      { title: `${anchor} and ${ingredient} quick recipe`, steps: [`Prepare 1 cup ${anchor} as your household normally would.`, `${method[0].toUpperCase()}${method.slice(1)} 1 cup ${ingredient} with ${secondIngredient}.`, `Add ${protein} and heat until ready to eat.`, "Taste for familiar seasoning and serve immediately."], drink: `Water plus a portion of ${fruit}.` },
      { title: `Comforting ${anchor} with a practical side`, steps: [`Cook or warm 1 cup ${anchor}.`, `Make a side of 1 cup ${ingredient} and ½ cup ${secondIngredient}.`, `Add ${protein}.`, "Make the same-day quantity that fits your actual power and storage window."], drink: `Water or a freshly prepared ${fruit} drink without treating it as a meal replacement.` },
      { title: `Fresh-market ${anchor} meal`, steps: [`Use 1 cup ${anchor} with the freshest 1 cup ${ingredient} you can obtain.`, `Add ½ cup ${secondIngredient} for another texture or colour.`, `Prepare ${protein} using your available equipment.`, "Use delicate fresh items first and save durable ingredients for later in the shopping cycle."], drink: `Safe water with ${fruit}, ginger, or citrus if you enjoy it.` },
      { title: `Flexible ${anchor} reset`, steps: [`Check what you have: 1 cup ${anchor}, 1 cup ${ingredient}, and ½ cup ${secondIngredient}.`, `Choose ${protein} if available and appropriate for your restrictions.`, `${method[0].toUpperCase()}${method.slice(1)} or assemble the ingredients into a simple one-bowl meal.`, "Use it as a realistic no-waste meal, not a perfect-recipe test."], drink: `Your preferred unsweetened drink plus safe drinking water.` },
    ][index];
    return {
      day: index + 1,
      label,
      title: pattern.title,
      focus: mealFocuses[index],
      ingredients: portions,
      steps: pattern.steps,
      drink: pattern.drink,
      storageNote,
      equipmentNote: `This suggestion is designed to ${method} with what you selected at home.`,
    } satisfies MealDay;
  });

  const rounds = durationMinutes >= 30 ? 3 : 2;
  const workoutTemplates: { title: string; category: string; instructions: string[] }[] = [
    { title: "Home toning: full-body foundation", category: "Strength & toning", instructions: ["Warm up for 3 minutes: march in place, shoulder rolls, and hip circles.", `Complete ${rounds} rounds: 10 chair sit-to-stands, 8 wall push-ups, 10 hip hinges, and 12 calf raises.`, "Rest for 45–60 seconds between rounds and finish with 2 minutes of relaxed stretching."] },
    { title: "Pilates-inspired core: control block", category: "Core & control", instructions: ["Spend 3 minutes on slow breathing, pelvic tilts, and gentle spinal mobility.", `Complete ${rounds} rounds: 8 heel taps per side, 8 dead-bug reaches per side, and a 20-second supported tabletop hold.`, "Finish with 6 slow cat-cow movements or seated spinal rolls and a side-body stretch."] },
    { title: "Walking rhythm: step builder", category: "Steps & stamina", instructions: ["Start with 3 minutes at an easy walking or marching pace.", `Alternate 2 minutes steady walking with 1 minute brisk walking or higher-knee marching for ${Math.max(4, Math.floor(durationMinutes / 3))} cycles.`, "Cool down for 3 minutes and stretch calves and ankles gently."] },
    { title: "Mobility reset: hips, back, shoulders", category: "Mobility & posture", instructions: ["Move through 6 shoulder rolls, 6 neck turns, and 8 ankle circles per side.", `Complete ${rounds} slow rounds: 8 supported squats, 8 standing hip openers per side, and 8 wall slides.`, "Finish with 60 seconds of comfortable breathing and a supported forward fold or chair stretch."] },
    { title: "Lower-body and balance block", category: "Strength & balance", instructions: ["Warm up near a stable chair or wall for support.", `Complete ${rounds} rounds: 10 sit-to-stands, 10 side steps per side, 10 glute bridges or standing hip extensions, and 10 calf raises.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."] },
    { title: "Small-space cardio: no-equipment mix", category: "Movement variety", instructions: ["Use 3 minutes of easy marching and step touches to warm up.", `Complete ${rounds} rounds: 45 seconds marching, 45 seconds step touches, 45 seconds shadow boxing, then 45 seconds easy recovery.`, "Finish with 2 minutes of slow breathing and shoulder/leg stretches."] },
    { title: "Recovery flow: restore and reset", category: "Recovery & mobility", instructions: ["Choose a calm space and take 6 slow breaths.", "Move gently through 8 cat-cow or seated spinal rolls, 8 hip circles per side, and 30 seconds of a comfortable child’s pose or chair fold.", "Finish with one sentence about what made movement possible today; no performance target is needed."] },
  ];
  const workoutPlan = labels.map((label, index) => ({
    day: index + 1,
    label,
    title: workoutTemplates[index].title,
    category: workoutTemplates[index].category,
    durationMinutes,
    instructions: workoutTemplates[index].instructions,
    adaptation: `${movementAdaptation(profile)} Keep the session pain-free; pause or choose a gentler option if anything feels wrong.`,
  }));

  const longerShopping = profile.shoppingFrequency === "biweekly" || profile.shoppingFrequency === "monthly";
  return {
    goalTitle: goal.title,
    goalMessage: goal.message,
    safetyNote: "RootedFit is a general wellness guide. If you are pregnant, managing a medical condition, returning after injury, or experience pain, adapt the plan and consider local professional guidance.",
    electricityNote: `${profile.electricityHoursPerDay || "Your stated"} hours of electricity/day: ${storageNote}`,
    meals: mealPlan,
    workouts: workoutPlan,
    shoppingGroups: [
      { title: "Durable pantry base", items: ["A grain, root, or starchy staple you enjoy", "Beans, lentils, groundnuts, or another shelf-stable protein", "Tinned or dried protein only if locally preferred", "Seasonings you already use"] },
      { title: "Fresh produce", items: [...localIngredients.slice(0, 6), longerShopping ? "Firm produce that stores better between trips" : "Fresh items in quantities you can use"] },
      { title: "Protein choices", items: ["A locally available protein you enjoy", "Eggs, fish, tofu, dairy, or another option that fits your dietary notes", "A shelf-stable backup for days with limited shopping or power"] },
      { title: "Drinks and extras", items: ["Safe drinking water", "Fruit, citrus, ginger, herbs, or tea for simple drinks", "Ice or a cooler only when available and safe to use"] },
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
