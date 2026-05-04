import { useState } from "react";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

const VERDICT_CONFIG = {
  REAL: { color: "#22c55e", emoji: "✅", label: "REAL" },
  FAKE: { color: "#ef4444", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { color: "#f59e0b", emoji: "⚠️", label: "PARTIALLY TRUE" },
  UNCERTAIN: { color: "#6b7280", emoji: "❓", label: "UNCERTAIN" }
};

export default function GeoPage() {
  const [claim, setClaim] = useState("");
  const [country, setCountry] = useState("india");
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          news: claim,
          country,
          region
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const vc = VERDICT_CONFIG[result?.label] || {};

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #020617, #0f172a)",
      padding: "40px",
      color: "#fff"
    }}>
      <div style={{
        maxWidth: "1100px",
        margin: "auto",
        background: "#020617",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
      }}>

        {/* HEADER */}
        <h1 style={{ fontSize: "34px", marginBottom: "10px" }}>
          🌍 Regional News Intelligence
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
          Analyze misinformation patterns across regions
        </p>

        {/* DROPDOWNS */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginBottom: "15px"
        }}>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#111827",
              color: "#fff"
            }}
          >
            <option value="india">India</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "8px",
              background: "#111827",
              color: "#fff"
            }}
          >
            <option>Andhra Pradesh</option>
            <option>Telangana</option>
            <option>Tamil Nadu</option>
            <option>Karnataka</option>
            <option>Maharashtra</option>
          </select>
        </div>

        {/* INPUT */}
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter local claim..."
          style={{
            width: "100%",
            height: "120px",
            padding: "15px",
            borderRadius: "12px",
            background: "#111827",
            color: "#fff",
            border: "1px solid #1f2937",
            marginBottom: "15px"
          }}
        />

        {/* BUTTONS */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={verifyGeo}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "linear-gradient(90deg,#7c3aed,#ec4899)",
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            {loading ? "Analyzing..." : "Verify Regional Claim"}
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "#374151",
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            ⬅ Back
          </button>
        </div>

        {/* HEATMAP */}
        <div style={{ marginTop: "25px" }}>
          <MapView />
        </div>

        {/* RESULT */}
        {result && (
          <div style={{
            marginTop: "25px",
            background: "#111827",
            padding: "25px",
            borderRadius: "16px"
          }}>
            <h2 style={{
              fontSize: "40px",
              color: vc.color
            }}>
              {vc.emoji} {vc.label}
            </h2>

            <p style={{ color: "#9ca3af" }}>
              Confidence: {Math.round(result.confidence * 100)}%
            </p>

            <div style={{
              marginTop: "15px",
              padding: "15px",
              background: "#020617",
              borderRadius: "10px"
            }}>
              {result.explanation}
            </div>

            {/* REGIONAL SOURCES */}
            {result.regional_view?.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>Regional Sources</h3>

                {result.regional_view.map((r, i) => (
                  <div key={i} style={{
                    background: "#020617",
                    padding: "12px",
                    borderRadius: "10px",
                    marginTop: "10px"
                  }}>
                    <strong>{r.name}</strong> ({r.bias})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}