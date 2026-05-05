import { useState } from "react";
import { verifyNews } from "../services/newsService";
import Loader from "../components/Loader";
import ResultCard from "../components/ResultCard";

export default function Detector() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!claim.trim()) {
      setError("Please enter a claim");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const data = await verifyNews(claim);
      setResult(data);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Fake News Detector</h2>

      {/* Input */}
      <textarea
        style={styles.textarea}
        placeholder="Enter claim or news headline..."
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
      />

      {/* Button */}
      <button style={styles.button} onClick={handleCheck}>
        🔍 Check Fact
      </button>

      {/* Error */}
      {error && <p style={styles.error}>{error}</p>}

      {/* Loader */}
      {loading && <Loader />}

      {/* Result */}
      {result && !loading && <ResultCard result={result} />}
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