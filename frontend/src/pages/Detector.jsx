import { useState } from "react";
import { verifyNews } from "../services/newsService";
import Loader from "../components/Loader";
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
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🧠 Fake News Detector</h2>

      {/* Input */}
      <div className="input-group">
        <label className="input-label">Claim / News Headline</label>
        <textarea
          className="textarea"
          placeholder="Enter claim or news headline..."
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
        />
      </div>

      {/* Button */}
      <button 
        className="btn btn-primary btn-full" 
        onClick={handleCheck}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "🔍 Check Fact"}
      </button>

      {/* Loader */}
      {loading && (
        <div style={{ marginTop: "30px" }}>
          <Loader />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ marginTop: "30px" }}>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  textarea: {
    width: "100%",
    height: "120px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #1f2937",
    background: "#020617",
    color: "white",
  },
  button: {
    marginTop: "15px",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#0ea5e9",
    color: "white",
    cursor: "pointer",
  },
  error: {
    color: "#ef4444",
    marginTop: "10px",
  },
};
