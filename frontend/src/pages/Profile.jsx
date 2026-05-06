import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Send back to Launchpad
  };

  if (!user) {
    return (
      <div className="content-wrapper" style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Please log in to view your profile.</h2>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="content-wrapper" style={{ width: '600px', margin: '0 auto' }}>
      <h2 className="section-title">👤 User Profile</h2>
      
      <div className="source-card" style={{ padding: '30px', marginTop: '20px', textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 'bold' }}>Name</label>
          <p style={{ fontSize: '18px', margin: '5px 0 0 0' }}>{user.name}</p>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <label style={{ color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 'bold' }}>Email Address</label>
          <p style={{ fontSize: '18px', margin: '5px 0 0 0' }}>{user.email}</p>
        </div>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(255, 50, 50, 0.1)',
            border: '1px solid rgba(255, 50, 50, 0.3)',
            color: '#ff6b6b',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 50, 50, 0.2)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 50, 50, 0.1)'}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
