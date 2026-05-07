import React, { useState } from 'react';
import { newsService } from '../services/api';
import MapView from '../components/MapView';
import ResultCard from '../components/ResultCard';

export default function Geo() {
  const [claim, setClaim] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Andhra Pradesh'); // Default
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGeoVerify = async () => {
    setLoading(true);
    try {
      const response = await newsService.verifyRegional(claim, selectedRegion);
      setResult(response.data);
    } catch (error) {
      console.error("Regional verification failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h2 className="section-title">🌍 Geo Analysis</h2>
      
      <MapView onRegionSelect={setSelectedRegion} />
      
      {/* 🎨 Restored Styling Here */}
      <div className="search-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px', marginTop: '20px' }}>
        <p style={{ color: 'var(--accent-cyan)', margin: 0 }}>
          Analyzing for: <strong style={{ color: '#fff' }}>{selectedRegion}</strong>
        </p>
        <textarea 
          placeholder={`Enter news specific to ${selectedRegion}...`}
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
          onClick={handleGeoVerify} 
          disabled={loading || !claim}
          style={{ padding: '12px 24px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Analyzing...' : 'Verify Local News'}
        </button>
      </div>

      {result && <ResultCard result={result} isRegional={true} />}
    </div>
  );
}
