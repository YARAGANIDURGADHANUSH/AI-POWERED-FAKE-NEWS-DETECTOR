import React from "react";

export default function ResultCard({ result }) {
  if (!result) return null;

  const getColor = () => {
    if (result.label === "REAL") return "#22c55e";
    if (result.label === "FAKE") return "#ef4444";
    return "#facc15";
  };

  return (
    <div style={styles.card}>
      {/* Label */}
      <div style={{ ...styles.label, color: getColor() }}>
        {result.label}
      </div>

      {/* Confidence */}
      <div style={styles.section}>
        <p>Confidence</p>
        <div style={styles.barContainer}>
          <div
            style={{
              ...styles.bar,
              width: `${Math.round(result.confidence * 100)}%`,
              background: getColor(),
            }}
          ></div>
        </div>
        <span>{Math.round(result.confidence * 100)}%</span>
      </div>

      {/* Explanation */}
      <div style={styles.section}>
        <h4>Analysis</h4>
        <p>{result.explanation}</p>
      </div>

      {/* Sources */}
      {result.sources && result.sources.length > 0 && (
        <div style={styles.section}>
          <h4>Sources</h4>
          {result.sources.map((src, i) => (
            <div key={i} style={styles.source}>
              <a href={src.url} target="_blank" rel="noreferrer">
                {src.url}
              </a>
              <span>{Math.round(src.score * 100)}% credibility</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    marginTop: "30px",
    padding: "20px",
    borderRadius: "12px",
    background: "#0f172a",
    border: "1px solid #1f2937",
  },
  label: {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  section: {
    marginTop: "15px",
  },
  barContainer: {
    width: "100%",
    height: "8px",
    background: "#1f2937",
    borderRadius: "5px",
    marginTop: "5px",
  },
  bar: {
    height: "100%",
    borderRadius: "5px",
  },
  source: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
};