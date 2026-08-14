import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FoodCountry } from "@/lib/food-catalogue";
import { locationRecipeWeeks } from "./location-recipes";

export type ShoppingFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type MealFrequency = "one_plus_snack" | "two" | "three";
export type ServingSize = "lighter" | "regular" | "generous";
export type WorkoutDifficulty = "beginner" | "intermediate" | "advanced";
export type WorkoutInstructorOption = { kind: "man" | "woman"; label: string; name: string; videoTitle: string; videoUrl: string; videoProvider: string };
export type WorkoutResourceDemonstration = { resource: "Chair" | "Resistance band" | "Weights or filled bottles"; title: string; videoUrl: string; videoProvider: string };
export type SweetToothPreference = "none" | "healthier_swaps" | "portion_guidance";
export type WellnessGoal = "consistency" | "energy" | "toning" | "core_mobility" | "body_composition" | "weight_loss" | "weight_gain" | null;
export type MeasurementUnit = "ft_in_kg" | "cm_lb";
export type ProgressPhotoAngle = "front" | "side" | "back";
export type CityRecipeRating = { recipeTitle: string; score: 1 | 2 | 3 | 4 | 5; ratedAt: string };

export type UserProfile = {
  city: string;
  country: FoodCountry;
  electricityHoursPerDay: number;
  marketMinutesAway: number;
  shoppingFrequency: ShoppingFrequency | null;
  kitchenEquipment: string[];
  otherKitchenEquipment: string[];
  favoriteMeals: string[];
  excludedRecipeTitles: string[];
  favoriteFruits: string[];
  localIngredients: string[];
  dietaryNotes: string;
  dietaryRestrictions: string[];
  dislikedFoods: string[];
  mealFrequency: MealFrequency;
  servingSize: ServingSize;
  rotationWeek: 1 | 2;
  sweetToothPreference: SweetToothPreference;
  dailyStepCount: number;
  aspirationalStepTarget: number;
  workoutMinutesPerDay: number;
  workoutDifficulty: WorkoutDifficulty;
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
  recipeRatings?: CityRecipeRating[];
};

export type MealDay = {
  day: number;
  label: string;
  sourceTitle?: string;
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
  resourcesUsed: string[];
  resourceRationale: string;
  resourceDemonstrations: WorkoutResourceDemonstration[];
  videoAvailable: boolean;
  videoTitle: string;
  videoUrl: string;
  videoProvider: string;
  difficulty: WorkoutDifficulty;
  instructorOptions: WorkoutInstructorOption[];
};

export type ShoppingGroup = {
  title: string;
  items: string[];
};

