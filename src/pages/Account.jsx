import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/useAuth";
import {
  createAccountWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
} from "../services/firebase";
import { loadGoogleMaps } from "../services/googleMaps";
import {
  loadMatchPreferences,
  saveMatchPreferences,
} from "../services/matchPreferences";
import {
  getUserPreferences,
  saveUserPreferences,
} from "../services/userDataService";
import {
  isInsideUcfArea,
  maxTravelOptions,
  travelModeOptions,
  UCF_CENTER,
  UCF_DEFAULT_LOCATION,
} from "../services/ucfArea";

function getAuthErrorMessage(error) {
  const messages = {
    "auth/email-already-in-use": "That email already has an account.",
    "auth/invalid-credential": "That email or password does not look right.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/missing-password": "Enter your password.",
    "auth/operation-not-allowed":
      "Enable Email/Password sign-in in Firebase Authentication first.",
    "auth/weak-password": "Use at least 6 characters for your password.",
  };

  return messages[error.code] || error.message || "Something went wrong.";
}

function normalizeStartingAddress(address) {
  return address
    .trim()
    .replace(/\brockedge\b/gi, "Rockledge");
}

function getPointFromLocation(location) {
  return {
    lat: location.lat(),
    lng: location.lng(),
  };
}

function geocodeAddressQuery(geocoder, address) {
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) {
        reject(new Error("Could not find that starting address."));
        return;
      }

      resolve({
        formattedAddress: results[0].formatted_address || address,
        userLocation: getPointFromLocation(results[0].geometry.location),
      });
    });
  });
}

async function searchAddressWithPlaces(address) {
  if (!window.google.maps.importLibrary) {
    throw new Error("Could not find that starting address.");
  }

  const { Place } = await window.google.maps.importLibrary("places");

  if (!Place.searchByText) {
    throw new Error("Could not find that starting address.");
  }

  const { places } = await Place.searchByText({
    fields: ["formattedAddress", "location"],
    maxResultCount: 1,
    textQuery: address,
  });
  const place = places?.[0];

  if (!place?.location) {
    throw new Error("Could not find that starting address.");
  }

  return {
    formattedAddress: place.formattedAddress || address,
    userLocation: getPointFromLocation(place.location),
  };
}

async function geocodeAddress(address) {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    return {
      formattedAddress: "",
      userLocation: null,
    };
  }

  await loadGoogleMaps();

  const normalizedAddress = normalizeStartingAddress(trimmedAddress);
  const queries = Array.from(
    new Set([
      trimmedAddress,
      normalizedAddress,
      `${normalizedAddress}, USA`,
    ])
  );
  const geocoder = new window.google.maps.Geocoder();

  for (const query of queries) {
    try {
      return await geocodeAddressQuery(geocoder, query);
    } catch {
      // Try the next address form before giving up.
    }
  }

  return searchAddressWithPlaces(normalizedAddress);
}

