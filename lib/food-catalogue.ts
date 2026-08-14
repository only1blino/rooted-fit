export type FoodCountry = "Nigeria" | "Ghana" | "Kenya" | "South Africa" | "United Kingdom" | "United States" | "Canada" | "Other";

export const COUNTRY_OPTIONS: FoodCountry[] = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Canada", "Other"];

type CityFoodPack = { aliases: string[]; label: string; foods: string[]; meals: string[]; fruits: string[] };

const CATALOGUES: Record<FoodCountry, string[]> = {
  Nigeria: ["Yam", "Cassava", "Garri", "Plantain", "Sweet potato", "Cocoyam", "Ofada rice", "Parboiled rice", "Millet", "Sorghum", "Maize", "Oats", "Brown beans", "Black-eyed beans", "Bambara beans", "Groundnuts", "Tiger nuts", "Chicken", "Eggs", "Catfish", "Tilapia", "Mackerel", "Smoked fish", "Crayfish", "Lean beef", "Goat meat", "Ugu", "Efo or shoko", "Waterleaf", "Bitterleaf", "Okra", "Garden eggs", "Tomato", "Onion", "Bell pepper", "Scotch bonnet", "Cabbage", "Carrot", "Cucumber", "Green beans", "Spinach", "Pumpkin leaves", "Scent leaf", "Ginger", "Garlic", "Palm oil", "Groundnut oil", "Tomato paste", "Locust beans", "Pepper soup spice"],
  Ghana: ["Plantain", "Cocoyam", "Cassava", "Yam", "Sweet potato", "Millet", "Maize", "Oats", "Black-eyed beans", "Bambara beans", "Groundnuts", "Eggs", "Chicken", "Tilapia", "Mackerel", "Smoked fish", "Sardines", "Goat meat", "Kontomire", "Ayoyo leaves", "Okra", "Garden eggs", "Tomato", "Onion", "Pepper", "Cabbage", "Carrot", "Cucumber", "Avocado", "Mango", "Pineapple", "Watermelon", "Banana", "Orange", "Papaya", "Coconut", "Tiger nuts", "Hibiscus", "Ginger", "Dawadawa", "Palm oil", "Cocoa powder"],
  Kenya: ["Maize", "Millet", "Sorghum", "Rice", "Chapati flour", "Sweet potato", "Arrowroot", "Cassava", "Green grams", "Kidney beans", "Cowpeas", "Lentils", "Groundnuts", "Eggs", "Chicken", "Tilapia", "Omena", "Beef", "Goat meat", "Milk", "Plain yoghurt", "Sukuma wiki", "Managu", "Spinach", "Cabbage", "Kale", "Tomato", "Onion", "Carrot", "Pumpkin", "Avocado", "Mango", "Banana", "Pineapple", "Passion fruit", "Watermelon", "Orange", "Papaya", "Guava", "Tamarind", "Coconut", "Tea", "Ginger", "Garlic", "Coriander", "Pilau spices"],
  "South Africa": ["Pap", "Samp", "Mealie meal", "Brown rice", "Oats", "Sweet potato", "Butternut", "Potato", "Beans", "Lentils", "Chickpeas", "Eggs", "Chicken", "Pilchards", "Hake", "Tinned fish", "Lean beef", "Mince", "Plain yoghurt", "Amasi", "Spinach", "Moroho", "Cabbage", "Tomato", "Onion", "Carrot", "Green beans", "Peppers", "Beetroot", "Avocado", "Apple", "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Grapes", "Watermelon", "Peach", "Pear", "Maize", "Sorghum", "Peanut butter", "Sunflower seeds", "Pumpkin seeds", "Rooibos tea", "Ginger", "Garlic", "Curry spice", "Chakalaka vegetables"],
  "United Kingdom": ["Oats", "Wholegrain bread", "Potatoes", "Sweet potatoes", "Brown rice", "Wholewheat pasta", "Couscous", "Lentils", "Chickpeas", "Kidney beans", "Eggs", "Chicken", "Tinned mackerel", "Salmon", "Tuna", "Lean beef", "Plain yoghurt", "Milk", "Tofu", "Cheddar", "Spinach", "Kale", "Broccoli", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Frozen mixed vegetables", "Apple", "Banana", "Orange", "Berries", "Pears", "Grapes", "Melon", "Pineapple", "Avocado", "Kiwi", "Peanut butter", "Olive oil", "Rapeseed oil", "Seeds", "Walnuts", "Tea", "Herbs", "Garlic", "Ginger", "Tinned tomatoes"],
  "United States": ["Oats", "Wholegrain bread", "Brown rice", "Quinoa", "Potatoes", "Sweet potatoes", "Wholewheat pasta", "Black beans", "Kidney beans", "Lentils", "Chickpeas", "Eggs", "Chicken", "Turkey", "Salmon", "Tuna", "Sardines", "Lean beef", "Greek yoghurt", "Tofu", "Spinach", "Kale", "Broccoli", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Frozen vegetables", "Apple", "Banana", "Orange", "Berries", "Grapes", "Melon", "Pineapple", "Mango", "Avocado", "Peach", "Peanut butter", "Olive oil", "Nuts", "Seeds", "Corn", "Popcorn", "Herbs", "Garlic", "Ginger", "Tinned tomatoes"],
  Canada: ["Oats", "Wholegrain bread", "Potatoes", "Sweet potatoes", "Brown rice", "Barley", "Wholewheat pasta", "Red lentils", "Chickpeas", "Black beans", "Kidney beans", "Eggs", "Chicken", "Tinned salmon", "Tinned tuna", "Tofu", "Plain yoghurt", "Milk or fortified soy milk", "Cheddar", "Cottage cheese", "Spinach", "Kale", "Broccoli", "Cabbage", "Carrots", "Mushrooms", "Tomatoes", "Onions", "Peppers", "Frozen mixed vegetables", "Apples", "Pears", "Berries", "Grapes", "Oranges", "Bananas", "Ontario apples", "Maple syrup", "Peanut butter", "Canola oil", "Olive oil", "Pumpkin seeds", "Sunflower seeds", "Tinned tomatoes", "Low-sodium stock", "Herbs", "Garlic", "Ginger"],
  Other: ["Rice", "Oats", "Maize", "Millet", "Sorghum", "Yam", "Cassava", "Plantain", "Sweet potato", "Potato", "Beans", "Lentils", "Chickpeas", "Groundnuts", "Eggs", "Chicken", "Fish", "Tinned fish", "Tofu", "Lean meat", "Leafy greens", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Okra", "Pumpkin", "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Watermelon", "Apple", "Avocado", "Coconut", "Dates", "Olive oil", "Palm oil", "Peanut butter", "Nuts", "Seeds", "Yoghurt", "Milk", "Ginger", "Garlic", "Herbs and spices"],
};

const MEAL_SUGGESTIONS: Record<FoodCountry, string[]> = {
  Nigeria: ["Jollof rice", "Beans porridge", "Yam and egg sauce", "Efo riro", "Moi moi", "Akara and pap", "Pepper soup", "Amala and ewedu", "Eba and soup", "Pounded yam and soup", "Ofada rice and stew", "Plantain and beans"],
  Ghana: ["Waakye", "Jollof rice", "Banku and soup", "Kenkey and fish", "Red red", "Fufu and light soup", "Tuo zaafi"],
  Kenya: ["Githeri", "Ugali and sukuma wiki", "Pilau", "Chapati and beans", "Rice and stew", "Ndengu stew"],
  "South Africa": ["Pap and chakalaka", "Samp and beans", "Moroho and pap", "Pilchards and rice", "Bean curry and roti"],
  "United Kingdom": ["Jacket potato and beans", "Porridge", "Lentil soup and bread", "Chicken and vegetables", "Baked beans on toast"],
  "United States": ["Beans and rice", "Oatmeal", "Chicken and vegetables", "Vegetable pasta", "Black bean corn bowl"],
  Canada: ["Lentil and vegetable soup", "Sheet-pan chicken with root vegetables", "Salmon and potato bowl", "Bean and vegetable chilli", "Mushroom and barley stew", "Oatmeal with apple and seeds"],
  Other: ["Rice and beans", "Vegetable stew", "Porridge", "Soup and a staple", "Egg and vegetable bowl"],
};

const FRUITS: Record<FoodCountry, string[]> = {
  Nigeria: ["Orange", "Banana", "Pineapple", "Pawpaw", "Watermelon", "Mango", "Avocado", "Apple", "Pear", "Guava", "Tangerine", "Dates"],
  Ghana: ["Mango", "Pineapple", "Watermelon", "Banana", "Orange", "Papaya", "Avocado", "Coconut", "Guava", "Apple", "Pear", "Tangerine"],
  Kenya: ["Mango", "Banana", "Pineapple", "Passion fruit", "Watermelon", "Orange", "Papaya", "Guava", "Avocado", "Tamarind", "Apple", "Coconut"],
  "South Africa": ["Apple", "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Grapes", "Watermelon", "Peach", "Pear", "Avocado", "Naartjie"],
  "United Kingdom": ["Apple", "Banana", "Orange", "Berries", "Pear", "Grapes", "Melon", "Pineapple", "Avocado", "Kiwi", "Mango", "Peach"],
  "United States": ["Apple", "Banana", "Orange", "Berries", "Grapes", "Melon", "Pineapple", "Mango", "Avocado", "Peach", "Pear", "Watermelon"],
  Canada: ["Apple", "Pear", "Berries", "Grapes", "Orange", "Banana", "Peach", "Plum", "Melon", "Pineapple", "Mango", "Kiwi"],
  Other: ["Banana", "Orange", "Mango", "Pineapple", "Papaya", "Watermelon", "Apple", "Avocado", "Grapes", "Guava", "Pear", "Dates"],
};

const CITY_PACKS: Record<FoodCountry, CityFoodPack[]> = {
  Nigeria: [
    { aliases: ["lagos", "ikeja", "lekki", "surulere"], label: "Lagos market cues", foods: ["Ewedu", "Waterleaf", "Banga spice", "Ponmo", "Fresh prawns"], meals: ["Ewedu with amala", "Asaro", "Efo riro with fish"], fruits: ["Agbalumo", "Coconut"] },
    { aliases: ["abuja", "gwarinpa", "wuse"], label: "Abuja market cues", foods: ["Soya beans", "Zobo leaves", "Tigernuts", "Fresh tilapia"], meals: ["Miyan kuka and tuwo", "Beans and plantain", "Grilled fish and vegetables"], fruits: ["Watermelon", "Pawpaw"] },
  ],
  Ghana: [
    { aliases: ["accra", "tema"], label: "Accra market cues", foods: ["Koobi", "Gari", "Shito ingredients", "Fresh herrings"], meals: ["Kenkey with fish", "Ga kenkey and pepper", "Red red"], fruits: ["Coconut", "Pineapple"] },
    { aliases: ["kumasi", "ashanti"], label: "Kumasi market cues", foods: ["Cocoyam leaves", "Garden eggs", "Dawadawa", "Snails"], meals: ["Fufu and light soup", "Ampesi with kontomire", "Etor"], fruits: ["Avocado", "Orange"] },
  ],
  Kenya: [
    { aliases: ["nairobi", "kiambu", "kikuyu"], label: "Nairobi market cues", foods: ["Ndengu", "Terere", "Arrowroot", "Omena"], meals: ["Ndengu stew and chapati", "Githeri", "Sukuma wiki with ugali"], fruits: ["Passion fruit", "Avocado"] },
    { aliases: ["mombasa", "malindi", "kilifi"], label: "Coastal Kenya market cues", foods: ["Coconut milk", "Tamarind", "Cassava", "Fresh coastal fish"], meals: ["Coconut fish stew", "Mahamri and bean stew", "Pilau"], fruits: ["Mango", "Coconut"] },
  ],
  "South Africa": [
    { aliases: ["johannesburg", "soweto", "pretoria"], label: "Gauteng market cues", foods: ["Moroho", "Samp", "Sugar beans", "Chakalaka mix"], meals: ["Samp and beans", "Pap with chakalaka", "Moroho and chicken stew"], fruits: ["Naartjie", "Apple"] },
    { aliases: ["cape town", "stellenbosch"], label: "Cape market cues", foods: ["Hake", "Butternut", "Lentils", "Cape herbs"], meals: ["Hake with roasted butternut", "Lentil bobotie-style bake", "Vegetable bredie"], fruits: ["Grapes", "Pear"] },
    { aliases: ["durban", "umhlanga"], label: "Durban market cues", foods: ["Split peas", "Curry leaves", "Potatoes", "Amasi"], meals: ["Bean curry and roti", "Vegetable curry with rice", "Pap and spinach"], fruits: ["Mango", "Banana"] },
  ],
  "United Kingdom": [
    { aliases: ["london"], label: "London market cues", foods: ["Red lentils", "Tinned mackerel", "Frozen vegetables", "Plantain"], meals: ["Lentil dhal and rice", "Jacket potato with beans", "Mackerel and greens"], fruits: ["Berries", "Pear"] },
    { aliases: ["birmingham", "manchester", "leeds"], label: "UK city market cues", foods: ["Chickpeas", "Couscous", "Tinned tomatoes", "Spinach"], meals: ["Chickpea tomato stew", "Couscous and vegetables", "Bean chilli with rice"], fruits: ["Apple", "Orange"] },
  ],
  "United States": [
    { aliases: ["houston", "atlanta", "new orleans", "dallas"], label: "Southern US market cues", foods: ["Black-eyed peas", "Collard greens", "Sweet corn", "Okra"], meals: ["Black-eyed peas and greens", "Corn and bean bowl", "Okra tomato stew with rice"], fruits: ["Peach", "Watermelon"] },
    { aliases: ["los angeles", "san diego", "phoenix", "el paso"], label: "Southwest market cues", foods: ["Pinto beans", "Corn tortillas", "Avocado", "Salsa ingredients"], meals: ["Bean and corn tacos", "Vegetable burrito bowl", "Chicken tortilla soup"], fruits: ["Orange", "Mango"] },
    { aliases: ["new york", "chicago", "detroit", "boston"], label: "US city market cues", foods: ["Brown rice", "Kale", "Canned salmon", "Sweet potatoes"], meals: ["Salmon rice bowl", "Sweet potato and bean tray", "Vegetable pasta"], fruits: ["Apple", "Berries"] },
  ],
  Canada: [
    { aliases: ["toronto", "north york", "scarborough", "etobicoke", "mississauga", "brampton", "markham"], label: "Toronto and GTA market cues", foods: ["Ontario apples", "Potatoes", "Carrots", "Cabbage", "Mushrooms", "Frozen vegetables", "Tinned salmon", "Red lentils"], meals: ["Lentil and vegetable soup", "Salmon and potato bowl", "Bean and vegetable chilli", "Mushroom barley stew", "Sheet-pan chicken with root vegetables", "Tofu vegetable stir-fry"], fruits: ["Apple", "Pear", "Berries"] },
    { aliases: ["vancouver", "surrey", "burnaby", "richmond"], label: "Metro Vancouver market cues", foods: ["Salmon", "Tofu", "Bok choy", "Mushrooms", "Brown rice", "Frozen edamame"], meals: ["Salmon rice bowl", "Tofu and bok choy stir-fry", "Vegetable lentil soup"], fruits: ["Berries", "Apple"] },
    { aliases: ["montreal", "laval", "longueuil"], label: "Montréal market cues", foods: ["Lentils", "Potatoes", "Carrots", "Cabbage", "Eggs", "Tinned fish"], meals: ["Lentil vegetable soup", "Potato and bean skillet", "Tinned fish salad with bread"], fruits: ["Apple", "Pear"] },
  ],
  Other: [
    { aliases: ["mumbai", "delhi", "bengaluru", "bangalore", "hyderabad", "pune"], label: "Indian city market cues", foods: ["Toor dal", "Chickpeas", "Okra", "Cumin", "Turmeric"], meals: ["Dal and rice", "Chana masala", "Vegetable khichdi"], fruits: ["Guava", "Papaya"] },
    { aliases: ["karachi", "lahore", "islamabad"], label: "Pakistan city market cues", foods: ["Masoor dal", "Basmati rice", "Okra", "Coriander"], meals: ["Daal chawal", "Chickpea curry", "Chicken vegetable pulao"], fruits: ["Guava", "Dates"] },
    { aliases: ["dhaka", "chittagong"], label: "Bangladesh city market cues", foods: ["Red lentils", "Mustard oil", "Rohu fish", "Bottle gourd"], meals: ["Dal and rice", "Fish curry with vegetables", "Khichuri"], fruits: ["Jackfruit", "Mango"] },
    { aliases: ["manila", "cebu", "davao"], label: "Philippine city market cues", foods: ["Mung beans", "Malunggay", "Squash", "Tinned sardines"], meals: ["Mung bean stew", "Chicken tinola", "Vegetable rice bowl"], fruits: ["Banana", "Pineapple"] },
    { aliases: ["addis", "addis ababa"], label: "Ethiopian city market cues", foods: ["Teff", "Red lentils", "Berbere", "Cabbage"], meals: ["Misir wot with injera", "Shiro stew", "Atakilt wat"], fruits: ["Papaya", "Mango"] },
    { aliases: ["dar es salaam", "dar", "arusha", "dodoma"], label: "Tanzanian city market cues", foods: ["Cassava", "Coconut milk", "Pigeon peas", "Sukuma wiki"], meals: ["Maharage ya nazi", "Ugali and greens", "Rice and bean stew"], fruits: ["Mango", "Coconut"] },
    { aliases: ["kampala", "entebbe"], label: "Ugandan city market cues", foods: ["Matoke", "Groundnut paste", "Silver fish", "Beans"], meals: ["Matoke with groundnut sauce", "Beans and sweet potato", "Rice with greens"], fruits: ["Jackfruit", "Pineapple"] },
    { aliases: ["kingston", "montego bay"], label: "Jamaican city market cues", foods: ["Callaloo", "Red peas", "Scotch bonnet", "Breadfruit"], meals: ["Rice and peas", "Callaloo and eggs", "Red pea soup"], fruits: ["Mango", "Soursop"] },
    { aliases: ["kigali", "ruanda", "rwanda"], label: "Kigali market cues", foods: ["Cassava leaves", "Beans", "Sweet potatoes", "Plantain", "Tilapia"], meals: ["Isombe with beans", "Sweet potatoes and beans", "Plantain and vegetable stew"], fruits: ["Avocado", "Papaya"] },
    { aliases: ["lusaka", "ndola", "kitwe"], label: "Zambian city market cues", foods: ["Mealie meal", "Rape greens", "Groundnut paste", "Beans", "Dried fish"], meals: ["Nshima with greens and beans", "Groundnut relish with sweet potato", "Beans and rape with nshima"], fruits: ["Mango", "Guava"] },
    { aliases: ["dakar", "thies", "saint-louis"], label: "Dakar market cues", foods: ["Millet", "Black-eyed peas", "Peanut paste", "Fresh fish", "Cassava"], meals: ["Thieboudienne-style fish and rice", "Mafe peanut stew", "Black-eyed pea and millet bowl"], fruits: ["Mango", "Baobab fruit"] },
  ],
};

function unique(values: string[]) { return Array.from(new Set(values)); }

export type ResolvedFoodLocation = { country: FoodCountry; city: string; pack: CityFoodPack | null; isCityMatch: boolean };

/** Resolves a known city globally so an accidentally retained default country cannot leak another cuisine into the plan. */
export function resolveFoodLocation(country: FoodCountry, city = ""): ResolvedFoodLocation {
  const normalized = city.trim().toLowerCase();
  for (const [candidateCountry, packs] of Object.entries(CITY_PACKS) as [FoodCountry, CityFoodPack[]][]) {
    const pack = packs.find((candidate) => candidate.aliases.some((alias) => normalized.includes(alias)));
    if (pack) return { country: candidateCountry, city: city.trim(), pack, isCityMatch: true };
  }
  return { country, city: city.trim(), pack: null, isCityMatch: false };
}

export function cityFoodPack(country: FoodCountry, city = "") {
  return resolveFoodLocation(country, city).pack;
}

export function locationSuggestionLabel(country: FoodCountry, city = "") {
  const resolved = resolveFoodLocation(country, city);
  const pack = resolved.pack;
  if (pack) return pack.label;
  return city.trim() ? `${city.trim()}, ${country} starter suggestions` : `${country} starter suggestions`;
}

export function suggestedFoods(country: FoodCountry, city = "") { const resolved = resolveFoodLocation(country, city); return unique([...(resolved.pack?.foods ?? []), ...CATALOGUES[resolved.country]]).slice(0, 50); }
export function suggestedFruits(country: FoodCountry, city = "") { const resolved = resolveFoodLocation(country, city); return unique([...(resolved.pack?.fruits ?? []), ...FRUITS[resolved.country]]).slice(0, 12); }
export function suggestedMeals(country: FoodCountry, city = "") { const resolved = resolveFoodLocation(country, city); return unique([...(resolved.pack?.meals ?? []), ...MEAL_SUGGESTIONS[resolved.country]]); }
/** Cultural meal ideas are displayed only after the user explicitly elects a food heritage; they never alter a city default on their own. */
export function heritageMealSuggestions(preferences: FoodCountry[]) { return unique(preferences.flatMap((country) => MEAL_SUGGESTIONS[country])); }

/** Seasonal cues are optional market prompts, not a claim that each item is guaranteed or affordable today. */
export function seasonalFoodCues(country: FoodCountry, city = "", date = new Date()) {
  const resolved = resolveFoodLocation(country, city);
  if (resolved.country === "Canada" && resolved.pack?.aliases.includes("toronto")) {
    const month = date.getMonth() + 1;
    if ([6, 7, 8, 9].includes(month)) return ["Ontario berries or peaches", "Sweet corn", "Field tomatoes", "Broccoli or green beans"];
    if ([10, 11].includes(month)) return ["Ontario apples or pears", "Winter squash", "Carrots", "Cabbage or kale"];
    if ([12, 1, 2, 3].includes(month)) return ["Ontario apples from storage", "Carrots", "Potatoes", "Greenhouse tomatoes or peppers"];
    return ["Rhubarb or greenhouse strawberries", "Asparagus", "Mushrooms", "Greenhouse greens"];
  }
  return [];
}
