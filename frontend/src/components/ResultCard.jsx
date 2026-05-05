const VERDICT_STYLE = {
  TRUE:             { color: "#4caf50", emoji: "✅", label: "TRUE" },
  REAL:             { color: "#4caf50", emoji: "✅", label: "REAL" },
  FALSE:            { color: "#f44336", emoji: "❌", label: "FALSE" },
  FAKE:             { color: "#f44336", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { color: "#ff9800", emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING:       { color: "#ff9800", emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN:        { color: "#9e9e9e", emoji: "❓", label: "UNCERTAIN" },
  UNVERIFIABLE:     { color: "#9e9e9e", emoji: "❓", label: "UNVERIFIABLE" },
};

export default function ResultCard({ result }) {
  if (!result) return null;

  // Determine the styling based on the verdict label
  const verdictKey = result.label?.toUpperCase() || result.verdict?.toUpperCase();
  const style = VERDICT_STYLE[verdictKey] || { color: "#fff", emoji: "🔍", label: result.label || "UNKNOWN" };
  
  // Format Confidence
  const confidenceStr = result.confidence 
    ? `${Math.round(result.confidence * 100)}%` 
    : "N/A";

  // Safely extract differences/contradictions
  const differences = result.differences || result.contradictions || [];

  return (
    <div className="result-box">
      
      {/* Verdict Header */}
      <h2 className="verdict-header" style={{ color: style.color }}>
        {style.emoji} {style.label}
      </h2>
      
      <div className="confidence">Confidence: {confidenceStr}</div>
      <div className="explanation">{result.explanation || "No explanation available"}</div>

      {/* Contradictions / Differences */}
      {differences.length > 0 && (
        <div className="differences">
          <div className="differences-title">⚠️ Contradictions Found</div>
          {differences.map((diff, index) => (
            <div key={index} className="diff-item">• {diff}</div>
          ))}
        </div>
      )}

      {/* Sources Map */}
      {result.sources?.length > 0 && (
        <div className="sources">
          <div className="sources-title">Sources</div>
          {result.sources.map((source, index) => {
            const cred = source.credibility ?? (source.score ? source.score * 100 : null);
            const credStr = cred ? `${Math.round(cred)}%` : "N/A";
            
            return (
              <div key={index} className="source-card">
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title || source.url}
                </a>
                <div className="cred">🛡️ Credibility: {credStr}</div>
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
