// src/utils/streak.js
//
// Tracks a "Healthy Farm Streak" across scans in localStorage.
// Adjust the isHealthy rule below if "healthy" should mean something
// different for your app (e.g. only when disease === 'None').

const STREAK_KEY = 'cropDoctorStreak';
const MILESTONE_FLAG_KEY = 'cropDoctorStreakMilestoneHit';
export const STREAK_MILESTONE_STEP = 5;

export function getStreak() {
  return Number(localStorage.getItem(STREAK_KEY) || 0);
}

// Call this once per completed diagnosis, alongside addHistoryEntry().
// Severity vocabulary matches the rest of the app: 'low' | 'moderate' | 'high'.
export function recordScanForStreak(severity) {
  const current = getStreak();
  const isHealthy = severity !== 'high';
  const next = isHealthy ? current + 1 : 0;

  localStorage.setItem(STREAK_KEY, String(next));

  const hitMilestone = isHealthy && next > 0 && next % STREAK_MILESTONE_STEP === 0;
  if (hitMilestone) {
    sessionStorage.setItem(MILESTONE_FLAG_KEY, 'true');
  }
  return next;
}

// StreakBadge calls this once on mount to know whether to play the
// celebration animation, then clears the flag so it only ever fires once.
export function consumeMilestoneFlag() {
  const hit = sessionStorage.getItem(MILESTONE_FLAG_KEY) === 'true';
  sessionStorage.removeItem(MILESTONE_FLAG_KEY);
  return hit;
}
