# RootedFit MVP Blueprint

**Author:** Manus AI  
**Product:** RootedFit  
**Scope:** Phase 1 mobile MVP for infrastructure-aware nutrition and movement planning

> **Implementation update — August 2026:** The original onboarding foundation described below has been expanded in the application to include robust comma-separated and numeric inputs, goals, optional body context, a seven-day rotating meal/workout plan, shopping and DIY recipe guidance, device-optional step tracking, daily check-ins, and optional weekly body-measurement history. The current product analysis and guardrails are documented in [Expanded Product Design](expanded_product_design.md) and [Expanded MVP Research Notes](expanded_mvp_research_notes.md).

## 1. Product Requirements Document

### Product summary

RootedFit is a mobile fitness and nutrition planner for people whose daily choices are shaped by irregular electricity, variable refrigeration, local market access, available household equipment, and familiar food cultures. Its core promise is **contextual practicality**: every initial recommendation must fit the user’s stated reality rather than presuming gym access, constant power, refrigeration, standardised grocery stores, or western meal preferences.

> RootedFit does not categorise familiar meals as “unhealthy.” It uses the person’s meals as a starting point, then adapts portioning, preparation, pairings, freshness, and storage guidance to the context they provide.

| Product objective | MVP requirement | Success signal |
|---|---|---|
| Capture realistic constraints | Collect infrastructure, market, kitchen, food, and movement context in four short onboarding steps. | A user can finish onboarding without needing to describe unfamiliar nutritional concepts or gym equipment. |
| Produce explainable recommendations | Show a meal idea, food-storage note, shopping note, and movement routine with an explicit reason each fits. | A user can identify why the recommendation works for their power, equipment, and time. |
| Preserve food agency | Ask for favourite meals before creating a meal suggestion and include one in the first plan. | The generated meal title includes a favourite meal whenever one is entered. |
| Minimise data burden | Store the MVP profile locally and permit a reset from the dashboard. | The dashboard reopens with the saved plan on the same device. |

### Primary user flow

The user begins on a welcome screen that explains the product’s grounded premise. They then complete four focused questionnaire screens. The first captures their city and a practical estimate of electricity access. The second captures market travel time, shopping frequency, and kitchen equipment. The third records familiar meals and locally available ingredients. The fourth captures estimated steps, available workout minutes, and household movement resources.

After the final step, RootedFit validates the minimum viable inputs, persists the profile locally, and opens the daily dashboard. The dashboard provides a **power and storage rule**, a meal idea built around a stated favourite, a shopping note aligned with shopping frequency, and a movement session that uses only available resources. A reset action is included for the MVP so the flow can be retested or a profile can be re-entered.

| Screen | User intent | Input or output |
|---|---|---|
| Welcome | Understand the promise and begin. | Product positioning and a single primary action. |
| Location & infrastructure | Set the physical context for food safety and availability. | City and `electricity_hours_per_day`. |
| Kitchen & shopping | Define preparation, storage, and replenishment constraints. | Market travel minutes, `shopping_frequency`, and kitchen equipment. |
| Food context | Keep the plan culturally and personally relevant. | Favourite meals and local ingredients. |
| Movement baseline | Set a safe, feasible starting point. | Estimated daily steps, available minutes, and workout resources. |
| Daily dashboard | Use a concrete recommendation and understand its logic. | Daily meal, storage guidance, shopping note, workout, and fit explanation. |

### MVP acceptance criteria

The application must not generate a plan until city, electricity access, market cadence, at least one favourite meal, and available movement minutes are supplied. It must persist answers using device storage and produce deterministic results for the same input profile. The first meal output must mention one stated favourite food where available, and meal storage guidance must change when electricity availability is 12 hours or less. The movement output must not require a gym; it must use only bodyweight and resources captured during onboarding.

## 2. Recommended Cross-Platform Tech Stack

The recommended mobile client is **React Native with Expo and TypeScript**, using Expo Router for navigation and a small local state layer built from React hooks and AsyncStorage. Expo documents that a single Expo codebase can run on Android, iOS, and the web, which fits an MVP that needs broad mobile coverage without separate native teams. [1]

