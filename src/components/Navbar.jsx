import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { signOutUser } from "../services/firebase";

function Navbar() {
  const { isAuthLoading, isFirebaseConfigured, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">FoodFinder</Link>
      </div>

      <div className="nav-links">
        <Link to="/discover">Discover</Link>
        <Link to="/search">Search</Link>
        <Link to="/saved">Saved Spots</Link>
      </div>

      <div className="auth-actions">
        {!isFirebaseConfigured ? (
          <Link className="auth-link" to="/account">
            Set up login
          </Link>
        ) : user ? (
          <div className="account-menu">
            <button className="profile-circle" type="button">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "Account"} />
              ) : (
                user.displayName?.[0] || user.email?.[0] || "U"
              )}
            </button>
            <div className="account-menu-panel">
              <Link to="/account">Profile</Link>
              <button onClick={signOutUser} type="button">
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <Link
            className={`auth-link${isAuthLoading ? " is-disabled" : ""}`}
            to="/account"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
