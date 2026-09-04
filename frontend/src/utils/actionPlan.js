// src/utils/actionPlan.js
//
// Maps the diagnosed disease name (as returned by diagnoseApi.js — mock or
// real) to the translation keys used by ActionPlanCard. Any disease not in
// this map falls back to 'default', which holds generic, safe, farmer-
// friendly guidance — so a future real backend returning a disease we don't
// recognize yet never breaks the Action Plan card, it just shows generic
// advice instead of disease-specific text.

const DISEASE_KEY_MAP = {
  'Early Blight': 'early_blight',
};

export function getActionPlanKey(disease) {
  return DISEASE_KEY_MAP[disease] || 'default';
}
