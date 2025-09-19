import { useQuery, useMutation } from "@tanstack/react-query";
import { Download as DownloadIcon, RotateCcw } from "lucide-react";
import { SiFacebook, SiTiktok, SiPinterest } from "react-icons/si";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Removed useToast - using inline AJAX feedback instead
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Download } from "@shared/schema";
import { useState, useEffect } from "react";

export default function RecentDownloads() {
  const [hiddenItems, setHiddenItems] = useState<Set<string>>(new Set());
  const [actionStatus, setActionStatus] = useState<{[key: string]: {type: 'success' | 'error' | null, message: string}}>({});

  const { data: downloads, isLoading } = useQuery<Download[]>({
    queryKey: ["/api/downloads"],
  });

  // Auto-hide completed downloads after 30 seconds (give users time to download)
  useEffect(() => {
    if (!downloads) return;

    const completedDownloads = downloads.filter(d => d.status === 'completed');
    
    completedDownloads.forEach(download => {
      if (!hiddenItems.has(download.id)) {
        const timer = setTimeout(() => {
          setHiddenItems(prev => new Set([...Array.from(prev), download.id]));
        }, 30000); // Increased from 3 seconds to 30 seconds

        return () => clearTimeout(timer);
      }
    });
  }, [downloads, hiddenItems]);

  const retryMutation = useMutation({
    mutationFn: async (downloadId: string) => {
      const response = await apiRequest("POST", `/api/downloads/${downloadId}/retry`);
      return response.json();
    },
    onSuccess: (_, downloadId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      setActionStatus(prev => ({...prev, [downloadId]: {type: 'success', message: "Download retried successfully!"}}));
      setTimeout(() => setActionStatus(prev => ({...prev, [downloadId]: {type: null, message: ""}})), 3000);
    },
    onError: (error: Error, downloadId) => {
      setActionStatus(prev => ({...prev, [downloadId]: {type: 'error', message: error.message}}));
      setTimeout(() => setActionStatus(prev => ({...prev, [downloadId]: {type: null, message: ""}})), 5000);
    },
  });

  const handleDownloadFile = async (download: Download) => {
    try {
      setActionStatus(prev => ({...prev, [download.id]: {type: 'success', message: "Downloading file..."}}));
      
      const response = await fetch(`/api/downloads/${download.id}/file`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${download.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setActionStatus(prev => ({...prev, [download.id]: {type: 'success', message: "File downloaded successfully!"}}));
      setTimeout(() => setActionStatus(prev => ({...prev, [download.id]: {type: null, message: ""}})), 3000);
    } catch (error) {
      setActionStatus(prev => ({...prev, [download.id]: {type: 'error', message: "Failed to download file"}}));
      setTimeout(() => setActionStatus(prev => ({...prev, [download.id]: {type: null, message: ""}})), 5000);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook": return SiFacebook;
      case "tiktok": return SiTiktok;
      case "pinterest": return SiPinterest;
      default: return DownloadIcon;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "downloading":
        return <Badge className="bg-blue-100 text-blue-800">Downloading</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return "Yesterday";
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (isLoading) {
    return (
      <Card className="bg-card rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-12 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Downloads</h3>
      
      {!downloads || downloads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DownloadIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No downloads yet. Start by pasting a video URL above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {downloads
            .filter(download => !hiddenItems.has(download.id))
            .map((download: Download) => {
            const PlatformIcon = getPlatformIcon(download.platform);
            
            return (
              <div
                key={download.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl transition-all duration-500 ease-in-out"
                data-testid={`download-item-${download.id}`}
              >
                <div className="flex items-center space-x-4">
                  {download.thumbnailUrl && (
                    <img
                      src={download.thumbnailUrl}
                      alt="Video thumbnail"
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{download.title}</div>
                    <div className="text-sm text-gray-500 flex items-center space-x-3">
                      <span className="flex items-center space-x-1">
                        <PlatformIcon size={14} />
                        <span className="capitalize">{download.platform}</span>
                      </span>
                      <span>{formatDate(download.createdAt!)}</span>
                      <span>{formatFileSize(download.fileSize)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(download.status)}
                    {download.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadFile(download)}
                        className="text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        <DownloadIcon size={16} />
                      </Button>
                    )}
                    {download.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryMutation.mutate(download.id)}
                        disabled={retryMutation.isPending}
                        className="text-primary hover:text-primary-dark transition-colors duration-200"
                      >
                        <RotateCcw size={16} />
                      </Button>
                    )}
                  </div>
                  
                  {/* Inline action status message */}
                  {actionStatus[download.id]?.type && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      actionStatus[download.id].type === 'error' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {actionStatus[download.id].message}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
