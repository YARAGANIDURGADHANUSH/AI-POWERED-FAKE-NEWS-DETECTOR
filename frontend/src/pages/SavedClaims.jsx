import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { newsService } from "../services/api"; // ✅ Now using your Railway-connected service

export default function SavedClaims() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Fetching securely via the API service
    newsService.getHistory()
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to fetch history");
        setLoading(false);
      });
  }, [token, navigate]);

  return (
    <div className="content-wrapper" style={{ width: '800px', margin: '0 auto' }}>
      <h2 className="section-title">⭐ Saved Claims</h2>
      <p style={{ color: 'var(--text-muted)' }}>Your personal fact-checking history.</p>

      {loading ? (
        <p>Loading your history...</p>
      ) : error ? (
        <p style={{ color: '#ff6b6b' }}>{error}</p>
      ) : history.length === 0 ? (
        <div className="source-card" style={{ padding: '30px', textAlign: 'center', marginTop: '20px' }}>
          <p>You haven't saved any claims yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/detector")}>
            Try the Fact Detector
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {history.map((item, index) => (
            <div key={index} className="source-card" style={{ padding: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>"{item.claim_text}"</h4>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: item.label === "REAL" ? 'rgba(46, 204, 113, 0.2)' : 
                                   item.label === "FAKE" ? 'rgba(231, 76, 60, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                  color: item.label === "REAL" ? '#2ecc71' : 
                         item.label === "FAKE" ? '#e74c3c' : '#f1c40f'
                }}>
                  {item.label} ({item.confidence}%)
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#bbb', margin: '0' }}>{item.explanation}</p>
              
              {item.region && (
                <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '10px', display: 'inline-block' }}>
                  📍 {item.region} Analysis
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
