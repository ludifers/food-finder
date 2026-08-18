export function getMapProvider() {
  return import.meta.env.VITE_MAP_PROVIDER || "mock";
}

export function shouldUseGoogleProvider() {
  return getMapProvider() === "google";
}

export function shouldUseMockProvider() {
  return getMapProvider() === "mock";
}

export function shouldUseOsmProvider() {
  return getMapProvider() === "osm";
}

export function getMapProviderName() {
  if (shouldUseGoogleProvider()) {
    return "Google Maps";
  }

  if (shouldUseOsmProvider()) {
    return "OpenStreetMap";
  }

  return "UCF mock data";
}
