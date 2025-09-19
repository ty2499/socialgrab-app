import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";

interface AdConfig {
  id: string;
  placement: string;
  adType: string;
  isEnabled: boolean;
  imageDesktopUrl?: string;
  imageTabletUrl?: string;
  imageMobileUrl?: string;
  clickUrl?: string;
  altText?: string;
}

interface ImageAdBannerProps {
  placement: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function ImageAdBanner({ placement, className = "", fallback }: ImageAdBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');

  // Fetch ad configuration
  const { data: ads } = useQuery<AdConfig[]>({
    queryKey: ['/api/public/ads'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const adConfig = ads?.find(ad => ad.placement === placement);

  // Don't render if ad is disabled, not configured, or not image type
  if (!adConfig || !adConfig.isEnabled || adConfig.adType !== 'image') {
    return fallback ? <>{fallback}</> : null;
  }

  // Check if we have any image URLs configured
  if (!adConfig.imageDesktopUrl && !adConfig.imageTabletUrl && !adConfig.imageMobileUrl) {
    return fallback ? <>{fallback}</> : null;
  }

  const handleImageClick = () => {
    if (adConfig.clickUrl) {
      window.open(adConfig.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const failedSrc = e.currentTarget.src;
    console.warn('Image failed to load:', failedSrc);
    setImageError(true);
  };


  if (imageError) {
    return fallback ? <>{fallback}</> : null;
  }

  // Get responsive image URL based on screen size and availability
  const getResponsiveImageUrl = () => {
    // Get viewport width (fallback for SSR)
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    // Priority order based on viewport
    let priorityUrls: (string | undefined)[] = [];
    
    if (width >= 1024) {
      // Desktop
      priorityUrls = [adConfig.imageDesktopUrl, adConfig.imageTabletUrl, adConfig.imageMobileUrl];
    } else if (width >= 768) {
      // Tablet
      priorityUrls = [adConfig.imageTabletUrl, adConfig.imageDesktopUrl, adConfig.imageMobileUrl];
    } else {
      // Mobile
      priorityUrls = [adConfig.imageMobileUrl, adConfig.imageTabletUrl, adConfig.imageDesktopUrl];
    }
    
    return priorityUrls.filter(Boolean)[0] as string | undefined;
  };

  // Update image source when config changes or on mount
  useEffect(() => {
    const newSrc = getResponsiveImageUrl();
    if (newSrc && newSrc !== currentImageSrc) {
      setCurrentImageSrc(newSrc);
      setImageError(false);
    }
  }, [adConfig?.imageDesktopUrl, adConfig?.imageTabletUrl, adConfig?.imageMobileUrl, currentImageSrc]);
  
  if (!currentImageSrc) {
    console.warn(`No valid image URLs found for ad placement: ${placement}`);
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className={`relative group ${className}`} data-testid={`image-ad-${placement}`}>
      {/* Ad label */}
      <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Ad
      </div>

      {/* Responsive image with fallback handling */}
      <div 
        className={`transition-transform duration-200 hover:scale-[1.02] ${adConfig.clickUrl ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={adConfig.clickUrl ? handleImageClick : undefined}
        data-testid={`image-ad-container-${placement}`}
      >
        <img
          src={currentImageSrc}
          alt={adConfig.altText || `Advertisement`}
          className="w-full h-auto rounded-lg shadow-md"
          onError={handleImageError}
          loading="lazy"
        />

        {/* External link indicator */}
        {adConfig.clickUrl && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink size={16} />
          </div>
        )}
      </div>
    </div>
  );
}