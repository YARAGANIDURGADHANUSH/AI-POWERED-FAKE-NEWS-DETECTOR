import { useState } from "react";
import { verifyNews } from "../services/newsService";
import ResultCard from "../components/ResultCard";
import toast from "react-hot-toast";

export default function Detector() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!claim.trim()) {
      toast.error("Please enter a claim to verify.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Uses your centralized service to call the backend
      const data = await verifyNews(claim);
      setResult(data);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <h1 className="section-title">🔍 AI Fact Checker</h1>

      <div className="input-group">
        <textarea
          className="textarea"
          placeholder="Enter a news headline or claim to fact-check…"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
      </div>

      <button 
        className="btn btn-primary" 
        onClick={handleCheck}
        disabled={loading || !claim.trim()}
      >
        {loading ? "Checking…" : "Check Fact"}
      </button>

      {/* Result Card is rendered here when data comes back */}
      {result && !loading && (
        <ResultCard result={result} />
      )}
    </div>
  );
}
