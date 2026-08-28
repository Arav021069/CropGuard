import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [lineIndex, setLineIndex] = useState(0);
  const lines = [t('loading.line1'), t('loading.line2'), t('loading.line3')];

  useEffect(() => {
    const textTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length);
    }, 700);
    const doneTimer = setTimeout(() => {
      navigate('/result');
    }, 2000);
    return () => {
      clearInterval(textTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen">
      <div className="loading-wrap">
        <svg className="leaf-draw" viewBox="0 0 100 100">
          <path d="M50 90 C20 80 15 40 50 10 C85 40 80 80 50 90 Z M50 90 L50 30" />
        </svg>
        <div className="loading-text">{lines[lineIndex]}</div>
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}
