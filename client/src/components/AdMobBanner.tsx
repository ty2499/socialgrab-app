import { useEffect, useState } from 'react';
import { useDownloadTracker } from "@/hooks/useDownloadTracker";

interface AdMobBannerProps {
  placement: 'banner' | 'interstitial' | 'rewarded';
  adUnitId: string;
  className?: string;
}

// Declare global AdMob for mobile apps
declare global {
  interface Window {
    admob?: any;
    plugins?: any;
  }
}

export default function AdMobBanner({ placement, adUnitId, className }: AdMobBannerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { downloadStats } = useDownloadTracker();

  // Check if we're in a mobile app environment (APK)
  const isMobileApp = () => {
    return (
      typeof window !== 'undefined' && 
      (window.plugins || window.admob || 
       navigator.userAgent.includes('wv') || // WebView
       window.location.protocol === 'file:') // APK
    );
  };

  useEffect(() => {
    if (!isMobileApp()) {
      return; // Only run in mobile app
    }

    const loadAdMob = async () => {
      try {
        if (window.admob) {
          const adConfig = {
            id: adUnitId,
            isTesting: process.env.NODE_ENV === 'development',
            autoShow: placement === 'banner',
          };

          if (placement === 'banner') {
            await window.admob.banner.config(adConfig);
            await window.admob.banner.prepare();
            await window.admob.banner.show();
          } else if (placement === 'interstitial') {
            await window.admob.interstitial.config(adConfig);
            await window.admob.interstitial.prepare();
          } else if (placement === 'rewarded') {
            await window.admob.rewardvideo.config(adConfig);
            await window.admob.rewardvideo.prepare();
          }

          setIsLoaded(true);
        }
      } catch (err) {
        console.error('AdMob error:', err);
        setError(err instanceof Error ? err.message : 'AdMob failed to load');
      }
    };

    loadAdMob();
  }, [adUnitId, placement]);

  // Show interstitial based on download count
  const showInterstitial = async () => {
    if (window.admob && placement === 'interstitial') {
      try {
        await window.admob.interstitial.show();
      } catch (err) {
        console.error('Failed to show interstitial:', err);
      }
    }
  };

  // Auto-show interstitials for power users
  useEffect(() => {
    if (downloadStats.totalDownloads > 0 && downloadStats.totalDownloads % 3 === 0) {
      showInterstitial();
    }
  }, [downloadStats.totalDownloads]);

  // Only render in mobile app environment
  if (!isMobileApp()) {
    return null;
  }

  if (error) {
    return (
      <div className={`admob-error ${className}`}>
        <p className="text-red-500 text-sm">AdMob Error: {error}</p>
      </div>
    );
  }

  if (placement === 'banner') {
    return (
      <div 
        className={`admob-banner ${className}`}
        style={{ minHeight: '50px', textAlign: 'center' }}
      >
        {!isLoaded && (
          <div className="bg-gray-100 p-4 text-center text-gray-500 text-sm">
            Loading AdMob Banner...
          </div>
        )}
      </div>
    );
  }

  // Interstitial and rewarded ads don't need visible containers
  return null;
}