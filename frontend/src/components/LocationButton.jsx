import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorCard from './ErrorCard';
import './LocationButton.css';

export default function LocationButton({ location, onChange }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle'); // idle | loading | denied | unavailable

  function handleClick() {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('idle');
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');
      },
      { timeout: 10000 }
    );
  }

  if (status === 'denied' || status === 'unavailable') {
    return (
      <ErrorCard
        title={t(`location.${status}Title`)}
        message={t(`location.${status}Message`)}
        retryLabel={t('location.retry')}
        onRetry={() => {
          setStatus('idle');
          handleClick();
        }}
      />
    );
  }

  if (location) {
    return (
      <div className="location-status">
        <span aria-hidden="true">📍</span> {t('location.added')}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="location-btn tap-target"
      onClick={handleClick}
      disabled={status === 'loading'}
    >
      <span aria-hidden="true">📍</span>
      {status === 'loading' ? t('location.locating') : t('location.useMyLocation')}
    </button>
  );
}
