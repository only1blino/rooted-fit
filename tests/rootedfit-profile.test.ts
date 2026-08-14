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

import { applyTodayResourceSubstitutions, applyTodayUnavailableResources, buildGymResultSummary, buildMonthlyTrendSeries, buildMonthProgressSummary, buildWeeklyPlan, buildWorkoutSessionPreview, buildWorkoutWhyToday, categorizeGroceryItems, findSimilarRecipe, formatGroceryChecklistPrintHtml, formatGroceryListExport, getTodayResourceSubstituteOptions, isReminderPauseActive, loadCheckIns, loadCompletionRatings, loadExerciseLogs, loadGroceryChecklist, loadMealSwaps, loadMeasurements, loadPlannedSessionReminder, loadProfile, loadProgressPhotos, loadResourceChangeFeedback, loadTodayResourceSubstitutions, loadTodayUnavailableResources, loadWorkoutSessionStates, normaliseReminderTime, normaliseReminderWeekdays, numberOrNull, oneWeekReminderPauseUntil, practicalGroceryItems, reminderMotivationText, rotatingIndexForDate, saveCheckIns, saveCompletionRatings, saveExerciseLogs, saveGroceryChecklist, saveMealSwaps, saveMeasurements, savePlannedSessionReminder, saveProfile, saveProgressPhotos, saveResourceChangeFeedback, saveTodayResourceSubstitutions, saveTodayUnavailableResources, saveWorkoutSessionStates, splitList, subscribeProfile, upsertCityRecipeRating, type UserProfile } from "../lib/rootedfit-profile";
import { locationSuggestionLabel, resolveFoodLocation, seasonalFoodCues, suggestedFoods, suggestedFruits, suggestedMeals } from "../lib/food-catalogue";

const microwaveProfile: UserProfile = {
  city: "Lagos",
  country: "Nigeria",
  cityCountryMatchChoice: "auto",
  foodHeritagePreferences: [],
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
  recipeRatings: [],
};

