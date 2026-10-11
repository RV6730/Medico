import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { StarRating, Avatar, Badge, QueueDots, ModalSheet } from "../components/UIKit";
import { MapPin, Clock, Users, Shield, ChevronLeft, CheckCircle, AlertCircle, Building2, Coins, PauseCircle, Calendar, Ban } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { calculateDistanceKm } from "../utils/geo";

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { doctors, user, addToQueue, deductWallet, pushNotification } = useApp();
  const [showBookModal, setShowBookModal] = useState(false);
  const [booked, setBooked] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const doc = doctors.find((d) => d.id === id);
  if (!doc) return <div className="page"><p>Doctor not found.</p></div>;

  const queueLen = doc.queue.length;
  const estimatedWait = queueLen * 15; // 15 min per patient

  const handleBook = () => {
    if (user.wallet.balance < user.wallet.minBalance + doc.consultationFee) {
      pushNotification("Insufficient wallet balance. Please deposit funds into your Health Wallet.");
      return;
    }
    const token = Math.floor(Math.random() * 900) + 100;
    const position = queueLen + 1;
    addToQueue(id, null, user.name, "General Consultation", {
      phone: user.phone,
      token,
      position,
      waitMin: position * 15,
    });
    deductWallet(doc.consultationFee, `Consultation booking - ${doc.name}`);
    setTokenInfo({ token, position, wait: position * 15 });
    setBooked(true);
    setShowBookModal(false);
    setShowQR(true);
    pushNotification(`Booking confirmed with ${doc.name}. Token #${token}. SMS dispatch scheduled to ${user.phone}`);
  };

  const canHandleSurgery = doc.capabilities.some((c) =>
    c.toLowerCase().includes("surgery") || c.toLowerCase().includes("cataract") || c.toLowerCase().includes("lasik")
  );

  return (
    <div style={{ paddingBottom: "24px" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 100%)",
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
      }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "16px", gap: "4px" }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <Avatar initials={doc.avatar} size="xl" />
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "1.4rem" }}>{doc.name}</h1>
            <p style={{ color: "var(--primary-light)", fontWeight: 600, marginTop: "2px" }}>{doc.specialty}</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: "4px" }}>{doc.experience} experience</p>
            <div style={{ marginTop: "8px" }}>
              <StarRating rating={doc.rating} size="lg" />
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginLeft: "8px" }}>({doc.reviews} reviews)</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap" }}>
          <Badge variant={doc.availableToday ? "success" : "muted"}>
            {doc.availableToday ? "Available Today" : "Not Today"}
          </Badge>
          {canHandleSurgery && (
            <Badge variant="primary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Shield size={12} /> Surgery Capable
            </Badge>
          )}
          <Badge variant="muted" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={12} /> {calculateDistanceKm(user.lat, user.lng, doc.lat, doc.lng)} km away
          </Badge>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Info Cards */}
        <div className="grid-2" style={{ marginBottom: "20px" }}>
          {[
            { icon: <Building2 size={24} color="var(--primary-light)" />, label: "Hospital", val: doc.hospital },
            { icon: <Clock size={24} color="var(--primary-light)" />, label: "Next Available", val: doc.nextSlot },
            { icon: <Coins size={24} color="var(--primary-light)" />, label: "Consultation Fee", val: `₹${doc.consultationFee}` },
            { icon: <Users size={24} color="var(--primary-light)" />, label: "People in Queue", val: `${queueLen} patients` },
          ].map((info, i) => (
            <div key={i} className="card" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div>{info.icon}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>{info.label}</div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>{info.val}</div>
            </div>
          ))}
        </div>

        {/* Capabilities */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Shield size={16} style={{ color: "var(--primary-light)" }} />
            <h3>Specializations & Capabilities</h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {doc.capabilities.map((cap, i) => (
              <span key={i} className="pill active" style={{ cursor: "default" }}>{cap}</span>
            ))}
          </div>
          {!canHandleSurgery && (
            <div style={{
              marginTop: "12px",
              background: "rgba(255,159,67,0.1)",
              border: "1px solid rgba(255,159,67,0.3)",
              borderRadius: "10px",
              padding: "10px 12px",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              fontSize: "0.8125rem",
            }}>
              <AlertCircle size={14} style={{ color: "var(--accent-orange)", flexShrink: 0 }} />
              <span style={{ color: "var(--accent-orange)" }}>
                This doctor is not qualified for surgical procedures. For surgery, we recommend Dr. Priya Sharma.
              </span>
            </div>
          )}
        </div>

        {/* Queue Status */}
        <div className="card" style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Users size={16} style={{ color: "var(--primary-light)" }} />
            <h3>Live Queue Status</h3>
            <span className="badge badge-success" style={{ marginLeft: "auto" }}>LIVE</span>
          </div>
          <QueueDots total={Math.max(queueLen + 2, 6)} present={queueLen} current={doc.currentPatient ? 0 : -1} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current wait</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{estimatedWait} min</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Patients ahead</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{queueLen}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Avg per patient</div>
              <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>~15 min</div>
            </div>
          </div>
        </div>

        {/* QR Code if booked */}
        {booked && tokenInfo && (
          <div className="card card-glow" style={{ textAlign: "center", marginBottom: "20px", background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(245,158,11,0.06))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
              <CheckCircle size={20} style={{ color: "var(--secondary)" }} />
              <h3 style={{ color: "var(--secondary)" }}>Booking Confirmed!</h3>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "3rem", fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: "var(--text-primary)" }}>
                #{tokenInfo.token}
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Your Queue Token</div>
            </div>
            <div className="qr-container">
              <QRCodeSVG
                value={`MEDICO|DOC:${doc.id}|TOKEN:${tokenInfo.token}|USER:${user.id}|POS:${tokenInfo.position}`}
                size={140}
                bgColor="#FFFFFF"
                fgColor="#0A0B14"
                level="H"
              />
            </div>
            <p style={{ marginTop: "12px", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Show this QR at reception • SMS confirmation sent to {user.phone}
            </p>
            <div style={{ marginTop: "12px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} /> Position: <strong style={{ color: "var(--text-primary)" }}>#{tokenInfo.position}</strong>
              </span>
              <span style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> Wait: <strong style={{ color: "var(--text-primary)" }}>~{tokenInfo.wait} min</strong>
              </span>
            </div>
            <button className="btn btn-secondary btn-full" style={{ marginTop: "16px" }} onClick={() => navigate("/patient/queue")}>
              <Users size={16} /> View My Queue
            </button>
          </div>
        )}

        {/* Book Button */}
        {!booked && (
          <button
            className="btn btn-primary btn-full btn-lg"
            disabled={!doc.availableToday || doc.onBreak}
            onClick={() => setShowBookModal(true)}
          >
            {doc.onBreak ? (
              <><PauseCircle size={18} /> Doctor on Break</>
            ) : doc.availableToday ? (
              <><Calendar size={18} /> Book Appointment</>
            ) : (
              <><Ban size={18} /> Check Tomorrow</>
            )}
          </button>
        )}
      </div>

      {/* Booking Modal */}
      <ModalSheet open={showBookModal} onClose={() => setShowBookModal(false)} title="Confirm Booking">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ background: "var(--bg-surface)" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <Avatar initials={doc.avatar} size="md" />
              <div>
                <div style={{ fontWeight: 700 }}>{doc.name}</div>
                <div style={{ color: "var(--primary-light)", fontSize: "0.875rem" }}>{doc.specialty}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="transaction-item" style={{ paddingTop: 0 }}>
              <span style={{ color: "var(--text-secondary)" }}>Consultation Fee</span>
              <span style={{ fontWeight: 700 }}>₹{doc.consultationFee}</span>
            </div>
            <div className="transaction-item">
              <span style={{ color: "var(--text-secondary)" }}>Fine if cancelled/no-show</span>
              <span style={{ fontWeight: 700, color: "var(--text-danger)" }}>₹{Math.round(doc.consultationFee * 0.2)}</span>
            </div>
            <div className="transaction-item" style={{ borderBottom: "none" }}>
              <span style={{ color: "var(--text-secondary)" }}>Wallet Balance</span>
              <span style={{ fontWeight: 700, color: user.wallet.balance >= doc.consultationFee ? "var(--text-success)" : "var(--text-danger)" }}>
                ₹{user.wallet.balance}
              </span>
            </div>
          </div>

          <div style={{ background: "rgba(255,159,67,0.08)", border: "1px solid rgba(255,159,67,0.2)", borderRadius: "10px", padding: "10px 12px", fontSize: "0.8125rem", color: "var(--accent-orange)" }}>
            Notice: A fine of ₹{Math.round(doc.consultationFee * 0.2)} will be charged if you cancel or don't show up. Refund only on account deletion.
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowBookModal(false)}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleBook}>
              <CheckCircle size={18} /> Confirm & Pay
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
