# Medico - Smart Healthcare, Queue & E-Blood Bank Platform

A smart healthcare and appointment management application featuring real-time queue tracking, confidential e-Blood banking, capability-based doctor matching, emergency SOS dispatch, and cross-doctor referrals with patient-first privacy controls.

---

## Live Demo

- Login: [Medico Web App](https://medico-one-iota.vercel.app/login)

---

## Features

### 1. Patient Portal
- **Geolocation & Nearest Doctors**: Computes real-time distance using user coordinates (latitude/longitude) to find the closest hospitals and clinics.
- **Smart Doctor Matching**: Suggests specialists based on reported symptoms and medical capability matching (e.g. eye surgery matching with certified surgeons).
- **Live Queue & QR Token**: First-come-first-served token system with live ETA tracking. QR code is kept confidential by default and can be toggled on demand.
- **e-Blood Bank**:
  - Live blood inventory and transfusion centers with category filters (`A+`, `O+`, `B+`, `AB+`, `Rare groups`).
  - Emergency blood requests with urgent broadcast alerts.
  - Volunteer donor matching with anonymous username contact to preserve patient confidentiality.
- **Emergency SOS**: Centered quick-access SOS button dispatches instant ambulance alerts with location coordinates.
- **Health Wallet**: Tracks consultation balances, enforces accountability fines for late cancellations or no-shows, with refund support upon account termination.

### 2. Doctor Portal
- **Queue Management**: Live patient token list with a "Next Patient" call button.
- **Doctor Break Mode**: Doctors can pause consultations for a custom duration (e.g., 15 mins), automatically adjusting patient ETAs and sending queue updates.
- **Shared Reports & Referrals**: Access initial consultation reports and seamlessly refer complex cases to partner specialists without losing patient history.

### 3. Backend & SMS Alerts
- Real-time Express API server (`server/index.js`).
- Automated Twilio SMS updates for booking confirmations, queue progress, and emergency dispatches.

### 4. Mobile & PWA Ready
- Responsive mobile design with custom single-line bottom navigation.
- Native Android build integrated via **Capacitor**.
- Progressive Web App (PWA) offline support with service workers.

---

## Tech Stack

- **Frontend**: React 18, Vite, Lucide React, CSS3 Grid & Flexbox
- **Mobile Native**: Capacitor Android (`@capacitor/android`, `@capacitor/core`, `@capacitor/cli`)
- **Backend**: Node.js, Express, Twilio SDK
- **PWA**: `vite-plugin-pwa`

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Android Studio (for running native Android builds)

### Installation

1. **Clone repository**:
   ```bash
   git clone https://github.com/RV6730/Medico.git
   cd Medico
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** (Optional for SMS):
   Create a `.env` file in the root directory:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   PORT=3001
   ```

4. **Start Development Servers**:
   - Web Frontend:
     ```bash
     npm run dev
     ```
   - Express Backend:
     ```bash
     node server/index.js
     ```

---

## Android Build (Capacitor)

1. Build web assets:
   ```bash
   npm run build
   ```

2. Sync assets with the Android project:
   ```bash
   npx cap sync android
   ```

3. Open in Android Studio:
   ```bash
   npx cap open android
   ```

---

## License

This project is licensed under the MIT License.
