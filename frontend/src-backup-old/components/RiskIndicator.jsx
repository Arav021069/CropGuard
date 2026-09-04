import { useTranslation } from 'react-i18next';
import { getRiskLevel } from '../utils/risk';
import './RiskIndicator.css';

export default function RiskIndicator({ severity }) {
  const { t } = useTranslation();
  const risk = getRiskLevel(severity);

  return (
    <div className={`risk-indicator risk-indicator--${risk.level}`}>
      <span className="risk-indicator__icon" aria-hidden="true">{risk.icon}</span>
      <div>
        <div className="risk-indicator__label">{t(`risk.${risk.level}`)}</div>
        <div className="risk-indicator__desc">{t(`risk.${risk.level}_desc`)}</div>
      </div>
    </div>
  );
}
