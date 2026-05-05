const STEPS = [
  "Searching web sources...",
  "Extracting content...",
  "Computing similarity...",
  "Analyzing with LLM...",
  "Building verdict...",
];

export default function Loader({ stepIndex = 0 }) {
  return (
    <div className="loader-wrap anim-fade-in">
      <div className="loader-ring" />
      <div className="loader-steps">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`loader-step ${
              i < stepIndex ? "done" : i === stepIndex ? "active" : ""
            }`}
          >
            <div className="step-dot" />
            {i < stepIndex ? `✓ ${step}` : step}
          </div>
        ))}
      </div>
    </div>
  );
}