For Phase 1, RootedFit should be **local-first**. A local profile keeps onboarding usable with unreliable connectivity and permits fast learning before mandatory accounts, synchronisation, and operational database work are introduced. In the next phase, a TypeScript API using tRPC or REST should sit in front of PostgreSQL. Supabase is a strong managed option because it combines a Postgres database, authentication, storage, and server-side functions, with documented Expo React Native support. [2] If the team prefers direct ownership of the API, a Node.js service with Drizzle ORM is equally suitable; Drizzle provides native PostgreSQL support and a TypeScript schema-and-migration workflow. [3]

| Layer | Phase 1 recommendation | Scale-up recommendation | Rationale |
|---|---|---|---|
| Mobile app | Expo SDK, React Native, TypeScript, Expo Router | Retain the same client architecture | One typed codebase for iOS and Android, with a workable web preview. [1] |
| Interface | React Native `StyleSheet`, platform-safe controls, accessible labels | Introduce a shared component library once design stabilises | Keeps performance and native behaviour straightforward while the product is being learned. |
| Local state | React state plus AsyncStorage | Continue as offline cache alongside server data | Supports onboarding and daily plans when connectivity is unavailable. |
| API | No remote API required for the first local demo | Node.js with TypeScript and tRPC/REST | Keeps health logic and access controls server-side once accounts and shared data are introduced. |
| Database | None required for local-only MVP | PostgreSQL, preferably Supabase Postgres or managed Postgres | A relational model supports profiles, plans, sessions, auditing, and analytic queries. [2] |
| ORM and migrations | Not required for local-only MVP | Drizzle ORM and versioned migrations | Gives the backend type-aligned schema declarations and PostgreSQL migration tooling. [3] |
| Authentication | Defer until cross-device sync is needed | Supabase Auth or an equivalent OIDC provider | Avoids collecting more identifying data than the MVP needs. |
| Recommendation engine | Deterministic TypeScript rules | Versioned server-side rule engine; optional clinician-reviewed content layer | Makes outputs traceable before introducing any probabilistic model. |

## 3. Database Schema

The production schema should avoid storing all onboarding information in an opaque JSON blob. The `user_profiles` table holds scalar traits that are usually read with the profile; join tables represent multi-select values, supporting validation, filter queries, and later aggregation. Free-text food names remain user-authored records so that the system does not erase local food vocabulary.

### Core tables

| Table | Purpose | Key fields |
|---|---|---|
| `app_users` | Account identity, created only when sync is introduced. | `id UUID PK`, `auth_subject`, `created_at` |
| `user_profiles` | One current personalised context per user. | `user_id FK UNIQUE`, `city`, `electricity_hours_per_day SMALLINT`, `market_travel_minutes SMALLINT`, `shopping_frequency`, `daily_step_count INTEGER`, `workout_minutes_per_day SMALLINT`, `onboarding_completed_at`, `updated_at` |
| `profile_kitchen_equipment` | Equipment selected by a user. | `id UUID PK`, `user_id FK`, `equipment_code`, `created_at` |
| `profile_workout_resources` | Household movement resources selected by a user. | `id UUID PK`, `user_id FK`, `resource_code`, `created_at` |
| `profile_favorite_meals` | User-entered culturally familiar meals. | `id UUID PK`, `user_id FK`, `meal_name`, `rank`, `created_at` |
| `profile_local_ingredients` | User-entered available ingredients. | `id UUID PK`, `user_id FK`, `ingredient_name`, `seasonality_note NULL`, `created_at` |
| `recommendation_runs` | Auditable recommendation generation event. | `id UUID PK`, `user_id FK`, `rule_version`, `profile_snapshot JSONB`, `created_at` |
| `meal_plans` | A generated plan header. | `id UUID PK`, `recommendation_run_id FK`, `plan_date`, `storage_strategy`, `shopping_strategy`, `rationale` |
| `meal_plan_items` | Individual meals and guidance in a plan. | `id UUID PK`, `meal_plan_id FK`, `meal_slot`, `title`, `instructions`, `uses_favorite_meal BOOLEAN`, `equipment_requirements JSONB` |
| `workout_plans` | A generated movement plan header. | `id UUID PK`, `recommendation_run_id FK`, `duration_minutes`, `equipment_requirements JSONB`, `rationale` |
| `workout_exercises` | Ordered movement instructions. | `id UUID PK`, `workout_plan_id FK`, `sequence`, `exercise_name`, `repetitions_or_seconds`, `modification_note` |
| `daily_check_ins` | Optional user feedback and adherence record. | `id UUID PK`, `user_id FK`, `plan_date`, `meal_completed`, `movement_completed`, `barrier_note NULL` |

