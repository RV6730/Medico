import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Stethoscope, Building2, Droplet, ClipboardList, FileText, Calendar } from "lucide-react";

export default function BottomNav() {
  const { role, setEmergencyActive } = useApp();
  const navigate = useNavigate();
  const loc = useLocation();

  if (role === "doctor") {
    return (
      <nav className="bottom-nav bottom-nav-doctor">
        <div
          className={`nav-item ${loc.pathname === "/doctor" ? "active" : ""}`}
          onClick={() => navigate("/doctor")}
        >
          <span className="nav-icon"><ClipboardList size={20} /></span>
          <span className="nav-label">Queue</span>
        </div>
        <div
          className={`nav-item ${loc.pathname === "/doctor/reports" ? "active" : ""}`}
          onClick={() => navigate("/doctor/reports")}
        >
          <span className="nav-icon"><FileText size={20} /></span>
          <span className="nav-label">Reports</span>
        </div>
        <div
          className={`nav-item ${loc.pathname === "/doctor/schedule" ? "active" : ""}`}
          onClick={() => navigate("/doctor/schedule")}
        >
          <span className="nav-icon"><Calendar size={20} /></span>
          <span className="nav-label">Schedule</span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <div
        className={`nav-item ${loc.pathname === "/patient/home" || loc.pathname === "/patient/doctors" ? "active" : ""}`}
        onClick={() => navigate("/patient/home")}
      >
        <span className="nav-icon"><Stethoscope size={20} /></span>
        <span className="nav-label">Doctors</span>
      </div>

      <div
        className={`nav-item ${loc.pathname === "/patient/hospitals" ? "active" : ""}`}
        onClick={() => navigate("/patient/hospitals")}
      >
        <span className="nav-icon"><Building2 size={20} /></span>
        <span className="nav-label">Hospitals</span>
      </div>

      {/* Emergency SOS Button in the Center */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", top: "-6px", width: "100%", textAlign: "center" }}>
        <button
          className="emergency-fab"
          onClick={() => setEmergencyActive(true)}
          title="Emergency Ambulance SOS"
          aria-label="Emergency SOS"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M9.5 4C9.5 3.44772 9.94772 3 10.5 3H13.5C14.0523 3 14.5 3.44772 14.5 4V9.5H20C20.5523 9.5 21 9.94772 21 10.5V13.5C21 14.0523 20.5523 14.5 20 14.5H14.5V20C14.5 20.5523 13.0523 21 13.5 21H10.5C9.94772 21 9.5 20.5523 9.5 20V14.5H4C3.44772 14.5 3 14.0523 3 13.5V10.5C3 9.94772 3.44772 9.5 4 9.5H9.5V4Z"
              fill="#DC2626"
            />
          </svg>
        </button>
        <span style={{ fontSize: "0.625rem", fontWeight: 800, color: "var(--accent)", letterSpacing: "0.04em", marginTop: "2px" }}>
          SOS
        </span>
      </div>

      <div
        className={`nav-item ${loc.pathname === "/patient/blood-bank" ? "active" : ""}`}
        onClick={() => navigate("/patient/blood-bank")}
      >
        <span className="nav-icon"><Droplet size={20} /></span>
        <span className="nav-label">Blood Bank</span>
      </div>

      <div
        className={`nav-item ${loc.pathname === "/patient/queue" ? "active" : ""}`}
        onClick={() => navigate("/patient/queue")}
      >
        <span className="nav-icon"><ClipboardList size={20} /></span>
        <span className="nav-label">Queue</span>
      </div>
    </nav>
  );
}
