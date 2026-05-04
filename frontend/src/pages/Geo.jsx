import { useState } from "react";

const BACKEND_URL = "https://ai-powered-fake-news-detector-production.up.railway.app";

export default function Geo() {
  const [claim, setClaim] = useState("");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [result, setResult] = useState(null);

  const verifyGeo = async () => {
    const res = await fetch(`${BACKEND_URL}/geo-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        news: claim,
        country: "india",
        region
      })
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h2>Geo News</h2>

      <select onChange={(e) => setRegion(e.target.value)}>
        <option>Andhra Pradesh</option>
        <option>Telangana</option>
      </select>

      <textarea onChange={(e) => setClaim(e.target.value)} />

      <button onClick={verifyGeo}>Check</button>

      {result && (
        <div>
          <h3>{result.label}</h3>
          <p>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}