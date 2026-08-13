import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

import { buildDailyPlan, loadProfile, saveProfile, splitList, type UserProfile } from "../lib/rootedfit-profile";

const microwaveProfile: UserProfile = {
  city: "Lagos",
  electricityHoursPerDay: 12,
  marketMinutesAway: 20,
  shoppingFrequency: "biweekly",
  kitchenEquipment: ["Microwave"],
  favoriteMeals: ["yam and pepper soup"],
  localIngredients: ["carrots", "cucumbers"],
  dailyStepCount: 3500,
  workoutMinutesPerDay: 20,
  workoutResources: ["Yoga mat"],
};

describe("RootedFit plan builder", () => {
  beforeEach(() => storage.clear());

  it("keeps favourite foods while adapting food storage to 12-hour power and a microwave", () => {
    const plan = buildDailyPlan(microwaveProfile);

    expect(plan.mealTitle).toContain("yam and pepper soup");
    expect(plan.mealDescription).toContain("microwave");
    expect(plan.electricityNote).toContain("same-day portions");
    expect(plan.shoppingNote).toContain("dry grains");
  });

  it("cleans and limits comma-separated onboarding entries", () => {
    expect(splitList(" yam, rice, , pepper soup ")).toEqual(["yam", "rice", "pepper soup"]);
  });

  it("persists a completed onboarding profile locally", async () => {
    await saveProfile(microwaveProfile);

    await expect(loadProfile()).resolves.toEqual(microwaveProfile);
  });
});
