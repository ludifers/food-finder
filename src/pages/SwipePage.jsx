import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GoogleRestaurantMap from "../components/GoogleRestaurantMap";
import MockRestaurantMap from "../components/MockRestaurantMap";
import OsmRestaurantMap from "../components/OsmRestaurantMap";
import { useAuth } from "../context/useAuth";
import { getValidCravings } from "../services/foodPreferences";
import { getHoursStatus } from "../services/hoursStatus";
import {
  getMapProviderName,
  shouldUseGoogleProvider,
  shouldUseMockProvider,
  shouldUseOsmProvider,
} from "../services/mapProvider";
import {
  applyMatchPreferences,
  calculateMatchScore,
  filterRestaurantsToUcfArea,
  getRestaurantDriveMinutes,
  loadMatchPreferences,
} from "../services/matchPreferences";
import { UCF_CENTER } from "../services/ucfArea";
import {
  saveRestaurant,
  saveRestaurantLocally,
} from "../services/userDataService";

function visibleTags(tags) {
  return tags.filter((tag) => !["Popular nearby", "Open now"].includes(tag));
}

function matchesOpenNowPreference(restaurant, preferences) {
  if (!preferences.openNowOnly) {
    return true;
  }

  return getHoursStatus(restaurant) === "Open";
}

function applyDriveTimePreference(restaurants, preferences) {
  if (!preferences.userLocation) {
    return restaurants;
  }

  const maxDriveMinutes = Number(preferences.maxDriveMinutes);
  const withinDriveTarget = restaurants.filter((restaurant) => {
    const driveMinutes = getRestaurantDriveMinutes(restaurant, preferences);

    return driveMinutes !== null && driveMinutes <= maxDriveMinutes;
  });

  return withinDriveTarget.length ? withinDriveTarget : restaurants;
}

function SwipePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const savedCravings = useMemo(
    () => getValidCravings(JSON.parse(localStorage.getItem("cravings")) || []),
    []
  );
  const matchPreferences = useMemo(() => {
    const preferences = loadMatchPreferences();

    if (preferences.travelMode === "walking" && !preferences.userLocation) {
      return {
        ...preferences,
        startAddress: preferences.startAddress || "UCF, Orlando, FL",
        userLocation: UCF_CENTER,
      };
    }

    return preferences;
  }, []);

  const [liveRestaurants, setLiveRestaurants] = useState([]);
  const [hasLoadedPlaces, setHasLoadedPlaces] = useState(false);
  const isMockProvider = shouldUseMockProvider();
  const initialLocationQuery = isMockProvider
    ? "UCF"
    : location.state?.locationQuery ||
      matchPreferences.searchLocation ||
      "UCF, Orlando, FL";
  const locationQuery = initialLocationQuery;
  const [index, setIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [, setLiked] = useState([]);
  const [, setMaybe] = useState([]);
  const [passed, setPassed] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [mapStatus, setMapStatus] = useState("");
  const RestaurantMap = shouldUseGoogleProvider()
    ? GoogleRestaurantMap
    : shouldUseOsmProvider()
      ? OsmRestaurantMap
      : MockRestaurantMap;
  const mapProviderName = getMapProviderName();

  const matchedRestaurants = useMemo(
    () => {
      const ucfRestaurants = filterRestaurantsToUcfArea(liveRestaurants);
      const openNowMatches = ucfRestaurants.filter((item) =>
        matchesOpenNowPreference(item, matchPreferences)
      );
      const openFilteredRestaurants = openNowMatches.length
        ? openNowMatches
        : ucfRestaurants;
      const restaurantsToShow = applyDriveTimePreference(
        openFilteredRestaurants,
        matchPreferences
      );

      return restaurantsToShow
        .map((item) => applyMatchPreferences(item, matchPreferences))
        .sort(
          (a, b) =>
            calculateMatchScore(b, matchPreferences, savedCravings) -
            calculateMatchScore(a, matchPreferences, savedCravings)
        );
    },
    [liveRestaurants, matchPreferences, savedCravings]
  );
  const restaurant = matchedRestaurants[index] || matchedRestaurants[0];
  const restaurantPhotos = restaurant?.gallery?.length
    ? restaurant.gallery
    : restaurant
      ? [restaurant.image]
      : [];
  const activePhoto = restaurantPhotos[photoIndex] || restaurantPhotos[0];

  const handleRestaurantsLoaded = useCallback((nextRestaurants) => {
    setLiveRestaurants(nextRestaurants);
    setHasLoadedPlaces(true);
    setIndex(0);
    setPhotoIndex(0);
  }, []);

  const handleSelectRestaurant = useCallback((nextIndex) => {
    setIndex(nextIndex);
    setPhotoIndex(0);
  }, []);
  const handleStatusChange = useCallback((message) => {
    setMapStatus(message);
  }, []);

  function movePhoto(direction) {
    setPhotoIndex((current) => {
      const total = restaurantPhotos.length;

      if (!total) {
        return 0;
      }

      return (current + direction + total) % total;
    });
  }

  async function handleChoice(choice) {
    if (!restaurant) {
      return;
    }

    if ((choice === "love" || choice === "maybe") && !user) {
      navigate("/account");
      return;
    }

    setSaveError("");

    if (choice === "love" || choice === "maybe") {
      const saveType = choice === "love" ? "Liked" : "Maybe";

      saveRestaurantLocally(user.uid, restaurant, saveType);

      if (choice === "love") {
        setLiked((prev) =>
          prev.some((item) => item.id === restaurant.id)
            ? prev
            : [...prev, restaurant]
        );
      }

      if (choice === "maybe") {
        setMaybe((prev) =>
          prev.some((item) => item.id === restaurant.id)
            ? prev
            : [...prev, restaurant]
        );
      }

      setPhotoIndex(0);
      setIndex((prev) => (prev + 1) % matchedRestaurants.length);

      saveRestaurant(user.uid, restaurant, saveType).catch((error) => {
        const message =
          error.code === "permission-denied"
            ? "Firestore blocked the save. Check your Firestore rules."
            : error.message || "Could not sync this restaurant to Firestore.";
        console.warn(message);
      });

      return;
    }

    if (choice === "pass") {
      setPassed([...passed, restaurant]);
    }

    setPhotoIndex(0);
    setIndex((prev) => (prev + 1) % matchedRestaurants.length);
  }

  if (!restaurant) {
    return (
      <div>
        <Navbar />
        <div className="swipe-layout">
          <aside className="restaurant-panel">
            <div className="loading-panel">
              <p className="eyebrow">Live matches</p>
              <h1>{hasLoadedPlaces ? "No matches found" : "Loading restaurants"}</h1>
              <p>
                {hasLoadedPlaces
                  ? "No UCF-area restaurants matched this filter. Try Waterford Lakes, add a few more minutes, or turn off Open now only."
                  : `FoodFinder is loading real restaurants from ${mapProviderName}.`}
              </p>
              {mapStatus && <p className="helper-text">{mapStatus}</p>}
              <div className="hero-actions">
                <button className="primary-btn" onClick={() => navigate("/cravings")}>
                  Adjust preferences
                </button>
                <button
                  className="secondary-btn"
                  onClick={() =>
                    navigate("/discover", {
                      state: { locationQuery: "Waterford Lakes" },
                    })
                  }
                >
                  Try Waterford Lakes
                </button>
              </div>
            </div>
          </aside>

          <main className="map-panel">
            <RestaurantMap
              cravings={savedCravings}
              locationQuery={locationQuery}
              restaurants={matchedRestaurants}
              preferences={matchPreferences}
              selectedRestaurant={null}
              onSelectRestaurant={handleSelectRestaurant}
              onRestaurantsLoaded={handleRestaurantsLoaded}
              onStatusChange={handleStatusChange}
            />
          </main>
        </div>
      </div>
    );
  }

  const callUrl = restaurant.phoneUrl;
  const directionsUrl = restaurant.mapsUrl;
  const websiteUrl = restaurant.website || restaurant.mapsUrl;
  const factsHourStatus = matchPreferences.startAddress
    ? getHoursStatus(restaurant)
    : "Choose starting location to see hours";
  const restaurantTags = visibleTags(restaurant.tags);

  return (
    <div>
      <Navbar />

      <div className="swipe-layout">
        <aside className="restaurant-panel">
          <div className="match-status">
            <button className="panel-back-btn" onClick={() => navigate("/")}>
              Back
            </button>
            <span>
              {index + 1} of {matchedRestaurants.length} UCF-area matches:
              prioritized by price, location, and amenities
            </span>
          </div>

          <div className="restaurant-image carousel-image">
            <img src={activePhoto} alt={restaurant.name} />

            {restaurantPhotos.length > 1 && (
              <>
                <button
                  className="carousel-btn carousel-prev"
                  onClick={() => movePhoto(-1)}
                  aria-label="Previous photo"
                >
                  &lt;
                </button>
                <button
                  className="carousel-btn carousel-next"
                  onClick={() => movePhoto(1)}
                  aria-label="Next photo"
                >
                  &gt;
                </button>
                <span className="carousel-count">
                  {photoIndex + 1} / {restaurantPhotos.length}
                </span>
              </>
            )}
          </div>

          <div className="restaurant-content">
            <div className="restaurant-title-row">
              <h1>{restaurant.name}</h1>
              {restaurant.rating && restaurant.rating !== "New" && (
                <span>{restaurant.rating}/5</span>
              )}
            </div>

            <div className="restaurant-contact-line">
              <p>{restaurant.phone}</p>
            </div>

            {restaurantTags.length > 0 && (
              <div className="tag-row">
                {restaurantTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}

            <section className="match-facts">
              <article>
                <span className="fact-icon">PIN</span>
                <div>
                  <h4>Location</h4>
                  <p>{restaurant.address}</p>
                </div>
              </article>

              <article>
                <span className="fact-icon">USD</span>
                <div>
                  <h4>Budget</h4>
                  <p>{restaurant.priceEstimate || restaurant.pricePerPerson}</p>
                </div>
              </article>

              <article>
                <span className="fact-icon">TRV</span>
                <div>
                  <h4>Travel</h4>
                  <p>{restaurant.driveTime}</p>
                  {restaurant.driveNote && (
                    <small className="status-warn">{restaurant.driveNote}</small>
                  )}
                </div>
              </article>

              <article>
                <span className="fact-icon">HRS</span>
                <div>
                  <h4>Hours</h4>
                  <p>{factsHourStatus}</p>
                </div>
              </article>
            </section>

            <section className="contact-card">
              <h4>Contact this restaurant</h4>
              <div className="contact-body">
                <img src={restaurant.image} alt={restaurant.name} />

                <div className="contact-links">
                  {callUrl ? (
                    <a href={callUrl}>Call restaurant</a>
                  ) : (
                    <button disabled title="Phone number is not available from Google.">
                      Call restaurant
                    </button>
                  )}

               

                  {directionsUrl ? (
                    <a href={directionsUrl} target="_blank" rel="noreferrer">
                      Get directions
                    </a>
                  ) : (
                    <button disabled title="Directions link is not available.">
                      Get directions
                    </button>
                  )}

                  {websiteUrl ? (
                    <a href={websiteUrl} target="_blank" rel="noreferrer">
                      View website
                    </a>
                  ) : (
                    <button disabled title="Website is not available from Google.">
                      View website
                    </button>
                  )}
                </div>
              </div>
            </section>

            <div className="detail-block">
              <h4>Hours</h4>
              {restaurant.hoursDetail?.length ? (
                <div className="hours-list">
                  {restaurant.hoursDetail.map((item) => (
                    <p key={item}>{item}</p>
                  ))}
                </div>
              ) : (
                <small>Full hours unavailable from Google.</small>
              )}
            </div>

            <div className="detail-block">
              <h4>Recent reviews</h4>
              {restaurant.reviews.map((review) => (
                <div
                  className="review-card"
                  key={`${review.author || "review"}-${review.text || review}`}
                >
                  {typeof review === "string" ? (
                    <p>{review}</p>
                  ) : (
                    <>
                      <div className="review-meta">
                        <strong>{review.author}</strong>
                        <span>
                          {review.rating ? `${review.rating} stars` : "Google review"}
                          {review.time ? ` / ${review.time}` : ""}
                        </span>
                      </div>
                      <p>{review.text}</p>
                      {review.url && (
                        <a href={review.url} target="_blank" rel="noreferrer">
                          View on Google
                        </a>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

          </div>

          {saveError && (
            <div className="choice-summary">
              <p className="choice-error">{saveError}</p>
            </div>
          )}

          <div className="action-row">
            <button
              onClick={() => handleChoice("pass")}
              className="pass-btn"
            >
              No
            </button>

            <button
              onClick={() => handleChoice("love")}
              className="love-btn"
            >
              Yes
            </button>

            <button
              onClick={() => handleChoice("maybe")}
              className="maybe-btn"
            >
              Maybe
            </button>
          </div>
        </aside>

        <main className="map-panel">
          <RestaurantMap
            cravings={savedCravings}
            locationQuery={locationQuery}
            restaurants={matchedRestaurants}
            preferences={matchPreferences}
            selectedRestaurant={restaurant}
            onSelectRestaurant={handleSelectRestaurant}
            onRestaurantsLoaded={handleRestaurantsLoaded}
            onStatusChange={handleStatusChange}
          />
        </main>
      </div>
    </div>
  );
}

export default SwipePage;
