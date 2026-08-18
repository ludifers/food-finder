import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../services/googleMaps";
import {
  mapGooglePlaceToRestaurant,
  mapLegacyPlaceToRestaurant,
} from "../services/restaurantMapper";
import {
  foodTypeSearchQueries,
  getSelectedFoodTypes,
  getSelectedVibes,
} from "../services/foodPreferences";

const UCF_CENTER = { lat: 28.6024, lng: -81.2001 };
const MAP_DRAG_REFRESH_MILES = 4;

function createConcurrencyLimiter(max) {
  let running = 0;
  const queue = [];

  function run() {
    if (running >= max || !queue.length) return;
    running++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(fn)
      .then(resolve, reject)
      .finally(() => {
        running--;
        run();
      });
  }

  return function limit(fn) {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      run();
    });
  };
}
const FOOD_PLACE_TYPE_GROUPS = [
  [
    "restaurant",
    "bar_and_grill",
    "diner",
    "fast_food_restaurant",
    "fine_dining_restaurant",
    "food_court",
  ],
  [
    "pizza_restaurant",
    "hamburger_restaurant",
    "sandwich_shop",
    "breakfast_restaurant",
    "brunch_restaurant",
    "meal_takeaway",
  ],
  [
    "cafe",
    "coffee_shop",
    "bakery",
    "donut_shop",
    "dessert_shop",
    "ice_cream_shop",
  ],
  ["bar", "pub", "wine_bar", "meal_delivery"],
  [
    "barbecue_restaurant",
    "chinese_restaurant",
    "indian_restaurant",
    "italian_restaurant",
    "japanese_restaurant",
    "korean_restaurant",
    "mexican_restaurant",
    "seafood_restaurant",
    "steak_house",
    "sushi_restaurant",
    "thai_restaurant",
    "vietnamese_restaurant",
  ],
];
const LOCATION_FALLBACKS = {
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
const placeFields = [
  "id",
  "displayName",
  "formattedAddress",
  "googleMapsURI",
  "location",
  "photos",
  "priceLevel",
  "primaryType",
  "primaryTypeDisplayName",
  "rating",
  "regularOpeningHours",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "reviews",
  "reviewSummary",
  "types",
  "userRatingCount",
  "websiteURI",
];

function displayHours(hours) {
  if (hours === "Hours available" || hours === "Hours available on Google Maps") {
    return "";
  }

  return hours;
}

function buildPreferenceQuery(cravings, preferences) {
  const selectedFoodTypes = getSelectedFoodTypes(cravings);
  const selectedVibes = getSelectedVibes(cravings);
  const vibeQueries = {
    "Date night": "romantic",
    "Casual hangout": "casual",
    "Solo meal": "quick counter service",
    "Group outing": "group friendly",
  };
  const budgetQuery =
    preferences.budgetPerPerson <= 15
      ? "cheap"
      : preferences.budgetPerPerson >= 70 && preferences.budgetPerPerson < 999
        ? "upscale"
        : "";
  const foodQuery =
    selectedFoodTypes.length > 0
      ? selectedFoodTypes
          .map((item) => foodTypeSearchQueries[item])
          .filter(Boolean)
          .join(" or ")
      : "restaurants";
  const vibeQuery = selectedVibes.map((item) => vibeQueries[item]).join(" ");

  return [budgetQuery, vibeQuery, foodQuery]
    .filter(Boolean)
    .join(" ");
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

function getPlacePoint(place) {
  const location = place.location || place.geometry?.location;

  if (!location) {
    return null;
  }

  return {
    lat: location.lat(),
    lng: location.lng(),
  };
}

function filterPlacesNearCenter(places, center, shouldRestrict) {
  if (!shouldRestrict) {
    return places;
  }

  return places.filter((place) => {
    const miles = distanceInMiles(center, getPlacePoint(place));

    return miles !== null && miles <= 25;
  });
}

function getPlaceKey(place) {
  const point = getPlacePoint(place);

  return (
    place.id ||
    place.place_id ||
    [
      place.displayName || place.name,
      place.formattedAddress || place.vicinity,
      point ? point.lat.toFixed(5) : "",
      point ? point.lng.toFixed(5) : "",
    ]
      .filter(Boolean)
      .join("|")
  );
}

function dedupePlaces(places) {
  const seen = new Set();

  return places.filter((place) => {
    const key = getPlaceKey(place);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeLocationQuery(query) {
  const normalized = query.trim().toLowerCase();
  const fallback = LOCATION_FALLBACKS[normalized];

  if (fallback) {
    return fallback.address;
  }

  return query;
}

function geocodeLocation(query) {
  return new Promise((resolve, reject) => {
    if (!query) {
      resolve(null);
      return;
    }

    const normalized = query.trim().toLowerCase();
    const fallback = LOCATION_FALLBACKS[normalized];

    if (fallback) {
      resolve(fallback.center);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const address = normalizeLocationQuery(query);

    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) {
        reject(new Error(`Could not find ${query}.`));
        return;
      }

      const location = results[0].geometry.location;
      resolve({
        lat: location.lat(),
        lng: location.lng(),
      });
    });
  });
}

async function findLocationCenter(query) {
  const geocodedCenter = await geocodeLocation(query).catch(() => null);

  if (geocodedCenter || !query || !window.google.maps.importLibrary) {
    return geocodedCenter;
  }

  const { Place } = await window.google.maps.importLibrary("places");

  if (!Place.searchByText) {
    return null;
  }

  const { places } = await Place.searchByText({
    fields: ["location", "displayName", "formattedAddress"],
    maxResultCount: 1,
    textQuery: normalizeLocationQuery(query),
  });
  const location = places?.[0]?.location;

  if (!location) {
    return null;
  }

  return {
    lat: location.lat(),
    lng: location.lng(),
  };
}

async function searchTextNewApi(center, query, locationQuery) {
  const { Place } = await window.google.maps.importLibrary("places");

  if (!Place.searchByText) {
    throw new Error("Text search is unavailable.");
  }

  const { places } = await Place.searchByText({
    fields: placeFields,
    includedType: "restaurant",
    ...(center
      ? {
          locationBias: {
            center,
            radius: 9000,
          },
        }
      : {}),
    maxResultCount: 20,
    textQuery: locationQuery
      ? `${query} near ${normalizeLocationQuery(locationQuery)}`
      : query,
  });

  return places || [];
}

async function searchNearbyNewApi(center) {
  if (!center) {
    return [];
  }

  const { Place, SearchNearbyRankPreference } =
    await window.google.maps.importLibrary("places");

  const limit = createConcurrencyLimiter(2);

  const placeGroups = await Promise.all(
    FOOD_PLACE_TYPE_GROUPS.map((includedPrimaryTypes) =>
      limit(async () => {
        const { places } = await Place.searchNearby({
          fields: placeFields,
          includedPrimaryTypes,
          locationRestriction: {
            center,
            radius: 9000,
          },
          maxResultCount: 20,
          rankPreference: SearchNearbyRankPreference.POPULARITY,
        });

        return places || [];
      })
    )
  );

  return dedupePlaces(placeGroups.flat());
}

async function searchPlaces(map, center, query, locationQuery, legacySearch) {
  if (!window.google.maps.importLibrary) {
    if (!center) {
      return [];
    }

    return legacySearch(map, center, query);
  }

  const textPlaces = await searchTextNewApi(center, query, locationQuery).catch(
    () => []
  );

  const broadTextPlaces = locationQuery
    ? await searchTextNewApi(center, "restaurants", locationQuery).catch(() => [])
    : [];
  const textResults = dedupePlaces([...textPlaces, ...broadTextPlaces]);
  const nearbyCenter = center || getPlacePoint(textResults[0]);
  const nearbyPlaces = nearbyCenter
    ? await searchNearbyNewApi(nearbyCenter).catch(() =>
        legacySearch(map, nearbyCenter, query)
      )
    : [];
  const combinedPlaces = dedupePlaces([...textResults, ...nearbyPlaces]);

  if (combinedPlaces.length) {
    return combinedPlaces;
  }

  if (!center) {
    return [];
  }

  return searchNearbyNewApi(center).catch(() => legacySearch(map, center, query));
}

async function hydratePlacePhotos(places) {
  const limit = createConcurrencyLimiter(5);

  await Promise.all(
    places.map((place) =>
      limit(async () => {
        if (!place.fetchFields || place.photos?.length > 1) {
          return;
        }

        try {
          await place.fetchFields({
            fields: [
              "photos",
              "websiteURI",
              "nationalPhoneNumber",
              "googleMapsURI",
              "regularOpeningHours",
              "reviews",
              "reviewSummary",
            ],
          });
        } catch {
          // Nearby search data is still useful if details hydration fails.
        }
      })
    )
  );

  return places;
}

function GoogleRestaurantMap({
  cravings,
  locationQuery,
  preferences,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onRestaurantsLoaded,
  onStatusChange,
}) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const lastSearchCenter = useRef(null);
  const mapRefreshRequest = useRef(0);
  const [isLoading, setIsLoading] = useState(true);
  const visibleHours = displayHours(selectedRestaurant?.hours);

  function legacyNearbySearch(map, center, query) {
    return new Promise((resolve, reject) => {
      const service = new window.google.maps.places.PlacesService(map);

      service.nearbySearch(
        {
          location: center,
          keyword: query,
          radius: 8000,
          type: "restaurant",
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results || []);
            return;
          }

          reject(new Error(`Google Places request failed: ${status}`));
        }
      );
    });
  }

  useEffect(() => {
    let ignore = false;
    let dragListener = null;

    async function loadRestaurantsForCenter(center, searchQuery, queryLabel = "") {
      const requestId = ++mapRefreshRequest.current;
      setIsLoading(true);
      try {
        const places = await searchPlaces(
          mapInstance.current,
          center,
          searchQuery,
          queryLabel,
          legacyNearbySearch
        );
        let localPlaces = filterPlacesNearCenter(places, center, Boolean(center));

        if (!localPlaces.length && center) {
          const nearbyPlaces = await searchNearbyNewApi(center).catch(() =>
            legacyNearbySearch(mapInstance.current, center, searchQuery)
          );
          localPlaces = filterPlacesNearCenter(nearbyPlaces, center, true);
        }

        const hydratedPlaces = await hydratePlacePhotos(localPlaces);

        if (ignore || requestId !== mapRefreshRequest.current) {
          return;
        }

        const liveRestaurants = hydratedPlaces
          .filter((place) => place.location)
          .map((place, index) => mapGooglePlaceToRestaurant(place, index, cravings));

        const legacyRestaurants = hydratedPlaces
          .filter((place) => place.geometry?.location)
          .map((place, index) => mapLegacyPlaceToRestaurant(place, index, cravings));

        const mappedRestaurants = liveRestaurants.length
          ? liveRestaurants
          : legacyRestaurants;

        if (mappedRestaurants.length) {
          const nextSearchCenter = center || mappedRestaurants[0].location;

          if (queryLabel && !center && mappedRestaurants[0].location) {
            mapInstance.current.panTo(mappedRestaurants[0].location);
          }

          lastSearchCenter.current = nextSearchCenter;
          onRestaurantsLoaded(mappedRestaurants);
          onStatusChange("Showing live Google Places results.");
        } else {
          onStatusChange("No Google Places results found.");
        }
      } catch (error) {
        if (!ignore && requestId === mapRefreshRequest.current) {
          onStatusChange(error.message);
        }
      } finally {
        if (!ignore && requestId === mapRefreshRequest.current) {
          setIsLoading(false);
        }
      }
    }

    async function initializeMap() {
      try {
        setIsLoading(true);
        onStatusChange("Loading Google Maps...");

        await loadGoogleMaps();

        const resolvedCenter = await findLocationCenter(locationQuery).catch((error) => {
          onStatusChange(error.message);
          return null;
        });

        const mapCenter =
          resolvedCenter || preferences.userLocation || UCF_CENTER;
        const searchCenter = locationQuery
          ? resolvedCenter || null
          : mapCenter;
        const searchQuery = buildPreferenceQuery(cravings, preferences);

        if (ignore || !mapRef.current) {
          return;
        }

        const mapsLibrary = window.google.maps.importLibrary
          ? await window.google.maps.importLibrary("maps")
          : window.google.maps;
        const MapClass = mapsLibrary.Map || window.google.maps.Map;

        mapInstance.current = new MapClass(mapRef.current, {
          center: mapCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        await loadRestaurantsForCenter(searchCenter, searchQuery, locationQuery);

        if (ignore) {
          return;
        }

        dragListener = mapInstance.current.addListener("dragend", () => {
          const center = mapInstance.current.getCenter();
          const nextCenter = {
            lat: center.lat(),
            lng: center.lng(),
          };
          const movedMiles = distanceInMiles(lastSearchCenter.current, nextCenter);

          if (movedMiles !== null && movedMiles < MAP_DRAG_REFRESH_MILES) {
            return;
          }

          onStatusChange("Finding restaurants in this map area...");
          loadRestaurantsForCenter(nextCenter, searchQuery);
        });
      } catch (error) {
        onStatusChange(error.message);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initializeMap();

    return () => {
      ignore = true;
      dragListener?.remove();
    };
  }, [cravings, locationQuery, onRestaurantsLoaded, onStatusChange, preferences]);

  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps) {
      return;
    }

    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    if (selectedRestaurant?.location) {
      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: selectedRestaurant.location,
        title: selectedRestaurant.name,
      });

      markers.current.push(marker);
      return;
    }

    restaurants.slice(0, 1).forEach((restaurant, index) => {
      if (!restaurant.location) {
        return;
      }

      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: restaurant.location,
        title: restaurant.name,
      });

      marker.addListener("click", () => onSelectRestaurant(index));
      markers.current.push(marker);
    });
  }, [restaurants, selectedRestaurant, onSelectRestaurant]);

  useEffect(() => {
    if (!mapInstance.current || !selectedRestaurant?.location) {
      return;
    }

    mapInstance.current.panTo(selectedRestaurant.location);
    mapInstance.current.setZoom(17);
  }, [selectedRestaurant]);

  return (
    <div className="google-map-shell">
      <div className="google-map" ref={mapRef} />
      {selectedRestaurant && (
        <div className="map-label">
          <strong>{selectedRestaurant.name}</strong>
          <p>
            {[selectedRestaurant.distance, visibleHours].filter(Boolean).join(" / ")}
          </p>
        </div>
      )}
      {isLoading && <div className="map-loading">Loading live restaurants...</div>}
    </div>
  );
}

export default GoogleRestaurantMap;
