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

import { buildWeeklyPlan, categorizeGroceryItems, findSimilarRecipe, formatGroceryChecklistPrintHtml, formatGroceryListExport, loadCheckIns, loadCompletionRatings, loadExerciseLogs, loadGroceryChecklist, loadMealSwaps, loadMeasurements, loadProfile, loadProgressPhotos, loadWorkoutSessionStates, numberOrNull, practicalGroceryItems, saveCheckIns, saveCompletionRatings, saveExerciseLogs, saveGroceryChecklist, saveMealSwaps, saveMeasurements, saveProfile, saveProgressPhotos, saveWorkoutSessionStates, splitList, type UserProfile } from "../lib/rootedfit-profile";
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
  excludedRecipeTitles: [],
  favoriteFruits: ["Mango"],
  localIngredients: ["carrots", "cucumbers", "beans"],
  dietaryNotes: "",
  dietaryRestrictions: [],
  dislikedFoods: [],
  mealFrequency: "three",
  servingSize: "regular",
  rotationWeek: 1,
  sweetToothPreference: "none",
  dailyStepCount: 3500,
  aspirationalStepTarget: 5000,
  workoutMinutesPerDay: 20,
  workoutDifficulty: "beginner",
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
    expect(plan.shoppingGroups.flatMap((group) => group.items)).toContain("Rice — 1 kg or a smaller bag");
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

  it("adjusts food emphasis and recipe-derived groceries for different primary focuses", () => {
    const weightLossPlan = buildWeeklyPlan({ ...microwaveProfile, goal: "weight_loss" });
    const weightGainPlan = buildWeeklyPlan({ ...microwaveProfile, goal: "weight_gain" });

    expect(weightLossPlan.meals[0].focus).toContain("lighter staple portion");
    expect(weightGainPlan.meals[0].focus).toContain("fuller staple portion");
    expect(weightGainPlan.shoppingGroups.flatMap((group) => group.items)).toContain("Groundnuts or seeds — 1 small packet");
  });

  it("uses distinct weight-loss and weight-gain plates rather than only changing explanatory copy", () => {
    const weightLossPlan = buildWeeklyPlan({ ...microwaveProfile, goal: "weight_loss" });
    const weightGainPlan = buildWeeklyPlan({ ...microwaveProfile, goal: "weight_gain" });

    expect(weightLossPlan.meals[0].title).toContain("Weight-loss plate");
    expect(weightGainPlan.meals[0].title).toContain("Weight-gain plate");
    expect(weightLossPlan.meals[0].ingredients).toContain("2 cups leafy greens, cabbage, carrot, cucumber, or other available vegetables");
    expect(weightGainPlan.meals[0].ingredients).toContain("1 energy-supporting add-on: groundnuts, yoghurt, milk, avocado, beans, or seeds if suitable");
  });

  it("builds a light protein-forward breakfast before fuller later meals for two- and three-meal schedules", () => {
    const threeMealPlan = buildWeeklyPlan({ ...microwaveProfile, mealFrequency: "three" });
    const twoMealPlan = buildWeeklyPlan({ ...microwaveProfile, mealFrequency: "two" });
    const breakfast = threeMealPlan.dailyMeals[0].slots[0];

    expect(threeMealPlan.dailyMeals[0].slots.map((slot) => slot.label)).toEqual(["Breakfast", "Lunch", "Dinner"]);
    expect(twoMealPlan.dailyMeals[0].slots.map((slot) => slot.label)).toEqual(["Breakfast", "Dinner"]);
    expect(breakfast.meal.title.toLowerCase()).not.toMatch(/semo|amala|pounded yam/);
    expect(breakfast.meal.ingredients.join(" ").toLowerCase()).toMatch(/egg|beans|yoghurt|tofu|milk|moi moi/);
  });

  it("rotates the main recipe catalogue for week two and scales recipe quantities from the serving preference", () => {
    const weekOne = buildWeeklyPlan({ ...microwaveProfile, rotationWeek: 1, servingSize: "regular" });
    const weekTwo = buildWeeklyPlan({ ...microwaveProfile, rotationWeek: 2, servingSize: "regular" });
    const lighter = buildWeeklyPlan({ ...microwaveProfile, rotationWeek: 2, servingSize: "lighter" });
    const generous = buildWeeklyPlan({ ...microwaveProfile, rotationWeek: 2, servingSize: "generous" });

    expect(weekOne.meals[0].title).not.toEqual(weekTwo.meals[0].title);
    expect(weekTwo.rotationLabel).toContain("Week 2");
    expect(weekTwo.meals[0].ingredients).toContain("½ cup rice");
    expect(lighter.meals[0].ingredients).toContain("⅓ cup rice");
    expect(generous.meals[0].ingredients).toContain("¾ cup rice");
    expect(lighter.shoppingGroups.flatMap((group) => group.items)).toContain("Rice — 1 kg or a smaller bag");
    expect(generous.shoppingGroups.flatMap((group) => group.items)).toContain("Rice — 1 kg or a smaller bag");
  });

  it("provides seven distinct day-by-day home workouts instead of a repeated two-session library", () => {
    const plan = buildWeeklyPlan(microwaveProfile);

    expect(plan.workouts).toHaveLength(7);
    expect(new Set(plan.workouts.map((workout) => workout.title)).size).toBe(7);
    expect(plan.workouts.map((workout) => workout.label)).toEqual(["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]);
  });

  it("persists a workout difficulty and adapts every daily session without changing the weekly variety", () => {
    const beginner = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "beginner" });
    const intermediate = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "intermediate" });
    const advanced = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "advanced" });

    expect(beginner.workouts.every((workout) => workout.difficulty === "beginner")).toBe(true);
    expect(intermediate.workouts.every((workout) => workout.difficulty === "intermediate")).toBe(true);
    expect(advanced.workouts[0].durationMinutes).toBeGreaterThan(beginner.workouts[0].durationMinutes);
    expect(beginner.workouts[0].instructions.at(-1)).toContain("Beginner option");
    expect(advanced.workouts[0].instructions.at(-1)).toContain("Advanced option");
    expect(new Set(advanced.workouts.map((workout) => workout.title)).size).toBe(7);
  });

  it("formats a shareable grocery list from the selected plan rather than generic shopping placeholders", () => {
    const plan = buildWeeklyPlan({ ...microwaveProfile, rotationWeek: 2 });
    const text = formatGroceryListExport(plan, "Lagos");

    expect(text).toContain("ROOTEDFIT GROCERY LIST");
    expect(text).toContain("Week 2");
    expect(text).toContain("Plan area: Lagos");
    expect(text).toContain("Tomatoes — 6–8 medium");
  });

  it("removes excluded recipes from the selected rotation and persists checklist ticks with print-ready output", async () => {
    const excludedTitle = "Nigerian jollof rice with chicken and cabbage slaw";
    const plan = buildWeeklyPlan({ ...microwaveProfile, excludedRecipeTitles: [excludedTitle] });
    const groceryKey = "1:regular:Eggs — 1 half-dozen or a tray";
    const checklist = [{ key: groceryKey, checked: true }];

    expect(plan.meals.map((meal) => meal.sourceTitle)).not.toContain(excludedTitle);
    await saveGroceryChecklist(checklist);
    await expect(loadGroceryChecklist()).resolves.toEqual(checklist);
    const printable = formatGroceryChecklistPrintHtml(plan, "Lagos", ["Eggs — 1 half-dozen or a tray"]);
    expect(printable).toContain("RootedFit grocery checklist");
    expect(printable).toContain("☑ Eggs — 1 half-dozen or a tray");
  });

  it("uses practical household purchase units for groceries while keeping recipe portions detailed", () => {
    const groceries = practicalGroceryItems(["½ bell pepper", "1 teaspoon oil", "1 slice bread", "⅓ cup firm tofu", "¼ onion"]);

    expect(groceries).toEqual(expect.arrayContaining(["Bell peppers or fresh peppers — 2–3 whole", "Cooking oil — 1 small bottle", "Bread — 1 small loaf", "Firm tofu — 1 block", "Onions — 5–6 medium"]));
    expect(groceries.join(" ")).not.toMatch(/½|⅓|¼|teaspoon|slice/);
  });

  it("places a man-led instructor option first for men while retaining an alternative instructor link", () => {
    const plan = buildWeeklyPlan({ ...microwaveProfile, genderIdentity: "Man" });

    expect(plan.workouts[0].instructorOptions).toHaveLength(2);
    expect(plan.workouts[0].instructorOptions[0].label).toBe("Man-led option");
    expect(plan.workouts[0].instructorOptions[1].label).toBe("Woman-led option");
  });

  it("keeps seven sessions distinct and changes the follow-along links for each selected difficulty", () => {
    const beginner = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "beginner" });
    const intermediate = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "intermediate" });
    const advanced = buildWeeklyPlan({ ...microwaveProfile, workoutDifficulty: "advanced" });

    expect(new Set(beginner.workouts.map((workout) => workout.title)).size).toBe(7);
    expect(beginner.workouts[3].videoUrl).not.toBe(intermediate.workouts[3].videoUrl);
    expect(intermediate.workouts[3].videoUrl).not.toBe(advanced.workouts[3].videoUrl);
    expect(beginner.workouts[3].instructorOptions.map((option) => option.kind)).toEqual(["woman", "man"]);
  });

  it("turns selected home resources into distinct movements, session names, and streaming availability", () => {
    const bodyweightPlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: [], otherWorkoutResources: [] });
    const equippedPlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: ["Yoga mat", "Chair", "Resistance band", "Weights or filled bottles", "Stairs or a sturdy step", "Skipping rope", "Internet for video workouts", "Outdoor walking route"], otherWorkoutResources: [] });
    const backpackPlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: [], otherWorkoutResources: ["backpack"] });

    expect(bodyweightPlan.workouts[0].title).toContain("Bodyweight strength");
    expect(bodyweightPlan.workouts[0].resourcesUsed).toEqual(["No equipment"]);
    expect(bodyweightPlan.workouts[0].videoAvailable).toBe(false);
    expect(equippedPlan.workouts[0].title).toContain("Loaded home strength");
    expect(equippedPlan.workouts[0].instructions.join(" ")).toContain("bottle-loaded squats");
    expect(equippedPlan.workouts[2].title).toContain("Outdoor walking rhythm");
    expect(equippedPlan.workouts[4].resourcesUsed).toContain("Weights, filled bottles, or backpack");
    expect(equippedPlan.workouts[0].videoAvailable).toBe(true);
    expect(backpackPlan.workouts[0].title).toContain("Loaded home strength");
  });

  it("finds a similar available recipe and organizes the unchanged grocery ingredients by supermarket section", () => {
    const plan = buildWeeklyPlan(microwaveProfile);
    const replacement = findSimilarRecipe(plan, plan.meals[0].sourceTitle ?? "", false);
    const categories = categorizeGroceryItems(["2 eggs", "1 tomato", "¾ cup rice", "1 teaspoon oil"]);

    expect(replacement?.sourceTitle).not.toBe(plan.meals[0].sourceTitle);
    expect(categories.map((group) => group.title)).toEqual(expect.arrayContaining(["Fruit & vegetables", "Protein, beans & dairy", "Grains, roots & bread", "Oils, herbs & pantry"]));
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

  it("persists optional bodyweight and weighted home-exercise set logs locally", async () => {
    const logs = [{ id: "set-1", workoutId: "toning-session", exerciseName: "Bodyweight squat", setNumber: 1, repCount: 12, weightUsedKg: 0, loggedAt: "2026-08-13T12:00:00.000Z" }];

    await saveExerciseLogs(logs);

    await expect(loadExerciseLogs()).resolves.toEqual(logs);
  });

  it("persists optional completion ratings for a daily meal plan or workout", async () => {
    const ratings = [{ completionKey: "meal:1:1", rating: 4 as const, ratedAt: "2026-08-13T12:00:00.000Z" }, { completionKey: "workout:home-session:2026-08-13", rating: 5 as const, ratedAt: "2026-08-13T12:10:00.000Z" }];

    await saveCompletionRatings(ratings);

    await expect(loadCompletionRatings()).resolves.toEqual(ratings);
  });
});
