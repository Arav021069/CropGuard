// src/utils/speechTranslate.js
//
// The Listen button must speak the diagnosis in the selected app language,
// not just change the voice/accent. The diagnosis data itself (from
// diagnoseApi.js, mock or real) is plain English text, so we map the known
// mock strings to the existing `diseases` / `adviceItems` translation keys
// already defined in src/locales/{en,hi,mr}.json and look up the localized
// text at speak-time using the current i18next instance.
//
// This does NOT change what's rendered on screen — only what's spoken.
// Any disease/advice text we don't recognize (e.g. from a future real
// backend) falls back to the original English string so speech never
// breaks, it just won't be translated for unmapped content.

const DISEASE_KEY_MAP = {
  'Early Blight': 'diseases.early_blight',
};

const ADVICE_KEY_MAP = {
  'Remove affected leaves': 'adviceItems.remove_leaves',
  'Apply neem spray': 'adviceItems.neem_spray',
  'Avoid overhead watering': 'adviceItems.avoid_overhead',
};

function translateOrFallback(t, key, fallback) {
  if (!key) return fallback;
  const translated = t(key);
  // i18next returns the key itself when there's no match — treat that as "not found"
  return translated === key ? fallback : translated;
}

// Builds the full text to be spoken, translated into the currently
// selected app language (via the same `t` used everywhere else).
export function buildSpeechText(result, t) {
  const diseaseText = translateOrFallback(
    t,
    DISEASE_KEY_MAP[result.disease],
    result.disease
  );

  const adviceText = (result.advice || []).map((line) =>
    translateOrFallback(t, ADVICE_KEY_MAP[line], line)
  );

  return [diseaseText, ...adviceText].join('. ');
}
