import { useState, useEffect, useRef } from "react";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app/verify";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-deep: #04080f;
    --bg-mid: #080f1a;
    --bg-card: #0c1420;
    --bg-glass: rgba(12, 20, 32, 0.85);
    --border: rgba(255,255,255,0.06);
    --border-glow: rgba(0, 200, 255, 0.2);
    --text-primary: #f0f4ff;
    --text-secondary: #8a9bb5;
    --text-muted: #4a5a72;
    --accent-cyan: #00c8ff;
    --accent-blue: #0066ff;
    --accent-purple: #7c3aed;
    --real-color: #00e5a0;
    --real-bg: rgba(0, 229, 160, 0.08);
    --fake-color: #ff4466;
    --fake-bg: rgba(255, 68, 102, 0.08);
    --partial-color: #ffaa00;
    --partial-bg: rgba(255, 170, 0, 0.08);
    --uncertain-color: #8888aa;
    --uncertain-bg: rgba(136, 136, 170, 0.08);
    --font-display: 'Syne', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --font-body: 'Inter', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: var(--font-body);
    background: var(--bg-deep);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── BACKGROUND ── */
  .bg-layer {
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  }

  .bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,200,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,200,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .bg-glow-1 {
    position: absolute;
    width: 600px; height: 600px;
    top: -200px; left: -200px;
    background: radial-gradient(circle, rgba(0,102,255,0.12) 0%, transparent 70%);
    border-radius: 50%;
  }

  .bg-glow-2 {
    position: absolute;
    width: 500px; height: 500px;
    bottom: -100px; right: -100px;
    background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%);
    border-radius: 50%;
  }

  /* ── LAYOUT ── */
  .app {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 20px 80px;
  }

  /* ── HEADER ── */
  .header {
    text-align: center;
    margin-bottom: 48px;
    animation: fadeDown 0.7s ease both;
  }

  .header-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent-cyan);
    background: rgba(0,200,255,0.08);
    border: 1px solid rgba(0,200,255,0.2);
    padding: 6px 14px;
    border-radius: 100px;
    margin-bottom: 20px;
  }

  .header-badge::before {
    content: '';
    width: 6px; height: 6px;
    background: var(--accent-cyan);
    border-radius: 50%;
    animation: pulse-dot 2s ease infinite;
  }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  .header h1 {
    font-family: var(--font-display);
    font-size: clamp(32px, 6vw, 56px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #f0f4ff 0%, #a0b8d8 50%, var(--accent-cyan) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 12px;
  }

  .header p {
    font-size: 15px;
    color: var(--text-secondary);
    font-weight: 300;
    max-width: 420px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* ── MAIN CARD ── */
  .main-card {
    width: 100%;
    max-width: 680px;
    animation: fadeUp 0.7s ease 0.1s both;
  }

  /* ── INPUT SECTION ── */
  .input-section {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(20px);
    margin-bottom: 16px;
    transition: border-color 0.3s;
  }

  .input-section:focus-within {
    border-color: var(--border-glow);
    box-shadow: 0 0 0 1px rgba(0,200,255,0.1), 0 8px 32px rgba(0,0,0,0.3);
  }

  .input-label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 10px;
    display: block;
  }

  .input-section textarea {
    width: 100%;
    min-height: 100px;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: var(--font-body);
    font-size: 16px;
    font-weight: 400;
    color: var(--text-primary);
    line-height: 1.6;
    caret-color: var(--accent-cyan);
  }

  .input-section textarea::placeholder {
    color: var(--text-muted);
    font-weight: 300;
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .char-count {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  /* ── BUTTON ── */
  .check-btn {
    width: 100%;
    padding: 16px 24px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-cyan));
    color: white;
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    margin-bottom: 16px;
  }

  .check-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .check-btn:hover:not(:disabled)::before { opacity: 1; }
  .check-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,102,255,0.4);
  }
  .check-btn:active:not(:disabled) { transform: translateY(0); }
  .check-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    background: linear-gradient(135deg, #1a2a3a, #1a3040);
  }

  .btn-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  /* ── LOADER ── */
  .loader-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 32px;
    animation: fadeIn 0.3s ease;
  }

  .loader-ring {
    width: 44px; height: 44px;
    border: 2px solid var(--border);
    border-top-color: var(--accent-cyan);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loader-steps {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    max-width: 300px;
  }

  .loader-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
    transition: color 0.3s;
  }

  .loader-step.active { color: var(--accent-cyan); }
  .loader-step.done { color: var(--real-color); }

  .step-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ── ERROR ── */
  .error-box {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,68,102,0.08);
    border: 1px solid rgba(255,68,102,0.2);
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 14px;
    color: var(--fake-color);
    margin-bottom: 16px;
    animation: fadeIn 0.3s ease;
  }

  /* ── RESULT CARD ── */
  .result-card {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* ── VERDICT BANNER ── */
  .verdict-banner {
    padding: 32px 28px 24px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .verdict-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.06;
  }

  .verdict-banner.real::before { background: var(--real-color); }
  .verdict-banner.fake::before { background: var(--fake-color); }
  .verdict-banner.partial::before { background: var(--partial-color); }
  .verdict-banner.uncertain::before { background: var(--uncertain-color); }

  .verdict-icon {
    font-size: 40px;
    margin-bottom: 10px;
    display: block;
    animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) 0.2s both;
  }

  .verdict-label {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.02em;
    animation: popIn 0.4s cubic-bezier(0.16,1,0.3,1) 0.25s both;
  }

  .verdict-banner.real .verdict-label { color: var(--real-color); }
  .verdict-banner.fake .verdict-label { color: var(--fake-color); }
  .verdict-banner.partial .verdict-label { color: var(--partial-color); }
  .verdict-banner.uncertain .verdict-label { color: var(--uncertain-color); }

  /* ── CONFIDENCE BAR ── */
  .confidence-section {
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .confidence-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .confidence-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .confidence-value {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .confidence-track {
    height: 4px;
    background: var(--border);
    border-radius: 100px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    border-radius: 100px;
    transition: width 1s cubic-bezier(0.16,1,0.3,1);
    animation: fillBar 1s cubic-bezier(0.16,1,0.3,1) 0.4s both;
  }

  .real .confidence-fill { background: linear-gradient(90deg, #00b37a, var(--real-color)); }
  .fake .confidence-fill { background: linear-gradient(90deg, #cc2244, var(--fake-color)); }
  .partial .confidence-fill { background: linear-gradient(90deg, #cc7700, var(--partial-color)); }
  .uncertain .confidence-fill { background: linear-gradient(90deg, #555577, var(--uncertain-color)); }

  @keyframes fillBar {
    from { width: 0 !important; }
  }

  /* ── EXPLANATION ── */
  .explanation-section {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .explanation-text {
    font-size: 14px;
    line-height: 1.7;
    color: var(--text-secondary);
    font-weight: 300;
  }

  /* ── CONTRADICTIONS ── */
  .contradictions-section {
    padding: 20px 28px;
    border-bottom: 1px solid var(--border);
  }

  .contradiction-item {
    display: flex;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(255,170,0,0.06);
    border: 1px solid rgba(255,170,0,0.15);
    border-radius: 10px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--partial-color);
    font-family: var(--font-mono);
    line-height: 1.5;
    word-break: break-all;
  }

  /* ── SOURCES ── */
  .sources-section {
    padding: 20px 28px;
  }

  .source-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    background: rgba(255,255,255,0.025);
    border: 1px solid var(--border);
    border-radius: 12px;
    margin-bottom: 10px;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    cursor: pointer;
  }

  .source-item:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(0,200,255,0.15);
    transform: translateX(4px);
  }

  .source-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex-wrap: wrap;
  }

  .source-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
  }

  .badge-fact_check {
    background: rgba(0,229,160,0.1);
    color: var(--real-color);
    border: 1px solid rgba(0,229,160,0.2);
  }

  .badge-trusted_news {
    background: rgba(0,200,255,0.08);
    color: var(--accent-cyan);
    border: 1px solid rgba(0,200,255,0.2);
  }

  .badge-unknown {
    background: rgba(138,155,181,0.08);
    color: var(--text-secondary);
    border: 1px solid rgba(138,155,181,0.15);
  }

  .source-cred {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .source-url {
    color: var(--accent-cyan);
    text-decoration: none;
    font-size: 12px;
    line-height: 1.4;
    word-break: break-all;
    transition: color 0.2s;
  }

  .source-url:hover { color: #66d9f5; text-decoration: underline; }

  .cred-mini-bar {
    height: 2px;
    background: var(--border);
    border-radius: 100px;
    overflow: hidden;
    margin-top: 4px;
  }

  .cred-mini-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
  }

  /* ── DISCLAIMER ── */
  .disclaimer {
    margin: 0 28px 20px;
    padding: 12px 16px;
    background: rgba(255,170,0,0.05);
    border: 1px solid rgba(255,170,0,0.12);
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    color: rgba(255,170,0,0.7);
    line-height: 1.5;
  }

  .disclaimer-icon { font-size: 14px; flex-shrink: 0; margin-top: 1px; }

  /* ── QUICK EXAMPLES ── */
  .examples-section {
    margin-top: 24px;
    animation: fadeUp 0.7s ease 0.3s both;
  }

  .examples-label {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 10px;
    text-align: center;
  }

  .examples-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .example-chip {
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--border);
    border-radius: 100px;
    padding: 7px 14px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .example-chip:hover {
    background: rgba(0,200,255,0.06);
    border-color: rgba(0,200,255,0.2);
    color: var(--accent-cyan);
    transform: translateY(-1px);
  }

  /* ── STATS BAR ── */
  .stats-bar {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-bottom: 40px;
    animation: fadeUp 0.7s ease 0.2s both;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .stat-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .stat-divider {
    width: 1px;
    background: var(--border);
    align-self: stretch;
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.7); }
    to { opacity: 1; transform: scale(1); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 600px) {
    .app { padding: 32px 16px 60px; }
    .verdict-banner { padding: 24px 20px 20px; }
    .confidence-section,
    .explanation-section,
    .contradictions-section,
    .sources-section { padding: 16px 20px; }
    .disclaimer { margin: 0 20px 16px; }
    .stats-bar { gap: 16px; }
    .stat-value { font-size: 16px; }
  }
`;

const VERDICT_CONFIG = {
  REAL:           { cls: "real",     emoji: "✅", label: "REAL" },
  TRUE:           { cls: "real",     emoji: "✅", label: "REAL" },
  FAKE:           { cls: "fake",     emoji: "❌", label: "FAKE" },
  FALSE:          { cls: "fake",     emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { cls: "partial", emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING:     { cls: "partial",  emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN:      { cls: "uncertain",emoji: "❓", label: "UNCERTAIN" },
  UNVERIFIABLE:   { cls: "uncertain",emoji: "❓", label: "UNCERTAIN" },
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

function SourceBadge({ type }) {
  const config = {
    fact_check:   { cls: "badge-fact_check",   icon: "🧾", label: "Fact-check" },
    trusted_news: { cls: "badge-trusted_news",  icon: "📰", label: "Trusted News" },
    unknown:      { cls: "badge-unknown",        icon: "🔗", label: "Source" },
  };
  const c = config[type] || config.unknown;
  return (
    <span className={`source-badge ${c.cls}`}>
      {c.icon} {c.label}
    </span>
  );
}

export default function FactChecker() {
  const [claim, setClaim]     = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [showMap, setShowMap] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [checks, setChecks]   = useState(0);
  const stepTimer             = useRef(null);
  const resultRef             = useRef(null);

  useEffect(() => {
    if (loading) {
      setStepIdx(0);
      stepTimer.current = setInterval(() => {
        setStepIdx(i => Math.min(i + 1, LOADER_STEPS.length - 1));
      }, 1800);
    } else {
      clearInterval(stepTimer.current);
    }
    return () => clearInterval(stepTimer.current);
  }, [loading]);

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [result]);

  const checkFact = async () => {
    if (!claim.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim }),
      });

      if (!response.ok) throw new Error("Server error");
      const data = await response.json();

      if (data.error) throw new Error(data.error);

      setResult({
        verdict:      data.label || "UNCERTAIN",
        confidence:   data.confidence || 0.5,
        explanation:  data.explanation || "No explanation available.",
        differences:  data.differences || [],
        sources: (data.sources || []).map(s => ({
          url:         s.url,
          credibility: s.credibility ?? 50,
          source_type: s.source_type || "unknown",
        })),
      });
      setChecks(c => c + 1);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Cannot connect to backend. Please try again."
          : `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); checkFact(); }
  };

  const verdictKey = result?.verdict?.toUpperCase();
  const vc = VERDICT_CONFIG[verdictKey] || VERDICT_CONFIG[result?.verdict] || VERDICT_CONFIG.UNCERTAIN;
  const confPct = result ? Math.round(result.confidence * 100) : 0;

  return (
    <>
      <style>{styles}</style>

      {/* Background */}
      <div className="bg-layer">
        <div className="bg-grid" />
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
      </div>

      <div className="app">

        {/* Header */}
        <header className="header">
          <div className="header-badge">AI-Powered · Real-time · LLM Reasoning</div>
          <h1>Fake News Detector</h1>
          <p>Verify any claim using live web sources, semantic analysis, and LLM fact-checking.</p>
        </header>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">Llama 3.3</div>
            <div className="stat-label">LLM Engine</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">Real-time</div>
            <div className="stat-label">Web Search</div>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <div className="stat-value">{checks}</div>
            <div className="stat-label">Checks Done</div>
          </div>
        </div>

        <div className="main-card">

          {/* Input */}
          <div className="input-section">
            <label className="input-label">Enter claim or news headline</label>
            <textarea
              value={claim}
              onChange={e => setClaim(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. NASA confirms water found on Mars..."
              maxLength={500}
            />
            <div className="input-footer">
              <span className="char-count">{claim.length}/500</span>
            </div>
          </div>

          {/* Button */}
          <button
            className="check-btn"
            onClick={checkFact}
            disabled={loading || !claim.trim()}
          >
            <span className="btn-inner">
              {loading ? (
                <>
                  <div className="loader-ring" style={{width:18,height:18,borderWidth:2}} />
                  Analyzing...
                </>
              ) : (
                <>🔍 Check Fact</>
              )}
            </span>
          </button>

          {/* Map Toggle */}
          <button
            className="check-btn"
            onClick={() => setShowMap(!showMap)}
            style={{ marginTop: '10px' }}
          >
            <span className="btn-inner">
              {showMap ? 'Hide Map' : 'Show Map'}
            </span>
          </button>

          {/* Map */}
          {showMap && (
            <div style={{ marginTop: '20px' }}>
              <MapView onRegionSelect={(region) => console.log('Selected region:', region)} />
            </div>
          )}

          {/* Loader */}
          {loading && (
            <div className="loader-section">
              <div className="loader-ring" />
              <div className="loader-steps">
                {LOADER_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`loader-step ${i < stepIdx ? "done" : i === stepIdx ? "active" : ""}`}
                  >
                    <div className="step-dot" />
                    {i < stepIdx ? `✓ ${step}` : step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`result-card`} ref={resultRef}>

              {/* Verdict banner */}
              <div className={`verdict-banner ${vc.cls}`}>
                <span className="verdict-icon">{vc.emoji}</span>
                <div className={`verdict-label`}>{vc.label}</div>
              </div>

              {/* Confidence */}
              <div className={`confidence-section ${vc.cls}`}>
                <div className="confidence-header">
                  <span className="confidence-label">Confidence</span>
                  <span className="confidence-value">{confPct}%</span>
                </div>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ width: `${confPct}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="explanation-section">
                <div className="section-title">Analysis</div>
                <p className="explanation-text">{result.explanation}</p>
              </div>

              {/* Contradictions */}
              {result.differences?.length > 0 && (
                <div className="contradictions-section">
                  <div className="section-title">⚠️ Contradictions Detected</div>
                  {result.differences.map((d, i) => (
                    <div key={i} className="contradiction-item">
                      <span>•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sources */}
              {result.sources?.length > 0 && (
                <div className="sources-section">
                  <div className="section-title">Sources</div>
                  {result.sources.map((s, i) => (
                    <div key={i} className="source-item">
                      <div className="source-meta">
                        <SourceBadge type={s.source_type} />
                        <span className="source-cred">
                          {Math.round(s.credibility)}% credibility
                        </span>
                      </div>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-url"
                      >
                        {s.url}
                      </a>
                      <div className="cred-mini-bar">
                        <div
                          className="cred-mini-fill"
                          style={{ width: `${Math.round(s.credibility)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="disclaimer">
                <span className="disclaimer-icon">⚠️</span>
                <span>
                  This is an AI-assisted experimental system. Results may not be fully accurate.
                  Always verify with trusted sources before sharing.
                </span>
              </div>

            </div>
          )}

          {/* Examples */}
          {!result && !loading && (
            <div className="examples-section">
              <div className="examples-label">Try an example</div>
              <div className="examples-grid">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    className="example-chip"
                    onClick={() => setClaim(ex)}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
