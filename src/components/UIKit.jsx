import { Star } from "lucide-react";

// Star Rating Component
export function StarRating({ rating, size = "sm" }) {
  const stars = [];
  const starSize = size === "lg" ? 16 : 13;
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        size={starSize}
        fill={isFilled ? "#F59E0B" : "none"}
        color={isFilled ? "#F59E0B" : "var(--border)"}
        style={{ display: "inline-block", verticalAlign: "middle" }}
      />
    );
  }
  return (
    <span className="stars" style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
      {stars}
      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "4px" }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

// Avatar Component
export function Avatar({ initials, size = "md", color }) {
  const colors = [
    "linear-gradient(135deg, #059669, #047857)",
    "linear-gradient(135deg, #F59E0B, #D97706)",
    "linear-gradient(135deg, #374151, #1F2937)",
    "linear-gradient(135deg, #10B981, #059669)",
    "linear-gradient(135deg, #EA580C, #C2410C)",
  ];
  const bg = color || colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`avatar avatar-${size}`} style={{ background: bg, color: "white" }}>
      {initials}
    </div>
  );
}

// Queue Dots Visualization
export function QueueDots({ total, present, current = 0 }) {
  return (
    <div className="queue-visual">
      {Array.from({ length: Math.min(total, 12) }).map((_, i) => {
        let cls = "queue-dot";
        if (i === current) cls += " current";
        else if (i < present) cls += " present";
        else cls += " absent";
        return <span key={i} className={cls} title={i < present ? "Present" : "Not arrived"} />;
      })}
      {total > 12 && <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>+{total - 12}</span>}
    </div>
  );
}

// Badge Component
export function Badge({ children, variant = "primary" }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// Simple Modal Sheet
export function ModalSheet({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        {title && (
          <h3 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
