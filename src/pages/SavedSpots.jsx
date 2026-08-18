import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SavedSpotsMap from "../components/SavedSpotsMap";
import MockSavedSpotsMap from "../components/MockSavedSpotsMap";
import OsmSavedSpotsMap from "../components/OsmSavedSpotsMap";
import { useAuth } from "../context/useAuth";
import {
  shouldUseGoogleProvider,
  shouldUseOsmProvider,
} from "../services/mapProvider";
import {
  getLocalSavedRestaurants,
  getSavedRestaurants,
  removeRestaurant,
  removeRestaurantLocally,
  updateSavedRestaurant,
  updateSavedRestaurantLocally,
} from "../services/userDataService";

function getRestaurantKey(restaurant, index) {
  return (
    restaurant.id ||
    [restaurant.name, restaurant.address, restaurant.saveType, index]
      .filter(Boolean)
      .join("-")
  );
}

function getRestaurantPathId(restaurant) {
  return (
    restaurant.id ||
    [restaurant.name, restaurant.address, restaurant.saveType]
      .filter(Boolean)
      .join("-")
  );
}

function parsePriceValue(restaurant) {
  const priceText =
    restaurant.priceEstimate || restaurant.pricePerPerson || restaurant.price || "";
  const prices = String(priceText).match(/\d+/g)?.map(Number);

  if (!prices?.length) {
    return 0;
  }

  return Math.max(...prices);
}

function getRatingValue(restaurant) {
  const rating = Number(restaurant.rating);

  return Number.isFinite(rating) ? rating : 0;
}

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Liked", value: "liked" },
  { label: "Maybe", value: "maybe" },
  { label: "To try", value: "to-try" },
  { label: "Date night", value: "date-night" },
  { label: "Cheap", value: "cheap" },
  { label: "Late", value: "late-night" },
  { label: "Visited", value: "visited" },
  { label: "Price", value: "price" },
  { label: "Rating", value: "rating" },
];

const savedListOptions = [
  "To try",
  "Date night",
  "Cheap eats",
  "Late night",
  "Study spot",
  "Group meal",
];

