const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };
const DEFAULT_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 680'%3E%3Crect width='900' height='680' fill='%23f0eadf'/%3E%3Ccircle cx='450' cy='300' r='92' fill='%230f766e' opacity='.22'/%3E%3Cpath d='M300 410h300v42H300z' fill='%23151515' opacity='.18'/%3E%3Cpath d='M352 276h196l38 134H314z' fill='%23fffdfa' stroke='%23d6cdbc' stroke-width='18'/%3E%3C/svg%3E";

const LOCATION_FALLBACKS = {
  viera: { lat: 28.2294, lng: -80.7295, label: "Viera, Melbourne, FL" },
};

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ms);

  return {
    clear: () => window.clearTimeout(timeoutId),
    signal: controller.signal,
  };
}

function normalizeLocationQuery(query) {
  return query.trim().toLowerCase();
}

function fallbackCenter(query) {
  return LOCATION_FALLBACKS[normalizeLocationQuery(query)];
}

function cuisineFromTags(tags) {
  const cuisine = tags.cuisine || tags.amenity || tags.shop || "Restaurant";

  return cuisine
    .split(";")[0]
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priceForCuisine(cuisine) {
  const normalized = cuisine.toLowerCase();

  if (["coffee", "cafe", "bakery", "donut", "ice cream"].some((item) => normalized.includes(item))) {
    return "$5-$15 per person";
  }

  if (["pizza", "burger", "sandwich", "fast food", "chicken"].some((item) => normalized.includes(item))) {
    return "$9-$20 per person";
  }

  if (["sushi", "japanese", "thai", "korean", "indian", "italian"].some((item) => normalized.includes(item))) {
    return "$16-$32 per person";
  }

  return "$12-$28 per person";
}

function phoneUrl(phone) {
  return phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
}

function osmMapsUrl(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;
}

function buildOverpassQuery(center) {
  const radiusMeters = 9000;

  return `
    [out:json][timeout:25];
    (
      node["amenity"~"restaurant|fast_food|cafe|bar|pub|food_court|ice_cream"](around:${radiusMeters},${center.lat},${center.lng});
      way["amenity"~"restaurant|fast_food|cafe|bar|pub|food_court|ice_cream"](around:${radiusMeters},${center.lat},${center.lng});
      relation["amenity"~"restaurant|fast_food|cafe|bar|pub|food_court|ice_cream"](around:${radiusMeters},${center.lat},${center.lng});
    );
    out center tags 60;
  `;
}

export async function geocodeOsmLocation(query) {
  if (!query?.trim()) {
    return DEFAULT_CENTER;
  }

  const fallback = fallbackCenter(query);

  if (fallback) {
    return fallback;
  }

  const params = new URLSearchParams({
    format: "jsonv2",
    limit: "1",
    q: query,
  });
  const timeout = timeoutSignal(8000);
  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    signal: timeout.signal,
  }).finally(timeout.clear);

  if (!response.ok) {
    throw new Error("OpenStreetMap could not find that location.");
  }

  const results = await response.json();
  const result = results[0];

  if (!result) {
    throw new Error("OpenStreetMap could not find that location.");
  }

  return {
    lat: Number(result.lat),
    lng: Number(result.lon),
    label: result.display_name,
  };
}

export async function searchOsmRestaurants(center, cravings = []) {
  const params = new URLSearchParams({ data: buildOverpassQuery(center) });
  const timeout = timeoutSignal(12000);
  const response = await fetch(`${OVERPASS_URL}?${params.toString()}`, {
    signal: timeout.signal,
  }).finally(timeout.clear);

  if (!response.ok) {
    throw new Error("OpenStreetMap restaurant search is busy. Try again in a minute.");
  }

  const data = await response.json();
  const elements = data.elements || [];

  return elements
    .map((element, index) => mapOsmElementToRestaurant(element, index, cravings))
    .filter(Boolean);
}

export function mapOsmElementToRestaurant(element, index, cravings = []) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const name = tags.name || tags.brand || "";

  if (!lat || !lng || !name) {
    return null;
  }

  const cuisine = cuisineFromTags(tags);
  const priceEstimate = priceForCuisine(cuisine);
  const address = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ]
    .filter(Boolean)
    .join(" ");
  const mapsUrl = osmMapsUrl(lat, lng);
  const phone = tags.phone || tags["contact:phone"] || "";

  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    image: DEFAULT_IMAGE,
    gallery: [DEFAULT_IMAGE],
    cuisine,
    price: "Price varies",
    priceEstimate,
    distance: "Nearby",
    rating: "New",
    hours: tags.opening_hours ? "Hours available" : "Hours not listed",
    hoursDetail: tags.opening_hours ? [tags.opening_hours] : [],
    highlight: cuisine,
    emoji: String(index + 1),
    tags: cravings.length ? cravings.slice(0, 3) : ["OpenStreetMap"],
    cravings,
    phone: phone || "Phone not listed",
    phoneUrl: phoneUrl(phone),
    pricePerPerson: priceEstimate,
    diningType: "Restaurant",
    matchNote:
      cravings.length > 0
        ? `Matched using your ${cravings.join(" / ")} profile.`
        : "Restaurant result from OpenStreetMap.",
    address: address || "Address not listed on OpenStreetMap",
    budgetNote: "Estimated price for local development.",
    driveTime: "Add a start point for commute",
    driveNote: "Distance is estimated locally.",
    reviews: [
      {
        author: "OpenStreetMap",
        rating: "",
        text: "Reviews are not available from OpenStreetMap. Google reviews will return when you switch back to Google Places.",
        time: "",
        url: mapsUrl,
      },
    ],
    mapsUrl,
    website: tags.website || tags["contact:website"] || mapsUrl,
    menuUrl: tags.website || mapsUrl,
    location: { lat, lng },
  };
}
