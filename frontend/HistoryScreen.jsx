import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getHistory } from '../utils/historyStore';
import StreakBadge from '../components/StreakBadge';
import './HistoryScreen.css';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="history-screen">
      <StreakBadge />

      <h1 className="history-screen__title">{t('history.title')}</h1>

      {entries.length === 0 ? (
        <p className="history-screen__empty">{t('history.empty')}</p>
      ) : (
        <ul className="history-list">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="history-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {entry.thumbnail ? (
                <img
                  src={entry.thumbnail}
                  alt={entry.disease}
                  className="history-card__thumb"
                />
              ) : (
                <div className="history-card__thumb history-card__thumb--placeholder" aria-hidden="true">
                  🌿
                </div>
              )}

              <div className="history-card__body">
                <p className="history-card__disease">{entry.disease}</p>
                <p className="history-card__date">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>

              {/* severity is expected to be 'mild' | 'moderate' | 'severe' —
                  matches the same values ResultScreen already uses for its badge */}
              <span className={`history-card__badge history-card__badge--${entry.severity}`}>
                {entry.severity}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
