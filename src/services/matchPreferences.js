import { shouldUseGoogleProvider } from "./mapProvider";
import {
  getSelectedCampusNeeds,
  getSelectedFoodTypes,
  restaurantMatchesCampusNeed,
  restaurantMatchesFoodType,
} from "./foodPreferences";
import {
  distanceInMiles,
  filterToUcfArea,
  UCF_DEFAULT_LOCATION,
} from "./ucfArea";

export const defaultMatchPreferences = {
  searchLocation: UCF_DEFAULT_LOCATION,
  startAddress: "",
  budgetPerPerson: 20,
  maxDriveMinutes: 15,
  travelMode: "driving",
  openNowOnly: false,
  userLocation: null,
};

const previousBroadLocations = new Set([
  "",
  "orlando",
  "viera",
  "viera, melbourne, fl",
  "cocoa beach",
  "winter park",
  "lake nona",
  "downtown orlando",
  "kissimmee",
  "melbourne",
]);

function normalizeSearchLocation(searchLocation) {
  const normalized = String(searchLocation || "").trim().toLowerCase();

  if (previousBroadLocations.has(normalized)) {
    return UCF_DEFAULT_LOCATION;
  }

  return searchLocation;
}

function normalizeTravelMode(travelMode) {
  return travelMode === "walking" ? "walking" : "driving";
}

export function loadMatchPreferences() {
  const stored = JSON.parse(localStorage.getItem("matchPreferences")) || {};

  return {
    ...defaultMatchPreferences,
    ...stored,
    searchLocation: normalizeSearchLocation(stored.searchLocation),
    travelMode: normalizeTravelMode(stored.travelMode),
  };
}

export function saveMatchPreferences(preferences) {
  localStorage.setItem("matchPreferences", JSON.stringify(preferences));
}

function priceRangeForLevel(price) {
  const ranges = {
    $: [8, 15],
    $$: [15, 30],
    $$$: [30, 60],
    $$$$: [60, 100],
  };

  return ranges[price] || null;
}

function estimateDriveMinutes(miles) {
  if (!miles && miles !== 0) {
    return null;
  }

  return Math.max(4, Math.round(miles * 3.2 + 4));
}

function estimateWalkMinutes(miles) {
  if (!miles && miles !== 0) {
    return null;
  }

  return Math.max(3, Math.round(miles * 20));
}

function estimateTravelMinutes(miles, travelMode) {
  return travelMode === "walking"
    ? estimateWalkMinutes(miles)
    : estimateDriveMinutes(miles);
}

export function getRestaurantDriveMinutes(restaurant, preferences) {
  const miles = distanceInMiles(preferences.userLocation, restaurant.location);

  return estimateTravelMinutes(miles, preferences.travelMode);
}

function parsePriceRange(priceText) {
  const numbers = String(priceText || "")
    .match(/\d+/g)
    ?.map(Number);

  if (!numbers?.length) {
    return null;
  }

  return {
    low: numbers[0],
    high: numbers[1] || numbers[0],
  };
}

function foodTypeScore(restaurant, cravings = []) {
  const selectedFoodTypes = getSelectedFoodTypes(cravings).filter(
    (type) => type !== "Surprise me"
  );

  if (!selectedFoodTypes.length) {
    return 0;
  }

  return selectedFoodTypes.some((type) =>
    restaurantMatchesFoodType(restaurant, type)
  )
    ? 20
    : 0;
}

function campusNeedScore(restaurant, cravings = []) {
  const selectedNeeds = getSelectedCampusNeeds(cravings);

  if (!selectedNeeds.length) {
    return 0;
  }

  return selectedNeeds.reduce(
    (score, need) =>
      score + (restaurantMatchesCampusNeed(restaurant, need) ? 10 : -3),
    0
  );
}

