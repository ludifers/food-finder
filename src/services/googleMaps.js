import { reserveGoogleRequest } from "./apiUsageLimits";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-js";

let mapsPromise;

export function hasGoogleMapsKey() {
  return Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
}

export function loadGoogleMaps() {
  if (!hasGoogleMapsKey()) {
    return Promise.reject(new Error("Missing Google Maps API key."));
  }

  if (window.google?.maps?.importLibrary) {
    return Promise.resolve(window.google.maps);
  }

  if (mapsPromise) {
    return mapsPromise;
  }

  mapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      if (window.google?.maps?.Map) {
        resolve(window.google.maps);
        return;
      }

      window.__foodFinderGoogleMapsLoaded = () => resolve(window.google.maps);
      existingScript.addEventListener("error", () =>
        reject(new Error("Google Maps failed to load."))
      );
      return;
    }

    try {
      reserveGoogleRequest();
    } catch (error) {
      reject(error);
      return;
    }

    window.__foodFinderGoogleMapsLoaded = () => resolve(window.google.maps);

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      v: "weekly",
      libraries: "places",
      loading: "async",
      callback: "__foodFinderGoogleMapsLoaded",
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps failed to load."));

    document.head.appendChild(script);
  });

  return mapsPromise;
}
