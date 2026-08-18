export const vibeOptions = [
  "Date night",
  "Casual hangout",
  "Solo meal",
  "Group outing",
];

export const foodTypeOptions = [
  "Sushi",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "Tacos",
  "Chicken",
  "Seafood",
  "Steak",
  "Pasta",
  "Surprise me",
];

export const campusNeedOptions = [
  "Cheap eats",
  "Late night",
  "Halal",
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Study spot",
  "Group friendly",
];

export const foodTypeKeywords = {
  Sushi: ["sushi", "japanese", "poke"],
  Pizza: ["pizza", "pizzeria"],
  Burgers: ["burger", "hamburger", "american grill"],
  Sandwiches: ["sandwich", "sub", "deli", "hoagie", "cheesesteak"],
  Tacos: ["taco", "taqueria", "mexican", "tex mex", "tex-mex"],
  Chicken: ["chicken", "wings", "fried chicken"],
  Seafood: ["seafood", "fish", "oyster", "crab", "shrimp"],
  Steak: ["steak", "steakhouse"],
  Pasta: ["pasta", "italian"],
};

export const campusNeedKeywords = {
  "Cheap eats": ["cheap", "budget", "value", "deal", "$", "fast food"],
  "Late night": ["late night", "open late", "bar", "pub", "wings", "pizza"],
  Halal: ["halal", "mediterranean", "middle eastern", "gyro", "shawarma"],
  Vegetarian: ["vegetarian", "veggie", "salad", "healthy", "plant"],
  Vegan: ["vegan", "plant based", "plant-based", "veggie"],
  "Gluten-free": ["gluten free", "gluten-free"],
  "Study spot": ["coffee", "cafe", "tea", "bakery", "wifi", "study"],
  "Group friendly": ["group", "barbecue", "pizza", "burger", "sports bar"],
};

export const foodTypeSearchQueries = {
  Sushi: "sushi restaurants",
  Pizza: "pizza restaurants",
  Burgers: "burger restaurants",
  Sandwiches: "sandwich shops",
  Tacos: "taco restaurants",
  Chicken: "chicken restaurants",
  Seafood: "seafood restaurants",
  Steak: "steak restaurants",
  Pasta: "Italian pasta restaurants",
  "Surprise me": "best hidden gem restaurants",
};

export const campusNeedSearchQueries = {
  "Cheap eats": "cheap eats student budget",
  "Late night": "late night restaurants open late",
  Halal: "halal restaurants",
  Vegetarian: "vegetarian restaurants",
  Vegan: "vegan restaurants",
  "Gluten-free": "gluten free restaurants",
  "Study spot": "coffee cafe study spot",
  "Group friendly": "group friendly restaurants",
};

export function getSelectedFoodTypes(cravings = []) {
  return cravings.filter((item) => foodTypeOptions.includes(item));
}

export function getSelectedVibes(cravings = []) {
  return cravings.filter((item) => vibeOptions.includes(item));
}

export function getSelectedCampusNeeds(cravings = []) {
  return cravings.filter((item) => campusNeedOptions.includes(item));
}

export function getValidCravings(cravings = []) {
  return cravings.filter(
    (item) =>
      vibeOptions.includes(item) ||
      foodTypeOptions.includes(item) ||
      campusNeedOptions.includes(item)
  );
}

export function inferFoodTypesFromText(...parts) {
  const signalText = parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .replaceAll("_", " ")
    .toLowerCase();

  return foodTypeOptions.filter((type) => {
    if (type === "Surprise me") {
      return false;
    }

    return foodTypeKeywords[type].some((keyword) =>
      signalText.includes(keyword)
    );
  });
}

export function restaurantMatchesFoodType(restaurant, foodType) {
  if (restaurant.foodTypes?.includes(foodType)) {
    return true;
  }

  return inferFoodTypesFromText(
    restaurant.name,
    restaurant.cuisine,
    restaurant.highlight,
    restaurant.diningType,
    restaurant.tags,
    restaurant.localFavorites
  ).includes(foodType);
}

export function restaurantMatchesCampusNeed(restaurant, campusNeed) {
  if (restaurant.tags?.includes(campusNeed)) {
    return true;
  }

  const signalText = [
    restaurant.name,
    restaurant.cuisine,
    restaurant.highlight,
    restaurant.diningType,
    restaurant.tags,
    restaurant.localFavorites,
    restaurant.summary,
  ]
    .flat()
    .filter(Boolean)
    .join(" ")
    .replaceAll("_", " ")
    .toLowerCase();

  return (campusNeedKeywords[campusNeed] || []).some((keyword) =>
    signalText.includes(keyword)
  );
}
