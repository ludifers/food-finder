import "./App.css";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SwipePage from "./pages/SwipePage";
import SavedSpots from "./pages/SavedSpots";
import SavedSpotDetail from "./pages/SavedSpotDetail";
import Cravings from "./pages/Cravings";
import Account from "./pages/Account";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/discover" element={<SwipePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/saved" element={<SavedSpots />} />
      <Route path="/saved/:restaurantId" element={<SavedSpotDetail />} />
      <Route path="/cravings" element={<Cravings />} />
      <Route path="/account" element={<Account />} />
    </Routes>
  );
}

export default App;
