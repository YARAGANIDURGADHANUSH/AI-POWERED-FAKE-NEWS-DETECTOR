import { useState, useEffect, useRef } from "react";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

const VERDICT_CONFIG = {
  REAL: { cls: "real", emoji: "✅", label: "REAL" },
  FAKE: { cls: "fake", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { cls: "partial", emoji: "⚠️", label: "PARTIALLY TRUE" },
  UNCERTAIN: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
  OPINION: { cls: "partial", emoji: "💭", label: "OPINION" }
};

export default function App() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [geoResult, setGeoResult] = useState(null);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const resultRef = useRef(null);

  // =========================
  // NORMAL FACT CHECK
  // =========================
  const checkFact = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setGeoResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ news: claim })
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      setError("Failed to verify claim");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GEO FACT CHECK
  // =========================
  const handleRegionSelect = async (region) => {
    if (!claim.trim()) return;

    setLoading(true);
    setGeoResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/geo-verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          news: claim,
          country: "india",
          region: region
        })
      });

      const data = await res.json();
      setGeoResult(data);
    } catch (err) {
      setError("Geo verification failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SCROLL
  // =========================
  useEffect(() => {
    if ((result || geoResult) && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result, geoResult]);

  const verdictKey = result?.label?.toUpperCase();
  const vc = VERDICT_CONFIG[verdictKey] || VERDICT_CONFIG.UNCERTAIN;

  const conf = result?.confidence
    ? Math.round(result.confidence * 100)
    : 0;

  return (
    <div className="app">

      <div className="container">

        <h1>🧠 Fake News Detector</h1>

        {/* INPUT */}
        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter claim..."
          maxLength={500}
        />

        {/* BUTTON */}
        <button onClick={checkFact} disabled={loading}>
          {loading ? "Analyzing..." : "🔍 Check Fact"}
        </button>

        {/* GEO BUTTON */}
        <button
          onClick={() => setShowMap(!showMap)}
          style={{
            marginTop: "10px",
            background: "linear-gradient(90deg,#7c3aed,#00c8ff)"
          }}
        >
          🌍 News of My Location
        </button>

        {/* MAP */}
        {showMap && (
          <div style={{ marginTop: "20px" }}>
            <MapView onRegionSelect={handleRegionSelect} />
          </div>
        )}

        {/* ERROR */}
        {error && <div className="error-msg">{error}</div>}

        {/* RESULT */}
        {result && (
          <div className="result-box" ref={resultRef}>

            <h2>{vc.emoji} {vc.label}</h2>

            <p><strong>Confidence:</strong> {conf}%</p>

            <p>{result.explanation}</p>

            {/* SOURCES */}
            <div className="sources-title">Sources</div>

            {result.sources?.map((s, i) => (
              <div key={i} className="source-card">
                <a href={s.url} target="_blank">{s.url}</a>
                <div className="cred">{s.credibility}% credibility</div>
              </div>
            ))}
          </div>
        )}

        {/* GEO RESULT */}
        {geoResult && (
          <div className="result-box">

            <h2>🌍 Regional Analysis</h2>

            <p><strong>Verdict:</strong> {geoResult.label}</p>
            <p><strong>Confidence:</strong> {Math.round(geoResult.confidence * 100)}%</p>

            <p>{geoResult.explanation}</p>

            <div className="sources-title">Regional Sources</div>

            {geoResult.regional_view?.map((r, i) => (
              <div key={i} className="source-card">
                <strong>{r.name}</strong> ({r.bias})
                <div style={{ fontSize: "12px", color: "#aaa" }}>
                  {r.note}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}