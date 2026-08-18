import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function localSavedKey(userId) {
  return `savedRestaurants:${userId}`;
}

function normalizeSavedRestaurant(restaurant, saveType) {
  const rest = { ...restaurant };
  delete rest.gallery;

  return stripUndefined({
    ...rest,
    saveType,
    savedAt: new Date().toISOString(),
  });
}

export function getLocalSavedRestaurants(userId) {
  if (!userId) return [];

  try {
    return JSON.parse(localStorage.getItem(localSavedKey(userId))) || [];
  } catch {
    return [];
  }
}

export function saveRestaurantLocally(userId, restaurant, saveType) {
  if (!userId || !restaurant?.id) return;

  const savedRestaurant = normalizeSavedRestaurant(restaurant, saveType);
  const savedRestaurants = getLocalSavedRestaurants(userId).filter(
    (item) => item.id !== restaurant.id
  );

  localStorage.setItem(
    localSavedKey(userId),
    JSON.stringify([savedRestaurant, ...savedRestaurants])
  );
}

export function removeRestaurantLocally(userId, restaurantId) {
  if (!userId || !restaurantId) return;

  const savedRestaurants = getLocalSavedRestaurants(userId).filter(
    (item) => item.id !== restaurantId
  );
  localStorage.setItem(localSavedKey(userId), JSON.stringify(savedRestaurants));
}

export function updateSavedRestaurantLocally(userId, restaurantId, updates) {
  if (!userId || !restaurantId) return;

  const savedRestaurants = getLocalSavedRestaurants(userId).map((restaurant) =>
    restaurant.id === restaurantId
      ? stripUndefined({
          ...restaurant,
          ...updates,
          updatedAt: new Date().toISOString(),
        })
      : restaurant
  );

  localStorage.setItem(localSavedKey(userId), JSON.stringify(savedRestaurants));
}

export async function getSavedRestaurants(userId) {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "users", userId, "saved"));
  return snapshot.docs.map((d) => d.data());
}

function stripUndefined(value) {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map(stripUndefined);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)])
    );
  }
  return value;
}

export async function saveRestaurant(userId, restaurant, saveType) {
  if (!db) {
    throw new Error("Firestore is not configured yet.");
  }

  if (!restaurant.id) {
    throw new Error("This restaurant is missing a Google place id.");
  }

  await setDoc(doc(db, "users", userId, "saved", restaurant.id), {
    ...normalizeSavedRestaurant(restaurant, saveType),
    saveType,
    savedAt: serverTimestamp(),
  });
}

export async function removeRestaurant(userId, restaurantId) {
  if (!db || !restaurantId) return;
  await deleteDoc(doc(db, "users", userId, "saved", restaurantId));
}

export async function updateSavedRestaurant(userId, restaurantId, updates) {
  if (!db || !restaurantId) return;

  await setDoc(
    doc(db, "users", userId, "saved", restaurantId),
    stripUndefined({
      ...updates,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
}

export async function getUserPreferences(userId) {
  if (!db) return null;
  const snap = await getDoc(doc(db, "users", userId, "preferences", "settings"));
  return snap.exists() ? snap.data() : null;
}

export async function saveUserPreferences(userId, preferences) {
  if (!db) return;
  await setDoc(doc(db, "users", userId, "preferences", "settings"), {
    ...preferences,
    userLocation: preferences.userLocation ?? null,
  });
}
