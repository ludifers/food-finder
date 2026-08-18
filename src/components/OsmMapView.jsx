const TILE_SIZE = 256;

function lonToTileX(lng, zoom) {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat, zoom) {
  const latRad = (lat * Math.PI) / 180;

  return (
    ((1 -
      Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2) *
    2 ** zoom
  );
}

function getBoundsCenter(points, fallback) {
  if (!points.length) {
    return fallback;
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);

  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

function markerPosition(point, center, zoom) {
  const centerX = lonToTileX(center.lng, zoom) * TILE_SIZE;
  const centerY = latToTileY(center.lat, zoom) * TILE_SIZE;
  const pointX = lonToTileX(point.lng, zoom) * TILE_SIZE;
  const pointY = latToTileY(point.lat, zoom) * TILE_SIZE;

  return {
    left: `calc(50% + ${pointX - centerX}px)`,
    top: `calc(50% + ${pointY - centerY}px)`,
  };
}

function tileGrid(center, zoom) {
  const centerTileX = lonToTileX(center.lng, zoom);
  const centerTileY = latToTileY(center.lat, zoom);
  const centerPixelX = centerTileX * TILE_SIZE;
  const centerPixelY = centerTileY * TILE_SIZE;
  const startTileX = Math.floor(centerTileX) - 2;
  const startTileY = Math.floor(centerTileY) - 2;
  const tiles = [];

  for (let x = startTileX; x < startTileX + 5; x++) {
    for (let y = startTileY; y < startTileY + 5; y++) {
      tiles.push({
        key: `${zoom}-${x}-${y}`,
        left: `calc(50% + ${x * TILE_SIZE - centerPixelX}px)`,
        src: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        top: `calc(50% + ${y * TILE_SIZE - centerPixelY}px)`,
      });
    }
  }

  return tiles;
}

function zoomForMarkers(markers, selectedRestaurant) {
  if (selectedRestaurant?.location) {
    return 16;
  }

  if (markers.length <= 1) {
    return 13;
  }

  return 12;
}

function OsmMapView({
  center,
  isLoading,
  markers = [],
  onSelectRestaurant,
  selectedRestaurant,
}) {
  const markerPoints = markers
    .map((restaurant) => restaurant.location)
    .filter(Boolean);
  const mapCenter =
    selectedRestaurant?.location ||
    getBoundsCenter(markerPoints, center || { lat: 28.6024, lng: -81.2001 });
  const zoom = zoomForMarkers(markers, selectedRestaurant);
  const tiles = tileGrid(mapCenter, zoom);

  return (
    <div className="google-map-shell osm-map-shell">
      <div className="osm-map" aria-label="OpenStreetMap restaurant map">
        {tiles.map((tile) => (
          <img
            alt=""
            className="osm-tile"
            draggable="false"
            key={tile.key}
            src={tile.src}
            style={{ left: tile.left, top: tile.top }}
          />
        ))}

        {markers.map((restaurant, index) => {
          if (!restaurant.location) {
            return null;
          }

          const isSelected = selectedRestaurant?.id === restaurant.id;

          return (
            <button
              aria-label={restaurant.name}
              className={`osm-marker${isSelected ? " active" : ""}`}
              key={restaurant.id}
              onClick={() => onSelectRestaurant?.(restaurant, index)}
              style={markerPosition(restaurant.location, mapCenter, zoom)}
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

      <div className="osm-credit">OpenStreetMap dev mode</div>
      {isLoading && <div className="map-loading">Loading OpenStreetMap restaurants...</div>}
    </div>
  );
}

export default OsmMapView;
