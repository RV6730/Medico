import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Activity, 
  MapPin, 
  CheckCircle, 
  User, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Stethoscope, 
  Navigation, 
  Droplet,
  ArrowRight,
  Sparkles,
  Globe,
  Heart,
  ShieldCheck
} from "lucide-react";
import { POPULAR_LOCALITIES } from "../data/mockData";

export default function Login() {
  const { registerPatient, handleLogin, fetchLocation, isFetchingLocation, doctors } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState("patient"); // "patient" | "doctor"

  // Registration Form State
  const [formData, setFormData] = useState({
    name: "Sujay Sharma",
    phone: "+91 98765 43210",
    email: "sujay@example.com",
    age: "26",
    gender: "Male",
    bloodGroup: "O+",
    willingToDonateBlood: true,
    anonymousUsername: "@Donor_O_Pos_77",
    condition: "None",
    location: "Koramangala, Bengaluru",
    lat: 12.9352,
    lng: 77.6245,
  });

  const [locationDetected, setLocationDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("d1");

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "bloodGroup" && prev.anonymousUsername.startsWith("@Donor_")) {
        const bgClean = value.replace("+", "Pos").replace("-", "Neg");
        next.anonymousUsername = `@Donor_${bgClean}_${Math.floor(Math.random() * 89 + 10)}`;
      }
      return next;
    });
  };

  const handleDetectLocation = async () => {
    const locResult = await fetchLocation();
    if (locResult && locResult.city) {
      setFormData((prev) => ({
        ...prev,
        location: locResult.city,
        lat: locResult.lat || 12.9352,
        lng: locResult.lng || 77.6245,
      }));
      setLocationDetected(true);
    }
  };

  const handleSubmitPatient = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }

    setIsSubmitting(true);
    registerPatient({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      age: Number(formData.age) || 26,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      willingToDonateBlood: formData.willingToDonateBlood,
      anonymousUsername: formData.anonymousUsername || `@Donor_${formData.bloodGroup.replace('+', 'Pos').replace('-', 'Neg')}_${Math.floor(Math.random() * 89 + 10)}`,
      condition: formData.condition,
      location: formData.location || "Bengaluru",
      lat: formData.lat,
      lng: formData.lng,
    });

    setIsSubmitting(false);
    navigate("/patient/home");
  };

  const handleDoctorLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleLogin("doctor");
    setIsSubmitting(false);
    navigate("/doctor");
  };

  return (
    <div className="login-screen">
      {/* Brand Header */}
      <div className="login-header">
        <div className="brand-badge">
          <Activity size={28} className="brand-icon" />
          <span className="brand-name">Medico</span>
        </div>
        <h2>Smart Hospital & Queue System</h2>
        <p className="brand-subtitle">
          Real-time queue tracking, nearest top hospitals & SMS token alerts
        </p>

        {/* Role Toggle */}
        <div className="role-switcher">
          <button
            type="button"
            className={`role-tab ${mode === "patient" ? "active" : ""}`}
            onClick={() => setMode("patient")}
          >
            <User size={16} /> Patient Onboarding
          </button>
          <button
            type="button"
            className={`role-tab ${mode === "doctor" ? "active" : ""}`}
            onClick={() => setMode("doctor")}
          >
            <Stethoscope size={16} /> Doctor Portal
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="login-card">
        {mode === "patient" ? (
          <form onSubmit={handleSubmitPatient} className="reg-form">
            <div className="form-section-header">
              <Sparkles size={16} color="var(--secondary)" />
              <span>Step 1: Patient Details</span>
            </div>

            {/* Name */}
            <div className="input-field">
              <label>Full Name</label>
              <div className="input-wrap">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid-2-sm">
              <div className="input-field">
                <label>Mobile Number (for SMS Alerts)</label>
                <div className="input-wrap">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <Mail size={18} className="field-icon" />
                  <input
                    type="email"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Age, Gender, Blood Group */}
            <div className="grid-3-sm">
              <div className="input-field">
                <label>Age</label>
                <input
                  type="number"
                  className="input-plain"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  min="1"
                  max="120"
                />
              </div>

              <div className="input-field">
                <label>Gender</label>
                <select
                  className="input-plain"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-field">
                <label>Blood Group</label>
                <select
                  className="input-plain"
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange("bloodGroup", e.target.value)}
                >
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Blood Donation Willingness Question */}
            <div style={{
              background: "linear-gradient(135deg, rgba(220,38,38,0.06), rgba(5,150,105,0.04))",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: "14px",
              padding: "16px",
              marginTop: "4px"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Droplet size={18} color="var(--accent)" />
                  <strong style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>
                    Are you willing to donate blood?
                  </strong>
                </div>
                <span className="badge badge-danger" style={{ fontSize: "0.6875rem" }}>Life Saver</span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.4 }}>
                Help trauma & emergency surgery patients in your area. Your identity and personal phone number will remain 100% confidential.
              </p>

              {/* Yes / No Toggle */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  className={`btn ${formData.willingToDonateBlood ? "btn-primary" : "btn-secondary"}`}
                  style={{
                    padding: "9px 12px",
                    fontSize: "0.8125rem",
                    justifyContent: "center",
                    background: formData.willingToDonateBlood ? "var(--accent)" : "var(--bg-card)",
                    borderColor: formData.willingToDonateBlood ? "var(--accent)" : "var(--border)",
                    color: formData.willingToDonateBlood ? "#FFFFFF" : "var(--text-secondary)",
                    fontWeight: formData.willingToDonateBlood ? 700 : 500
                  }}
                  onClick={() => handleInputChange("willingToDonateBlood", true)}
                >
                  <Heart size={14} style={{ display: "inline" }} /> Yes, I want to help
                </button>
                <button
                  type="button"
                  className={`btn btn-secondary`}
                  style={{
                    padding: "9px 12px",
                    fontSize: "0.8125rem",
                    justifyContent: "center",
                    background: !formData.willingToDonateBlood ? "var(--bg-surface)" : "var(--bg-card)",
                    borderColor: !formData.willingToDonateBlood ? "var(--text-muted)" : "var(--border)",
                    color: !formData.willingToDonateBlood ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: !formData.willingToDonateBlood ? 700 : 500
                  }}
                  onClick={() => handleInputChange("willingToDonateBlood", false)}
                >
                  Not at this time
                </button>
              </div>

              {formData.willingToDonateBlood && (
                <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed rgba(220,38,38,0.2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Anonymous Donor Username (Confidential)
                    </label>
                    <span style={{ fontSize: "0.6875rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "3px", fontWeight: 600 }}>
                      <ShieldCheck size={12} /> Confidential Handle
                    </span>
                  </div>
                  <div className="input-wrap">
                    <User size={16} className="field-icon" />
                    <input
                      type="text"
                      value={formData.anonymousUsername}
                      onChange={(e) => handleInputChange("anonymousUsername", e.target.value)}
                      placeholder="@Donor_Alias"
                      required={formData.willingToDonateBlood}
                    />
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "4px" }}>
                    Patients and blood banks can only contact you via this anonymous handle to safeguard your privacy.
                  </div>
                </div>
              )}
            </div>

            {/* GPS & Network Location Box */}
            <div className="location-permission-box">
              <div className="loc-box-header">
                <div className="loc-title">
                  <Navigation size={18} color="var(--primary-light)" />
                  <div>
                    <strong>Location Detection</strong>
                    <p>Required to match nearest hospitals & calculate wait times</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleDetectLocation}
                  disabled={isFetchingLocation}
                >
                  {isFetchingLocation ? (
                    <span className="spin-pulse">Detecting...</span>
                  ) : (
                    <>
                      <MapPin size={14} /> Detect Location
                    </>
                  )}
                </button>
              </div>

              <div className="loc-display">
                <MapPin size={16} className={locationDetected ? "text-success" : "text-muted"} />
                <input
                  type="text"
                  className="loc-input"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Or enter city / area manually"
                />
                {locationDetected && (
                  <span className="verified-pill">
                    <CheckCircle size={12} /> Set
                  </span>
                )}
              </div>

              {/* Quick Select Locality Chips */}
              <div style={{ marginTop: "10px" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Quick Locality Selection (Tap to set):
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {POPULAR_LOCALITIES.map((loc) => {
                    const isSelected = formData.location.includes(loc.name);
                    return (
                      <button
                        key={loc.name}
                        type="button"
                        className={`pill ${isSelected ? "active" : ""}`}
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            location: `${loc.name}, Bengaluru`,
                            lat: loc.lat,
                            lng: loc.lng,
                          }));
                          setLocationDetected(true);
                        }}
                        style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                      >
                        <MapPin size={10} /> {loc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="loc-coords" style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>Exact Coordinates:</span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Lat:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lat}
                    onChange={(e) => handleInputChange("lat", parseFloat(e.target.value) || 12.9352)}
                    style={{ width: "85px", padding: "3px 6px", fontSize: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  />
                  <label style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Lng:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.lng}
                    onChange={(e) => handleInputChange("lng", parseFloat(e.target.value) || 77.6245)}
                    style={{ width: "85px", padding: "3px 6px", fontSize: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg mt-16"
              disabled={isSubmitting}
            >
              <span>Complete Setup & Enter</span>
              <ArrowRight size={18} />
            </button>

            {/* Direct Bypass: Jump directly to Doctors & Hospitals Directory */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  registerPatient({
                    name: formData.name || "Guest Patient",
                    phone: formData.phone || "+91 98765 43210",
                    email: formData.email || "guest@medico.app",
                    age: Number(formData.age) || 26,
                    gender: formData.gender || "Male",
                    bloodGroup: formData.bloodGroup || "O+",
                    condition: formData.condition || "None",
                    location: formData.location || "Bengaluru",
                    lat: Number(formData.lat) || 12.9352,
                    lng: Number(formData.lng) || 77.6245,
                  });
                  navigate("/patient/home");
                }}
                style={{ color: "var(--primary-light)", fontSize: "0.8125rem", width: "100%", fontWeight: 600 }}
              >
                Explore 15 Hospitals & 26 Doctors Directly →
              </button>
            </div>
          </form>
        ) : (
          /* Doctor Sign In Form */
          <form onSubmit={handleDoctorLogin} className="reg-form">
            <div className="form-section-header">
              <ShieldAlert size={16} color="var(--primary-light)" />
              <span>Doctor Verification & Sign In</span>
            </div>

            <div className="input-field">
              <label>Select Verified Practicing Doctor</label>
              <select
                className="input-plain select-doc"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialty} ({d.hospital})
                  </option>
                ))}
              </select>
            </div>

            <div className="doctor-badge-info card mt-12">
              <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                Hospital Queue Management
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Access live patient tokens, call next patient in line, take scheduled clinical breaks, and review uploaded reports.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg mt-16"
              disabled={isSubmitting}
            >
              <span>Access Doctor Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>

      <div className="login-footer">
        <span>Protected with HIPAA compliant data standards & End-to-End SMS alerts</span>
      </div>
    </div>
  );
}
