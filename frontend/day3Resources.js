// src/i18n/day3Resources.js
//
// Day 3 addition. Same pattern as day2Resources.js — merges new keys
// into your existing i18n instance without touching Day 1/2 locale files.
//
// >>> Adjust the import path below if your i18n config lives elsewhere.
import i18n from '../i18n';

const day3Resources = {
  en: {
    translation: {
      history: {
        title: 'Your Past Scans',
        empty: 'No scans yet. Scan a plant to get started.',
      },
      streak: {
        label: 'Healthy Farm Streak',
        days: '{{count}} day streak',
        milestone: 'Milestone reached!',
      },
      error: {
        title: 'Something went wrong',
        message: "We couldn't check your plant. Check your connection and try again.",
        retry: 'Try Again',
      },
    },
  },
  hi: {
    translation: {
      history: {
        title: 'आपकी पिछली जांचें',
        empty: 'अभी तक कोई स्कैन नहीं। शुरू करने के लिए पौधे को स्कैन करें।',
      },
      streak: {
        label: 'स्वस्थ खेत लगातार दिन',
        days: '{{count}} दिन की लगातार श्रृंखला',
        milestone: 'उपलब्धि हासिल!',
      },
      error: {
        title: 'कुछ गलत हो गया',
        message: 'हम आपके पौधे की जांच नहीं कर सके। कृपया कनेक्शन जांचें और फिर से प्रयास करें।',
        retry: 'फिर से प्रयास करें',
      },
    },
  },
  mr: {
    translation: {
      history: {
        title: 'तुमचे मागील स्कॅन',
        empty: 'अजून कोणतेही स्कॅन नाही. सुरुवात करण्यासाठी वनस्पती स्कॅन करा.',
      },
      streak: {
        label: 'निरोगी शेत सलग दिवस',
        days: '{{count}} दिवसांची सलग मालिका',
        milestone: 'टप्पा गाठला!',
      },
      error: {
        title: 'काहीतरी चूक झाली',
        message: 'आम्ही तुमच्या वनस्पतीची तपासणी करू शकलो नाही. कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.',
        retry: 'पुन्हा प्रयत्न करा',
      },
    },
  },
};

Object.entries(day3Resources).forEach(([lng, namespaces]) => {
  Object.entries(namespaces).forEach(([ns, resources]) => {
    i18n.addResourceBundle(lng, ns, resources, true, true);
  });
});

export default day3Resources;
