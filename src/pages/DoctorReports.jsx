import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, ModalSheet } from "../components/UIKit";
import { FileText, Plus, ArrowRight, CheckCircle, Eye } from "lucide-react";

const SHARED_REPORTS = [
  {
    id: "r1",
    patientId: "p1",
    patientName: "Ravi Kumar",
    fromDoctor: "Dr. Priya Sharma",
    fromDocId: "d1",
    date: "2026-10-09",
    type: "Pre-op Eye Assessment",
    findings: "Cataract grade III in left eye. Surgical intervention recommended within 2-4 weeks. Patient is fit for general anesthesia.",
    prescription: "Prednisolone eye drops 1% - 4x daily for 5 days pre-op",
    attachments: ["left_eye_scan.pdf", "vision_test_results.pdf"],
    sharedWith: [],
  },
  {
    id: "r2",
    patientId: "p2",
    patientName: "Meena Devi",
    fromDoctor: "Dr. Priya Sharma",
    fromDocId: "d1",
    date: "2026-10-08",
    type: "Glaucoma Follow-up",
    findings: "IOP: 18 mmHg (left), 16 mmHg (right). Slight deterioration in peripheral vision. Continue current medication.",
    prescription: "Timolol 0.5% eye drops - 2x daily",
    attachments: ["field_vision_test.pdf"],
    sharedWith: ["d2"],
  },
];

export default function DoctorReports() {
  const { doctors, activeDoctorId, pushNotification } = useApp();
  const [selected, setSelected] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToQueueModal, setShowAddToQueueModal] = useState(false);
  const [reports, setReports] = useState(SHARED_REPORTS);

  const doc = doctors.find((d) => d.id === activeDoctorId);
  const otherDocs = doctors.filter((d) => d.id !== activeDoctorId);

  const shareReport = (reportId, toDoctorId) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, sharedWith: [...(r.sharedWith || []), toDoctorId] }
          : r
      )
    );
    const toDoc = doctors.find((d) => d.id === toDoctorId);
    pushNotification(`Report shared with ${toDoc?.name}. Patient added to their queue.`);
    setShowShareModal(false);
    setSelected(null);
  };

  return (
    <div className="page">
      <h1 style={{ marginBottom: "8px" }}>Patient Reports</h1>
      <p style={{ marginBottom: "24px" }}>View and share patient reports across the care team.</p>

      {/* Shared Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
        {reports.map((r) => (
          <div
            key={r.id}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => setSelected(r)}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{
                width: "44px", height: "44px",
                background: "rgba(16,185,129,0.12)",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <FileText size={22} color="var(--primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{r.patientName}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--primary-light)", marginTop: "2px" }}>{r.type}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  By {r.fromDoctor} • {r.date}
                </div>
                {r.sharedWith.length > 0 && (
                  <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span className="badge badge-success">Shared</span>
                    {r.sharedWith.map((did) => {
                      const d = doctors.find((dd) => dd.id === did);
                      return d ? (
                        <span key={did} className="badge badge-muted">{d.name}</span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <Eye size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Collaborative Care Section */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(245,158,11,0.06))", border: "1px solid rgba(16,185,129,0.25)", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "12px" }}>Collaborative Clinical Care</h3>
        <p style={{ fontSize: "0.8125rem", marginBottom: "16px" }}>
          When two doctors work together, the second doctor can access the first doctor's reports
          directly and the patient can be added to the second doctor's queue automatically — no repeat visits!
        </p>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "var(--bg-surface)", borderRadius: "12px", padding: "14px" }}>
          <div style={{ textAlign: "center" }}>
            <Avatar initials="PS" size="md" />
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>Dr. Priya</div>
          </div>
          <div style={{ flex: 1, textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Clinical Records Shared
            <ArrowRight size={16} style={{ display: "inline-block", margin: "0 6px", color: "var(--primary)" }} />
            Auto-queued
          </div>
          <div style={{ textAlign: "center" }}>
            <Avatar initials="RN" size="md" />
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>Dr. Rakesh</div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selected && (
        <ModalSheet
          open={!!selected}
          onClose={() => setSelected(null)}
          title="Patient Report"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Avatar
                initials={selected.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                size="md"
              />
              <div>
                <div style={{ fontWeight: 700 }}>{selected.patientName}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--primary-light)" }}>{selected.type}</div>
              </div>
            </div>

            <div className="report-card">
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>CLINICAL FINDINGS</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{selected.findings}</p>
            </div>

            <div className="report-card">
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>PRESCRIPTION</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{selected.prescription}</p>
            </div>

            <div className="report-card">
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px" }}>ATTACHMENTS</div>
              {selected.attachments.map((att, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: i < selected.attachments.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <FileText size={14} style={{ color: "var(--primary-light)" }} />
                  <span style={{ fontSize: "0.8125rem", color: "var(--primary-light)" }}>{att}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => { setShowShareModal(true); }}
              >
                <ArrowRight size={14} /> Share & Add to Queue
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Share to Doctor Modal */}
      <ModalSheet open={showShareModal} onClose={() => setShowShareModal(false)} title="Share Report & Add to Queue">
        <p style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
          Select a doctor. The report will be shared and the patient added to their waiting list.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {otherDocs.map((d) => {
            const alreadyShared = selected?.sharedWith?.includes(d.id);
            return (
              <div
                key={d.id}
                className="card"
                style={{ display: "flex", gap: "12px", alignItems: "center", cursor: alreadyShared ? "default" : "pointer", opacity: alreadyShared ? 0.6 : 1 }}
                onClick={() => !alreadyShared && shareReport(selected?.id, d.id)}
              >
                <Avatar initials={d.avatar} size="sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--primary-light)" }}>{d.specialty}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{d.queue.length} in queue</div>
                </div>
                {alreadyShared
                  ? <CheckCircle size={16} style={{ color: "var(--secondary)" }} />
                  : <ArrowRight size={16} style={{ color: "var(--primary-light)" }} />
                }
              </div>
            );
          })}
        </div>
        <button className="btn btn-ghost btn-full" style={{ marginTop: "12px" }} onClick={() => setShowShareModal(false)}>
          Cancel
        </button>
      </ModalSheet>
    </div>
  );
}
