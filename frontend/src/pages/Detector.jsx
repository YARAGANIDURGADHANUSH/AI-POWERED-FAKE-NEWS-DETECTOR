import { useState } from "react";
import { verifyNews } from "../services/newsService";

export default function Detector() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const data = await verifyNews(claim);
    setResult(data);
  };

  return (
    <div>
      <h2>Fake News Detector</h2>

      <textarea onChange={(e) => setClaim(e.target.value)} />

      <button onClick={handleCheck}>Check</button>

      {result && (
        <div>
          <h3>{result.label}</h3>
          <p>{result.explanation}</p>
        </div>
      )}
    </div>
  );
}