import { useState } from "react";

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Segoe UI", sans-serif;
    background: linear-gradient(135deg, #1a1f2b, #3a3f7a);
    color: white;
    min-height: 100vh;
  }

  .app {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 40px 20px;
  }

  .container {
    width: 600px;
    max-width: 100%;
    background: rgba(255, 255, 255, 0.05);
    padding: 30px;
    border-radius: 20px;
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .container h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 26px;
    font-weight: 700;
  }

  .container textarea {
    width: 100%;
    height: 120px;
    border-radius: 12px;
    border: none;
    padding: 12px;
    font-size: 16px;
    margin-bottom: 15px;
    resize: none;
    background: rgba(255, 255, 255, 0.9);
    color: #111;
    font-family: "Segoe UI", sans-serif;
    outline: none;
    display: block;
  }

  .container textarea::placeholder { color: #888; }

  .container button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(90deg, #00c6ff, #0072ff);
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    font-family: "Segoe UI", sans-serif;
  }

  .container button:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .container button:disabled { opacity: 0.5; cursor: not-allowed; }

  .loader { text-align: center; margin-top: 15px; color: #ccc; font-size: 14px; }

  .error-msg {
    margin-top: 15px;
    color: #ff6b6b;
    text-align: center;
    font-size: 14px;
    background: rgba(255,100,100,0.1);
    padding: 10px;
    border-radius: 8px;
  }

  .result-box {
    margin-top: 20px;
    padding: 20px;
    border-radius: 15px;
    background: rgba(255, 255, 255, 0.07);
    animation: fadeIn 0.4s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .result-box h2 { font-size: 28px; font-weight: 700; margin-bottom: 0; }

  .confidence { margin-top: 10px; font-weight: bold; color: #aef; font-size: 14px; }
  .explanation { margin-top: 10px; color: #ddd; line-height: 1.6; font-size: 15px; }

  .differences {
    margin-top: 14px;
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255, 160, 0, 0.08);
    border-left: 3px solid #ff9800;
  }

  .differences-title {
    font-size: 12px;
    font-weight: 700;
    color: #ff9800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 6px;
  }

  .diff-item { font-size: 13px; color: #ffd580; margin-bottom: 4px; }

  .sources { margin-top: 15px; }

  .sources-title {
    font-size: 13px;
    font-weight: 700;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 10px;
  }

  .source-card {
    background: rgba(255, 255, 255, 0.08);
    padding: 10px 14px;
    border-radius: 10px;
    margin-bottom: 10px;
    transition: background 0.2s, transform 0.2s;
  }

  .source-card:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }

  .source-card a {
    color: #4fc3f7;
    text-decoration: none;
    font-size: 13px;
    word-break: break-all;
    display: block;
  }

  .source-card a:hover { text-decoration: underline; }
  .cred { font-size: 12px; margin-top: 5px; color: #bbb; }
`;

// ✅ All possible labels from backend covered
const VERDICT_STYLE = {
  TRUE:           { color: "#4caf50", emoji: "✅" },
  REAL:           { color: "#4caf50", emoji: "✅" },
  FALSE:          { color: "#f44336", emoji: "❌" },
  FAKE:           { color: "#f44336", emoji: "❌" },
  "PARTIALLY TRUE": { color: "#ff9800", emoji: "⚠️" },
  MISLEADING:     { color: "#ff9800", emoji: "⚠️" },
  UNCERTAIN:      { color: "#9e9e9e", emoji: "❓" },
  UNVERIFIABLE:   { color: "#9e9e9e", emoji: "❓" },
};

export default function FactChecker() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const checkFact = async () => {
    if (!claim.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim }),
      });

      const data = await response.json();
      console.log("BACKEND RESPONSE:", data);

      const mapped = {
        verdict: data.label,
        confidence: Math.round(data.confidence * 100) + "%",   // ✅ 0.9 → "90%"
        explanation: data.explanation,
        differences: data.differences || [],
        sources: (data.sources || []).map((s) => ({
          title: s.url,
          url: s.url,
          credibility: Math.round(s.credibility) + "%",         // ✅ 46.94 → "47%" (no ×100)
        })),
      };

      setResult(mapped);
    } catch (err) {
      console.error(err);
      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  const verdictKey = result?.verdict?.toUpperCase();
  const verdictStyle = VERDICT_STYLE[verdictKey] || VERDICT_STYLE[result?.verdict] || { color: "#fff", emoji: "🔍" };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="container">
          <h1>🔍 Fact Checker</h1>

          <textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Enter a news headline or claim to fact-check…"
          />

          <button onClick={checkFact} disabled={loading || !claim.trim()}>
            {loading ? "Checking…" : "Check Fact"}
          </button>

          {loading && <div className="loader">Analyzing claim… this may take a few seconds</div>}
          {error && <div className="error-msg">{error}</div>}

          {result && (
            <div className="result-box">
              <h2 style={{ color: verdictStyle.color }}>
                {verdictStyle.emoji} {result.verdict}
              </h2>

              <div className="confidence">Confidence: {result.confidence}</div>
              <div className="explanation">{result.explanation}</div>

              {/* ✅ Show contradictions if any */}
              {result.differences?.length > 0 && (
                <div className="differences">
                  <div className="differences-title">⚠️ Contradictions Found</div>
                  {result.differences.map((d, i) => (
                    <div key={i} className="diff-item">• {d}</div>
                  ))}
                </div>
              )}

              {result.sources?.length > 0 && (
                <div className="sources">
                  <div className="sources-title">Sources</div>
                  {result.sources.map((s, i) => (
                    <div key={i} className="source-card">
                      <a href={s.url} target="_blank" rel="noopener noreferrer">
                        {s.title}
                      </a>
                      <div className="cred">Credibility: {s.credibility}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}