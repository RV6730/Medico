import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Activity, 
  Wallet, 
  Stethoscope, 
  Building2, 
  Droplet, 
  ClipboardList, 
  Info, 
  Ambulance, 
  LogOut, 
  ChevronRight,
  User
} from "lucide-react";

export default function Navbar() {
  const { role, user, logout, setEmergencyActive } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const menuItems = [
    {
      label: "Find Doctors",
      path: "/patient/doctors",
      icon: <Stethoscope size={18} color="var(--primary)" />,
      badge: "26 Doctors"
    },
    {
      label: "Top Hospitals",
      path: "/patient/hospitals",
      icon: <Building2 size={18} color="var(--primary)" />,
      badge: "15 Centers"
    },
    {
      label: "e-Blood Bank",
      path: "/patient/blood-bank",
      icon: <Droplet size={18} color="var(--accent)" />,
      badge: "Live Stock"
    },
    {
      label: "Live Token Queue",
      path: "/patient/queue",
      icon: <ClipboardList size={18} color="var(--secondary)" />,
      badge: "Active"
    },
    {
      label: "Medical Info & Glossary",
      path: "/patient/info",
      icon: <Info size={18} color="var(--text-secondary)" />,
      badge: null
    },
    {
      label: "Health Wallet",
      path: "/patient/wallet",
      icon: <Wallet size={18} color="var(--secondary)" />,
      badge: `₹${user?.wallet?.balance || 0}`
    },
  ];

  return (
    <>
      <nav className="navbar" style={{ position: "relative" }}>
        <div 
          className="navbar-inner" 
          style={{ 
            display: "grid", 
            gridTemplateColumns: "38px 1fr 38px", 
            alignItems: "center",
            width: "100%",
            height: "100%"
          }}
        >
          {/* Left: Dropdown Menu Trigger Button */}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Navigation Menu"
            title="Open Menu"
            style={{ width: "38px", height: "38px", justifySelf: "start" }}
          >
            <Menu size={22} color="var(--text-primary)" />
          </button>

          {/* Center: Medico Brand Aligned in the Exact Middle */}
          <div
            className="navbar-brand-centered"
            onClick={() => navigate(role === "doctor" ? "/doctor" : "/patient/home")}
            style={{
              justifySelf: "center",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              userSelect: "none"
            }}
          >
            <Activity size={22} color="var(--primary)" />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em"
              }}
            >
              Medico
            </span>
          </div>

          {/* Right: Wallet Button */}
          <div style={{ display: "flex", justifyContent: "flex-end", width: "38px", height: "38px" }}>
            {role === "patient" ? (
              <button
                type="button"
                className="icon-btn"
                onClick={() => navigate("/patient/wallet")}
                title="Health Wallet"
                aria-label="Health Wallet"
                style={{ width: "38px", height: "38px" }}
              >
                <Wallet size={19} color="var(--text-primary)" />
              </button>
            ) : (
              <div style={{ width: "38px", height: "38px" }} aria-hidden="true" />
            )}
          </div>
        </div>
      </nav>

      {/* Slide-Out Dropdown Menu Overlay */}
      {menuOpen && (
        <div 
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "flex-start",
            animation: "fadeIn 0.2s ease"
          }}
        >
          {/* Dropdown Menu Content Panel */}
          <div
            className="menu-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "82%",
              maxWidth: "320px",
              height: "100%",
              background: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              boxShadow: "4px 0 24px rgba(15, 23, 42, 0.15)",
              animation: "slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            {/* Header: User Profile */}
            <div
              style={{
                padding: "20px 18px 16px",
                borderBottom: "1px solid var(--border)",
                background: "linear-gradient(135deg, rgba(5,150,105,0.06) 0%, rgba(217,119,6,0.04) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    fontFamily: "'Outfit', sans-serif"
                  }}
                >
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "ME"}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    {user?.name || "Member"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "1px" }}>
                    {user?.phone || "+91 98765 43210"}
                  </div>
                  {user?.bloodGroup && (
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "rgba(220,38,38,0.1)",
                        color: "var(--accent)",
                        marginTop: "3px"
                      }}
                    >
                      Blood Group: {user.bloodGroup}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close Menu"
                style={{ width: "32px", height: "32px" }}
              >
                <X size={18} color="var(--text-secondary)" />
              </button>
            </div>

            {/* Menu Navigation Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", padding: "6px 12px 8px" }}>
                Navigation & Services
              </div>

              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "11px 12px",
                      borderRadius: "10px",
                      background: isActive ? "rgba(5,150,105,0.08)" : "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s ease",
                      marginBottom: "2px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.icon}
                      <span style={{ fontSize: "0.875rem", fontWeight: isActive ? 700 : 500, color: isActive ? "var(--primary)" : "var(--text-primary)" }}>
                        {item.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: "6px",
                            background: isActive ? "rgba(5,150,105,0.15)" : "var(--bg-base)",
                            color: isActive ? "var(--primary)" : "var(--text-muted)"
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </button>
                );
              })}

              <div style={{ margin: "10px 10px", borderTop: "1px solid var(--border)" }} />

              {/* Emergency SOS in Menu */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setEmergencyActive(true);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  background: "rgba(220,38,38,0.06)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "4px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Ambulance size={18} color="var(--accent)" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--accent)" }}>
                    Emergency SOS
                  </span>
                </div>
                <ChevronRight size={14} color="var(--accent)" />
              </button>
            </div>

            {/* Footer: Logout */}
            <div style={{ padding: "14px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-base)" }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "#FFFFFF",
                  color: "var(--text-danger)",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  cursor: "pointer"
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
