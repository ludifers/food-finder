export const UCF_CENTER = { lat: 28.6024, lng: -81.2001 };
export const UCF_MAX_RADIUS_MILES = 9;
export const UCF_DEFAULT_LOCATION = "UCF, Orlando, FL";

export const ucfStarterLocations = [
  "UCF",
  "Knights Plaza",
  "University Blvd",
  "Alafaya Trail",
  "Waterford Lakes",
  "Research Park",
  "Oviedo",
  "East Orlando",
];

export const ucfLocationFallbacks = {
  ucf: {
    address: "University of Central Florida, Orlando, FL, USA",
    center: UCF_CENTER,
  },
  "ucf, orlando, fl": {
    address: "University of Central Florida, Orlando, FL, USA",
    center: UCF_CENTER,
  },
  "knights plaza": {
    address: "Knights Plaza, Orlando, FL 32816, USA",
    center: { lat: 28.6077, lng: -81.1998 },
  },
  "university blvd": {
    address: "University Blvd, Orlando, FL 32817, USA",
    center: { lat: 28.5966, lng: -81.2153 },
  },
  "alafaya trail": {
    address: "N Alafaya Trail, Orlando, FL 32826, USA",
    center: { lat: 28.5863, lng: -81.2078 },
  },
  "waterford lakes": {
    address: "Waterford Lakes, Orlando, FL, USA",
    center: { lat: 28.5519, lng: -81.2003 },
  },
  "research park": {
    address: "Central Florida Research Park, Orlando, FL, USA",
    center: { lat: 28.5882, lng: -81.1994 },
  },
  oviedo: {
    address: "Oviedo, FL, USA",
    center: { lat: 28.6699, lng: -81.2081 },
  },
  "east orlando": {
    address: "East Orlando, Orlando, FL, USA",
    center: UCF_CENTER,
  },
};

export const travelModeOptions = [
  { label: "Driving", value: "driving" },
  { label: "Walking", value: "walking" },
];

export const maxTravelOptions = {
  driving: [
    { label: "10 minutes", value: 10 },
    { label: "15 minutes", value: 15 },
    { label: "25 minutes", value: 25 },
    { label: "40 minutes", value: 40 },
  ],
  walking: [
    { label: "5 minutes", value: 5 },
    { label: "10 minutes", value: 10 },
    { label: "15 minutes", value: 15 },
    { label: "25 minutes", value: 25 },
  ],
};

export function normalizeLocationKey(query = "") {
  return query.trim().toLowerCase();
}

export function getUcfLocationFallback(query = "") {
  return ucfLocationFallbacks[normalizeLocationKey(query)];
}

export function distanceInMiles(origin, destination) {
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

export function milesFromUcf(point) {
  return distanceInMiles(UCF_CENTER, point);
}

export function isInsideUcfArea(point, radiusMiles = UCF_MAX_RADIUS_MILES) {
  const miles = milesFromUcf(point);

  return miles !== null && miles <= radiusMiles;
}

export function filterToUcfArea(items, radiusMiles = UCF_MAX_RADIUS_MILES) {
  return items.filter((item) => !item.location || isInsideUcfArea(item.location, radiusMiles));
}

export function normalizeUcfSearchLocation(query) {
  const trimmed = String(query || "").trim();

  return trimmed || UCF_DEFAULT_LOCATION;
}
