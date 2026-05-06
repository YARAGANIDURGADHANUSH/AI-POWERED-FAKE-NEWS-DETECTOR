export default function Bookmarks() {
  return (
    <div className="content-wrapper">
      <h1 className="section-title">⭐ Saved Claims</h1>
      <div className="result-box" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          You haven't saved any fact-checks yet. 
          Start by checking a claim in the <strong>Detector</strong>.
        </p>
      </div>
    </div>
  );
}
