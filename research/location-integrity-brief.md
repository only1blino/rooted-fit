# RootedFit Location Integrity Research Notes

## Toronto and Ontario

Ontario’s Foodland availability guide lists peak local produce by season and explicitly cautions that dates can vary by several weeks with weather and varieties. For Toronto, the product should distinguish **local seasonal cues** from ordinary year-round supermarket availability. Its recurring Ontario-appropriate foundations include potatoes, carrots, onions, greenhouse tomatoes and peppers, cabbage, mushrooms, oats, beans, lentils, eggs, dairy or alternatives, frozen vegetables, and pantry fish. Seasonal overlays can add Ontario apples, berries, sweet corn, squash, broccoli, greens, stone fruit, grapes, and field tomatoes when the appropriate month window applies.

Toronto’s own food-security guidance states that residents deserve access to safe, affordable, nutritious, and culturally relevant food. Canada’s Food Policy likewise recognises culturally diverse food and community-led approaches. This supports an explicit **food heritage and familiar-food preference** in RootedFit; it does not support assuming Nigerian, Ghanaian, or any other diaspora cuisine from a Toronto city selection alone.

## Product Rules Derived from These Sources

| Rule | Implementation consequence |
|---|---|
| City determines local availability and everyday default recipes. | Toronto receives a Canada/Toronto pack, never a Nigerian fallback. |
| Country determines national pantry and recipe baseline. | Add Canada as a first-class country rather than routing it through `Other` or the United States. |
| Food heritage is personal, not inferred from a city. | Add optional familiar-cuisine preferences; only then may a Nigerian meal such as moi moi appear in a Toronto plan. |
| Seasonality is uncertain and local harvest timing shifts. | Present seasonality as a cue, retain frozen/shelf-stable alternatives, and avoid claims of guaranteed availability. |
| Unsupported locations must not inherit a foreign pack. | Use a neutral locality-safe plan and label its limited confidence, asking the user to choose available foods. |

## Approved Recommendation Model

| Layer | Source of truth | May influence | Must never infer |
|---|---|---|---|
| **Resolved city** | A globally unique alias map, such as `toronto` → Toronto, Canada | Default recipe pack, market cues, local seasonal overlay, title and ingredient vocabulary | A user’s ethnicity, food heritage, religion, or household budget |
| **Country** | The selected country, except when a known city unambiguously resolves to another country | Country-wide starter pack only when no city pack exists | The cuisine of a neighbouring country or diaspora community |
| **Food heritage** | Explicit user selection only | Optional cultural recipe library and familiar-food substitutions | Availability of every heritage ingredient at the current location |
| **Declared pantry** | Ingredient choices and typed local ingredients | Prioritisation and substitutions | A complete local supply chain |
| **Kitchen, power, shopping rhythm** | Existing RootedFit profile fields | Storage, equipment, prep, and purchase-unit guidance | Food identity or geography |
| **Season** | City’s climate/market overlay and current month | “In-season cue” language and optional produce swaps | Guaranteed harvest dates or out-of-season unavailability |

### Strict Selection Order

1. Resolve the typed city against the global city map. A known match always wins over an accidentally retained default country, so `Toronto` resolves to **Canada**, not Nigeria.
2. Select a two-week recipe pack belonging only to the resolved city. If a city pack is unavailable, use that country’s neutral, non-heritage fallback; never use another country’s pack.
3. Apply declared food heritage only as an opt-in overlay. It can propose a familiar meal or substitution but must label the ingredient check and cannot replace an entire city pack by default.
4. Apply explicit likes, dislikes, dietary restrictions, local pantry entries, storage, power, and equipment filters.
5. If no verified city or country pack exists, show a conservative locality-safe starter set using neutral titles rather than masquerading as a regional cuisine.

### Required Engineering Boundaries

The engine must carry a `packId`, `country`, `cityAliases`, and `recipeOrigin` alongside every recipe. Assertions must reject a recipe whose origin country differs from the resolved location country unless that origin is explicitly present in `foodHeritagePreferences`. Breakfast, lunch, dinner, recipe swaps, grocery lists, ratings, and both rotation weeks must all read from this same resolved pack, eliminating the current separate Nigerian breakfast/fallback libraries.

## Africa-Wide Evidence and Implications

FAO’s *Compendium of Forgotten Foods in Africa* describes Africa as having a diverse set of locally adapted indigenous food crops. This confirms that Nigeria, Ghana, Kenya, South Africa, Tanzania, Uganda, Rwanda, Zambia, Senegal, and Ethiopia must not share a single “African” template. The system needs separately curated country and city packs, each with its own staple, legumes, greens, fish/meat options, meal names, preparation approaches, and seasonal or storage constraints.

The design must also avoid the inverse error: a culturally meaningful food should not be removed merely because it is not the current city default. Users should be able to explicitly elect a familiar food heritage or add a named favourite, after which the recommendation engine can include suitable cultural meals and make an availability note. This preserves autonomy without pretending that the city alone reveals a person’s food identity.

FAO’s South Africa summary shows a nationally specific food guide with local and affordable groupings: starchy foods; vegetables and fruit; dry beans, peas, lentils and soya; chicken, fish, meat and eggs; milk, maas or yoghurt; fats and oils; and water. The application must preserve these South African anchors separately from Nigerian, Ghanaian, Kenyan, or broader African recipes. Country-level guidance should inform ingredient diversity and recipe balance, but it must never be used to erase regional cuisines or turn a location cue into a clinical prescription.

For United Kingdom and United States packs, official guidance supports practical use of fresh, frozen, canned, and shelf-stable foods. RootedFit should use that evidence to adapt the **storage and shopping layer**—for example, frozen vegetables, tinned fish, beans, and planned leftovers where the profile has appropriate storage—not to suggest that UK or US dishes belong in every other city. The same locality boundary applies to their titles, staples, and meal sequences.

## Sources

1. Government of Ontario, Foodland Ontario, “Availability guide”: https://www.ontario.ca/foodland/page/availability-guide
2. City of Toronto, “Food Insecurity in Toronto”: https://www.toronto.ca/city-government/accountability-operations-customer-service/long-term-vision-plans-and-strategies/poverty-reduction-strategy/food-security-in-toronto-poverty-reduction-strategy/
3. Agriculture and Agri-Food Canada, “Food Policy for Canada”: https://agriculture.canada.ca/en/department/initiatives/food-policy-canada
4. Food and Agriculture Organization of the United Nations, *Compendium of Forgotten Foods in Africa*: https://openknowledge.fao.org/handle/20.500.14283/cc5044en
5. Food and Agriculture Organization of the United Nations, “Food-based dietary guidelines – South Africa”: https://www.fao.org/nutrition/education/food-dietary-guidelines/regions/countries/south-africa/en/
6. Food and Agriculture Organization of the United Nations, “Food-based dietary guidelines – Africa”: https://www.fao.org/nutrition/education/dietary-guidelines/regions/africa/en/
7. NHS, “Eating a balanced diet”: https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eating-a-balanced-diet/
8. U.S. Department of Agriculture, “Healthy Eating on a Budget”: https://www.usda.gov/about-usda/news/blog/healthy-eating-budget
