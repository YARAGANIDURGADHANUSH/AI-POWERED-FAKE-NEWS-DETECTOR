import { useState, useEffect, useRef } from "react";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

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
  }

  .input-section textarea {
    width: 100%;
    min-height: 120px;
    background: var(--bg-mid);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .input-section textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 2px rgba(0,200,255,0.2);
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
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .confidence-value {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .confidence-track {
    height: 6px;
    background: var(--bg-mid);
    border-radius: 3px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
    border-radius: 3px;
    transition: width 0.8s ease;
  }

  /* ── EXPLANATION ── */
  .explanation-section {
    padding: 24px 28px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .explanation-text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* ── CONTRADICTIONS ── */
  .contradictions-section {
    padding: 24px 28px;
    border-top: 1px solid var(--border);
  }

  .contradiction-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .contradiction-item:last-child { margin-bottom: 0; }

  /* ── SOURCES ── */
  .sources-section {
    padding: 24px 28px;
    border-top: 1px solid var(--border);
  }

  .source-item {
    margin-bottom: 16px;
  }

  .source-item:last-child { margin-bottom: 0; }

  .source-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .source-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .source-badge.real {
    background: var(--real-bg);
    color: var(--real-color);
  }

  .source-badge.fake {
    background: var(--fake-bg);
    color: var(--fake-color);
  }

  .source-badge.partial {
    background: var(--partial-bg);
    color: var(--partial-color);
  }

  .source-badge.uncertain {
    background: var(--uncertain-bg);
    color: var(--uncertain-color);
  }

  .source-cred {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .source-url {
    color: var(--accent-cyan);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .source-url:hover {
    color: var(--accent-blue);
    text-decoration: underline;
  }

  .cred-mini-bar {
    height: 4px;
    background: var(--bg-mid);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 6px;
  }

  .cred-mini-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* ── DISCLAIMER ── */
  .disclaimer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .disclaimer-icon {
    font-size: 16px;
    color: var(--accent-cyan);
  }

  /* ── EXAMPLES ── */
  .examples-section {
    margin-top: 24px;
  }

  .examples-label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .example-chip {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .example-chip:hover {
    border-color: var(--border-glow);
    background: rgba(0,200,255,0.02);
    color: var(--text-primary);
  }

  /* ── LEADERBOARD ── */
  .leaderboard-section {
    margin-top: 32px;
    width: 100%;
    max-width: 680px;
  }

  .leaderboard-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    text-align: center;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 8px;
    transition: border-color 0.2s;
  }

  .leaderboard-item:hover {
    border-color: var(--border-glow);
  }

  .leaderboard-rank {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--accent-cyan);
    min-width: 40px;
  }

  .leaderboard-state {
    font-size: 16px;
    color: var(--text-primary);
    flex: 1;
  }

  .leaderboard-score {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* ── TRENDS ── */
  .trends-section {
    margin-top: 32px;
    width: 100%;
    max-width: 680px;
  }

  .trends-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    text-align: center;
  }

  .trend-item {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-secondary);
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
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .app { padding: 32px 16px 60px; }
    .header { margin-bottom: 32px; }
    .header h1 { font-size: clamp(28px, 8vw, 48px); }
    .main-card { max-width: 100%; }
    .verdict-banner { padding: 24px 20px 20px; }
    .verdict-label { font-size: 28px; }
    .confidence-section { padding: 16px 20px; }
    .explanation-section,
    .contradictions-section,
    .sources-section { padding: 20px; }
    .disclaimer { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 8px; }
    .examples-grid { grid-template-columns: 1fr; }
    .leaderboard-section,
    .trends-section { max-width: 100%; }
  }
`;

const VERDICT_CONFIG = {
  REAL: { cls: "real", emoji: "✅", label: "REAL" },
  TRUE: { cls: "real", emoji: "✅", label: "REAL" },
  FAKE: { cls: "fake", emoji: "❌", label: "FAKE" },
  FALSE: { cls: "fake", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { cls: "partial", emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING: { cls: "partial", emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
  UNVERIFIABLE: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
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
  }

  .input-section textarea {
    width: 100%;
    min-height: 120px;
    background: var(--bg-mid);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    color: var(--text-primary);
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.3s, box-shadow 0.3s;
  }

  .input-section textarea:focus {
    outline: none;
    border-color: var(--accent-cyan);
    box-shadow: 0 0 0 2px rgba(0,200,255,0.2);
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
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .confidence-value {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .confidence-track {
    height: 6px;
    background: var(--bg-mid);
    border-radius: 3px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
    border-radius: 3px;
    transition: width 0.8s ease;
  }

  /* ── EXPLANATION ── */
  .explanation-section {
    padding: 24px 28px;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .explanation-text {
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* ── CONTRADICTIONS ── */
  .contradictions-section {
    padding: 24px 28px;
    border-top: 1px solid var(--border);
  }

  .contradiction-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .contradiction-item:last-child { margin-bottom: 0; }

  /* ── SOURCES ── */
  .sources-section {
    padding: 24px 28px;
    border-top: 1px solid var(--border);
  }

  .source-item {
    margin-bottom: 16px;
  }

  .source-item:last-child { margin-bottom: 0; }

  .source-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .source-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .source-badge.real {
    background: var(--real-bg);
    color: var(--real-color);
  }

  .source-badge.fake {
    background: var(--fake-bg);
    color: var(--fake-color);
  }

  .source-badge.partial {
    background: var(--partial-bg);
    color: var(--partial-color);
  }

  .source-badge.uncertain {
    background: var(--uncertain-bg);
    color: var(--uncertain-color);
  }

  .source-cred {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .source-url {
    color: var(--accent-cyan);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .source-url:hover {
    color: var(--accent-blue);
    text-decoration: underline;
  }

  .cred-mini-bar {
    height: 4px;
    background: var(--bg-mid);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 6px;
  }

  .cred-mini-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-blue));
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* ── DISCLAIMER ── */
  .disclaimer {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 28px;
    border-top: 1px solid var(--border);
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .disclaimer-icon {
    font-size: 16px;
    color: var(--accent-cyan);
  }

  /* ── EXAMPLES ── */
  .examples-section {
    margin-top: 24px;
  }

  .examples-label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 12px;
  }

  .examples-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .example-chip {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .example-chip:hover {
    border-color: var(--border-glow);
    background: rgba(0,200,255,0.02);
    color: var(--text-primary);
  }

  /* ── LEADERBOARD ── */
  .leaderboard-section {
    margin-top: 32px;
    width: 100%;
    max-width: 680px;
  }

  .leaderboard-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    text-align: center;
  }

  .leaderboard-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 8px;
    transition: border-color 0.2s;
  }

  .leaderboard-item:hover {
    border-color: var(--border-glow);
  }

  .leaderboard-rank {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--accent-cyan);
    min-width: 40px;
  }

  .leaderboard-state {
    font-size: 16px;
    color: var(--text-primary);
    flex: 1;
  }

  .leaderboard-score {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* ── TRENDS ── */
  .trends-section {
    margin-top: 32px;
    width: 100%;
    max-width: 680px;
  }

  .trends-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    text-align: center;
  }

  .trend-item {
    background: var(--bg-glass);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--text-secondary);
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
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .app { padding: 32px 16px 60px; }
    .header { margin-bottom: 32px; }
    .header h1 { font-size: clamp(28px, 8vw, 48px); }
    .main-card { max-width: 100%; }
    .verdict-banner { padding: 24px 20px 20px; }
    .verdict-label { font-size: 28px; }
    .confidence-section { padding: 16px 20px; }
    .explanation-section,
    .contradictions-section,
    .sources-section { padding: 20px; }
    .disclaimer { padding: 16px 20px; flex-direction: column; align-items: flex-start; gap: 8px; }
    .examples-grid { grid-template-columns: 1fr; }
    .leaderboard-section,
    .trends-section { max-width: 100%; }
  }
`;

const VERDICT_CONFIG = {
  REAL: { cls: "real", emoji: "✅", label: "REAL" },
  TRUE: { cls: "real", emoji: "✅", label: "REAL" },
  FAKE: { cls: "fake", emoji: "❌", label: "FAKE" },
  FALSE: { cls: "fake", emoji: "❌", label: "FAKE" },
  "PARTIALLY TRUE": { cls: "partial", emoji: "⚠️", label: "PARTIALLY TRUE" },
  MISLEADING: { cls: "partial", emoji: "⚠️", label: "MISLEADING" },
  UNCERTAIN: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
  UNVERIFIABLE: { cls: "uncertain", emoji: "❓", label: "UNCERTAIN" },
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

export default function FactChecker() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [geoResult, setGeoResult] = useState(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [trendData, setTrendData] = useState({});

  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const resultRef = useRef(null);

  const scrollToResults = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const parseJson = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || data.message || res.statusText || "Request failed");
    }
    return data;
  };

  const checkFact = async () => {
    if (!claim.trim()) {
      setError("Please enter a claim before checking.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setGeoResult(null);
    setTrendData({});

    try {
      const res = await fetch(`${BACKEND_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim }),
      });

      const data = await parseJson(res);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to verify claim");
    } finally {
      setLoading(false);
      scrollToResults();
    }
  };

  const handleRegionSelect = async (region) => {
    if (!claim.trim()) {
      setError("Enter a claim first to run regional analysis.");
      return;
    }

    setLoading(true);
    setError("");
    setGeoResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/geo-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: claim, country: "india", region }),
      });
      const data = await parseJson(res);
      setGeoResult(data);

      const trendRes = await fetch(`${BACKEND_URL}/geo-trends/${region}`);
      const trend = await parseJson(trendRes);
      setTrendData(trend);
    } catch (err) {
      setError(err.message || "Geo analysis failed");
    } finally {
      setLoading(false);
      scrollToResults();
    }
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/geo-leaderboard`);
        const data = await parseJson(res);
        setLeaderboard(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Leaderboard load failed:", err.message);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="bg-layer">
        <div className="bg-grid"></div>
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>
      <div className="app">
        <header className="header">
          <div className="header-badge">AI Powered</div>
          <h1>🧠 Fake News Detector</h1>
          <p>Advanced fact-checking with regional insights and real-time web analysis</p>
        </header>

        <div className="main-card">
          {/* Input */}
          <div className="input-section">
            <label className="input-label">Enter claim or news headline</label>
            <textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
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
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            <span className="btn-inner">
              🌍 {showMap ? "Hide Map" : "News of My Location"}
            </span>
          </button>

          {/* Map */}
          {showMap && (
            <div style={{ marginTop: "20px" }}>
              <MapView onRegionSelect={handleRegionSelect} />
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
                    className={`loader-step ${i < Math.floor(Date.now() / 1800) % LOADER_STEPS.length ? "done" : i === Math.floor(Date.now() / 1800) % LOADER_STEPS.length ? "active" : ""}`}
                  >
                    <div className="step-dot" />
                    {i < Math.floor(Date.now() / 1800) % LOADER_STEPS.length ? `✓ ${step}` : step}
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
            <div className="result-card" ref={resultRef}>
              {/* Verdict banner */}
              <div className={`verdict-banner ${VERDICT_CONFIG[result.label]?.cls || "uncertain"}`}>
                <span className="verdict-icon">{VERDICT_CONFIG[result.label]?.emoji || "❓"}</span>
                <div className="verdict-label">{VERDICT_CONFIG[result.label]?.label || result.label}</div>
              </div>

              {/* Confidence */}
              <div className="confidence-section">
                <div className="confidence-header">
                  <span className="confidence-label">Confidence</span>
                  <span className="confidence-value">{Math.round((result.confidence || 0) * 100)}%</span>
                </div>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ width: `${Math.round((result.confidence || 0) * 100)}%` }}
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
                        <span className={`source-badge ${VERDICT_CONFIG[s.stance]?.cls || "uncertain"}`}>
                          {VERDICT_CONFIG[s.stance]?.emoji || "❓"} {VERDICT_CONFIG[s.stance]?.label || s.stance}
                        </span>
                        <span className="source-cred">
                          {Math.round(s.credibility || 0)}% credibility
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
                          style={{ width: `${Math.round(s.credibility || 0)}%` }}
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

          {/* Geo Result */}
          {geoResult && (
            <div className="result-card" ref={resultRef}>
              {/* Verdict banner */}
              <div className={`verdict-banner ${VERDICT_CONFIG[geoResult.label]?.cls || "uncertain"}`}>
                <span className="verdict-icon">🌍</span>
                <div className="verdict-label">{VERDICT_CONFIG[geoResult.label]?.label || geoResult.label}</div>
              </div>

              {/* Confidence */}
              <div className="confidence-section">
                <div className="confidence-header">
                  <span className="confidence-label">Confidence</span>
                  <span className="confidence-value">{Math.round((geoResult.confidence || 0) * 100)}%</span>
                </div>
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{ width: `${Math.round((geoResult.confidence || 0) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="explanation-section">
                <div className="section-title">Regional Analysis</div>
                <p className="explanation-text">{geoResult.explanation}</p>
              </div>

              {/* Regional Sources */}
              {geoResult.regional_view?.length > 0 && (
                <div className="sources-section">
                  <div className="section-title">Regional Sources</div>
                  {geoResult.regional_view.map((r, i) => (
                    <div key={i} className="source-item">
                      <div className="source-meta">
                        <span className="source-badge uncertain">
                          ❓ Regional
                        </span>
                      </div>
                      <div>
                        <strong>{r.name}</strong> — {r.bias}
                        {r.note && <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>{r.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="disclaimer">
                <span className="disclaimer-icon">⚠️</span>
                <span>
                  Regional analysis is based on local news sources. Verify with multiple perspectives.
                </span>
              </div>
            </div>
          )}

          {/* Examples */}
          {!result && !geoResult && !loading && (
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

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="leaderboard-section">
            <h2 className="leaderboard-title">🏆 Fake News Leaderboard</h2>
            {leaderboard.slice(0, 5).map((s, i) => (
              <div key={i} className="leaderboard-item">
                <span className="leaderboard-rank">#{i + 1}</span>
                <span className="leaderboard-state">{s.state}</span>
                <span className="leaderboard-score">{Math.round((s.fake_index || 0) * 100)}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Trends */}
        {Object.keys(trendData).length > 0 && (
          <div className="trends-section">
            <h2 className="trends-title">📈 Trends</h2>
            {Object.entries(trendData).map(([date, val]) => (
              <div key={date} className="trend-item">
                {date} → Fake: {val.fake}, Real: {val.real}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
