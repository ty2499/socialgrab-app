// Google Analytics 4 utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Global config cache
let configCache: any = null;

// Helper to get config from admin settings
const getConfig = async () => {
  if (configCache) return configCache;
  
  try {
    const response = await fetch('/api/public/config');
    if (response.ok) {
      const config = await response.json();
      const configMap: any = {};
      config.forEach((item: any) => {
        configMap[item.key] = item.value;
      });
      
      configCache = {
        ga4MeasurementId: configMap.ga4_measurement_id || '',
        analyticsEnabled: configMap.analytics_enabled === 'true',
        trackDownloads: configMap.track_downloads === 'true',
        trackPageViews: configMap.track_page_views === 'true'
      };
      return configCache;
    }
  } catch (error) {
    console.warn('Failed to fetch analytics config:', error);
  }
  
  // Fallback config
  return {
    ga4MeasurementId: '',
    analyticsEnabled: false,
    trackDownloads: false,
    trackPageViews: false
  };
};

export const analytics = {
  // Initialize Google Analytics
  init: async () => {
    const config = await getConfig();
    
    if (!config.ga4MeasurementId || !config.analyticsEnabled || typeof window === 'undefined') {
      return;
    }

    // Add Google Analytics script to the head
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4MeasurementId}`;
    document.head.appendChild(script1);

    // Initialize gtag
    const script2 = document.createElement('script');
    script2.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.ga4MeasurementId}', {
        page_path: window.location.pathname,
        page_title: document.title
      });
    `;
    document.head.appendChild(script2);
  },

  // Track page views
  trackPageView: async (page_title: string, page_location: string) => {
    const config = await getConfig();
    if (typeof window !== 'undefined' && window.gtag && config.analyticsEnabled && config.trackPageViews) {
      window.gtag('config', config.ga4MeasurementId, {
        page_title,
        page_location,
      });
    }
  },

  // Track video info requests
  trackVideoInfoRequest: async (platform: string, url: string) => {
    const config = await getConfig();
    if (typeof window !== 'undefined' && window.gtag && config.analyticsEnabled) {
      window.gtag('event', 'video_info_request', {
        event_category: 'video_interaction',
        event_label: platform,
        custom_parameter_1: url,
      });
    }
  },

  // Track video downloads
  trackVideoDownload: async (platform: string, quality: string, success: boolean) => {
    const config = await getConfig();
    if (typeof window !== 'undefined' && window.gtag && config.analyticsEnabled && config.trackDownloads) {
      window.gtag('event', 'video_download', {
        event_category: 'video_interaction',
        event_label: platform,
        custom_parameter_1: quality,
        custom_parameter_2: success ? 'success' : 'failed',
      });
    }
  },

  // Track errors
  trackError: async (error_description: string, error_type: string) => {
    const config = await getConfig();
    if (typeof window !== 'undefined' && window.gtag && config.analyticsEnabled) {
      window.gtag('event', 'exception', {
        description: error_description,
        fatal: false,
        custom_parameter_1: error_type,
      });
    }
  },

  // Track user engagement
  trackEngagement: async (engagement_type: string, details?: string) => {
    const config = await getConfig();
    if (typeof window !== 'undefined' && window.gtag && config.analyticsEnabled) {
      window.gtag('event', 'engagement', {
        event_category: 'user_interaction',
        event_label: engagement_type,
        custom_parameter_1: details,
      });
    }
  },

  // Clear config cache (useful for admin settings updates)
  clearCache: () => {
    configCache = null;
  }
};

export default analytics;