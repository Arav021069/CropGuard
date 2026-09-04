import React from 'react';
import { useTranslation } from 'react-i18next';
import './ErrorCard.css';

// Render this inside your existing LoadingScreen's animated container
// when useDiagnosis's status === 'error'. See INTEGRATION.md.
export default function ErrorCard({ onRetry }) {
  const { t } = useTranslation();

  return (
    <div className="error-card">
      <span className="error-card__icon" aria-hidden="true">
        ⚠️
      </span>
      <p className="error-card__title">{t('error.title')}</p>
      <p className="error-card__message">{t('error.message')}</p>
      <button type="button" className="error-card__retry" onClick={onRetry}>
        {t('error.retry')}
      </button>
    </div>
  );
}
