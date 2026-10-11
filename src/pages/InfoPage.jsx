import { useState, useMemo } from "react";
import { MEDICAL_TIPS } from "../data/mockData";
import { 
  Search, 
  ExternalLink, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  Sparkles, 
  Stethoscope, 
  HelpCircle, 
  FileText,
  Filter,
  Globe,
  Loader2
} from "lucide-react";

const MEDICAL_GLOSSARY = [
  {
    term: "OPD",
    fullName: "Outpatient Department",
    category: "Hospital & Care",
    definition: "The section of a hospital where patients consult doctors for check-ups and diagnosis without being admitted overnight.",
    context: "Visit OPD when experiencing non-emergency symptoms like fever, recurring cough, rash, or routine check-ups.",
    specialist: "General Physician / Specialist"
  },
  {
    term: "IPD",
    fullName: "Inpatient Department",
    category: "Hospital & Care",
    definition: "The hospital ward where patients are admitted and occupy a bed for continuous medical treatment, nursing, or post-surgery recovery.",
    context: "Required when intensive medical observation, IV medications, or scheduled surgeries are necessary.",
    specialist: "Attending Inpatient Consultant"
  },
  {
    term: "Triage",
    fullName: "Emergency Triage Assessment",
    category: "Hospital & Care",
    definition: "The clinical screening process of assigning priority levels to patients based on how critical their illness or injury is.",
    context: "Ensures trauma and stroke victims get immediate surgery before patients with non-life-threatening conditions.",
    specialist: "Emergency Medicine Physician"
  },
  {
    term: "Angioplasty",
    fullName: "Percutaneous Transluminal Angioplasty",
    category: "Cardiology",
    definition: "A minimally invasive procedure to reopen narrowed or blocked heart arteries using a tiny inflatable balloon and wire mesh stent.",
    context: "Performed for chest angina, coronary artery disease, or acute heart attacks to restore blood flow.",
    specialist: "Interventional Cardiologist"
  },
  {
    term: "Biopsy",
    fullName: "Tissue Sample Pathology",
    category: "Diagnostics & Labs",
    definition: "The removal of a small sample of body tissue or cells to examine under a microscope for signs of infection, disease, or tumor cells.",
    context: "Ordered when scans reveal unusual lumps, persistent ulcers, or abnormal skin moles.",
    specialist: "Pathologist / Surgeon"
  },
  {
    term: "MRI",
    fullName: "Magnetic Resonance Imaging",
    category: "Diagnostics & Labs",
    definition: "A painless radiology scan that uses strong magnetic fields and radio waves to generate detailed 3D pictures of soft tissues, brain, and joints.",
    context: "Used to detect spinal disc slipped nerves, brain aneurysms, ligament tears, and joint cartilage damage.",
    specialist: "Radiologist"
  },
  {
    term: "CT Scan",
    fullName: "Computed Tomography",
    category: "Diagnostics & Labs",
    definition: "A specialized scan that combines multiple X-ray images taken from different angles to create cross-sectional slices of bones, organs, and vessels.",
    context: "Essential for rapid trauma detection, head injury internal bleeding, and lung infection evaluation.",
    specialist: "Radiologist"
  },
  {
    term: "ECG / EKG",
    fullName: "Electrocardiogram",
    category: "Cardiology",
    definition: "A simple, painless test where sensors on the skin record the electrical signals produced by each heart beat.",
    context: "Checks for heart palpitations, irregular rhythms (arrhythmia), and past or impending heart attacks.",
    specialist: "Cardiologist"
  },
  {
    term: "Cataract",
    fullName: "Lens Opacification",
    category: "Ophthalmology",
    definition: "A cloudy patch that develops in the eye's natural lens, leading to blurred or dimmed vision like looking through frosted glass.",
    context: "Very common in seniors; fully curable via a quick 15-minute outpatient laser procedure replacing the lens with an artificial IOL.",
    specialist: "Ophthalmologist"
  },
  {
    term: "Glaucoma",
    fullName: "Intraocular Pressure Neuropathy",
    category: "Ophthalmology",
    definition: "A progressive eye disease where elevated fluid pressure inside the eyeball damages the optic nerve, causing gradual peripheral vision loss.",
    context: "Called the 'silent thief of sight'; detected via annual puff-test eye pressure checks.",
    specialist: "Glaucoma Specialist"
  },
  {
    term: "Hypertension",
    fullName: "High Blood Pressure",
    category: "Vitals & Conditions",
    definition: "A chronic condition where the force of blood against the artery walls is consistently too high (usually above 130/80 mmHg).",
    context: "Increases risk of stroke and heart failure; managed through reduced sodium, exercise, and daily medications.",
    specialist: "General Physician / Cardiologist"
  },
  {
    term: "SpO2",
    fullName: "Peripheral Oxygen Saturation",
    category: "Vitals & Conditions",
    definition: "A measurement of the percentage of oxygen-carrying hemoglobin in the blood, normally between 95% and 100%.",
    context: "Measured using a clip-on fingertip pulse oximeter; values below 92% indicate respiratory distress.",
    specialist: "Pulmonologist / Critical Care"
  },
  {
    term: "Vitals",
    fullName: "Vital Signs",
    category: "Vitals & Conditions",
    definition: "The four primary bodily indicators measured at check-in: Body Temperature, Heart Rate (Pulse), Blood Pressure, and Breathing Rate.",
    context: "Provides instant baseline data on whether a patient's core organ systems are operating normally.",
    specialist: "Triage Nurse / Physician"
  },
  {
    term: "Laparoscopy",
    fullName: "Keyhole Minimally Invasive Surgery",
    category: "Surgeries & Procedures",
    definition: "A modern surgical technique where operations are performed through tiny 1 cm keyhole incisions using a camera and slender micro-tools.",
    context: "Used for appendix removal, gallbladder stones, and hernia repairs with fast 1-day hospital recovery.",
    specialist: "General / Laparoscopic Surgeon"
  },
  {
    term: "Endoscopy",
    fullName: "Upper Gastrointestinal Endoscopy",
    category: "Diagnostics & Labs",
    definition: "A non-surgical procedure where a flexible thin tube with a camera is passed down the esophagus to visually inspect the stomach and intestines.",
    context: "Identifies causes of severe acid reflux, stomach ulcers, swallowing difficulties, and internal bleeding.",
    specialist: "Gastroenterologist"
  },
  {
    term: "Dialysis",
    fullName: "Renal Hemodialysis",
    category: "Hospital & Care",
    definition: "A treatment that filters waste toxins, salts, and excess fluid from the blood when the kidneys can no longer perform the function.",
    context: "Undergone 2-3 times per week by patients with Stage 5 chronic kidney disease awaiting kidney transplant.",
    specialist: "Nephrologist"
  },
  {
    term: "ICU / CCU",
    fullName: "Intensive Care Unit / Cardiac Care Unit",
    category: "Hospital & Care",
    definition: "A specialized high-dependency department providing round-the-clock intensive monitoring, ventilatory support, and emergency medicines.",
    context: "Reserved for patients with acute organ failure, major post-op complications, or septic shock.",
    specialist: "Intensivist / Critical Care Specialist"
  },
  {
    term: "Ultrasound",
    fullName: "Diagnostic Sonography",
    category: "Diagnostics & Labs",
    definition: "A harmless imaging test that uses high-frequency sound waves to capture real-time moving images of internal organs without radiation.",
    context: "Used for fetal scans during pregnancy, gallbladder stones, liver fat grading, and kidney stone detection.",
    specialist: "Sonologist / Radiologist"
  },
  {
    term: "Chemotherapy",
    fullName: "Systemic Antineoplastic Therapy",
    category: "Surgeries & Procedures",
    definition: "Drug therapy that uses powerful chemicals to kill fast-growing cancer cells and shrink malignant tumors throughout the body.",
    context: "Administered in outpatient day-care infusion suites under specialized oncological supervision.",
    specialist: "Medical Oncologist"
  },
  {
    term: "LASIK",
    fullName: "Laser-Assisted in Situ Keratomileusis",
    category: "Ophthalmology",
    definition: "A popular vision correction surgery where an excimer laser reshapes the clear corneal surface of the eye to eliminate the need for glasses.",
    context: "Treats myopia (near-sightedness), hyperopia (far-sightedness), and astigmatism in under 10 minutes.",
    specialist: "Cornea & Refractive Surgeon"
  }
];

