import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CostEstimatorCard from '../components/CostEstimatorCard';
import RiskIndicator from '../components/RiskIndicator';
import ActionPlanCard from '../components/ActionPlanCard';
import { buildSpeechText, translateDiseaseName, translateAdviceLine } from '../utils/speechTranslate';

// Outbreak alert is mock data by design (per spec), independent of the
// diagnosis API result.
const OUTBREAK_MOCK = { count: 5, radius_km: 10 };

export default function ResultScreen({ photo }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [speaking, setSpeaking] = useState(false);
  const result = state?.result;
  const crop = state?.crop;

  useEffect(() => {
    if (!result) navigate('/'); // guard against landing here directly
  }, [result, navigate]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!result) return null;

  function speechLangFor(language) {
    if (language === 'hi') return 'hi-IN';
    if (language === 'mr') return 'mr-IN';
    return 'en-IN';
  }

  // Some browsers stay on their default voice unless a matching voice is
  // explicitly assigned, even when `lang` is set correctly — this picks
  // the closest available system voice for the target language, if any.
  function pickVoice(lang) {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(lang.split('-')[0].toLowerCase())) ||
      null
    );
  }

  function handleListen() {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = buildSpeechText(result, t);
    const lang = speechLangFor(i18n.language);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="screen">
      {photo && <img className="result-photo" src={photo} alt="Scanned leaf" />}

      <div className="card" style={{ animationDelay: '.05s' }}>
        <div className="result-header" style={{ marginTop: 0 }}>
          <div>
            <h2>{translateDiseaseName(result.disease, t)}</h2>
            <div className="meta">{result.confidence}% {t('result.confidence')}</div>
            {crop && (
              <div className="result-crop-chip">
                {t('result.cropLabel')}: {t(`crop.${crop}`)}
              </div>
            )}
          </div>
          <span className={`badge ${result.severity}`}>
            {t(`result.severity_${result.severity}`)}
          </span>
        </div>

        <RiskIndicator severity={result.severity} />
      </div>

      <button
        className={`voice-btn ${speaking ? 'speaking' : ''}`}
        onClick={handleListen}
      >
        <span>{speaking ? t('result.speaking') : `🔊 ${t('result.listen')}`}</span>
        {speaking && (
          <span className="wave"><span></span><span></span><span></span></span>
        )}
      </button>

      <div className="card" style={{ animationDelay: '.1s' }}>
        <div className="card-title">{t('result.adviceTitle')}</div>
        <ul className="advice-list">
          {result.advice.map((line) => (
            <li key={line}>
              <span className="check-dot">✓</span>
              <span>{translateAdviceLine(line, t)}</span>
            </li>
          ))}
        </ul>
      </div>

      <ActionPlanCard disease={result.disease} />

      <CostEstimatorCard />

      <div className="card tint-wheat" style={{ animationDelay: '.2s' }}>
        <div className="alert-row">
          <span className="alert-icon">📍</span>
          <div>
            <div className="alert-title">{t('result.outbreakTitle')}</div>
            <div className="alert-text">
              {t('result.outbreakText', {
                count: OUTBREAK_MOCK.count,
                radius: OUTBREAK_MOCK.radius_km,
              })}
            </div>
          </div>
        </div>
      </div>

      {result.needs_expert && (
        <div className="card tint-terracotta" style={{ animationDelay: '.3s' }}>
          <div className="alert-row">
            <span className="alert-icon">🏛️</span>
            <div>
              <div className="alert-title">{t('result.expertTitle')}</div>
              <div className="alert-text">{t('result.expertText')}</div>
            </div>
          </div>
        </div>
      )}

      <button className="btn-ghost history-link-btn" onClick={() => navigate('/history')}>
        {t('history.viewLink')}
      </button>

      <button className="scan-again-link" onClick={() => navigate('/')}>
        {t('result.scanAgain')}
      </button>
    </div>
  );
}
