// src/api/diagnoseApi.js
//
// Real API hookup for Day 3.
//
// >>> Set VITE_DIAGNOSE_API_URL in a .env.local file at your project root:
// >>>   VITE_DIAGNOSE_API_URL=https://your-teammates-endpoint.example.com/diagnose
// >>> (Vite only exposes env vars prefixed with VITE_, and .env.local
// >>>  should already be gitignored by default in a Vite project.)

const DIAGNOSE_ENDPOINT =
  import.meta.env.VITE_DIAGNOSE_API_URL || 'https://REPLACE-WITH-TEAMMATE-ENDPOINT/diagnose';

export async function diagnosePlant(imageFile) {
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
  // shape your mock data used. Adjust the right-hand keys below to match
  // whatever your teammate's endpoint actually returns.
  return {
    disease: data.disease ?? data.disease_name ?? 'Unknown',
    confidence: data.confidence ?? data.confidence_score ?? 0,
    severity: data.severity ?? 'moderate',
    advice: data.advice ?? data.recommendations ?? [],
    needs_expert: data.needs_expert ?? data.needsExpert ?? false,
  };
}
