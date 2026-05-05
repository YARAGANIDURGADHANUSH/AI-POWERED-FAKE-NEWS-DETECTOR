import { useNavigate, useLocation } from "react-router-dom";

const LINKS = [
  { path: "/",          label: "Home",     icon: "🏠" },
  { path: "/detector",  label: "Detector", icon: "🧠" },
  { path: "/geo",       label: "Geo",      icon: "🌍" },
  { path: "/bookmarks", label: "Saved",    icon: "⭐" },
  { path: "/profile",   label: "Profile",  icon: "👤" },
];

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        <div className="navbar-brand-dot" />
        🧠 FakeNews AI
      </div>

      <div className="navbar-links">
        {LINKS.map(({ path, label, icon }) => (
          <button
            key={path}
            className={`nav-link ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}