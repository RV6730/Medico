import { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  X, 
  Stethoscope, 
  ShieldCheck, 
  FileCheck, 
  Building2, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { SPECIALTIES } from "../data/mockData";

export default function DoctorApplyModal({ isOpen, onClose }) {
  const { user, submitDoctorApplication, doctorApplications } = useApp();

  const userExistingApp = doctorApplications?.find(a => a.userId === user?.id);

  const [formData, setFormData] = useState({
    fullName: user?.name ? (user.name.startsWith("Dr.") ? user.name : `Dr. ${user.name}`) : "",
    registrationNumber: "",
    medicalCouncil: "",
    qualifications: "",
    specialty: "General Medicine",
    hospital: "",
    experienceYears: "",
    consultationFee: "500",
    idProofNumber: "",
    agreeToTerms: false,
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.registrationNumber.trim() || !formData.hospital.trim()) {
      alert("Please provide your Medical Registration Number and Hospital Affiliation.");
      return;
    }

    submitDoctorApplication({
      userId: user?.id || "user-id",
      applicantName: formData.fullName,
      email: user?.email || "",
      phone: user?.phone || "",
      registrationNumber: formData.registrationNumber,
      medicalCouncil: formData.medicalCouncil,
      qualifications: formData.qualifications,
      specialty: formData.specialty,
      hospital: formData.hospital,
      experienceYears: Number(formData.experienceYears) || 5,
      consultationFee: Number(formData.consultationFee) || 500,
      idProofNumber: formData.idProofNumber,
    });

    setSubmitted(true);
  };

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
        maxWidth: "520px",
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
              background: "rgba(108, 99, 255, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                Medical Practitioner Registration
              </h2>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "2px 0 0" }}>
                Verify your credentials to practice on Medico
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

        {/* Existing Application Banner */}
        {userExistingApp && !submitted ? (
          <div style={{
            background: userExistingApp.status === "APPROVED" ? "rgba(0, 212, 170, 0.1)" : "rgba(255, 159, 67, 0.1)",
            border: `1px solid ${userExistingApp.status === "APPROVED" ? "rgba(0, 212, 170, 0.3)" : "rgba(255, 159, 67, 0.3)"}`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              {userExistingApp.status === "APPROVED" ? (
                <CheckCircle2 size={18} color="var(--secondary)" />
              ) : (
                <AlertCircle size={18} color="var(--text-warning)" />
              )}
              <span style={{ 
                fontWeight: 800, 
                fontSize: "0.875rem", 
                color: userExistingApp.status === "APPROVED" ? "var(--secondary)" : "var(--text-warning)" 
              }}>
                {userExistingApp.status === "APPROVED" ? "Doctor Credentials Verified" : "Application Pending Admin Review"}
              </span>
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
              {userExistingApp.status === "APPROVED" ? (
                `Your medical profile for ${userExistingApp.specialty} at ${userExistingApp.hospital} is verified and active!`
              ) : (
                `Application ID: ${userExistingApp.id}. Submitted to Medico Board Admin. Review usually takes 2-4 hours.`
              )}
            </p>
          </div>
        ) : null}

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(0, 212, 170, 0.12)",
              color: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
              Application Submitted to Admin
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "20px" }}>
              Your credentials (License #{formData.registrationNumber}) have been routed to the Medico Medical Board Admin queue. Once approved, your account will instantly unlock Doctor Mode.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ width: "100%" }}>
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              background: "rgba(108, 99, 255, 0.05)",
              border: "1px dashed rgba(108, 99, 255, 0.3)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span>
                All medical practitioners must verify their state license before consulting patients or managing queue tokens.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>Full Practitioner Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Medical License / Reg. No.</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    placeholder="e.g. MCI-2018-98432"
                    required
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Medical Council</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.medicalCouncil}
                    onChange={(e) => setFormData({ ...formData, medicalCouncil: e.target.value })}
                    placeholder="e.g. Karnataka Medical Council"
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "10px" }}>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Specialization</label>
                  <select
                    className="input-field"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  >
                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Experience (Yrs)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                    min="1"
                    max="60"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>Degrees & Qualifications</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="e.g. MBBS, MD (Medicine), Fellowship in Cardiology"
                  required
                />
              </div>

              <div>
                <label className="input-label" style={{ fontSize: "0.75rem" }}>Hospital or Clinic Affiliation</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="e.g. Apollo Hospital / LifeCare Clinic"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Consultation Fee (₹)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    min="100"
                    step="50"
                    required
                  />
                </div>
                <div>
                  <label className="input-label" style={{ fontSize: "0.75rem" }}>Govt ID Proof Doc #</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.idProofNumber}
                    onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                    placeholder="e.g. MED-ID-8849-IN"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <input
                type="checkbox"
                id="docTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                required
              />
              <label htmlFor="docTerms" style={{ fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                I certify under penalty of medical board action that I hold an authentic, active medical practice license.
              </label>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                Submit to Admin for Verification
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
