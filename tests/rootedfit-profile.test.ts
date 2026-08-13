import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    multiRemove: vi.fn(async (keys: string[]) => {
      keys.forEach((key) => storage.delete(key));
    }),
  },
}));

import { buildWeeklyPlan, loadCheckIns, loadMealSwaps, loadMeasurements, loadProfile, loadProgressPhotos, loadWorkoutSessionStates, numberOrNull, saveCheckIns, saveMealSwaps, saveMeasurements, saveProfile, saveProgressPhotos, saveWorkoutSessionStates, splitList, type UserProfile } from "../lib/rootedfit-profile";
import { suggestedFoods, suggestedFruits, suggestedMeals } from "../lib/food-catalogue";

const microwaveProfile: UserProfile = {
  city: "Lagos",
  country: "Nigeria",
  electricityHoursPerDay: 12,
  marketMinutesAway: 20,
  shoppingFrequency: "biweekly",
  kitchenEquipment: ["Microwave"],
  otherKitchenEquipment: [],
  favoriteMeals: ["yam and pepper soup", "rice and stew"],
  favoriteFruits: ["Mango"],
  localIngredients: ["carrots", "cucumbers", "beans"],
  dietaryNotes: "",
  dietaryRestrictions: [],
  dislikedFoods: [],
  mealFrequency: "three",
  sweetToothPreference: "none",
  dailyStepCount: 3500,
  workoutMinutesPerDay: 20,
  workoutResources: ["Yoga mat", "Safe floor space"],
  otherWorkoutResources: [],
  goal: "core_mobility",
  secondaryFocuses: ["consistency"],
  genderIdentity: "Prefer not to say",
  measurementUnit: "ft_in_kg",
  heightCm: null,
  weightKg: null,
  baselineWaistCm: null,
  baselineHipCm: null,
  baselineChestCm: null,
};

describe("RootedFit weekly plan builder", () => {
  beforeEach(() => storage.clear());

  it("keeps favourite foods while adapting seven meal ideas to 12-hour power and a microwave", () => {
    const plan = buildWeeklyPlan(microwaveProfile);

    expect(plan.meals).toHaveLength(7);
    expect(plan.workouts).toHaveLength(7);
    expect(plan.meals[0].title).toContain("Nigerian jollof rice");
    expect(plan.meals[0].equipmentNote).toContain("microwave-only kitchen");
    expect(plan.meals[0].storageNote).toContain("same-day portions");
    expect(plan.shoppingGroups[0].items).toContain("Beans, lentils, groundnuts, or another shelf-stable protein");
    expect(plan.workouts[1].videoUrl).toContain("youtube.com");
    expect(plan.workouts[1].videoTitle).toContain("PILATES");
    expect(plan.dailyMeals[0].slots).toHaveLength(3);
  });

  it("maps one meal plus snacks into a practical daily schedule", () => {
    const plan = buildWeeklyPlan({ ...microwaveProfile, mealFrequency: "one_plus_snack", sweetToothPreference: "portion_guidance" });

    expect(plan.dailyMeals[0].slots).toHaveLength(1);
    expect(plan.dailyMeals[0].snackIdeas).toHaveLength(2);
    expect(plan.dailyMeals[0].snackIdeas.join(" ")).toContain("small chosen sweet portion");
  });

  it("keeps comma-separated field input stable and parses decimal number entries", () => {
    expect(splitList(" yam, rice, , pepper soup ")).toEqual(["yam", "rice", "pepper soup"]);
    expect(numberOrNull("62,5")).toBe(62.5);
  });

  it("offers a full Nigeria-first catalogue and does not force a restricted item into a recipe", () => {
    const plan = buildWeeklyPlan({ ...microwaveProfile, dietaryRestrictions: ["eggs"], localIngredients: ["beans", "carrots", "cucumbers"] });

    expect(suggestedFoods("Nigeria")).toHaveLength(50);
    expect(suggestedFruits("Nigeria")).toContain("Mango");
    expect(suggestedFoods("Nigeria")).not.toContain("Moi moi");
    expect(suggestedMeals("Nigeria")).toContain("Moi moi");
    expect(JSON.stringify(plan.meals).toLowerCase()).not.toContain("eggs");
    expect(plan.meals[0].ingredients[0]).toMatch(/^¾ cup parboiled rice/);
  });

  it("uses localized recipe packs for Ghana and Kenya", () => {
    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Ghana" }).meals[0].title).toContain("Waakye");
    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Kenya" }).meals[0].title).toContain("Githeri");
  });

  it("persists the expanded onboarding profile locally", async () => {
    await saveProfile(microwaveProfile);

    await expect(loadProfile()).resolves.toEqual(microwaveProfile);
  });

  it("persists daily check-ins and weekly measurements locally", async () => {
    const checkIns = [{ id: "today", date: "2026-08-13", steps: 4500, mood: "good" as const, followedMealIdea: true, completedMovement: false, note: "Walked after lunch" }];
    const measurements = [{ id: "week-1", date: "2026-08-13", weightKg: 62.5, waistCm: 74, hipCm: null, chestCm: null, upperArmCm: null, thighCm: null, unit: "ft_in_kg" as const, note: "Morning check-in" }];

    await saveCheckIns(checkIns);
    await saveMeasurements(measurements);

    await expect(loadCheckIns()).resolves.toEqual(checkIns);
    await expect(loadMeasurements()).resolves.toEqual(measurements);
  });

  it("persists private local front, side, and back photo references", async () => {
    const photos = [{ id: "front-1", date: "2026-08-13", angle: "front" as const, uri: "file:///private/rootedfit-progress/front.jpg" }];

    await saveProgressPhotos(photos);

    await expect(loadProgressPhotos()).resolves.toEqual(photos);
  });

  it("persists meal swaps and saved or completed workout-session states", async () => {
    const swaps = [{ slotKey: "1-Breakfast", recipeIndex: 3 }];
    const sessions = [{ workoutId: "core-video", saved: true, completedAt: "2026-08-13" }];

    await saveMealSwaps(swaps);
    await saveWorkoutSessionStates(sessions);

    await expect(loadMealSwaps()).resolves.toEqual(swaps);
    await expect(loadWorkoutSessionStates()).resolves.toEqual(sessions);
  });
});
