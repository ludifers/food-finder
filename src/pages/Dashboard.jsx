import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  loadMatchPreferences,
  saveMatchPreferences,
} from "../services/matchPreferences";
import { UCF_CENTER, UCF_DEFAULT_LOCATION } from "../services/ucfArea";

function Dashboard() {
  const navigate = useNavigate();
  const savedCravings = JSON.parse(localStorage.getItem("cravings")) || [];
  const [searchInput, setSearchInput] = useState("");

  function startSearch(nextLocation) {
    const trimmedLocation = nextLocation.trim() || UCF_DEFAULT_LOCATION;
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

  function applyQuickStart(nextPreferences, nextCravings = []) {
    const preferences = {
      ...loadMatchPreferences(),
      searchLocation: UCF_DEFAULT_LOCATION,
      ...nextPreferences,
    };
    const mergedCravings = Array.from(
      new Set([...savedCravings, ...nextCravings])
    );

    localStorage.setItem("cravings", JSON.stringify(mergedCravings));
    saveMatchPreferences(preferences);

    navigate("/discover", {
      state: {
        locationQuery: preferences.searchLocation,
        matchFromQuiz: true,
      },
    });
  }

  return (
    <div>
      <Navbar />

      <main className="dashboard">
        <section className="match-hero">
          <div className="hero-copy">
            <p className="eyebrow">Food matching for UCF</p>
            <h1>Great meals near campus. No endless scrolling.</h1>
            <p>
              Tell FoodFinder what matters tonight, then get a short list of
              UCF-area spots that fit your budget, distance, cravings, and vibe.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => navigate("/cravings")}>
                Take the taste quiz
              </button>
              <button className="secondary-btn" onClick={() => navigate("/discover")}>
                See matches
              </button>
            </div>
          </div>

          <div className="match-preview">
            <div>
              <span>Live Google Places</span>
              <strong>Tonight's best fit</strong>
            </div>
            <div className="preview-placeholder" aria-hidden="true">
              <span>MAP</span>
            </div>
            <p>Real restaurants around UCF</p>
            <small>
              Results load from Google Places and adapt to your budget, commute,
              cravings, and open-now preferences around campus.
            </small>
          </div>
        </section>

        <section className="steps-section">
          <article>
            <span>1</span>
            <h3>Take the quiz</h3>
            <p>Pick your cravings, budget, distance, and dining mood.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Get matched</h3>
            <p>FoodFinder ranks places by what you actually care about.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Make the move</h3>
            <p>Save, call, check menus, or get directions from one view.</p>
          </article>
        </section>

        <section className="preference-strip">
          <div>
            <h2>Your match profile</h2>
            <p>
              {savedCravings.length
                ? savedCravings.join(" / ")
                : "No cravings saved yet. Start with the quiz for sharper matches."}
            </p>
          </div>
          <button className="secondary-btn" onClick={() => navigate("/cravings")}>
            Adjust profile
          </button>
        </section>

        <section className="preference-strip">
          <div>
            <h2>Campus quick start</h2>
            <p>Choose a UCF baseline and start with results tuned to student needs.</p>
          </div>
          <div className="hero-actions">
            <button
              className="secondary-btn"
              onClick={() =>
                applyQuickStart({
                  startAddress: UCF_DEFAULT_LOCATION,
                  travelMode: "walking",
                  maxDriveMinutes: 15,
                  userLocation: UCF_CENTER,
                })
              }
            >
              Walking from campus
            </button>
            <button
              className="secondary-btn"
              onClick={() => applyQuickStart({ budgetPerPerson: 15 }, ["Cheap eats"])}
            >
              Cheap eats
            </button>
            <button
              className="secondary-btn"
              onClick={() => applyQuickStart({ openNowOnly: true }, ["Late night"])}
            >
              Open now
            </button>
          </div>
        </section>

        <section className="matches-section">
          <div className="section-heading">
            <div>
              <h2>Matched for tonight</h2>
              <p>Start Discover to load live restaurants around UCF.</p>
            </div>
            <button className="text-btn" onClick={() => navigate("/discover")}>
              View all
            </button>
          </div>

          <div className="live-match-cta">
            <h3>No mock listings here.</h3>
            <p>
              FoodFinder now waits for live Google data so the UCF-area matches,
              photos, hours, and reviews reflect real restaurants.
            </p>
            <button className="primary-btn" onClick={() => navigate("/discover")}>
              Load live matches
            </button>
          </div>
        </section>

        <section className="city-search">
          <div>
            <h2>Find food near campus</h2>
            <p>Prefer to browse? Search a UCF-area spot and keep the quiz in your pocket.</p>
          </div>
          <form
            className="search-shell"
            onSubmit={(event) => {
              event.preventDefault();
              startSearch(searchInput);
            }}
          >
            <input
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search UCF, Knights Plaza, or Waterford Lakes"
              value={searchInput}
            />
            <button type="submit">Search</button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
