import { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Stethoscope, 
  Building2, 
  FileText, 
  Award,
  AlertCircle,
  Lock,
  KeyRound,
  CheckCircle2,
  LogOut,
  AlertTriangle
} from "lucide-react";

export default function AdminVerificationModal({ isOpen, onClose }) {
  const { 
    doctorApplications, 
    approveDoctorApplication, 
    rejectDoctorApplication, 
    isAdmin, 
    verifyAdminPasskey, 
    exitAdminMode 
  } = useApp();

  const [passkeyInput, setPasskeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleAdminAuth = (e) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);

    const res = verifyAdminPasskey(passkeyInput);
    if (!res.success) {
      setAuthError(res.error || "Invalid Medical Board Security Passkey. Access Denied.");
    } else {
      setPasskeyInput("");
    }
    setIsVerifying(false);
  };

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.65)",
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
    }}>
      <div className="card" style={{
        maxWidth: "600px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        position: "relative",
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        boxShadow: "0 24px 48px rgba(15, 23, 42, 0.2)",
        padding: "24px",
        borderRadius: "16px",
        boxSizing: "border-box",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: isAdmin ? "rgba(5, 150, 105, 0.12)" : "rgba(220, 38, 38, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isAdmin ? "var(--primary)" : "var(--text-danger)",
            }}>
              {isAdmin ? <ShieldCheck size={24} /> : <Lock size={22} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                  Medical Board Admin Portal
                </h2>
                {isAdmin ? (
                  <span className="badge badge-success" style={{ fontSize: "0.65rem", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <CheckCircle2 size={11} /> Authorized Admin
                  </span>
                ) : (
                  <span className="badge badge-danger" style={{ fontSize: "0.65rem", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                    <Lock size={11} /> Restricted
                  </span>
                )}
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                {isAdmin ? "Medical Council credential audit & doctor verification active" : "Restricted access: Certified Medical Board administrators only"}
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

        {/* ACCESS GATE: If NOT verified as Admin */}
        {!isAdmin ? (
          <div style={{
            background: "rgba(248, 250, 252, 0.8)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              background: "rgba(220, 38, 38, 0.08)",
              color: "var(--text-danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px"
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>
              Administrator Authorization Required
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 16px" }}>
              Doctor credential verification and licensing is restricted exclusively to authorized Medical Board Council officials. Regular users and patients cannot review or approve practitioners.
            </p>

            <form onSubmit={handleAdminAuth} style={{ maxWidth: "380px", margin: "0 auto" }}>
              <div style={{ marginBottom: "12px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                  Medical Council Security Passkey
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    placeholder="Enter Medical Board Admin Passkey"
                    value={passkeyInput}
                    onChange={(e) => {
                      setPasskeyInput(e.target.value);
                      setAuthError("");
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: authError ? "1px solid var(--text-danger)" : "1px solid var(--border)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                      outline: "none",
                      background: "#FFFFFF",
                      color: "var(--text-primary)",
                      letterSpacing: "0.05em",
                    }}
                    required
                  />
                </div>
                {authError && (
                  <div style={{ fontSize: "0.75rem", color: "var(--text-danger)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertCircle size={12} /> {authError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={isVerifying}
                style={{ padding: "10px 16px", borderRadius: "10px", fontWeight: 700 }}
              >
                <KeyRound size={15} />
                <span>Verify Admin Authorization</span>
              </button>

              <div style={{
                marginTop: "14px",
                padding: "8px 12px",
                background: "rgba(5, 150, 105, 0.06)",
                borderRadius: "8px",
                fontSize: "0.72rem",
                color: "var(--primary)",
                fontWeight: 600,
                textAlign: "center"
              }}>
                Council Demo Key: <strong>ADMIN-MEDICO-2026</strong>
              </div>
            </form>
          </div>
        ) : (
          /* AUTHORIZED VIEW: Admin is verified */
          <>
            {/* Top Admin Controls Strip */}
            <div style={{
              background: "rgba(5, 150, 105, 0.06)",
              border: "1px solid rgba(5, 150, 105, 0.2)",
              borderRadius: "10px",
              padding: "10px 14px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.75rem", color: "var(--text-primary)", fontWeight: 600 }}>
                  Logged in as Verified Medical Board Officer
                </span>
              </div>
              <button
                type="button"
                onClick={exitAdminMode}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.72rem", padding: "4px 8px", color: "var(--text-danger)", borderColor: "rgba(220, 38, 38, 0.2)" }}
                title="Exit Admin Mode"
              >
                <LogOut size={12} />
                <span>Exit Admin</span>
              </button>
            </div>

            {/* Applications List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {(!doctorApplications || doctorApplications.length === 0) ? (
                <div style={{
                  textAlign: "center",
                  padding: "36px 16px",
                  background: "var(--bg-base)",
                  borderRadius: "14px",
                  border: "1px solid var(--border)",
                }}>
                  <FileText size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
                  <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                    No Pending Doctor Applications
                  </div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                    All practitioner registration requests have been reviewed.
                  </p>
                </div>
              ) : (
                doctorApplications.map((app) => (
                  <div key={app.id} style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "16px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 800, color: "var(--text-primary)" }}>
                          {app.applicantName}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
                          {app.specialty} • {app.experienceYears} yrs exp
                        </span>
                      </div>
                      <span className={`badge ${app.status === 'APPROVED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: "0.6875rem" }}>
                        {app.status === 'APPROVED' ? 'Verified & Active' : app.status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      fontSize: "0.75rem",
                      background: "#FFFFFF",
                      border: "1px solid var(--border)",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>License / Reg. No:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{app.registrationNumber}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>Medical Council:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{app.medicalCouncil}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>Degrees:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{app.qualifications}</strong>
                      </div>
                      <div>
                        <span style={{ color: "var(--text-muted)", display: "block" }}>Hospital:</span>
                        <strong style={{ color: "var(--text-primary)" }}>{app.hospital}</strong>
                      </div>
                    </div>

                    {app.status === "PENDING_VERIFICATION" && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => rejectDoctorApplication(app.id, "Medical registration could not be confirmed with council")}
                          style={{ flex: 1, color: "var(--text-danger)", borderColor: "rgba(220, 38, 38, 0.3)" }}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            approveDoctorApplication(app.id);
                          }}
                          style={{ flex: 1.5 }}
                        >
                          <CheckCircle size={14} />
                          Approve & Grant Doctor Role
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
