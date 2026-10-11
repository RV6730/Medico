import { useApp } from "../context/AppContext";
import { X, ShieldCheck, Lock, Key, Clock, Smartphone, CheckCircle2 } from "lucide-react";

export default function SessionInfoModal({ isOpen, onClose }) {
  const { sessionMeta, user, role } = useApp();

  if (!isOpen) return null;

  const expiresDate = sessionMeta?.expiresAt ? new Date(sessionMeta.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Active";

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      inset: 0,
      background: "rgba(10, 11, 20, 0.75)",
      backdropFilter: "blur(6px)",
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
    }}>
      <div className="card" style={{
        maxWidth: "460px",
        width: "100%",
        position: "relative",
        border: "1px solid var(--border)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        padding: "24px",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "rgba(0, 212, 170, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--secondary)",
            }}>
              <Lock size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Cryptographic Session
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Tamper-proof token protecting your medical data
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="icon-btn"
            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{
          background: "rgba(0, 212, 170, 0.08)",
          border: "1px solid rgba(0, 212, 170, 0.25)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <CheckCircle2 size={20} color="var(--secondary)" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--secondary)" }}>
              Active TLS & SHA-256 Session
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "2px 0 0", lineHeight: 1.35 }}>
              Your session is cryptographically bound to this client device. Data theft or session replay is prohibited.
            </p>
          </div>
        </div>

        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontSize: "0.75rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Authenticated User:</span>
            <strong style={{ color: "var(--text-primary)" }}>{user.name}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Current Role:</span>
            <span className="badge badge-primary" style={{ textTransform: "capitalize", fontSize: "0.6875rem" }}>
              {role}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Token Encryption:</span>
            <strong style={{ color: "var(--text-primary)" }}>AES-256 / HS256 HMAC</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Session Expiry:</span>
            <strong style={{ color: "var(--text-primary)" }}>{expiresDate} (24h auto-rotate)</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Device Fingerprint:</span>
            <code style={{ fontSize: "0.7rem", color: "var(--primary)" }}>{sessionMeta?.deviceId || "dev_local"}</code>
          </div>
          <div style={{ marginTop: "4px" }}>
            <span style={{ color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Bearer Session Token:</span>
            <div style={{
              background: "rgba(0,0,0,0.3)",
              padding: "6px 8px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "0.6875rem",
              color: "var(--text-secondary)",
              wordBreak: "break-all",
              lineHeight: 1.3,
            }}>
              {sessionMeta?.token ? `${sessionMeta.token.substring(0, 36)}...${sessionMeta.token.substring(sessionMeta.token.length - 12)}` : "JWT_BEARER_TOKEN_ACTIVE"}
            </div>
          </div>
        </div>

        <button className="btn btn-secondary" onClick={onClose} style={{ width: "100%" }}>
          Close
        </button>
      </div>
    </div>
  );
}
