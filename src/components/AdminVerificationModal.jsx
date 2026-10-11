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
  AlertCircle
} from "lucide-react";

export default function AdminVerificationModal({ isOpen, onClose }) {
  const { doctorApplications, approveDoctorApplication, rejectDoctorApplication } = useApp();

  if (!isOpen) return null;

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
        maxWidth: "580px",
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
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
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Medical Board Admin Portal
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Credential verification & doctor licensing management
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

        {/* Info Strip */}
        <div style={{
          background: "rgba(108, 99, 255, 0.06)",
          border: "1px solid rgba(108, 99, 255, 0.2)",
          borderRadius: "10px",
          padding: "10px 14px",
          marginBottom: "16px",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <AlertCircle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>
            Only verified applications with authentic Medical Council licenses may be approved into active practice.
          </span>
        </div>

        {/* Applications List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(!doctorApplications || doctorApplications.length === 0) ? (
            <div style={{
              textAlign: "center",
              padding: "36px 16px",
              background: "var(--bg-card)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
            }}>
              <FileText size={32} color="var(--text-muted)" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                No Pending Doctor Applications
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: "4px 0 0" }}>
                New practitioner applications will appear here for review.
              </p>
            </div>
          ) : (
            doctorApplications.map((app) => (
              <div key={app.id} style={{
                background: "var(--bg-card)",
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
                  background: "rgba(0,0,0,0.15)",
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
                      className="btn btn-secondary btn-sm"
                      onClick={() => rejectDoctorApplication(app.id, "Medical registration could not be confirmed with council")}
                      style={{ flex: 1, color: "var(--text-danger)" }}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                    <button
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
      </div>
    </div>
  );
}
