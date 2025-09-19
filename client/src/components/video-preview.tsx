import { Clock, Eye, User } from "lucide-react";

interface VideoPreviewProps {
  videoInfo: {
    title: string;
    duration: number;
    thumbnailUrl?: string;
    author?: string;
    views?: string;
  };
}

export default function VideoPreview({ videoInfo }: VideoPreviewProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-start space-x-4">
        {videoInfo.thumbnailUrl && (
          <img 
            src={videoInfo.thumbnailUrl} 
            alt="Video thumbnail" 
            className="w-20 h-28 object-cover rounded-lg"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">{videoInfo.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {videoInfo.duration > 0 && (
              <span>
                <Clock className="mr-1 inline" size={14} />
                {formatDuration(videoInfo.duration)}
              </span>
            )}
            {videoInfo.views && (
              <span>
                <Eye className="mr-1 inline" size={14} />
                {videoInfo.views}
              </span>
            )}
            {videoInfo.author && (
              <span>
                <User className="mr-1 inline" size={14} />
                {videoInfo.author}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
