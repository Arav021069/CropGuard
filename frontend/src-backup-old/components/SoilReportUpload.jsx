import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './SoilReportUpload.css';

export default function SoilReportUpload({ file, onChange }) {
  const { t } = useTranslation();
  const inputRef = useRef(null);

  function handleFile(e) {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
  }

  function handleRemove() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="soil-report-upload">
      {!file ? (
        <label className="soil-report-upload__dropzone tap-target">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFile}
          />
          <span className="soil-report-upload__icon" aria-hidden="true">📄</span>
          <span className="soil-report-upload__cta">{t('soil.reportUploadCta')}</span>
          <span className="soil-report-upload__sub">{t('soil.reportUploadSub')}</span>
        </label>
      ) : (
        <div className="soil-report-upload__selected">
          <span aria-hidden="true">📄</span>
          <span className="soil-report-upload__filename">
            {t('soil.reportSelected', { name: file.name })}
          </span>
          <button
            type="button"
            className="soil-report-upload__remove"
            onClick={handleRemove}
          >
            {t('soil.reportRemove')}
          </button>
        </div>
      )}
    </div>
  );
}
