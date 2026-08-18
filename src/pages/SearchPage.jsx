import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  loadMatchPreferences,
  saveMatchPreferences,
} from "../services/matchPreferences";
import {
  normalizeUcfSearchLocation,
  ucfStarterLocations,
} from "../services/ucfArea";

function SearchPage() {
  const navigate = useNavigate();
  const [locationInput, setLocationInput] = useState("");

  function startSearch(nextLocation) {
    const trimmedLocation = normalizeUcfSearchLocation(nextLocation);

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
          <p className="eyebrow">UCF area search</p>
          <h1>Where near UCF should FoodFinder look?</h1>
          <p>
            Enter a campus landmark, nearby neighborhood, or ZIP code to start
            matching restaurants around UCF.
          </p>
        </section>

        <section className="search-card">
          <form className="location-search-form" onSubmit={handleSubmit}>
            <label>
              Campus area, neighborhood, or ZIP
              <input
                value={locationInput}
                onChange={(event) => setLocationInput(event.target.value)}
                placeholder="UCF, Knights Plaza, Waterford Lakes, or 32816"
              />
            </label>
            <button type="submit">Search</button>
          </form>

          <div className="starter-location-grid">
            {ucfStarterLocations.map((location) => (
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
