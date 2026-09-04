import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './PageFadeWrapper.css';

// Wrap your routed page content with this ONCE, in your top-level layout
// (e.g. around <Outlet /> in App.jsx). Every time the language changes,
// it re-triggers a smooth fade over whatever is currently on screen —
// it does not care which screen (Upload/Loading/Result) is active.
export default function PageFadeWrapper({ children }) {
  const { i18n } = useTranslation();
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setFadeKey((k) => k + 1);
    i18n.on('languageChanged', handleLangChange);
    return () => i18n.off('languageChanged', handleLangChange);
  }, [i18n]);

  return (
    <div key={fadeKey} className="page-fade">
      {children}
    </div>
  );
}
