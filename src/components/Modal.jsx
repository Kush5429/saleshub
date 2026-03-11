import Icon from "./Icon";

export default function Modal({ title, onClose, children, width = 540 }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="animate-in"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: "var(--radius-xl)",
          width: "100%", maxWidth: width,
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "22px 26px 0",
        }}>
          <h3 style={{
            color: "var(--text)", fontSize: 18, fontWeight: 800,
            fontFamily: "var(--font-display)",
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-muted)",
            }}
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 26px 26px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