const GLOSSARY_CATEGORIES = [
  "All",
  "Hospital & Care",
  "Cardiology",
  "Ophthalmology",
  "Diagnostics & Labs",
  "Vitals & Conditions",
  "Surgeries & Procedures"
];

// SerpAPI simulated data
const SERP_RESULTS = {
  "eye": [
    { title: "Common Eye Conditions & Modern Treatments", url: "webmd.com/eye-health", snippet: "Overview of refractive errors, cataracts, glaucoma, dry eye disease, and laser vision correction therapies." },
    { title: "When to Consult an Eye Specialist - Clinical Guidelines", url: "mayoclinic.org/vision", snippet: "Early detection of ocular hypertension and retinal anomalies preserves lifelong 20/20 visual acuity." },
  ],
  "heart": [
    { title: "Cardiovascular Warning Signs & Prevention", url: "heart.org/conditions", snippet: "Coronary artery disease, angina, heart failure, and lifestyle risk factors explained by cardiologists." },
  ],
  "diabetes": [
    { title: "Type 2 Diabetes Management & HbA1c Targets", url: "cdc.gov/diabetes", snippet: "Blood sugar regulation through balanced dietary glycemic load, physical activity, and medical monitoring." },
  ],
  "default": [
    { title: "A-Z Health Topics & Diagnostic Guides", url: "medlineplus.gov/health", snippet: "Trustworthy medical knowledge base covering diseases, surgical options, diagnostic imaging, and vitals." },
    { title: "NHS Patient Guidance: When to Seek Urgent Care", url: "nhs.uk/conditions", snippet: "Standard protocols for primary care consultations, walk-in clinics, and hospital emergency triage." },
  ],
};

