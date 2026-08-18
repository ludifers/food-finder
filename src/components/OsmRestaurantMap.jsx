import { useEffect, useRef, useState } from "react";
import OsmMapView from "./OsmMapView";
import {
  geocodeOsmLocation,
  searchOsmRestaurants,
} from "../services/osmRestaurants";

const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };

function OsmRestaurantMap({
  cravings,
  locationQuery,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onRestaurantsLoaded,
  onStatusChange,
}) {
  const requestId = useRef(0);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [isLoading, setIsLoading] = useState(() => restaurants.length === 0);

  useEffect(() => {
    if (restaurants.length > 0) {
      return;
    }

    let ignore = false;
    const currentRequest = ++requestId.current;

    async function loadRestaurants() {
      setIsLoading(true);
      onStatusChange("Loading OpenStreetMap restaurants...");

      try {
        const nextCenter = await geocodeOsmLocation(locationQuery || "UCF");
        const nextRestaurants = await searchOsmRestaurants(nextCenter, cravings);

        if (ignore || currentRequest !== requestId.current) {
          return;
        }

        setCenter(nextCenter);
        onRestaurantsLoaded(nextRestaurants);
        onStatusChange("Showing OpenStreetMap dev results.");
      } catch (error) {
        if (!ignore && currentRequest === requestId.current) {
          onStatusChange(
            error.name === "AbortError"
              ? "OpenStreetMap took too long to respond. Try again in a minute."
              : error.message
          );
          onRestaurantsLoaded([]);
        }
      } finally {
        if (!ignore && currentRequest === requestId.current) {
          setIsLoading(false);
        }
      }
    }

    loadRestaurants();

    return () => {
      ignore = true;
    };
  }, [
    cravings,
    locationQuery,
    onRestaurantsLoaded,
    onStatusChange,
    restaurants.length,
  ]);

  return (
    <OsmMapView
      center={center}
      isLoading={isLoading}
      markers={selectedRestaurant ? [selectedRestaurant] : restaurants.slice(0, 1)}
      onSelectRestaurant={(restaurant, index) => onSelectRestaurant(index)}
      selectedRestaurant={selectedRestaurant}
    />
  );
}

export default OsmRestaurantMap;
