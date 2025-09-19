import { useState, useEffect } from 'react';

interface DownloadStats {
  totalDownloads: number;
  todayDownloads: number;
  lastDownloadDate: string;
}

export function useDownloadTracker() {
  const [downloadStats, setDownloadStats] = useState<DownloadStats>({
    totalDownloads: 0,
    todayDownloads: 0,
    lastDownloadDate: new Date().toDateString()
  });

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem('downloadStats');
    if (saved) {
      const stats = JSON.parse(saved);
      const today = new Date().toDateString();
      
      // Reset daily count if it's a new day
      if (stats.lastDownloadDate !== today) {
        stats.todayDownloads = 0;
        stats.lastDownloadDate = today;
      }
      
      setDownloadStats(stats);
    }
  }, []);

  const incrementDownloadCount = () => {
    const today = new Date().toDateString();
    const newStats = {
      totalDownloads: downloadStats.totalDownloads + 1,
      todayDownloads: downloadStats.lastDownloadDate === today 
        ? downloadStats.todayDownloads + 1 
        : 1,
      lastDownloadDate: today
    };
    
    setDownloadStats(newStats);
    localStorage.setItem('downloadStats', JSON.stringify(newStats));
  };

  const shouldShowMoreAds = downloadStats.totalDownloads >= 5;
  const shouldShowExtraInterstitial = downloadStats.totalDownloads >= 10;
  
  return {
    downloadStats,
    incrementDownloadCount,
    shouldShowMoreAds,
    shouldShowExtraInterstitial
  };
}