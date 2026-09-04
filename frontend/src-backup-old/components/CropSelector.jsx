import { useTranslation } from 'react-i18next';
import './CropSelector.css';

const CROPS = [
  { id: 'wheat', icon: '🌾' },
  { id: 'rice', icon: '🍚' },
  { id: 'tomato', icon: '🍅' },
  { id: 'potato', icon: '🥔' },
  { id: 'cotton', icon: '☁️' },
  { id: 'mustard', icon: '🌻' },
];

export default function CropSelector({ value, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="crop-selector">
      <div className="card-title">{t('crop.title')}</div>
      <div className="crop-selector__grid">
        {CROPS.map((crop) => (
          <button
            key={crop.id}
            type="button"
            className={
              'crop-card tap-target' + (value === crop.id ? ' crop-card--active' : '')
            }
            onClick={() => onChange(value === crop.id ? null : crop.id)}
            aria-pressed={value === crop.id}
          >
            <span className="crop-card__icon" aria-hidden="true">{crop.icon}</span>
            <span className="crop-card__label">{t(`crop.${crop.id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
