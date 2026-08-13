# RootedFit Expanded MVP Research Notes

## Evidence reviewed

The World Health Organization states that a diversified, balanced diet varies with personal characteristics, cultural context, locally available foods, and dietary customs. Its principles of adequacy, balance, moderation, and diversity support RootedFit’s choice to retain familiar meals while varying complementary ingredients and preparation patterns rather than prescribing a universal meal list. [1]

WHO also notes that some physical activity is better than none. For adults, its public-health guidance describes a weekly target of at least 150 minutes of moderate activity or 75 minutes of vigorous activity, alongside muscle-strengthening activity involving major muscle groups on two or more days per week. RootedFit should treat this as a broad progression reference—not a day-one target—and scale sessions to the person’s stated time, baseline, resources, mobility, and feedback. [2]

CDC emergency food-safety guidance is a conservative ceiling for RootedFit’s power-aware meal language: a refrigerator with its door closed may keep food safe for about four hours during an outage, and uncertain perishable food should not be tasted to assess safety. RootedFit should therefore never infer food safety from the user’s average hours of electricity alone. It should default to same-day portions where consistent cold storage is uncertain and link users to local guidance where available. [3]

Expo’s pedometer module provides an optional device step sensor on iOS and Android. It requires availability and permission checks, does not deliver background updates, and iOS historical queries are limited to the preceding seven days. The MVP should therefore retain an editable manual step entry as the reliable default and offer live device steps as a convenience rather than a source of truth. [4]

## Product implications

| Product area | Decision for the expanded MVP |
|---|---|
| Food planning | Create a seven-day rotating plan with familiar-meal anchors, varied pairings, locally entered ingredients, appliance feasibility, fresh-versus-pantry storage strategy, and short recipes. |
| Safety messaging | Use non-clinical, feasibility-oriented language. Avoid calorie prescriptions, diagnosis, or promises of weight change. Show a short “adjust or seek professional guidance” note for pain, pregnancy, injury, or a medical condition. |
| Goals and body context | Ask goal, gender identity, height, current weight, and optional weekly measurements with a plain privacy explanation. Use goal to prioritise plan emphasis, not to infer medical needs. |
| Movement planning | Rotate among strength/toning, Pilates-inspired core, mobility, walking/steps, and recovery. Provide lower-impact alternatives and do not require gym equipment. |
| Tracking | Keep daily check-ins and weekly measurement history local in the MVP. Track habits and trends rather than framing a single weight measure as success or failure. |
| Steps | Use typed manual steps as the default. Offer a device sensor connection only when a compatible device and permission are available. |

## References

[1]: https://www.who.int/news-room/fact-sheets/detail/healthy-diet "WHO: Healthy diet"
[2]: https://www.who.int/initiatives/behealthy/physical-activity "WHO: Physical activity"
[3]: https://www.cdc.gov/food-safety/foods/keep-food-safe-after-emergency.html "CDC: Keep Food Safe After a Disaster or Emergency"
[4]: /home/ubuntu/rooted-fit_helper/docs/sensors/pedometer/DOCS.md "Expo SDK 54: Pedometer"
