import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UploadScreen from './screens/UploadScreen';
import LoadingScreen from './screens/LoadingScreen';
import ResultScreen from './screens/ResultScreen';

export default function App() {
  const { t, i18n } = useTranslation();
  const [photo, setPhoto] = useState(null);

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span aria-hidden="true">🌿</span> {t('brand')}
        </div>
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

      <Routes>
        <Route path="/" element={<UploadScreen photo={photo} setPhoto={setPhoto} />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/result" element={<ResultScreen photo={photo} />} />
      </Routes>
    </div>
  );
}
