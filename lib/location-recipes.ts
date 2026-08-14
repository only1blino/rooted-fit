import { cityFoodPack, type FoodCountry } from "./food-catalogue";

export type LocationRecipe = { title: string; focus: string; ingredients: string[]; steps: string[]; drink: string };
type RecipeSeed = { title: string; focus: string; ingredients: string[] };

const COUNTRY_RECIPES: Record<Exclude<FoodCountry, "Nigeria" | "Ghana" | "Kenya">, { weekOne: RecipeSeed[]; weekTwo: RecipeSeed[] }> = {
  "South Africa": {
    weekOne: [
      { title: "Samp and beans with spinach", focus: "A South African comfort-food base with greens", ingredients: ["½ cup samp", "½ cup sugar beans", "½ onion", "1 tomato", "1 teaspoon curry powder", "1 cup spinach"] },
      { title: "Pap, chakalaka, and pilchards", focus: "Maize porridge with vegetable relish and a practical fish option", ingredients: ["½ cup maize meal", "½ cup chakalaka vegetables", "1 pilchard portion", "½ onion", "1 tomato"] },
      { title: "Moroho and chicken stew with rice", focus: "Leafy greens and tomato chicken stew with a modest rice base", ingredients: ["1 cup moroho or spinach", "1 chicken portion", "½ cup rice", "1 tomato", "½ onion"] },
      { title: "Bean curry with wholegrain roti", focus: "A Durban-inspired bean meal using flexible vegetables", ingredients: ["¾ cup cooked beans", "1 wholegrain roti", "½ onion", "1 tomato", "½ carrot", "curry powder"] },
      { title: "Hake with roasted butternut and greens", focus: "A Cape-style fish plate with practical vegetables", ingredients: ["1 hake portion", "1 cup butternut", "1 cup greens", "1 teaspoon oil", "lemon if available"] },
      { title: "Amasi, oats, and fruit bowl", focus: "A light breakfast built around a familiar cultured dairy option", ingredients: ["¾ cup amasi or plain yoghurt", "¼ cup oats", "1 portion fruit", "1 tablespoon seeds"] },
      { title: "Lentil and tomato bredie-style pot", focus: "A vegetable-and-lentil pot that fits a regular household stove", ingredients: ["¾ cup cooked lentils", "1 tomato", "½ onion", "1 potato", "1 cup cabbage"] },
    ],
    weekTwo: [
      { title: "Vegetable chakalaka with brown rice", focus: "A spicy vegetable relish with a practical grain base", ingredients: ["½ cup brown rice", "1 cup chakalaka vegetables", "½ cup beans", "onion", "tomato", "curry spice"] },
      { title: "Bobotie-style lentil bake", focus: "A gentle spiced lentil dish with a familiar South African influence", ingredients: ["¾ cup lentils", "½ onion", "carrot", "curry spice", "plain yoghurt or egg if suitable", "rice"] },
      { title: "Pap with spinach and bean stew", focus: "A plant-based pap plate with greens and beans", ingredients: ["½ cup maize meal", "¾ cup beans", "1 cup spinach", "tomato", "onion"] },
      { title: "Pilchard tomato pasta", focus: "A fast cupboard meal with fish and vegetables", ingredients: ["½ cup wholewheat pasta", "1 pilchard portion", "tinned tomatoes", "onion", "spinach"] },
      { title: "Butternut, chickpea, and amasi bowl", focus: "A warm vegetable bowl with a creamy familiar topping", ingredients: ["1 cup butternut", "¾ cup chickpeas", "amasi or yoghurt", "greens", "seeds"] },
      { title: "Rooibos oats with apple and seeds", focus: "A light breakfast that fits common South African pantry items", ingredients: ["½ cup oats", "rooibos tea or water", "1 apple", "seeds", "plain yoghurt if suitable"] },
      { title: "Hake and potato tomato pot", focus: "A simple fish pot with vegetables and a starchy base", ingredients: ["1 hake portion", "1 potato", "tomato", "onion", "green beans"] },
    ],
  },
  "United Kingdom": {
    weekOne: [
      { title: "Jacket potato with beans and greens", focus: "An affordable UK staple with added leafy vegetables", ingredients: ["1 jacket potato", "¾ cup baked beans", "1 cup spinach", "plain yoghurt or cheese if suitable"] },
      { title: "Red lentil dhal with rice", focus: "A pantry-led lentil meal using commonly available UK staples", ingredients: ["½ cup red lentils", "½ cup rice", "½ onion", "tinned tomatoes", "curry powder", "spinach"] },
      { title: "Tinned mackerel, potatoes, and broccoli", focus: "A quick fish plate using practical cupboard and frozen options", ingredients: ["1 tinned mackerel portion", "1 potato", "1 cup broccoli or frozen vegetables", "lemon or herbs"] },
      { title: "Chickpea tomato pasta", focus: "Wholewheat pasta with beans and a quick tomato sauce", ingredients: ["½ cup wholewheat pasta", "¾ cup chickpeas", "tinned tomatoes", "½ onion", "spinach"] },
      { title: "Vegetable soup and wholegrain toast", focus: "A light meal using seasonal or frozen vegetables", ingredients: ["2 cups mixed vegetables", "½ cup beans or lentils", "1 slice wholegrain toast", "½ onion", "stock or herbs"] },
      { title: "Egg, mushroom, and tomato breakfast", focus: "A quick protein-forward breakfast with familiar supermarket ingredients", ingredients: ["2 eggs", "1 tomato", "mushrooms", "1 slice wholegrain toast", "1 teaspoon oil"] },
      { title: "Couscous, chicken, and cucumber bowl", focus: "A low-prep bowl suitable for a busy market day", ingredients: ["½ cup couscous", "1 chicken portion", "½ cucumber", "1 tomato", "1 tablespoon yoghurt"] },
    ],
    weekTwo: [
      { title: "Beans on wholegrain toast with spinach", focus: "A familiar quick UK meal with an added vegetable", ingredients: ["¾ cup baked beans", "1 slice wholegrain toast", "1 cup spinach", "tomato"] },
      { title: "Tuna, sweetcorn, and potato bowl", focus: "A low-prep meal using accessible supermarket staples", ingredients: ["1 tinned tuna portion", "1 potato", "½ cup sweetcorn", "cucumber", "plain yoghurt"] },
      { title: "Vegetable lentil shepherd’s pie", focus: "A comforting lentil and potato bake for a second rotation", ingredients: ["¾ cup lentils", "1 potato", "carrot", "peas", "onion", "tinned tomatoes"] },
      { title: "Chicken and broccoli couscous", focus: "A quick grain bowl with vegetables and a clear chicken portion", ingredients: ["½ cup couscous", "1 chicken portion", "broccoli", "carrot", "lemon"] },
      { title: "Tomato white bean soup", focus: "A pantry-led soup with beans and toast", ingredients: ["¾ cup white beans", "tinned tomatoes", "onion", "carrot", "herbs", "wholegrain toast"] },
      { title: "Yoghurt oats with banana and peanut butter", focus: "A no-cook breakfast for a day with safe cold storage", ingredients: ["¾ cup plain yoghurt", "¼ cup oats", "1 banana", "1 teaspoon peanut butter"] },
      { title: "Mackerel and pea rice bowl", focus: "A fish-and-rice bowl built from shelf-stable and frozen ingredients", ingredients: ["½ cup rice", "1 tinned mackerel portion", "½ cup peas", "spinach", "lemon"] },
    ],
  },
  "United States": {
    weekOne: [
      { title: "Black bean and corn bowl", focus: "A US pantry-style rice bowl with beans and fresh crunch", ingredients: ["½ cup brown rice", "¾ cup black beans", "½ cup corn", "1 tomato", "½ avocado", "lime"] },
      { title: "Chicken, sweet potato, and greens tray", focus: "A simple all-in-one home meal with controllable portions", ingredients: ["1 chicken portion", "1 small sweet potato", "1 cup greens", "1 teaspoon oil", "paprika or herbs"] },
      { title: "Turkey or lentil chilli with rice", focus: "A bean-rich tomato pot that works with meat or lentils", ingredients: ["¾ cup kidney beans", "½ cup rice", "turkey mince or lentils", "tinned tomatoes", "½ onion", "chilli powder"] },
      { title: "Oatmeal, yoghurt, and berries", focus: "A light breakfast using regular grocery staples", ingredients: ["½ cup oats", "¾ cup plain yoghurt", "berries", "1 tablespoon nuts or seeds"] },
      { title: "Salmon and vegetable pasta", focus: "A simple fish-and-pasta option using frozen vegetables if needed", ingredients: ["½ cup wholewheat pasta", "1 salmon or tinned tuna portion", "1 cup frozen vegetables", "tinned tomatoes", "herbs"] },
      { title: "Collard greens and black-eyed peas", focus: "A Southern-inspired greens and bean plate", ingredients: ["¾ cup black-eyed peas", "1 cup collard greens", "½ onion", "1 tomato", "½ cup brown rice"] },
      { title: "Tofu vegetable stir-fry with rice", focus: "A flexible plant-based option using any available vegetables", ingredients: ["¾ cup tofu", "½ cup rice", "2 cups mixed vegetables", "garlic", "ginger", "1 teaspoon oil"] },
    ],
    weekTwo: [
      { title: "Vegetable quesadilla with beans", focus: "A Southwest-style bean and vegetable meal using a simple tortilla", ingredients: ["1 wholegrain tortilla", "¾ cup beans", "peppers", "onion", "tomato", "cheese if suitable"] },
      { title: "Lentil sloppy joe-style bowl", focus: "A tomato lentil meal with a small bread or rice side", ingredients: ["¾ cup lentils", "tinned tomatoes", "onion", "carrot", "wholegrain roll or rice"] },
      { title: "Peanut butter banana oats with egg", focus: "A quick breakfast with oats, fruit, and a protein side", ingredients: ["½ cup oats", "1 banana", "1 teaspoon peanut butter", "1 egg"] },
      { title: "Chicken and black bean soup", focus: "A one-pot soup that works with fresh or frozen vegetables", ingredients: ["1 chicken portion", "¾ cup black beans", "corn", "tinned tomatoes", "onion", "greens"] },
      { title: "Baked potato with broccoli and cottage cheese", focus: "A simple vegetable-forward potato meal", ingredients: ["1 potato", "1 cup broccoli", "cottage cheese or beans", "herbs"] },
      { title: "Tofu peanut noodle bowl", focus: "A plant-based second-week dinner using familiar cupboard ingredients", ingredients: ["½ cup wholewheat noodles", "¾ cup tofu", "cabbage", "carrot", "1 teaspoon peanut butter", "ginger"] },
      { title: "Sardine, tomato, and kale rice pot", focus: "An affordable fish-and-greens meal with rice", ingredients: ["½ cup brown rice", "1 sardine portion", "tinned tomatoes", "kale", "onion"] },
    ],
  },
  Other: {
    weekOne: [
      { title: "Lentil, tomato, and rice pot", focus: "A flexible city-market starter recipe", ingredients: ["¾ cup lentils", "½ cup rice", "tomato", "onion", "leafy greens"] },
      { title: "Bean and vegetable stew with staple", focus: "A familiar beans-and-vegetables format adaptable to a local staple", ingredients: ["¾ cup beans", "tomato", "onion", "carrot or greens", "a staple you already use"] },
      { title: "Egg and greens breakfast bowl", focus: "A light protein-forward breakfast using common ingredients", ingredients: ["2 eggs", "1 cup greens", "tomato", "onion", "small bread or grain portion"] },
      { title: "Fish and vegetable tomato stew", focus: "A straightforward fish pot with a user-chosen staple", ingredients: ["1 fish portion", "tomato", "onion", "peppers", "rice, yam, or flatbread"] },
      { title: "Chickpea and pumpkin bowl", focus: "A plant-based meal using practical shelf-stable ingredients", ingredients: ["¾ cup chickpeas", "pumpkin or squash", "tomato", "onion", "rice or flatbread"] },
      { title: "Oats, fruit, and yoghurt cup", focus: "A no-cook breakfast where cold storage is reliable", ingredients: ["¾ cup yoghurt", "¼ cup oats", "1 portion fruit", "seeds or groundnuts"] },
      { title: "Chicken and greens rice bowl", focus: "A simple protein, grain, and vegetable meal", ingredients: ["1 chicken portion", "½ cup rice", "greens", "tomato", "onion"] },
    ],
    weekTwo: [
      { title: "Coconut bean stew with rice", focus: "A varied second-week bean option for cities with coconut available", ingredients: ["¾ cup beans", "¼ cup coconut milk", "½ cup rice", "tomato", "onion"] },
      { title: "Vegetable khichdi-style grain and lentil pot", focus: "A one-pot grain and lentil meal with local vegetables", ingredients: ["½ cup rice or millet", "½ cup lentils", "carrot", "greens", "ginger"] },
      { title: "Sweet potato, beans, and greens", focus: "A durable root vegetable meal with beans", ingredients: ["1 sweet potato", "¾ cup beans", "1 cup greens", "tomato", "onion"] },
      { title: "Tofu or egg vegetable stir-fry", focus: "A flexible quick meal that respects availability", ingredients: ["tofu or 2 eggs", "2 cups mixed vegetables", "rice or noodles", "ginger", "garlic"] },
      { title: "Groundnut vegetable stew", focus: "A practical peanut-based stew with a local staple", ingredients: ["1 tablespoon groundnut paste", "beans or chicken", "tomato", "onion", "local staple"] },
      { title: "Fruit, oats, and boiled egg", focus: "A simple light breakfast for a second-week rotation", ingredients: ["½ cup oats", "1 portion fruit", "1 egg", "groundnuts or seeds"] },
      { title: "Sardine and tomato rice bowl", focus: "A shelf-stable fish option with vegetables", ingredients: ["1 sardine portion", "½ cup rice", "tomato", "onion", "greens"] },
    ],
  },
};

