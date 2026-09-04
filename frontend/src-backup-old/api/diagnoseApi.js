// src/api/diagnoseApi.js
//
// Frontend-only integration point for the real backend endpoint.
//
// IMPORTANT: no backend endpoint has been invented here. If your teammate's
// endpoint isn't configured yet, this automatically falls back to mock
// diagnosis data so the rest of the app (Result, Cost Estimator, History,
// Streak) keeps working end-to-end during development.
//
// When the real endpoint is ready, set it in a `.env.local` file at the
// project root (Vite auto-loads this, and it's gitignored by default):
//
//   VITE_DIAGNOSE_API_URL=https://your-teammates-endpoint.example.com/diagnose
//
// Then this file will automatically switch to calling it for real — no
// other code changes needed.

const DIAGNOSE_ENDPOINT = import.meta.env.VITE_DIAGNOSE_API_URL || null;

// Mock data used whenever no real endpoint is configured.
// Severity values follow the app-wide vocabulary: 'low' | 'moderate' | 'high'.
const MOCK_RESULT = {
  disease: 'Early Blight',
  confidence: 87,
  severity: 'moderate',
  advice: [
    'Remove affected leaves',
    'Apply neem spray',
    'Avoid overhead watering',
  ],
  needs_expert: true,
};

function mockDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function diagnosePlant(imageFile) {
  if (!DIAGNOSE_ENDPOINT) {
    // No real backend configured yet — use mock data (simulated network delay).
    await mockDelay(1600);
    return MOCK_RESULT;
  }

  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(DIAGNOSE_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Diagnosis request failed with status ${response.status}`);
  }

  const data = await response.json();

  // Normalize field names so the rest of the app always sees the same
  // shape the mock data used. Adjust the right-hand keys below to match
  // whatever your teammate's endpoint actually returns.
  return {
    disease: data.disease ?? data.disease_name ?? 'Unknown',
    confidence: data.confidence ?? data.confidence_score ?? 0,
    severity: data.severity ?? 'moderate', // expected: 'low' | 'moderate' | 'high'
    advice: data.advice ?? data.recommendations ?? [],
    needs_expert: data.needs_expert ?? data.needsExpert ?? false,
  };
}
