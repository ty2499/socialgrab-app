import { useDownloadTracker } from "@/hooks/useDownloadTracker";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp } from "lucide-react";

export default function DownloadStatsBanner() {
  const { downloadStats, shouldShowMoreAds } = useDownloadTracker();

  if (downloadStats.totalDownloads === 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
      <div className="flex items-center gap-2 text-sm">
        <Download className="w-4 h-4 text-primary" />
        <span className="text-primary font-medium">
          {downloadStats.totalDownloads} downloads
        </span>
        {downloadStats.todayDownloads > 0 && (
          <>
            <span className="text-primary/60">•</span>
            <Badge variant="secondary" className="text-xs">
              {downloadStats.todayDownloads} today
            </Badge>
          </>
        )}
        {shouldShowMoreAds && (
          <>
            <span className="text-primary/60">•</span>
            <div className="flex items-center gap-1 text-primary/80">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs">Premium ads active</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}