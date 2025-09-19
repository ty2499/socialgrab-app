import { useEffect } from 'react';
import { useLocation } from 'wouter';
import analytics from '@/utils/analytics';
import { useQuery } from '@tanstack/react-query';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video';
  structuredData?: object;
}

export default function SEOHead({
  title,
  description,
  keywords,
  image = '/og-image.png',
  url,
  type = 'website',
  structuredData
}: SEOHeadProps) {
  const [location] = useLocation();
  
  // Fetch site configuration
  const { data: siteConfig } = useQuery({
    queryKey: ['/api/public/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Convert config array to object
  const config = (siteConfig && Array.isArray(siteConfig)) ? siteConfig.reduce((acc: any, item: any) => {
    acc[item.key] = item.value;
    return acc;
  }, {}) : {};
  
  // Use config values as defaults if not provided
  const finalTitle = title || `${config.site_name || 'SocialGrab'} - #1 Free Video Downloader for Facebook, TikTok, Pinterest & Instagram | Download HD Videos Online`;
  const finalDescription = description || config.site_description || 'Download high-quality videos from Facebook, TikTok, Pinterest, and Instagram for free. The fastest online video downloader with no registration required. Try now!';
  const finalKeywords = keywords || config.site_keywords || 'video downloader, facebook video download, tiktok video download, pinterest video download, instagram video download, social media downloader, free video downloader, online video downloader, download videos, hd video downloader, fast video downloader, no registration video downloader';
  const currentUrl = url || `${config.site_domain || 'https://socialgrab.app'}${location}`;
  
  useEffect(() => {
    document.title = finalTitle;
    
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('author', config.meta_author || 'SocialGrab Team');
    updateMetaTag('robots', config.meta_robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    updateMetaTag('language', config.language_code || 'en');
    updateMetaTag('theme-color', config.theme_color || '#3b82f6');
    
    // Google Site Verification
    if (config.google_site_verification) {
      updateMetaTag('google-site-verification', config.google_site_verification);
    }
    
    // Bing Site Verification
    if (config.bing_site_verification) {
      updateMetaTag('msvalidate.01', config.bing_site_verification);
    }
    
    // Open Graph tags
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:image', config.og_image || image, 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:type', type, 'property');
    updateMetaTag('og:site_name', config.site_name || 'SocialGrab', 'property');
    updateMetaTag('og:locale', `${config.language_code || 'en'}_US`, 'property');
    
    if (config.facebook_app_id) {
      updateMetaTag('fb:app_id', config.facebook_app_id, 'property');
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'property');
    updateMetaTag('twitter:title', finalTitle, 'property');
    updateMetaTag('twitter:description', finalDescription, 'property');
    updateMetaTag('twitter:image', config.og_image || image, 'property');
    updateMetaTag('twitter:url', currentUrl, 'property');
    
    if (config.twitter_handle) {
      updateMetaTag('twitter:site', config.twitter_handle, 'property');
      updateMetaTag('twitter:creator', config.twitter_handle, 'property');
    }
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);
    
    if (structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]#dynamic-structured-data');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        structuredDataScript.setAttribute('id', 'dynamic-structured-data');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(structuredData);
    }
    
    // Track page view if analytics is enabled
    if (config.analytics_enabled === 'true' && config.track_page_views === 'true') {
      analytics.trackPageView(finalTitle, currentUrl);
    }
    
  }, [finalTitle, finalDescription, finalKeywords, image, currentUrl, type, structuredData, config, siteConfig]);
  
  return null;
}