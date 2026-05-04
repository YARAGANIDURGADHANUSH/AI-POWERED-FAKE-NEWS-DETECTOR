import { useState, useEffect } from "react";
import MapView from "./MapView";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

export default function GeoPage() {
  const [country, setCountry] = useState("india");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [claim, setClaim] = useState("");

  const [result, setResult] = useState(null);

  const verifyGeo = async () => {
    const res = await fetch(`${BACKEND_URL}/geo-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        news: claim,
        country,
        region
      })
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🌍 Regional News Verification</h2>

      {/* DROPDOWNS */}
      <select value={country} onChange={e => setCountry(e.target.value)}>
        <option value="india">India</option>
      </select>

      <select value={region} onChange={e => setRegion(e.target.value)}>
        <option>Andhra Pradesh</option>
        <option>Tamil Nadu</option>
        <option>Telangana</option>
      </select>

      {/* INPUT */}
      <textarea
        placeholder="Enter local claim..."
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
      />

      <button onClick={verifyGeo}>Verify</button>

      {/* HEATMAP */}
      <MapView />

      {/* RESULT */}
      {result && (
        <div>
          <h3>{result.label}</h3>
          <p>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}
