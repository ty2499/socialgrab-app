// AdMob Configuration for APK
export const ADMOB_CONFIG = {
  // Test Ad Unit IDs - Replace with your real IDs in production
  TEST_IDS: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917'
  },
  
  // Production Ad Unit IDs - Your actual AdMob IDs
  PRODUCTION_IDS: {
    BANNER: 'ca-app-pub-5415300142418751/3299151916',
    INTERSTITIAL: 'ca-app-pub-5415300142418751/9791605745',
    REWARDED: 'ca-app-pub-5415300142418751/5518121146'
  },

  // Ad placement mapping
  PLACEMENT_MAPPING: {
    'header': 'BANNER',
    'footer': 'BANNER',
    'sidebar': 'BANNER',
    'interstitial': 'INTERSTITIAL',
    'extra-interstitial': 'INTERSTITIAL'
  },

  // Initialize AdMob (called in mobile app)
  initialize: async () => {
    if (typeof window !== 'undefined' && window.admob) {
      try {
        await window.admob.start();
        console.log('AdMob initialized successfully');
        return true;
      } catch (error) {
        console.error('AdMob initialization failed:', error);
        return false;
      }
    }
    return false;
  },

  // Check if running in mobile app
  isMobileApp: () => {
    return (
      typeof window !== 'undefined' && 
      (window.plugins || window.admob || 
       navigator.userAgent.includes('wv') || // WebView
       window.location.protocol === 'file:') // APK
    );
  }
};

export default ADMOB_CONFIG;