### `user_profiles` field definition

| Field | PostgreSQL type | Rule | Purpose |
|---|---|---|---|
| `user_id` | `UUID` | Primary key and foreign key to `app_users.id` | Enforces one current profile per account. |
| `city` | `TEXT` | Required, trimmed, maximum length | Places the profile in a user-described local context without forcing exact GPS collection. |
| `electricity_hours_per_day` | `SMALLINT` | Required; `0–24` check constraint | Central infrastructure variable for storage and meal-prep decisions. |
| `market_travel_minutes` | `SMALLINT` | Required; non-negative check constraint | Captures the friction of replenishing fresh food. |
| `shopping_frequency` | `TEXT` or PostgreSQL enum | Required; `daily`, `weekly`, `biweekly`, `monthly` | Controls fresh versus shelf-stable shopping assumptions. |
| `daily_step_count` | `INTEGER` | Non-negative; nullable only if the field is skipped | Baseline used to avoid an unrealistic movement jump. |
| `workout_minutes_per_day` | `SMALLINT` | Required; `0–180` check constraint | Caps the first workout session to available time. |
| `onboarding_completed_at` | `TIMESTAMPTZ` | Nullable until completion | Distinguishes a draft profile from a recommendation-ready profile. |
| `updated_at` | `TIMESTAMPTZ` | Required, auto-updated | Enables clear freshness and plan-regeneration handling. |

### Drizzle-style schema seed

The first production database migration should begin with the scalar profile model and add join tables in the same migration. This keeps the constraint logic close to the data model.

```ts
export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey().references(() => appUsers.id),
  city: text("city").notNull(),
  electricityHoursPerDay: smallint("electricity_hours_per_day").notNull(),
  marketTravelMinutes: smallint("market_travel_minutes").notNull(),
  shoppingFrequency: text("shopping_frequency").notNull(),
  dailyStepCount: integer("daily_step_count").notNull(),
  workoutMinutesPerDay: smallint("workout_minutes_per_day").notNull(),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
```

## 4. Recommendation Logic

### Design principles

The first recommendation engine should be a versioned, deterministic rule engine. Deterministic output is preferable for an MVP because product, nutrition, and content teams can inspect and adjust every branch. It also provides a reliable baseline for later experimentation; any future model should be constrained by the same safety and feasibility rules rather than allowed to ignore them.

The decision order is important. RootedFit first applies **hard feasibility filters**—electricity, cold storage, cooking equipment, shopping cadence, available time, movement resources—and only then ranks culturally familiar options. The system must never propose an overnight refrigerated batch when dependable cold storage is unavailable, never demand an unselected kitchen appliance, and never assume a gym.

### Basic algorithm

| Stage | Input | Rule | Output effect |
|---|---|---|---|
| 1. Safety context | Electricity hours and fridge availability | If power is `≤ 6`, require same-day cooking and shelf-stable staples. If power is `7–12`, use short prep windows and same-day portions. If power is `> 12` with a fridge, allow a modest two-day chilled batch. | Determines storage and leftover guidance. |
| 2. Cooking feasibility | Kitchen equipment | Remove recipes requiring unavailable equipment. Use microwave-friendly options when a microwave is present; use stovetop recipes only when a stove is present. | Determines permitted preparation methods. |
| 3. Shopping feasibility | Frequency and market travel time | For biweekly/monthly patterns or long market trips, prioritise shelf-stable staples and firm produce; reduce fragile fresh-food assumptions. | Determines shopping list and food freshness strategy. |
| 4. Familiarity and availability | Favourite meals and local ingredients | Include a favourite meal first, then pair it with entered ingredients where possible. Preserve the meal; change pairing, portion, preparation, or timing—not the user’s food identity. | Determines meal title and component suggestions. |
| 5. Movement feasibility | Minutes, steps, mat, space, weights, internet | Set session duration to the available minutes. Select bodyweight movements by default; add mat, weight, or streamed options only when stated. | Determines workout length, exercises, and optional format. |
| 6. Explanation | Triggered rules | Present each major trigger in user language. | Makes the plan auditable and understandable. |

