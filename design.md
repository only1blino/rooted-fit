# RootedFit Mobile Design Plan

## Product Intent

RootedFit helps people build sustainable movement and eating routines around the reality of their home, food environment, electricity access, and available time. The experience should feel calm, practical, and respectful: a plan never treats familiar foods as failures, and every recommendation explains why it fits the user's constraints.

## Screen List

| Screen | Primary content and functionality |
|---|---|
| Welcome | Introduces the promise: realistic routines built around the user's real home and local food. Starts onboarding. |
| Location and infrastructure | Captures city and daily electricity availability. Uses a numeric stepper for hours to make one-handed input quick. |
| Kitchen and shopping | Captures market proximity, shopping frequency, and available cooking or storage equipment through multi-select chips. |
| Food context | Captures favourite meals and locally available ingredients as friendly, open-ended text fields with example prompts. |
| Movement baseline | Captures typical daily steps, daily workout minutes, and household workout resources through compact selectors. |
| Plan readiness | Summarises the captured context, sets expectation that food preferences remain part of the plan, and creates the first plan. |
| Daily dashboard | Shows a concise daily meal suggestion, movement routine, infrastructure-fit explanation, and the user's saved context at a glance. |
| Profile and preferences (Phase 2) | Lets the user revise location, access conditions, equipment, preferences, and goals without losing history. |

## Primary User Flows

The primary flow is: **Welcome → Location & infrastructure → Kitchen & shopping → Food context → Movement baseline → Plan readiness → Daily dashboard**. Each onboarding step saves locally, displays clear progress, and allows the user to go back without re-entering answers.

The daily-use flow is: **Open dashboard → Read today’s meal and movement suggestions → Open the context explanation → Complete or adjust a suggestion (Phase 2)**. Recommendation output uses the supplied foods and equipment first; it never labels a favourite local meal as inherently unhealthy.

## Layout and Interaction Principles

The application is designed for a 9:16 portrait canvas and comfortable one-handed use. Primary actions sit in the lower third of the screen, input controls use at least 44-point touch targets, and the content width remains intentionally narrow for readable scanning. Each form screen contains one decision group, a visible progress indicator, and a single lower-anchored continuation action.

The visual hierarchy follows iOS conventions: a large, semibold title; supporting explanation in a muted body style; grouped rounded cards; predictable Back/Continue controls; and lightweight feedback after a choice. No elaborate animation is needed for the MVP—small press-state changes and a subtle progress transition are sufficient.

## Color Choices

| Role | Color | Purpose |
|---|---|---|
| Rooted green | `#2D6A4F` | Primary actions, progress, and confident health guidance. |
| Leaf green | `#95D5B2` | Selected option backgrounds and supportive highlights. |
| Warm cream | `#F8F6EF` | Background that feels domestic and food-friendly rather than clinical. |
| Clay | `#C26A4A` | Food and preparation accents; gives local-meal content warmth. |
| Charcoal | `#1F2A25` | High-legibility primary text. |
| Sage gray | `#6B7A70` | Supporting text and low-emphasis labels. |
| Soft line | `#DDE5DA` | Card borders and dividers. |

## Accessibility and Content Rules

All controls carry text labels and visible selected states; color is never the only signal. The plan summary uses plain-language rationale such as “designed for short refrigeration windows” rather than judgement. Favourite foods are framed as ingredients in a balanced pattern—through portions, pairings, and preparation choices—rather than as foods to remove.
