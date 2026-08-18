import MockMapView from "./MockMapView";

function MockSavedSpotsMap({ restaurants, selectedRestaurant, onSelectRestaurant }) {
  return (
    <MockMapView
      markers={restaurants}
      onSelectRestaurant={(restaurant) => onSelectRestaurant(restaurant)}
      selectedRestaurant={selectedRestaurant}
    />
  );
}

export default MockSavedSpotsMap;
