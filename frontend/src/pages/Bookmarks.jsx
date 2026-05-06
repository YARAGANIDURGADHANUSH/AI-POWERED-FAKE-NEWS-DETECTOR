import React, { useEffect, useState } from 'react';
import { newsService } from '../services/api';

export default function Bookmarks() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsService.getHistory()
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="content-wrapper">
      <h2 className="section-title">⭐ Saved Claims</h2>
      {loading ? <p>Loading history...</p> : (
        <div className="history-list">
          {history.map(item => (
            <div key={item.id} className="source-card">
              <h4>{item.claim_text}</h4>
              <p>Result: <strong>{item.label}</strong> ({item.confidence}%)</p>
              {item.region && <small>📍 {item.region}</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
