import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function UploadScreen({ photo, setPhoto }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const preview = photo;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
  }

  function handleScan() {
    navigate('/loading');
  }

  return (
    <div className="screen">
      <div className="hero-copy">
        <h1>{t('upload.title')}</h1>
        <p>{t('upload.subtitle')}</p>
      </div>

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
        <button className="btn-primary" disabled={!preview} onClick={handleScan}>
          {t('upload.scanButton')}
        </button>
      </div>
    </div>
  );
}
