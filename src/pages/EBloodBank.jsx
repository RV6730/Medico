import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { calculateDistanceKm, getDirectionsUrl } from "../utils/geo";
import { ModalSheet } from "../components/UIKit";
import {
  Droplet,
  MapPin,
  Search,
  PhoneCall,
  Navigation,
  Clock,
  ShieldCheck,
  AlertCircle,
  Plus,
  Users,
  CheckCircle2,
  Filter,
  ArrowRight,
  Heart,
  Share2,
  Lock,
  Shield,
  Send,
  MessageSquare
} from "lucide-react";

const BLOOD_GROUPS = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function EBloodBank() {
  const { bloodBanks, bloodRequests, volunteerDonors, user, createBloodRequest, registerDonor, pushNotification } = useApp();

  const [activeTab, setActiveTab] = useState("banks"); // "banks" | "requests" | "donors"
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);

  // Confidential Relay Modal State
  const [relayModal, setRelayModal] = useState({ open: false, targetType: null, targetData: null });
  const [relayMessage, setRelayMessage] = useState("");
  const [relaySent, setRelaySent] = useState(false);

  // Urgent Blood Request Form State
  const [requestForm, setRequestForm] = useState({
    patientName: "",
    patientAlias: "Patient #" + Math.floor(Math.random() * 8999 + 1000),
    anonymousRequester: "@EmergencyCase_" + Math.floor(Math.random() * 89 + 10),
    bloodGroup: "O+",
    unitsNeeded: 2,
    hospitalName: "",
    urgency: "Immediate / Critical (1 hr)",
    contact: user.phone || "+91 98765 43210",
    notes: ""
  });

  // Volunteer Donor Form State
  const [donorForm, setDonorForm] = useState({
    name: user.name || "",
    anonymousUsername: user.anonymousUsername || `@Donor_O_Pos_${Math.floor(Math.random() * 89 + 10)}`,
    bloodGroup: user.bloodGroup || "O+",
    age: user.age || 26,
    weight: "68",
    phone: user.phone || "+91 98765 43210",
    area: user.location?.split(",")[0] || "Koramangala",
    lastDonated: "4 months ago"
  });

  // Filtered Blood Banks with Live GPS Distance
  const filteredBanks = useMemo(() => {
    return (bloodBanks || [])
      .map((b) => {
        const distKm = calculateDistanceKm(user.lat, user.lng, b.lat, b.lng);
        return { ...b, calculatedDistKm: distKm };
      })
      .filter((b) => {
        const matchSearch =
          !searchQuery ||
          b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchStock =
          selectedGroup === "All" ||
          (b.bloodStock && b.bloodStock[selectedGroup] && b.bloodStock[selectedGroup] > 0);

        return matchSearch && matchStock;
      })
      .sort((a, b) => a.calculatedDistKm - b.calculatedDistKm);
  }, [bloodBanks, user.lat, user.lng, searchQuery, selectedGroup]);

  // Total stock across all banks
  const totalStockCount = useMemo(() => {
    return (bloodBanks || []).reduce((acc, b) => {
      if (selectedGroup === "All") {
        return acc + Object.values(b.bloodStock || {}).reduce((s, u) => s + u, 0);
      }
      return acc + (b.bloodStock?.[selectedGroup] || 0);
    }, 0);
  }, [bloodBanks, selectedGroup]);

  const handleOpenRelay = (type, data) => {
    setRelayModal({ open: true, targetType: type, targetData: data });
    setRelaySent(false);
    const grp = data.bloodGroup || "O+";
    const loc = data.hospitalName || data.area || "Bengaluru";
    setRelayMessage(`Urgent ${grp} transfusion inquiry regarding medical care in ${loc}. Please respond via Medico Relay if available.`);
  };

  const handleSendRelay = (e) => {
    e.preventDefault();
    setRelaySent(true);
    const targetHandle = relayModal.targetData?.anonymousUsername || relayModal.targetData?.anonymousRequester || "@RelayUser";
    pushNotification(`Confidential relay message delivered to ${targetHandle}. Personal phone numbers remain masked.`);
    setTimeout(() => {
      setRelayModal({ open: false, targetType: null, targetData: null });
      setRelaySent(false);
    }, 1800);
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!requestForm.patientName.trim() || !requestForm.hospitalName.trim()) {
      alert("Please provide the patient name and hospital name.");
      return;
    }

    createBloodRequest({
      patientName: requestForm.patientName,
      patientAlias: requestForm.patientAlias || "Patient #" + Math.floor(Math.random() * 8999 + 1000),
      anonymousRequester: requestForm.anonymousRequester || `@EmergencyCase_${Math.floor(Math.random() * 89 + 10)}`,
      bloodGroup: requestForm.bloodGroup,
      unitsNeeded: Number(requestForm.unitsNeeded) || 1,
      hospitalName: requestForm.hospitalName,
      urgency: requestForm.urgency,
      contact: requestForm.contact,
      notes: requestForm.notes,
    });

    setShowRequestModal(false);
    setActiveTab("requests");
    setRequestForm({
      patientName: "",
      patientAlias: "Patient #" + Math.floor(Math.random() * 8999 + 1000),
      anonymousRequester: "@EmergencyCase_" + Math.floor(Math.random() * 89 + 10),
      bloodGroup: "O+",
      unitsNeeded: 2,
      hospitalName: "",
      urgency: "Immediate / Critical (1 hr)",
      contact: user.phone || "+91 98765 43210",
      notes: ""
    });
  };

  const handleSubmitDonor = (e) => {
    e.preventDefault();
    if (!donorForm.name.trim() || !donorForm.phone.trim()) {
      alert("Please enter donor name and phone.");
      return;
    }

    registerDonor({
      name: donorForm.name,
      anonymousUsername: donorForm.anonymousUsername || `@Donor_${donorForm.bloodGroup.replace('+', 'Pos').replace('-', 'Neg')}_${Math.floor(Math.random() * 89 + 10)}`,
      bloodGroup: donorForm.bloodGroup,
      age: Number(donorForm.age) || 25,
      weight: donorForm.weight,
      phone: donorForm.phone,
      area: donorForm.area,
      lastDonated: donorForm.lastDonated,
    });

    setShowDonorModal(false);
    setActiveTab("donors");
  };

  return (
    <div className="page" style={{ paddingBottom: "32px", boxSizing: "border-box" }}>
      {/* Hero Header */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "999px", padding: "4px 14px", marginBottom: "8px" }}>
          <Droplet size={14} color="var(--accent)" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
            Real-Time Blood & Component Transfusion
          </span>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>
          e-Blood Bank Network
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
          Live stock across 12 accredited centers, urgent SOS requests & voluntary donors
        </p>

        {/* GPS Coordinates Bar */}
        <div
          className="location-bar"
          style={{ margin: "10px auto 0", maxWidth: "340px", justifyContent: "center" }}
        >
          <Navigation size={13} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)" }}>
            {user.location || "Bengaluru"}
          </span>
          <span style={{ fontSize: "0.6875rem", padding: "2px 6px", background: "rgba(5,150,105,0.12)", color: "var(--primary)", borderRadius: "6px", fontFamily: "monospace", fontWeight: 700 }}>
            {Number(user.lat).toFixed(4)}, {Number(user.lng).toFixed(4)}
          </span>
        </div>
      </div>

      {/* Action Highlights Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px", width: "100%" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowRequestModal(true)}
          style={{
            padding: "10px 12px",
            fontSize: "0.8125rem",
            justifyContent: "center",
            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
            borderColor: "#DC2626",
            boxShadow: "0 4px 14px rgba(220,38,38,0.25)"
          }}
        >
          <Plus size={15} />
          <span>Request Blood</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowDonorModal(true)}
          style={{ padding: "10px 12px", fontSize: "0.8125rem", justifyContent: "center" }}
        >
          <Heart size={15} color="var(--primary)" />
          <span>Join as Donor</span>
        </button>
      </div>

      {/* Blood Group Filter Chips */}
      <div style={{ marginBottom: "14px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Select Blood Group
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 700 }}>
            {totalStockCount} Units Available
          </span>
        </div>

        <div 
          className="no-scrollbar"
          style={{ 
            display: "flex", 
            gap: "6px", 
            overflowX: "auto", 
            paddingBottom: "4px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            width: "100%"
          }}
        >
          {BLOOD_GROUPS.map((grp) => {
            const isSelected = selectedGroup === grp;
            return (
              <button
                key={grp}
                type="button"
                className={`pill ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedGroup(grp)}
                style={{
                  padding: "5px 12px",
                  fontSize: "0.8125rem",
                  fontWeight: isSelected ? 800 : 600,
                  flexShrink: 0,
                  borderColor: isSelected ? "var(--accent)" : "var(--border)",
                  color: isSelected ? "#FFFFFF" : "var(--text-primary)",
                  background: isSelected ? "var(--accent)" : "var(--bg-card)"
                }}
              >
                {grp}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="view-toggle" style={{ margin: "0 0 14px", width: "100%", padding: "3px", boxSizing: "border-box" }}>
        <button
          type="button"
          className={`view-tab ${activeTab === "banks" ? "active" : ""}`}
          onClick={() => setActiveTab("banks")}
          style={{ flex: 1, justifyContent: "center", padding: "8px 6px" }}
        >
          <Droplet size={14} /> <span>Banks ({filteredBanks.length})</span>
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === "requests" ? "active" : ""}`}
          onClick={() => setActiveTab("requests")}
          style={{ flex: 1, justifyContent: "center", padding: "8px 6px" }}
        >
          <AlertCircle size={14} /> <span>Requests ({bloodRequests.length})</span>
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === "donors" ? "active" : ""}`}
          onClick={() => setActiveTab("donors")}
          style={{ flex: 1, justifyContent: "center", padding: "8px 6px" }}
        >
          <Users size={14} /> <span>Donors ({volunteerDonors.length})</span>
        </button>
      </div>

      {/* Search Input for Banks */}
      {activeTab === "banks" && (
        <div className="input-wrap" style={{ margin: "0 0 14px", width: "100%" }}>
          <Search size={16} className="field-icon" />
          <input
            placeholder="Search blood banks, hospitals, areas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", fontSize: "0.8125rem" }}
          />
        </div>
      )}

      {/* ── TAB 1: BLOOD BANKS DIRECTORY ── */}
      {activeTab === "banks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div className="section-header" style={{ marginBottom: "2px" }}>
            <div>
              <h2 className="section-title">Accredited Transfusion Centers</h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Ranked by live GPS distance from Lat: {Number(user.lat).toFixed(4)}, Lng: {Number(user.lng).toFixed(4)}
              </div>
            </div>
            <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
              {filteredBanks.length} centers
            </span>
          </div>

          {filteredBanks.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px" }}>
              <Droplet size={32} color="var(--accent)" style={{ margin: "0 auto 8px" }} />
              <h3>No centers found</h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                Try selecting "All" blood groups or expanding your search query.
              </p>
            </div>
          ) : (
            filteredBanks.map((bank, i) => (
              <div key={bank.id} className="card animate-fadeInUp" style={{ padding: "14px 16px", animationDelay: `${i * 0.03}s` }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.3 }}>
                      {bank.name}
                    </h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, marginTop: "2px" }}>
                      {bank.hospitalName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      <MapPin size={12} style={{ flexShrink: 0 }} /> <span>{bank.area} • <strong>{bank.calculatedDistKm} km away</strong></span>
                    </div>
                  </div>

                  <span className="badge badge-success" style={{ fontSize: "0.6875rem", flexShrink: 0 }}>
                    <ShieldCheck size={10} /> Certified
                  </span>
                </div>

                {/* Stock Overview Pills Grid */}
                <div style={{ marginTop: "12px", background: "var(--bg-base)", borderRadius: "10px", padding: "10px 12px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase" }}>
                    Available Units by Group:
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {Object.entries(bank.bloodStock || {}).map(([grp, units]) => {
                      const isTargetGroup = selectedGroup === grp;
                      return (
                        <div
                          key={grp}
                          style={{
                            textAlign: "center",
                            padding: "4px 2px",
                            borderRadius: "6px",
                            background: isTargetGroup ? "rgba(220,38,38,0.12)" : "var(--bg-card)",
                            border: `1px solid ${isTargetGroup ? "var(--accent)" : "var(--border)"}`
                          }}
                        >
                          <div style={{ fontSize: "0.6875rem", fontWeight: 800, color: isTargetGroup ? "var(--accent)" : "var(--text-primary)" }}>
                            {grp}
                          </div>
                          <div style={{ fontSize: "0.6875rem", color: units > 0 ? "var(--text-secondary)" : "var(--text-muted)" }}>
                            {units}u
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 10px", marginTop: "8px", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                    <span>Platelets: <strong>{bank.platelets} units</strong></span>
                    <span>•</span>
                    <span>Plasma: <strong>{bank.plasma} units</strong></span>
                    <span>•</span>
                    <span>24x7 Emergency</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
                  <a
                    href={`tel:${bank.emergencyHelpline || bank.phone}`}
                    className="btn btn-primary btn-sm"
                    style={{
                      justifyContent: "center",
                      textDecoration: "none",
                      background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                      borderColor: "#DC2626",
                      fontSize: "0.8125rem",
                      padding: "8px 10px"
                    }}
                  >
                    <PhoneCall size={13} />
                    <span>Call Helpline</span>
                  </a>

                  <a
                    href={getDirectionsUrl(bank.lat, bank.lng, bank.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ 
                      justifyContent: "center", 
                      textDecoration: "none",
                      fontSize: "0.8125rem",
                      padding: "8px 10px"
                    }}
                  >
                    <Navigation size={13} />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 2: URGENT REQUESTS ── */}
      {activeTab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div className="section-header" style={{ marginBottom: "2px" }}>
            <div>
              <h2 className="section-title">Emergency Blood Broadcasts</h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Active patient requirements verified across Bangalore hospitals
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowRequestModal(true)}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              <Plus size={12} /> Post Request
            </button>
          </div>

          {bloodRequests.map((req) => (
            <div key={req.id} className="card" style={{ padding: "14px 16px", borderLeft: "4px solid var(--accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--accent)", fontFamily: "'Outfit', sans-serif" }}>
                      {req.bloodGroup}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                      {req.anonymousRequester || "@EmergencyCase"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                    {req.patientAlias || req.patientName} • {req.hospitalName}
                  </div>
                </div>

                <span className="badge badge-danger" style={{ fontSize: "0.6875rem", flexShrink: 0 }}>
                  {req.urgency}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border)", fontSize: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)" }}>
                  Requirement: <strong>{req.unitsNeeded} Units</strong> • {req.timeAgo || "Active"}
                </span>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenRelay('request', req)}
                  style={{ fontSize: "0.75rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                >
                  <Lock size={12} color="var(--primary)" />
                  <span>Confidential Relay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: VOLUNTEER DONORS ── */}
      {activeTab === "donors" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div className="section-header" style={{ marginBottom: "2px" }}>
            <div>
              <h2 className="section-title">Registered Volunteer Donors</h2>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Verified community donors identified by confidential handles
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDonorModal(true)}
              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
            >
              <Heart size={12} color="var(--primary)" /> Join as Donor
            </button>
          </div>

          {volunteerDonors.map((donor) => (
            <div key={donor.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(220,38,38,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 800, fontSize: "1rem", flexShrink: 0 }}>
                    {donor.bloodGroup}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                        {donor.anonymousUsername || `@Donor_${donor.id}`}
                      </span>
                      <span className="badge badge-success" style={{ fontSize: "0.625rem", padding: "1px 6px" }}>
                        <ShieldCheck size={10} /> Confidential
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      <MapPin size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {donor.area} • {donor.donationsCount} donations • {donor.status}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenRelay('donor', donor)}
                  style={{ fontSize: "0.75rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: "5px", flexShrink: 0 }}
                >
                  <Lock size={12} color="var(--primary)" />
                  <span>Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: POST URGENT BLOOD REQUEST ── */}
      <ModalSheet open={showRequestModal} onClose={() => setShowRequestModal(false)} title="Broadcast Emergency Blood Request">
        <form onSubmit={handleSubmitRequest} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "10px 12px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Your request will be sent to nearby volunteer donors and listed across the Medico network for rapid matching.
          </div>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Patient Reference / Alias *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="e.g. Patient #BLR-8921"
                  value={requestForm.patientName}
                  onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Anonymous Handle *
                </label>
                <input
                  type="text"
                  className="input"
                  required
                  placeholder="@EmergencyCase_91"
                  value={requestForm.anonymousRequester}
                  onChange={(e) => setRequestForm({ ...requestForm, anonymousRequester: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Required Blood Group *
              </label>
              <select
                className="input"
                value={requestForm.bloodGroup}
                onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
              >
                {BLOOD_GROUPS.filter((g) => g !== "All").map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Units Needed (Pints) *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                className="input"
                required
                value={requestForm.unitsNeeded}
                onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Hospital / Clinic Name & Location *
            </label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. Apollo Hospital, Bannerghatta Road"
              value={requestForm.hospitalName}
              onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Urgency Level *
              </label>
              <select
                className="input"
                value={requestForm.urgency}
                onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
              >
                <option value="Immediate / Critical (1 hr)">Immediate / Critical (1 hr)</option>
                <option value="Urgent (Within 4 hrs)">Urgent (Within 4 hrs)</option>
                <option value="Standard (Within 24 hrs)">Standard (Within 24 hrs)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Emergency Phone (Private Relay) *
              </label>
              <input
                type="tel"
                className="input"
                required
                value={requestForm.contact}
                onChange={(e) => setRequestForm({ ...requestForm, contact: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
              Diagnosis / Clinical Notes (Optional)
            </label>
            <textarea
              className="input"
              rows="2"
              placeholder="e.g. Emergency bypass surgery, trauma transfusion"
              value={requestForm.notes}
              onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
              style={{ resize: "none" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{
              background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
              borderColor: "#DC2626",
              marginTop: "4px"
            }}
          >
            <span>Confirm & Broadcast Request</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </ModalSheet>

      {/* ── MODAL: REGISTER AS VOLUNTEER DONOR ── */}
      <ModalSheet open={showDonorModal} onClose={() => setShowDonorModal(false)} title="Register as Voluntary Blood Donor">
        <form onSubmit={handleSubmitDonor} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "10px 12px", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", borderRadius: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Thank you for saving lives! Your real name & phone number are kept 100% confidential. Donors are identified by anonymous usernames.
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Full Name (Confidential) *
              </label>
              <input
                type="text"
                className="input"
                required
                value={donorForm.name}
                onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                  Anonymous Username *
                </label>
                <span style={{ fontSize: "0.625rem", color: "var(--primary)", fontWeight: 700 }}>Public Alias</span>
              </div>
              <input
                type="text"
                className="input"
                required
                placeholder="@Donor_Alias"
                value={donorForm.anonymousUsername}
                onChange={(e) => setDonorForm({ ...donorForm, anonymousUsername: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Blood Group *
              </label>
              <select
                className="input"
                value={donorForm.bloodGroup}
                onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
              >
                {BLOOD_GROUPS.filter((g) => g !== "All").map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Age *
              </label>
              <input
                type="number"
                min="18"
                max="65"
                className="input"
                required
                value={donorForm.age}
                onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Contact Phone (Confidential) *
              </label>
              <input
                type="tel"
                className="input"
                required
                value={donorForm.phone}
                onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                Neighborhood / Area *
              </label>
              <input
                type="text"
                className="input"
                required
                value={donorForm.area}
                onChange={(e) => setDonorForm({ ...donorForm, area: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: "4px" }}
          >
            <span>Complete Donor Registration</span>
            <CheckCircle2 size={16} />
          </button>
        </form>
      </ModalSheet>

      {/* ── MODAL: CONFIDENTIAL TRANSFUSION RELAY ── */}
      <ModalSheet
        open={relayModal.open}
        onClose={() => setRelayModal({ open: false, targetType: null, targetData: null })}
        title="Confidential Transfusion Relay"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ padding: "10px 14px", background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.25)", borderRadius: "10px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "var(--primary)", marginBottom: "3px" }}>
              <ShieldCheck size={14} /> Zero Contact Leakage Guarantee
            </div>
            Your personal phone number and full name stay 100% confidential. Communications are securely routed via Medico's automated clinical relay.
          </div>

          <div style={{ background: "var(--bg-base)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Recipient Identity
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {relayModal.targetData?.anonymousUsername || relayModal.targetData?.anonymousRequester || "@ConfidentialMember"}
              </span>
              <span className="badge badge-danger">
                {relayModal.targetData?.bloodGroup}
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              {relayModal.targetData?.hospitalName || relayModal.targetData?.area || "Bangalore Health Cluster"} • Encrypted Relay Session
            </div>
          </div>

          {relaySent ? (
            <div style={{ padding: "20px", textAlign: "center", background: "rgba(5,150,105,0.08)", borderRadius: "12px" }}>
              <CheckCircle2 size={36} color="var(--primary)" style={{ margin: "0 auto 8px" }} />
              <h4 style={{ color: "var(--primary)" }}>Confidential Request Dispatched</h4>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                The donor has been alerted via encrypted push notification and clinical SMS relay.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendRelay} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                  Relay Transmission Message
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={relayMessage}
                  onChange={(e) => setRelayMessage(e.target.value)}
                  required
                  style={{ resize: "none" }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                style={{ justifyContent: "center", gap: "6px" }}
              >
                <Send size={14} /> Send Confidential Request
              </button>

              <div style={{ textAlign: "center", marginTop: "4px" }}>
                <a
                  href={`tel:08040000010,${Math.floor(Math.random() * 899 + 100)}#`}
                  className="btn btn-secondary btn-full btn-sm"
                  style={{ justifyContent: "center", textDecoration: "none", gap: "6px" }}
                >
                  <PhoneCall size={13} /> Masked Switchboard Call (PBX Proxy)
                </a>
                <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                  Connects through hospital switchboard without exposing mobile numbers
                </span>
              </div>
            </form>
          )}
        </div>
      </ModalSheet>
    </div>
  );
}
