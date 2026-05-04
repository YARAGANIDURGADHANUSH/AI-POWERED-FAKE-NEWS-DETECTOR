import { useState } from "react";
import { geoVerify } from "../services/newsService";

export default function Geo() {
  const [claim, setClaim] = useState("");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [result, setResult] = useState(null);

  const handleCheck = async () => {
    const data = await geoVerify(claim, region);
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

      <button onClick={handleCheck}>Check</button>

      {result && <p>{result.label}</p>}
    </div>
  );
}