import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useConfig } from "@/hooks/useConfig.tsx";
import { useDownloadTracker } from "@/hooks/useDownloadTracker";
import { X } from "lucide-react";
import SubscriptionModal from "@/components/subscription-modal";
import AdMobBanner from "@/components/AdMobBanner";
import ImageAdBanner from "@/components/ImageAdBanner";

// Declare AdSense global
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  placement: 'header' | 'footer' | 'sidebar' | 'interstitial' | 'extra-interstitial' | 'post-download';
  className?: string;
  fallback?: React.ReactNode;
  adSlot?: string; // AdSense ad slot ID
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  forceShow?: boolean; // Force show ad regardless of download count
}

interface AdConfig {
  placement: string;
  adCode: string;
  isEnabled: boolean;
  adSenseSlot?: string;
  adMobUnitId?: string;
  adType?: 'adsense' | 'admob' | 'both' | 'image';
  imageDesktopUrl?: string;
  imageTabletUrl?: string;
  imageMobileUrl?: string;
  clickUrl?: string;
  altText?: string;
}

export default function AdBanner({ placement, className, fallback, adSlot, adFormat = 'auto', forceShow = false }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const { config } = useConfig();
  const { shouldShowMoreAds, shouldShowExtraInterstitial, downloadStats } = useDownloadTracker();

  // Platform detection
  const isMobileApp = () => {
    return (
      typeof window !== 'undefined' && 
      (window.plugins || window.navigator?.userAgent?.includes('wv') || 
       window.location.protocol === 'file:')
    );
  };

  const isWebApp = () => !isMobileApp();
  
  const { data: ads } = useQuery<AdConfig[]>({
    queryKey: ['/api/public/ads'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1
  });

  const adConfig = ads?.find(ad => ad.placement === placement);

  // AdSense configuration based on placement
  const getAdSenseConfig = () => {
    const configs = {
      header: { slot: '1234567890', style: 'display:block', format: 'horizontal' },
      footer: { slot: '1234567891', style: 'display:block', format: 'horizontal' },
      sidebar: { slot: '1234567892', style: 'display:block', format: 'vertical' },
      interstitial: { slot: '1234567893', style: 'display:block', format: 'rectangle' },
      'extra-interstitial': { slot: '1234567894', style: 'display:block', format: 'rectangle' },
      'post-download': { slot: '1234567895', style: 'display:block', format: 'rectangle' }
    };
    return configs[placement];
  };

  // Determine if this ad should be shown based on download count
  const shouldShowAd = () => {
    if (forceShow) return true;
    
    // Always show header and footer ads
    if (placement === 'header' || placement === 'footer') return true;
    
    // Show post-download ad after any successful download
    if (placement === 'post-download') return downloadStats.totalDownloads >= 1;
    
    // Show regular interstitial after any download
    if (placement === 'interstitial') return downloadStats.totalDownloads >= 1 || shouldShowMoreAds;
    
    // Show extra interstitials only for heavy users (5+ downloads)
    if (placement === 'extra-interstitial') return shouldShowExtraInterstitial;
    
    // Show sidebar ads for users with 5+ downloads
    if (placement === 'sidebar') return shouldShowMoreAds;
    
    return true;
  };

  const adsenseConfig = getAdSenseConfig();

  useEffect(() => {
    if (adConfig?.isEnabled && adRef.current && !adLoaded && adConfig.adType !== 'image') {
      if (adConfig.adCode) {
        // Custom ad code from admin
        adRef.current.innerHTML = adConfig.adCode;
        
        const scripts = adRef.current.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = document.createElement('script');
          script.textContent = scripts[i].textContent;
          if (scripts[i].src) {
            script.src = scripts[i].src;
          }
          document.head.appendChild(script);
        }
      } else if (adsenseConfig && typeof window !== 'undefined' && window.adsbygoogle) {
        // Google AdSense
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.warn('AdSense error:', error);
        }
      }
      setAdLoaded(true);
    }
  }, [adConfig, adsenseConfig, adLoaded]);

  // Check if ad should be shown based on download count and configuration
  if (!adConfig?.isEnabled || !shouldShowAd()) {
    return fallback ? <>{fallback}</> : null;
  }

  const renderAdSenseAd = () => {
    if (!adsenseConfig || !isWebApp()) return null;
    
    return (
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', minHeight: '60px' }}
        data-ad-client={config.adsense_client_id || config.adsensePublisherId || "ca-pub-XXXXXXXXX"}
        data-ad-slot={adConfig?.adSenseSlot || adSlot || adsenseConfig.slot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    );
  };

  const renderAdMobAd = () => {
    if (!isMobileApp() || !adConfig?.adMobUnitId) return null;
    
    const adMobPlacement = placement === 'interstitial' || placement === 'extra-interstitial' 
      ? 'interstitial' 
      : 'banner';
    
    return (
      <AdMobBanner 
        placement={adMobPlacement}
        adUnitId={adConfig.adMobUnitId}
        className={className}
      />
    );
  };


  return (
    <div 
      ref={adRef}
      className={`ad-container relative ${className || ''}`}
      style={{
        minHeight: placement === 'header' ? '90px' : 
                   placement === 'sidebar' ? '250px' : 
                   (placement === 'interstitial' || placement === 'extra-interstitial') ? '250px' : 
                   '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Ad close button that triggers subscription modal */}
      {adConfig?.isEnabled && (
        <SubscriptionModal
          title="Remove All Ads"
          description="Upgrade to Premium and enjoy an ad-free experience"
          highlightFeature="Ad-free experience"
        >
          <button className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </SubscriptionModal>
      )}
      
      {/* Render custom ad code or platform-specific ads */}
      {adConfig?.adCode ? null : (
        <>
          {adConfig.adType === 'image' ? (
            <ImageAdBanner 
              placement={placement}
              className="" // Remove className to avoid styling conflicts with wrapper
              fallback={fallback}
            />
          ) : (
            <>
              {renderAdSenseAd()}
              {renderAdMobAd()}
            </>
          )}
        </>
      )}
      
    </div>
  );
}