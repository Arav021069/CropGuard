import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadScreen from './screens/UploadScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultScreen from './screens/ResultScreen';
import HistoryScreen from './screens/HistoryScreen';
import PageFadeWrapper from './components/PageFadeWrapper';

export default function App() {
  const { t, i18n } = useTranslation();
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span aria-hidden="true">🌿</span> {t('brand')}
        </div>
        <div className="topbar-actions">
          {location.pathname !== '/history' && (
            <button
              type="button"
              className="history-nav-btn tap-target"
              onClick={() => navigate('/history')}
              aria-label={t('history.title')}
            >
              🕘
            </button>
          )}
          <select
            className="lang-select"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="hi">हिं</option>
            <option value="mr">मर</option>
          </select>
        </div>
      </div>

      <PageFadeWrapper>
        <Routes>
          <Route path="/" element={<UploadScreen photo={photo} setPhoto={setPhoto} />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/result" element={<ResultScreen photo={photo} />} />
          <Route path="/history" element={<HistoryScreen />} />
        </Routes>
      </PageFadeWrapper>
    </div>
  );
}
