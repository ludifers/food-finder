import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SavedSpotsMap from "../components/SavedSpotsMap";
import MockSavedSpotsMap from "../components/MockSavedSpotsMap";
import OsmSavedSpotsMap from "../components/OsmSavedSpotsMap";
import { useAuth } from "../context/useAuth";
import { getHoursStatus } from "../services/hoursStatus";
import {
  shouldUseGoogleProvider,
  shouldUseOsmProvider,
} from "../services/mapProvider";
import {
  applyMatchPreferences,
  loadMatchPreferences,
} from "../services/matchPreferences";
import {
  getLocalSavedRestaurants,
  getSavedRestaurants,
} from "../services/userDataService";

function visibleTags(tags = []) {
  return tags.filter((tag) => !["Popular nearby", "Open now"].includes(tag));
}

function displayHours(hours) {
  if (hours === "Hours available" || hours === "Hours available on Google Maps") {
    return "";
  }

  return hours;
}

function getRestaurantKey(restaurant) {
  return (
    restaurant.id ||
    [restaurant.name, restaurant.address, restaurant.saveType]
      .filter(Boolean)
      .join("-")
  );
}

function SavedSpotDetail() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();
  const { isAuthLoading, user } = useAuth();
  const preferences = useMemo(() => loadMatchPreferences(), []);
  const SavedMap = shouldUseGoogleProvider()
    ? SavedSpotsMap
    : shouldUseOsmProvider()
      ? OsmSavedSpotsMap
      : MockSavedSpotsMap;
  const [remoteRestaurants, setRemoteRestaurants] = useState([]);
  const [hasLoadedRemoteSaved, setHasLoadedRemoteSaved] = useState(false);
  const localRestaurants = useMemo(
    () => (user ? getLocalSavedRestaurants(user.uid) : []),
    [user]
  );
  const savedRestaurants = useMemo(
    () => [
      ...localRestaurants,
      ...remoteRestaurants.filter(
        (restaurant) =>
          !localRestaurants.some((local) => local.id === restaurant.id)
      ),
    ],
    [localRestaurants, remoteRestaurants]
  );
  const savedRestaurant = savedRestaurants.find(
    (restaurant) => getRestaurantKey(restaurant) === restaurantId
  );
  const restaurant = savedRestaurant
    ? applyMatchPreferences(savedRestaurant, preferences)
    : null;
  const isSavedSpotLoading =
    isAuthLoading || (Boolean(user) && !hasLoadedRemoteSaved && !restaurant);
  const visibleHours = displayHours(restaurant?.hours);
  const factsHourStatus = getHoursStatus(restaurant);
  const restaurantTags = visibleTags(restaurant?.tags);
  const callUrl = restaurant?.phoneUrl;
  const directionsUrl = restaurant?.mapsUrl;
  const websiteUrl = restaurant?.website || restaurant?.mapsUrl;
  const reviews = restaurant?.reviews || [];

  useEffect(() => {
    if (!user) {
      return;
    }

    let ignore = false;

    getSavedRestaurants(user.uid)
      .then((restaurants) => {
        if (!ignore) {
          setRemoteRestaurants(restaurants);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) {
          setHasLoadedRemoteSaved(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  if (!isAuthLoading && !user) {
    return (
      <div>
        <Navbar />
        <main className="dashboard">
          <section className="saved-empty-state saved-login-required">
            <p className="eyebrow">Account required</p>
            <h1>Log in to view saved spots</h1>
            <p>Your saved restaurant details are only available when you are signed in.</p>
            <Link className="primary-btn" to="/account">
              Log in or create account
            </Link>
          </section>
        </main>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div>
        <Navbar />
        <button className="back-btn" onClick={() => navigate("/saved")} type="button">
          Back
        </button>
        <div className="swipe-layout">
          <aside className="restaurant-panel">
            <div className="loading-panel">
              <p className="eyebrow">Saved spot</p>
              <h1>
                {isSavedSpotLoading ? "Loading saved spot" : "Saved spot not found"}
              </h1>
              <p>
                {isSavedSpotLoading
                  ? "FoodFinder is loading your saved restaurant."
                  : "This restaurant may have been removed from your saved spots."}
              </p>
            </div>
          </aside>
          <main className="map-panel">
            <SavedMap
              onSelectRestaurant={() => {}}
              restaurants={[]}
              selectedRestaurant={null}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <button className="back-btn" onClick={() => navigate("/saved")} type="button">
        Back
      </button>

      <div className="swipe-layout saved-detail-layout">
        <aside className="restaurant-panel">
          <div className="match-status">
            <span>Saved spot</span>
            <strong>{restaurant.saveType}</strong>
          </div>

          <div className="restaurant-image carousel-image">
            <img src={restaurant.image} alt={restaurant.name} />
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

            <section className="match-insight">
              <div className="insight-copy">
                <p>
                  <strong>Saved food match.</strong> {restaurant.matchNote}
                </p>
                <p>
                  {[restaurant.savedList || "To try", restaurant.visited ? "Visited" : "Not visited"]
                    .filter(Boolean)
                    .join(" / ")}
                </p>
                {restaurant.note && <p>{restaurant.note}</p>}
              </div>

              <div className="insight-badge" aria-hidden="true">
                MAP
              </div>
            </section>

            <section className="match-facts">
              <article>
                <span className="fact-icon">PIN</span>
                <div>
                  <h4>Location</h4>
                  <p>{restaurant.address}</p>
                  <small className="status-good">Saved</small>
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
              {visibleHours && <p className="open-now">{visibleHours}</p>}
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
              {reviews.map((review) => (
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
        </aside>

        <main className="map-panel">
          <SavedMap
            onSelectRestaurant={() => {}}
            restaurants={[restaurant]}
            selectedRestaurant={restaurant}
          />
        </main>
      </div>
    </div>
  );
}

export default SavedSpotDetail;
