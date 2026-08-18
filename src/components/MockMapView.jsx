import { VIERA_BOUNDS, VIERA_CENTER } from "../services/mockRestaurants";

function markerPosition(location) {
  const left =
    ((location.lng - VIERA_BOUNDS.west) /
      (VIERA_BOUNDS.east - VIERA_BOUNDS.west)) *
    100;
  const top =
    ((VIERA_BOUNDS.north - location.lat) /
      (VIERA_BOUNDS.north - VIERA_BOUNDS.south)) *
    100;

  return {
    left: `${Math.min(94, Math.max(6, left))}%`,
    top: `${Math.min(92, Math.max(8, top))}%`,
  };
}

function MockMapView({
  isLoading = false,
  markers = [],
  onSelectRestaurant,
  selectedRestaurant,
}) {
  const visibleMarkers = markers.length ? markers : [];

  return (
    <div className="google-map-shell mock-map-shell">
      <div className="mock-map" aria-label="Viera mock restaurant map">
        <div className="mock-water mock-water-one" />
        <div className="mock-water mock-water-two" />
        <div className="mock-road mock-road-i95">I-95</div>
        <div className="mock-road mock-road-viera">Viera Blvd</div>
        <div className="mock-road mock-road-stadium">Stadium Pkwy</div>
        <div className="mock-road mock-road-lake">Lake Andrew Dr</div>
        <div className="mock-road mock-road-wickham">N Wickham Rd</div>

        <div className="mock-place mock-place-avenue">The Avenue Viera</div>
        <div className="mock-place mock-place-duran">Duran Golf Club</div>
        <div className="mock-place mock-place-center">
          {VIERA_CENTER.lat.toFixed(3)}, {VIERA_CENTER.lng.toFixed(3)}
        </div>

        {visibleMarkers.map((restaurant, index) => {
          if (!restaurant.location) {
            return null;
          }

          const isSelected = selectedRestaurant?.id === restaurant.id;

          return (
            <button
              aria-label={restaurant.name}
              className={`mock-marker${isSelected ? " active" : ""}`}
              key={restaurant.id}
              onClick={() => onSelectRestaurant?.(restaurant, index)}
              style={markerPosition(restaurant.location)}
              title={restaurant.name}
              type="button"
            />
          );
        })}
      </div>

      {selectedRestaurant && (
        <div className="map-label">
          <strong>{selectedRestaurant.name}</strong>
          <p>{selectedRestaurant.address || selectedRestaurant.distance}</p>
        </div>
      )}

      <div className="mock-credit">Viera mock dev mode</div>
      {isLoading && <div className="map-loading">Loading Viera mock restaurants...</div>}
    </div>
  );
}

export default MockMapView;
