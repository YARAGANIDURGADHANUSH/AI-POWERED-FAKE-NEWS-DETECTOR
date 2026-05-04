import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

const VERDICT = {
  REAL: { color: "#22c55e", emoji: "✅" },
  FAKE: { color: "#ef4444", emoji: "❌" },
  "PARTIALLY TRUE": { color: "#f59e0b", emoji: "⚠️" },
  UNCERTAIN: { color: "#9ca3af", emoji: "❓" }
};

export default function GeoPage() {
  const navigate = useNavigate();

  const [claim, setClaim] = useState("");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const verifyGeo = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/geo-verify`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          news: claim,
          country: "india",
          region
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const vc = VERDICT[result?.label] || {};

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top, #020617, #020617 40%, #0f172a)",
      padding: "40px",
      color: "#fff",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        maxWidth: "1150px",
        margin: "auto",
        padding: "30px",
        borderRadius: "24px",
        backdropFilter: "blur(20px)",
        background: "rgba(2,6,23,0.8)",
        boxShadow: "0 25px 70px rgba(0,0,0,0.6)"
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: "25px" }}>
          <h1 style={{
            fontSize: "38px",
            background: "linear-gradient(90deg,#60a5fa,#c084fc)",
            WebkitBackgroundClip: "text",
            color: "transparent"
          }}>
            🌍 Regional Intelligence
          </h1>

          <p style={{ color: "#94a3b8" }}>
            Analyze misinformation trends across regions with AI
          </p>
        </div>

        {/* INPUT CARD */}
        <div style={{
          background: "#020617",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px"
        }}>

          {/* DROPDOWN */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "10px",
              background: "#111827",
              color: "#fff",
              border: "1px solid #1f2937",
              marginBottom: "10px"
            }}
          >
            <option>Andhra Pradesh</option>
            <option>Telangana</option>
            <option>Tamil Nadu</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
          </select>

          {/* TEXTAREA */}
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter local claim..."
            style={{
              width: "100%",
              height: "110px",
              padding: "14px",
              borderRadius: "12px",
              background: "#111827",
              color: "#fff",
              border: "1px solid #1f2937"
            }}
          />

          {/* BUTTONS */}
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              onClick={verifyGeo}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {loading ? "Analyzing..." : "Verify Claim"}
            </button>

            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "#1f2937",
                color: "#fff",
                border: "none"
              }}
            >
              ⬅ Back
            </button>
          </div>
        </div>

        {/* HEATMAP */}
        <div style={{
          background: "#020617",
          padding: "20px",
          borderRadius: "16px"
        }}>
          <h3 style={{ marginBottom: "10px" }}>📊 Misinformation Heatmap</h3>

          {/* LEGEND */}
          <div style={{
            display: "flex",
            gap: "20px",
            marginBottom: "10px",
            fontSize: "13px"
          }}>
            <span style={{ color: "yellow" }}>● 30–40%</span>
            <span style={{ color: "orange" }}>● 60–70%</span>
            <span style={{ color: "red" }}>● 80–90%</span>
          </div>

          <MapView />
        </div>

        {/* RESULT */}
        {result && (
          <div style={{
            marginTop: "20px",
            background: "#020617",
            padding: "20px",
            borderRadius: "16px"
          }}>
            <h2 style={{
              fontSize: "36px",
              color: vc.color
            }}>
              {vc.emoji} {result.label}
            </h2>

            <p style={{ color: "#94a3b8" }}>
              Confidence: {Math.round(result.confidence * 100)}%
            </p>

            <div style={{
              marginTop: "12px",
              padding: "14px",
              background: "#111827",
              borderRadius: "12px"
            }}>
              {result.explanation}
            </div>

            {/* INSIGHT PANEL */}
            <div style={{
              marginTop: "15px",
              padding: "14px",
              background: "#1e293b",
              borderRadius: "12px"
            }}>
              🧠 Insight: This claim shows patterns of misinformation common in regional narratives.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}