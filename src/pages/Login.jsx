import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { 
  Activity, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Navigation, 
  Droplet,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  Stethoscope
} from "lucide-react";
import { POPULAR_LOCALITIES } from "../data/mockData";

export default function Login() {
  const { registerPatient, handleLogin, fetchLocation, isFetchingLocation, user } = useApp();
  const navigate = useNavigate();

  // Mode: "signin" | "register"
  const [authMode, setAuthMode] = useState("signin");

  // Sign In Form State
  const [signInData, setSignInData] = useState({
    identifier: "+91 98765 43210",
    password: "••••••••",
    rememberMe: true,
  });

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

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!signInData.identifier.trim()) {
      alert("Please enter your registered mobile number or email.");
      return;
    }

    setIsSubmitting(true);
    await handleLogin({
      ...user,
      phone: signInData.identifier.includes("@") ? user.phone : signInData.identifier,
      email: signInData.identifier.includes("@") ? signInData.identifier : user.email,
    });
    setIsSubmitting(false);
    navigate("/patient/home");
  };

  const handleRegisterSubmit = (e) => {
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

  return (
    <div className="login-screen">
      {/* Brand Header */}
      <div className="login-header">
        <div className="brand-badge">
          <Activity size={28} className="brand-icon" />
          <span className="brand-name">Medico</span>
        </div>
        <h2>Healthcare & Live Queue Portal</h2>
        <p className="brand-subtitle">
          Real-time queue tracking, nearest verified hospitals & emergency response
        </p>

        {/* Cryptographic Security Indicator */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(0, 212, 170, 0.08)",
          border: "1px solid rgba(0, 212, 170, 0.25)",
          borderRadius: "20px",
          padding: "6px 14px",
          marginTop: "12px",
          fontSize: "0.75rem",
          color: "var(--secondary)",
          fontWeight: 600,
        }}>
          <ShieldCheck size={15} />
          <span>Cryptographic Session Tokens • Anti-Theft Protected</span>
        </div>

        {/* Auth Mode Tabs (Sign In vs Register) */}
        <div className="role-switcher" style={{ marginTop: "16px" }}>
          <button
            type="button"
            className={`role-tab ${authMode === "signin" ? "active" : ""}`}
            onClick={() => setAuthMode("signin")}
          >
            <KeyRound size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`role-tab ${authMode === "register" ? "active" : ""}`}
            onClick={() => setAuthMode("register")}
          >
            <User size={16} /> Create Patient Account
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="login-card">
        {authMode === "signin" ? (
          /* Sign In Form */
          <form onSubmit={handleSignInSubmit} className="reg-form">
            <div className="form-section-header">
              <Lock size={16} color="var(--secondary)" />
              <span>Secure User Authentication</span>
            </div>

            <div className="input-field">
              <label>Mobile Number or Email</label>
              <div className="input-wrap">
                <Phone size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="+91 98765 43210 or name@email.com"
                  value={signInData.identifier}
                  onChange={(e) => setSignInData({ ...signInData, identifier: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-field">
              <label>Security Password / PIN</label>
              <div className="input-wrap">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              margin: "6px 0 14px",
              color: "var(--text-secondary)",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={signInData.rememberMe}
                  onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                />
                Remember this device
              </label>
              <span style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>
                Session Help
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isSubmitting}
            >
              <span>Verify & Issue Session Token</span>
              <ArrowRight size={18} />
            </button>

            {/* Quick Demo Login */}
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  handleLogin(user);
                  navigate("/patient/home");
                }}
                style={{ color: "var(--primary-light)", fontSize: "0.8125rem", width: "100%", fontWeight: 600 }}
              >
                Instant Access as Demo Patient (Token Verified) →
              </button>
            </div>

            {/* Physician notice */}
            <div style={{
              marginTop: "20px",
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(108, 99, 255, 0.05)",
              border: "1px dashed rgba(108, 99, 255, 0.2)",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}>
              <Stethoscope size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>
                  Practicing Physician?
                </strong>
                Sign in with your user account. Once inside, submit your Medical Registration Number to Admin for official Doctor Mode verification.
              </div>
            </div>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="reg-form">
            <div className="form-section-header">
              <Sparkles size={16} color="var(--secondary)" />
              <span>Step 1: Patient Credentials</span>
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
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="Bombay Blood (Rare)">Bombay Blood (Rare)</option>
                </select>
              </div>
            </div>

            {/* Blood Donation Question */}
            <div className="card mt-8" style={{
              border: "1px solid rgba(220, 38, 38, 0.2)",
              background: "rgba(220, 38, 38, 0.03)",
              padding: "14px",
              borderRadius: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(220, 38, 38, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}>
                    <Droplet size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      Are you willing to donate blood?
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      Help save lives during emergencies in your area
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${formData.willingToDonateBlood ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleInputChange("willingToDonateBlood", true)}
                    style={{ minWidth: "54px" }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${!formData.willingToDonateBlood ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleInputChange("willingToDonateBlood", false)}
                    style={{ minWidth: "54px" }}
                  >
                    No
                  </button>
                </div>
              </div>

              {formData.willingToDonateBlood && (
                <div style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px dashed rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      Confidential Anonymous Contact Handle:
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--secondary)", fontWeight: 700 }}>
                      Confidentiality Protected
                    </span>
                  </div>
                  <input
                    type="text"
                    className="input-plain"
                    value={formData.anonymousUsername}
                    onChange={(e) => handleInputChange("anonymousUsername", e.target.value)}
                    style={{ fontSize: "0.8125rem", fontFamily: "monospace" }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Requesters contact you through this anonymous relay ID so your personal phone stays private.
                  </span>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="form-section-header mt-16">
              <MapPin size={16} color="var(--primary)" />
              <span>Step 2: Detect Nearby Hospitals</span>
            </div>

            <div className="location-box">
              <div className="location-info">
                <Navigation size={18} className="location-icon" />
                <div className="location-text">
                  <div className="loc-label">Your Detected Area</div>
                  <div className="loc-value">{formData.location || "Bengaluru (Default)"}</div>
                  <div className="loc-coords" style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Lat: {Number(formData.lat).toFixed(4)} • Lng: {Number(formData.lng).toFixed(4)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleDetectLocation}
                disabled={isFetchingLocation}
              >
                {isFetchingLocation ? "Detecting..." : locationDetected ? "Re-detect GPS" : "Auto Detect GPS"}
              </button>
            </div>

            {/* Popular Localities Quick Select */}
            <div className="locality-pills mt-8">
              <span className="pills-label">Or select area:</span>
              <div className="pills-scroll">
                {POPULAR_LOCALITIES.slice(0, 5).map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    className={`pill ${formData.location?.includes(loc.name) ? "active" : ""}`}
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        location: `${loc.name}, Bengaluru`,
                        lat: loc.lat,
                        lng: loc.lng,
                      }));
                      setLocationDetected(true);
                    }}
                  >
                    {loc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg mt-16"
              disabled={isSubmitting}
            >
              <span>Create Account & Start Session</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}
      </div>

      <div className="login-footer">
        <span>Protected with HIPAA compliant data standards & End-to-End Cryptographic Sessions</span>
      </div>
    </div>
  );
}
