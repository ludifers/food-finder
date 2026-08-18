import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { enableNetwork, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
if (db) enableNetwork(db).catch(() => {});
const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured yet."));
  }

  return signInWithPopup(auth, googleProvider);
}

export function createAccountWithEmail({ email, name, password }) {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured yet."));
  }

  return createUserWithEmailAndPassword(auth, email, password).then(
    async (credential) => {
      if (name.trim()) {
        await updateProfile(credential.user, {
          displayName: name.trim(),
        });
      }

      return credential;
    }
  );
}

export function signInWithEmail({ email, password }) {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured yet."));
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export function sendResetPasswordEmail(email) {
  if (!auth) {
    return Promise.reject(new Error("Firebase is not configured yet."));
  }

  return sendPasswordResetEmail(auth, email);
}

export function signOutUser() {
  if (!auth) {
    return Promise.resolve();
  }

  return signOut(auth);
}
