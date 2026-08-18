import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "../services/firebase";
import { getUserPreferences } from "../services/userDataService";
import { AuthContext } from "./authContextValue";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isFirebaseConfigured);
  const prevUid = useRef(null);

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsAuthLoading(false);

      // On fresh login, pull Firestore preferences into localStorage
      // so the quiz and map immediately reflect the user's saved settings.
      if (nextUser && nextUser.uid !== prevUid.current) {
        getUserPreferences(nextUser.uid)
          .then((prefs) => {
            if (prefs) {
              const current = JSON.parse(localStorage.getItem("matchPreferences")) || {};
              localStorage.setItem(
                "matchPreferences",
                JSON.stringify({ ...current, ...prefs })
              );
              if (Array.isArray(prefs.cravings)) {
                localStorage.setItem("cravings", JSON.stringify(prefs.cravings));
              }
            }
          })
          .catch(() => {});
      }

      prevUid.current = nextUser?.uid ?? null;
    });
  }, []);

  const value = useMemo(
    () => ({
      isAuthLoading,
      isFirebaseConfigured,
      user,
    }),
    [isAuthLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