describe("RootedFit weekly plan builder", () => {
  beforeEach(() => storage.clear());

  it("notifies mounted Meals and Workouts subscribers before local profile persistence completes", async () => {
    const received: string[] = [];
    const unsubscribe = subscribeProfile((profile) => { if (profile) received.push(`${profile.city}:${profile.workoutDifficulty}`); });

    const persistence = saveProfile({ ...microwaveProfile, city: "Toronto", country: "Canada", workoutDifficulty: "advanced" });
    expect(received).toEqual(["Toronto:advanced"]);
    await persistence;
    unsubscribe();

    expect(received).toEqual(["Toronto:advanced"]);
  });

  it("keeps favourite foods while adapting seven meal ideas to 12-hour power and a microwave", () => {
    const plan = buildWeeklyPlan(microwaveProfile);

    expect(plan.meals).toHaveLength(7);
    expect(plan.workouts).toHaveLength(7);
    expect(plan.meals[0].title).toContain("Ewedu with amala");
    expect(plan.meals[0].equipmentNote).toContain("microwave-only kitchen");
    expect(plan.meals[0].storageNote).toContain("same-day portions");
    expect(plan.shoppingGroups.flatMap((group) => group.items).join(" ")).toMatch(/Ewedu|Waterleaf|Banga spice/);
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
    expect(plan.meals[0].ingredients[0]).toBe("Ewedu");
  });

  it("uses localized recipe packs for Ghana and Kenya", () => {
    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Ghana", city: "Accra" }).meals[0].title).toContain("Kenkey");
    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Kenya", city: "Nairobi" }).meals[0].title).toContain("Ndengu");
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
    expect(weekTwo.meals[0].ingredients[0]).toBe("Banga spice");
    expect(lighter.meals[0].ingredients[0]).toBe("Banga spice");
    expect(generous.meals[0].ingredients[0]).toBe("Banga spice");
    expect(lighter.shoppingGroups.flatMap((group) => group.items).join(" ")).toMatch(/Banga spice|Waterleaf|Ewedu/);
    expect(generous.shoppingGroups.flatMap((group) => group.items).join(" ")).toMatch(/Banga spice|Waterleaf|Ewedu/);
  });

  it("changes every rendered Lagos meal slot, including breakfast, between Week 1 and Week 2", () => {
    const weekOne = buildWeeklyPlan({ ...microwaveProfile, city: "Lagos", country: "Nigeria", rotationWeek: 1 });
    const weekTwo = buildWeeklyPlan({ ...microwaveProfile, city: "Lagos", country: "Nigeria", rotationWeek: 2 });
    const weekOneSlots = weekOne.dailyMeals.flatMap((day) => day.slots.map((slot) => slot.meal.sourceTitle));
    const weekTwoSlots = weekTwo.dailyMeals.flatMap((day) => day.slots.map((slot) => slot.meal.sourceTitle));

    expect(weekOne.dailyMeals[0].slots[0].meal.sourceTitle).toContain("Moi moi");
    expect(weekTwo.dailyMeals[0].slots[0].meal.sourceTitle).toContain("Akara");
    expect(weekOneSlots).not.toEqual(weekTwoSlots);
    expect(weekOneSlots.filter((title) => weekTwoSlots.includes(title))).toEqual([]);
  });

  it("gives Lagos fourteen distinct daily breakfasts and fourteen distinct main recipes across the full two-week plan", () => {
    const weekOne = buildWeeklyPlan({ ...microwaveProfile, city: "Lagos", country: "Nigeria", rotationWeek: 1 });
    const weekTwo = buildWeeklyPlan({ ...microwaveProfile, city: "Lagos", country: "Nigeria", rotationWeek: 2 });
    const weekOneBreakfasts = weekOne.breakfastMeals.map((meal) => meal.sourceTitle);
    const weekTwoBreakfasts = weekTwo.breakfastMeals.map((meal) => meal.sourceTitle);
    const weekOneMains = weekOne.meals.map((meal) => meal.sourceTitle);
    const weekTwoMains = weekTwo.meals.map((meal) => meal.sourceTitle);

    expect(new Set(weekOneBreakfasts).size).toBe(7);
    expect(new Set(weekTwoBreakfasts).size).toBe(7);
    expect(new Set([...weekOneBreakfasts, ...weekTwoBreakfasts]).size).toBe(14);
    expect(new Set(weekOneMains).size).toBe(7);
    expect(new Set(weekTwoMains).size).toBe(7);
    expect(new Set([...weekOneMains, ...weekTwoMains]).size).toBe(14);
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

  it("adds matched chair, resistance-band, and water-bottle demonstrations when those resources drive a workout", () => {
    const chairPlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: ["Chair", "Internet for video workouts"] });
    const bandPlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: ["Resistance band", "Internet for video workouts"] });
    const bottlePlan = buildWeeklyPlan({ ...microwaveProfile, workoutResources: ["Weights or filled bottles", "Internet for video workouts"] });

    expect(chairPlan.workouts[0].resourceDemonstrations[0]).toMatchObject({ resource: "Chair", videoUrl: "https://www.youtube.com/watch?v=gD14hSNBT7M" });
    expect(bandPlan.workouts[0].resourceDemonstrations[0]).toMatchObject({ resource: "Resistance band", videoUrl: "https://www.youtube.com/watch?v=tONvKzIiqqw" });
    expect(bottlePlan.workouts[0].resourceDemonstrations[0]).toMatchObject({ resource: "Weights or filled bottles", videoUrl: "https://www.youtube.com/watch?v=bGXIt8zR3os" });
  });

  it("keeps a saved home setup unchanged while excluding temporarily unavailable resources from today’s workout", async () => {
    const savedProfile = { ...microwaveProfile, workoutResources: ["Chair", "Resistance band", "Internet for video workouts"] };
    const todayProfile = applyTodayUnavailableResources(savedProfile, ["Resistance band"]);
    const plan = buildWeeklyPlan(todayProfile);

    expect(savedProfile.workoutResources).toContain("Resistance band");
    expect(todayProfile.workoutResources).not.toContain("Resistance band");
    expect(plan.workouts[0].title).toContain("Chair-supported strength");
    await saveTodayUnavailableResources(["Chair"]);
    await expect(loadTodayUnavailableResources()).resolves.toEqual(["Chair"]);
  });

  it("offers saved one-tap alternatives and explains the resulting today-only workout choice", async () => {
    const savedProfile = { ...microwaveProfile, workoutResources: ["Chair", "Resistance band", "Weights or filled bottles", "Internet for video workouts"] };
    const unavailable = ["Weights or filled bottles"];
    const option = getTodayResourceSubstituteOptions(savedProfile, unavailable)[0];
    const substitutions = [{ ...option, chosenAt: "2026-08-13T12:00:00.000Z" }];
    const todayProfile = applyTodayResourceSubstitutions(savedProfile, unavailable, substitutions);
    const workout = buildWeeklyPlan(todayProfile).workouts[0];
    const preview = buildWorkoutSessionPreview(workout);

    expect(option.substituteResource).toBe("Resistance band");
    expect(workout.title).toContain("Resistance-band strength");
    expect(buildWorkoutWhyToday(savedProfile, unavailable, workout, substitutions)).toContain("Resistance band instead of Weights or filled bottles");
    expect(preview.equipment).toContain("Resistance band");
    expect(preview.setupChecks.join(" ")).toContain("Inspect the resistance band");
    await saveTodayResourceSubstitutions(substitutions);
    await expect(loadTodayResourceSubstitutions()).resolves.toEqual(substitutions);
  });

  it("keeps resource-change tester feedback locally when a beta tester responds to a substitute", async () => {
    const feedback = [{ id: "resource-feedback-1", changeContext: "Paused weights for today.", outcome: "needs_adjustment" as const, note: "A bodyweight alternative would help.", createdAt: "2026-08-13T12:00:00.000Z", synced: false }];
    await saveResourceChangeFeedback(feedback);
    await expect(loadResourceChangeFeedback()).resolves.toEqual(feedback);
  });

  it("normalises and persists a gentle planned-session reminder locally", async () => {
    expect(normaliseReminderTime("7:05")).toBe("07:05");
    expect(normaliseReminderTime("25:10")).toBeNull();
    expect(normaliseReminderWeekdays([6, 2, 6, 0, 8, 4])).toEqual([2, 4, 6]);
    const reminder = { workout: { time: "18:00", weekdays: [2, 4, 6] as (2 | 4 | 6)[], enabled: true, notificationIds: ["native-reminder-1"] }, meal: { time: "12:30", weekdays: [1, 3, 5] as (1 | 3 | 5)[], enabled: true, notificationIds: ["meal-reminder-1"] }, pauseUntil: null, quoteId: "kind" as const, customQuote: "", updatedAt: "2026-08-13T18:00:00.000Z" };
    await savePlannedSessionReminder(reminder);
    await expect(loadPlannedSessionReminder()).resolves.toEqual(reminder);
    const pauseUntil = oneWeekReminderPauseUntil(new Date("2026-08-13T10:00:00.000Z"));
    expect(isReminderPauseActive(pauseUntil, new Date("2026-08-19T09:00:00.000Z"))).toBe(true);
    expect(isReminderPauseActive(pauseUntil, new Date("2026-08-21T10:00:00.000Z"))).toBe(false);
    expect(reminderMotivationText({ quoteId: "custom", customQuote: "One realistic step is enough." })).toBe("One realistic step is enough.");
    expect(rotatingIndexForDate("2026-08-13", 7)).not.toBe(rotatingIndexForDate("2026-08-14", 7));
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

  it("changes suggested ingredients, meal ideas, and recipe titles from the city rather than using one generic fallback", () => {
    expect(locationSuggestionLabel("Kenya", "Mombasa")).toContain("Coastal Kenya");
    expect(suggestedFoods("Kenya", "Mombasa").slice(0, 4)).toEqual(expect.arrayContaining(["Coconut milk", "Tamarind"]));
    expect(suggestedMeals("Other", "Manila").slice(0, 3)).toEqual(expect.arrayContaining(["Mung bean stew", "Chicken tinola"]));
    expect(suggestedFruits("Other", "Addis Ababa").slice(0, 3)).toContain("Papaya");

    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Kenya", city: "Mombasa" }).meals[0].title).toContain("Coconut fish stew");
    expect(buildWeeklyPlan({ ...microwaveProfile, country: "Other", city: "Manila" }).meals[0].title).toContain("Mung bean stew");
  });

  it("resolves Toronto to Canada even when Nigeria remains selected and prevents Nigerian foods from leaking into any Toronto meal slot", () => {
    const torontoWeekOne = buildWeeklyPlan({ ...microwaveProfile, country: "Nigeria", city: "Toronto", rotationWeek: 1 });
    const torontoWeekTwo = buildWeeklyPlan({ ...microwaveProfile, country: "Nigeria", city: "Toronto", rotationWeek: 2 });
    const visibleTorontoMeals = JSON.stringify({ meals: torontoWeekOne.meals, breakfasts: torontoWeekOne.breakfastMeals, dailyMeals: torontoWeekOne.dailyMeals }).toLowerCase();

    expect(locationSuggestionLabel("Nigeria", "Toronto")).toContain("Toronto and GTA");
    expect(suggestedFoods("Nigeria", "Toronto").slice(0, 4)).toEqual(expect.arrayContaining(["Ontario apples", "Potatoes", "Carrots"]));
    expect(seasonalFoodCues("Nigeria", "Toronto", new Date("2026-08-14T12:00:00.000Z"))).toEqual(expect.arrayContaining(["Ontario berries or peaches", "Sweet corn"]));
    expect(torontoWeekOne.meals[0].sourceTitle).toContain("Red lentil and vegetable soup");
    expect(torontoWeekOne.dailyMeals[0].slots[0].meal.sourceTitle).toContain("Ontario apple oatmeal");
    expect(torontoWeekOne.meals.every((meal) => meal.originCountry === "Canada")).toBe(true);
    expect(torontoWeekOne.breakfastMeals.every((meal) => meal.originCountry === "Canada")).toBe(true);
    expect(visibleTorontoMeals).not.toMatch(/moi moi|amala|ewa?du|pounded yam|eba|pap\b|ofada|plantain porridge/);
    expect(torontoWeekOne.meals.map((meal) => meal.sourceTitle).filter((title) => torontoWeekTwo.meals.some((meal) => meal.sourceTitle === title))).toEqual([]);
  });

  it("uses dedicated audited Vancouver and Montréal two-week city packs with their own seasonal cues", () => {
    const vancouverWeekOne = buildWeeklyPlan({ ...microwaveProfile, country: "Canada", city: "Vancouver", rotationWeek: 1 });
    const vancouverWeekTwo = buildWeeklyPlan({ ...microwaveProfile, country: "Canada", city: "Vancouver", rotationWeek: 2 });
    const montrealWeekOne = buildWeeklyPlan({ ...microwaveProfile, country: "Canada", city: "Montréal", rotationWeek: 1 });
    const montrealWeekTwo = buildWeeklyPlan({ ...microwaveProfile, country: "Canada", city: "Montréal", rotationWeek: 2 });

    expect(vancouverWeekOne.meals[0].sourceTitle).toContain("Pacific salmon");
    expect(montrealWeekOne.meals[0].sourceTitle).toContain("Québec lentil");
    expect(vancouverWeekOne.meals.map((meal) => meal.sourceTitle).filter((title) => vancouverWeekTwo.meals.some((meal) => meal.sourceTitle === title))).toEqual([]);
    expect(montrealWeekOne.meals.map((meal) => meal.sourceTitle).filter((title) => montrealWeekTwo.meals.some((meal) => meal.sourceTitle === title))).toEqual([]);
    expect(seasonalFoodCues("Canada", "Vancouver", new Date("2026-08-14T12:00:00.000Z"))).toContain("B.C. berries");
    expect(seasonalFoodCues("Canada", "Montréal", new Date("2026-08-14T12:00:00.000Z"))).toContain("Québec carrots");
  });

  it("honours a user’s manual city-country correction instead of silently applying the automatic Toronto match", () => {
    const automaticToronto = resolveFoodLocation("Nigeria", "Toronto", "auto");
    const correctedToronto = resolveFoodLocation("Nigeria", "Toronto", "manual");
    const manuallyCorrectedPlan = buildWeeklyPlan({ ...microwaveProfile, city: "Toronto", country: "Nigeria", cityCountryMatchChoice: "manual" });

    expect(automaticToronto).toMatchObject({ country: "Canada", isCityMatch: true, matchChoice: "auto" });
    expect(correctedToronto).toMatchObject({ country: "Nigeria", pack: null, matchChoice: "manual" });
    expect(manuallyCorrectedPlan.meals[0].sourceTitle).toContain("Nigerian jollof rice");
    expect(manuallyCorrectedPlan.meals[0].originCountry).not.toBe("Canada");
  });

  it("uses genuinely distinct first- and second-week recipe sets for country and city packs", () => {
    const ukWeekOne = buildWeeklyPlan({ ...microwaveProfile, country: "United Kingdom", city: "London", rotationWeek: 1 });
    const ukWeekTwo = buildWeeklyPlan({ ...microwaveProfile, country: "United Kingdom", city: "London", rotationWeek: 2 });
    const kenyaWeekOne = buildWeeklyPlan({ ...microwaveProfile, country: "Kenya", city: "Nairobi", rotationWeek: 1 });
    const kenyaWeekTwo = buildWeeklyPlan({ ...microwaveProfile, country: "Kenya", city: "Nairobi", rotationWeek: 2 });

    expect(new Set(ukWeekOne.meals.map((meal) => meal.sourceTitle)).size).toBeGreaterThan(2);
    expect(ukWeekOne.meals.map((meal) => meal.sourceTitle)).not.toEqual(ukWeekTwo.meals.map((meal) => meal.sourceTitle));
    expect(kenyaWeekOne.meals.map((meal) => meal.sourceTitle)).not.toEqual(kenyaWeekTwo.meals.map((meal) => meal.sourceTitle));
    expect(new Set(kenyaWeekOne.meals.map((meal) => meal.sourceTitle)).size).toBe(7);
    expect(kenyaWeekOne.meals.map((meal) => meal.sourceTitle).filter((title) => kenyaWeekTwo.meals.some((meal) => meal.sourceTitle === title))).toEqual([]);
  });

  it("summarizes gym results and month-on-month progress from locally stored check-ins and measurements", () => {
    const checkIns = [
      { id: "a", date: "2026-08-14", steps: 6000, mood: "good" as const, followedMealIdea: true, completedMovement: true, note: "" },
      { id: "b", date: "2026-08-13", steps: 5000, mood: "steady" as const, followedMealIdea: true, completedMovement: true, note: "" },
      { id: "c", date: "2026-07-20", steps: 3000, mood: "low" as const, followedMealIdea: false, completedMovement: true, note: "" },
    ];
    const measurements = [
      { id: "new", date: "2026-08-14", weightKg: 70, waistCm: 80, hipCm: null, chestCm: null, upperArmCm: null, thighCm: null, unit: "ft_in_kg" as const, note: "" },
      { id: "old", date: "2026-07-10", weightKg: 72, waistCm: 83, hipCm: null, chestCm: null, upperArmCm: null, thighCm: null, unit: "ft_in_kg" as const, note: "" },
    ];
    expect(buildGymResultSummary(checkIns, "2026-08-14")).toMatchObject({ completedSessions: 2, mealDays: 2, currentStreak: 2 });
    expect(buildMonthProgressSummary(checkIns, measurements, "2026-08-14")).toMatchObject({ comparisonReady: true, weightDifferenceKg: -2, waistDifferenceCm: -3 });
  });

  it("keeps city recipe ratings local and promotes a higher-rated city recipe in the next rotation", () => {
    const base = { ...microwaveProfile, country: "Other" as const, city: "Kigali", rotationWeek: 1 as const };
    const firstPlan = buildWeeklyPlan(base);
    const preferredTitle = firstPlan.meals[3].sourceTitle!;
    const rated = upsertCityRecipeRating(base, preferredTitle, 5, "2026-08-14T12:00:00.000Z");

    expect(rated.recipeRatings).toEqual([{ recipeTitle: preferredTitle, score: 5, ratedAt: "2026-08-14T12:00:00.000Z" }]);
    expect(buildWeeklyPlan(rated).meals[0].sourceTitle).toBe(preferredTitle);
  });

  it("adds city cues for Kigali, Lusaka, and Dakar and groups recent check-ins into four chart weeks", () => {
    expect(suggestedMeals("Other", "Kigali")[0]).toContain("Isombe");
    expect(suggestedFoods("Other", "Lusaka").slice(0, 3)).toContain("Mealie meal");
    expect(suggestedMeals("Other", "Dakar")[0]).toContain("Thieboudienne");

    const series = buildMonthlyTrendSeries([
      { id: "today", date: "2026-08-14", steps: 4000, mood: "good", followedMealIdea: true, completedMovement: true, note: "" },
      { id: "week-two", date: "2026-08-04", steps: 2000, mood: "steady", followedMealIdea: true, completedMovement: false, note: "" },
    ], "2026-08-14");
    expect(series).toHaveLength(4);
    expect(series[3]).toMatchObject({ label: "W4", movementDays: 1, mealDays: 1 });
    expect(series[2]).toMatchObject({ label: "W3", movementDays: 0, mealDays: 1 });
  });
});
