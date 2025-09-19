import { CheckCircle } from "lucide-react";
import { SiFacebook, SiTiktok, SiPinterest, SiInstagram } from "react-icons/si";

interface PlatformDetectionProps {
  url: string;
  detectedPlatform?: string;
  isLoading?: boolean;
}

export default function PlatformDetection({ url, detectedPlatform, isLoading }: PlatformDetectionProps) {
  const platforms = [
    { id: "facebook", name: "Facebook", icon: SiFacebook },
    { id: "tiktok", name: "TikTok", icon: SiTiktok },
    { id: "pinterest", name: "Pinterest", icon: SiPinterest },
    { id: "instagram", name: "Instagram", icon: SiInstagram },
  ];

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 md:gap-6 p-3 sm:p-4 bg-gray-50 rounded-xl">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        const isDetected = detectedPlatform === platform.id;
        const isActive = isDetected || isLoading;
        
        return (
          <div
            key={platform.id}
            className={`flex items-center space-x-1 sm:space-x-2 transition-colors duration-200 ${
              isDetected
                ? "text-primary"
                : isActive
                ? "text-gray-600"
                : "text-gray-400"
            }`}
          >
            <Icon className="text-base sm:text-lg md:text-xl" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{platform.name}</span>
            {isDetected && <CheckCircle className="text-sm" />}
          </div>
        );
      })}
    </div>
  );
}
