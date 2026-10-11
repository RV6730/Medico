import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import NotificationToast from "./components/NotificationToast";
import EmergencyOverlay from "./components/EmergencyOverlay";

// Pages
import Login from "./pages/Login";
import PatientHome from "./pages/PatientHome";
import DoctorDetail from "./pages/DoctorDetail";
import QueuePage from "./pages/QueuePage";
import WalletPage from "./pages/WalletPage";
import InfoPage from "./pages/InfoPage";
import NotificationsPage from "./pages/NotificationsPage";
import EBloodBank from "./pages/EBloodBank";
import DoctorQueue from "./pages/DoctorQueue";
import DoctorReports from "./pages/DoctorReports";
import DoctorSchedule from "./pages/DoctorSchedule";

function ProtectedRoute({ children, allowedRole }) {
  const { isLoggedIn, role, sessionMeta } = useApp();
  if (!isLoggedIn || !sessionMeta?.token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "patient" ? "/patient/home" : "/doctor"} replace />;
  }
  return children;
}

function AppShell() {
  const { emergencyActive, isLoggedIn, role } = useApp();

  return (
    <div className="app-layout">
      {isLoggedIn && <Navbar />}
      <NotificationToast />
      {emergencyActive && <EmergencyOverlay />}

      <main className="main-content">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to={role === "patient" ? "/patient/home" : "/doctor"} replace />} />

          {/* Patient Routes */}
          <Route path="/patient/home" element={<ProtectedRoute allowedRole="patient"><PatientHome /></ProtectedRoute>} />
          <Route path="/patient/hospitals" element={<ProtectedRoute allowedRole="patient"><PatientHome initialView="hospitals" /></ProtectedRoute>} />
          <Route path="/patient/doctors" element={<ProtectedRoute allowedRole="patient"><PatientHome initialView="doctors" /></ProtectedRoute>} />
          <Route path="/patient/search" element={<ProtectedRoute allowedRole="patient"><PatientHome /></ProtectedRoute>} />
          <Route path="/patient/doctor/:id" element={<ProtectedRoute allowedRole="patient"><DoctorDetail /></ProtectedRoute>} />
          <Route path="/doctor-detail/:id" element={<ProtectedRoute allowedRole="patient"><DoctorDetail /></ProtectedRoute>} />
          <Route path="/patient/queue" element={<ProtectedRoute allowedRole="patient"><QueuePage /></ProtectedRoute>} />
          <Route path="/patient/wallet" element={<ProtectedRoute allowedRole="patient"><WalletPage /></ProtectedRoute>} />
          <Route path="/patient/info" element={<ProtectedRoute allowedRole="patient"><InfoPage /></ProtectedRoute>} />
          <Route path="/patient/blood-bank" element={<ProtectedRoute allowedRole="patient"><EBloodBank /></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute allowedRole="patient"><NotificationsPage /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRole="doctor"><DoctorQueue /></ProtectedRoute>} />
          <Route path="/doctor/reports" element={<ProtectedRoute allowedRole="doctor"><DoctorReports /></ProtectedRoute>} />
          <Route path="/doctor/schedule" element={<ProtectedRoute allowedRole="doctor"><DoctorSchedule /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {isLoggedIn && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
