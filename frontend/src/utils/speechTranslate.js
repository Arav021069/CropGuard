// src/utils/speechTranslate.js
//
// The diagnosis data (from diagnoseApi.js, mock or real) is plain English
// text. We map the known mock strings to the existing `diseases` /
// `adviceItems` translation keys already defined in
// src/locales/{en,hi,mr}.json and look up the localized text using the
// current i18next instance.
//
// Used for BOTH the on-screen disease name/advice checklist (ResultScreen)
// and the spoken Listen output, so what's shown and what's spoken always
// match in the selected language.
//
// Any disease/advice text we don't recognize (e.g. from a future real
// backend) falls back to the original English string so nothing ever
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

// Translates a disease name for display or speech in the current language.
export function translateDiseaseName(disease, t) {
  return translateOrFallback(t, DISEASE_KEY_MAP[disease], disease);
}

// Translates one advice line for display or speech in the current language.
export function translateAdviceLine(line, t) {
  return translateOrFallback(t, ADVICE_KEY_MAP[line], line);
}

// Builds the full text to be spoken, translated into the currently
// selected app language (via the same `t` used everywhere else).
export function buildSpeechText(result, t) {
  const diseaseText = translateDiseaseName(result.disease, t);
  const adviceText = (result.advice || []).map((line) => translateAdviceLine(line, t));
  return [diseaseText, ...adviceText].join('. ');
}