function toRecipe(seed: RecipeSeed, fruit: string): LocationRecipe {
  return { title: seed.title, focus: seed.focus, ingredients: seed.ingredients, steps: ["Prepare the grain, root, or staple using the method that is normal in your home.", "Cook the tomato, onion, protein or beans, and vegetables in stages until tender.", "Taste, adjust seasoning if you use it, and serve with the planned fresh vegetables or fruit."], drink: `Water and ${fruit} later in the day.` };
}

function cityRecipes(country: FoodCountry, city: string, fruit: string): { weekOne: LocationRecipe[]; weekTwo: LocationRecipe[] } | null {
  const pack = cityFoodPack(country, city);
  if (!pack) return null;
  const foods = pack.foods.length ? pack.foods : ["beans", "tomato", "onion", "leafy greens"];
  const create = (title: string, index: number, rotation: string): LocationRecipe => ({
    title: `${title} · ${pack.label.replace(" market cues", " home option")}`,
    focus: `${rotation} built from food cues for ${pack.label.toLowerCase()}, then refined by what you say is actually available.`,
    ingredients: [foods[index % foods.length], foods[(index + 1) % foods.length], foods[(index + 2) % foods.length], "tomato or another available vegetable", "onion or another aromatic", "a staple you already use"],
    steps: ["Prepare the staple using the method that is normal in your home.", "Cook the chosen vegetables with the beans, egg, fish, or other preferred protein until tender.", "Serve the practical portion with a fresh vegetable or fruit if available."],
    drink: `Water and ${fruit} later in the day.`,
  });
  const titles = [...pack.meals, ...pack.meals, ...pack.meals];
  return { weekOne: titles.slice(0, 7).map((title, index) => create(title, index, "A first-week choice")), weekTwo: titles.slice(2, 9).map((title, index) => create(title, index + 2, "A distinct second-week choice")) };
}

