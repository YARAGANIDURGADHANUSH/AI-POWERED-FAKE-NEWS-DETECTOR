import { useState, useEffect, useRef } from "react";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

const VERDICT_CONFIG = {
  REAL: { color: "#22c55e", emoji: "✅", label: "REAL" },
  TRUE: { color: "#22c55e", emoji: "✅", label: "REAL" },
  FAKE: { color: "#ef4444", emoji: "❌", label: "FAKE" },
  FALSE: { color: "#ef4444", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { color: "#f59e0b", emoji: "⚠️", label: "PARTIALLY TRUE" },
  UNCERTAIN: { color: "#6b7280", emoji: "❓", label: "UNCERTAIN" }
};

export default function App() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const resultRef = useRef(null);

  // =========================
  // VERIFY
  // =========================
  const checkFact = async () => {
    if (!claim.trim()) {
      setError("Enter a claim");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setResult(data);
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // =========================
  // LOAD LEADERBOARD
  // =========================
  useEffect(() => {
    fetch(`${BACKEND_URL}/geo-leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []));
  }, []);

  // =========================
  // SCROLL
  // =========================
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

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
          🧠 Fake News Detector
        </h1>
        <p style={{ color: "#9ca3af", marginBottom: "20px" }}>
          AI-powered verification with real-time web evidence
        </p>

        {/* INPUT */}
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter claim or news headline..."
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
            onClick={checkFact}
            disabled={loading}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "linear-gradient(90deg,#2563eb,#06b6d4)",
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            {loading ? "Analyzing..." : "🔍 Check Fact"}
          </button>

          {/* GEO PAGE NAV */}
          <button
            onClick={() => (window.location.href = "/geo")}
            style={{
              padding: "12px 20px",
              borderRadius: "10px",
              background: "linear-gradient(90deg,#7c3aed,#ec4899)",
              border: "none",
              color: "#fff",
              cursor: "pointer"
            }}
          >
            🌍 Regional Analysis
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div style={{
            marginTop: "15px",
            padding: "10px",
            background: "#7f1d1d",
            borderRadius: "8px"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div ref={resultRef} style={{
            marginTop: "25px",
            background: "#111827",
            padding: "25px",
            borderRadius: "16px"
          }}>

            {/* VERDICT */}
            <h2 style={{
              fontSize: "42px",
              color: vc.color,
              marginBottom: "10px"
            }}>
              {vc.emoji} {vc.label}
            </h2>

            <p style={{ color: "#9ca3af" }}>
              Confidence: {Math.round(result.confidence * 100)}%
            </p>

            {/* ANALYSIS */}
            <div style={{
              marginTop: "15px",
              padding: "15px",
              background: "#020617",
              borderRadius: "10px"
            }}>
              {result.explanation}
            </div>

            {/* SOURCES */}
            {result.sources?.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h3>Sources</h3>

                {result.sources.map((s, i) => (
                  <div key={i} style={{
                    background: "#020617",
                    padding: "12px",
                    borderRadius: "10px",
                    marginTop: "10px"
                  }}>
                    <a href={s.url} target="_blank" style={{ color: "#60a5fa" }}>
                      {s.url}
                    </a>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {Math.round(s.credibility)}% credibility
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD */}
        {leaderboard.length > 0 && (
          <div style={{
            marginTop: "30px",
            background: "#111827",
            padding: "20px",
            borderRadius: "16px"
          }}>
            <h2>🏆 Fake News Leaderboard</h2>

            {leaderboard.slice(0, 5).map((s, i) => (
              <div key={i} style={{
                marginTop: "10px",
                padding: "10px",
                background: "#020617",
                borderRadius: "8px"
              }}>
                #{i + 1} {s.state} — {Math.round(s.fake_index * 100)}%
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}