import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!isLoggedIn) {
    return (
      <div className="content-wrapper" style={{ textAlign: 'center' }}>
        <h1 className="section-title">👤 User Profile</h1>
        <p style={{ marginBottom: '20px' }}>Please log in to view your profile.</p>
        <button className="btn btn-primary" onClick={() => navigate("/login")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <h1 className="section-title">👤 User Profile</h1>
      
      <div className="result-box">
        <div style={{ marginBottom: '15px' }}>
          <label className="input-label">Account Name</label>
          <div className="source-card" style={{ fontSize: '18px' }}>{user?.name}</div>
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <label className="input-label">Email Address</label>
          <div className="source-card" style={{ fontSize: '18px' }}>{user?.email}</div>
        </div>

        <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
