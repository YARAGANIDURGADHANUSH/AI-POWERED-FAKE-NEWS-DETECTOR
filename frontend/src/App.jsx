import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

const VERDICT = {
  REAL: { color: "#22c55e", emoji: "✅", label: "REAL" },
  FAKE: { color: "#ef4444", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { color: "#f59e0b", emoji: "⚠️", label: "PARTIALLY TRUE" },
  UNCERTAIN: { color: "#9ca3af", emoji: "❓", label: "UNCERTAIN" }
};

export default function App() {
  const navigate = useNavigate();

  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const resultRef = useRef(null);

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
        headers: {"Content-Type": "application/json"},
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

  useEffect(() => {
    fetch(`${BACKEND_URL}/geo-leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboard(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

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
            🧠 Fake News Detector
          </h1>

          <p style={{ color: "#94a3b8" }}>
            AI-powered fact-checking with real-time web evidence
          </p>
        </div>

        {/* INPUT CARD */}
        <div style={{
          background: "#020617",
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px"
        }}>
          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter claim or headline..."
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

          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              onClick={checkFact}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(90deg,#2563eb,#06b6d4)",
                color: "#fff",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              {loading ? "Analyzing..." : "🔍 Verify Claim"}
            </button>

            <button
              onClick={() => navigate("/geo")}
              style={{
                padding: "12px 20px",
                borderRadius: "12px",
                background: "linear-gradient(90deg,#7c3aed,#ec4899)",
                color: "#fff",
                border: "none"
              }}
            >
              🌍 Regional Analysis
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: "10px",
              padding: "10px",
              background: "#7f1d1d",
              borderRadius: "8px"
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* RESULT */}
        {result && (
          <div ref={resultRef} style={{
            background: "#020617",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "20px"
          }}>
            <h2 style={{
              fontSize: "42px",
              color: vc.color
            }}>
              {vc.emoji} {vc.label}
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

            {/* SOURCES */}
            {result.sources?.length > 0 && (
              <div style={{ marginTop: "15px" }}>
                <h3>Sources</h3>

                {result.sources.map((s, i) => (
                  <div key={i} style={{
                    marginTop: "8px",
                    padding: "12px",
                    background: "#020617",
                    borderRadius: "10px"
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

            {/* INSIGHT */}
            <div style={{
              marginTop: "15px",
              padding: "14px",
              background: "#1e293b",
              borderRadius: "12px"
            }}>
              🧠 Insight: This claim aligns with patterns seen in misinformation narratives.
            </div>
          </div>
        )}

        {/* LEADERBOARD */}
        {leaderboard.length > 0 && (
          <div style={{
            background: "#020617",
            padding: "20px",
            borderRadius: "16px"
          }}>
            <h2>🏆 Misinformation Leaderboard</h2>

            {leaderboard.slice(0, 5).map((s, i) => (
              <div key={i} style={{
                marginTop: "10px",
                padding: "10px",
                background: "#111827",
                borderRadius: "10px"
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