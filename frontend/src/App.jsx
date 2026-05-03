import { useState } from "react";

const BACKEND_URL = "https://ai-powered-fake-news-detector.onrender.com/verify"; // ✅ FIXED

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
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ news: claim }),
      });

      // ✅ HANDLE BAD RESPONSES
      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();
      console.log("BACKEND RESPONSE:", data);

      // ✅ SAFE MAPPING
      const mapped = {
        verdict: data.label || "UNCERTAIN",
        confidence: data.confidence
          ? Math.round(data.confidence * 100) + "%"
          : "N/A",
        explanation: data.explanation || "No explanation available",
        differences: data.differences || [],
        sources: (data.sources || []).map((s) => ({
          title: s.url,
          url: s.url,
          credibility: s.credibility
            ? Math.round(s.credibility) + "%"
            : "N/A",
        })),
      };

      setResult(mapped);
    } catch (err) {
      console.error("ERROR:", err);

      // ✅ BETTER ERROR MESSAGE
      if (err.message.includes("Failed to fetch")) {
        setError("Cannot connect to backend (check deployment / URL)");
      } else {
        setError("Backend error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🔍 Fact Checker</h1>

      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Enter a news claim..."
        style={{ width: "100%", height: 100 }}
      />

      <br /><br />

      <button onClick={checkFact} disabled={loading}>
        {loading ? "Checking..." : "Check Fact"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>{result.verdict}</h2>
          <p><b>Confidence:</b> {result.confidence}</p>
          <p>{result.explanation}</p>

          {result.differences.length > 0 && (
            <>
              <h4>⚠️ Contradictions</h4>
              {result.differences.map((d, i) => (
                <p key={i}>• {d}</p>
              ))}
            </>
          )}

          <h4>Sources</h4>
          {result.sources.map((s, i) => (
            <div key={i}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
              <p>Credibility: {s.credibility}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
