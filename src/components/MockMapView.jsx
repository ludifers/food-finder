import { UCF_BOUNDS, UCF_CENTER } from "../services/mockRestaurants";

function markerPosition(location) {
  const left =
    ((location.lng - UCF_BOUNDS.west) /
      (UCF_BOUNDS.east - UCF_BOUNDS.west)) *
    100;
  const top =
    ((UCF_BOUNDS.north - location.lat) /
      (UCF_BOUNDS.north - UCF_BOUNDS.south)) *
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
      <div className="mock-map" aria-label="UCF mock restaurant map">
        <div className="mock-water mock-water-one" />
        <div className="mock-water mock-water-two" />
        <div className="mock-road mock-road-i95">SR 417</div>
        <div className="mock-road mock-road-viera">University Blvd</div>
        <div className="mock-road mock-road-stadium">Alafaya Trl</div>
        <div className="mock-road mock-road-lake">Gemini Blvd</div>
        <div className="mock-road mock-road-wickham">Colonial Dr</div>

        <div className="mock-place mock-place-avenue">UCF</div>
        <div className="mock-place mock-place-duran">Waterford Lakes</div>
        <div className="mock-place mock-place-center">
          {UCF_CENTER.lat.toFixed(3)}, {UCF_CENTER.lng.toFixed(3)}
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

      <div className="mock-credit">UCF mock dev mode</div>
      {isLoading && <div className="map-loading">Loading UCF mock restaurants...</div>}
    </div>
  );
}

export default MockMapView;
