// src/utils/historyStore.js
//
// Simple localStorage-backed history of past scans, so HistoryScreen has
// real data to show instead of a mock array. No backend needed.

const HISTORY_KEY = 'cropDoctorHistory';
const MAX_ENTRIES = 50;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

// Call this once per completed diagnosis (mock or real), right after you
// get a result back. `thumbnail` should be a data URL string — see the
// toDataUrl() helper below for converting the uploaded File.
export function addHistoryEntry({ thumbnail, disease, severity }) {
  const entries = getHistory();
  const entry = {
    id: `${Date.now()}`,
    thumbnail: thumbnail || null,
    disease,
    severity,
    date: new Date().toISOString(),
  };
  const updated = [entry, ...entries].slice(0, MAX_ENTRIES);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

// Converts the File object from your upload input into a data URL so it
// can be stored and displayed later without hitting the network again.
export function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
