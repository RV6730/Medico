// ============================================================
// MEDICO — Queue API Service
// ============================================================

const getApiBase = () => {
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  return `http://${host}:3001/api`;
};

export async function fetchQueue(doctorId) {
  try {
    const res = await fetch(`${getApiBase()}/queue/${doctorId}`);
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) {
    console.error('Fetch queue error:', err);
    return [];
  }
}

export async function bookAppointment(doctorId, patientId, patientName, condition) {
  try {
    const res = await fetch(`${getApiBase()}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, patientId, patientName, condition })
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('Book appointment error:', err);
    return null;
  }
}

export async function callNextPatient(doctorId) {
  try {
    const res = await fetch(`${getApiBase()}/appointments/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId })
    });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error('Next patient error:', err);
    return null;
  }
}
