import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { calculateDistanceKm, getEstimatedAmbulanceEta } from "../utils/geo";
import { Phone, X, ShieldAlert, Ambulance, MapPin, Clock } from "lucide-react";

export default function EmergencyOverlay() {
  const { setEmergencyActive, triggerEmergency, hospitals, user } = useApp();
  const [called, setCalled] = useState(false);
  const [calledService, setCalledService] = useState(null);
  const [confirmStep, setConfirmStep] = useState(0);

  // Compute live nearest hospital ambulances using user's actual GPS coordinates
  const emergencyOptions = useMemo(() => {
    const hospitalAmbulances = (hospitals || [])
      .filter((h) => h.hasAmbulance)
      .map((h) => {
        const distKm = calculateDistanceKm(user.lat, user.lng, h.lat, h.lng);
        const eta = getEstimatedAmbulanceEta(distKm);
        return {
          id: h.id,
          name: `${h.name} Ambulance`,
          number: h.ambulancePhone || h.emergencyHelpline,
          type: `Hospital Fleet (${h.ambulanceFleet || 8} Active)`,
          distance: `${distKm} km`,
          distKm,
          eta,
          isHospital: true,
        };
      })
      .sort((a, b) => a.distKm - b.distKm);

    const nationalSOS = [
      {
        id: "sos_108",
        name: "National Emergency Ambulance",
        number: "108",
        type: "Free Government SOS",
        distance: "Central Dispatch",
        distKm: 0,
        eta: "10-15 mins",
        isHospital: false,
      },
      {
        id: "police_100",
        name: "Police Emergency Control",
        number: "100",
        type: "Police Rapid Response",
        distance: "City Patrol",
        distKm: 0,
        eta: "Immediate",
        isHospital: false,
      }
    ];

    return [...hospitalAmbulances, ...nationalSOS];
  }, [hospitals, user.lat, user.lng]);

  const handleCall = (contact) => {
    setCalledService(contact);
    setConfirmStep(1);
  };

  const handleConfirm = async () => {
    if (confirmStep === 1) {
      setConfirmStep(2);
    } else if (confirmStep === 2) {
      setCalled(true);
      await triggerEmergency(calledService);
      window.open(`tel:${calledService.number}`, "_self");
    }
  };

  return (
    <div className="emergency-overlay">
      <div className="emergency-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        <ShieldAlert size={48} color="#FF3B3B" className="spin-pulse" />
      </div>
      <h1 style={{ color: "#FF3B3B", fontFamily: "'Outfit', sans-serif", fontSize: "2rem", textAlign: "center", marginBottom: "4px" }}>
        EMERGENCY SOS
      </h1>
      <p style={{ color: "#9898B8", textAlign: "center", marginBottom: "20px", fontSize: "0.875rem" }}>
        Nearest ambulances prioritized by your current GPS location
      </p>

      {/* User Current GPS Location Notice */}
      <div style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "12px",
        padding: "8px 14px",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.75rem",
        color: "var(--text-secondary)",
        marginBottom: "20px",
      }}>
        <MapPin size={14} color="var(--primary-light)" />
        <span>Your Location: <strong>{user.location || "Bengaluru"}</strong> ({Number(user.lat).toFixed(4)}, {Number(user.lng).toFixed(4)})</span>
      </div>

      {called ? (
        <div style={{
          background: "rgba(255,59,59,0.1)",
          border: "1px solid rgba(255,59,59,0.4)",
          borderRadius: "20px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
          width: "100%",
          maxWidth: "400px",
        }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <Ambulance size={48} color="white" />
          </div>
          <h3 style={{ color: "white", marginBottom: "8px" }}>Connecting to {calledService?.name}</h3>
          <p style={{ color: "#9898B8" }}>{calledService?.number} • {calledService?.type}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "var(--secondary-light)", marginTop: "16px", fontWeight: 600 }}>
            <MapPin size={16} /> GPS Coordinates shared. Ambulance dispatched!
          </div>
        </div>
      ) : confirmStep > 0 ? (
        <div style={{
          background: "rgba(255,159,67,0.1)",
          border: "1px solid rgba(255,159,67,0.4)",
          borderRadius: "20px",
          padding: "24px",
          textAlign: "center",
          marginBottom: "24px",
          width: "100%",
          maxWidth: "400px",
        }}>
          <h3 style={{ color: "var(--accent-orange)", marginBottom: "10px" }}>
            {confirmStep === 1 ? "Confirm Ambulance Request" : "Final Verification"}
          </h3>
          <p style={{ color: "#9898B8", marginBottom: "16px", fontSize: "0.875rem" }}>
            {confirmStep === 1 
              ? `Do you want to call and request an ambulance from ${calledService?.name} (${calledService?.distance})?` 
              : `This will trigger an SMS SOS with your coordinates (${Number(user.lat).toFixed(4)}, ${Number(user.lng).toFixed(4)}) to dispatch teams immediately.`}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmStep(0)}>
              Cancel
            </button>
            <button className="btn btn-danger" style={{ flex: 1, justifyContent: "center" }} onClick={handleConfirm}>
              {confirmStep === 1 ? "Yes, Call" : "Dispatch Now"}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "420px", marginBottom: "20px", maxHeight: "50vh", overflowY: "auto", paddingRight: "4px" }}>
          {emergencyOptions.map((c) => (
            <button
              key={c.id}
              className="btn btn-danger btn-full"
              style={{ justifyContent: "space-between", padding: "14px 16px", borderRadius: "14px" }}
              onClick={() => handleCall(c)}
            >
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{c.name}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.85, display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span>{c.type}</span>
                  {c.isHospital && (
                    <>
                      <span>•</span>
                      <span><MapPin size={10} style={{ display: "inline" }} /> {c.distance}</span>
                      <span>•</span>
                      <span><Clock size={10} style={{ display: "inline" }} /> ~{c.eta}</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "1rem", fontWeight: 700 }}>
                <Phone size={16} /> {c.number}
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        className="btn btn-ghost"
        onClick={() => setEmergencyActive(false)}
        style={{ borderColor: "rgba(255,255,255,0.2)", color: "#9898B8" }}
      >
        <X size={16} /> Close Emergency Panel
      </button>
    </div>
  );
}
