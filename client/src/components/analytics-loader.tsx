import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ConfigItem {
  key: string;
  value: string;
}

export function AnalyticsLoader() {
  const { data: config } = useQuery<ConfigItem[]>({
    queryKey: ['/api/public/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!config) return;

    const configMap = config.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // Load Google Analytics 4
    if (configMap.analytics_enabled === 'true' && configMap.ga4_measurement_id) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${configMap.ga4_measurement_id}`;
      document.head.appendChild(gaScript);

      const gaInlineScript = document.createElement('script');
      gaInlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${configMap.ga4_measurement_id}');
      `;
      document.head.appendChild(gaInlineScript);
    }

    // Load Google AdSense
    if (configMap.adsense_enabled === 'true' && configMap.adsense_client_id) {
      const existingAdSenseScript = document.querySelector('script[src*="googlesyndication.com"]');
      if (!existingAdSenseScript) {
        const adSenseScript = document.createElement('script');
        adSenseScript.async = true;
        adSenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${configMap.adsense_client_id}`;
        adSenseScript.crossOrigin = 'anonymous';
        document.head.appendChild(adSenseScript);
      }
    }
  }, [config]);

  return null; // This component doesn't render anything
}