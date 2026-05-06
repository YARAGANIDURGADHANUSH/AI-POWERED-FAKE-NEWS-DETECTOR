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
      <div className="search-container">
        <textarea 
          placeholder="Enter a news headline or claim to verify globally..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
        <button onClick={handleVerify} disabled={loading || !claim}>
          {loading ? <Loader /> : 'Verify Claim'}
        </button>
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}
