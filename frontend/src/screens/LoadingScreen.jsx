import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useDiagnosis from '../hooks/useDiagnosis';
import ErrorCard from '../components/ErrorCard';
import { addHistoryEntry, toDataUrl } from '../utils/historyStore';
import { recordScanForStreak } from '../utils/streak';
import { validatePlantImage } from '../api/validatePlantImage';

export default function LoadingScreen() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [lineIndex, setLineIndex] = useState(0);
  const [invalidImage, setInvalidImage] = useState(false);
  const { status, runDiagnosis } = useDiagnosis();
  const image = state?.image;
  const crop = state?.crop;
  const lines = [t('loading.line1'), t('loading.line2'), t('loading.line3')];

  useEffect(() => {
    const textTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % lines.length);
    }, 700);
    return () => clearInterval(textTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  useEffect(() => {
    if (!image) {
      navigate('/'); // no image to diagnose — bounce back to Upload
      return;
    }
    startDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  async function startDiagnosis() {
    setInvalidImage(false);
    try {
      // Step 1: validate the image is actually a plant/leaf BEFORE the
      // disease classifier is ever called. A rejected image never reaches
      // diagnosePlant() / runDiagnosis() at all.
      const validation = await validatePlantImage(image);
      if (!validation.isPlantLeaf) {
        setInvalidImage(true);
        return;
      }

      // Step 2: only now do we call the existing disease diagnosis flow.
      const data = await runDiagnosis(image);
      const thumbnail = await toDataUrl(image);
      addHistoryEntry({ thumbnail, disease: data.disease, severity: data.severity });
      recordScanForStreak(data.severity);
      navigate('/result', { state: { result: data, crop } });
    } catch (err) {
      if (err?.isPlantValidationFailure) {
        // A real backend flagged the image as not a plant/leaf within its
        // own diagnosis response — treat identically to a validation
        // rejection above.
        setInvalidImage(true);
        return;
      }
      // Any other failure (network/API error) — status becomes 'error'
      // from useDiagnosis; the generic ErrorCard below handles it.
    }
  }

  if (invalidImage) {
    return (
      <div className="screen">
        <ErrorCard
          icon="🌿"
          title={t('validation.noPlantTitle')}
          message={t('validation.noPlantMessage')}
          retryLabel={t('validation.tryAgain')}
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="screen">
        <ErrorCard onRetry={startDiagnosis} />
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="loading-wrap">
        <svg className="leaf-draw" viewBox="0 0 100 100">
          <path d="M50 90 C20 80 15 40 50 10 C85 40 80 80 50 90 Z M50 90 L50 30" />
        </svg>
        <div className="loading-text">{lines[lineIndex]}</div>
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  );
}
