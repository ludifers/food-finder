import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  foodTypeOptions,
  getValidCravings,
  vibeOptions,
} from "../services/foodPreferences";
import {
  loadMatchPreferences,
  saveMatchPreferences,
} from "../services/matchPreferences";
import { loadGoogleMaps } from "../services/googleMaps";
import { useAuth } from "../context/useAuth";
import {
  getUserPreferences,
  saveUserPreferences,
} from "../services/userDataService";

const budgetOptions = [
  { label: "Under $15", value: 15 },
  { label: "$15-$32", value: 40 },
  { label: "$32+", value: 70 },
  { label: "No limit", value: 999 },
];

function reverseGeocodeLocation(location) {
  return loadGoogleMaps()
    .then(
      () =>
        new Promise((resolve, reject) => {
          const geocoder = new window.google.maps.Geocoder();

          geocoder.geocode({ location }, (results, status) => {
            if (status !== "OK" || !results?.[0]?.formatted_address) {
              reject(new Error("Address unavailable."));
              return;
            }

            resolve(results[0].formatted_address);
          });
        })
    );
}

function Cravings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selected, setSelected] = useState(
    getValidCravings(JSON.parse(localStorage.getItem("cravings")) || [])
  );
  const [preferences, setPreferences] = useState(loadMatchPreferences);
  const [locationStatus, setLocationStatus] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    getUserPreferences(user.uid).then((savedPreferences) => {
      if (!savedPreferences) {
        return;
      }

      if (savedPreferences.cravings) {
        setSelected(getValidCravings(savedPreferences.cravings));
      }

      setPreferences((current) => ({
        ...current,
        ...savedPreferences,
      }));
    });
  }, [user]);

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleCraving(nextValue) {
    setSelected((current) =>
      current.includes(nextValue)
        ? current.filter((item) => item !== nextValue)
        : [...current, nextValue]
    );
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not available in this browser.");
      return;
    }

    setLocationStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const fallbackAddress = `Current location (${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)})`;

        setPreferences((current) => ({
          ...current,
          searchLocation: fallbackAddress,
        }));
        setLocationStatus("Current location added.");

        reverseGeocodeLocation(userLocation)
          .then((address) => {
            setPreferences((current) => ({
              ...current,
              searchLocation: address,
            }));
            setLocationStatus("Current address added.");
          })
          .catch(() => {
            setLocationStatus("Current location added.");
          });
      },
      () => {
        setLocationStatus("Could not access your location.");
      }
    );
  }

  function savePreferences() {
    const prefsWithCravings = { ...preferences, cravings: selected };
    localStorage.setItem("cravings", JSON.stringify(selected));
    saveMatchPreferences(prefsWithCravings);

    if (user) {
      saveUserPreferences(user.uid, prefsWithCravings).catch(() => {
        setSaveStatus(
          "Saved on this device. Firestore did not accept the cloud save yet."
        );
      });
    }

    navigate("/discover", {
      state: {
        matchFromQuiz: true,
        locationQuery: prefsWithCravings.searchLocation,
      },
    });
  }

  return (
    <div>
      <Navbar />

      <main className="quiz-page">
        <section className="quiz-intro">
          <p className="eyebrow">Match preferences</p>
          <h1>Build your food match profile.</h1>
          <p>
            Set your UCF-area starting point, budget, drive target, and cravings
            so FoodFinder can score restaurants like a real matchmaker.
          </p>
        </section>

        <section className="quiz-card">
          <div className="quiz-block">
            <h2>Where near UCF do you want to eat?</h2>
            <div className="preference-fields">
              <label>
                Campus area, neighborhood, or ZIP
                <input
                  value={preferences.searchLocation}
                  onChange={(event) =>
                    updatePreference("searchLocation", event.target.value)
                  }
                  placeholder="UCF, Knights Plaza, Waterford Lakes, or 32816"
                />
              </label>
              <button className="secondary-btn" onClick={useCurrentLocation}>
                Use current location
              </button>
            </div>
            {locationStatus && <p className="helper-text">{locationStatus}</p>}
          </div>

          <div className="quiz-block">
            <h2>What is the vibe tonight?</h2>
            <div className="cravings-grid four-choice-grid">
              {vibeOptions.map((option) => (
                <button
                  key={option}
                  className={selected.includes(option) ? "selected-craving" : ""}
                  onClick={() => toggleCraving(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-block">
            <h2>Budget per person</h2>
            <div className="cravings-grid four-choice-grid">
              {budgetOptions.map((option) => (
                <button
                  key={option.label}
                  className={
                    preferences.budgetPerPerson === option.value
                      ? "selected-craving"
                      : ""
                  }
                  onClick={() => updatePreference("budgetPerPerson", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-block">
            <h2>Type of food</h2>
            <div className="cravings-grid food-choice-grid">
              {foodTypeOptions.map((option) => (
                <button
                  key={option}
                  className={selected.includes(option) ? "selected-craving" : ""}
                  onClick={() => toggleCraving(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-block preference-grid drive-grid">
            <label>
              Max drive time
              <select
                value={preferences.maxDriveMinutes}
                onChange={(event) =>
                  updatePreference("maxDriveMinutes", Number(event.target.value))
                }
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={25}>25 minutes</option>
                <option value={40}>40 minutes</option>
              </select>
            </label>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={preferences.openNowOnly}
                onChange={(event) =>
                  updatePreference("openNowOnly", event.target.checked)
                }
              />
              Open now only
            </label>
          </div>

          <div className="quiz-footer">
            <p>
              {selected.length || "No"} choices /{" "}
              {preferences.budgetPerPerson === 999
                ? "no budget limit"
                : `$${preferences.budgetPerPerson}/person`}{" "}
              / {preferences.maxDriveMinutes} min drive
            </p>
            {saveStatus && <p className="helper-text">{saveStatus}</p>}
            <button className="primary-btn" onClick={savePreferences}>
              Save and match me
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Cravings;
