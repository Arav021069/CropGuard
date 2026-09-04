import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocationButton from './LocationButton';
import WeatherCard from './WeatherCard';
import SoilInputs from './SoilInputs';
import SoilReportUpload from './SoilReportUpload';
import './SoilDetailsSection.css';

export default function SoilDetailsSection({
  soilValues,
  onSoilValuesChange,
  soilReport,
  onSoilReportChange,
  location,
  onLocationChange,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="soil-details-section">
      <button
        type="button"
        className="soil-details-section__toggle tap-target"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>
          {t('soil.sectionTitle')}
          <span className="soil-details-section__optional-tag">{t('soil.optionalTag')}</span>
        </span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="soil-details-section__body">
          <p className="soil-details-section__subtitle">{t('soil.sectionSubtitle')}</p>

          <LocationButton location={location} onChange={onLocationChange} />
          <WeatherCard location={location} />
          <SoilInputs values={soilValues} onChange={onSoilValuesChange} />
          <SoilReportUpload file={soilReport} onChange={onSoilReportChange} />
        </div>
      )}
    </div>
  );
}
