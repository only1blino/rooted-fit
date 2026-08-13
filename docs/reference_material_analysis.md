# RootedFit Reference Material Analysis

## What the supplied materials do well

The grocery list offers a useful shopping structure: food is grouped into protein, carbohydrates, vegetables, fruits, fats, dairy, snacks/drinks, spices, and pantry items. It includes familiar Nigerian and West African options such as yam, plantain, beans, ugu, efo, okra, garden eggs, zobo, groundnuts, fish, and multiple forms of rice. This is a good pattern for RootedFit’s grocery output because it makes a week of meals actionable at the market rather than merely inspirational.

The seven-day meal-plan workbook demonstrates three useful interface patterns: an explicit day-by-day sequence, concrete meal titles, and a practical two-meal-plus-snack timetable. The food-timetable workbook adds a clear timing column and specific meal components. RootedFit should preserve this level of specificity by showing ingredient lists, portions expressed in ordinary household units where feasible, preparation steps, and a “why this fits your context” note.

## What RootedFit will not reproduce

The supplied examples contain medical or body-change claims, including statements about “fat-burning enzymes,” targeted lower-belly change, and postpartum physiology. RootedFit will not present those claims as facts or build medical/postpartum advice without a clinician-reviewed content pathway. It will retain the useful structure—familiar meals, timing, ingredients, shopping categories, and practical preparation—while framing the app as a non-clinical wellness and habit planner.

> RootedFit should protect food enjoyment and prevent burnout. Dietary restrictions and disliked foods remove only unsafe or unwanted items; favourites and comfort foods remain preferred plan anchors unless the user explicitly excludes them.

## Location-aware catalogue design

The first release will use a curated **Nigeria-first catalogue of 50 foods and ingredients**, plus a fruit subset, because the reference materials and earlier onboarding examples point to Nigerian use cases. The catalogue remains editable and is displayed as suggestions, not as a claim that every item is available in every city. The design should evolve to country modules backed by reputable regional food-composition and dietary-guideline sources, including the FAO/INFOODS Western Africa food composition resource and FAO Nigeria food-based dietary guidance. [1] [2]

## Requirements translated into implementation

| Requested capability | RootedFit implementation decision |
|---|---|
| Top 50 country foods and ingredients | Country selector with a Nigeria-first curated catalogue, searchable suggestion chips, favourite fruits, and editable custom additions. |
| Dietary restrictions and dislikes | Separate multi-select fields. Restrictions are hard exclusions; dislikes are soft exclusions. Favourite/comfort foods retain high recommendation priority. |
| Secondary focus | One primary focus plus multiple optional secondary focuses that adjust plan language and session mix. |
| Gender and units | Gender identity uses an explicit selector with “self-describe” and “prefer not to say”; measurement settings switch metric/imperial labels and values. |
| Progress photos | Local front, side, and back photo records with date labels; never uploaded in the MVP. |
| Specific outputs | Meal slots, ingredient quantities, step-by-step DIY recipes, specific grocery quantities, and themed workout blocks rather than generic suggestions. |

## References

[1]: https://openknowledge.fao.org/handle/20.500.14283/ca7779b "FAO/INFOODS Food Composition Table for Western Africa"
[2]: https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/nigeria/en/ "FAO: Food-based dietary guidelines—Nigeria"
