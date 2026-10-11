import { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  CalendarCheck, 
  Lock, 
  Cpu, 
  Wifi, 
  CheckCircle2, 
  AlertTriangle,
  Receipt,
  DownloadCloud
} from "lucide-react";
import { ModalSheet } from "../components/UIKit";

export default function WalletPage() {
  const { user, topUpWallet, pushNotification } = useApp();
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { balance, minBalance, transactions } = user.wallet;
  const isLow = balance < minBalance * 1.5;

  const handleTopUp = () => {
    const amt = parseInt(topUpAmount);
    if (!amt || amt < 1) return;
    topUpWallet(amt);
    pushNotification(`Wallet credited with ₹${amt}. Available balance: ₹${balance + amt}`);
    setTopUpAmount("");
    setShowTopUp(false);
  };

  const QUICK_AMOUNTS = [200, 500, 1000, 2000];

  const policyItems = [
    {
      icon: <CalendarCheck size={16} color="var(--primary-light)" />,
      title: "Real-time Booking Settlement",
      desc: "Consultation fees are safely held in escrow and deducted only upon doctor queue confirmation."
    },
    {
      icon: <AlertTriangle size={16} color="var(--accent-orange)" />,
      title: "Cancellation & No-show Policy",
      desc: "A 20% clinical preparation surcharge applies to missed appointments or late cancellations."
    },
    {
      icon: <Lock size={16} color="var(--secondary)" />,
      title: "Minimum Security Reserve",
      desc: "A reserve balance of ₹200 guarantees uninterrupted access to emergency ambulance & trauma bookings."
    },
    {
      icon: <RefreshCw size={16} color="var(--text-muted)" />,
      title: "Zero-Deduction Account Refund",
      desc: "Any remaining wallet balance is refunded 100% to your source bank account on account closure."
    }
  ];

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Health Wallet</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginTop: "2px" }}>
            Instant OPD checkout, emergency escrow & refunds
          </p>
        </div>
        <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ShieldCheck size={13} /> Active
        </span>
      </div>

      {/* Digital Healthcare Fintech Card */}
      <div style={{
        background: "linear-gradient(135deg, #182232 0%, #0F1722 55%, #1C2B3E 100%)",
        borderRadius: "22px",
        padding: "24px 20px",
        border: "1px solid rgba(16, 185, 129, 0.35)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.5), 0 0 24px rgba(16, 185, 129, 0.12)",
        position: "relative",
        overflow: "hidden",
        marginBottom: "20px"
      }}>
        {/* Subtle Ambient Light Effect */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "160px",
          height: "160px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "38px",
              height: "28px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
            }}>
              <Cpu size={18} color="#222" />
            </div>
            <Wifi size={18} color="rgba(255,255,255,0.4)" style={{ transform: "rotate(90deg)" }} />
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              background: "linear-gradient(90deg, #10B981, #F59E0B)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              MEDICOPAY
            </span>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Healthcare Pass
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "1.1rem",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.85)",
          marginBottom: "18px"
        }}>
          4219 •••• •••• 8821
        </div>

        {/* Balance */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Available Balance
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "2px" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--secondary)" }}>₹</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2.1rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1 }}>
                {balance.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Card Holder</div>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {user?.name || "MEDICO MEMBER"}
            </div>
          </div>
        </div>
      </div>

      {/* Min Balance Notice */}
      {isLow && (
        <div style={{
          background: "rgba(255,159,67,0.08)",
          border: "1px solid rgba(255,159,67,0.3)",
          borderRadius: "14px",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px"
        }}>
          <AlertCircle size={18} color="var(--accent-orange)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: "0.8125rem", color: "var(--accent-orange)" }}>
            Current balance is approaching the required minimum threshold of <strong>₹{minBalance}</strong>. Please top up to maintain instant booking privileges.
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        <button className="btn btn-primary" onClick={() => setShowTopUp(true)} style={{ justifyContent: "center" }}>
          <Plus size={16} /> Add Funds
        </button>
        <button className="btn btn-secondary" onClick={() => setShowWithdrawModal(true)} style={{ justifyContent: "center" }}>
          <ArrowUpRight size={16} /> Request Payout
        </button>
      </div>

      {/* Quick Top-up Amount Chips */}
      <div className="card" style={{ marginBottom: "20px", padding: "16px" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "10px" }}>
          Quick Top-up Suggestions
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              className="pill"
              onClick={() => {
                setTopUpAmount(String(amt));
                setShowTopUp(true);
              }}
              style={{ flex: 1, minWidth: "70px", justifyContent: "center", fontWeight: 600 }}
            >
              +₹{amt}
            </button>
          ))}
        </div>
      </div>

      {/* Wallet Policy Card */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
          <ShieldCheck size={18} color="var(--primary-light)" />
          <h3 style={{ fontSize: "1rem" }}>Smart Wallet Rules</h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {policyItems.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", paddingBottom: i < 3 ? "12px" : "0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px"
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>{item.title}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "2px", lineHeight: 1.4 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions History */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Receipt size={18} color="var(--text-muted)" />
            <h3 style={{ fontSize: "1rem" }}>Activity Ledger</h3>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {transactions.length} Records
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {transactions.map((tx, idx) => (
            <div key={tx.id || idx} className="transaction-item" style={{ padding: "12px 0", borderBottom: idx < transactions.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: tx.type === "credit" ? "rgba(0,212,170,0.12)" : "rgba(255,107,107,0.12)",
                border: `1px solid ${tx.type === "credit" ? "rgba(0,212,170,0.3)" : "rgba(255,107,107,0.3)"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginRight: "12px"
              }}>
                {tx.type === "credit" ? (
                  <ArrowDownLeft size={18} color="var(--secondary)" />
                ) : (
                  <ArrowUpRight size={18} color="var(--accent)" />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.875rem" }}>
                  {tx.desc}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.date}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "1px 6px", borderRadius: "4px" }}>
                    Settled
                  </span>
                </div>
              </div>

              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                color: tx.type === "credit" ? "var(--text-success)" : "var(--text-danger)",
                fontSize: "1rem",
              }}>
                {tx.type === "credit" ? "+" : "−"}₹{tx.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Closure Section */}
      <div className="card" style={{ border: "1px solid rgba(255,107,107,0.25)", background: "rgba(255,107,107,0.03)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <Trash2 size={16} color="var(--text-danger)" />
          <h3 style={{ color: "var(--text-danger)", fontSize: "0.9375rem" }}>Close Health Wallet</h3>
        </div>
        <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: 1.4 }}>
          Closing your wallet permanently deletes your account and initiates an automated 100% refund of <strong>₹{balance}</strong> to your source bank account.
        </p>
        <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 size={14} /> Close Wallet & Refund ₹{balance}
        </button>
      </div>

      {/* Top Up Modal */}
      <ModalSheet open={showTopUp} onClose={() => setShowTopUp(false)} title="Add Funds to Wallet">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="input-label">Deposit Amount (₹ INR)</label>
            <input
              className="input"
              type="number"
              placeholder="e.g. 500"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              style={{ marginTop: "6px" }}
              autoFocus
            />
          </div>

          <div>
            <div className="input-label" style={{ marginBottom: "8px" }}>Quick Select</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  className={`pill ${topUpAmount == amt ? "active" : ""}`}
                  onClick={() => setTopUpAmount(String(amt))}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(0,212,170,0.06)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: "10px",
            padding: "10px 12px",
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={16} color="var(--secondary)" style={{ flexShrink: 0 }} />
            <span>Instant confirmation via UPI / Netbanking. Zero convenience surcharge.</span>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowTopUp(false)}>Cancel</button>
            <button className="btn btn-success" style={{ flex: 1 }} onClick={handleTopUp} disabled={!topUpAmount || parseInt(topUpAmount) < 1}>
              <CreditCard size={16} /> Deposit ₹{topUpAmount || 0}
            </button>
          </div>
        </div>
      </ModalSheet>

      {/* Withdraw Modal */}
      <ModalSheet open={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} title="Request Payout">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{
            background: "rgba(5, 150, 105, 0.08)",
            border: "1px solid rgba(5, 150, 105, 0.22)",
            borderRadius: "12px",
            padding: "14px"
          }}>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Withdrawable Balance</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "2px" }}>
              ₹{Math.max(0, balance - minBalance)}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              (Excluding mandatory ₹{minBalance} reserve)
            </div>
          </div>

          <div className="input-field">
            <label className="input-label">Destination Bank Account / VPA</label>
            <input
              className="input"
              type="text"
              defaultValue="sujay@okhdfcbank"
              readOnly
              style={{ marginTop: "6px" }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowWithdrawModal(false)}>Close</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => {
                setShowWithdrawModal(false);
                pushNotification(`Withdrawal request of ₹${Math.max(0, balance - minBalance)} scheduled. Credited in 2-3 business days.`);
              }}
              disabled={balance <= minBalance}
            >
              Confirm Payout
            </button>
          </div>
        </div>
      </ModalSheet>

      {/* Delete Account Modal */}
      <ModalSheet open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Account Deletion">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ textAlign: "center", padding: "12px 8px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(255,107,107,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <AlertTriangle size={30} color="var(--text-danger)" />
              </div>
            </div>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>Close Wallet & Delete Account?</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              This will cancel all upcoming queue slots and issue a full refund of <strong>₹{balance}</strong> to your original payment method.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={() => {
                setShowDeleteConfirm(false);
                pushNotification(`Account closure initiated. Full refund of ₹${balance} will credit within 5-7 business days.`);
              }}
            >
              Proceed with Refund
            </button>
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}