const FAQ = [
  { q: "What is a QR Health Token?", a: "Your QR token is an encrypted check-in credential that secures your slot in the outpatient queue. Present it at the clinic reception scanner to verify your arrival. An automated SMS alert notifies you when 2 patients remain ahead." },
  { q: "Why is a minimum wallet balance required?", a: "The ₹200 reserve guarantees immediate processing of emergency triage reservations and basic doctor consults without payment gateway timeouts during critical medical moments." },
  { q: "What is the policy for missed appointments?", a: "To ensure doctors' scheduled consultation slots are respected, a 20% clinical preparation surcharge is charged if you cancel late or fail to appear for your turn." },
  { q: "How does the smart symptom matcher work?", a: "Our clinical engine maps everyday symptom descriptions directly to relevant hospital specialties. For instance, searching 'blurry vision' or 'eye strain' connects you with accredited ophthalmologists, while 'chest heaviness' connects you with interventional cardiologists." },
  { q: "Can doctors refer my case to another hospital?", a: "Yes. Using the physician portal, your primary doctor can transfer your digital queue pass, medical notes, and lab reports directly to a super-specialist in another hospital without repetitive paperwork." },
  { q: "How does the Emergency SOS button work?", a: "Tapping the circular '+' emergency icon immediately surfaces nearby GPS-calculated hospitals with real-time ambulance response estimates and one-tap direct dispatch numbers." },
];

