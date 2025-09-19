import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Crown, Lock } from "lucide-react";
import SubscriptionModal from "@/components/subscription-modal";

interface QualitySelectorProps {
  value: string;
  onChange: (value: string) => void;
  formats: Array<{ quality: string; fileSize: number; format: string }>;
  userSubscription?: {
    plan?: string;
    maxVideoQuality?: string;
    removeAds?: boolean;
  } | null;
}

export default function QualitySelector({ value, onChange, formats, userSubscription }: QualitySelectorProps) {
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case "high": return "High Quality";
      case "medium": return "Medium";
      case "low": return "Low";
      case "2k": return "2K Quality";
      case "4k": return "4K Quality";
      default: return quality;
    }
  };

  const getResolution = (quality: string) => {
    switch (quality) {
      case "high": return "1080p";
      case "medium": return "720p";
      case "low": return "480p";
      case "2k": return "1440p";
      case "4k": return "2160p";
      default: return "";
    }
  };

  const isPremiumQuality = (quality: string) => {
    return quality === "2k" || quality === "4k";
  };

  const canAccessQuality = (quality: string) => {
    if (!isPremiumQuality(quality)) return true;
    if (!userSubscription) return false;
    
    const qualityHierarchy = ["low", "medium", "high", "2k", "4k"];
    const maxIndex = qualityHierarchy.indexOf(userSubscription.maxVideoQuality || "high");
    const requiredIndex = qualityHierarchy.indexOf(quality);
    
    return requiredIndex <= maxIndex;
  };

  const handleQualityClick = (quality: string) => {
    if (canAccessQuality(quality)) {
      onChange(quality);
    }
    // For premium qualities that user can't access, the subscription modal will be triggered by the button click
  };

  return (
    <RadioGroup value={value} onValueChange={handleQualityClick} className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {formats.map((format) => {
        const qualityComponent = (
          <Label
            key={format.quality}
            htmlFor={format.quality}
            className="relative cursor-pointer"
          >
            <RadioGroupItem value={format.quality} id={format.quality} className="sr-only" />
            <div
              className={`p-4 border-2 rounded-xl transition-all duration-200 relative ${
                value === format.quality
                  ? "border-primary bg-primary/10"
                  : canAccessQuality(format.quality)
                  ? "border-gray-200 hover:border-gray-300"
                  : "border-gray-200 bg-gray-50 opacity-75"
              }`}
            >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-gray-900">{getQualityLabel(format.quality)}</div>
                  {isPremiumQuality(format.quality) && (
                    <div className="flex items-center gap-1">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        Premium
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {getResolution(format.quality)} • {formatSize(format.fileSize)}
                </div>
                {isPremiumQuality(format.quality) && !canAccessQuality(format.quality) && (
                  <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Upgrade required
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                {value === format.quality ? (
                  <CheckCircle className="text-primary text-lg" />
                ) : canAccessQuality(format.quality) ? (
                  <Circle className="text-gray-300 text-lg" />
                ) : (
                  <Lock className="text-gray-400 text-lg" />
                )}
              </div>
              </div>
            </div>
          </Label>
        );

        // Wrap premium qualities that user can't access with subscription modal
        if (isPremiumQuality(format.quality) && !canAccessQuality(format.quality)) {
          return (
            <SubscriptionModal
              key={format.quality}
              title="Upgrade to Premium"
              description={`${getQualityLabel(format.quality)} downloads require a premium subscription`}
              highlightFeature={`${getQualityLabel(format.quality)} downloads`}
            >
              {qualityComponent}
            </SubscriptionModal>
          );
        }

        return qualityComponent;
      })}
    </RadioGroup>
  );
}
