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
      
      {/* Map selection tool */}
      <MapView onRegionSelect={setSelectedRegion} />
      
      <div className="search-container">
        <p>Analyzing for: <strong>{selectedRegion}</strong></p>
        <textarea 
          placeholder={`Enter news specific to ${selectedRegion}...`}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
        <button onClick={handleGeoVerify} disabled={loading}>
          Verify Local News
        </button>
      </div>

      {result && <ResultCard result={result} isRegional={true} />}
    </div>
  );
}
