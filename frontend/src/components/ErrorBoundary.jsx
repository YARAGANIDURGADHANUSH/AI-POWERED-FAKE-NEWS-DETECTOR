import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real SaaS, you would send this to Sentry, Datadog, or LogRocket
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
          <h1 style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</h1>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Something went wrong.</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '24px' }}>We've encountered an unexpected system error.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
