const VERDICT_CONFIG = {
  REAL:            { cls: "real",     emoji: "✅", label: "REAL" },
  TRUE:            { cls: "real",     emoji: "✅", label: "REAL" },
  FAKE:            { cls: "fake",     emoji: "❌", label: "FAKE" },
  FALSE:           { cls: "fake",     emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE":{ cls: "partial",  emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING:      { cls: "partial",  emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN:       { cls: "uncertain",emoji: "❓", label: "UNCERTAIN" },
  UNVERIFIABLE:    { cls: "uncertain",emoji: "❓", label: "UNCERTAIN" },
};

function SourceBadge({ type }) {
  const map = {
    fact_check:   { cls: "badge-fact_check",   icon: "🧾", label: "Fact-check" },
    trusted_news: { cls: "badge-trusted_news",  icon: "📰", label: "Trusted News" },
    gov_edu:      { cls: "badge-gov_edu",        icon: "🏛️", label: "Gov / Edu" },
    unknown:      { cls: "badge-unknown",         icon: "🔗", label: "Source" },
  };
  const c = map[type] || map.unknown;
  return <span className={`source-badge ${c.cls}`}>{c.icon} {c.label}</span>;
}

export default function ResultCard({ result }) {
  if (!result) return null;

  const key = result.label?.toUpperCase();
  const vc  = VERDICT_CONFIG[key] || VERDICT_CONFIG[result.label] || VERDICT_CONFIG.UNCERTAIN;
  const confPct = Math.round((result.confidence || 0.5) * 100);

  return (
    <div className="result-card">

      {/* Verdict */}
      <div className={`verdict-banner ${vc.cls}`}>
        <span className="verdict-emoji">{vc.emoji}</span>
        <div className="verdict-label">{vc.label}</div>
      </div>

      {/* Confidence */}
      <div className={`confidence-section ${vc.cls}`}>
        <div className="confidence-row">
          <span className="label-mono">Confidence</span>
          <span className="confidence-value">{confPct}%</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${confPct}%` }} />
        </div>
      </div>

      {/* Analysis */}
      {result.explanation && (
        <div className="analysis-section">
          <div className="section-title">Analysis</div>
          <p className="analysis-text">{result.explanation}</p>
        </div>
      )}

      {/* Contradictions */}
      {result.differences?.length > 0 && (
        <div className="contradictions-section">
          <div className="section-title">⚠️ Contradictions Detected</div>
          {result.differences.map((d, i) => (
            <div key={i} className="contradiction-item">
              <span>•</span><span>{d}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sources — fixed: uses credibility not score */}
      {result.sources?.length > 0 && (
        <div className="sources-section">
          <div className="section-title">Sources</div>
          {result.sources.map((s, i) => {
            const cred = Math.round(s.credibility ?? (s.score ? s.score * 100 : 50));
            return (
              <div key={i} className="source-item">
                <div className="source-meta">
                  <SourceBadge type={s.source_type} />
                  <span className="source-cred">{cred}% credibility</span>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="source-url">
                  {s.url}
                </a>
                <div className="mini-bar-track">
                  <div className="mini-bar-fill" style={{ width: `${cred}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer">
        <span>⚠️</span>
        <span>AI-assisted system. Results may not be fully accurate. Always verify with trusted sources before sharing.</span>
      </div>

    </div>
  );
}