### Worked example: 12 hours of power and only a microwave

For a person with **12 hours of electricity per day**, **no fridge**, **only a microwave**, biweekly shopping, favourite meals such as yam and pepper soup, and available carrots and cucumbers, the engine performs the following sequence:

1. The `7–12 hour` rule prohibits relying on overnight cold storage, so the plan sets a same-day portion rule and recommends shelf-stable pantry items as the foundation for the shopping rhythm.
2. The absence of a stove and the presence of a microwave filters out stove-only recipes and retains reheating, steaming, and microwave-warming methods.
3. The biweekly shopping rule prioritises durable staples and firm produce, while advising smaller refreshes of fragile items when feasible.
4. The meal scorer assigns a familiarity bonus to yam and pepper soup. It does not remove them. The recommendation becomes: keep the familiar meal, add carrots/cucumbers or another locally available vegetable/protein accompaniment, and prepare only what will be eaten that day.
5. The dashboard explains the decision: the meal is built around a favourite, uses the available appliance, and avoids a storage plan that assumes overnight refrigeration.

The currently implemented MVP rule builder is located at `lib/rootedfit-profile.ts`. It explicitly returns the meal, food-storage, shopping, and movement rationale from the stored onboarding profile.

## 5. Phase 1 Execution Plan

### Exact first step

**Build the local, four-step onboarding questionnaire before integrating authentication, a remote database, AI, recipe data, or payments.** The first decision that must work is whether RootedFit can gather the minimum context needed to reject unrealistic plans. If this experience is unclear or burdensome, a sophisticated backend will not solve the product problem.

The implementation in this project begins with a typed local profile and an empty state. This creates a shared vocabulary for the mobile interface, the deterministic recommendation engine, future database migrations, and analytics events.

```ts
export type UserProfile = {
  city: string;
  electricityHoursPerDay: number;
  marketMinutesAway: number;
  shoppingFrequency: "daily" | "weekly" | "biweekly" | "monthly" | null;
  kitchenEquipment: string[];
  favoriteMeals: string[];
  localIngredients: string[];
  dailyStepCount: number;
  workoutMinutesPerDay: number;
  workoutResources: string[];
};
```

The foundational questionnaire has now been implemented in `app/(tabs)/index.tsx`, while the local profile, storage adapter, and deterministic plan builder live in `lib/rootedfit-profile.ts`. This is deliberately a local-first MVP: it supports experimentation with the user flow while avoiding server dependencies until the team has validated that the captured context produces credible plans.

### Build sequence

| Order | Deliverable | Definition of done |
|---|---|---|
| 1 | Typed local profile and onboarding flow | Four steps capture all required variables and save them locally. |
| 2 | Deterministic rules | A 12-hour-power, microwave-only profile produces a same-day, microwave-feasible meal result. |
| 3 | Daily dashboard | The user sees meal, storage, shopping, movement, and rationale cards after onboarding. |
| 4 | Content review | Local nutrition and movement advisors review candidate meal and exercise templates for appropriateness and safety. |
| 5 | Profile editing and feedback | Users can correct context, mark a plan useful/unusable, and state a barrier. |
| 6 | Backend migration | Add authentication, PostgreSQL persistence, audit history, and versioned recommendation runs once cross-device continuity is justified. |

### Phase 1 boundary

The MVP should not make disease-treatment claims, calculate clinical nutrition prescriptions, or substitute for medical guidance. It should make feasibility-oriented suggestions and provide plain-language prompts to seek local professional support for medical, pregnancy, injury, or eating-disorder concerns before acting on a plan.

## References

[1]: https://docs.expo.dev/tutorial/introduction/ "Expo documentation: Tutorial—Using React Native and Expo"
[2]: https://supabase.com/docs "Supabase Documentation"
[3]: https://orm.drizzle.team/docs/get-started/postgresql-new "Drizzle ORM: Get Started with PostgreSQL"
