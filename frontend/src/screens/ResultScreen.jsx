import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Mock diagnosis data — swap this for a real API response later.
const MOCK_RESULT = {
  disease: 'Early Blight',
  confidence: 87,
  severity: 'moderate', // 'low' | 'moderate' | 'high'
  advice: [
    'Remove affected leaves',
    'Apply neem spray',
    'Avoid overhead watering',
  ],
  needs_expert: true,
  outbreak_nearby: { count: 5, radius_km: 10 },
};

export default function ResultScreen({ photo }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [speaking, setSpeaking] = useState(false);
  const result = MOCK_RESULT;

  function handleListen() {
    if (!('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const text = [result.disease, ...result.advice].join('. ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  return (
    <div className="screen">
      {photo && <img className="result-photo" src={photo} alt="Scanned leaf" />}

      <div className="result-header">
        <div>
          <h2>{result.disease}</h2>
          <div className="meta">{result.confidence}% {t('result.confidence')}</div>
        </div>
        <span className={`badge ${result.severity}`}>
          {t(`result.severity_${result.severity}`)}
        </span>
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
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card tint-wheat" style={{ animationDelay: '.2s' }}>
        <div className="alert-row">
          <span className="alert-icon">📍</span>
          <div>
            <div className="alert-title">{t('result.outbreakTitle')}</div>
            <div className="alert-text">
              {t('result.outbreakText', {
                count: result.outbreak_nearby.count,
                radius: result.outbreak_nearby.radius_km,
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

      <button className="scan-again-link" onClick={() => navigate('/')}>
        {t('result.scanAgain')}
      </button>
    </div>
  );
}
