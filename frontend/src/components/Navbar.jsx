import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={{ 
      padding: '20px 5%', 
      display: 'flex', 
      alignItems: 'center',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(26, 31, 43, 0.5)',
      backdropFilter: 'blur(10px)'
    }}>
      <div 
        onClick={() => navigate('/')} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          cursor: 'pointer',
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <span style={{ fontSize: '28px', marginRight: '12px' }}>🧠</span>
        <h2 style={{ 
          margin: 0, 
          fontSize: '22px', 
          fontWeight: '700', 
          color: 'white',
          letterSpacing: '0.5px'
        }}>
          FakeNews AI
        </h2>
      </div>
    </nav>
  );
}
