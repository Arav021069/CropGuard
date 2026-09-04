import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getActionPlanKey } from '../utils/actionPlan';
import './ActionPlanCard.css';

export default function ActionPlanCard({ disease }) {
  const { t } = useTranslation();
  const [showWhy, setShowWhy] = useState(false);
  const key = getActionPlanKey(disease);

  const steps = [
    { title: t('actionPlan.immediate'), text: t(`actionPlan.${key}.immediate`) },
    { title: t('actionPlan.treatment'), text: t(`actionPlan.${key}.treatment`) },
    { title: t('actionPlan.prevention'), text: t(`actionPlan.${key}.prevention`) },
    { title: t('actionPlan.expertHelp'), text: t(`actionPlan.${key}.expertHelp`) },
  ];

  return (
    <div className="card action-plan-card" style={{ animationDelay: '.15s' }}>
      <div className="card-title">{t('actionPlan.title')}</div>
      <p className="action-plan-card__subtitle">{t('actionPlan.subtitle')}</p>

      <ol className="action-plan-card__steps">
        {steps.map((step, i) => (
          <li key={step.title}>
            <span className="action-plan-card__num">{i + 1}</span>
            <div>
              <div className="action-plan-card__step-title">{step.title}</div>
              <div className="action-plan-card__step-text">{step.text}</div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        className="action-plan-card__why-btn"
        onClick={() => setShowWhy((v) => !v)}
        aria-expanded={showWhy}
      >
        {t('actionPlan.why')} <span aria-hidden="true">{showWhy ? '▲' : '▼'}</span>
      </button>
      {showWhy && (
        <p className="action-plan-card__why-text">{t(`actionPlan.${key}.why`)}</p>
      )}
    </div>
  );
}
