import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, ModalSheet, QueueDots } from "../components/UIKit";
import { useNavigate } from "react-router-dom";
import { Play, Pause, SkipForward, Coffee, ArrowRight, Users, Clock, CheckCircle, FileText, CheckCircle2 } from "lucide-react";

const BREAK_OPTIONS = [5, 10, 15, 30];

export default function DoctorQueue() {
  const { doctors, activeDoctorId, nextPatient, startBreak, transferPatient, patients, pushNotification } = useApp();
  const navigate = useNavigate();
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [breakTimer, setBreakTimer] = useState(null);
  const [breakSeconds, setBreakSeconds] = useState(0);

  const doc = doctors.find((d) => d.id === activeDoctorId);

  // Countdown for break
  useEffect(() => {
    if (!doc?.onBreak || !doc?.breakUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((new Date(doc.breakUntil) - Date.now()) / 1000));
      setBreakSeconds(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [doc?.onBreak, doc?.breakUntil]);

  if (!doc) return <div className="page"><p>Doctor not found.</p></div>;

  const queue = doc.queue || [];
  const currentObj = queue[0];
  const currentPid = currentObj?.patientId || currentObj; 
  // Fallback if currentObj is string (mock data) vs object (backend data)
  const currentPatient = typeof currentObj === 'object' ? currentObj : (currentPid ? patients[currentPid] : null);
  const otherDocs = doctors.filter((d) => d.id !== activeDoctorId);

  const handleNextPatient = () => {
    nextPatient(activeDoctorId);
    pushNotification(`Called next patient. SMS sent to their mobile.`);
  };

  const handleBreak = (minutes) => {
    startBreak(activeDoctorId, minutes);
    setShowBreakModal(false);
    pushNotification(`Break started for ${minutes} minutes. Patients will be notified.`);
  };

  const handleTransfer = (toDoctorId) => {
    if (!selectedPatient) return;
    transferPatient(activeDoctorId, selectedPatient, toDoctorId);
    setShowTransferModal(false);
    setSelectedPatient(null);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="page">
      {/* Doctor Header */}
      <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "24px" }}>
        <Avatar initials={doc.avatar} size="lg" />
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: "2px" }}>{doc.name}</h2>
          <p style={{ color: "var(--primary-light)", fontSize: "0.875rem" }}>{doc.specialty}</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "6px", alignItems: "center" }}>
            <span className={`status-dot ${doc.onBreak ? "break" : "online"}`} />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              {doc.onBreak ? "On Break" : "Active"}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: "8px" }}>
              <Users size={12} style={{ display: "inline" }} /> {queue.length} in queue
            </span>
          </div>
        </div>
      </div>

      {/* Break Banner */}
      {doc.onBreak && (
        <div className="break-timer" style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "4px" }}>Break ends in</div>
          <div className="break-countdown">{formatTime(breakSeconds)}</div>
          <p style={{ marginTop: "8px", fontSize: "0.8125rem" }}>Patients have been notified via SMS.</p>
        </div>
      )}

      {/* Current Patient */}
      {currentPatient && !doc.onBreak && (
        <div className="card" style={{
          marginBottom: "20px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(245,158,11,0.06))",
          border: "1px solid rgba(16,185,129,0.3)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ● NOW CONSULTING
            </span>
          </div>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Avatar initials={currentPatient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)} size="md" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1.0625rem" }}>{currentPatient.name || currentPatient.patientName}</div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{currentPatient.condition}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>Age: {currentPatient.age || "—"}</div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(`/doctor/reports`)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FileText size={14} /> View Reports
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          className="btn btn-success"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={queue.length === 0 || doc.onBreak}
          onClick={handleNextPatient}
        >
          <SkipForward size={18} /> Next Patient
        </button>
        <button
          className="btn btn-secondary"
          disabled={doc.onBreak}
          onClick={() => setShowBreakModal(true)}
        >
          <Coffee size={16} /> Break
        </button>
      </div>

      {/* Queue Manager */}
      <div className="queue-manager">
        <div className="queue-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Today's Queue</h3>
            <span className="badge badge-primary">{queue.length} waiting</span>
          </div>
          <div style={{ marginTop: "12px" }}>
            <QueueDots total={queue.length + 1} present={queue.length} current={0} />
          </div>
        </div>

        {queue.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
              <CheckCircle2 size={44} color="var(--primary)" />
            </div>
            <h3 style={{ color: "var(--primary)" }}>Queue Empty</h3>
            <p style={{ marginTop: "8px" }}>All patients have been attended to.</p>
          </div>
        ) : (
          queue.map((qItem, i) => {
            const isObj = typeof qItem === 'object';
            const pid = isObj ? qItem.patientId : qItem;
            const p = isObj ? { name: qItem.patientName, condition: qItem.condition, age: "—", queueNum: qItem.queueNumber } : (patients[pid] || { name: `Patient ${i + 1}`, condition: "General Consultation", age: "—" });
            const isCurrent = i === 0;
            return (
              <div key={pid || i} className={`patient-queue-item ${isCurrent ? "current-patient" : ""}`}>
                <div className={`queue-position ${isCurrent ? "pos-1" : ""}`}>{isCurrent ? "1" : p.queueNum || (i + 1)}</div>
                <Avatar initials={p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{p.condition}</div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Clock size={11} style={{ display: "inline" }} /> ~{(i + 1) * 15}m
                  </span>
                  {isCurrent && (
                    <span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Current</span>
                  )}
                  {!isCurrent && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "4px 8px", fontSize: "0.7rem" }}
                      onClick={() => { setSelectedPatient(pid); setShowTransferModal(true); }}
                    >
                      <ArrowRight size={12} /> Refer
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Break Modal */}
      <ModalSheet open={showBreakModal} onClose={() => setShowBreakModal(false)} title="Take a Break">
        <p style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
          Patients will be notified via SMS about the delay. Choose break duration:
        </p>
        <div className="grid-2" style={{ gap: "10px", marginBottom: "16px" }}>
          {BREAK_OPTIONS.map((min) => (
            <button
              key={min}
              className="btn btn-secondary btn-full"
              onClick={() => handleBreak(min)}
            >
              <Coffee size={14} /> {min} Minutes
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => setShowBreakModal(false)}>Cancel</button>
      </ModalSheet>

      {/* Transfer/Refer Modal */}
      <ModalSheet open={showTransferModal} onClose={() => setShowTransferModal(false)} title="Refer Patient to Another Doctor">
        <p style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
          Select a doctor to transfer the patient's slot. Their shared reports will be forwarded.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {otherDocs.map((d) => (
            <div
              key={d.id}
              className="card"
              style={{ display: "flex", gap: "12px", alignItems: "center", cursor: "pointer" }}
              onClick={() => handleTransfer(d.id)}
            >
              <Avatar initials={d.avatar} size="sm" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--primary-light)" }}>{d.specialty}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{d.queue.length} in queue</div>
              </div>
              <ArrowRight size={16} style={{ color: "var(--primary-light)" }} />
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => setShowTransferModal(false)}>Cancel</button>
      </ModalSheet>
    </div>
  );
}
