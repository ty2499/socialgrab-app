import { Download } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-card shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
              <Download className="text-primary-foreground text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">SocialGrab</h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Video Downloader</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-sm text-gray-600">Supports Facebook, TikTok & Pinterest</span>
          </div>
        </div>
      </div>
    </header>
  );
}
