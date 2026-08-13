import AsyncStorage from "@react-native-async-storage/async-storage";

export type ShoppingFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type UserProfile = {
  city: string;
  electricityHoursPerDay: number;
  marketMinutesAway: number;
  shoppingFrequency: ShoppingFrequency | null;
  kitchenEquipment: string[];
  favoriteMeals: string[];
  localIngredients: string[];
  dailyStepCount: number;
  workoutMinutesPerDay: number;
  workoutResources: string[];
};

export type DailyPlan = {
  contextLine: string;
  electricityNote: string;
  mealTitle: string;
  mealDescription: string;
  mealSafetyNote: string;
  shoppingNote: string;
  workoutTitle: string;
  workoutDescription: string;
  workoutReason: string;
};

export const profileStorageKey = "rootedfit.profile.v1";

export const emptyProfile: UserProfile = {
  city: "",
  electricityHoursPerDay: 0,
  marketMinutesAway: 0,
  shoppingFrequency: null,
  kitchenEquipment: [],
  favoriteMeals: [],
  localIngredients: [],
  dailyStepCount: 0,
  workoutMinutesPerDay: 0,
  workoutResources: [],
};

function sentenceList(values: string[], fallback: string) {
  if (values.length === 0) return fallback;
  if (values.length === 1) return values[0];
  return `${values.slice(0, -1).join(", ")} and ${values[values.length - 1]}`;
}

export function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export async function loadProfile(): Promise<UserProfile | null> {
  const saved = await AsyncStorage.getItem(profileStorageKey);
  if (!saved) return null;

  try {
    return { ...emptyProfile, ...JSON.parse(saved) } as UserProfile;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: UserProfile) {
  await AsyncStorage.setItem(profileStorageKey, JSON.stringify(profile));
}

export async function clearProfile() {
  await AsyncStorage.removeItem(profileStorageKey);
}

export function buildDailyPlan(profile: UserProfile): DailyPlan {
  const favoriteMeal = profile.favoriteMeals[0] ?? "your familiar meal";
  const ingredients = sentenceList(profile.localIngredients, "the ingredients you already see locally");
  const hasFridge = profile.kitchenEquipment.includes("Fridge");
  const hasMicrowave = profile.kitchenEquipment.includes("Microwave");
  const hasStove = profile.kitchenEquipment.includes("Stove");
  const electricityIsLimited = profile.electricityHoursPerDay <= 12;
  const fridgePhrase = hasFridge && !electricityIsLimited
    ? "Use your fridge for a small two-day portion, then reheat what you need."
    : "Prepare only the portion you will eat today and cool leftovers promptly only when power is available.";
  const cookingMethod = hasMicrowave
    ? "warm, steam, or reheat it in your microwave"
    : hasStove
      ? "cook it fresh on your stove"
      : "assemble it without relying on powered cooking equipment";

  const storageStrategy = profile.electricityHoursPerDay <= 6
    ? "Plan for same-day cooking and shelf-stable staples; do not depend on overnight refrigeration."
    : electricityIsLimited
      ? "Use a short prep window, favor same-day portions, and avoid recipes that require cold storage overnight."
      : "Your power access can support a modest prep session and short chilled storage."

  const shoppingStrategy = profile.shoppingFrequency === "biweekly" || profile.shoppingFrequency === "monthly"
    ? "For your longer shopping cycle, anchor your basket with dry grains, beans, tinned fish or pulses, and firm produce; buy fragile greens in smaller top-ups when possible."
    : "Your shopping pattern can support a mix of fresh produce and pantry staples; choose fresh items in quantities you can use before the next trip.";

  const minutes = Math.max(profile.workoutMinutesPerDay, 10);
  const hasMat = profile.workoutResources.includes("Yoga mat");
  const hasInternet = profile.workoutResources.includes("Internet for video workouts");
  const hasWeights = profile.workoutResources.includes("Weights or filled bottles");
  const workoutTitle = hasMat
    ? `${minutes}-minute mat-based strength and mobility`
    : `${minutes}-minute small-space strength and mobility`;
  const workoutDescription = hasMat
    ? `Complete two gentle rounds of squats to a chair, incline push-ups against a wall, glute bridges, dead bugs, and a short stretch. ${hasWeights ? "Use filled bottles for a light row if comfortable." : "Use your bodyweight and household surfaces only."}`
    : `Complete two gentle rounds of sit-to-stands, wall push-ups, calf raises, marching in place, and standing side bends. ${hasWeights ? "Add a light bottle carry if it feels safe." : "No gym equipment is required."}`;
  const workoutReason = hasInternet
    ? "Your plan fits your available space and includes an optional streamed follow-along session when your connection is convenient."
    : "Your plan fits your available space and does not require an internet connection or gym access.";

  return {
    contextLine: profile.city ? `Built for daily life in ${profile.city}.` : "Built around your daily reality.",
    electricityNote: `${profile.electricityHoursPerDay} hours of electricity/day: ${storageStrategy}`,
    mealTitle: `Keep ${favoriteMeal} in your routine`,
    mealDescription: `Pair ${favoriteMeal} with ${ingredients}, and ${cookingMethod}. This keeps a familiar food at the center while adding a vegetable or protein partner when available.`,
    mealSafetyNote: fridgePhrase,
    shoppingNote: shoppingStrategy,
    workoutTitle,
    workoutDescription,
    workoutReason,
  };
}
