import { shouldUseGoogleProvider } from "./mapProvider";
import {
  getSelectedFoodTypes,
  restaurantMatchesFoodType,
} from "./foodPreferences";

export const defaultMatchPreferences = {
  searchLocation: "",
  startAddress: "",
  budgetPerPerson: 20,
  maxDriveMinutes: 15,
  openNowOnly: false,
  userLocation: null,
};

export function loadMatchPreferences() {
  const stored = JSON.parse(localStorage.getItem("matchPreferences")) || {};

  return {
    ...defaultMatchPreferences,
    ...stored,
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

function distanceInMiles(origin, destination) {
  if (!origin || !destination) {
    return null;
  }

  const earthRadiusMiles = 3958.8;
  const lat1 = (origin.lat * Math.PI) / 180;
  const lat2 = (destination.lat * Math.PI) / 180;
  const deltaLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const deltaLng = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function estimateDriveMinutes(miles) {
  if (!miles && miles !== 0) {
    return null;
  }

  return Math.max(4, Math.round(miles * 3.2 + 4));
}

export function getRestaurantDriveMinutes(restaurant, preferences) {
  const miles = distanceInMiles(preferences.userLocation, restaurant.location);

  return estimateDriveMinutes(miles);
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

export function calculateMatchScore(restaurant, preferences, cravings = []) {
  const budget = Number(preferences.budgetPerPerson);
  const priceRange = parsePriceRange(
    restaurant.priceEstimate || restaurant.pricePerPerson || restaurant.price
  );
  const driveMinutes = getRestaurantDriveMinutes(restaurant, preferences);
  const rating = Number(restaurant.rating) || 0;
  let score = rating * 8 + foodTypeScore(restaurant, cravings);

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
      ? 16
      : -Math.min(16, driveMinutes - Number(preferences.maxDriveMinutes));
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

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function applyMatchPreferences(restaurant, preferences) {
  const priceRange = priceRangeForLevel(restaurant.price);
  const budget = Number(preferences.budgetPerPerson);
  const miles = distanceInMiles(preferences.userLocation, restaurant.location);
  const driveMinutes = estimateDriveMinutes(miles);
  const overDriveBy = driveMinutes
    ? driveMinutes - Number(preferences.maxDriveMinutes)
    : null;
  const budgetText = priceRange
    ? `Estimated $${priceRange[0]}-$${priceRange[1]} per person`
    : "Google does not list a price estimate";
  const budgetFit = priceRange
    ? priceRange[0] <= budget
      ? `Fits your $${budget} budget`
      : `$${priceRange[0] - budget} over your budget`
    : "Budget fit unavailable";
  const driveText = driveMinutes
    ? `${driveMinutes} minutes by car`
    : preferences.startAddress
      ? "Open directions for live commute"
      : "Add a start point for commute";
  const driveFit = driveMinutes
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
    .replace(/\s*Budget target: [^.]+\. Drive target: [^.]+\./g, "")
    .trim();

  return {
    ...restaurant,
    matchScore: calculateMatchScore(restaurant, preferences, restaurant.cravings),
    driveMinutes,
    withinDriveTarget:
      driveMinutes === null ||
      driveMinutes <= Number(preferences.maxDriveMinutes),
    distance,
    priceEstimate: restaurant.priceEstimate || budgetText,
    budgetNote: `${budgetText}. ${budgetFit}.`,
    driveTime: driveText,
    driveNote: driveFit,
    mapsUrl: buildDirectionsUrl(restaurant, preferences) || restaurant.mapsUrl,
    matchNote:
      `${baseMatchNote} Budget target: $${budget}/person. ` +
      `Drive target: ${preferences.maxDriveMinutes} minutes.`,
  };
}