function Account() {
  const { isFirebaseConfigured, user } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferences, setPreferences] = useState(loadMatchPreferences);
  const [savedPreferences, setSavedPreferences] = useState(loadMatchPreferences);
  const [profileStatus, setProfileStatus] = useState("");

  useEffect(() => {
    if (!user) return;

    getUserPreferences(user.uid)
      .then((cloudPreferences) => {
        const nextPreferences = {
          ...loadMatchPreferences(),
          ...cloudPreferences,
        };
        setPreferences(nextPreferences);
        setSavedPreferences(nextPreferences);
      })
      .catch(() => {});
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        await createAccountWithEmail(form);
      } else {
        await signInWithEmail(form);
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function updatePreference(field, value) {
    setPreferences((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateTravelMode(nextMode) {
    setPreferences((current) => ({
      ...current,
      travelMode: nextMode,
      maxDriveMinutes: nextMode === "walking" ? 15 : 15,
    }));
  }

  async function handleSavePreferences(event) {
    event.preventDefault();
    setProfileStatus("Saving preferences...");

    try {
      const { formattedAddress, userLocation } = await geocodeAddress(
        preferences.startAddress
      );
      const isUcfStart = !userLocation || isInsideUcfArea(userLocation);
      const nextPreferences = {
        ...preferences,
        startAddress: isUcfStart ? formattedAddress : UCF_DEFAULT_LOCATION,
        userLocation: isUcfStart ? userLocation : UCF_CENTER,
      };

      saveMatchPreferences(nextPreferences);
      setPreferences(nextPreferences);
      setSavedPreferences(nextPreferences);

      if (user) {
        saveUserPreferences(user.uid, nextPreferences).catch(() => {});
      }

      setProfileStatus(
        isUcfStart
          ? "Preferences saved. Travel estimates will update on Discover."
          : "That start point is outside the UCF area, so campus was saved instead."
      );
    } catch (saveError) {
      setProfileStatus(saveError.message);
    }
  }

  function handleCancelPreferences() {
    setPreferences(savedPreferences);
    setProfileStatus("Changes cancelled.");
  }

  return (
    <div>
      <Navbar />

      <main className="dashboard account-page">
        <p className="eyebrow">Account</p>
        <h1>Your FoodFinder account</h1>

        {!isFirebaseConfigured ? (
          <section className="account-card">
            <h2>Login needs Firebase config</h2>
            <p>
              Add your Firebase web app values to the local .env file, then
              restart the Vite dev server.
            </p>
          </section>
        ) : user ? (
          <section className="account-card">
            <div className="account-profile">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Account"} />
              ) : (
                <span>{user.displayName?.[0] || user.email?.[0] || "U"}</span>
              )}
              <div>
                <h2>{user.displayName || "Signed in"}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <form className="profile-preferences" onSubmit={handleSavePreferences}>
              <h3>Preferences</h3>

              <label>
                Where do you want to eat?
                <input
                  onChange={(event) =>
                    updatePreference("searchLocation", event.target.value)
                  }
                  placeholder="UCF, Knights Plaza, Waterford Lakes, or 32816"
                  value={preferences.searchLocation}
                />
              </label>

              <label>
                Where are you starting from?
                <input
                  onChange={(event) =>
                    updatePreference("startAddress", event.target.value)
                  }
                  placeholder="Dorm, apartment, class, work, or a full address"
                  value={preferences.startAddress}
                />
              </label>

              <label>
                Travel mode
                <select
                  onChange={(event) => updateTravelMode(event.target.value)}
                  value={preferences.travelMode}
                >
                  {travelModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Travel time preference
                <select
                  onChange={(event) =>
                    updatePreference("maxDriveMinutes", Number(event.target.value))
                  }
                  value={preferences.maxDriveMinutes}
                >
                  {maxTravelOptions[preferences.travelMode].map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Budget per person
                <select
                  onChange={(event) =>
                    updatePreference("budgetPerPerson", Number(event.target.value))
                  }
                  value={preferences.budgetPerPerson}
                >
                  <option value={15}>Under $15</option>
                  <option value={40}>$15-$32 ish</option>
                  <option value={70}>$32+</option>
                  <option value={999}>No limit</option>
                </select>
              </label>

              <label className="toggle-row profile-toggle">
                <input
                  checked={preferences.openNowOnly}
                  onChange={(event) =>
                    updatePreference("openNowOnly", event.target.checked)
                  }
                  type="checkbox"
                />
                Open now only
              </label>

              {profileStatus && <p className="helper-text">{profileStatus}</p>}

              <div className="profile-action-row">
                <button className="secondary-btn" type="button" onClick={handleCancelPreferences}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Save
                </button>
              </div>
            </form>

            <button className="secondary-btn logout-btn" onClick={signOutUser}>
              Sign out
            </button>
          </section>
        ) : (
          <section className="account-card">
            <div className="auth-tabs" aria-label="Account mode">
              <button
                className={mode === "login" ? "active" : ""}
                onClick={() => setMode("login")}
                type="button"
              >
                Log in
              </button>
              <button
                className={mode === "signup" ? "active" : ""}
                onClick={() => setMode("signup")}
                type="button"
              >
                Create account
              </button>
            </div>

            <h2>{mode === "signup" ? "Create your account" : "Log in"}</h2>
            <p>
              Save spots and preferences to your FoodFinder account instead of
              only this browser.
            </p>

            <form className="account-form" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <label>
                  Name
                  <input
                    autoComplete="name"
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Your name"
                    value={form.name}
                  />
                </label>
              )}

              <label>
                Email
                <input
                  autoComplete="email"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={form.email}
                />
              </label>

              <label>
                Password
                <input
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={6}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="At least 6 characters"
                  required
                  type="password"
                  value={form.password}
                />
              </label>

              {error && <p className="account-error">{error}</p>}

              <button className="primary-btn" disabled={isSubmitting} type="submit">
                {mode === "signup" ? "Create account" : "Log in"}
              </button>
            </form>

            <div className="auth-divider">or</div>

            <button
              className="secondary-btn"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Account;
