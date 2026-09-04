// src/utils/risk.js
//
// Maps the app-wide severity vocabulary ('low' | 'moderate' | 'high') to a
// farmer-facing risk level. Kept separate from any component so the same
// logic can be reused wherever a risk badge is needed, and so it can be
// swapped for a real model-driven risk score later without touching UI.

const RISK_MAP = {
  low: { level: 'low', icon: '✅' },
  moderate: { level: 'medium', icon: '⚠️' },
  high: { level: 'high', icon: '🚨' },
};

export function getRiskLevel(severity) {
  return RISK_MAP[severity] || RISK_MAP.moderate;
}