export type WeeklyPlan = {
  rotationLabel: string;
  goalTitle: string;
  goalMessage: string;
  safetyNote: string;
  electricityNote: string;
  meals: MealDay[];
  breakfastMeals: MealDay[];
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
export type ReminderWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ReminderSchedule = { time: string | null; weekdays: ReminderWeekday[]; enabled: boolean; notificationIds: string[] };
export type ReminderQuoteId = "steady" | "kind" | "real_life" | "custom";
export type PlannedSessionReminder = { workout: ReminderSchedule; meal: ReminderSchedule; pauseUntil: string | null; quoteId: ReminderQuoteId; customQuote: string; updatedAt: string };
export type DailyWaterLog = { date: string; millilitres: number };
export type GroceryChecklistItem = { key: string; checked: boolean };
export type LocalExerciseLog = { id: string; workoutId: string; exerciseName: string; setNumber: number; repCount: number; weightUsedKg: number | null; loggedAt: string };
export type CompletionRating = { completionKey: string; rating: 1 | 2 | 3 | 4 | 5; ratedAt: string };
export type TodayUnavailableResources = { date: string; resources: string[] };
export type TodayResourceSubstitution = { unavailableResource: string; substituteResource: string; chosenAt: string };
export type TodayResourceSubstitutions = { date: string; substitutions: TodayResourceSubstitution[] };
export type WorkoutSessionPreview = { label: string; durationMinutes: number; equipment: string[]; setupChecks: string[] };
export type LocalResourceChangeFeedback = { id: string; changeContext: string; outcome: "helpful" | "needs_adjustment"; note: string; createdAt: string; synced: boolean };

export const profileStorageKey = "rootedfit.profile.v2";
const legacyProfileStorageKey = "rootedfit.profile.v1";
export const checkInsStorageKey = "rootedfit.check-ins.v1";
export const measurementsStorageKey = "rootedfit.measurements.v1";
export const progressPhotosStorageKey = "rootedfit.progress-photos.v1";
export const mealSwapsStorageKey = "rootedfit.meal-swaps.v1";
export const workoutSessionsStorageKey = "rootedfit.workout-sessions.v1";
export const plannedSessionReminderStorageKey = "rootedfit.planned-session-reminder.v1";
export const reminderQuoteOptions: { id: Exclude<ReminderQuoteId, "custom">; label: string; text: string }[] = [
  { id: "steady", label: "Steady progress", text: "A small action today is enough." },
  { id: "kind", label: "Self-kindness", text: "Meet today with patience, not pressure." },
  { id: "real_life", label: "Real-life routine", text: "Choose the version of the plan that fits your day." },
];
export const waterLogsStorageKey = "rootedfit.water-logs.v1";
export const groceryChecklistStorageKey = "rootedfit.grocery-checklist.v1";
export const exerciseLogsStorageKey = "rootedfit.exercise-logs.v1";
export const completionRatingsStorageKey = "rootedfit.completion-ratings.v1";
export const todayUnavailableResourcesStorageKey = "rootedfit.today-unavailable-resources.v1";
export const todayResourceSubstitutionsStorageKey = "rootedfit.today-resource-substitutions.v1";
export const resourceChangeFeedbackStorageKey = "rootedfit.resource-change-feedback.v1";

export const emptyProfile: UserProfile = {
  city: "",
  country: "Nigeria",
  electricityHoursPerDay: 0,
  marketMinutesAway: 0,
  shoppingFrequency: null,
  kitchenEquipment: [],
  otherKitchenEquipment: [],
  favoriteMeals: [],
  excludedRecipeTitles: [],
  favoriteFruits: [],
  localIngredients: [],
  dietaryNotes: "",
  dietaryRestrictions: [],
  dislikedFoods: [],
  mealFrequency: "three",
  servingSize: "regular",
  rotationWeek: 1,
  sweetToothPreference: "none",
  dailyStepCount: 0,
  aspirationalStepTarget: 0,
  workoutMinutesPerDay: 0,
  workoutDifficulty: "beginner",
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
  recipeRatings: [],
};

function normaliseProfile(profile: Partial<UserProfile>): UserProfile {
  const legacyMeasurementUnit = (profile as { measurementUnit?: string }).measurementUnit;
  return {
    ...emptyProfile,
    ...profile,
    kitchenEquipment: profile.kitchenEquipment ?? [],
    otherKitchenEquipment: profile.otherKitchenEquipment ?? [],
    favoriteMeals: profile.favoriteMeals ?? [],
    excludedRecipeTitles: profile.excludedRecipeTitles ?? [],
    favoriteFruits: profile.favoriteFruits ?? [],
    localIngredients: profile.localIngredients ?? [],
    dietaryRestrictions: profile.dietaryRestrictions ?? [],
    dislikedFoods: profile.dislikedFoods ?? [],
    workoutResources: profile.workoutResources ?? [],
    otherWorkoutResources: profile.otherWorkoutResources ?? [],
    secondaryFocuses: profile.secondaryFocuses ?? [],
    servingSize: profile.servingSize === "lighter" || profile.servingSize === "generous" ? profile.servingSize : "regular",
    workoutDifficulty: profile.workoutDifficulty === "intermediate" || profile.workoutDifficulty === "advanced" ? profile.workoutDifficulty : "beginner",
    rotationWeek: profile.rotationWeek === 2 ? 2 : 1,
    recipeRatings: Array.isArray(profile.recipeRatings) ? profile.recipeRatings.filter((entry): entry is CityRecipeRating => typeof entry?.recipeTitle === "string" && [1, 2, 3, 4, 5].includes(entry.score)).slice(0, 120) : [],
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

function remapMeasuredPortions(item: string, mapping: Record<string, string>) {
  return item.replace(/2 cups|1½ cups|1¼ cups|1 cup|¾ cup|½ cup|¼ cup|2 tablespoons|1 tablespoon|1 teaspoon|2 eggs|1 egg|2 thick slices|1 thick slice|1 chapati|1 small sweet potato|1 palm-sized (?:chicken|fish) portion/g, (portion) => mapping[portion] ?? portion);
}

function applyServingPreference(items: string[], servingSize: ServingSize) {
  if (servingSize === "lighter") return items.map((item) => remapMeasuredPortions(item, {
    "2 cups": "1½ cups", "1½ cups": "1¼ cups", "1¼ cups": "1 cup", "1 cup": "¾ cup", "¾ cup": "½ cup", "½ cup": "⅓ cup", "¼ cup": "2 tablespoons",
    "2 tablespoons": "1 tablespoon", "1 tablespoon": "2 teaspoons", "1 teaspoon": "½ teaspoon", "2 eggs": "1 egg", "2 thick slices": "1 thick slice", "1 chapati": "½ chapati", "1 small sweet potato": "½ small sweet potato", "1 palm-sized chicken portion": "1 smaller chicken portion", "1 palm-sized fish portion": "1 smaller fish portion",
  }));
  if (servingSize === "generous") return items.map((item) => remapMeasuredPortions(item, {
    "2 cups": "3 cups", "1½ cups": "2 cups", "1¼ cups": "1½ cups", "1 cup": "1¼ cups", "¾ cup": "1 cup", "½ cup": "¾ cup", "¼ cup": "½ cup",
    "2 tablespoons": "3 tablespoons", "1 tablespoon": "1½ tablespoons", "1 teaspoon": "1½ teaspoons", "1 egg": "2 eggs", "2 thick slices": "3 thick slices", "1 thick slice": "2 thick slices", "1 chapati": "1½ chapati", "1 small sweet potato": "1½ small sweet potatoes", "1 palm-sized chicken portion": "1½ palm-sized chicken portions", "1 palm-sized fish portion": "1½ palm-sized fish portions",
  }));
  return items;
}

function focusMealDetails(goal: WellnessGoal, items: string[]) {
  if (goal === "weight_loss") return { titlePrefix: "Weight-loss plate — ", note: "A lighter staple portion with a larger vegetable side keeps this familiar meal practical and filling.", ingredients: [...items, "2 cups leafy greens, cabbage, carrot, cucumber, or other available vegetables"] };
  if (goal === "weight_gain") return { titlePrefix: "Weight-gain plate — ", note: "A fuller staple portion plus a planned energy-supporting addition makes this meal visibly more substantial.", ingredients: [...items, "1 energy-supporting add-on: groundnuts, yoghurt, milk, avocado, beans, or seeds if suitable"] };
  if (goal === "toning") return { titlePrefix: "Protein-focused plate — ", note: "Keep the familiar staple and make the protein component deliberate for this meal.", ingredients: [...items, "1 clear protein portion: beans, egg, fish, chicken, tofu, or another preferred option"] };
  if (goal === "energy") return { titlePrefix: "Steady-energy plate — ", note: "Pair the familiar meal with an available fruit or vegetable side for a practical routine.", ingredients: [...items, "1 available fruit or vegetable side"] };
  return { titlePrefix: "", note: "Keep the portion practical for your day and use the ingredients you genuinely have.", ingredients: items };
}

export function formatGroceryListExport(plan: WeeklyPlan, city = "your area") {
  const groups = plan.shoppingGroups.map((group) => `${group.title}\n${group.items.map((item) => `□ ${item}`).join("\n")}`).join("\n\n");
  return `ROOTEDFIT GROCERY LIST\n${plan.rotationLabel}\nPlan area: ${city || "your area"}\n\n${groups}\n\nBuilt from the recipes in this local plan. Choose quantities that fit your household, storage, and shopping rhythm.`;
}

export function formatGroceryChecklistPrintHtml(plan: WeeklyPlan, city = "your area", checkedItems: string[] = []) {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const groups = plan.shoppingGroups.map((group) => `<section><h2>${escape(group.title)}</h2><ul>${group.items.map((item) => `<li>${checkedItems.includes(item) ? "☑" : "☐"} ${escape(item)}</li>`).join("")}</ul></section>`).join("");
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>@page{margin:22px}body{font-family:Arial,sans-serif;color:#1f2a25}h1{color:#2d6a4f;margin-bottom:4px}p{color:#526259}h2{font-size:15px;border-bottom:1px solid #dce6db;padding-bottom:5px;margin-top:20px}ul{list-style:none;padding:0}li{font-size:14px;line-height:1.65}</style></head><body><h1>RootedFit grocery checklist</h1><p>${escape(plan.rotationLabel)} · ${escape(city || "Your area")}</p>${groups}</body></html>`;
}

export function findSimilarRecipe(plan: WeeklyPlan, sourceTitle: string, breakfast: boolean) {
  const pool = breakfast ? plan.breakfastMeals : plan.meals;
  if (pool.length < 2) return null;
  const currentIndex = Math.max(0, pool.findIndex((meal) => meal.sourceTitle === sourceTitle));
  for (let offset = 1; offset < pool.length; offset += 1) {
    const candidate = pool[(currentIndex + offset) % pool.length];
    if (candidate.sourceTitle !== sourceTitle) return candidate;
  }
  return null;
}

export function categorizeGroceryItems(items: string[]): ShoppingGroup[] {
  const categories: Record<string, string[]> = {
    "Fruit & vegetables": [],
    "Protein, beans & dairy": [],
    "Grains, roots & bread": [],
    "Oils, herbs & pantry": [],
    "Other recipe items": [],
  };
  const rules: { title: keyof typeof categories; pattern: RegExp }[] = [
    { title: "Fruit & vegetables", pattern: /tomato|onion|pepper|cabbage|carrot|spinach|greens|ugu|efo|kontomire|kale|sukuma|cucumber|plantain|yam|sweet potato|fruit|mango|orange|banana|avocado|scent leaf|parsley|garlic/i },
    { title: "Protein, beans & dairy", pattern: /egg|chicken|fish|catfish|beans|lentil|tofu|yoghurt|milk|groundnut|seeds|crayfish/i },
    { title: "Grains, roots & bread", pattern: /rice|oats|bread|chapati|flatbread|semo|pap|maize|flour|yam|plantain|potato/i },
    { title: "Oils, herbs & pantry", pattern: /oil|curry|thyme|salt|spice|cumin|coriander|ginger|chili|groundnut paste/i },
  ];
  items.forEach((item) => {
    const category = rules.find((rule) => rule.pattern.test(item))?.title ?? "Other recipe items";
    categories[category].push(item);
  });
  return Object.entries(categories).filter(([, categoryItems]) => categoryItems.length > 0).map(([title, categoryItems]) => ({ title, items: categoryItems }));
}

/** Turns preparation amounts into realistic purchase units for the weekly household list. */
export function practicalGroceryItems(recipeIngredients: string[]) {
  const purchaseRules: { pattern: RegExp; item: string }[] = [
    { pattern: /tomato/i, item: "Tomatoes — 6–8 medium" }, { pattern: /onion/i, item: "Onions — 5–6 medium" }, { pattern: /bell pepper|fresh pepper/i, item: "Bell peppers or fresh peppers — 2–3 whole" }, { pattern: /cucumber/i, item: "Cucumbers — 2 whole" }, { pattern: /carrot/i, item: "Carrots — 4–6 whole" }, { pattern: /cabbage/i, item: "Cabbage — 1 small head" }, { pattern: /spinach|greens|ugu|efo|kontomire|kale|sukuma/i, item: "Leafy greens — 1 medium bunch or bag" }, { pattern: /plantain/i, item: "Ripe plantains — 2–3 whole" }, { pattern: /sweet potato/i, item: "Sweet potatoes — 2–3 small" }, { pattern: /yam/i, item: "Yam — 1 small tuber or a cut market portion" }, { pattern: /fruit|mango|orange|banana|avocado/i, item: "Fruit — 4–6 pieces" },
    { pattern: /rice/i, item: "Rice — 1 kg or a smaller bag" }, { pattern: /beans|lentil|cow beans|black-eyed/i, item: "Beans or lentils — 500 g or 1 small bag" }, { pattern: /egg/i, item: "Eggs — 1 half-dozen or a tray" }, { pattern: /chicken/i, item: "Chicken — 4–6 palm-sized portions" }, { pattern: /catfish|fish/i, item: "Fish — 4–6 portions or a small market pack" }, { pattern: /tofu/i, item: "Firm tofu — 1 block" }, { pattern: /yoghurt/i, item: "Plain yoghurt — 1 small tub" }, { pattern: /milk/i, item: "Milk or fortified soy milk — 1 small carton" }, { pattern: /oats/i, item: "Oats — 1 small bag or packet" }, { pattern: /bread/i, item: "Bread — 1 small loaf" }, { pattern: /chapati|flatbread/i, item: "Chapati or flatbread — 1 small pack" }, { pattern: /pap/i, item: "Pap or cereal base — 1 small pack" }, { pattern: /maize flour|maize/i, item: "Maize flour or maize — 1 small bag or pack" }, { pattern: /semo/i, item: "Semo — 1 small bag" }, { pattern: /groundnut paste/i, item: "Groundnut paste — 1 small jar or sachet" }, { pattern: /groundnut|seeds/i, item: "Groundnuts or seeds — 1 small packet" }, { pattern: /oil/i, item: "Cooking oil — 1 small bottle" }, { pattern: /curry|thyme|spice|cumin|coriander|ginger|chili|crayfish/i, item: "Spices and seasonings — check your kitchen or buy small sachets" },
  ];
  const mapped = recipeIngredients.map((ingredient) => purchaseRules.find((rule) => rule.pattern.test(ingredient))?.item ?? ingredient.replace(/^\s*(?:\d+(?:[¼½¾⅓⅔]?|[½¼¾])?|a)\s*(?:cups?|tablespoons?|teaspoons?|slices?|portions?)\s*/i, "").replace(/^\s*[¼½¾⅓⅔]\s*/, ""));
  return Array.from(new Set(mapped.filter(Boolean)));
}

type WorkoutTemplate = Omit<WorkoutDay, "day" | "label" | "durationMinutes" | "adaptation" | "difficulty" | "instructorOptions" | "resourceRationale" | "resourceDemonstrations" | "videoAvailable">;

type HomeWorkoutResources = {
  hasMat: boolean;
  hasChair: boolean;
  hasBand: boolean;
  hasWeights: boolean;
  hasStairs: boolean;
  hasRope: boolean;
  hasOutdoorRoute: boolean;
  hasFloorSpace: boolean;
  canStream: boolean;
};

function workoutResourceFlags(profile: UserProfile): HomeWorkoutResources {
  const selected = profile.workoutResources;
  const notes = profile.otherWorkoutResources.join(" ").toLowerCase();
  return {
    hasMat: selected.includes("Yoga mat") || /mat|rug|towel/.test(notes),
    hasChair: selected.includes("Chair") || /chair|bench|stool/.test(notes),
    hasBand: selected.includes("Resistance band") || /resistance band|loop band|elastic band/.test(notes),
    hasWeights: selected.includes("Weights or filled bottles") || /weight|dumbbell|kettlebell|filled bottle|water bottle|backpack|water jug/.test(notes),
    hasStairs: selected.includes("Stairs or a sturdy step") || /stairs|stair|step/.test(notes),
    hasRope: selected.includes("Skipping rope") || /skipping rope|jump rope/.test(notes),
    hasOutdoorRoute: selected.includes("Outdoor walking route") || /outdoor|park|walk route|walking route/.test(notes),
    hasFloorSpace: selected.includes("Safe floor space") || /floor space|clear space/.test(notes),
    canStream: selected.includes("Internet for video workouts"),
  };
}

function movementAdaptation(profile: UserProfile) {
  const parts: string[] = [];
  if (profile.workoutResources.includes("Yoga mat")) parts.push("Use your mat for floor work.");
  if (profile.workoutResources.includes("Chair")) parts.push("Use a chair for supported sit-to-stands or incline work.");
  if (profile.workoutResources.includes("Resistance band")) parts.push("Add a band only where it feels controlled.");
  if (profile.workoutResources.includes("Weights or filled bottles")) parts.push("Filled bottles can add a light load.");
  return parts.length ? parts.join(" ") : "Bodyweight and a small clear space are enough for this session.";
}

function resourceRationale(profile: UserProfile, resources: HomeWorkoutResources) {
  const matched = [
    resources.hasMat && "Yoga mat or soft floor surface",
    resources.hasChair && "Chair support",
    resources.hasBand && "Resistance band",
    resources.hasWeights && "Weights, filled bottles, or a backpack",
    resources.hasStairs && "Stairs or a sturdy step",
    resources.hasRope && "Skipping rope",
    resources.hasOutdoorRoute && "Outdoor walking route",
  ].filter(Boolean) as string[];
  const otherResources = profile.otherWorkoutResources.length ? ` You also noted ${sentenceList(profile.otherWorkoutResources, "other home resources")}.` : "";
  return matched.length ? `Your selected setup changes the movement choices through ${sentenceList(matched, "your available resources")}.${otherResources}` : `No dedicated equipment was selected, so this week uses bodyweight movements and a small clear space.${otherResources}`;
}

function resourceDemonstrationsFor(resourcesUsed: string[]): WorkoutResourceDemonstration[] {
  const joined = resourcesUsed.join(" ").toLowerCase();
  const demonstrations: WorkoutResourceDemonstration[] = [];
  if (joined.includes("chair")) demonstrations.push({ resource: "Chair", title: "Full Body Chair Workout", videoUrl: "https://www.youtube.com/watch?v=gD14hSNBT7M", videoProvider: "East London NHS Foundation Trust" });
  if (joined.includes("resistance band")) demonstrations.push({ resource: "Resistance band", title: "15 min Resistance Band Workout · Full Body", videoUrl: "https://www.youtube.com/watch?v=tONvKzIiqqw", videoProvider: "fitbymik" });
  if (joined.includes("weights") || joined.includes("bottles") || joined.includes("backpack")) demonstrations.push({ resource: "Weights or filled bottles", title: "Full Body Water Bottle Workout · At Home", videoUrl: "https://www.youtube.com/watch?v=bGXIt8zR3os", videoProvider: "Coach Mere" });
  return demonstrations;
}

function buildResourceAwareWorkoutTemplates(profile: UserProfile, rounds: number): WorkoutTemplate[] {
  const resources = workoutResourceFlags(profile);
  const strength = resources.hasWeights
    ? { title: "Loaded home strength: bottle or backpack foundation", category: "Strength with home load", resourcesUsed: ["Weights, filled bottles, or backpack"], instructions: [`Warm up for 3 minutes: march in place, shoulder rolls, and hip circles.`, `Complete ${rounds} controlled rounds: 10 bottle-loaded squats, 8 bent-over bottle rows per side, 8 standing bottle presses, and 12 calf raises.`, "Set the load down between sets and finish with 2 minutes of relaxed stretching."] }
    : resources.hasBand
      ? { title: "Resistance-band strength: full-body foundation", category: "Strength with band", resourcesUsed: ["Resistance band"], instructions: ["Warm up for 3 minutes: march in place, shoulder rolls, and hip circles.", `Complete ${rounds} controlled rounds: 10 banded squats, 10 standing-on-band rows, 8 standing-on-band presses, and 12 calf raises.`, "Inspect the band first, move slowly, and never release it while it is under tension."] }
      : resources.hasChair
        ? { title: "Chair-supported strength: full-body foundation", category: "Supported strength", resourcesUsed: ["Chair"], instructions: ["Use a solid, stable, non-wheeled chair on a surface where it will not slide.", `Complete ${rounds} controlled rounds: 10 chair sit-to-stands, 8 chair incline presses, 10 hip hinges, and 12 calf raises using the chair for support.`, "Rest for 45–60 seconds between rounds and finish with 2 minutes of relaxed stretching."] }
        : { title: "Bodyweight strength: full-body foundation", category: "Strength & toning", resourcesUsed: ["No equipment"], instructions: ["Warm up for 3 minutes: march in place, shoulder rolls, and hip circles.", `Complete ${rounds} rounds: 10 bodyweight squats, 8 wall or floor push-ups, 10 hip hinges, and 12 calf raises.`, "Rest for 45–60 seconds between rounds and finish with 2 minutes of relaxed stretching."] };
  const core = resources.hasMat
    ? { title: "Mat-based core: control block", category: "Core on the mat", resourcesUsed: ["Yoga mat or soft floor surface"], instructions: ["Spend 3 minutes on slow breathing, pelvic tilts, and gentle spinal mobility on your mat.", `Complete ${rounds} rounds: 8 heel taps per side, 8 dead-bug reaches per side, and a 20-second supported tabletop hold.`, "Finish with 6 slow cat-cow movements and a side-body stretch."] }
    : resources.hasChair
      ? { title: "Chair-based core: upright control block", category: "Seated core & posture", resourcesUsed: ["Chair"], instructions: ["Sit tall on a solid, stable chair and spend 3 minutes on slow breathing and shoulder rolls.", `Complete ${rounds} rounds: 8 seated knee lifts per side, 8 seated cross-body reaches per side, and a 20-second tall seated brace.`, "Finish with 6 slow seated spinal rolls and a side-body stretch."] }
      : { title: "Standing core: small-space control block", category: "Core & control", resourcesUsed: ["No equipment"], instructions: ["Spend 3 minutes on slow breathing, standing pelvic tilts, and gentle spinal mobility.", `Complete ${rounds} rounds: 8 standing knee drives per side, 8 slow cross-body reaches per side, and a 20-second tall standing brace.`, "Finish with 6 slow spinal rolls and a side-body stretch."] };
  const cardio = resources.hasOutdoorRoute
    ? { title: "Outdoor walking rhythm: step builder", category: "Outdoor steps & stamina", resourcesUsed: ["Outdoor walking route"], instructions: ["Start with 3 minutes at an easy outdoor walking pace.", `Alternate 2 minutes steady walking with 1 minute brisk walking for ${Math.max(4, Math.floor(profile.workoutMinutesPerDay / 3))} cycles.`, "Cool down for 3 minutes and stretch calves and ankles gently."] }
    : resources.hasRope
      ? { title: "Skipping-rope rhythm: cardio builder", category: "Rope cardio", resourcesUsed: ["Skipping rope"], instructions: ["Warm up with 3 minutes of easy marching, step touches, and ankle circles.", `Alternate 30 seconds easy rope skips or rope turns with 30 seconds marching for ${Math.max(6, Math.floor(profile.workoutMinutesPerDay / 2))} cycles.`, "Finish with slow breathing and gentle calf stretches."] }
      : resources.hasStairs
        ? { title: "Stair-step rhythm: cardio builder", category: "Steps & stamina", resourcesUsed: ["Stairs or a sturdy step"], instructions: ["Start with 3 minutes of easy marching beside the lowest sturdy step.", `Alternate 45 seconds controlled step-ups with 45 seconds easy marching for ${Math.max(5, Math.floor(profile.workoutMinutesPerDay / 2))} cycles.`, "Use a handrail if available, stay at a steady pace, and cool down with ankle stretches."] }
        : { title: "Small-space rhythm: indoor cardio builder", category: "Steps & stamina", resourcesUsed: ["Safe floor space"], instructions: ["Start with 3 minutes at an easy marching pace in a clear space.", `Alternate 2 minutes steady marching with 1 minute brisk higher-knee marching for ${Math.max(4, Math.floor(profile.workoutMinutesPerDay / 3))} cycles.`, "Cool down for 3 minutes and stretch calves and ankles gently."] };
  const mobility = resources.hasMat
    ? { title: "Mat mobility reset: hips, back, shoulders", category: "Floor mobility & posture", resourcesUsed: ["Yoga mat or soft floor surface"], instructions: ["Use your mat for 6 shoulder rolls, 6 neck turns, and 8 ankle circles per side.", `Complete ${rounds} slow rounds: 8 cat-cow movements, 8 hip openers per side, and 8 prone or kneeling arm reaches.`, "Finish with 60 seconds of comfortable breathing and a supported forward fold."] }
    : resources.hasChair
      ? { title: "Chair mobility reset: hips, back, shoulders", category: "Supported mobility", resourcesUsed: ["Chair"], instructions: ["Use a stable chair for 6 shoulder rolls, 6 neck turns, and 8 ankle circles per side.", `Complete ${rounds} slow rounds: 8 chair-supported squats, 8 seated hip openers per side, and 8 seated wall or chair slides.`, "Finish with 60 seconds of comfortable breathing and a seated forward fold."] }
      : { title: "Standing mobility reset: hips, back, shoulders", category: "Mobility & posture", resourcesUsed: ["No equipment"], instructions: ["Move through 6 shoulder rolls, 6 neck turns, and 8 ankle circles per side.", `Complete ${rounds} slow rounds: 8 supported squats, 8 standing hip openers per side, and 8 wall slides.`, "Finish with 60 seconds of comfortable breathing and a supported forward fold."] };
  const lowerBody = resources.hasWeights
    ? { title: "Loaded lower-body and balance block", category: "Strength with home load", resourcesUsed: ["Weights, filled bottles, or backpack"], instructions: ["Warm up near a stable chair or wall for support.", `Complete ${rounds} rounds: 10 loaded squats, 8 loaded reverse lunges per side, 10 loaded hip hinges, and 10 calf raises.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."] }
    : resources.hasBand
      ? { title: "Banded lower-body and balance block", category: "Strength with band", resourcesUsed: ["Resistance band"], instructions: ["Warm up near a stable chair or wall for support.", `Complete ${rounds} rounds: 10 banded squats, 10 banded side steps per side, 10 banded hip hinges, and 10 calf raises.`, "Inspect the band first and finish with one 20-second supported single-leg balance per side if it feels steady."] }
      : resources.hasStairs
        ? { title: "Step-based lower-body and balance block", category: "Step strength & balance", resourcesUsed: ["Stairs or a sturdy step"], instructions: ["Warm up beside the lowest sturdy step, using a rail if available.", `Complete ${rounds} rounds: 8 controlled step-ups per side, 10 side steps per side, 10 standing hip extensions, and 10 calf raises.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."] }
        : resources.hasChair
          ? { title: "Chair-supported lower-body and balance block", category: "Supported strength & balance", resourcesUsed: ["Chair"], instructions: ["Warm up beside a solid, stable chair for support.", `Complete ${rounds} rounds: 10 sit-to-stands, 10 side steps per side, 10 standing hip extensions, and 10 calf raises with chair support.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."] }
          : { title: "Bodyweight lower-body and balance block", category: "Strength & balance", resourcesUsed: ["No equipment"], instructions: ["Warm up near a wall for support if useful.", `Complete ${rounds} rounds: 10 bodyweight squats, 10 side steps per side, 10 standing hip extensions, and 10 calf raises.`, "Finish with one 20-second supported single-leg balance per side, only if it feels steady."] };
  const variety = resources.hasRope
    ? { title: "Rope interval mix: short cardio circuit", category: "Rope cardio", resourcesUsed: ["Skipping rope"], instructions: ["Use 3 minutes of easy rope turns, marching, and step touches to warm up.", `Complete ${rounds} rounds: 30 seconds easy rope skips or turns, 30 seconds shadow boxing, 30 seconds step touches, then 30 seconds easy recovery.`, "Finish with 2 minutes of slow breathing and shoulder/leg stretches."] }
    : resources.hasStairs
      ? { title: "Step interval mix: short cardio circuit", category: "Step cardio", resourcesUsed: ["Stairs or a sturdy step"], instructions: ["Use 3 minutes of easy marching and step touches to warm up.", `Complete ${rounds} rounds: 30 seconds controlled step-ups, 30 seconds shadow boxing, 30 seconds step touches, then 30 seconds easy recovery.`, "Finish with 2 minutes of slow breathing and shoulder/leg stretches."] }
      : resources.hasBand
        ? { title: "Resistance-band mix: full-body circuit", category: "Strength with band", resourcesUsed: ["Resistance band"], instructions: ["Use 3 minutes of easy marching and shoulder rolls to warm up.", `Complete ${rounds} rounds: 10 band rows, 10 band squats, 8 band presses, then 30 seconds easy recovery.`, "Move slowly, inspect the band before use, and finish with 2 minutes of relaxed stretching."] }
        : { title: "Small-space cardio: no-equipment mix", category: "Movement variety", resourcesUsed: [resources.hasFloorSpace ? "Safe floor space" : "No equipment"], instructions: ["Use 3 minutes of easy marching and step touches to warm up.", `Complete ${rounds} rounds: 45 seconds marching, 45 seconds step touches, 45 seconds shadow boxing, then 45 seconds easy recovery.`, "Finish with 2 minutes of slow breathing and shoulder/leg stretches."] };
  const recovery = resources.hasMat
    ? { title: "Mat recovery flow: restore and reset", category: "Recovery on the mat", resourcesUsed: ["Yoga mat or soft floor surface"], instructions: ["Choose your mat or a soft floor surface and take 6 slow breaths.", "Move gently through 8 cat-cow movements, 8 hip circles per side, and 30 seconds of a comfortable child’s pose.", "Finish with one sentence about what made movement possible today; no performance target is needed."] }
    : resources.hasChair
      ? { title: "Chair recovery flow: restore and reset", category: "Seated recovery & mobility", resourcesUsed: ["Chair"], instructions: ["Sit tall on a stable chair and take 6 slow breaths.", "Move gently through 8 seated spinal rolls, 8 seated hip circles per side, and 30 seconds of a comfortable chair fold.", "Finish with one sentence about what made movement possible today; no performance target is needed."] }
      : { title: "Standing recovery flow: restore and reset", category: "Recovery & mobility", resourcesUsed: ["No equipment"], instructions: ["Choose a calm space and take 6 slow breaths.", "Move gently through 8 standing spinal rolls, 8 hip circles per side, and 30 seconds of a comfortable forward fold.", "Finish with one sentence about what made movement possible today; no performance target is needed."] };

  const videoDetails = [
    ["30 MIN FULL BODY WORKOUT · At-Home Pilates", "https://www.youtube.com/watch?v=lBCBSy9cNT0", "Move With Nicole"],
    ["30 MIN PILATES CORE WORKOUT · At-Home Pilates Abs", "https://www.youtube.com/watch?v=U5LwQW_IQOc", "Move With Nicole"],
    ["30-Minute Yoga For Beginners", "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", "Yoga With Adriene"],
    ["30-Minute Yoga For Beginners", "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", "Yoga With Adriene"],
    ["30 MIN ABS & BOOTY WORKOUT · No Equipment", "https://www.youtube.com/watch?v=MvSK7dBbt8Q", "Move With Nicole"],
    ["30 MIN ABS & BOOTY · No Equipment", "https://www.youtube.com/watch?v=pKhKqYBP7qQ", "YouTube"],
    ["30-Minute Yoga For Beginners", "https://www.youtube.com/watch?v=AB3Y-4a3ZrU", "Yoga With Adriene"],
  ] as const;
  return [strength, core, cardio, mobility, lowerBody, variety, recovery].map((template, index) => ({ ...template, videoTitle: videoDetails[index][0], videoUrl: videoDetails[index][1], videoProvider: videoDetails[index][2] }));
}

function difficultyAdaptation(difficulty: WorkoutDifficulty) {
  if (difficulty === "advanced") {
    return { label: "Advanced", instruction: "Advanced option: only when movement remains controlled, add one extra round or two careful repetitions per exercise; stop before form breaks down.", durationAdjustment: 5 };
  }
  if (difficulty === "intermediate") {
    return { label: "Intermediate", instruction: "Intermediate option: use the listed rounds and repetitions at a smooth, controlled pace, resting whenever form needs it.", durationAdjustment: 0 };
  }
  return { label: "Beginner", instruction: "Beginner option: start with one controlled round, use a smaller range or more support when useful, and build only when it feels steady.", durationAdjustment: -5 };
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
  await AsyncStorage.multiRemove([profileStorageKey, legacyProfileStorageKey, checkInsStorageKey, measurementsStorageKey, progressPhotosStorageKey, mealSwapsStorageKey, workoutSessionsStorageKey, plannedSessionReminderStorageKey, waterLogsStorageKey, groceryChecklistStorageKey, exerciseLogsStorageKey, completionRatingsStorageKey, todayUnavailableResourcesStorageKey, todayResourceSubstitutionsStorageKey, resourceChangeFeedbackStorageKey]);
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

export function normaliseReminderTime(value: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function normaliseReminderWeekdays(values: number[]): ReminderWeekday[] {
  return Array.from(new Set(values.filter((value): value is ReminderWeekday => Number.isInteger(value) && value >= 1 && value <= 7))).sort((a, b) => a - b);
}

export const defaultReminderSchedule = (): ReminderSchedule => ({ time: null, weekdays: [2, 3, 4, 5, 6], enabled: false, notificationIds: [] });
export const defaultPlannedSessionReminder = (): PlannedSessionReminder => ({ workout: defaultReminderSchedule(), meal: defaultReminderSchedule(), pauseUntil: null, quoteId: "steady", customQuote: "", updatedAt: "" });

function normaliseReminderSchedule(value: Partial<ReminderSchedule> & { notificationId?: string | null }): ReminderSchedule {
  const notificationIds = Array.isArray(value.notificationIds) ? value.notificationIds.filter((item): item is string => typeof item === "string") : value.notificationId ? [value.notificationId] : [];
  return { time: value.time ? normaliseReminderTime(value.time) : null, weekdays: Array.isArray(value.weekdays) ? normaliseReminderWeekdays(value.weekdays) : [2, 3, 4, 5, 6], enabled: Boolean(value.enabled), notificationIds };
}

export function reminderMotivationText(reminder: Pick<PlannedSessionReminder, "quoteId" | "customQuote">): string {
  const custom = reminder.customQuote.trim();
  if (reminder.quoteId === "custom" && custom) return custom;
  return reminderQuoteOptions.find((option) => option.id === reminder.quoteId)?.text ?? reminderQuoteOptions[0].text;
}

export function oneWeekReminderPauseUntil(reference = new Date()): string {
  const until = new Date(reference);
  until.setDate(until.getDate() + 7);
  return until.toISOString();
}

export function isReminderPauseActive(pauseUntil: string | null, reference = new Date()): boolean {
  return Boolean(pauseUntil && new Date(pauseUntil).getTime() > reference.getTime());
}

export function rotatingIndexForDate(date: string, length: number): number {
  if (length <= 0) return 0;
  const [year, month, day] = date.split("-").map(Number);
  const timestamp = Date.UTC(year || 1970, (month || 1) - 1, day || 1);
  return Math.abs(Math.floor(timestamp / 86_400_000)) % length;
}

export async function loadPlannedSessionReminder(): Promise<PlannedSessionReminder> {
  const saved = await AsyncStorage.getItem(plannedSessionReminderStorageKey);
  if (!saved) return defaultPlannedSessionReminder();
  try {
    const entry = JSON.parse(saved) as Partial<PlannedSessionReminder> & Partial<ReminderSchedule> & { notificationId?: string | null };
    const workout = normaliseReminderSchedule(entry.workout ?? entry);
    const meal = normaliseReminderSchedule(entry.meal ?? {});
    const quoteId: ReminderQuoteId = entry.quoteId === "kind" || entry.quoteId === "real_life" || entry.quoteId === "custom" ? entry.quoteId : "steady";
    return { workout, meal, pauseUntil: typeof entry.pauseUntil === "string" ? entry.pauseUntil : null, quoteId, customQuote: typeof entry.customQuote === "string" ? entry.customQuote.slice(0, 180) : "", updatedAt: entry.updatedAt ?? "" };
  } catch {
    return defaultPlannedSessionReminder();
  }
}

export async function savePlannedSessionReminder(reminder: PlannedSessionReminder) {
  const schedule = (entry: ReminderSchedule): ReminderSchedule => ({ ...entry, time: entry.time ? normaliseReminderTime(entry.time) : null, weekdays: normaliseReminderWeekdays(entry.weekdays), notificationIds: entry.notificationIds.slice(0, 7) });
  await AsyncStorage.setItem(plannedSessionReminderStorageKey, JSON.stringify({ ...reminder, workout: schedule(reminder.workout), meal: schedule(reminder.meal), customQuote: reminder.customQuote.trim().slice(0, 180) }));
}

export async function loadWaterLogs(): Promise<DailyWaterLog[]> {
  const saved = await AsyncStorage.getItem(waterLogsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as DailyWaterLog[]; } catch { return []; }
}

export async function saveWaterLogs(logs: DailyWaterLog[]) {
  await AsyncStorage.setItem(waterLogsStorageKey, JSON.stringify(logs.slice(0, 90)));
}

export async function loadGroceryChecklist(): Promise<GroceryChecklistItem[]> {
  const saved = await AsyncStorage.getItem(groceryChecklistStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as GroceryChecklistItem[]; } catch { return []; }
}

export async function saveGroceryChecklist(items: GroceryChecklistItem[]) {
  await AsyncStorage.setItem(groceryChecklistStorageKey, JSON.stringify(items.slice(0, 120)));
}

export async function loadExerciseLogs(): Promise<LocalExerciseLog[]> {
  const saved = await AsyncStorage.getItem(exerciseLogsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as LocalExerciseLog[]; } catch { return []; }
}

export async function saveExerciseLogs(logs: LocalExerciseLog[]) {
  await AsyncStorage.setItem(exerciseLogsStorageKey, JSON.stringify(logs.slice(0, 500)));
}

export async function loadCompletionRatings(): Promise<CompletionRating[]> {
  const saved = await AsyncStorage.getItem(completionRatingsStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as CompletionRating[]; } catch { return []; }
}

export async function saveCompletionRatings(ratings: CompletionRating[]) {
  await AsyncStorage.setItem(completionRatingsStorageKey, JSON.stringify(ratings.slice(0, 180)));
}

/** Applies a local, today-only gear exclusion without changing the saved home setup. */
export function applyTodayUnavailableResources(profile: UserProfile, unavailableResources: string[]): UserProfile {
  const unavailable = new Set(unavailableResources.map((resource) => resource.trim().toLowerCase()));
  const available = (resource: string) => !unavailable.has(resource.trim().toLowerCase());
  return { ...profile, workoutResources: profile.workoutResources.filter(available), otherWorkoutResources: profile.otherWorkoutResources.filter(available) };
}

/** Applies a chosen today-only substitute as the equipment priority without modifying the saved setup. */
export function applyTodayResourceSubstitutions(profile: UserProfile, unavailableResources: string[], substitutions: TodayResourceSubstitution[]): UserProfile {
  const activeProfile = applyTodayUnavailableResources(profile, unavailableResources);
  if (!substitutions.length) return activeProfile;
  const selectedSubstitutes = new Set(substitutions.map((substitution) => substitution.substituteResource.toLowerCase()).filter((resource) => resource !== "no equipment"));
  const utilityResources = new Set(["internet for video workouts", "tv or phone"]);
  return {
    ...activeProfile,
    workoutResources: activeProfile.workoutResources.filter((resource) => utilityResources.has(resource.toLowerCase()) || selectedSubstitutes.has(resource.toLowerCase())),
  };
}

export async function loadTodayUnavailableResources(today = formatToday()): Promise<string[]> {
  const saved = await AsyncStorage.getItem(todayUnavailableResourcesStorageKey);
  if (!saved) return [];
  try {
    const entry = JSON.parse(saved) as TodayUnavailableResources;
    return entry.date === today && Array.isArray(entry.resources) ? entry.resources : [];
  } catch {
    return [];
  }
}

export async function saveTodayUnavailableResources(resources: string[], today = formatToday()) {
  const entry: TodayUnavailableResources = { date: today, resources: Array.from(new Set(resources.map((resource) => resource.trim()).filter(Boolean))).slice(0, 20) };
  await AsyncStorage.setItem(todayUnavailableResourcesStorageKey, JSON.stringify(entry));
}

export async function loadTodayResourceSubstitutions(today = formatToday()): Promise<TodayResourceSubstitution[]> {
  const saved = await AsyncStorage.getItem(todayResourceSubstitutionsStorageKey);
  if (!saved) return [];
  try {
    const entry = JSON.parse(saved) as TodayResourceSubstitutions;
    return entry.date === today && Array.isArray(entry.substitutions) ? entry.substitutions : [];
  } catch {
    return [];
  }
}

export async function saveTodayResourceSubstitutions(substitutions: TodayResourceSubstitution[], today = formatToday()) {
  const unique = Array.from(new Map(substitutions.map((substitution) => [substitution.unavailableResource.toLowerCase(), substitution])).values()).slice(0, 20);
  const entry: TodayResourceSubstitutions = { date: today, substitutions: unique };
  await AsyncStorage.setItem(todayResourceSubstitutionsStorageKey, JSON.stringify(entry));
}

export async function loadResourceChangeFeedback(): Promise<LocalResourceChangeFeedback[]> {
  const saved = await AsyncStorage.getItem(resourceChangeFeedbackStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved) as LocalResourceChangeFeedback[]; } catch { return []; }
}

export async function saveResourceChangeFeedback(feedback: LocalResourceChangeFeedback[]) {
  await AsyncStorage.setItem(resourceChangeFeedbackStorageKey, JSON.stringify(feedback.slice(0, 100)));
}

const RESOURCE_SUBSTITUTE_ORDER: Record<string, string[]> = {
  "weights or filled bottles": ["Resistance band", "Chair", "Safe floor space"],
  "resistance band": ["Weights or filled bottles", "Chair", "Safe floor space"],
  "chair": ["Resistance band", "Weights or filled bottles", "Safe floor space"],
  "yoga mat": ["Safe floor space", "Chair"],
  "stairs or a sturdy step": ["Skipping rope", "Outdoor walking route", "Safe floor space"],
  "skipping rope": ["Stairs or a sturdy step", "Outdoor walking route", "Safe floor space"],
  "outdoor walking route": ["Stairs or a sturdy step", "Skipping rope", "Safe floor space"],
  "internet for video workouts": ["TV or phone"],
};

/** Offers a practical, already-saved alternative when a selected item is unavailable today. */
export function getTodayResourceSubstituteOptions(profile: UserProfile, unavailableResources: string[]): TodayResourceSubstitution[] {
  const unavailable = new Set(unavailableResources.map((resource) => resource.toLowerCase()));
  const saved = new Map(profile.workoutResources.map((resource) => [resource.toLowerCase(), resource]));
  return unavailableResources.map((resource) => {
    const candidate = (RESOURCE_SUBSTITUTE_ORDER[resource.toLowerCase()] ?? []).map((item) => saved.get(item.toLowerCase())).find((item) => item && !unavailable.has(item.toLowerCase()));
    return { unavailableResource: resource, substituteResource: candidate ?? "No equipment", chosenAt: new Date().toISOString() };
  });
}

/** Produces an explicit explanation of why this exact session is practical today. */
export function buildWorkoutWhyToday(profile: UserProfile, unavailableResources: string[], workout: WorkoutDay, substitutions: TodayResourceSubstitution[] = []): string {
  const durableResources = profile.workoutResources.filter((resource) => !["Internet for video workouts", "TV or phone"].includes(resource));
  const setup = durableResources.length ? sentenceList(durableResources, "your saved home resources") : "your clear space and bodyweight";
  const used = sentenceList(workout.resourcesUsed, "the resources this session uses");
  const paused = unavailableResources.length ? ` You paused ${sentenceList(unavailableResources, "a resource")} for today, so it is excluded from this session.` : "";
  const confirmed = substitutions.length ? ` You confirmed ${substitutions.map((substitution) => `${substitution.substituteResource} instead of ${substitution.unavailableResource}`).join("; ")}.` : "";
  return `${workout.title} is selected from ${setup} and uses ${used}.${paused}${confirmed}`;
}

/** Gives a compact, non-clinical setup preview for a later session. */
export function buildWorkoutSessionPreview(workout: WorkoutDay): WorkoutSessionPreview {
  const joined = workout.resourcesUsed.join(" ").toLowerCase();
  const setupChecks = ["Clear enough room to move without bumping furniture."];
  if (joined.includes("chair")) setupChecks.push("Use a stable, non-wheeled chair that will not slide.");
  if (joined.includes("band")) setupChecks.push("Inspect the resistance band and keep it controlled at all times.");
  if (joined.includes("bottle") || joined.includes("weight") || joined.includes("backpack")) setupChecks.push("Secure bottle caps or backpack contents and choose a load you can control.");
  if (joined.includes("stair") || joined.includes("step")) setupChecks.push("Use the lowest sturdy step first and a rail if one is available.");
  if (joined.includes("rope")) setupChecks.push("Check overhead and floor clearance before starting rope work.");
  setupChecks.push("Pause, reduce the range, or choose a gentler movement if anything feels wrong.");
  return { label: `${workout.label} preview`, durationMinutes: workout.durationMinutes, equipment: workout.resourcesUsed, setupChecks };
}

export function upsertCityRecipeRating(profile: UserProfile, recipeTitle: string, score: 1 | 2 | 3 | 4 | 5, ratedAt = new Date().toISOString()): UserProfile {
  const ratings = profile.recipeRatings ?? [];
  return { ...profile, recipeRatings: [...ratings.filter((entry) => entry.recipeTitle !== recipeTitle), { recipeTitle, score, ratedAt }] };
}

function preferRatedRecipes<T extends { title: string }>(recipes: T[], ratings: CityRecipeRating[] | undefined): T[] {
  const ratingByTitle = new Map((ratings ?? []).map((entry) => [entry.recipeTitle, entry.score]));
  return [...recipes].sort((left, right) => (ratingByTitle.get(right.title) ?? 0) - (ratingByTitle.get(left.title) ?? 0));
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
  const localizedRecipeWeeks = locationRecipeWeeks(profile.country, profile.city, fruit);
  const regionalRecipes = localizedRecipeWeeks.weekOne.length ? localizedRecipeWeeks.weekOne : profile.country === "Ghana" ? ghanaRecipes : profile.country === "Kenya" ? kenyaRecipes : nigeriaRecipes;
  const weekTwoRecipes: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote">[] = [
    { title: "Tomato egg and vegetable rice bowl", focus: "A quick tomato-and-egg main meal with vegetables and a moderate rice base", ingredients: ["½ cup rice", "2 eggs", "1 tomato", "¼ onion", "1 cup cabbage, spinach, or other greens", "1 teaspoon oil"], steps: ["Cook the rice until tender and set aside.", "Cook onion and tomato in the oil until soft, then add the greens.", "Beat the eggs into the vegetables and fold until just set.", "Serve the egg and vegetable mixture over the rice."], drink: "Water or unsweetened tea." },
    { title: "Beans, greens, and roasted plantain bowl", focus: "A satisfying bean-based bowl with vegetables and a small plantain side", ingredients: ["¾ cup cooked beans", "½ ripe plantain", "½ onion", "1 tomato", "1 cup leafy greens", "1 teaspoon oil"], steps: ["Cook onion and tomato in oil until soft.", "Add cooked beans and a little water; simmer for 5 minutes.", "Fold in greens until softened.", "Bake, air-fry, or pan-cook plantain with minimal oil and serve alongside."], drink: "Water or unsweetened hibiscus drink made with safe water." },
    { title: "Fish tomato stew with rice and cabbage", focus: "A familiar tomato stew with a clear fish portion and crunchy vegetables", ingredients: ["½ cup rice", "1 palm-sized fish portion", "2 tomatoes", "½ onion", "1 cup shredded cabbage and carrot", "1 teaspoon oil"], steps: ["Cook rice until tender.", "Cook onion and tomato in the oil until the sauce thickens.", "Add fish with a splash of water and simmer until cooked through.", "Serve with rice and cabbage-carrot slaw."], drink: `Water with ${fruit} later in the day.` },
    { title: "Lentil and vegetable pot with flatbread", focus: "A quick plant-based pot with a modest flatbread portion", ingredients: ["¾ cup cooked lentils", "½ onion", "1 tomato", "½ carrot", "1 cup leafy greens", "1 chapati or other flatbread", "1 teaspoon oil"], steps: ["Cook onion, carrot, and tomato in the oil until softened.", "Add lentils and a splash of water; simmer until warmed through.", "Fold in greens until just soft.", "Warm the flatbread and serve with the lentil pot."], drink: "Water or unsweetened ginger tea." },
    { title: "Chicken pepper soup with sweet potato and greens", focus: "A broth-led meal with a clear chicken portion and a modest root-vegetable side", ingredients: ["1 palm-sized chicken portion", "1 small sweet potato", "½ onion", "1 teaspoon pepper-soup spice", "1 cup leafy greens", "Fresh pepper to taste"], steps: ["Peel and cube the sweet potato; boil until tender.", "Simmer chicken, onion, spice, and pepper in water until the chicken is cooked through.", "Add greens for the final minute.", "Serve the soup with the sweet potato on the side."], drink: "Water; the soup broth is part of the meal." },
    { title: "Groundnut vegetable stew with rice", focus: "A plant-based stew that uses a familiar groundnut flavour and fresh vegetables", ingredients: ["½ cup rice", "¾ cup cooked beans or tofu", "1 tablespoon groundnut paste", "1 tomato", "½ onion", "1 cup greens or cabbage", "1 teaspoon oil"], steps: ["Cook rice until tender.", "Cook onion and tomato in oil until soft.", "Stir in groundnut paste with a little water, then add beans or tofu and simmer gently.", "Fold in greens and serve with rice."], drink: `Water and ${fruit}.` },
    { title: "Egg, tomato, and leafy-green bean bowl", focus: "A protein-forward beans-and-eggs main meal with vegetables", ingredients: ["¾ cup cooked beans", "2 eggs", "1 tomato", "¼ onion", "1 cup leafy greens", "1 teaspoon oil"], steps: ["Cook onion and tomato in oil until soft.", "Add beans with a splash of water and warm through.", "Fold in greens until softened.", "Cook eggs separately or stir them into the pan and serve over the beans."], drink: "Water or unsweetened tea." },
  ];
  const breakfastRecipes: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote">[] = [
    { title: "Quick eggs with tomato, greens, and one slice of bread", focus: "A light, protein-forward breakfast that can be ready in a small pan", ingredients: ["2 eggs", "1 small tomato", "¼ onion", "½ cup spinach or other greens", "1 slice bread", "1 teaspoon oil"], steps: ["Dice tomato and onion.", "Cook onion and tomato in the oil for 2 minutes, then add greens.", "Beat in eggs and fold gently until just set.", "Serve with one slice of bread."], drink: "Water or unsweetened tea." },
    { title: "Bean and cucumber breakfast cup", focus: "A light beans-based breakfast with a crunchy vegetable side", ingredients: ["½ cup cooked beans", "½ cucumber", "¼ onion", "1 teaspoon oil", "Small slice bread or ½ chapati"], steps: ["Warm beans with onion and a small splash of water.", "Slice cucumber.", "Serve the beans with cucumber and the small bread or flatbread portion."], drink: `Water and a portion of ${fruit}.` },
    { title: "Yoghurt, oats, fruit, and groundnut cup", focus: "A no-cook protein-and-fibre breakfast when safe cold storage is available", ingredients: ["¾ cup plain yoghurt or fortified soy yoghurt", "¼ cup oats", `1 portion ${fruit}`, "1 tablespoon groundnuts or seeds"], steps: ["Add yoghurt to a clean bowl.", "Stir in oats and groundnuts or seeds.", "Add chopped fruit and eat straight away."], drink: "Water; the yoghurt cup is the meal." },
    { title: "Moi moi with cucumber and tomato", focus: "A familiar bean-based breakfast with a lighter vegetable side", ingredients: ["1 small moi moi portion", "½ cucumber", "1 tomato", "1 boiled egg if suitable"], steps: ["Use freshly prepared or safely stored moi moi.", "Slice cucumber and tomato.", "Serve with an egg if it fits your preferences."], drink: "Water or unsweetened tea." },
    { title: "Pap or oats with egg and groundnuts", focus: "A warm, easy breakfast with a defined protein addition", ingredients: ["¾ cup pap or cooked oats", "1 boiled or scrambled egg", "1 tablespoon groundnuts or seeds", `1 portion ${fruit}`], steps: ["Prepare pap or oats according to the packet or household method.", "Cook or warm the egg.", "Serve with groundnuts or seeds and fruit."], drink: "Water; the pap or oats is part of the meal." },
    { title: "Tofu and vegetable breakfast scramble", focus: "A plant-based, quick breakfast with vegetables and a small bread portion", ingredients: ["¾ cup firm tofu", "1 tomato", "¼ onion", "½ cup greens", "1 slice bread", "1 teaspoon oil"], steps: ["Crumble tofu with a fork.", "Cook onion and tomato in the oil, then add tofu and greens.", "Fold until hot and serve with one slice of bread."], drink: "Water or unsweetened tea." },
    { title: "Milk or soy milk fruit smoothie with boiled egg", focus: "A quick, light breakfast for days with a blender or ready-to-drink milk", ingredients: ["1 cup milk or fortified soy milk", `1 portion ${fruit}`, "¼ cup oats", "1 boiled egg"], steps: ["Blend milk, fruit, and oats if you have a blender, or stir the oats into the milk and eat with fruit.", "Serve with a boiled egg.", "Use a no-cook beans option instead if egg does not fit your preferences."], drink: "Water if you are thirsty; the smoothie is part of the meal." },
  ];
  const rotationRecipes = profile.rotationWeek === 2 ? (localizedRecipeWeeks.weekTwo.length ? localizedRecipeWeeks.weekTwo : weekTwoRecipes) : regionalRecipes;
  const ratedRotationRecipes = preferRatedRecipes(rotationRecipes, profile.recipeRatings);
  const restrictionSafeRecipes = ratedRotationRecipes.filter((recipe) => !excluded.some((item) => `${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(item)));
  const availableRecipes = restrictionSafeRecipes.filter((recipe) => !profile.excludedRecipeTitles.includes(recipe.title));
  const plantBasedRecipes = availableRecipes.filter((recipe) => !/(chicken|fish|egg|catfish)/i.test(`${recipe.title} ${recipe.ingredients.join(" ")}`));
  const usableRecipes = usesAnimalFoods ? availableRecipes : plantBasedRecipes.length ? plantBasedRecipes : availableRecipes;
  const makeMeal = (recipe: Omit<MealDay, "day" | "label" | "storageNote" | "equipmentNote" | "sourceTitle">, day: number, label: string) => { const focus = focusMealDetails(profile.goal, applyServingPreference(recipe.ingredients, profile.servingSize)); return { ...recipe, sourceTitle: recipe.title, title: `${focus.titlePrefix}${recipe.title}`, ingredients: focus.ingredients, focus: `${recipe.focus}. ${focus.note}`, day, label, storageNote, equipmentNote: recipeEquipmentNote }; };
  const mealPlan = labels.map((label, index) => makeMeal(usableRecipes.length ? usableRecipes[index % usableRecipes.length] : ratedRotationRecipes[0], index + 1, label));
  const breakfastCandidates = breakfastRecipes.filter((recipe) => !excluded.some((item) => `${recipe.title} ${recipe.ingredients.join(" ")}`.toLowerCase().includes(item)) && !profile.excludedRecipeTitles.includes(recipe.title));
  const breakfastPlantBased = breakfastCandidates.filter((recipe) => !/(egg|yoghurt|milk)/i.test(`${recipe.title} ${recipe.ingredients.join(" ")}`));
  const usableBreakfasts = usesAnimalFoods ? breakfastCandidates : breakfastPlantBased.length ? breakfastPlantBased : breakfastCandidates;
  const breakfastMeals = labels.map((label, index) => makeMeal(usableBreakfasts.length ? usableBreakfasts[index % usableBreakfasts.length] : breakfastRecipes[5], index + 1, label));
  const sweetToothSnack = profile.sweetToothPreference === "healthier_swaps" ? "Fruit with plain yoghurt or a small homemade cocoa-oat snack" : profile.sweetToothPreference === "portion_guidance" ? "A small chosen sweet portion served after a balanced meal, rather than eating from the packet" : "A small cup of pap, yoghurt, or another snack that fits your dietary notes";
  const snackIdeas = [`${fruit} with a small handful of groundnuts if suitable for you`, "Cucumber, carrot, or another crunchy vegetable with a familiar dip", sweetToothSnack];
  const slotLabels = profile.mealFrequency === "one_plus_snack" ? ["Main meal"] : profile.mealFrequency === "two" ? ["Breakfast", "Dinner"] : ["Breakfast", "Lunch", "Dinner"];
  const dailyMeals = labels.map((label, index) => ({
    day: index + 1,
    label,
    slots: slotLabels.map((slot, slotIndex) => ({ label: slot, meal: slot === "Breakfast" ? { ...breakfastMeals[index], day: index + 1, label } : { ...mealPlan[(index + (slot === "Dinner" ? 2 : slotIndex)) % mealPlan.length], day: index + 1, label } })),
    snackIdeas: profile.mealFrequency === "one_plus_snack" ? [snackIdeas[index % 2], snackIdeas[2]] : [],
  }));

  const rounds = durationMinutes >= 30 ? 3 : 2;
  const workoutTemplates = buildResourceAwareWorkoutTemplates(profile, rounds);
  const maleInstructorOptions: WorkoutInstructorOption[] = [
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "10 Minute FULL BODY Workout", videoUrl: "https://www.youtube.com/watch?v=KrmYjcQzSsQ", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "10 Minute Abs Workout", videoUrl: "https://www.youtube.com/watch?v=aWJo_Fe20aE", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "First Steps To Fitness · Workout 1", videoUrl: "https://www.youtube.com/watch?v=JnCfnYPKc7w", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "First Steps To Fitness · Workout 2", videoUrl: "https://www.youtube.com/watch?v=mvMPjDLBBrk", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "Savage 10 Minute Leg Burner", videoUrl: "https://www.youtube.com/watch?v=5cAh3m5HCpw", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "7 Days of SWEAT · Day 1", videoUrl: "https://www.youtube.com/watch?v=5gvto1CA7Po", videoProvider: "The Body Coach" },
    { kind: "man", label: "Man-led option", name: "Joe Wicks", videoTitle: "First Steps To Fitness · Workout 3", videoUrl: "https://www.youtube.com/watch?v=p5CKZupTBxo", videoProvider: "The Body Coach" },
  ];
  const difficulty = difficultyAdaptation(profile.workoutDifficulty);
  const levelVideoOffset: Record<WorkoutDifficulty, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const workoutPlan = labels.map((label, index) => {
    const offset = levelVideoOffset[profile.workoutDifficulty];
    const womanTemplate = workoutTemplates[(index + offset) % workoutTemplates.length];
    const womanOption: WorkoutInstructorOption = { kind: "woman", label: "Woman-led option", name: womanTemplate.videoProvider, videoTitle: womanTemplate.videoTitle, videoUrl: womanTemplate.videoUrl, videoProvider: womanTemplate.videoProvider };
    const manOption = maleInstructorOptions[(index + offset) % maleInstructorOptions.length];
    const instructorOptions = profile.genderIdentity === "Man" ? [manOption, womanOption] : [womanOption, manOption];
    const defaultOption = instructorOptions[0];
    return {
      ...workoutTemplates[index],
      day: index + 1,
      label,
      durationMinutes: Math.max(10, durationMinutes + difficulty.durationAdjustment),
      instructions: [...workoutTemplates[index].instructions, difficulty.instruction],
      adaptation: `${difficulty.label} level. ${movementAdaptation(profile)} Keep the session pain-free; pause or choose a gentler option if anything feels wrong.`,
      resourcesUsed: workoutTemplates[index].resourcesUsed,
      resourceRationale: resourceRationale(profile, workoutResourceFlags(profile)),
      resourceDemonstrations: resourceDemonstrationsFor(workoutTemplates[index].resourcesUsed),
      videoAvailable: workoutResourceFlags(profile).canStream,
      difficulty: profile.workoutDifficulty,
      instructorOptions,
      videoTitle: defaultOption.videoTitle,
      videoUrl: defaultOption.videoUrl,
      videoProvider: defaultOption.videoProvider,
    };
  });

  const longerShopping = profile.shoppingFrequency === "biweekly" || profile.shoppingFrequency === "monthly";
  const categorizedGroceries = categorizeGroceryItems(practicalGroceryItems([
    ...dailyMeals.flatMap((day) => day.slots.flatMap((slot) => slot.meal.ingredients)),
    ...localIngredients.slice(0, 6),
    profile.favoriteFruits[0] ? profile.favoriteFruits[0] : "A fruit you enjoy",
  ]).slice(0, 60));
  return {
    rotationLabel: `Week ${profile.rotationWeek} of your two-week rotation`,
    goalTitle: goal.title,
    goalMessage: goal.message,
    safetyNote: "RootedFit is a general wellness guide. If you are pregnant, managing a medical condition, returning after injury, or experience pain, adapt the plan and consider local professional guidance.",
    electricityNote: `${profile.electricityHoursPerDay || "Your stated"} hours of electricity/day: ${storageNote}`,
    meals: mealPlan,
    breakfastMeals,
    dailyMeals,
    workouts: workoutPlan,
    shoppingGroups: [...categorizedGroceries, { title: "Storage reminder", items: [longerShopping ? "Choose only quantities you can safely store until your next shop." : "Choose quantities you can use while fresh."] }],
  };
}

export function buildMotivationalMessage(checkIns: DailyCheckIn[], goal: WellnessGoal) {
  const completedToday = checkIns.some((entry) => entry.date === formatToday() && (entry.followedMealIdea || entry.completedMovement));
  if (completedToday) return "You showed up for a practical habit today. Small repeats are the foundation of a rooted routine.";
  if (goal === "toning") return "Strength grows through calm, repeatable effort—not one perfect workout.";
  if (goal === "core_mobility") return "A few controlled minutes can be meaningful movement. Start where your body is today.";
  return "Choose the next realistic action, not the perfect one.";
}

export type GymResultSummary = { completedSessions: number; mealDays: number; currentStreak: number; label: string };
export type MonthProgressSummary = { currentMovementDays: number; previousMovementDays: number; currentMealDays: number; previousMealDays: number; weightDifferenceKg: number | null; waistDifferenceCm: number | null; comparisonReady: boolean };

function dateDaysBefore(date: string, days: number) {
  const parsed = new Date(`${date}T12:00:00`);
  parsed.setDate(parsed.getDate() - days);
  return parsed.toISOString().slice(0, 10);
}

export function buildGymResultSummary(checkIns: DailyCheckIn[], today = formatToday()): GymResultSummary {
  const recent = checkIns.filter((entry) => entry.date >= dateDaysBefore(today, 6) && entry.date <= today);
  const completedSessions = recent.filter((entry) => entry.completedMovement).length;
  const mealDays = recent.filter((entry) => entry.followedMealIdea).length;
  let currentStreak = 0;
  for (let offset = 0; offset < 31; offset += 1) {
    const date = dateDaysBefore(today, offset);
    if (checkIns.some((entry) => entry.date === date && entry.completedMovement)) currentStreak += 1;
    else break;
  }
  const label = completedSessions === 0 ? "Your next session can be short and still count." : completedSessions === 1 ? "One movement session logged this week." : `${completedSessions} movement sessions logged this week.`;
  return { completedSessions, mealDays, currentStreak, label };
}

export function buildMonthProgressSummary(checkIns: DailyCheckIn[], measurements: BodyMeasurement[], today = formatToday()): MonthProgressSummary {
  const currentStart = dateDaysBefore(today, 29);
  const previousStart = dateDaysBefore(today, 59);
  const inRange = (date: string, start: string, end: string) => date >= start && date <= end;
  const current = checkIns.filter((entry) => inRange(entry.date, currentStart, today));
  const previous = checkIns.filter((entry) => inRange(entry.date, previousStart, dateDaysBefore(currentStart, 1)));
  const newest = measurements.find((entry) => entry.date >= currentStart) ?? measurements[0];
  const baseline = measurements.filter((entry) => entry.date <= dateDaysBefore(currentStart, 1))[0];
  return {
    currentMovementDays: current.filter((entry) => entry.completedMovement).length,
    previousMovementDays: previous.filter((entry) => entry.completedMovement).length,
    currentMealDays: current.filter((entry) => entry.followedMealIdea).length,
    previousMealDays: previous.filter((entry) => entry.followedMealIdea).length,
    weightDifferenceKg: newest?.weightKg !== null && newest?.weightKg !== undefined && baseline?.weightKg !== null && baseline?.weightKg !== undefined ? Number((newest.weightKg - baseline.weightKg).toFixed(1)) : null,
    waistDifferenceCm: newest?.waistCm !== null && newest?.waistCm !== undefined && baseline?.waistCm !== null && baseline?.waistCm !== undefined ? Number((newest.waistCm - baseline.waistCm).toFixed(1)) : null,
    comparisonReady: Boolean(baseline && newest && baseline.id !== newest.id),
  };
}

export type MonthlyTrendPoint = { label: string; movementDays: number; mealDays: number };

export function buildMonthlyTrendSeries(checkIns: DailyCheckIn[], today = formatToday()): MonthlyTrendPoint[] {
  return [3, 2, 1, 0].map((weekOffset) => {
    const end = dateDaysBefore(today, weekOffset * 7);
    const start = dateDaysBefore(end, 6);
    const entries = checkIns.filter((entry) => entry.date >= start && entry.date <= end);
    return { label: `W${4 - weekOffset}`, movementDays: entries.filter((entry) => entry.completedMovement).length, mealDays: entries.filter((entry) => entry.followedMealIdea).length };
  });
}
