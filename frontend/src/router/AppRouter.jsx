import { Routes, Route } from "react-router-dom";

// Import all your pages
import Home from "../pages/Home";
import Detector from "../pages/Detector";
import Geo from "../pages/Geo";
import Bookmarks from "../pages/Bookmarks";
import Profile from "../pages/Profile";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";

export default function AppRouter() {
  return (
    <Routes>
      {/* The Launchpad */}
      <Route path="/" element={<Home />} />
      
      {/* The Two Decoupled AI Engines */}
      <Route path="/detector" element={<Detector />} />
      <Route path="/geo" element={<Geo />} />
      
      {/* User Management & History */}
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/profile" element={<Profile />} />
      
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
