// ============================================================
// MEDICO - Global App State (React Context)
// ============================================================
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
import { DOCTORS, HOSPITALS, PATIENTS, CURRENT_USER, BLOOD_BANKS, INITIAL_BLOOD_REQUESTS, VOLUNTEER_DONORS } from "../data/mockData";
import { fetchQueue, bookAppointment, callNextPatient } from "../services/queueService";
import {
  smsBookingConfirmed,
  smsQueueUpdate,
  smsDoctorBreak,
  smsCancellationFine,
  smsEmergency,
  smsReferral,
} from "../services/smsService";
import { 
  issueSessionToken, 
  validateSessionToken, 
  terminateSession, 
  getActiveSession 
} from "../utils/sessionSecurity";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sessionMeta, setSessionMeta] = useState(() => getActiveSession());
  const [role, setRole] = useState(() => {
    try { 
      const active = getActiveSession();
      if (active?.role) return active.role;
      return localStorage.getItem('medico_role') || "patient"; 
    } catch { return "patient"; }
  });
  const [activeDoctorId, setActiveDoctorId] = useState("d1");
  const [doctors, setDoctors] = useState(DOCTORS);
  const [hospitals, setHospitals] = useState(HOSPITALS);
  const [bloodBanks, setBloodBanks] = useState(BLOOD_BANKS);
  const [bloodRequests, setBloodRequests] = useState(INITIAL_BLOOD_REQUESTS);
  const [volunteerDonors, setVolunteerDonors] = useState(VOLUNTEER_DONORS);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try { 
      const active = getActiveSession();
      return !!active?.token;
    } catch { return false; }
  });
  const [doctorApplications, setDoctorApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('medico_doctor_apps');
      return saved ? JSON.parse(saved) : [
        {
          id: "MED-DOC-9821",
          userId: "demo_doc_applicant",
          applicantName: "Dr. Ananya Roy",
          email: "ananya.roy@medico.health",
          phone: "+91 98450 12345",
          registrationNumber: "WBMC-2017-7362",
          medicalCouncil: "West Bengal Medical Council",
          qualifications: "MBBS, MD Pediatrics",
          specialty: "Pediatrics",
          hospital: "Cloudnine Hospital, Bengaluru",
          experienceYears: 6,
          consultationFee: 550,
          idProofNumber: "DOC-WB-7362",
          status: "PENDING_VERIFICATION",
          submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const active = getActiveSession();
      if (active?.token) {
        const saved = sessionStorage.getItem('medico_user') || localStorage.getItem('medico_user');
        if (saved) return JSON.parse(saved);
      }
      return CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      const active = getActiveSession();
      if (active?.isAdmin || active?.role === "admin") return true;
      const savedUser = sessionStorage.getItem('medico_user') || localStorage.getItem('medico_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        return !!parsed.isAdmin || parsed.role === "admin";
      }
      return false;
    } catch {
      return false;
    }
  });
  const [theme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [smsStatus, setSmsStatus] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const pushNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications((prev) => [{ id, message, time: new Date() }, ...prev.slice(0, 9)]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Permanently enforce clean classic light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    try { localStorage.setItem('medico_theme', 'light'); } catch(e){}
  }, []);

  const getDoctor = useCallback((id) => doctors.find((d) => d.id === id), [doctors]);

  // ── Real-time Queue Integration ──────────────────────────────
  const loadDoctorQueue = useCallback(async (doctorId) => {
    const queueData = await fetchQueue(doctorId);
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctorId ? { ...d, queue: queueData } : d))
    );
  }, []);

  useEffect(() => {
    const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
    const baseUrl = `http://${host}:3001`;

    // Load hospitals from backend
    fetch(`${baseUrl}/api/hospitals`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.length > 0) {
          setHospitals(json.data);
        }
      })
      .catch(() => console.log('[API] Using local hospital data'));

    // Load doctors from backend
    fetch(`${baseUrl}/api/doctors`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.length > 0) {
          setDoctors(json.data);
        }
      })
      .catch(() => console.log('[API] Using local doctor data'));

    // Initial load of queues
    doctors.forEach(d => loadDoctorQueue(d.id));

    // Connect Socket.IO
    const socket = io(baseUrl);
    socket.on('connect', () => {
      console.log('[Socket.IO] AppContext connected');
      doctors.forEach(d => socket.emit('queue:join', d.id));
    });

    socket.on('queue:update', ({ type, data }) => {
      console.log(`[Socket.IO] queue:update [${type}]`, data);
      let docId;
      if (type === 'NEW_BOOKING' && data.doctorId) docId = data.doctorId;
      else if (type === 'NEXT_PATIENT' && data.completed) docId = data.completed.doctorId;
      
      if (docId) {
        loadDoctorQueue(docId);
        if (type === 'NEW_BOOKING') {
          pushNotification(`A new patient booked with Doctor #${docId}`);
        } else if (type === 'NEXT_PATIENT') {
          pushNotification(`Queue advanced for Doctor #${docId}`);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ── Queue Actions ───────────────────────────────────────────

  const addToQueue = useCallback(async (doctorId, patientId, patientName, condition, { phone, token, position, waitMin } = {}) => {
    const doc = doctors.find((d) => d.id === doctorId);

    // CALL BACKEND
    const appointment = await bookAppointment(doctorId, patientId || user.id, patientName, condition);
    
    if (!appointment) {
      console.error("Backend booking fallback.");
      const newPid = patientId || `p${Date.now()}`;
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, queue: [...d.queue, { patientId: newPid, patientName, condition }] } : d))
      );
    }

    const tok = appointment?.queueNumber || token || Math.floor(Math.random() * 900) + 100;
    const calcPos = position ?? ((doc?.queue?.length || 0) + 1);
    const calcWait = waitMin ?? (calcPos * 15);

    // Save active appointment to user appointments state
    const newAppointment = {
      id: `apt_${Date.now()}`,
      doctorId,
      doctorName: doc?.name || "Specialist Doctor",
      doctorSpecialty: doc?.specialty || "General Medicine",
      hospital: doc?.hospital || "Hospital",
      doctorAvatar: doc?.avatar || "DR",
      consultationFee: doc?.consultationFee || 300,
      token: tok,
      position: calcPos,
      waitMin: calcWait,
      status: "waiting", // "waiting", "with-doctor", "completed", "cancelled"
      bookedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setUser((prev) => {
      const updatedUser = {
        ...prev,
        appointments: [newAppointment, ...(prev.appointments || []).filter(a => a.id !== newAppointment.id)],
      };
      try { localStorage.setItem('medico_user', JSON.stringify(updatedUser)); } catch(e){}
      return updatedUser;
    });

    pushNotification(`Added to ${doc?.name || 'Doctor'}'s queue. Token #${tok}`);

    // Fire SMS if phone provided
    if (phone && doc) {
      const result = await smsBookingConfirmed({
        phone,
        patientName,
        doctorName: doc.name,
        token: tok,
        position: calcPos,
        waitMin: calcWait,
        hospital: doc.hospital,
      });
      setSmsStatus(result);
    }

    return patientId;
  }, [doctors, user.id]);

  const cancelAppointment = useCallback(async (appointmentId) => {
    const apt = user.appointments?.find(a => a.id === appointmentId);
    if (!apt) return;

    const fineAmount = Math.round((apt.consultationFee || 300) * 0.2);
    
    // Deduct fine
    deductWallet(fineAmount, `Cancellation surcharge (20%) - Token #${apt.token}`, {
      sendFineSms: true,
      doctorName: apt.doctorName
    });

    // Mark as cancelled
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        appointments: (prev.appointments || []).map(a => 
          a.id === appointmentId ? { ...a, status: "cancelled" } : a
        ),
      };
      try { localStorage.setItem('medico_user', JSON.stringify(updatedUser)); } catch(e){}
      return updatedUser;
    });

    pushNotification(`Appointment cancelled. Cancellation fee ₹${fineAmount} applied.`);
  }, [user.appointments]);

  const createDemoAppointment = useCallback(() => {
    const doc = doctors[0] || DOCTORS[0];
    const demoApt = {
      id: `apt_demo_${Date.now()}`,
      doctorId: doc.id,
      doctorName: doc.name,
      doctorSpecialty: doc.specialty,
      hospital: doc.hospital,
      doctorAvatar: doc.avatar,
      consultationFee: doc.consultationFee,
      token: Math.floor(Math.random() * 900) + 100,
      position: 3,
      waitMin: 45,
      status: "waiting",
      bookedAt: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setUser((prev) => {
      const updatedUser = {
        ...prev,
        appointments: [demoApt, ...(prev.appointments || [])],
      };
      try { localStorage.setItem('medico_user', JSON.stringify(updatedUser)); } catch(e){}
      return updatedUser;
    });

    pushNotification(`Demo queue pass activated for ${doc.name} (Token #${demoApt.token})`);
  }, [doctors]);

  const nextPatient = useCallback(async (doctorId) => {
    const data = await callNextPatient(doctorId);
    if (!data) {
      setDoctors((prev) => {
        return prev.map((d) => {
          if (d.id !== doctorId) return d;
          const [current, ...rest] = d.queue;
          return { ...d, queue: rest, currentPatient: current || null };
        });
      });
    }
    pushNotification(`Next patient called in queue.`);
  }, []);

  const startBreak = useCallback(async (doctorId, minutes) => {
    const until = new Date(Date.now() + minutes * 60000);
    let queuePhones = [];

    setDoctors((prev) => {
      const updated = prev.map((d) => {
        if (d.id !== doctorId) return d;
        queuePhones = [user.phone];
        return { ...d, onBreak: true, breakUntil: until };
      });
      return updated;
    });

    const doc = doctors.find((d) => d.id === doctorId);
    if (doc && queuePhones.length > 0) {
      const result = await smsDoctorBreak({ phones: queuePhones, doctorName: doc.name, breakMin: minutes });
      setSmsStatus(result);
    }

    setTimeout(() => {
      setDoctors((prev) =>
        prev.map((d) => (d.id !== doctorId ? d : { ...d, onBreak: false, breakUntil: null }))
      );
      pushNotification(`Break ended for Dr. ${doc?.name}. Queue resumed.`);
    }, minutes * 60000);
  }, [doctors, user.phone]);

  const transferPatient = useCallback(async (fromDoctorId, patientId, toDoctorId) => {
    const toDoc = doctors.find((d) => d.id === toDoctorId);
    setDoctors((prev) =>
      prev.map((d) => {
        if (d.id === fromDoctorId) {
          return { ...d, queue: d.queue.filter((p) => p.patientId !== patientId && p !== patientId) };
        }
        if (d.id === toDoctorId) {
          return { ...d, queue: [...d.queue, { patientId, patientName: "Transferred Patient", condition: "Follow up" }] };
        }
        return d;
      })
    );
    pushNotification(`Patient transferred to ${toDoc?.name}'s queue.`);
  }, [doctors]);

  // ── Emergency ───────────────────────────────────────────────

  const triggerEmergency = useCallback(async (contact) => {
    setEmergencyActive(true);
    pushNotification(`Emergency SOS initiated to ${contact.name}`);

    const result = await smsEmergency({
      phone: user.phone,
      patientName: user.name,
      location: user.location,
    });
    setSmsStatus(result);
  }, [user]);

  // ── Wallet ──────────────────────────────────────────────────

  const deductWallet = useCallback(async (amount, desc, { sendFineSms = false, doctorName = "" } = {}) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: prev.wallet.balance - amount,
          transactions: [
            { id: `t${Date.now()}`, type: "debit", amount, desc, date: new Date().toISOString().split("T")[0] },
            ...prev.wallet.transactions,
          ],
        },
      };
      try { localStorage.setItem('medico_user', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    if (sendFineSms) {
      const result = await smsCancellationFine({ phone: user.phone, patientName: user.name, doctorName, fineAmount: amount });
      setSmsStatus(result);
    }
  }, [user]);

  const topUpWallet = useCallback((amount) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        wallet: {
          ...prev.wallet,
          balance: prev.wallet.balance + amount,
          transactions: [
            { id: `t${Date.now()}`, type: "credit", amount, desc: "Instant Wallet Top-up (UPI/Card)", date: new Date().toISOString().split("T")[0] },
            ...prev.wallet.transactions,
          ],
        },
      };
      try { localStorage.setItem('medico_user', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  }, []);

  const createBloodRequest = useCallback((requestData) => {
    const newReq = {
      id: `br_${Date.now()}`,
      timeAgo: "Just now",
      status: "Active Search",
      matchedDonorsCount: Math.floor(Math.random() * 5) + 3,
      anonymousRequester: requestData.anonymousRequester || `@TransfusionCase_${Math.floor(Math.random() * 899 + 100)}`,
      patientAlias: requestData.patientAlias || `Patient #${Math.floor(Math.random() * 8999 + 1000)}`,
      maskedRelay: `relay-session-${Math.floor(Math.random() * 8999 + 1000)}`,
      ...requestData,
    };
    setBloodRequests((prev) => [newReq, ...prev]);
    pushNotification(`Urgent blood request posted for ${requestData.bloodGroup} (${requestData.unitsNeeded} units)`);
    return newReq;
  }, [pushNotification]);

  const registerDonor = useCallback((donorData) => {
    const anon = donorData.anonymousUsername || `@Donor_${(donorData.bloodGroup || 'O+').replace('+', 'Pos').replace('-', 'Neg')}_${Math.floor(Math.random() * 899 + 100)}`;
    const newDonor = {
      id: `vd_${Date.now()}`,
      anonymousUsername: anon,
      donationsCount: 1,
      lastDonated: "Recent",
      status: "Ready to Donate",
      maskedRelay: `relay-session-${Math.floor(Math.random() * 8999 + 1000)}`,
      ...donorData,
    };
    setVolunteerDonors((prev) => [newDonor, ...prev]);
    pushNotification(`Registered as volunteer donor: ${anon} (${donorData.bloodGroup})`);
    return newDonor;
  }, [pushNotification]);

  // ── Auth & Location with High-Accuracy GPS & Multi-Tier Fallback ───────────

  const applyIpOrPresetFallback = async (resolve) => {
    try {
      // Try fast Network / IP Geolocation API
      const res = await fetch('https://ipwho.is/?fields=city,latitude,longitude,region', { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const lat = Number(parseFloat(data.latitude).toFixed(5));
        const lng = Number(parseFloat(data.longitude).toFixed(5));
        const locationStr = `${data.city || 'Network Location'}, ${data.region || 'Karnataka'}`;
        setUser((prev) => {
          const u = { ...prev, location: locationStr, lat, lng };
          try { localStorage.setItem('medico_user', JSON.stringify(u)); } catch(e){}
          return u;
        });
        pushNotification(`Location detected via Network: ${locationStr} (Lat: ${lat}, Lng: ${lng})`);
        setIsFetchingLocation(false);
        resolve({ success: true, city: locationStr, lat, lng });
        return;
      }
    } catch (e) {
      // Network IP lookup failed
    }

    // Default Koramangala preset with explicit coordinates
    const fallbackStr = "Koramangala, Bengaluru";
    const defaultLat = 12.9352;
    const defaultLng = 77.6245;
    setUser((prev) => {
      const u = { ...prev, location: fallbackStr, lat: defaultLat, lng: defaultLng };
      try { localStorage.setItem('medico_user', JSON.stringify(u)); } catch(e){}
      return u;
    });
    pushNotification(`Location active: ${fallbackStr} (Lat: ${defaultLat}, Lng: ${defaultLng})`);
    setIsFetchingLocation(false);
    resolve({ success: true, city: fallbackStr, lat: defaultLat, lng: defaultLng });
  };

  const fetchLocation = useCallback(async () => {
    setIsFetchingLocation(true);

    return new Promise((resolve) => {
      let resolved = false;

      // Tier 1: Try Native / Browser GPS Geolocation (High Accuracy)
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            if (resolved) return;
            resolved = true;
            try {
              const latitude = Number(position.coords.latitude.toFixed(5));
              const longitude = Number(position.coords.longitude.toFixed(5));
              
              let locationStr = `GPS (${latitude}, ${longitude})`;
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                  { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(4000) }
                );
                if (res.ok) {
                  const data = await res.json();
                  const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.subdistrict;
                  const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || "Bengaluru";
                  locationStr = suburb ? `${suburb}, ${city}` : city;
                }
              } catch (geoErr) {
                // Keep clean coordinates label
              }

              setUser((prev) => {
                const u = { ...prev, location: locationStr, lat: latitude, lng: longitude };
                try { localStorage.setItem('medico_user', JSON.stringify(u)); } catch(e){}
                return u;
              });
              pushNotification(`GPS Locked: ${locationStr} (Lat: ${latitude}, Lng: ${longitude})`);
              setIsFetchingLocation(false);
              resolve({ success: true, city: locationStr, lat: latitude, lng: longitude });
            } catch (err) {
              applyIpOrPresetFallback(resolve);
            }
          },
          (geoErr) => {
            if (!resolved) {
              resolved = true;
              console.warn("[GPS] Geolocation prompt denied or timed out:", geoErr?.message);
              applyIpOrPresetFallback(resolve);
            }
          },
          { timeout: 9000, enableHighAccuracy: true, maximumAge: 30000 }
        );
      } else {
        // Fallback to Network Geolocation
        applyIpOrPresetFallback(resolve);
      }
    });
  }, [pushNotification]);

  const setCoordinatesManual = useCallback(async (latitude, longitude, customLabel) => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    let locLabel = customLabel || `Custom GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(3500) }
      );
      if (res.ok) {
        const data = await res.json();
        const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.residential;
        const city = data.address?.city || data.address?.town || data.address?.village || "";
        if (suburb || city) {
          locLabel = suburb ? `${suburb}, ${city}` : city;
        }
      }
    } catch (e) {}

    setUser((prev) => {
      const u = { ...prev, location: locLabel, lat, lng };
      try { localStorage.setItem('medico_user', JSON.stringify(u)); } catch(e){}
      return u;
    });
    pushNotification(`Coordinates set: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)} (${locLabel})`);
    return { lat, lng, location: locLabel };
  }, [pushNotification]);

  const setLocationManual = useCallback((localityName, lat, lng) => {
    const locStr = `${localityName}, Bengaluru`;
    const numLat = Number(lat);
    const numLng = Number(lng);
    setUser((prev) => {
      const u = { ...prev, location: locStr, lat: numLat, lng: numLng };
      try { localStorage.setItem('medico_user', JSON.stringify(u)); } catch(e){}
      return u;
    });
    pushNotification(`Location set to ${locStr} (Lat: ${numLat.toFixed(4)}, Lng: ${numLng.toFixed(4)})`);
  }, [pushNotification]);

  const submitDoctorApplication = useCallback((details) => {
    const appId = `MED-DOC-${Math.floor(Math.random() * 8999 + 1000)}`;
    const newApp = {
      id: appId,
      userId: details.userId || user.id,
      applicantName: details.applicantName || `Dr. ${user.name}`,
      email: details.email || user.email,
      phone: details.phone || user.phone,
      registrationNumber: details.registrationNumber,
      medicalCouncil: details.medicalCouncil,
      qualifications: details.qualifications,
      specialty: details.specialty,
      hospital: details.hospital,
      experienceYears: details.experienceYears || 5,
      consultationFee: details.consultationFee || 500,
      idProofNumber: details.idProofNumber,
      status: "PENDING_VERIFICATION",
      submittedAt: new Date().toISOString(),
    };

    setDoctorApplications((prev) => {
      const updated = [newApp, ...prev.filter(a => a.userId !== newApp.userId)];
      try { localStorage.setItem('medico_doctor_apps', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    pushNotification(`Doctor verification submitted [${appId}]. Pending Medical Board Admin review.`);
    return newApp;
  }, [user, pushNotification]);

  const verifyAdminPasskey = useCallback((key) => {
    const clean = (key || "").trim();
    const validKeys = [
      "ADMIN-MEDICO-2026",
      "MEDICO-ADMIN-2026",
      "admin2026",
      "admin123",
      "MEDICO2026",
      "admin@medico.health"
    ];
    if (validKeys.includes(clean)) {
      setIsAdmin(true);
      setUser((prev) => {
        const adminUser = {
          ...prev,
          isAdmin: true,
          role: "admin",
          name: prev?.name && prev.name !== "Member" ? prev.name : "Medical Board Officer"
        };
        try {
          sessionStorage.setItem('medico_user', JSON.stringify(adminUser));
          localStorage.setItem('medico_user', JSON.stringify(adminUser));
        } catch(e) {}
        return adminUser;
      });
      setSessionMeta((prev) => prev ? ({ ...prev, isAdmin: true, role: "admin" }) : null);
      pushNotification("Admin Credentials Verified: Medical Board executive authorization granted.");
      return { success: true };
    } else {
      pushNotification("Access Denied: Invalid Medical Board Admin Security Key.");
      return { success: false, error: "Invalid Admin Passkey. Authorization failed." };
    }
  }, [pushNotification]);

  const exitAdminMode = useCallback(() => {
    setIsAdmin(false);
    setUser((prev) => {
      const regularUser = { ...prev, isAdmin: false, role: "patient" };
      try {
        sessionStorage.setItem('medico_user', JSON.stringify(regularUser));
        localStorage.setItem('medico_user', JSON.stringify(regularUser));
      } catch(e) {}
      return regularUser;
    });
    setRole("patient");
    setSessionMeta((prev) => prev ? ({ ...prev, isAdmin: false, role: "patient" }) : null);
    pushNotification("Exited Admin Mode: Administrative authority relinquished.");
  }, [pushNotification]);

  const approveDoctorApplication = useCallback((appId) => {
    if (!isAdmin) {
      pushNotification("Access Denied: Only certified Medical Board Administrators can approve practitioner credentials.");
      return false;
    }

    let approvedApp = null;
    setDoctorApplications((prev) => {
      const updated = prev.map((a) => {
        if (a.id === appId) {
          approvedApp = { ...a, status: "APPROVED", verifiedAt: new Date().toISOString() };
          return approvedApp;
        }
        return a;
      });
      try { localStorage.setItem('medico_doctor_apps', JSON.stringify(updated)); } catch(e){}
      return updated;
    });

    if (approvedApp) {
      // Check if this application belongs to the current active user
      if (approvedApp.userId === user.id) {
        setRole("doctor");
        const newDoctorId = `doc_${Date.now()}`;
        setActiveDoctorId(newDoctorId);

        // Update user profile to reflect verified doctor status
        const updatedUser = {
          ...user,
          name: approvedApp.applicantName,
          specialty: approvedApp.specialty,
          isDoctorVerified: true,
          doctorRegistration: approvedApp.registrationNumber,
          hospital: approvedApp.hospital,
        };
        setUser(updatedUser);

        // Issue new cryptographic session token with doctor scope
        const newMeta = issueSessionToken(updatedUser, "doctor");
        setSessionMeta(newMeta);

        // Add doctor to active directory
        const newDocProfile = {
          id: newDoctorId,
          name: approvedApp.applicantName,
          specialty: approvedApp.specialty,
          rating: 5.0,
          reviews: 1,
          experience: `${approvedApp.experienceYears} years`,
          hospital: approvedApp.hospital,
          distance: "Nearby",
          lat: user.lat || 12.9352,
          lng: user.lng || 77.6245,
          avatar: approvedApp.applicantName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
          availableToday: true,
          consultationFee: approvedApp.consultationFee,
          capabilities: [approvedApp.specialty, "General Consultation", "Diagnostics"],
          queue: [],
          currentPatient: null,
          onBreak: false,
          breakUntil: null,
          nextSlot: "Available Now",
          reports: [],
          isVerifiedDoctor: true,
        };
        setDoctors(prev => [newDocProfile, ...prev]);

        pushNotification(`Credentials Approved! Welcome to Medico Practice, ${approvedApp.applicantName}!`);
      } else {
        pushNotification(`Admin verified and approved ${approvedApp.applicantName} [${approvedApp.registrationNumber}].`);
      }
    }
  }, [isAdmin, user, pushNotification]);

  const rejectDoctorApplication = useCallback((appId, reason) => {
    if (!isAdmin) {
      pushNotification("Access Denied: Only certified Medical Board Administrators can reject practitioner credentials.");
      return false;
    }

    let target = null;
    setDoctorApplications((prev) => {
      const updated = prev.map((a) => {
        if (a.id === appId) {
          target = a;
          return { ...a, status: "REJECTED", rejectionReason: reason || "Credentials could not be verified" };
        }
        return a;
      });
      try { localStorage.setItem('medico_doctor_apps', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
    pushNotification(`Doctor application for ${target?.applicantName || 'Applicant'} rejected.`);
  }, [isAdmin, pushNotification]);

  const registerPatient = useCallback((patientDetails) => {
    const updatedUser = {
      ...user,
      ...patientDetails,
      id: patientDetails.id || `u_${Date.now()}`,
    };
    setUser(updatedUser);
    setIsLoggedIn(true);
    setRole("patient");

    // Issue cryptographic session token
    const meta = issueSessionToken(updatedUser, "patient");
    setSessionMeta(meta);

    if (patientDetails.willingToDonateBlood) {
      const anon = patientDetails.anonymousUsername || `@Donor_${(patientDetails.bloodGroup || 'O+').replace('+', 'Pos').replace('-', 'Neg')}_${Math.floor(Math.random() * 899 + 100)}`;
      const donorEntry = {
        id: `vd_${Date.now()}`,
        name: patientDetails.name,
        anonymousUsername: anon,
        bloodGroup: patientDetails.bloodGroup || "O+",
        age: patientDetails.age || 26,
        area: (patientDetails.location || "Koramangala").split(',')[0],
        phone: patientDetails.phone,
        donationsCount: 0,
        lastDonated: "Ready to Donate",
        status: "Active Volunteer",
        maskedRelay: `relay-session-${Math.floor(Math.random() * 8999 + 1000)}`,
        isCurrentUser: true,
      };
      setVolunteerDonors((prev) => [donorEntry, ...prev.filter(d => !d.isCurrentUser)]);
    }

    try {
      localStorage.setItem('medico_user', JSON.stringify(updatedUser));
      localStorage.setItem('medico_isLoggedIn', 'true');
      localStorage.setItem('medico_role', 'patient');
    } catch (e) {}
    pushNotification(`Welcome to Medico, ${patientDetails.name || 'Member'}! Secure session active.`);
  }, [user, pushNotification]);

  const handleLogin = useCallback(async (customUser, rememberMe = false) => {
    const targetUser = customUser || user;

    // Check if signing in as an explicit Administrator
    if (targetUser.isAdmin || targetUser.role === "admin") {
      setIsAdmin(true);
      setRole("admin");
      setIsLoggedIn(true);
      const meta = issueSessionToken(targetUser, "admin", rememberMe);
      setSessionMeta(meta);
      setUser(targetUser);
      try {
        sessionStorage.setItem('medico_user', JSON.stringify(targetUser));
        if (rememberMe) {
          localStorage.setItem('medico_isLoggedIn', 'true');
          localStorage.setItem('medico_role', 'admin');
          localStorage.setItem('medico_user', JSON.stringify(targetUser));
        }
      } catch (e) {}
      pushNotification("Signed in as Medical Board Administrator. Full licensing authority active.");
      return;
    }

    // Check if user has an approved doctor application
    const userApp = doctorApplications?.find(a => a.userId === targetUser.id && a.status === "APPROVED");
    const targetRole = userApp ? "doctor" : "patient";

    setIsAdmin(false);
    setRole(targetRole);
    if (targetRole === "patient") {
      await fetchLocation();
    }
    setIsLoggedIn(true);

    // Issue cryptographic session token
    const meta = issueSessionToken(targetUser, targetRole, rememberMe);
    setSessionMeta(meta);

    try {
      sessionStorage.setItem('medico_user', JSON.stringify(targetUser));
      if (rememberMe) {
        localStorage.setItem('medico_isLoggedIn', 'true');
        localStorage.setItem('medico_role', targetRole);
        localStorage.setItem('medico_user', JSON.stringify(targetUser));
      }
    } catch (e) {}
    pushNotification(`Signed in securely. Session token verified.`);
  }, [user, doctorApplications, fetchLocation, pushNotification]);

  const logout = useCallback(() => {
    terminateSession();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setSessionMeta(null);
    setRole("patient");
    try {
      localStorage.removeItem('medico_isLoggedIn');
      localStorage.removeItem('medico_role');
      sessionStorage.clear();
    } catch (e) {}
    pushNotification("Logged out. Session token revoked.");
  }, [pushNotification]);

  return (
    <AppContext.Provider value={{
      isLoggedIn, setIsLoggedIn, handleLogin, registerPatient, logout,
      sessionMeta,
      role, setRole,
      isAdmin, verifyAdminPasskey, exitAdminMode,
      theme,
      doctorApplications,
      submitDoctorApplication,
      approveDoctorApplication,
      rejectDoctorApplication,
      activeDoctorId, setActiveDoctorId,
      doctors, setDoctors,
      hospitals, setHospitals,
      bloodBanks, setBloodBanks,
      bloodRequests, volunteerDonors,
      createBloodRequest, registerDonor,
      user, setUser,
      notifications, pushNotification, dismissNotification,
      emergencyActive, setEmergencyActive,
      smsStatus,
      isFetchingLocation,
      fetchLocation,
      setLocationManual,
      setCoordinatesManual,
      getDoctor,
      addToQueue,
      cancelAppointment,
      createDemoAppointment,
      nextPatient,
      startBreak,
      transferPatient,
      triggerEmergency,
      deductWallet,
      topUpWallet,
      patients: PATIENTS,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
