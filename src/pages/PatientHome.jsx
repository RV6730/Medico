import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { StarRating, Avatar, Badge, ModalSheet } from "../components/UIKit";
import { MEDICAL_TIPS, SYMPTOM_SPECIALTY_MAP, SPECIALTIES, POPULAR_LOCALITIES } from "../data/mockData";
import { calculateDistanceKm, getEstimatedAmbulanceEta, getDirectionsUrl } from "../utils/geo";
import { 
  MapPin, 
  Search, 
  Zap, 
  SlidersHorizontal, 
  Star, 
  Clock, 
  Users, 
  Stethoscope, 
  ClipboardList, 
  Wallet, 
  SearchX, 
  Building2, 
  PhoneCall, 
  Ambulance, 
  ShieldCheck,
  ChevronRight,
  Navigation,
  CheckCircle2,
  Crosshair,
  ArrowRight,
  Droplet
} from "lucide-react";

export default function PatientHome({ initialView = "doctors" }) {
  const { doctors, hospitals, bloodBanks, user, fetchLocation, isFetchingLocation, setLocationManual, setCoordinatesManual } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [viewMode, setViewMode] = useState(() => {
    if (initialView === "hospitals" || (typeof window !== "undefined" && window.location.pathname.includes("hospitals"))) {
      return "hospitals";
    }
    return "doctors";
  });

  const [search, setSearch] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState("All");
  const [ambulanceOnly, setAmbulanceOnly] = useState(false);
  const [showLocationSheet, setShowLocationSheet] = useState(false);

  // Manual GPS coordinates state
  const [customLat, setCustomLat] = useState(user.lat || 12.9352);
  const [customLng, setCustomLng] = useState(user.lng || 77.6245);

  useEffect(() => {
    setCustomLat(user.lat);
    setCustomLng(user.lng);
  }, [user.lat, user.lng]);

  useEffect(() => {
    if (initialView === "hospitals" || location.pathname.includes("/hospitals")) {
      setViewMode("hospitals");
    } else if (initialView === "doctors" || location.pathname.includes("/doctors")) {
      setViewMode("doctors");
    }
  }, [initialView, location.pathname]);

  // Advanced filters modal
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxDist, setMaxDist] = useState(30); // max km
  const [surgeryOnly, setSurgeryOnly] = useState(false);

  // Smart symptom matching
  const getMatchedSpecialty = (query) => {
    const q = query.toLowerCase();
    for (const [keyword, specialty] of Object.entries(SYMPTOM_SPECIALTY_MAP)) {
      if (q.includes(keyword)) return specialty;
    }
    return null;
  };

  const matchedSpecialty = search ? getMatchedSpecialty(search) : null;

  // Filtered Doctors with Live GPS Distance
  const filteredDoctors = doctors
    .map((d) => {
      const liveDist = calculateDistanceKm(user.lat, user.lng, d.lat, d.lng);
      return { ...d, calculatedDistKm: liveDist };
    })
    .filter((d) => {
      const matchSearch =
        !search ||
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialty.toLowerCase().includes(search.toLowerCase()) ||
        d.hospital.toLowerCase().includes(search.toLowerCase()) ||
        d.capabilities?.some((c) => c.toLowerCase().includes(search.toLowerCase()));

      const matchSpecialty = activeSpecialty === "All" || d.specialty === activeSpecialty;
      const matchHospital = selectedHospitalFilter === "All" || d.hospitalId === selectedHospitalFilter;
      const matchSymptom = !matchedSpecialty || d.specialty === matchedSpecialty;
      const matchRating = (d.rating || 0) >= minRating;
      const matchDist = d.calculatedDistKm <= maxDist;
      const matchSurgery = !surgeryOnly || d.canHandleSurgery;

      return matchSearch && matchSpecialty && matchHospital && matchRating && matchDist && matchSurgery && (search ? matchSymptom || matchSearch : true);
    })
    .sort((a, b) => a.calculatedDistKm - b.calculatedDistKm);

  // Filtered Hospitals with Live GPS Distance & Ambulance Status
  const filteredHospitals = (hospitals || [])
    .map((h) => {
      const liveDist = calculateDistanceKm(user.lat, user.lng, h.lat, h.lng);
      const eta = getEstimatedAmbulanceEta(liveDist);
      return { ...h, calculatedDistKm: liveDist, eta };
    })
    .filter((h) => {
      const matchSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.area.toLowerCase().includes(search.toLowerCase()) ||
        h.departments?.some((dep) => dep.toLowerCase().includes(search.toLowerCase())) ||
        h.facilities?.some((f) => f.toLowerCase().includes(search.toLowerCase()));

      const matchDist = h.calculatedDistKm <= maxDist;
      const matchRating = (h.rating || 0) >= minRating;
      const matchAmbulance = !ambulanceOnly || h.hasAmbulance;

      return matchSearch && matchDist && matchRating && matchAmbulance;
    })
    .sort((a, b) => a.calculatedDistKm - b.calculatedDistKm);

  return (
    <div style={{ paddingBottom: "16px" }}>
      {/* Hero Header */}
      <div className="hero-section">
        <p className="greeting-text">Welcome back,</p>
        <h1 className="hero-title">{user.name}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
          Find top hospitals, verified doctors & 24x7 ambulance services
        </p>

        <div 
          className="location-bar" 
          onClick={() => setShowLocationSheet(true)}
          style={{ cursor: "pointer", transition: "all 0.2s ease" }}
          title="Click to view exact GPS coordinates or change area"
        >
          <Navigation size={14} className={isFetchingLocation ? "spin-pulse" : "loc-icon"} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>
            {isFetchingLocation ? "Detecting GPS..." : user.location}
          </span>
          <span style={{ fontSize: "0.6875rem", padding: "2px 6px", background: "rgba(16,185,129,0.15)", color: "var(--primary)", borderRadius: "6px", fontFamily: "monospace", fontWeight: 700, flexShrink: 0 }}>
            {Number(user.lat).toFixed(4)}, {Number(user.lng).toFixed(4)}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", flexShrink: 0 }}>• Change</span>
        </div>
      </div>

      {/* Quick Stats Grid with 1-Tap Switching */}
      <div style={{ padding: "14px 18px 0" }}>
        <div className="grid-3">
          {[
            { 
              icon: <Building2 size={22} color="var(--primary)" />, 
              label: "Hospitals", 
              val: `${(hospitals || []).length}`,
              action: () => setViewMode("hospitals"),
              isActive: viewMode === "hospitals"
            },
            { 
              icon: <Stethoscope size={22} color="var(--secondary)" />, 
              label: "Doctors", 
              val: `${doctors.length}`,
              action: () => setViewMode("doctors"),
              isActive: viewMode === "doctors"
            },
            { 
              icon: <Droplet size={22} color="var(--accent)" />, 
              label: "Blood Bank", 
              val: `${(bloodBanks || []).length || 12}`,
              action: () => navigate("/patient/blood-bank"),
              isActive: false
            },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`card ${stat.isActive ? "card-glow" : ""}`} 
              onClick={stat.action}
              style={{ 
                padding: "12px 8px", 
                textAlign: "center", 
                cursor: "pointer", 
                borderColor: stat.isActive ? "var(--primary)" : "var(--border)",
                background: stat.isActive ? "rgba(16,185,129,0.08)" : "var(--bg-card)",
                transition: "all 0.2s ease"
              }}
              title={`Click to view ${stat.label}`}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{stat.val}</div>
              <div style={{ fontSize: "0.6875rem", color: stat.isActive ? "var(--primary)" : "var(--text-muted)", fontWeight: stat.isActive ? 700 : 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Segmented View Switcher: Doctors vs Hospitals */}
      <div className="view-toggle">
        <button
          type="button"
          className={`view-tab ${viewMode === "doctors" ? "active" : ""}`}
          onClick={() => setViewMode("doctors")}
        >
          <Stethoscope size={15} /> Find Doctors ({filteredDoctors.length})
        </button>
        <button
          type="button"
          className={`view-tab ${viewMode === "hospitals" ? "active" : ""}`}
          onClick={() => setViewMode("hospitals")}
        >
          <Building2 size={15} /> Top Hospitals ({(filteredHospitals || []).length})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-box">
        <div className="input-icon-wrap" style={{ flex: 1 }}>
          <Search size={18} className="icon search-icon" />
          <input
            className="input"
            placeholder={viewMode === "doctors" ? "Search doctors, symptoms, specialties..." : "Search hospitals, areas, facilities..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-secondary" 
          style={{ padding: "12px", flexShrink: 0 }}
          onClick={() => setShowFilters(true)}
          title="Open Filter Settings"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Quick Ambulance Toggle Filter (When browsing Hospitals) */}
      {viewMode === "hospitals" && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 18px 10px" }}>
          <button
            type="button"
            className={`pill ${ambulanceOnly ? "active" : ""}`}
            onClick={() => setAmbulanceOnly(!ambulanceOnly)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "6px 12px" }}
          >
            <Ambulance size={14} /> Has Ambulance Only
            {ambulanceOnly && <CheckCircle2 size={12} />}
          </button>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Sorted by nearest GPS distance
          </span>
        </div>
      )}

      {/* Smart Match Banner */}
      {matchedSpecialty && (
        <div style={{
          margin: "0 18px 12px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(245,158,11,0.06))",
          border: "1px solid rgba(16,185,129,0.25)",
          borderRadius: "14px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "fadeInUp 0.3s ease",
        }}>
          <Zap size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Smart Clinical Match: {matchedSpecialty}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Recommended specialists for your symptom query
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Department Filter (when in Doctor View) */}
      {viewMode === "doctors" && (
        <div className="specialty-scroll">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              className={`pill ${activeSpecialty === s ? "active" : ""}`}
              onClick={() => setActiveSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Cross-Directory Navigation Banner */}
      {viewMode === "doctors" ? (
        <div style={{
          margin: "0 18px 10px",
          background: "rgba(16,185,129,0.06)",
          border: "1px dashed rgba(16,185,129,0.3)",
          borderRadius: "12px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <Building2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Looking for Hospitals & Emergency ICU?
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewMode("hospitals")}
            style={{ flexShrink: 0, fontSize: "0.75rem", padding: "4px 10px", gap: "4px" }}
          >
            Top Hospitals ({filteredHospitals.length}) <ArrowRight size={12} />
          </button>
        </div>
      ) : (
        <div style={{
          margin: "0 18px 10px",
          background: "rgba(217,119,6,0.06)",
          border: "1px dashed rgba(217,119,6,0.3)",
          borderRadius: "12px",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <Stethoscope size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Looking for Doctor Consultation Tokens?
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewMode("doctors")}
            style={{ flexShrink: 0, fontSize: "0.75rem", padding: "4px 10px", gap: "4px" }}
          >
            Find Doctors ({filteredDoctors.length}) <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Main Content List */}
      <div style={{ padding: "8px 18px 14px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {viewMode === "doctors" ? (
          /* ── DOCTORS LIST ── */
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title">Verified Doctors Nearby</h2>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Ranked by GPS distance from Lat: {Number(user.lat).toFixed(4)}, Lng: {Number(user.lng).toFixed(4)}
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
                {filteredDoctors.length} doctors
              </span>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ marginBottom: "12px", background: "rgba(16,185,129,0.12)", padding: "16px", borderRadius: "50%" }}>
                  <SearchX size={32} color="var(--primary)" />
                </div>
                <h3>No doctors match criteria</h3>
                <p style={{ marginTop: "6px", fontSize: "0.8125rem" }}>Try expanding your distance or rating filter</p>
              </div>
            ) : (
              filteredDoctors.map((doc, i) => (
                <div
                  key={doc.id}
                  className="doctor-card animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.04}s` }}
                  onClick={() => navigate(`/patient/doctor/${doc.id}`)}
                >
                  <Avatar initials={doc.avatar} size="lg" />
                  <div className="doctor-info">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
                      <div>
                        <div className="doctor-name">{doc.name}</div>
                        <div className="doctor-specialty">{doc.specialty}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                          ₹{doc.consultationFee}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>per visit</div>
                      </div>
                    </div>

                    <div className="doctor-hospital">
                      <Building2 size={12} color="var(--primary-light)" /> {doc.hospital}
                    </div>

                    <div className="doctor-meta">
                      <StarRating rating={doc.rating} />
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({doc.reviews})</span>
                      <Badge variant={doc.availableToday ? "success" : "muted"}>
                        {doc.availableToday ? "Available" : "Tomorrow"}
                      </Badge>
                      {doc.canHandleSurgery && (
                        <Badge variant="primary">
                          <ShieldCheck size={10} /> Surgery
                        </Badge>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <MapPin size={11} /> {doc.calculatedDistKm} km
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Users size={11} /> {doc.queue?.length || 0} in queue
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <Clock size={11} /> {doc.nextSlot}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          /* ── HOSPITALS LIST ── */
          <>
            <div className="section-header">
              <div>
                <h2 className="section-title">Hospitals by Distance</h2>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Ranked by GPS distance from Lat: {Number(user.lat).toFixed(4)}, Lng: {Number(user.lng).toFixed(4)}
                </div>
              </div>
              <span className="badge badge-primary" style={{ fontSize: "0.75rem" }}>
                {filteredHospitals.length} centers
              </span>
            </div>

            {filteredHospitals.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ marginBottom: "12px", background: "rgba(16,185,129,0.12)", padding: "16px", borderRadius: "50%" }}>
                  <Building2 size={32} color="var(--primary)" />
                </div>
                <h3>No hospitals match criteria</h3>
                <p style={{ marginTop: "6px", fontSize: "0.8125rem" }}>Try expanding your distance or unchecking ambulance filter</p>
              </div>
            ) : (
              filteredHospitals.map((hosp, i) => (
                <div
                  key={hosp.id}
                  className="hospital-card animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className="hospital-header">
                    <div>
                      <div className="hospital-name">{hosp.name}</div>
                      <div className="hospital-type">{hosp.type}</div>
                      <div className="hospital-address">
                        <MapPin size={12} /> {hosp.area}, {hosp.city} • <strong>{hosp.calculatedDistKm} km away</strong>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                      <StarRating rating={hosp.rating} />
                      <span className="icu-pill">
                        {hosp.icuAvailable} ICU Beds Left
                      </span>
                    </div>
                  </div>

                  {/* Hospital Key Metrics */}
                  <div className="hospital-stats-bar">
                    <div className="stat-unit">
                      <span>Total Capacity</span>
                      <strong>{hosp.totalBeds} Beds</strong>
                    </div>
                    <div className="stat-unit">
                      <span>Ambulance Status</span>
                      <strong style={{ color: hosp.hasAmbulance ? "var(--secondary)" : "var(--text-muted)" }}>
                        {hosp.hasAmbulance ? `24x7 Active (${hosp.ambulanceFleet})` : "External SOS"}
                      </strong>
                    </div>
                    <div className="stat-unit">
                      <span>Arrival ETA</span>
                      <strong style={{ color: "var(--primary-light)" }}>
                        ~{hosp.eta}
                      </strong>
                    </div>
                  </div>

                  {/* Facilities Chips */}
                  <div className="facility-chips">
                    {hosp.hasAmbulance && (
                      <span className="facility-chip" style={{ background: "rgba(0,212,170,0.1)", borderColor: "rgba(0,212,170,0.3)", color: "var(--secondary)" }}>
                        <Ambulance size={11} style={{ marginRight: "4px", display: "inline" }} /> Dedicated Ambulance Fleet
                      </span>
                    )}
                    {(hosp.facilities || []).slice(0, 3).map((f, fi) => (
                      <span key={fi} className="facility-chip">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons: Ambulance Call, Directions & Doctors */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                    {hosp.hasAmbulance ? (
                      <a 
                        href={`tel:${hosp.ambulancePhone}`} 
                        className="btn btn-danger btn-sm"
                        style={{ width: "100%", justifyContent: "center", padding: "10px 12px" }}
                        title="Call Ambulance Hotline"
                      >
                        <Ambulance size={15} /> <span>Call Ambulance ({hosp.ambulancePhone})</span>
                      </a>
                    ) : (
                      <a 
                        href={`tel:${hosp.emergencyHelpline}`} 
                        className="btn btn-secondary btn-sm"
                        style={{ width: "100%", justifyContent: "center", padding: "10px 12px" }}
                      >
                        <PhoneCall size={15} /> <span>Helpline: {hosp.emergencyHelpline}</span>
                      </a>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <a
                        href={getDirectionsUrl(hosp.lat, hosp.lng, hosp.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ justifyContent: "center", padding: "10px 8px" }}
                        title="Open Navigation in Google Maps"
                      >
                        <Navigation size={14} /> <span>Directions</span>
                      </a>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ justifyContent: "center", padding: "10px 8px" }}
                        onClick={() => {
                          setSelectedHospitalFilter(hosp.id);
                          setViewMode("doctors");
                        }}
                      >
                        <span>Doctors</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* Health Tips Slider */}
      <div style={{ padding: "8px 18px 24px" }}>
        <div className="section-header">
          <h2 className="section-title">Daily Health Tips</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {MEDICAL_TIPS.slice(0, 3).map((tip, i) => (
            <div key={i} className="info-tip-card" onClick={() => navigate("/patient/info")}>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.875rem" }}>{tip.title}</div>
                <div style={{ fontSize: "0.78125rem", color: "var(--text-secondary)", marginTop: "2px" }}>{tip.tip}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filter Modal */}
      <ModalSheet open={showFilters} onClose={() => setShowFilters(false)} title="Filter Healthcare Services">
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingBottom: "16px" }}>
          
          {/* Hospital Filter */}
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "8px" }}>Hospital Network</div>
            <select
              className="input-plain"
              value={selectedHospitalFilter}
              onChange={(e) => setSelectedHospitalFilter(e.target.value)}
            >
              <option value="All">All Hospitals</option>
              {(hospitals || []).map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.area})</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "8px" }}>Department / Specialty</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  className={`pill ${activeSpecialty === s ? "active" : ""}`}
                  onClick={() => setActiveSpecialty(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "8px" }}>Minimum Rating</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {[0, 3.5, 4.0, 4.5].map((r) => (
                <button
                  key={r}
                  className={`pill ${minRating === r ? "active" : ""}`}
                  onClick={() => setMinRating(r)}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {r === 0 ? "Any" : <>{r}+ <Star size={12} className={minRating === r ? "filled" : ""} /></>}
                </button>
              ))}
            </div>
          </div>

          {/* Maximum Distance */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Maximum Distance</div>
              <div style={{ color: "var(--primary-light)", fontWeight: 700, fontSize: "0.875rem" }}>{maxDist} km</div>
            </div>
            <input 
              type="range" 
              min="1" 
              max="40" 
              value={maxDist} 
              onChange={(e) => setMaxDist(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--primary)" }}
            />
          </div>

          {/* Has Ambulance Only Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Has Dedicated Ambulance (24x7)</span>
            <input 
              type="checkbox"
              checked={ambulanceOnly}
              onChange={(e) => setAmbulanceOnly(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
          </div>

          {/* Surgery Only Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Surgery-Capable Doctors Only</span>
            <input 
              type="checkbox"
              checked={surgeryOnly}
              onChange={(e) => setSurgeryOnly(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={() => setShowFilters(false)}>
            Apply Filters
          </button>
        </div>
      </ModalSheet>

      {/* Location Selector Modal */}
      <ModalSheet open={showLocationSheet} onClose={() => setShowLocationSheet(false)} title="Location & GPS Coordinates">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Active GPS Coordinates Banner */}
          <div style={{ padding: "14px", background: "rgba(16,185,129,0.08)", borderRadius: "14px", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Navigation size={18} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>Active GPS Locked</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: "0.6875rem" }}>Live Accuracy</span>
            </div>

            <div style={{ fontSize: "0.8125rem", color: "var(--text-primary)", fontWeight: 600 }}>
              {user.location}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "0.75rem", fontFamily: "monospace", color: "var(--primary)" }}>
              <span>Latitude: <strong>{Number(user.lat).toFixed(5)}</strong></span>
              <span>Longitude: <strong>{Number(user.lng).toFixed(5)}</strong></span>
            </div>
          </div>

          {/* Auto Detect Live GPS Button */}
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={async () => {
              await fetchLocation();
              setShowLocationSheet(false);
            }}
            disabled={isFetchingLocation}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px" }}
          >
            <Crosshair size={18} className={isFetchingLocation ? "spin-pulse" : ""} />
            <span>{isFetchingLocation ? "Detecting High-Accuracy GPS..." : "Detect My Live GPS (Lat & Lng)"}</span>
          </button>

          {/* Manual Latitude & Longitude Input */}
          <div className="card" style={{ padding: "14px", background: "var(--bg-card)" }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
              Custom GPS Coordinates
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "10px" }}>
              Enter custom latitude and longitude coordinates to calculate live distance to all 15 hospitals & 26 doctors:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="input"
                  value={customLat}
                  onChange={(e) => setCustomLat(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 12.9716"
                  style={{ padding: "8px 10px", fontSize: "0.8125rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="input"
                  value={customLng}
                  onChange={(e) => setCustomLng(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 77.5946"
                  style={{ padding: "8px 10px", fontSize: "0.8125rem" }}
                />
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-full btn-sm"
              onClick={async () => {
                if (customLat && customLng) {
                  await setCoordinatesManual(customLat, customLng);
                  setShowLocationSheet(false);
                }
              }}
              style={{ fontWeight: 600 }}
            >
              Apply Exact Coordinates & Recalculate
            </button>
          </div>

          {/* Quick Locality Presets */}
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" }}>
              Healthcare Neighborhood Presets (With Coordinates)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {POPULAR_LOCALITIES.map((loc) => {
                const isSelected = user.location.includes(loc.name);
                return (
                  <button
                    key={loc.name}
                    type="button"
                    className={`card ${isSelected ? "card-glow" : ""}`}
                    onClick={() => {
                      setLocationManual(loc.name, loc.lat, loc.lng);
                      setShowLocationSheet(false);
                    }}
                    style={{
                      padding: "10px",
                      textAlign: "left",
                      cursor: "pointer",
                      borderColor: isSelected ? "var(--primary)" : "var(--border)",
                      background: isSelected ? "rgba(16,185,129,0.12)" : "var(--bg-card)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={12} color={isSelected ? "var(--primary)" : "var(--text-muted)"} />
                      <span style={{ fontWeight: 700, fontSize: "0.8125rem", color: isSelected ? "var(--primary)" : "var(--text-primary)" }}>
                        {loc.name}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.6875rem", fontFamily: "monospace", color: "var(--text-muted)", paddingLeft: "18px" }}>
                      {loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button className="btn btn-ghost btn-full" onClick={() => setShowLocationSheet(false)}>
            Close
          </button>
        </div>
      </ModalSheet>
    </div>
  );
}
