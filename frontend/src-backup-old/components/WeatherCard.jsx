import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getWeather } from '../api/weatherApi';
import './WeatherCard.css';

const CONDITION_ICON = {
  partly_cloudy: '⛅',
  sunny: '☀️',
  rainy: '🌧️',
  cloudy: '☁️',
  unknown: '🌡️',
};

export default function WeatherCard({ location }) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setWeather(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    getWeather(location.lat, location.lng)
      .then((data) => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location]);

  if (!location) {
    return (
      <div className="weather-card weather-card--fallback">
        <div className="card-title">{t('weather.title')}</div>
        <p className="weather-card__fallback-text">{t('weather.fallbackMessage')}</p>
      </div>
    );
  }

  if (loading || !weather) {
    return (
      <div className="weather-card">
        <div className="card-title">{t('weather.title')}</div>
        <p className="weather-card__fallback-text">{t('loading.line1')}</p>
      </div>
    );
  }

  return (
    <div className="weather-card">
      <div className="weather-card__header">
        <div className="card-title" style={{ marginBottom: 0 }}>{t('weather.title')}</div>
        {weather.isMock && <span className="weather-card__mock-tag">{t('weather.mockTag')}</span>}
      </div>
      <div className="weather-card__main">
        <span className="weather-card__icon" aria-hidden="true">
          {CONDITION_ICON[weather.condition] || CONDITION_ICON.unknown}
        </span>
        <span className="weather-card__temp">{weather.temperatureC}°C</span>
      </div>
      <div className="weather-card__details">
        <div><span aria-hidden="true">💧</span> {t('weather.humidity')}: {weather.humidityPercent}%</div>
        <div><span aria-hidden="true">🌦️</span> {t('weather.rainChance')}: {weather.rainChancePercent}%</div>
      </div>
    </div>
  );
}
