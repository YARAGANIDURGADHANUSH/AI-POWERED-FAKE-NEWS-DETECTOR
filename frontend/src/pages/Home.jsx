import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "🧠", title: "LLM Reasoning",      desc: "Powered by Llama 3.3 70B via Groq for deep contextual fact analysis." },
  { icon: "🌐", title: "Real-time Search",    desc: "Searches the live web for sources using Google Search API." },
  { icon: "📊", title: "Credibility Scoring", desc: "Custom engine scores every source by domain trust and relevance." },
  { icon: "🌍", title: "Geo Analysis",        desc: "Region-aware fact checking across Indian states." },
  { icon: "⚠️", title: "Contradiction Detect",desc: "Context-aware AI detects when sources conflict with the claim." },
  { icon: "🔓", title: "Free & Open Source",  desc: "No paywalls. Try any claim instantly, no login required." },
];

export default function Home() {
  const navigate   = useNavigate();
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="content-wrapper-wide">

      {/* Hero */}
      <div className="hero anim-fade-up">
        <div className="hero-badge">AI-Powered · Real-time · LLM Reasoning</div>
        <h1>Fight Misinformation<br />with AI</h1>
        <p>
          Verify any news claim using live web sources, semantic similarity,
          and large language model fact-checking — in seconds.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/detector")}>
            🔍 Try Detector
          </button>
          {isLoggedIn ? (
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/profile")}>
              👤 {user?.name}
            </button>
          ) : (
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/register")}>
              Create Account
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="stats-row anim-fade-up delay-2">
          <div className="stat-cell">
            <div className="stat-val">Llama 3.3</div>
            <div className="stat-lbl">LLM Engine</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">Real-time</div>
            <div className="stat-lbl">Web Search</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">4</div>
            <div className="stat-lbl">Verdict Types</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">Free</div>
            <div className="stat-lbl">Always</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="features-grid anim-fade-up delay-3">
        {FEATURES.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", marginTop: 64 }} className="anim-fade-up delay-3">
        <p style={{ color: "var(--text-2)", marginBottom: 16, fontSize: 15 }}>
          Ready to check a claim?
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/detector")}>
          🧠 Start Fact Checking
        </button>
      </div>

    </div>
  );
}