export default function InfoPage() {
  const [activeTab, setActiveTab] = useState("glossary"); // "glossary" | "search" | "faq"
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedTerm, setExpandedTerm] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredGlossary = useMemo(() => {
    return MEDICAL_GLOSSARY.filter((item) => {
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const q = glossaryQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        item.term.toLowerCase().includes(q) || 
        item.fullName.toLowerCase().includes(q) || 
        item.definition.toLowerCase().includes(q) ||
        item.specialist.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [glossaryQuery, selectedCategory]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setTimeout(() => {
      const key = Object.keys(SERP_RESULTS).find((k) => searchQuery.toLowerCase().includes(k));
      setSearchResults(key ? SERP_RESULTS[key] : SERP_RESULTS["default"]);
      setSearching(false);
    }, 600);
  };

  return (
    <div className="page">
      <div style={{ marginBottom: "16px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Medical Hub</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
          Clinical glossary, research databases & patient guidance
        </p>
      </div>

      {/* Navigation Tabs - Responsive Segmented Controls */}
      <div className="view-toggle" style={{ margin: "0 0 16px", padding: "3px", width: "100%", boxSizing: "border-box" }}>
        <button
          type="button"
          className={`view-tab ${activeTab === "glossary" ? "active" : ""}`}
          onClick={() => setActiveTab("glossary")}
          style={{ padding: "8px 6px", fontSize: "0.8125rem", flex: 1, justifyContent: "center" }}
        >
          <BookOpen size={15} />
          <span>Glossary</span>
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === "search" ? "active" : ""}`}
          onClick={() => setActiveTab("search")}
          style={{ padding: "8px 6px", fontSize: "0.8125rem", flex: 1, justifyContent: "center" }}
        >
          <Search size={15} />
          <span>Search</span>
        </button>
        <button
          type="button"
          className={`view-tab ${activeTab === "faq" ? "active" : ""}`}
          onClick={() => setActiveTab("faq")}
          style={{ padding: "8px 6px", fontSize: "0.8125rem", flex: 1, justifyContent: "center" }}
        >
          <HelpCircle size={15} />
          <span>FAQs</span>
        </button>
      </div>

      {/* TAB 1: MEDICAL GLOSSARY */}
      {activeTab === "glossary" && (
        <div>
          {/* Glossary Search & Category Filters */}
          <div className="card" style={{ marginBottom: "16px", padding: "14px" }}>
            <div className="input-wrap" style={{ marginBottom: "12px", width: "100%" }}>
              <Search size={16} className="field-icon" />
              <input
                type="text"
                placeholder="Search term, e.g. 'OPD', 'MRI', 'Biopsy'..."
                value={glossaryQuery}
                onChange={(e) => setGlossaryQuery(e.target.value)}
                style={{ width: "100%", fontSize: "0.8125rem" }}
              />
            </div>

            {/* Category Chips with Hidden Scrollbar */}
            <div 
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
              className="no-scrollbar"
            >
              {GLOSSARY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`pill ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                  style={{ fontSize: "0.75rem", padding: "5px 12px", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", padding: "0 4px" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {filteredGlossary.length} Clinical Terms Defined
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Tap card for detailed clinical guidance
            </span>
          </div>

          {/* Glossary Cards List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredGlossary.map((item, idx) => {
              const isExpanded = expandedTerm === item.term;
              return (
                <div
                  key={item.term}
                  className="card"
                  onClick={() => setExpandedTerm(isExpanded ? null : item.term)}
                  style={{
                    cursor: "pointer",
                    transition: "var(--transition)",
                    borderColor: isExpanded ? "var(--primary)" : "var(--border)",
                    padding: "16px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 800,
                          fontSize: "1.05rem",
                          color: "var(--primary-light)"
                        }}>
                          {item.term}
                        </span>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          fontWeight: 600
                        }}>
                          ({item.fullName})
                        </span>
                      </div>
                      <span className="badge badge-muted" style={{ fontSize: "0.68rem", marginTop: "4px", padding: "2px 8px" }}>
                        {item.category}
                      </span>
                    </div>

                    {isExpanded ? (
                      <ChevronUp size={16} color="var(--primary-light)" style={{ flexShrink: 0, marginTop: "4px" }} />
                    ) : (
                      <ChevronDown size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "4px" }} />
                    )}
                  </div>

                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", marginTop: "10px", lineHeight: 1.5, overflowWrap: "anywhere", wordBreak: "normal" }}>
                    {item.definition}
                  </p>

                  {/* Expanded Context Details */}
                  {isExpanded && (
                    <div style={{
                      marginTop: "14px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      animation: "fadeIn 0.2s ease"
                    }}>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        <strong style={{ color: "var(--secondary)" }}>When it's used: </strong>
                        {item.context}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Stethoscope size={14} color="var(--primary-light)" />
                        <span><strong>Consulting Specialist: </strong>{item.specialist}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KNOWLEDGE SEARCH */}
      {activeTab === "search" && (
        <div>
          <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className="input-wrap" style={{ flex: 1 }}>
                <Search size={16} className="field-icon" />
                <input
                  placeholder="Search condition or symptoms, e.g. 'eye blur', 'heart'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button className="btn btn-primary" onClick={handleSearch} disabled={searching} style={{ padding: "0 18px" }}>
                {searching ? <Loader2 size={16} className="spin-pulse" /> : "Search"}
              </button>
            </div>
          </div>

          {searching && (
            <div className="card" style={{ textAlign: "center", padding: "32px", marginBottom: "20px" }}>
              <Loader2 size={24} className="spin-pulse" color="var(--primary-light)" style={{ margin: "0 auto" }} />
              <p style={{ marginTop: "12px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                Querying medical research databases & clinical references...
              </p>
            </div>
          )}

          {searchResults && !searching && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "0.9375rem" }}>Curated Medical Results</h3>
                <span className="badge badge-primary">SerpAPI Verified</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {searchResults.map((r, i) => (
                  <div key={i} className="card" style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--primary-light)", fontSize: "0.9375rem" }}>
                          {r.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--secondary)", margin: "4px 0", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Globe size={12} /> {r.url}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          {r.snippet}
                        </div>
                      </div>
                      <ExternalLink size={14} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Health Tips */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Sparkles size={16} color="var(--secondary)" />
              <h3 style={{ fontSize: "1rem" }}>Preventative Health Tips</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {MEDICAL_TIPS.map((tip, i) => (
                <div key={i} className="card" style={{ padding: "14px 16px" }}>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                    {tip.title}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "4px", lineHeight: 1.4 }}>
                    {tip.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === "faq" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FAQ.map((faq, i) => (
            <div
              key={i}
              className="card"
              style={{ cursor: "pointer", padding: "16px" }}
              onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9375rem" }}>
                  {faq.q}
                </div>
                {expandedFaq === i ? (
                  <ChevronUp size={16} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                )}
              </div>
              {expandedFaq === i && (
                <div style={{ marginTop: "12px", fontSize: "0.875rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border)", paddingTop: "12px", lineHeight: 1.5 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
