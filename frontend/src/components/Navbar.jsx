import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px",
      background: "#020617"
    }}>
      <h3 onClick={() => navigate("/")}>🧠 Fake News AI</h3>

      <div>
        <button onClick={() => navigate("/detector")}>Detector</button>
        <button onClick={() => navigate("/geo")}>Geo</button>
        <button onClick={() => navigate("/bookmarks")}>Saved</button>
        <button onClick={() => navigate("/profile")}>Profile</button>
      </div>
    </div>
  );
}