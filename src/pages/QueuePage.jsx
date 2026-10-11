import { useState } from "react";
import { useApp } from "../context/AppContext";
import { QRCodeSVG } from "qrcode.react";
import { QueueDots, Avatar } from "../components/UIKit";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Bell, 
  CheckCircle2, 
  PauseCircle, 
  User, 
  MapPin, 
  Navigation, 
  Phone, 
  AlertTriangle, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
  Ticket,
  QrCode
} from "lucide-react";
import { ModalSheet } from "../components/UIKit";
import { getDirectionsUrl } from "../utils/geo";

export default function QueuePage() {
  const { doctors, user, cancelAppointment, createDemoAppointment } = useApp();
  const navigate = useNavigate();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [showQr, setShowQr] = useState(false);

  // Filter active appointments
  const activeAppointments = (user.appointments || []).filter(a => a.status !== "cancelled");
  const currentApt = activeAppointments.find(a => selectedAptId ? a.id === selectedAptId : true) || activeAppointments[0];

  // If active appointment exists, load doctor
  const doc = currentApt ? doctors.find(d => d.id === currentApt.doctorId) || {
    id: currentApt.doctorId,
    name: currentApt.doctorName,
    specialty: currentApt.doctorSpecialty,
    hospital: currentApt.hospital,
    avatar: currentApt.doctorAvatar || "DR",
    queue: ["p1", "p2", "p3"],
    consultationFee: currentApt.consultationFee || 300,
    onBreak: false,
  } : null;

  const myPosition = currentApt ? (currentApt.position || 3) : 0;
  const totalInQueue = doc ? Math.max(doc.queue.length, myPosition) : 0;
  const estimatedWait = currentApt ? Math.max(10, myPosition * 15) : 0;
  const token = currentApt ? currentApt.token : null;

  const handleCancelClick = () => {
    if (!currentApt) return;
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (!currentApt) return;
    cancelAppointment(currentApt.id);
    setShowCancelModal(false);
  };

  const cancellationFee = currentApt ? Math.round((currentApt.consultationFee || 300) * 0.2) : 60;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Live Queue Pass</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            Real-time outpatient position & contactless token
          </p>
        </div>
        {activeAppointments.length > 0 && (
          <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span className="status-dot online" style={{ width: 6, height: 6 }} /> Active Pass
          </span>
        )}
      </div>

      {/* Multiple Appointments Selector if user has > 1 */}
      {activeAppointments.length > 1 && (
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "10px", marginBottom: "12px" }}>
          {activeAppointments.map((apt) => (
            <button
              key={apt.id}
              className={`pill ${currentApt?.id === apt.id ? "active" : ""}`}
              onClick={() => setSelectedAptId(apt.id)}
            >
              Token #{apt.token} • {apt.doctorName}
            </button>
          ))}
        </div>
      )}

      {/* If No Active Appointment */}
      {!currentApt ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 20px", marginBottom: "20px" }}>
          <div style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(5,150,105,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto"
          }}>
            <Ticket size={32} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "8px" }}>No Active Queue Pass</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "320px", margin: "0 auto 20px auto", lineHeight: 1.5 }}>
            You haven't booked an appointment yet. Choose a doctor or hospital near you to generate your verified digital token.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "280px", margin: "0 auto" }}>
            <button className="btn btn-primary btn-full" onClick={() => navigate("/patient/home")}>
              <Stethoscope size={16} /> Browse Verified Doctors
            </button>
            <button className="btn btn-secondary btn-full" onClick={createDemoAppointment}>
              <Ticket size={16} /> Generate Demo Pass
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Medical Boarding Pass Card */}
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            overflow: "hidden",
            marginBottom: "20px"
          }}>
            {/* Boarding Pass Header */}
            <div style={{
              background: "linear-gradient(90deg, rgba(5,150,105,0.12), rgba(245,158,11,0.06))",
              padding: "12px 18px",
              borderBottom: "1px dashed var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  OPD DIGITAL HEALTHPASS
                </span>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem", marginTop: "1px" }}>
                  {doc.hospital}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Room / Station</span>
                <div style={{ fontWeight: 700, color: "var(--secondary)", fontSize: "0.875rem" }}>
                  OPD Suite 204
                </div>
              </div>
            </div>

            {/* Main Token Body */}
            <div style={{ padding: "18px 18px 16px", textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>
                  Live Queue Position
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", background: "rgba(5,150,105,0.1)", padding: "1px 8px", borderRadius: "6px" }}>
                  Token #{token}
                </span>
              </div>

              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "3rem",
                fontWeight: 900,
                color: "var(--primary-light)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em"
              }}>
                #{myPosition}
              </div>

              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "4px" }}>
                {myPosition === 1 ? "You are next to consult!" : `${myPosition - 1} patients currently ahead in queue`}
              </div>

              {/* QR Code Reveal Button & Expandable Container */}
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowQr((prev) => !prev)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    margin: "0 auto",
                    padding: "6px 14px",
                    fontSize: "0.75rem",
                    borderRadius: "8px",
                    background: showQr ? "rgba(5,150,105,0.1)" : "var(--bg-surface)",
                    borderColor: showQr ? "var(--primary)" : "var(--border)",
                    color: showQr ? "var(--primary)" : "var(--text-primary)",
                    fontWeight: 600
                  }}
                >
                  <QrCode size={14} color="var(--primary)" />
                  <span>{showQr ? "Hide QR Pass" : "Tap to View QR Code"}</span>
                </button>
              </div>

              {showQr && (
                <div className="animate-fadeIn" style={{
                  margin: "12px auto 6px",
                  padding: "14px 16px",
                  background: "#FFFFFF",
                  borderRadius: "14px",
                  display: "inline-block",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                  border: "1px solid var(--border)"
                }}>
                  <QRCodeSVG
                    value={`MEDICO|TOKEN:${token}|DOC:${doc.id}|POS:${myPosition}|USER:${user.id}`}
                    size={130}
                    bgColor="#FFFFFF"
                    fgColor="#0A0B14"
                    level="H"
                  />
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "6px", fontWeight: 500 }}>
                    Scan at Hospital Reception Desk
                  </div>
                </div>
              )}

              {/* 3 Metrics Row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "8px",
                marginTop: "16px",
                paddingTop: "14px",
                borderTop: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Est. Wait</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                    ~{estimatedWait}m
                  </div>
                </div>

                <div style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Ahead</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
                    {Math.max(0, myPosition - 1)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>Time Booked</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "var(--secondary)", marginTop: "3px" }}>
                    {currentApt.time || "10:30 AM"}
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div style={{
              background: "var(--bg-base)",
              padding: "16px 20px",
              borderTop: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                {[
                  { label: "Booked", done: true },
                  { label: "Waiting", done: true },
                  { label: "Next", done: myPosition <= 2 },
                  { label: "Consulting", done: myPosition === 1 },
                ].map((step, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 1 }}>
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: step.done ? "var(--primary)" : "var(--bg-card)",
                      border: `1.5px solid ${step.done ? "var(--primary)" : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: step.done ? "#FFFFFF" : "var(--text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: 800
                    }}>
                      {step.done ? <CheckCircle2 size={13} color="#FFFFFF" /> : idx + 1}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: step.done ? "var(--primary)" : "var(--text-muted)", fontWeight: step.done ? 700 : 500 }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doctor Brief Card */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <Avatar initials={doc.avatar} size="lg" />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{doc.name}</div>
                <div style={{ color: "var(--primary-light)", fontSize: "0.8125rem", fontWeight: 500 }}>{doc.specialty}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "2px" }}>{doc.hospital}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`badge ${doc.onBreak ? "badge-warning" : "badge-success"}`}>
                  {doc.onBreak ? "On Short Break" : "In Chamber"}
                </span>
              </div>
            </div>

            {doc.onBreak && (
              <div style={{
                marginTop: "14px",
                background: "rgba(255,159,67,0.08)",
                border: "1px solid rgba(255,159,67,0.25)",
                borderRadius: "10px",
                padding: "10px 12px",
                fontSize: "0.8125rem",
                color: "var(--accent-orange)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <PauseCircle size={16} style={{ flexShrink: 0 }} />
                <span>Doctor is on an 8-minute clinical consultation break. Tokens will resume shortly.</span>
              </div>
            )}

            {/* Action buttons: Directions & Helpline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
              <a
                href={getDirectionsUrl(doc.lat || 12.9352, doc.lng || 77.6245, doc.hospital)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: "center" }}
              >
                <Navigation size={14} /> Map Directions
              </a>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleCancelClick}
                style={{ justifyContent: "center", color: "var(--text-danger)", borderColor: "rgba(255,107,107,0.3)" }}
              >
                <AlertTriangle size={14} /> Cancel Slot
              </button>
            </div>
          </div>

          {/* SMS Notification Banner */}
          <div className="card" style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.2)", marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0,212,170,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>
                <Bell size={18} color="var(--secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                  SMS Alerts Dispatching
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  An alert will arrive at <strong>{user.phone}</strong> when you are 2 patients away.
                </div>
              </div>
              <CheckCircle2 size={18} color="var(--secondary)" style={{ flexShrink: 0 }} />
            </div>
          </div>
        </>
      )}

      {/* Cancellation Confirmation Modal */}
      <ModalSheet open={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Appointment">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "center", padding: "12px 8px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <div style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(255,107,107,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <AlertTriangle size={26} color="var(--text-danger)" />
              </div>
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Confirm Slot Cancellation</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Are you sure you wish to surrender Token <strong>#{token}</strong> with {doc?.name}?
            </p>
          </div>

          <div style={{
            background: "rgba(255,159,67,0.08)",
            border: "1px solid rgba(255,159,67,0.25)",
            borderRadius: "10px",
            padding: "12px 14px",
            fontSize: "0.8125rem",
            color: "var(--accent-orange)"
          }}>
            Under hospital queue regulations, late cancellation incurs a 20% clinical fine of <strong>₹{cancellationFee}</strong>, deducted from your health wallet.
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCancelModal(false)}>Keep Slot</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmCancel}>
              Confirm & Pay ₹{cancellationFee}
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
