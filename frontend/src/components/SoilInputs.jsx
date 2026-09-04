import { useTranslation } from 'react-i18next';
import './SoilInputs.css';

function validatePH(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0 || num > 14) return 'phInvalid';
  return null;
}

function validatePositive(value) {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return 'valueInvalid';
  return null;
}

export default function SoilInputs({ values, onChange }) {
  const { t } = useTranslation();
  const phError = validatePH(values.ph);
  const nError = validatePositive(values.nitrogen);
  const pError = validatePositive(values.phosphorus);
  const kError = validatePositive(values.potassium);

  function handleField(field) {
    return (e) => onChange({ ...values, [field]: e.target.value });
  }

  return (
    <div className="soil-inputs">
      <div className="soil-field">
        <label htmlFor="soil-ph">{t('soil.phLabel')}</label>
        <input
          id="soil-ph"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="14"
          placeholder="6.5"
          value={values.ph}
          onChange={handleField('ph')}
        />
        <span className={`soil-field__hint ${phError ? 'soil-field__hint--error' : ''}`}>
          {phError ? t(`soil.${phError}`) : t('soil.phHint')}
        </span>
      </div>

      <div className="soil-field">
        <label htmlFor="soil-n">{t('soil.nitrogenLabel')}</label>
        <input
          id="soil-n"
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0"
          value={values.nitrogen}
          onChange={handleField('nitrogen')}
        />
        <span className={`soil-field__hint ${nError ? 'soil-field__hint--error' : ''}`}>
          {nError ? t(`soil.${nError}`) : t('soil.npkHint')}
        </span>
      </div>

      <div className="soil-field">
        <label htmlFor="soil-p">{t('soil.phosphorusLabel')}</label>
        <input
          id="soil-p"
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0"
          value={values.phosphorus}
          onChange={handleField('phosphorus')}
        />
        <span className={`soil-field__hint ${pError ? 'soil-field__hint--error' : ''}`}>
          {pError ? t(`soil.${pError}`) : t('soil.npkHint')}
        </span>
      </div>

      <div className="soil-field">
        <label htmlFor="soil-k">{t('soil.potassiumLabel')}</label>
        <input
          id="soil-k"
          type="number"
          inputMode="decimal"
          min="0"
          placeholder="0"
          value={values.potassium}
          onChange={handleField('potassium')}
        />
        <span className={`soil-field__hint ${kError ? 'soil-field__hint--error' : ''}`}>
          {kError ? t(`soil.${kError}`) : t('soil.npkHint')}
        </span>
      </div>
    </div>
  );
}
