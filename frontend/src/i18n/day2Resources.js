// src/i18n/day2Resources.js
//
// Day 2 addition. This does NOT touch your existing Day 1 i18n setup or
// locale files. It imports your already-configured i18n instance and
// merges in the new keys needed for Day 2 features.
//
// >>> Adjust the import path below to point at wherever your Day 1
// >>> i18next config file lives (e.g. '../i18n', './index', '../i18n/config').
import i18n from '../i18n';

const day2Resources = {
  en: {
    translation: {
      navbar: {
        language: 'Language',
      },
      listen: {
        button: 'Listen',
        stop: 'Stop',
      },
      outbreak: {
        title: 'Nearby Outbreak Alert',
        message: '{{count}} farmers within {{distance}}km reported this disease this week',
      },
      cost: {
        title: 'Treatment Cost Estimate',
        organic: 'Organic',
        chemical: 'Chemical',
        perAcre: 'Estimated cost per acre',
      },
    },
  },
  hi: {
    translation: {
      navbar: {
        language: 'भाषा',
      },
      listen: {
        button: 'सुनें',
        stop: 'रोकें',
      },
      outbreak: {
        title: 'आसपास प्रकोप चेतावनी',
        message: 'इस सप्ताह {{distance}} किमी के भीतर {{count}} किसानों ने इस बीमारी की सूचना दी',
      },
      cost: {
        title: 'उपचार लागत अनुमान',
        organic: 'जैविक',
        chemical: 'रासायनिक',
        perAcre: 'प्रति एकड़ अनुमानित लागत',
      },
    },
  },
  mr: {
    translation: {
      navbar: {
        language: 'भाषा',
      },
      listen: {
        button: 'ऐका',
        stop: 'थांबवा',
      },
      outbreak: {
        title: 'जवळपास उद्रेक इशारा',
        message: 'या आठवड्यात {{distance}} किमी परिसरात {{count}} शेतकऱ्यांनी या रोगाची नोंद केली',
      },
      cost: {
        title: 'उपचार खर्च अंदाज',
        organic: 'सेंद्रिय',
        chemical: 'रासायनिक',
        perAcre: 'प्रति एकर अंदाजे खर्च',
      },
    },
  },
};

Object.entries(day2Resources).forEach(([lng, namespaces]) => {
  Object.entries(namespaces).forEach(([ns, resources]) => {
    // deepMerge=true, overwrite=true -> safely merges into whatever
    // 'translation' namespace already has from Day 1, no overlap/loss.
    i18n.addResourceBundle(lng, ns, resources, true, true);
  });
});

export default day2Resources;