/** Returns a city pack first, then a complete country pack, so every week has different recipe titles. */
export function locationRecipeWeeks(country: FoodCountry, city: string, fruit: string): { weekOne: LocationRecipe[]; weekTwo: LocationRecipe[] } {
  const citySpecific = cityRecipes(country, city, fruit);
  if (citySpecific) return citySpecific;
  if (country === "Nigeria") return { weekOne: [], weekTwo: [
    { title: "Unripe plantain porridge with spinach", focus: "A savoury second-week Nigerian plantain-and-greens pot", ingredients: ["½ unripe plantain", "½ onion", "1 tomato", "1 cup spinach", "fish or beans if suitable"], steps: ["Peel and cube unripe plantain, then simmer in water until almost tender.", "Add tomato, onion, and fish or beans; cook until the plantain softens.", "Fold in spinach just before serving."], drink: `Water and ${fruit} later in the day.` },
    { title: "Okra soup with a small eba portion", focus: "A familiar Nigerian soup meal with a clear vegetable base", ingredients: ["2 cups okra", "1 fish portion", "½ onion", "palm oil", "1 small eba portion"], steps: ["Cook fish and onion with a little water until the fish is cooked.", "Add sliced okra and palm oil, stirring until the okra softens.", "Prepare one small eba portion and serve."], drink: `Water and ${fruit} later in the day.` },
    { title: "Ekuru-style bean cake with tomato sauce", focus: "A second-week Nigerian bean-focused meal with vegetables alongside", ingredients: ["1 cup peeled beans or bean flour", "1 tomato", "¼ onion", "1 teaspoon oil", "cucumber"], steps: ["Blend or mix beans with water into a thick batter and steam until firm.", "Cook tomato and onion in a small amount of oil until soft.", "Serve the bean cake with sauce and cucumber."], drink: `Water and ${fruit} later in the day.` },
    { title: "Sweet potato and sardine tomato bowl", focus: "A quick durable-food Nigerian option with fish and vegetables", ingredients: ["1 small sweet potato", "1 sardine portion", "1 tomato", "½ onion", "1 cup greens"], steps: ["Boil or roast sweet potato until tender.", "Cook tomato and onion until soft, then warm sardines gently in the sauce.", "Serve with greens."], drink: `Water and ${fruit} later in the day.` },
    { title: "Groundnut soup with rice and greens", focus: "A second-week Nigerian meal using a familiar groundnut flavour", ingredients: ["1 tablespoon groundnut paste", "½ cup rice", "¾ cup beans or chicken", "1 tomato", "greens"], steps: ["Cook rice until tender.", "Cook tomato and onion, then dissolve groundnut paste with water into the pot.", "Add beans or chicken and greens, and simmer until tender."], drink: `Water and ${fruit} later in the day.` },
    { title: "Akara with pap and fruit", focus: "A familiar lighter Nigerian breakfast or simple meal-day option", ingredients: ["1 cup blended beans", "1 cup pap", "1 portion fruit", "onion", "pepper if enjoyed"], steps: ["Blend beans with onion and season lightly.", "Cook spoonfuls until set and golden using the household method.", "Serve with pap and fruit."], drink: `Water and ${fruit} later in the day.` },
    { title: "Ofada-style rice with garden egg stew", focus: "A rice-and-vegetable second-week Nigerian variation", ingredients: ["½ cup rice", "2 garden eggs", "1 tomato", "½ onion", "1 teaspoon oil", "protein if suitable"], steps: ["Cook rice until tender.", "Cook garden eggs, tomato, and onion into a soft stew.", "Add your preferred protein and serve with rice."], drink: `Water and ${fruit} later in the day.` },
  ] };
  if (country === "Ghana") return { weekOne: [], weekTwo: [
    { title: "Ghanaian jollof with cabbage slaw", focus: "A tomato rice variation with a crisp market vegetable side", ingredients: ["½ cup rice", "2 tomatoes", "½ onion", "1 chicken or bean portion", "cabbage", "carrot"], steps: ["Cook tomato and onion until reduced, then add rice and water.", "Cook until the rice is tender and add chicken or beans if suitable.", "Serve with cabbage-carrot slaw."], drink: `Water and ${fruit} later in the day.` },
    { title: "Eto with egg and groundnuts", focus: "A mashed plantain meal with a clear Ghanaian protein addition", ingredients: ["½ ripe plantain", "1 egg", "1 tablespoon groundnuts", "½ onion", "tomato"], steps: ["Boil plantain until tender, then mash with a little warm water.", "Cook egg with onion and tomato.", "Serve with groundnuts."], drink: `Water and ${fruit} later in the day.` },
    { title: "Light soup with fish and cocoyam", focus: "A broth-led Ghanaian meal with a root vegetable side", ingredients: ["1 fish portion", "1 cocoyam", "tomato", "onion", "pepper soup spices"], steps: ["Boil cocoyam until tender.", "Simmer fish, tomato, onion, and spices in water until cooked.", "Serve the soup with cocoyam."], drink: `Water and ${fruit} later in the day.` },
    { title: "Rice balls with groundnut soup", focus: "A practical Ghanaian rice and groundnut combination", ingredients: ["½ cup rice", "1 tablespoon groundnut paste", "beans or chicken", "tomato", "greens"], steps: ["Cook rice until soft enough to shape lightly with a spoon.", "Cook tomato and groundnut paste with water into a smooth soup.", "Add beans or chicken and greens, then serve."], drink: `Water and ${fruit} later in the day.` },
    { title: "Ampesi with kontomire stew", focus: "Boiled roots and leafy greens with an optional egg or fish", ingredients: ["yam or plantain", "2 cups kontomire or spinach", "tomato", "onion", "egg or fish"], steps: ["Boil yam or plantain until tender.", "Cook onion and tomato, then fold in kontomire or spinach.", "Add egg or fish if suitable and serve."], drink: `Water and ${fruit} later in the day.` },
    { title: "Millet porridge with boiled egg and fruit", focus: "A lighter Ghanaian breakfast option using a familiar grain", ingredients: ["½ cup millet porridge", "1 boiled egg", "1 portion fruit", "groundnuts"], steps: ["Cook millet porridge using your household method until smooth.", "Boil or cook the egg.", "Serve with fruit and groundnuts."], drink: `Water and ${fruit} later in the day.` },
    { title: "Tomato sardine stew with rice", focus: "A cupboard-friendly Ghanaian fish meal with simple vegetables", ingredients: ["½ cup rice", "1 sardine portion", "2 tomatoes", "½ onion", "cabbage"], steps: ["Cook rice until tender.", "Cook tomatoes and onion until the sauce thickens.", "Warm sardines in the sauce and serve with cabbage."], drink: `Water and ${fruit} later in the day.` },
  ] };
  if (country === "Kenya") return { weekOne: [], weekTwo: [
    { title: "Kenyan bean stew with rice and kachumbari", focus: "Beans, rice, and fresh tomato-onion salad for a varied week", ingredients: ["¾ cup beans", "½ cup rice", "tomato", "½ onion", "cucumber", "coriander"], steps: ["Simmer cooked beans with tomato and onion until the flavours combine.", "Cook rice until tender.", "Make kachumbari with tomato, cucumber, onion, and coriander."], drink: `Water and ${fruit} later in the day.` },
    { title: "Matoke-style banana and bean stew", focus: "A green-banana option with beans and vegetables", ingredients: ["1 cooking banana or plantain", "½ cup beans", "tomato", "onion", "greens"], steps: ["Peel and cube cooking banana, then simmer until tender.", "Add tomato, onion, and beans.", "Fold in greens and cook briefly."], drink: `Water and ${fruit} later in the day.` },
    { title: "Kuku paka-inspired coconut chicken", focus: "A coastal Kenya-style coconut chicken with rice", ingredients: ["1 chicken portion", "½ cup rice", "¼ cup coconut milk", "tomato", "onion", "coriander"], steps: ["Cook onion and tomato until soft.", "Add chicken and a little water, then simmer until cooked.", "Stir in coconut milk and coriander before serving with rice."], drink: `Water and ${fruit} later in the day.` },
    { title: "Managu greens with sweet potato", focus: "Leafy greens and a root vegetable staple for a different Kenyan dinner", ingredients: ["2 cups managu or spinach", "1 sweet potato", "tomato", "onion", "egg or beans"], steps: ["Boil sweet potato until tender.", "Cook onion and tomato, then add greens.", "Add egg or beans if suitable and serve."], drink: `Water and ${fruit} later in the day.` },
    { title: "Chipsi mayai-style potato and egg pan", focus: "An occasional familiar Kenyan egg-and-potato meal with vegetables", ingredients: ["1 potato", "2 eggs", "tomato", "onion", "cabbage salad"], steps: ["Cook potato pieces until tender with a small amount of oil.", "Add tomato and onion, then pour in beaten eggs.", "Serve with cabbage salad."], drink: `Water and ${fruit} later in the day.` },
    { title: "Millet porridge with groundnuts and fruit", focus: "A light Kenyan breakfast using a familiar grain", ingredients: ["½ cup millet porridge", "1 tablespoon groundnuts", "1 portion fruit", "milk if suitable"], steps: ["Cook millet porridge until smooth.", "Add milk if suitable.", "Serve with groundnuts and fruit."], drink: `Water and ${fruit} later in the day.` },
    { title: "Lentil curry with ugali", focus: "A plant-based Kenyan legume meal with maize staple", ingredients: ["¾ cup lentils", "½ cup maize flour", "tomato", "onion", "curry spice", "greens"], steps: ["Simmer lentils with tomato, onion, and spices until tender.", "Cook maize flour into ugali.", "Serve with greens."], drink: `Water and ${fruit} later in the day.` },
  ] };
  const pack = COUNTRY_RECIPES[country];
  return { weekOne: pack.weekOne.map((recipe) => toRecipe(recipe, fruit)), weekTwo: pack.weekTwo.map((recipe) => toRecipe(recipe, fruit)) };
}
