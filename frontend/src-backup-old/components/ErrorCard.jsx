import React from 'react';
import { useTranslation } from 'react-i18next';
import './ErrorCard.css';

// Render this inside your existing LoadingScreen's animated container
// when useDiagnosis's status === 'error'. See INTEGRATION.md.
//
// Also reused (not duplicated) for other friendly error states across the
// app — location permission denied, weather unavailable, invalid soil
// inputs, upload problems — by passing title/message/retryLabel overrides.
// With no overrides, behavior is identical to the original component.
export default function ErrorCard({ onRetry, title, message, retryLabel }) {
  const { t } = useTranslation();

  return (
    <div className="error-card">
      <span className="error-card__icon" aria-hidden="true">
        ⚠️
      </span>
      <p className="error-card__title">{title || t('error.title')}</p>
      <p className="error-card__message">{message || t('error.message')}</p>
      {onRetry && (
        <button type="button" className="error-card__retry" onClick={onRetry}>
          {retryLabel || t('error.retry')}
        </button>
      )}
    </div>
  );
}
