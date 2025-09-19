import { useState } from "react";
import analytics from '@/utils/analytics';
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import { videoUrlSchema, type VideoUrlRequest } from "@shared/schema";
import PlatformDetection from "./platform-detection";
import QualitySelector from "./quality-selector";
import VideoPreview from "./video-preview";
import DownloadProgress from "./download-progress";
import { useDownloadTracker } from "@/hooks/useDownloadTracker";

interface VideoInfo {
  title: string;
  duration: number;
  thumbnailUrl?: string;
  author?: string;
  views?: string;
  platform: string;
  url: string;
  formats: Array<{ quality: string; fileSize: number; format: string }>;
}

export default function DownloadForm() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});
  const [downloadStatus, setDownloadStatus] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});

  // Mock user subscription - in real app this would come from auth context
  const userSubscription = null; // null means free user

  // Track download count
  const { incrementDownloadCount } = useDownloadTracker();

  const form = useForm<VideoUrlRequest>({
    resolver: zodResolver(videoUrlSchema),
    defaultValues: {
      url: "",
      quality: "high",
    },
  });

  const videoInfoMutation = useMutation({
    mutationFn: async (data: { url: string }) => {
      const response = await apiRequest("POST", "/api/video/info", { url: data.url });
      return response.json();
    },
    onSuccess: (data: VideoInfo) => {
      setVideoInfo(data);
      setStatusMessage({type: null, message: ""});
    },
    onError: (error: Error) => {
      setStatusMessage({type: 'error', message: error.message});
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: VideoUrlRequest) => {
      const response = await apiRequest("POST", "/api/video/download", data);
      return response.json();
    },
    onSuccess: (data: { downloadId: string }) => {
      setDownloadId(data.downloadId);
      setDownloadStatus({type: 'success', message: "Download started successfully!"});
      incrementDownloadCount();
    },
    onError: (error: any) => {
      if (error.status === 402 || error.upgradeRequired) {
        setShowUpgradeModal(true);
        setDownloadStatus({type: 'error', message: "Upgrade to access 2K and 4K video downloads"});
      } else {
        setDownloadStatus({type: 'error', message: error.message || "Failed to start download"});
      }
    },
  });

  const detectPlatform = (url: string): string => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('facebook.com') || urlLower.includes('fb.watch')) return 'facebook';
    if (urlLower.includes('tiktok.com')) return 'tiktok';
    if (urlLower.includes('pinterest.com')) return 'pinterest';
    if (urlLower.includes('instagram.com') || urlLower.includes('instagr.am')) return 'instagram';
    return 'unknown';
  };

  const handleUrlChange = (url: string) => {
    form.setValue("url", url);
    if (url && videoUrlSchema.safeParse({ url }).success) {
      const platform = detectPlatform(url);
      analytics.trackVideoInfoRequest(platform, url).catch(console.error);
      videoInfoMutation.mutate({ url });
    } else {
      setVideoInfo(null);
    }
  };

  const onSubmit = (data: VideoUrlRequest) => {
    if (videoInfo) {
      analytics.trackVideoDownload(videoInfo.platform, data.quality, false).catch(console.error);
    }
    downloadMutation.mutate(data);
  };

  return (
    <>
      <Card className="bg-card rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8 mb-4 sm:mb-6 md:mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 md:space-y-6">
            
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        placeholder="Paste your video URL here..."
                        className="w-full px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 pr-10 sm:pr-12 md:pr-14 border-2 border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl focus:ring-3 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-sm sm:text-base font-medium placeholder:text-gray-400 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                        onChange={(e) => {
                          field.onChange(e);
                          handleUrlChange(e.target.value);
                        }}
                        data-testid="input-video-url"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 md:pr-5">
                        <Link className="text-gray-400" size={16} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-600 text-xs sm:text-sm mt-1 sm:mt-2" />
                </FormItem>
              )}
            />

            <PlatformDetection 
              url={form.watch("url")} 
              detectedPlatform={videoInfo?.platform} 
              isLoading={videoInfoMutation.isPending}
            />

            {/* Video info loading state */}
            {videoInfoMutation.isPending && (
              <div className="p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium">Fetching video information...</span>
                </div>
              </div>
            )}

            {/* Status message for video info */}
            {statusMessage.type && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                statusMessage.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {statusMessage.message}
              </div>
            )}

            {videoInfo && (
              <>
                <VideoPreview videoInfo={videoInfo} />
                
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Video Quality</FormLabel>
                      <FormControl>
                        <QualitySelector
                          value={field.value}
                          onChange={field.onChange}
                          formats={videoInfo.formats}
                          userSubscription={userSubscription}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Download status message */}
            {downloadStatus.type && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                downloadStatus.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {downloadStatus.message}
              </div>
            )}

            <div className="text-center">
              <Button
                type="submit"
                disabled={!videoInfo || downloadMutation.isPending}
                className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-primary-foreground font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-primary/30 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-3 text-base sm:text-lg"
                data-testid="button-download"
              >
                <Download className="text-lg sm:text-xl" />
                <span>
                  {downloadMutation.isPending ? "Starting Download..." : "Download Video"}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </Card>

      {downloadId && <DownloadProgress downloadId={downloadId} />}
    </>
  );
}