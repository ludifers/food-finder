import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();
  const savedCravings = JSON.parse(localStorage.getItem("cravings")) || [];

  return (
    <div>
      <Navbar />

      <main className="dashboard">
        <section className="match-hero">
          <div className="hero-copy">
            <p className="eyebrow">Food matching for Orlando</p>
            <h1>Great meals. No endless scrolling.</h1>
            <p>
              Tell FoodFinder what matters tonight, then get a short list of
              places that fit your budget, distance, cravings, and vibe.
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
            <p>Real restaurants near you</p>
            <small>
              Results load from Google Places and adapt to your budget, commute,
              cravings, and open-now preferences.
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

        <section className="matches-section">
          <div className="section-heading">
            <div>
              <h2>Matched for tonight</h2>
              <p>Start Discover to load live restaurants from Google Places.</p>
            </div>
            <button className="text-btn" onClick={() => navigate("/discover")}>
              View all
            </button>
          </div>

          <div className="live-match-cta">
            <h3>No mock listings here.</h3>
            <p>
              FoodFinder now waits for live Google data so the matches, photos,
              hours, and reviews reflect real restaurants.
            </p>
            <button className="primary-btn" onClick={() => navigate("/discover")}>
              Load live matches
            </button>
          </div>
        </section>

        <section className="city-search">
          <div>
            <h2>Find food by neighborhood</h2>
            <p>Prefer to browse? Search an area and keep the quiz in your pocket.</p>
          </div>
          <div className="search-shell">
            <input placeholder="Search by city, neighborhood, or campus" />
            <button onClick={() => navigate("/discover")}>Search</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
