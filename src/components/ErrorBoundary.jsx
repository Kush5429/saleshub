import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err, info) {
    console.error("[ErrorBoundary] caught:", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px 40px", gap: 16, textAlign: "center",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(255,68,68,0.12)", border: "1px solid rgba(255,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}>⚠</div>
          <h3 style={{ color: "var(--text)", margin: 0, fontSize: 16, fontWeight: 700 }}>
            Something went wrong
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0, maxWidth: 400 }}>
            {this.state.message || "This section failed to load. The API may be unavailable."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              marginTop: 8, padding: "8px 20px", borderRadius: "var(--radius-sm)",
              background: "var(--accent)", color: "#000", border: "none",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
