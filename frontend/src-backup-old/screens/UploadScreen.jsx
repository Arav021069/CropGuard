import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CropSelector from '../components/CropSelector';
import SoilDetailsSection from '../components/SoilDetailsSection';
import { buildDiagnosisRequest } from '../api/buildDiagnosisRequest';

export default function UploadScreen({ photo, setPhoto }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const rawFileRef = useRef(null);
  const preview = photo;

  // New optional fields — none of these block the existing Upload -> Loading
  // -> Result -> History flow. Only the plant photo is required to scan.
  const [crop, setCrop] = useState(null);
  const [soilValues, setSoilValues] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
  });
  const [soilReport, setSoilReport] = useState(null);
  const [location, setLocation] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    rawFileRef.current = file;
    setPhoto(URL.createObjectURL(file));
  }

  function handleScan() {
    // Backend-ready request object, built for future use only — nothing
    // here calls a network endpoint. See src/api/buildDiagnosisRequest.js.
    const diagnosisRequest = buildDiagnosisRequest({
      crop,
      soilPH: soilValues.ph,
      nitrogen: soilValues.nitrogen,
      phosphorus: soilValues.phosphorus,
      potassium: soilValues.potassium,
      location,
      soilReport,
      plantImage: rawFileRef.current,
    });

    navigate('/loading', {
      state: { image: rawFileRef.current, crop, diagnosisRequest },
    });
  }

  return (
    <div className="screen">
      <div className="hero-copy">
        <h1>{t('upload.title')}</h1>
        <p>{t('upload.subtitle')}</p>
      </div>

      <CropSelector value={crop} onChange={setCrop} />

      <SoilDetailsSection
        soilValues={soilValues}
        onSoilValuesChange={setSoilValues}
        soilReport={soilReport}
        onSoilReportChange={setSoilReport}
        location={location}
        onLocationChange={setLocation}
      />

      {!preview ? (
        <label className="upload-dropzone">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
          />
          <div className="leaf-badge" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21c-4.5-1-8-4.5-8-9.5C4 7 7.5 3.5 12 3c-1 4.5-1 8 0 11.5 1-3.5 1-7 0-11.5 4.5.5 8 4 8 8.5 0 5-3.5 8.5-8 9.5Z"
                stroke="#24513A"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="cta-label">{t('upload.cta')}</div>
          <div className="cta-sub">{t('upload.ctaSub')}</div>
        </label>
      ) : (
        <div className="preview-wrap">
          <img src={preview} alt="Selected crop leaf" />
          <button className="retake-chip" onClick={() => setPhoto(null)}>
            {t('upload.retake')}
          </button>
        </div>
      )}

      <div className="sticky-cta">
        <button className="btn-primary tap-target" disabled={!preview} onClick={handleScan}>
          {t('upload.scanButton')}
        </button>
      </div>
    </div>
  );
}
