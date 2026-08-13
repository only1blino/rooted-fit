import AsyncStorage from "@react-native-async-storage/async-storage";

export type ShoppingFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type WellnessGoal = "consistency" | "energy" | "toning" | "core_mobility" | "body_composition" | null;

export type UserProfile = {
  city: string;
  electricityHoursPerDay: number;
  marketMinutesAway: number;
  shoppingFrequency: ShoppingFrequency | null;
  kitchenEquipment: string[];
  otherKitchenEquipment: string[];
  favoriteMeals: string[];
  localIngredients: string[];
  dietaryNotes: string;
  dailyStepCount: number;
  workoutMinutesPerDay: number;
  workoutResources: string[];
  otherWorkoutResources: string[];
  goal: WellnessGoal;
  genderIdentity: string;
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
  note: string;
};

export const profileStorageKey = "rootedfit.profile.v2";
const legacyProfileStorageKey = "rootedfit.profile.v1";
export const checkInsStorageKey = "rootedfit.check-ins.v1";
export const measurementsStorageKey = "rootedfit.measurements.v1";

export const emptyProfile: UserProfile = {
  city: "",
  electricityHoursPerDay: 0,
  marketMinutesAway: 0,
  shoppingFrequency: null,
  kitchenEquipment: [],
  otherKitchenEquipment: [],
  favoriteMeals: [],
  localIngredients: [],
  dietaryNotes: "",
  dailyStepCount: 0,
  workoutMinutesPerDay: 0,
  workoutResources: [],
  otherWorkoutResources: [],
  goal: null,
  genderIdentity: "Prefer not to say",
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
    localIngredients: profile.localIngredients ?? [],
    workoutResources: profile.workoutResources ?? [],
    otherWorkoutResources: profile.otherWorkoutResources ?? [],
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
  await AsyncStorage.multiRemove([profileStorageKey, legacyProfileStorageKey, checkInsStorageKey, measurementsStorageKey]);
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

export function buildWeeklyPlan(profile: UserProfile): WeeklyPlan {
  const localIngredients = profile.localIngredients.length ? profile.localIngredients : ["a locally available vegetable", "a seasonal fruit", "a protein option"];
  const meals = profile.favoriteMeals.length ? profile.favoriteMeals : ["a familiar meal you enjoy", "a local staple", "a simple home meal"];
  const method = cookingMethod(profile);
  const storageNote = foodStorageNote(profile);
  const goal = goalCopy(profile.goal);
  const durationMinutes = Math.max(10, Math.min(60, profile.workoutMinutesPerDay || 20));
  const labels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
  const mealFocuses = [
    "Familiar plate with a fresh partner",
    "Pantry-and-produce bowl",
    "Colour and fibre variety",
    "Simple protein pairing",
    "Comfort meal, planned lightly",
    "Market-day mix-and-match",
    "Use-what-you-have reset",
  ];
  const recipePatterns = [
    (anchor: string, ingredient: string) => ({
      title: `Keep ${anchor} on the table`,
      steps: [`Prepare a same-day portion of ${anchor}.`, `${method[0].toUpperCase()}${method.slice(1)} ${ingredient} as a side, topping, or simple salad.`, "Add a protein option available to you, such as beans, eggs, fish, tofu, or another local choice.", "Serve and keep leftovers only when you can confirm safe cold storage."],
      drink: "Water with chilled or room-temperature citrus, ginger, mint, or a fruit you already have.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `${anchor} and ${ingredient} one-bowl meal`,
      steps: [`Start with ${anchor} or another starchy base you already cook.`, `Fold in ${ingredient} plus beans, lentils, eggs, fish, tofu, or a preferred protein.`, `${method[0].toUpperCase()}${method.slice(1)} until the ingredients are comfortably hot or tender.`, "Season with the flavours you already enjoy rather than replacing them."],
      drink: "Blend or steep a simple fruit-and-water drink only if a blender or safe drinking water is available; otherwise choose water or unsweetened tea.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `Vegetable-forward ${anchor} variation`,
      steps: [`Use ${anchor} as the familiar base.`, `Choose ${ingredient} and one second colour from your available ingredients.`, `${method[0].toUpperCase()}${method.slice(1)} the vegetables or enjoy them raw only after washing with safe water.`, "Add a filling protein choice and eat the prepared portion the same day when refrigeration is uncertain."],
      drink: "A homemade infused water: add sliced fruit, cucumber, or herbs to safe drinking water when available.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `Quick ${anchor} protein pair`,
      steps: [`Prepare ${anchor} in the way your household normally enjoys.`, `Build a small accompaniment from ${ingredient} and a protein available locally.`, `${method[0].toUpperCase()}${method.slice(1)} just enough for today’s meal.`, "Keep seasoning familiar and adjust the portion with hunger and energy in mind."],
      drink: "Water first; add a homemade fruit drink as an optional flavour, not a replacement for meals.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `Comforting ${anchor}, balanced by ${ingredient}`,
      steps: [`Make ${anchor} as a meal you recognise and enjoy.`, `Add ${ingredient} on the side or into the dish for a second texture and colour.`, "Choose a protein you can afford and find reliably.", "Make only the quantity that fits your real storage situation."],
      drink: "Unsweetened tea, water, or a freshly prepared local fruit drink if ingredients and safe water are available.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `Market-day ${anchor} mix`,
      steps: [`Use ${anchor} plus the freshest ${ingredient} you can obtain.`, "Choose one pantry staple for staying power and one protein for satisfaction.", `${method[0].toUpperCase()}${method.slice(1)} or assemble in a method that uses only the tools you selected.`, "Set aside a next-day ingredient only if you have reliable safe storage."],
      drink: "Fresh water with a squeezed citrus wedge or a warm herbal drink, depending on your preference.",
    }),
    (anchor: string, ingredient: string) => ({
      title: `Flexible ${anchor} reset`,
      steps: [`Look at what remains: ${anchor}, ${ingredient}, and any durable pantry item.`, "Combine them into a simple bowl, soup, wrap, or plate using your available appliance.", "Add a protein option if available.", "Use this as a no-waste, same-day meal rather than a strict recipe."],
      drink: "Your preferred unsweetened drink alongside safe drinking water.",
    }),
  ];
  const mealPlan = labels.map((label, index) => {
    const anchor = cycle(meals, index, "a familiar local meal");
    const ingredient = cycle(localIngredients, index, "a locally available ingredient");
    const pattern = recipePatterns[index](anchor, ingredient);
    return {
      day: index + 1,
      label,
      title: pattern.title,
      focus: mealFocuses[index],
      ingredients: [anchor, ingredient, cycle(localIngredients, index + 1, "a second ingredient"), "a protein option you can find", "a pantry staple if useful"],
      steps: pattern.steps,
      drink: pattern.drink,
      storageNote,
      equipmentNote: `This suggestion is designed to ${method} with what you selected at home.`,
    } satisfies MealDay;
  });

  const workoutTemplates: { title: string; category: string; instructions: string[] }[] = [
    { title: "Home toning circuit", category: "Strength & toning", instructions: ["Warm up with easy marching and shoulder rolls.", "Repeat sit-to-stands, wall push-ups, and slow hip hinges at a comfortable effort.", "Finish with standing calf raises and a short breath-led stretch."] },
    { title: "Pilates-inspired core", category: "Core & control", instructions: ["Begin with relaxed breathing and gentle pelvic tilts.", "Try heel taps, dead bugs, or a supported tabletop hold only as controlled.", "Finish with a side-body stretch and slow spinal mobility."] },
    { title: "Walk and step rhythm", category: "Steps & stamina", instructions: ["Choose a safe route indoors or outside, or march in place.", "Break the session into short intervals with easy recovery walks.", "End with ankle circles and a gentle calf stretch."] },
    { title: "Mobility reset", category: "Mobility & posture", instructions: ["Move gently through neck, shoulder, hip, and ankle ranges.", "Add supported squats or chair-assisted balance if comfortable.", "Finish by lying or sitting quietly and noticing how your body feels."] },
    { title: "Lower-body and balance", category: "Strength & balance", instructions: ["Start with a supported warm-up near a stable surface.", "Use controlled sit-to-stands, side steps, and calf raises.", "Finish with a relaxed hip and hamstring stretch."] },
    { title: "Small-space cardio mix", category: "Movement variety", instructions: ["Use gentle marching, step touches, or a safe stair/step pattern.", "Alternate an easy pace with short, slightly livelier intervals.", "Cool down with slow breathing and a full-body shakeout."] },
    { title: "Recovery flow", category: "Recovery & mobility", instructions: ["Choose easy mobility that feels good today.", "Combine gentle cat-cow, child’s pose, standing reach, or chair stretches as comfortable.", "Finish with a short reflection on one action you can repeat tomorrow."] },
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
