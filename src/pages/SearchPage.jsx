import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  loadMatchPreferences,
  saveMatchPreferences,
} from "../services/matchPreferences";

const starterLocations = [
  "Orlando",
  "Viera",
  "Cocoa Beach",
  "Winter Park",
  "Lake Nona",
  "Downtown Orlando",
  "UCF",
  "Oviedo",
  "Kissimmee",
  "Melbourne",
];

function SearchPage() {
  const navigate = useNavigate();
  const [locationInput, setLocationInput] = useState("");

  function startSearch(nextLocation) {
    const trimmedLocation = nextLocation.trim();

    if (!trimmedLocation) {
      return;
    }

    const preferences = {
      ...loadMatchPreferences(),
      searchLocation: trimmedLocation,
    };

    saveMatchPreferences(preferences);
    localStorage.setItem("lastSearchLocation", trimmedLocation);

    navigate("/discover", {
      state: {
        locationQuery: trimmedLocation,
      },
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    startSearch(locationInput);
  }

  return (
    <div>
      <Navbar />

      <main className="search-page">
        <section className="search-intro">
          <p className="eyebrow">Search area</p>
          <h1>Where should FoodFinder look?</h1>
          <p>
            Enter a city, neighborhood, or ZIP code to start matching restaurants
            in that area.
          </p>
        </section>

        <section className="search-card">
          <form className="location-search-form" onSubmit={handleSubmit}>
            <label>
              City, neighborhood, or ZIP
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="Cocoa Beach, 32801, Winter Park"
              />
            </label>
            <button type="submit">Search</button>
          </form>

          <div className="starter-location-grid">
            {starterLocations.map((location) => (
              <button
                key={location}
                onClick={() => startSearch(location)}
                type="button"
              >
                {location}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default SearchPage;
