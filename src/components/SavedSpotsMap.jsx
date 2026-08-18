import { useEffect, useMemo, useRef, useState } from "react";
import { loadGoogleMaps } from "../services/googleMaps";

const UCF_CENTER = { lat: 28.6024, lng: -81.2001 };
const SELECTED_SAVED_ZOOM = 16;

function getMapCenter(restaurants, selectedRestaurant) {
  if (selectedRestaurant?.location) {
    return selectedRestaurant.location;
  }

  return restaurants.find((restaurant) => restaurant.location)?.location || UCF_CENTER;
}

function SavedSpotsMap({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const restaurantsWithLocation = useMemo(
    () => restaurants.filter((restaurant) => restaurant.location),
    [restaurants]
  );
  const initialCenter = useMemo(
    () => getMapCenter(restaurantsWithLocation, null),
    [restaurantsWithLocation]
  );

  useEffect(() => {
    let ignore = false;

    async function initializeMap() {
      setIsLoading(true);
      await loadGoogleMaps();

      if (ignore || !mapRef.current) {
        return;
      }

      const mapsLibrary = window.google.maps.importLibrary
        ? await window.google.maps.importLibrary("maps")
        : window.google.maps;
      const MapClass = mapsLibrary.Map || window.google.maps.Map;

      mapInstance.current = new MapClass(mapRef.current, {
        center: initialCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      setIsLoading(false);
    }

    initializeMap().catch(() => setIsLoading(false));

    return () => {
      ignore = true;
    };
  }, [initialCenter]);

  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps) {
      return;
    }

    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    restaurantsWithLocation.forEach((restaurant) => {
      const isSelected = selectedRestaurant?.id === restaurant.id;
      const marker = new window.google.maps.Marker({
        map: mapInstance.current,
        position: restaurant.location,
        title: restaurant.name,
        label: isSelected ? "" : undefined,
        opacity: isSelected ? 1 : 0.82,
        zIndex: isSelected ? 2 : 1,
      });

      marker.addListener("click", () => onSelectRestaurant(restaurant));
      markers.current.push(marker);
      bounds.extend(restaurant.location);
    });

    if (selectedRestaurant?.location) {
      mapInstance.current.panTo(selectedRestaurant.location);
      mapInstance.current.setZoom(SELECTED_SAVED_ZOOM);
      return;
    }

    if (restaurantsWithLocation.length > 1) {
      mapInstance.current.fitBounds(bounds, 80);
    } else if (restaurantsWithLocation.length === 1) {
      mapInstance.current.setCenter(restaurantsWithLocation[0].location);
      mapInstance.current.setZoom(SELECTED_SAVED_ZOOM);
    }
  }, [restaurantsWithLocation, selectedRestaurant, onSelectRestaurant]);

  return (
    <div className="saved-map-shell">
      <div className="google-map" ref={mapRef} />

      {selectedRestaurant && (
        <div className="map-label">
          <strong>{selectedRestaurant.name}</strong>
          <p>{selectedRestaurant.address || "Saved restaurant"}</p>
        </div>
      )}

      {isLoading && <div className="map-loading">Loading saved map...</div>}
    </div>
  );
}

export default SavedSpotsMap;
