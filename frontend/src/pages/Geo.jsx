import { useState } from "react";
import { geoVerify } from "../services/newsService";
import Loader from "../components/Loader";
import ResultCard from "../components/ResultCard";
import MapView from "../components/MapView";

export default function Geo() {
  const [claim, setClaim] = useState("");
  const [region, setRegion] = useState("Andhra Pradesh");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async (selectedRegion = region) => {
    if (!claim.trim()) {
      setError("Please enter a claim to verify.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      // Uses the centralized newsService
      const data = await geoVerify(claim, selectedRegion);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to analyze regional news. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🌍 Geo News Analysis</h2>

      <div className="input-group">
        <label className="input-label">Select Region</label>
        <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Telangana">Telangana</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Delhi">Delhi</option>
        </select>
      </div>

      <div className="input-group">
        <label className="input-label">Claim / News Headline</label>
        <textarea
          className="textarea"
          placeholder="Enter a region-specific claim..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
      </div>

      <button className="btn btn-primary btn-full" onClick={() => handleCheck(region)} disabled={loading}>
        {loading ? "Analyzing..." : "🌍 Check Regional Fact"}
      </button>

      {error && <div className="error-box" style={{ marginTop: "20px" }}>{error}</div>}

      {loading && <Loader />}

      {result && !loading && (
        <div style={{ marginTop: "30px" }}>
          <ResultCard result={result} />
        </div>
      )}

      {/* Map Integration */}
      <div style={{ marginTop: "40px" }}>
        <h3 className="section-title">Interactive Region Map</h3>
        <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "15px" }}>
          Click on a state to automatically run a fact-check for that region.
        </p>
        <MapView onRegionSelect={(stateName) => {
          setRegion(stateName);
          if (claim) handleCheck(stateName); // Auto-check if claim exists
        }} />
      </div>
    </div>
  );
}
