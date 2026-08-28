import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './ListenButton.css';

const SPEECH_LANG_MAP = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

// Pass the full text you want read aloud, already composed in plain
// language (see INTEGRATION.md for how ResultScreen builds this string
// from disease / confidence / advice).
export default function ListenButton({ text }) {
  const { t, i18n } = useTranslation();
  const [speaking, setSpeaking] = useState(false);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  if (!supported) return null;

  const handleToggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_LANG_MAP[i18n.language] || 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel(); // clear any queued speech first
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      className={'listen-btn' + (speaking ? ' listen-btn--active' : '')}
      onClick={handleToggle}
    >
      <span className="listen-btn__icon" aria-hidden="true">
        {speaking ? (
          <span className="sound-wave">
            <span />
            <span />
            <span />
            <span />
          </span>
        ) : (
          <span className="listen-btn__speaker">🔊</span>
        )}
      </span>
      <span className="listen-btn__label">
        {speaking ? t('listen.stop') : t('listen.button')}
      </span>
    </button>
  );
}
