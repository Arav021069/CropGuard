import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'hi', label: 'हिं', flag: '🇮🇳' },
  { code: 'mr', label: 'मरा', flag: '🇮🇳' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleChange = (code) => {
    if (code === i18n.language) return;
    i18n.changeLanguage(code);
    // Actual fade of the page content is handled by <PageFadeWrapper />
    // wrapping your routed content — see INTEGRATION.md.
  };

  return (
    <div className="lang-selector" role="group" aria-label="Select language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={
            'lang-selector__btn' +
            (i18n.language === lang.code ? ' lang-selector__btn--active' : '')
          }
          onClick={() => handleChange(lang.code)}
          aria-pressed={i18n.language === lang.code}
        >
          <span className="lang-selector__flag" aria-hidden="true">
            {lang.flag}
          </span>
          <span className="lang-selector__label">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
