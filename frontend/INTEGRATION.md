# Day 3 — Integration Guide

Same approach as Day 2: everything here is a **new file**. The only
existing files you touch are `App.jsx` (routes/nav), `UploadScreen.jsx`,
`LoadingScreen.jsx`, and `ResultScreen.jsx` — and only the specific lines
below, not a rewrite.

## 1. Files in this delivery

```
src/
  api/
    diagnoseApi.js        -> real API call, replaces mock data
  hooks/
    useDiagnosis.js        -> loading/success/error state around the API call
  utils/
    historyStore.js        -> localStorage past-scans list
    streak.js               -> localStorage "Healthy Farm Streak" counter
  components/
    ErrorCard.jsx/.css      -> error state UI (same animated card style)
    StreakBadge.jsx/.css    -> streak badge with confetti on milestone
  screens/
    HistoryScreen.jsx/.css  -> scrollable staggered list of past scans
  i18n/
    day3Resources.js       -> new translation keys
```

## 2. Wire up the i18n additions

In your app entry point, next to your Day 2 line:

```js
import './i18n';
import './i18n/day2Resources';
import './i18n/day3Resources'; // NEW
```

Fix the import path at the top of `day3Resources.js` if needed.

## 3. Set the real API endpoint

Create `.env.local` at your project root (Vite ignores this from git by
default):

```
VITE_DIAGNOSE_API_URL=https://your-teammates-endpoint.example.com/diagnose
```

Open `diagnoseApi.js` and check the field-name mapping at the bottom
matches whatever shape your teammate's endpoint actually returns.

## 4. Pass the real image from Upload to Loading

In `UploadScreen.jsx`, wherever you currently call `navigate('/loading')`
after the user taps "Scan plant", pass the selected file through router
state:

```jsx
navigate('/loading', { state: { image: selectedFile } });
```

(`selectedFile` is whatever variable you already hold the uploaded
`File` object in.)

## 5. Replace the fake delay in LoadingScreen with the real call

In `LoadingScreen.jsx`:

```jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDiagnosis from '../hooks/useDiagnosis';
import ErrorCard from '../components/ErrorCard';
import { addHistoryEntry, toDataUrl } from '../utils/historyStore';
import { recordScanForStreak } from '../utils/streak';

export default function LoadingScreen() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { status, runDiagnosis } = useDiagnosis();
  const image = state?.image;

  useEffect(() => {
    if (!image) {
      navigate('/'); // no image to diagnose — bounce back to Upload
      return;
    }

    runDiagnosis(image)
      .then(async (data) => {
        const thumbnail = await toDataUrl(image);
        addHistoryEntry({ thumbnail, disease: data.disease, severity: data.severity });
        recordScanForStreak(data.severity);
        navigate('/result', { state: { result: data } });
      })
      .catch(() => {
        // stays on this screen; status becomes 'error', handled below
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  if (status === 'error') {
    return (
      <div className="loading-screen"> {/* keep your existing wrapper class */}
        <ErrorCard onRetry={() => runDiagnosis(image)} />
      </div>
    );
  }

  return (
    <div className="loading-screen"> {/* your existing Day 1 JSX below, unchanged */}
      {/* your existing leaf/scanning icon + rotating status text */}
    </div>
  );
}
```

Keep all of your existing Day 1 animated leaf/status-text JSX inside the
final `return` — only the data-fetching logic above it is new.

## 6. Read the real result in ResultScreen

In `ResultScreen.jsx`, replace the hardcoded mock object:

```jsx
// OLD (Day 1):
// const result = { disease: 'Early Blight', confidence: 87, ... };

// NEW:
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const { state } = useLocation();
const navigate = useNavigate();
const result = state?.result;

useEffect(() => {
  if (!result) navigate('/'); // guard against someone landing here directly
}, [result, navigate]);

if (!result) return null;
```

Everything below that — the severity badge, the animated advice
checklist, the `needs_expert` alert, and your Day 2 `ListenButton` /
`OutbreakAlertCard` / `CostEstimatorCard` — stays exactly as it was, just
now reading from the real `result` instead of the mock constant.

## 7. Add the History screen + a way to reach it

In your router config (`App.jsx`):

```jsx
import HistoryScreen from './screens/HistoryScreen';

<Route path="/history" element={<HistoryScreen />} />
```

Add a simple nav button somewhere reachable (navbar or Upload screen):

```jsx
<button onClick={() => navigate('/history')} className="tap-target">
  📜 {t('history.title')}
</button>
```

## 8. Day 3 final polish pass (no new code — just checks)

Go screen by screen on an actual mobile viewport (or devtools mobile
emulation) and check:

- [ ] Upload → Loading → Result → back to Upload works end-to-end with
      a real image, on a real network response
- [ ] Turning off wifi mid-scan shows the `ErrorCard` and "Try Again"
      actually retries
- [ ] History screen shows the scan you just did, thumbnail included
- [ ] Streak badge increments and celebrates on the 5th/10th/15th... scan
- [ ] Language switch still fades all three screens correctly with real
      (non-mock) data
- [ ] Every tap target is comfortably thumb-sized (44px+) — spot check
      the smallest buttons
- [ ] No layout shift/jank when the advice checklist or history list is
      empty vs. full
- [ ] Nothing depends on the 2-second fake delay anymore (grep your
      codebase for the old `setTimeout` to make sure it's gone)

No new features from here — just bug fixes from this checklist.
