export type FoodCountry = "Nigeria" | "Ghana" | "Kenya" | "South Africa" | "United Kingdom" | "United States" | "Other";

export const COUNTRY_OPTIONS: FoodCountry[] = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Other"];

const NIGERIA_FOODS = [
  "Yam", "Cassava", "Garri", "Plantain", "Sweet potato", "Cocoyam", "Ofada rice", "Parboiled rice", "Millet", "Sorghum",
  "Maize", "Oats", "Brown beans", "Black-eyed beans", "Bambara beans", "Groundnuts", "Tiger nuts", "Chicken", "Eggs", "Catfish",
  "Tilapia", "Mackerel", "Smoked fish", "Crayfish", "Lean beef", "Goat meat", "Ugu", "Efo or shoko", "Waterleaf", "Bitterleaf",
  "Okra", "Garden eggs", "Tomato", "Onion", "Bell pepper", "Scotch bonnet", "Cabbage", "Carrot", "Cucumber", "Green beans",
  "Spinach", "Pumpkin leaves", "Scent leaf", "Ginger", "Garlic", "Palm oil", "Groundnut oil", "Tomato paste", "Locust beans", "Pepper soup spice",
];

const MEAL_SUGGESTIONS: Record<FoodCountry, string[]> = {
  Nigeria: ["Jollof rice", "Beans porridge", "Yam and egg sauce", "Efo riro", "Moi moi", "Akara and pap", "Pepper soup", "Amala and ewedu", "Eba and soup", "Pounded yam and soup", "Ofada rice and stew", "Plantain and beans"],
  Ghana: ["Waakye", "Jollof rice", "Banku and soup", "Kenkey and fish", "Red red", "Fufu and light soup"],
  Kenya: ["Githeri", "Ugali and sukuma wiki", "Pilau", "Chapati and beans", "Rice and stew"],
  "South Africa": ["Pap and chakalaka", "Samp and beans", "Moroho and pap", "Pilchards and rice"],
  "United Kingdom": ["Jacket potato and beans", "Porridge", "Pasta and tomato sauce", "Chicken and vegetables"],
  "United States": ["Oatmeal", "Beans and rice", "Chicken and vegetables", "Vegetable pasta"],
  Other: ["Rice and beans", "Vegetable stew", "Porridge", "Soup and a staple"],
};

const GHANA_FOODS = [
  "Plantain", "Cocoyam", "Cassava", "Banku", "Kenkey", "Fufu", "Tuo zaafi", "Jollof rice", "Waakye", "Rice balls",
  "Yam", "Sweet potato", "Millet", "Maize", "Oats", "Black-eyed beans", "Bambara beans", "Groundnuts", "Eggs", "Chicken",
  "Tilapia", "Mackerel", "Smoked fish", "Sardines", "Goat meat", "Beef", "Kontomire", "Ayoyo leaves", "Okra", "Garden eggs",
  "Tomato", "Onion", "Pepper", "Cabbage", "Carrot", "Cucumber", "Avocado", "Mango", "Pineapple", "Watermelon",
  "Banana", "Orange", "Papaya", "Coconut", "Tiger nuts", "Hibiscus", "Ginger", "Dawadawa", "Palm oil", "Cocoa powder",
];

const KENYA_FOODS = [
  "Ugali", "Githeri", "Rice", "Chapati", "Sweet potato", "Arrowroot", "Cassava", "Green grams", "Kidney beans", "Cowpeas",
  "Lentils", "Groundnuts", "Eggs", "Chicken", "Tilapia", "Omena", "Beef", "Goat meat", "Milk", "Plain yoghurt",
  "Sukuma wiki", "Managu", "Spinach", "Cabbage", "Kale", "Tomato", "Onion", "Carrot", "Pumpkin", "Avocado",
  "Mango", "Banana", "Pineapple", "Passion fruit", "Watermelon", "Orange", "Papaya", "Guava", "Tamarind", "Coconut",
  "Maize", "Millet", "Sorghum", "Oats", "Tea", "Ginger", "Garlic", "Coriander", "Ndengu", "Pilau spices",
];

const SOUTH_AFRICA_FOODS = [
  "Pap", "Samp", "Mealie meal", "Brown rice", "Oats", "Sweet potato", "Butternut", "Potato", "Beans", "Lentils",
  "Chickpeas", "Eggs", "Chicken", "Pilchards", "Hake", "Tinned fish", "Lean beef", "Mince", "Plain yoghurt", "Amasi",
  "Spinach", "Moroho", "Cabbage", "Tomato", "Onion", "Carrot", "Green beans", "Peppers", "Beetroot", "Avocado",
  "Apple", "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Grapes", "Watermelon", "Peach", "Pear",
  "Maize", "Sorghum", "Peanut butter", "Sunflower seeds", "Pumpkin seeds", "Rooibos tea", "Ginger", "Garlic", "Curry spice", "Chakalaka vegetables",
];

