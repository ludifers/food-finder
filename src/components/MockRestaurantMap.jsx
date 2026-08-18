import { useEffect } from "react";
import MockMapView from "./MockMapView";
import { getMockVieraRestaurants } from "../services/mockRestaurants";

function MockRestaurantMap({
  cravings,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onRestaurantsLoaded,
  onStatusChange,
}) {
  const isLoading = restaurants.length === 0;

  useEffect(() => {
    if (restaurants.length > 0) {
      return;
    }

    onStatusChange("Loading Viera mock restaurants...");

    const timeoutId = window.setTimeout(() => {
      onRestaurantsLoaded(getMockVieraRestaurants(cravings));
      onStatusChange("Showing Viera mock restaurants.");
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [cravings, onRestaurantsLoaded, onStatusChange, restaurants.length]);

  return (
    <MockMapView
      isLoading={isLoading}
      markers={selectedRestaurant ? [selectedRestaurant] : restaurants.slice(0, 1)}
      onSelectRestaurant={(restaurant, index) => onSelectRestaurant(index)}
      selectedRestaurant={selectedRestaurant}
    />
  );
}

export default MockRestaurantMap;
