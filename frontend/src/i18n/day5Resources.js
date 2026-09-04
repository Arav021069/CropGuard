// src/i18n/day5Resources.js
//
// Same additive-merge pattern as day2/3/4Resources.js — only adds new
// keys/namespaces on top of the existing i18n setup.
import i18n from '../i18n';

const day5Resources = {
  en: {
    translation: {
      validation: {
        noPlantTitle: 'No plant detected',
        noPlantMessage: 'Please upload a clear photo of a plant leaf.',
        tryAgain: 'Try Again',
      },
    },
  },
  hi: {
    translation: {
      validation: {
        noPlantTitle: 'कोई पौधा नहीं मिला',
        noPlantMessage: 'कृपया पौधे की पत्ती की स्पष्ट फोटो अपलोड करें।',
        tryAgain: 'फिर कोशिश करें',
      },
    },
  },
  mr: {
    translation: {
      validation: {
        noPlantTitle: 'कोणतेही रोप आढळले नाही',
        noPlantMessage: 'कृपया रोपाच्या पानाचा स्पष्ट फोटो अपलोड करा.',
        tryAgain: 'पुन्हा प्रयत्न करा',
      },
    },
  },
};

Object.entries(day5Resources).forEach(([lng, namespaces]) => {
  Object.entries(namespaces).forEach(([ns, resources]) => {
    i18n.addResourceBundle(lng, ns, resources, true, true);
  });
});

export default day5Resources;
