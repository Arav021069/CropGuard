import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getStreak, consumeMilestoneFlag } from '../utils/streak';
import './StreakBadge.css';

export default function StreakBadge() {
  const { t } = useTranslation();
  const [streak, setStreak] = useState(0);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setStreak(getStreak());
    if (consumeMilestoneFlag()) {
      setCelebrate(true);
      const timeout = setTimeout(() => setCelebrate(false), 1200);
      return () => clearTimeout(timeout);
    }
  }, []);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 160,
        y: -Math.random() * 100 - 20,
        rotate: Math.random() * 360,
        delay: Math.random() * 150,
      })),
    [celebrate]
  );

  return (
    <div className={'streak-badge' + (celebrate ? ' streak-badge--celebrate' : '')}>
      <span className="streak-badge__icon" aria-hidden="true">
        🔥
      </span>
      <div className="streak-badge__text">
        <span className="streak-badge__label">{t('streak.label')}</span>
        <span className="streak-badge__count">{t('streak.days', { count: streak })}</span>
      </div>

      {celebrate && (
        <div className="streak-confetti" aria-hidden="true">
          {confettiPieces.map((p) => (
            <span
              key={p.id}
              className="streak-confetti__piece"
              style={{
                '--x': `${p.x}px`,
                '--y': `${p.y}px`,
                '--r': `${p.rotate}deg`,
                animationDelay: `${p.delay}ms`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
