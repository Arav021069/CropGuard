import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CostEstimatorCard.css';

// Mock ₹ figures — swap for real numbers whenever there's a pricing source.
const MOCK_COSTS = {
  organic: { perAcre: 650, note: '2–3 rounds of neem spray' },
  chemical: { perAcre: 1200, note: 'Fungicide + labor' },
};

export default function CostEstimatorCard() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('organic');
  const data = MOCK_COSTS[mode];

  return (
    <div className="cost-card">
      <p className="cost-card__title">{t('cost.title')}</p>

      <div className="cost-toggle">
        <button
          type="button"
          className={
            'cost-toggle__option' +
            (mode === 'organic' ? ' cost-toggle__option--active' : '')
          }
          onClick={() => setMode('organic')}
        >
          {t('cost.organic')}
        </button>
        <button
          type="button"
          className={
            'cost-toggle__option' +
            (mode === 'chemical' ? ' cost-toggle__option--active' : '')
          }
          onClick={() => setMode('chemical')}
        >
          {t('cost.chemical')}
        </button>
        <span
          className={
            'cost-toggle__thumb' +
            (mode === 'chemical' ? ' cost-toggle__thumb--right' : '')
          }
          aria-hidden="true"
        />
      </div>

      <div className="cost-card__amount" key={mode}>
        <span className="cost-card__value">₹{data.perAcre}</span>
        <span className="cost-card__label">{t('cost.perAcre')}</span>
        <span className="cost-card__note">{data.note}</span>
      </div>
    </div>
  );
}
