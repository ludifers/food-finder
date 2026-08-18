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

export function getSelectedFoodTypes(cravings = []) {
  return cravings.filter((item) => foodTypeOptions.includes(item));
}

export function getSelectedVibes(cravings = []) {
  return cravings.filter((item) => vibeOptions.includes(item));
}

export function getValidCravings(cravings = []) {
  return cravings.filter(
    (item) => vibeOptions.includes(item) || foodTypeOptions.includes(item)
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
