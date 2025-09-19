import { useQuery } from '@tanstack/react-query';

interface ConfigItem {
  key: string;
  value: string;
  description: string;
  type: string;
  category: string;
}

interface ParsedConfig {
  siteName: string;
  siteDescription: string;
  siteDomain: string;
  ga4MeasurementId: string;
  analyticsEnabled: boolean;
  trackDownloads: boolean;
  trackPageViews: boolean;
  googleSiteVerification: string;
  bingSiteVerification: string;
  ogImage: string;
  twitterHandle: string;
  facebookAppId: string;
  metaAuthor: string;
  metaRobots: string;
  languageCode: string;
  themeColor: string;
  sitemapEnabled: boolean;
  robotsTxtEnabled: boolean;
  structuredDataEnabled: boolean;
  canonicalUrlsEnabled: boolean;
  adsensePublisherId: string;
  adsense_client_id: string;
  raw: ConfigItem[];
}

export function useConfig() {
  const { data: configData, ...queryProps } = useQuery<ConfigItem[]>({
    queryKey: ['/api/public/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });

  // Parse config array into a usable object
  const config: ParsedConfig = {
    siteName: getConfigValue(configData, 'site_name', 'SocialGrab'),
    siteDescription: getConfigValue(
      configData,
      'site_description',
      'Download videos from Facebook, TikTok, Pinterest, and Instagram in high quality. Fast, free, and easy-to-use online video downloader.'
    ),
    siteDomain: getConfigValue(configData, 'site_domain', 'https://socialgrab.app'),
    ga4MeasurementId: getConfigValue(configData, 'ga4_measurement_id', ''),
    analyticsEnabled: getConfigValue(configData, 'analytics_enabled', 'true') === 'true',
    trackDownloads: getConfigValue(configData, 'track_downloads', 'true') === 'true',
    trackPageViews: getConfigValue(configData, 'track_page_views', 'true') === 'true',
    googleSiteVerification: getConfigValue(configData, 'google_site_verification', ''),
    bingSiteVerification: getConfigValue(configData, 'bing_site_verification', ''),
    ogImage: getConfigValue(configData, 'og_image', '/og-image.png'),
    twitterHandle: getConfigValue(configData, 'twitter_handle', '@socialgrab'),
    facebookAppId: getConfigValue(configData, 'facebook_app_id', ''),
    metaAuthor: getConfigValue(configData, 'meta_author', 'SocialGrab Team'),
    metaRobots: getConfigValue(configData, 'meta_robots', 'index,follow'),
    languageCode: getConfigValue(configData, 'language_code', 'en'),
    themeColor: getConfigValue(configData, 'theme_color', '#3b82f6'),
    sitemapEnabled: getConfigValue(configData, 'sitemap_enabled', 'true') === 'true',
    robotsTxtEnabled: getConfigValue(configData, 'robots_txt_enabled', 'true') === 'true',
    structuredDataEnabled: getConfigValue(configData, 'structured_data_enabled', 'true') === 'true',
    canonicalUrlsEnabled: getConfigValue(configData, 'canonical_urls_enabled', 'true') === 'true',
    adsensePublisherId: getConfigValue(configData, 'adsense_publisher_id', ''),
    adsense_client_id: getConfigValue(configData, 'adsense_client_id', ''),
    raw: configData || [],
  };

  return {
    config,
    ...queryProps,
  };
}

function getConfigValue(configData: ConfigItem[] | undefined, key: string, defaultValue: string): string {
  if (!configData) return defaultValue;
  const item = configData.find(c => c.key === key);
  return item?.value || defaultValue;
}