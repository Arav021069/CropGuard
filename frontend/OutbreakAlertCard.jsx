import React from 'react';
import { useTranslation } from 'react-i18next';
import './OutbreakAlertCard.css';

// Mock data for now — swap count/distanceKm for real values on Day 3
// when this gets wired to the teammate's API.
export default function OutbreakAlertCard({ count = 5, distanceKm = 10 }) {
  const { t } = useTranslation();

  return (
    <div className="outbreak-card">
      <span className="outbreak-card__icon" aria-hidden="true">
        📍
      </span>
      <div className="outbreak-card__body">
        <p className="outbreak-card__title">{t('outbreak.title')}</p>
        <p className="outbreak-card__message">
          {t('outbreak.message', { count, distance: distanceKm })}
        </p>
      </div>
    </div>
  );
}
