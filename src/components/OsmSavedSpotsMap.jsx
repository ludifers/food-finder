import { useMemo } from "react";
import OsmMapView from "./OsmMapView";

const DEFAULT_CENTER = { lat: 28.6024, lng: -81.2001 };

function OsmSavedSpotsMap({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const center = useMemo(
    () =>
      selectedRestaurant?.location ||
      restaurants.find((restaurant) => restaurant.location)?.location ||
      DEFAULT_CENTER,
    [restaurants, selectedRestaurant]
  );

  return (
    <OsmMapView
      center={center}
      isLoading={false}
      markers={restaurants}
      onSelectRestaurant={(restaurant) => onSelectRestaurant(restaurant)}
      selectedRestaurant={selectedRestaurant}
    />
  );
}

export default OsmSavedSpotsMap;