function SavedSpotCard({ isSelected, onUpdate, restaurant, onOpen }) {
  const isLiked = restaurant.saveType === "Liked";
  const statusIcon = isLiked ? "♥" : "👍";

  return (
    <article
      className={`saved-spot-card${isSelected ? " active" : ""}`}
    >
      <span
        className={`saved-status-icon ${isLiked ? "liked" : "maybe"}`}
        aria-label={restaurant.saveType}
        title={restaurant.saveType}
      >
        {statusIcon}
      </span>

      <button className="saved-spot-main" onClick={onOpen} type="button">
        <img src={restaurant.image} alt={restaurant.name} />

        <div>
          <div className="saved-spot-heading">
            <h3>{restaurant.name}</h3>
            <span>{restaurant.saveType}</span>
          </div>

          <p>
            {[
              restaurant.cuisine,
              restaurant.priceEstimate || restaurant.pricePerPerson,
            ]
              .filter(Boolean)
              .join(" / ")}
          </p>

          {restaurant.rating && restaurant.rating !== "New" && (
            <small>{restaurant.rating}/5</small>
          )}
        </div>
      </button>

      <div className="saved-spot-controls">
        <label>
          List
          <select
            onChange={(event) => onUpdate(restaurant, { savedList: event.target.value })}
            value={restaurant.savedList || "To try"}
          >
            {savedListOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="saved-visited-toggle">
          <input
            checked={Boolean(restaurant.visited)}
            onChange={(event) =>
              onUpdate(restaurant, { visited: event.target.checked })
            }
            type="checkbox"
          />
          Visited
        </label>

        <textarea
          onBlur={(event) => onUpdate(restaurant, { note: event.target.value })}
          placeholder="Add a note"
          rows={2}
          defaultValue={restaurant.note || ""}
        />
      </div>

      <button
        className="remove-saved-btn"
        onClick={() => restaurant.onRemove?.()}
        type="button"
      >
        Remove
      </button>
    </article>
  );
}

function SavedList({
  activeRestaurant,
  emptyText,
  onOpenRestaurant,
  onRemoveRestaurant,
  onUpdateRestaurant,
  restaurants,
}) {
  return (
    <section className="saved-list-section">
      {restaurants.length === 0 ? (
        <p className="saved-empty-copy">{emptyText}</p>
      ) : (
        <div className="saved-card-list">
          {restaurants.map((restaurant, index) => (
            <SavedSpotCard
              isSelected={activeRestaurant?.id === restaurant.id}
              key={getRestaurantKey(restaurant, index)}
              onOpen={() => onOpenRestaurant(restaurant)}
              onUpdate={onUpdateRestaurant}
              restaurant={{
                ...restaurant,
                onRemove: () => onRemoveRestaurant(restaurant),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function SavedSpots() {
  const navigate = useNavigate();
  const SavedMap = shouldUseGoogleProvider()
    ? SavedSpotsMap
    : shouldUseOsmProvider()
      ? OsmSavedSpotsMap
      : MockSavedSpotsMap;
  const { isAuthLoading, user } = useAuth();
  const [remoteRestaurants, setRemoteRestaurants] = useState([]);
  const [localVersion, setLocalVersion] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const localRestaurants = useMemo(
    () => {
      localVersion;
      return user ? getLocalSavedRestaurants(user.uid) : [];
    },
    [user, localVersion]
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
  const filteredRestaurants = useMemo(() => {
    const nextRestaurants = [...savedRestaurants];

    if (activeFilter === "liked") {
      return nextRestaurants.filter((restaurant) => restaurant.saveType === "Liked");
    }

    if (activeFilter === "maybe") {
      return nextRestaurants.filter((restaurant) => restaurant.saveType === "Maybe");
    }

    if (activeFilter === "to-try") {
      return nextRestaurants.filter(
        (restaurant) => !restaurant.visited && (restaurant.savedList || "To try") === "To try"
      );
    }

    if (activeFilter === "date-night") {
      return nextRestaurants.filter((restaurant) => restaurant.savedList === "Date night");
    }

    if (activeFilter === "cheap") {
      return nextRestaurants.filter(
        (restaurant) =>
          restaurant.savedList === "Cheap eats" ||
          restaurant.tags?.includes("Cheap eats")
      );
    }

    if (activeFilter === "late-night") {
      return nextRestaurants.filter(
        (restaurant) =>
          restaurant.savedList === "Late night" ||
          restaurant.tags?.includes("Late night")
      );
    }

    if (activeFilter === "visited") {
      return nextRestaurants.filter((restaurant) => restaurant.visited);
    }

    if (activeFilter === "price") {
      return nextRestaurants.sort(
        (a, b) => parsePriceValue(b) - parsePriceValue(a)
      );
    }

    if (activeFilter === "rating") {
      return nextRestaurants.sort(
        (a, b) => getRatingValue(b) - getRatingValue(a)
      );
    }

    return nextRestaurants;
  }, [activeFilter, savedRestaurants]);
  const filteredRestaurantsWithLocation = useMemo(
    () => filteredRestaurants.filter((restaurant) => restaurant.location),
    [filteredRestaurants]
  );
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const selectedRestaurant =
    activeRestaurant &&
    filteredRestaurants.some((restaurant) => restaurant.id === activeRestaurant.id)
      ? activeRestaurant
      : null;

  useEffect(() => {
    if (!user) {
      return;
    }

    let ignore = false;

    getSavedRestaurants(user.uid)
      .then((restaurants) => {
        if (ignore) return;

        setRemoteRestaurants(restaurants);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [user]);

  function handleRemoveRestaurant(restaurantToRemove) {
    removeRestaurantLocally(user.uid, restaurantToRemove.id);
    removeRestaurant(user.uid, restaurantToRemove.id).catch(() => {});
    setLocalVersion((current) => current + 1);
    setActiveRestaurant((current) =>
      current?.id === restaurantToRemove.id ? null : current
    );

    setRemoteRestaurants((current) =>
      current.filter((r) => r.id !== restaurantToRemove.id)
    );
  }

  function handleOpenRestaurant(restaurant) {
    navigate(`/saved/${encodeURIComponent(getRestaurantPathId(restaurant))}`);
  }

  function handleUpdateRestaurant(restaurant, updates) {
    updateSavedRestaurantLocally(user.uid, restaurant.id, updates);
    updateSavedRestaurant(user.uid, restaurant.id, updates).catch(() => {});
    setLocalVersion((current) => current + 1);
    setRemoteRestaurants((current) =>
      current.map((item) =>
        item.id === restaurant.id ? { ...item, ...updates } : item
      )
    );
    setActiveRestaurant((current) =>
      current?.id === restaurant.id ? { ...current, ...updates } : current
    );
  }

  function handleFilterChange(nextFilter) {
    setActiveFilter(nextFilter);
    setActiveRestaurant(null);
  }

  if (!isAuthLoading && !user) {
    return (
      <div>
        <Navbar />
        <main className="dashboard">
          <section className="saved-empty-state saved-login-required">
            <p className="eyebrow">Account required</p>
            <h1>Log in to view saved spots</h1>
            <p>
              Your liked and maybe restaurants are only available when you are
              signed in.
            </p>
            <Link className="primary-btn" to="/account">
              Log in or create account
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main className="saved-layout">
        <aside className="saved-panel">
          <section className="saved-panel-header">
            <p className="eyebrow">Short list</p>
            <h1>Saved spots</h1>
              <p>
              Your UCF short list with notes, visit status, and quick filters.
              </p>

            <div className="saved-filter-bar" aria-label="Saved spot filters">
              {filterOptions.map((option) => (
                <button
                  className={activeFilter === option.value ? "active" : ""}
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            {savedRestaurants.length > 0 && (
              <p className="saved-count">
                Showing {filteredRestaurants.length} of {savedRestaurants.length}
              </p>
            )}
          </section>

          {savedRestaurants.length === 0 ? (
            <section className="saved-empty-state">
              <h2>No saved spots yet</h2>
              <p>Restaurants you mark Yes or Maybe will show up here.</p>
            </section>
          ) : (
            <SavedList
              activeRestaurant={selectedRestaurant}
              emptyText="No saved spots match this filter yet."
              onOpenRestaurant={handleOpenRestaurant}
              onRemoveRestaurant={handleRemoveRestaurant}
              onUpdateRestaurant={handleUpdateRestaurant}
              restaurants={filteredRestaurants}
            />
          )}
        </aside>

        <section className="saved-map-panel">
          <SavedMap
            onSelectRestaurant={setActiveRestaurant}
            restaurants={filteredRestaurantsWithLocation}
            selectedRestaurant={selectedRestaurant}
          />
        </section>
      </main>
    </div>
  );
}

export default SavedSpots;
