import { useState, useEffect, useRef } from "react";
import MapView from "./MapView";
import AppRouter from "./router/AppRouter";


const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

/* ================= STYLES ================= */
const styles = `
/* KEEP YOUR EXISTING FULL CSS HERE (unchanged) */
`;

/* ================= CONSTANTS ================= */
const VERDICT_CONFIG = {
  REAL: { cls: "real", emoji: "✅", label: "REAL" },
  TRUE: { cls: "real", emoji: "✅", label: "REAL" },
  FAKE: { cls: "fake", emoji: "❌", label: "FAKE" },
  FALSE: { cls: "fake", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { cls: "partial", emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING: { cls: "partial", emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
};

const EXAMPLES = [
  "Sun rises from the west",
  "PM of India is Narendra Modi",
  "COVID vaccines contain microchips",
  "Earth is flat",
  "Water boils at 100°C at sea level",
];

const LOADER_STEPS = [
  "Searching web sources...",
  "Extracting content...",
  "Computing similarity scores...",
  "Analyzing with LLM...",
  "Building verdict...",
];

/* ================= COMPONENT ================= */
export default function App() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [geoResult, setGeoResult] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [trendData, setTrendData] = useState({});

  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);

  const resultRef = useRef(null);

  const scrollToResults = () => {
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const parseJson = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  /* ================= LOADER ================= */
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADER_STEPS.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [loading]);

  /* ================= VERIFY ================= */
  const checkFact = async () => {
    if (!claim.trim()) {
      setError("Please enter a claim.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim }),
      });

      const data = await parseJson(res);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      scrollToResults();
    }
  };

  /* ================= GEO ================= */
  const handleRegionSelect = async (region) => {
    if (!claim.trim()) return;

    setLoading(true);
    setError("");
    setGeoResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/geo-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          news: claim,
          country: "india",
          region,
        }),
      });

      const data = await parseJson(res);
      setGeoResult(data);

      /* Safe trends */
      try {
        const t = await fetch(`${BACKEND_URL}/geo-trends/${region}`);
        const trend = await parseJson(t);
        setTrendData(trend);
      } catch {
        setTrendData({});
      }

    } catch (err) {
      setError("Geo analysis failed");
    } finally {
      setLoading(false);
      scrollToResults();
    }
  };

  /* ================= LEADERBOARD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/geo-leaderboard`);
        const data = await parseJson(res);
        setLeaderboard(data || []);
      } catch {
        setLeaderboard([]);
      }
    };
    load();
  }, []);

  /* ================= UI ================= */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="app">
        <header className="header">
          <h1>🧠 Fake News Detector</h1>
          <p>AI-powered fact-checking with regional insights</p>
        </header>

        <div className="main-card">

          {/* INPUT */}
          <div className="input-section">
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Enter claim..."
              maxLength={500}
            />
          </div>

          {/* BUTTON */}
          <button className="check-btn" onClick={checkFact} disabled={loading}>
            {loading ? "Analyzing..." : "🔍 Check Fact"}
          </button>

          {/* MAP BUTTON */}
          <button
            className="check-btn"
            onClick={() => setShowMap(!showMap)}
          >
            🌍 {showMap ? "Hide Map" : "News of My Location"}
          </button>

          {/* MAP */}
          {showMap && (
            <div style={{ marginTop: 20 }}>
              <MapView onRegionSelect={handleRegionSelect} />
            </div>
          )}

          {/* LOADER */}
          {loading && (
            <div>
              {LOADER_STEPS.map((step, i) => (
                <div key={i}>
                  {i < stepIndex ? "✓ " : ""}{step}
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}
          {error && <div style={{ color: "red" }}>{error}</div>}

          {/* RESULT */}
          {result && (
            <div ref={resultRef}>
              <h2>{result.label}</h2>
              <p>{Math.round(result.confidence * 100)}%</p>
              <p>{result.explanation}</p>

              {result.sources?.map((s, i) => (
                <div key={i}>
                  <a href={s.url} target="_blank">{s.url}</a>
                </div>
              ))}
            </div>
          )}

          {/* GEO RESULT */}
          {geoResult && (
            <div>
              <h2>🌍 {geoResult.label}</h2>
              <p>{geoResult.explanation}</p>
            </div>
          )}

          {/* EXAMPLES */}
          {!result && (
            <div>
              {EXAMPLES.map((e, i) => (
                <button key={i} onClick={() => setClaim(e)}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LEADERBOARD */}
        {leaderboard.length > 0 && (
          <div>
            <h3>Leaderboard</h3>
            {leaderboard.map((l, i) => (
              <div key={i}>{l.state} - {Math.round(l.fake_index * 100)}%</div>
            ))}
          </div>
        )}

        {/* TRENDS */}
        {Object.keys(trendData).length > 0 && (
          <div>
            <h3>Trends</h3>
            {Object.entries(trendData).map(([d, v]) => (
              <div key={d}>{d}: Fake {v.fake}</div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}