export function calculateMatchScore(restaurant, preferences, cravings = []) {
  const budget = Number(preferences.budgetPerPerson);
  const priceRange = parsePriceRange(
    restaurant.priceEstimate || restaurant.pricePerPerson || restaurant.price
  );
  const driveMinutes = getRestaurantDriveMinutes(restaurant, preferences);
  const rating = Number(restaurant.rating) || 0;
  let score =
    rating * 8 +
    foodTypeScore(restaurant, cravings) +
    campusNeedScore(restaurant, cravings);

  if (priceRange && budget !== 999) {
    if (priceRange.low <= budget) {
      score += 18;
    } else {
      score -= Math.min(18, priceRange.low - budget);
    }
  } else if (budget === 999) {
    score += 8;
  }

  if (driveMinutes) {
    score += driveMinutes <= Number(preferences.maxDriveMinutes)
      ? preferences.travelMode === "walking"
        ? 24
        : 16
      : -Math.min(16, driveMinutes - Number(preferences.maxDriveMinutes));
  }

  if (restaurant.tags?.includes("Cheap eats") && budget <= 20) {
    score += 10;
  }

  if (restaurant.tags?.includes("Late night")) {
    score += 5;
  }

  if (preferences.openNowOnly && restaurant.hours === "Open now") {
    score += 12;
  }

  if (restaurant.tags?.includes("Highly rated")) {
    score += 6;
  }

  return score;
}

function buildDirectionsUrl(restaurant, preferences) {
  if (!shouldUseGoogleProvider() && restaurant.location) {
    const params = new URLSearchParams({
      to: `${restaurant.location.lat},${restaurant.location.lng}`,
    });

    if (preferences.startAddress) {
      params.set("from", preferences.startAddress);
    }

    return `https://www.openstreetmap.org/directions?${params.toString()}`;
  }

  if (!restaurant.mapsUrl && !restaurant.address) {
    return "";
  }

  const destination = restaurant.address || restaurant.name;
  const params = new URLSearchParams({
    api: "1",
    destination,
  });

  if (preferences.startAddress) {
    params.set("origin", preferences.startAddress);
  }

  params.set(
    "travelmode",
    preferences.travelMode === "walking" ? "walking" : "driving"
  );

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function applyMatchPreferences(restaurant, preferences) {
  const priceRange = priceRangeForLevel(restaurant.price);
  const budget = Number(preferences.budgetPerPerson);
  const miles = distanceInMiles(preferences.userLocation, restaurant.location);
  const travelMinutes = estimateTravelMinutes(miles, preferences.travelMode);
  const overDriveBy = travelMinutes
    ? travelMinutes - Number(preferences.maxDriveMinutes)
    : null;
  const budgetText = priceRange
    ? `Estimated $${priceRange[0]}-$${priceRange[1]} per person`
    : "Google does not list a price estimate";
  const budgetFit = priceRange
    ? priceRange[0] <= budget
      ? `Fits your $${budget} budget`
      : `$${priceRange[0] - budget} over your budget`
    : "Budget fit unavailable";
  const travelLabel = preferences.travelMode === "walking" ? "walk" : "drive";
  const driveText = travelMinutes
    ? `${travelMinutes} minute ${travelLabel}`
    : preferences.startAddress
      ? "Open directions for live commute"
      : "Add a start point for commute";
  const driveFit = travelMinutes
    ? overDriveBy <= 0
      ? ""
      : `${overDriveBy} mins more than you are looking for`
    : preferences.startAddress
      ? `From ${preferences.startAddress}`
      : "No start point saved";
  const distance = miles ? `${miles.toFixed(1)} miles` : restaurant.distance;
  const baseMatchNote = (
    restaurant.matchNote || "Saved restaurant from your FoodFinder list."
  )
    .replace(/\s*Budget target: [^.]+\. (Drive|Walk) target: [^.]+\./g, "")
    .trim();

  return {
    ...restaurant,
    matchScore: calculateMatchScore(restaurant, preferences, restaurant.cravings),
    driveMinutes: travelMinutes,
    travelMinutes,
    withinDriveTarget:
      travelMinutes === null ||
      travelMinutes <= Number(preferences.maxDriveMinutes),
    distance,
    priceEstimate: restaurant.priceEstimate || budgetText,
    budgetNote: `${budgetText}. ${budgetFit}.`,
    driveTime: driveText,
    driveNote: driveFit,
    mapsUrl: buildDirectionsUrl(restaurant, preferences) || restaurant.mapsUrl,
    matchNote:
      `${baseMatchNote} Budget target: $${budget}/person. ` +
      `${preferences.travelMode === "walking" ? "Walk" : "Drive"} target: ${
        preferences.maxDriveMinutes
      } minutes.`,
  };
}

export function filterRestaurantsToUcfArea(restaurants) {
  return filterToUcfArea(restaurants);
}
