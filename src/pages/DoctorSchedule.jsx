import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ModalSheet } from "../components/UIKit";
import { Clock, Calendar, Plus, Coffee, Bell } from "lucide-react";

const SCHEDULE_SLOTS = [
  { time: "09:00 AM", status: "done" },
  { time: "09:30 AM", status: "done" },
  { time: "10:00 AM", status: "current" },
  { time: "10:30 AM", status: "booked" },
  { time: "11:00 AM", status: "booked" },
  { time: "11:30 AM", status: "available" },
  { time: "12:00 PM", status: "break" },
  { time: "12:30 PM", status: "break" },
  { time: "01:00 PM", status: "available" },
  { time: "01:30 PM", status: "booked" },
  { time: "02:00 PM", status: "booked" },
  { time: "02:30 PM", status: "available" },
  { time: "03:00 PM", status: "available" },
  { time: "03:30 PM", status: "booked" },
  { time: "04:00 PM", status: "available" },
  { time: "04:30 PM", status: "available" },
];

const STATUS_CONFIG = {
  done: { label: "Done", color: "var(--text-muted)", bg: "rgba(255,255,255,0.04)" },
  current: { label: "Current", color: "var(--secondary)", bg: "rgba(245,158,11,0.12)" },
  booked: { label: "Booked", color: "var(--primary)", bg: "rgba(16,185,129,0.12)" },
  available: { label: "Available", color: "var(--text-secondary)", bg: "var(--bg-surface)" },
  break: { label: "Break", color: "var(--accent-orange)", bg: "rgba(249,115,22,0.1)" },
};

export default function DoctorSchedule() {
  const { doctors, activeDoctorId, startBreak, pushNotification } = useApp();
  const [showBreakModal, setShowBreakModal] = useState(false);
  const doc = doctors.find((d) => d.id === activeDoctorId);

  const booked = SCHEDULE_SLOTS.filter((s) => s.status === "booked").length;
  const done = SCHEDULE_SLOTS.filter((s) => s.status === "done").length;
  const available = SCHEDULE_SLOTS.filter((s) => s.status === "available").length;

  return (
    <div className="page">
      <h1 style={{ marginBottom: "8px" }}>My Schedule</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
        Saturday, October 10, 2026
      </p>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: "20px" }}>
        {[
          { label: "Done", val: done, color: "var(--text-muted)" },
          { label: "Booked", val: booked, color: "var(--primary-light)" },
          { label: "Available", val: available, color: "var(--secondary)" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ textAlign: "center", padding: "14px" }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", fontWeight: 800, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          onClick={() => setShowBreakModal(true)}
          disabled={doc?.onBreak}
        >
          <Coffee size={15} /> {doc?.onBreak ? "On Break" : "Add Break"}
        </button>
        <button
          className="btn btn-primary"
          style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
          onClick={() => pushNotification("All patients notified about updated schedule.")}
        >
          <Bell size={15} /> Notify Patients
        </button>
      </div>

      {/* Schedule Timeline */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} style={{ color: "var(--primary-light)" }} />
            <h3>Today's Timeline</h3>
          </div>
        </div>
        {SCHEDULE_SLOTS.map((slot, i) => {
          const cfg = STATUS_CONFIG[slot.status];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 20px",
                background: cfg.bg,
                borderBottom: i < SCHEDULE_SLOTS.length - 1 ? "1px solid var(--border)" : "none",
                transition: "var(--transition)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "80px", flexShrink: 0 }}>
                <Clock size={12} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>{slot.time}</span>
              </div>
              <div style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: cfg.color,
                flexShrink: 0,
                boxShadow: slot.status === "current" ? `0 0 8px ${cfg.color}` : "none",
              }} />
              <div style={{ fontWeight: 600, color: cfg.color, fontSize: "0.875rem" }}>
                {cfg.label}
              </div>
              {slot.status === "current" && (
                <span className="badge badge-success" style={{ marginLeft: "auto", fontSize: "0.7rem" }}>● Now</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Break Modal */}
      <ModalSheet open={showBreakModal} onClose={() => setShowBreakModal(false)} title="Schedule a Break">
        <p style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
          Select break duration. Queued patients will be automatically notified via SMS.
        </p>
        <div className="grid-2" style={{ gap: "10px", marginBottom: "12px" }}>
          {[5, 10, 15, 20, 30, 60].map((min) => (
            <button
              key={min}
              className="btn btn-secondary btn-full"
              onClick={() => {
                startBreak(activeDoctorId, min);
                setShowBreakModal(false);
                pushNotification(`Break scheduled for ${min} min. Patients notified via SMS.`);
              }}
            >
              {min < 60 ? `${min} min` : "1 hour"}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => setShowBreakModal(false)}>Cancel</button>
      </ModalSheet>
    </div>
  );
}
