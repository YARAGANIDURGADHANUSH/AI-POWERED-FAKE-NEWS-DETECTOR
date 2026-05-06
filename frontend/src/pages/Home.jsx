import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const QUICK_ACTIONS = [
    { title: "Fact Detector", desc: "Verify any news headline using AI reasoning.", path: "/detector", icon: "🧠" },
    { title: "Geo Analysis", desc: "Check regional misinformation across India.", path: "/geo", icon: "🌍" },
    { title: "Saved Claims", desc: "Access your history of verified news.", path: "/bookmarks", icon: "⭐" },
    { title: "User Profile", desc: "Manage your account and preferences.", path: "/profile", icon: "👤" },
  ];

  return (
    <div className="content-wrapper" style={{ width: '900px', textAlign: 'center' }}>
      <h1 className="section-title">🛡️ FakeNews AI Launchpad</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Combat misinformation with region-aware AI fact-checking.
      </p>

      {/* Quick Action Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {QUICK_ACTIONS.map((action) => (
          <div 
            key={action.path} 
            className="source-card" 
            style={{ cursor: 'pointer', padding: '25px' }}
            onClick={() => navigate(action.path)}
          >
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>{action.icon}</div>
            <h3 style={{ marginBottom: '10px', color: 'var(--accent-cyan)' }}>{action.title}</h3>
            <p style={{ fontSize: '13px', color: '#bbb' }}>{action.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
        {!isLoggedIn ? (
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Get Started — Create Free Account
          </button>
        ) : (
          <p style={{ color: 'var(--success)' }}>Welcome back, {user?.name}!</p>
        )}
      </div>
    </div>
  );
}