const UNITED_KINGDOM_FOODS = [
  "Oats", "Wholegrain bread", "Potatoes", "Sweet potatoes", "Brown rice", "Wholewheat pasta", "Couscous", "Lentils", "Chickpeas", "Kidney beans",
  "Eggs", "Chicken", "Tinned mackerel", "Salmon", "Tuna", "Lean beef", "Plain yoghurt", "Milk", "Tofu", "Cheddar",
  "Spinach", "Kale", "Broccoli", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Frozen mixed vegetables",
  "Apple", "Banana", "Orange", "Berries", "Pears", "Grapes", "Melon", "Pineapple", "Avocado", "Kiwi",
  "Peanut butter", "Olive oil", "Rapeseed oil", "Seeds", "Walnuts", "Tea", "Herbs", "Garlic", "Ginger", "Tinned tomatoes",
];

const UNITED_STATES_FOODS = [
  "Oats", "Wholegrain bread", "Brown rice", "Quinoa", "Potatoes", "Sweet potatoes", "Wholewheat pasta", "Black beans", "Kidney beans", "Lentils",
  "Chickpeas", "Eggs", "Chicken", "Turkey", "Salmon", "Tuna", "Sardines", "Lean beef", "Greek yoghurt", "Tofu",
  "Spinach", "Kale", "Broccoli", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Frozen vegetables",
  "Apple", "Banana", "Orange", "Berries", "Grapes", "Melon", "Pineapple", "Mango", "Avocado", "Peach",
  "Peanut butter", "Olive oil", "Nuts", "Seeds", "Corn", "Popcorn", "Herbs", "Garlic", "Ginger", "Tinned tomatoes",
];

const GLOBAL_STARTER_FOODS = [
  "Rice", "Oats", "Maize", "Millet", "Sorghum", "Yam", "Cassava", "Plantain", "Sweet potato", "Potato",
  "Beans", "Lentils", "Chickpeas", "Groundnuts", "Eggs", "Chicken", "Fish", "Tinned fish", "Tofu", "Lean meat",
  "Spinach", "Leafy greens", "Cabbage", "Carrot", "Tomato", "Onion", "Peppers", "Cucumber", "Okra", "Pumpkin",
  "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Watermelon", "Apple", "Avocado", "Coconut", "Dates",
  "Olive oil", "Palm oil", "Peanut butter", "Nuts", "Seeds", "Yoghurt", "Milk", "Ginger", "Garlic", "Herbs and spices",
];

const CATALOGUES: Record<FoodCountry, string[]> = {
  Nigeria: NIGERIA_FOODS,
  Ghana: GHANA_FOODS,
  Kenya: KENYA_FOODS,
  "South Africa": SOUTH_AFRICA_FOODS,
  "United Kingdom": UNITED_KINGDOM_FOODS,
  "United States": UNITED_STATES_FOODS,
  Other: GLOBAL_STARTER_FOODS,
};

const FRUITS: Record<FoodCountry, string[]> = {
  Nigeria: ["Orange", "Banana", "Pineapple", "Pawpaw", "Watermelon", "Mango", "Avocado", "Apple", "Pear", "Guava", "Tangerine", "Dates"],
  Ghana: ["Mango", "Pineapple", "Watermelon", "Banana", "Orange", "Papaya", "Avocado", "Coconut", "Guava", "Apple", "Pear", "Tangerine"],
  Kenya: ["Mango", "Banana", "Pineapple", "Passion fruit", "Watermelon", "Orange", "Papaya", "Guava", "Avocado", "Tamarind", "Apple", "Coconut"],
  "South Africa": ["Apple", "Orange", "Banana", "Mango", "Pineapple", "Papaya", "Grapes", "Watermelon", "Peach", "Pear", "Avocado", "Naartjie"],
  "United Kingdom": ["Apple", "Banana", "Orange", "Berries", "Pear", "Grapes", "Melon", "Pineapple", "Avocado", "Kiwi", "Mango", "Peach"],
  "United States": ["Apple", "Banana", "Orange", "Berries", "Grapes", "Melon", "Pineapple", "Mango", "Avocado", "Peach", "Pear", "Watermelon"],
  Other: ["Banana", "Orange", "Mango", "Pineapple", "Papaya", "Watermelon", "Apple", "Avocado", "Grapes", "Guava", "Pear", "Dates"],
};

export function suggestedFoods(country: FoodCountry) {
  return CATALOGUES[country];
}

export function suggestedFruits(country: FoodCountry) {
  return FRUITS[country];
}

export function suggestedMeals(country: FoodCountry) {
  return MEAL_SUGGESTIONS[country];
}
