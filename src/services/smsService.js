// ============================================================
// MEDICO — SMS Service (Frontend → Backend bridge)
// All SMS calls route through the Express backend at port 3001
// which uses Twilio to send real SMS messages.
// ============================================================

const getSmsBase = () => {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:3001`;
};

async function post(endpoint, data) {
  try {
    const res = await fetch(`${getSmsBase()}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.warn(`[SMS] ${endpoint} failed:`, err.message);
    return { success: false, error: err.message };
  }
}

// ── Public API ──────────────────────────────────────────────

/**
 * Notify patient their booking is confirmed.
 */
export async function smsBookingConfirmed({ phone, patientName, doctorName, token, position, waitMin, hospital }) {
  return post('/sms/booking-confirmed', { phone, patientName, doctorName, token, position, waitMin, hospital });
}

/**
 * Notify patient of their updated queue position.
 * Called every time the doctor clicks "Next Patient".
 */
export async function smsQueueUpdate({ phone, patientName, doctorName, position }) {
  return post('/sms/queue-update', { phone, patientName, doctorName, position });
}

/**
 * Notify ALL queued patients that the doctor is taking a break.
 * @param {string[]} phones - Array of patient phone numbers
 */
export async function smsDoctorBreak({ phones, doctorName, breakMin }) {
  return post('/sms/doctor-break', { phones, doctorName, breakMin });
}

/**
 * Send appointment reminder (call this 24h before via a cron or scheduled job).
 */
export async function smsAppointmentReminder({ phone, patientName, doctorName, date, time, hospital }) {
  return post('/sms/appointment-reminder', { phone, patientName, doctorName, date, time, hospital });
}

/**
 * Notify patient that a fine has been applied.
 */
export async function smsCancellationFine({ phone, patientName, doctorName, fineAmount }) {
  return post('/sms/cancellation-fine', { phone, patientName, doctorName, fineAmount });
}

/**
 * Confirm emergency dispatch to patient.
 */
export async function smsEmergency({ phone, patientName, location }) {
  return post('/sms/emergency', { phone, patientName, location });
}

/**
 * Notify patient about referral to another doctor.
 */
export async function smsReferral({ phone, patientName, fromDoctor, toDoctor, toHospital, position }) {
  return post('/sms/referral', { phone, patientName, fromDoctor, toDoctor, toHospital, position });
}

/**
 * Check if the SMS backend is reachable and Twilio is configured.
 */
export async function checkSmsHealth() {
  try {
    const res = await fetch(`${getSmsBase()}/health`);
    return await res.json();
  } catch {
    return { status: 'offline', twilio: false };
  }
}
