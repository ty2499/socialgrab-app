import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";
import { type Download as DownloadType } from "@shared/schema";

interface DownloadProgressProps {
  downloadId: string;
}

export default function DownloadProgress({ downloadId }: DownloadProgressProps) {
  const { data: download } = useQuery({
    queryKey: ["/api/video/download", downloadId],
    refetchInterval: (query) => {
      const downloadData = query.state.data as DownloadType;
      return downloadData?.status === "downloading" ? 1000 : false;
    },
  });

  const downloadData = download as DownloadType;

  if (!downloadData) {
    return null;
  }

  const handleDownload = () => {
    // Trigger the file download
    window.open(`/api/downloads/${downloadId}/file`, '_blank');
  };

  const formatSpeed = (progress: number) => {
    // Simulate download speed calculation
    return `${(Math.random() * 3 + 1).toFixed(1)} MB/s`;
  };

  const formatTimeRemaining = (progress: number) => {
    if (progress >= 100) return "Complete";
    const remaining = Math.ceil((100 - progress) / 10);
    return `${remaining} seconds remaining`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Show download button when completed
  if (downloadData.status === "completed") {
    return (
      <Card className="bg-card rounded-2xl shadow-lg p-6 mb-8 border-green-200 bg-green-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800 flex items-center space-x-2">
            <CheckCircle className="text-green-600" size={20} />
            <span>Video Ready for Download!</span>
          </h3>
          <span className="text-sm text-green-700 font-medium">100%</span>
        </div>
        
        <div className="text-sm text-green-700 mb-4">
          <p className="font-medium">{downloadData.title}</p>
          <p className="text-green-600">Size: {formatFileSize(downloadData.fileSize)} • Quality: {downloadData.quality.toUpperCase()}</p>
        </div>
        
        <Button
          onClick={handleDownload}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
          data-testid="button-download-file"
        >
          <Download size={20} />
          <span>Download Video to Device</span>
        </Button>
      </Card>
    );
  }

  // Show error message for failed downloads
  if (downloadData.status === "failed") {
    return (
      <Card className="bg-card rounded-2xl shadow-lg p-6 mb-8 border-red-200 bg-red-50">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Download Failed</h3>
          <p className="text-red-600 mb-4">There was an error downloading this video. Please try again.</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Show progress for downloading status
  return (
    <Card className="bg-card rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Download className="text-primary" size={20} />
          <span>Processing Video...</span>
        </h3>
        <span className="text-sm text-gray-600">{downloadData.downloadProgress}%</span>
      </div>
      
      <Progress 
        value={downloadData.downloadProgress || 0} 
        className="w-full h-3 mb-4"
      />
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{formatSpeed(downloadData.downloadProgress || 0)}</span>
        <span>{formatTimeRemaining(downloadData.downloadProgress || 0)}</span>
      </div>
    </Card>
  );
}
