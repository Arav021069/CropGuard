// src/api/buildDiagnosisRequest.js
//
// Single place that shapes what a future diagnosis request to the real
// backend will look like. Nothing here calls a network endpoint — this is
// intentionally just a plain data object, kept separate from any UI
// component so it can be handed directly to the backend API once your
// teammate's endpoint exists (see diagnoseApi.js for where that call
// would actually go).

export function buildDiagnosisRequest({
  crop,
  soilPH,
  nitrogen,
  phosphorus,
  potassium,
  location,
  soilReport,
  plantImage,
} = {}) {
  const toNumberOrNull = (value) =>
    value === '' || value === null || value === undefined || Number.isNaN(Number(value))
      ? null
      : Number(value);

  return {
    crop: crop ?? null, // 'wheat' | 'rice' | 'tomato' | 'potato' | 'cotton' | 'mustard' | null
    soilPH: toNumberOrNull(soilPH),
    nitrogen: toNumberOrNull(nitrogen),
    phosphorus: toNumberOrNull(phosphorus),
    potassium: toNumberOrNull(potassium),
    location: location ?? null, // { lat, lng } | null
    soilReport: soilReport ?? null, // File | null — never uploaded anywhere yet
    plantImage: plantImage ?? null, // File | null
  };
}
