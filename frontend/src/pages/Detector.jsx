import React, { useState } from 'react';
import { newsService } from '../services/api';
import ResultCard from '../components/ResultCard';
import Loader from '../components/Loader';

export default function Detector() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await newsService.verifyGlobal(claim);
      setResult(response.data);
    } catch (error) {
      console.error("Global verification failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h2 className="section-title">🧠 Fact Detector</h2>
      
      {/* 🎨 Restored Styling Here */}
      <div className="search-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
        <textarea 
          placeholder="Enter a news headline or claim to verify globally..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          style={{
            width: '100%', minHeight: '100px', padding: '15px', borderRadius: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical'
          }}
        />
        <button 
          className="btn btn-primary" 
          onClick={handleVerify} 
          disabled={loading || !claim}
          style={{ padding: '12px 24px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <Loader /> : 'Verify Claim'}
        </button>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}
