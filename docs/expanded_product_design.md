# RootedFit Expanded MVP Product Design

## Product boundary

RootedFit is a non-clinical wellness planner. It uses a person’s stated context to organise practical food, movement, and habit ideas; it does not diagnose, prescribe calories, promise weight change, or assess whether a person is fit for strenuous activity. Height, weight, gender identity, goals, and optional body measurements are collected to support respectful plan framing and self-tracking. They must be editable and locally stored in this MVP.

## Expanded onboarding architecture

| Section | Data captured | Product purpose |
|---|---|---|
| Daily context | City, electricity hours, market travel, shopping frequency | Constrains storage, freshness, and shopping recommendations. |
| Kitchen and food | Equipment, favourite meals, local ingredients, dietary notes | Establishes feasible, familiar food combinations. |
| Movement resources | Steps, workout minutes, home resources, movement limitations note | Selects appropriate durations and modalities without gym assumptions. |
| Goals and body context | Primary goal, gender identity, height, current weight, optional waist/hip/chest baseline | Lets the plan prioritise consistency, strength, energy, mobility, or body-composition habits without clinical judgement. |

All comma-separated text fields must round-trip through their own editable draft strings, rather than being rebuilt from parsed arrays during each keystroke. This prevents the user’s trailing comma and in-progress entry from disappearing. Numeric inputs must use the numeric keyboard with parsing on change and retain steppers only as convenience controls.

## Recommendation output architecture

The home experience becomes a **7-day plan** with a visible Day 1–7 selector. Each day contains a familiar-food meal idea, a DIY recipe with concise steps, a juice/hydration suggestion, a storage note, and a daily movement session. The plan separately aggregates a shopping list into pantry, produce, protein, and optional extras, then tailors it for weekly versus biweekly buying.

| Recommendation layer | Method |
|---|---|
| Feasibility filter | Exclude recipes requiring unavailable appliances or unverified cold storage; select workout options compatible with time and stated resources. |
| Variety rotation | Rotate meal anchors, vegetables/fruit, protein suggestions, cooking techniques, drink ideas, and movement categories across seven days. |
| Goal emphasis | Shift language and session balance toward consistency, strength/toning, core/mobility, energy, or body-composition habits while retaining the same safety limits. |
| Accountability layer | Give one daily check-in prompt and an encouragement message based on logged activity, not body size. |

## Local tracking architecture

| Record | Frequency | Fields |
|---|---|---|
| Daily check-in | Daily | Date, editable step count, meal-plan completion, movement completion, energy/mood, optional note. |
| Body measurement | Weekly or optional | Date, weight, waist, hip, chest, optional note. |
| Step data | Daily | Manually typed step count; optional live sensor value when supported. |

The tracking screen reports the most recent check-in and the latest weekly comparison. It avoids a medical interpretation of body measurements and uses small, process-oriented messages such as “Consistency grows from repeatable days.”
