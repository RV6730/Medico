import { useApp } from "../context/AppContext";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Notifications</h1>
        {notifications.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => notifications.forEach((n) => dismissNotification(n.id))}>
            <CheckCheck size={14} /> Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ display: "inline-flex", padding: "16px", borderRadius: "50%", background: "rgba(5, 150, 105, 0.1)", marginBottom: "16px" }}>
            <Bell size={32} color="var(--primary)" />
          </div>
          <h3>All caught up!</h3>
          <p style={{ marginTop: "8px" }}>No new notifications</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {notifications.map((n) => (
            <div key={n.id} className="card animate-fadeInUp" style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <Bell size={16} style={{ color: "var(--primary-light)", flexShrink: 0, marginTop: "2px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.9375rem", color: "var(--text-primary)" }}>{n.message}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {new Date(n.time).toLocaleTimeString()}
                </div>
              </div>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem", padding: 0, lineHeight: 1 }}
                onClick={() => dismissNotification(n.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
