import Header from "@/components/header";
import Footer from "@/components/footer";
import DownloadForm from "@/components/download-form";
import RecentDownloads from "@/components/recent-downloads";
import AdBanner from "@/components/ad-banner";
import SEOHead from "@/components/seo-head";
import MobileOptimizedLayout from "@/components/MobileOptimizedLayout";
import DownloadStatsBanner from "@/components/download-stats-banner";
import { useDownloadTracker } from "@/hooks/useDownloadTracker";
import { Star, TrendingUp, Shield, Zap } from "lucide-react";

export default function Home() {
  const { shouldShowMoreAds, shouldShowExtraInterstitial } = useDownloadTracker();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SocialGrab",
    "description": "Free online video downloader for Facebook, TikTok, Pinterest, and Instagram videos",
    "url": "https://socialgrab.app",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Works with Chrome, Firefox, Safari, Edge",
    "softwareVersion": "2.0",
    "datePublished": "2024-01-01",
    "dateModified": "2025-01-24",
    "creator": {
      "@type": "Organization",
      "name": "SocialGrab Team"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "featureList": [
      "Download Facebook Videos in HD",
      "Download TikTok Videos without watermark", 
      "Download Pinterest Videos and Images",
      "Download Instagram Videos and Reels",
      "Multiple Quality Options (HD, 4K)",
      "Fast Processing (under 10 seconds)",
      "No Registration Required",
      "Mobile-Friendly Interface",
      "Free Forever",
      "No Ads During Download"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "15420",
      "bestRating": "5",
      "worstRating": "1"
    },
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": "https://schema.org/UseAction",
      "userInteractionCount": "2500000"
    }
  };

  return (
    <>
      <SEOHead
        title="SocialGrab - #1 Free Video Downloader for Facebook, TikTok, Pinterest & Instagram | Download HD Videos Online"
        description="Download high-quality videos from Facebook, TikTok, Pinterest, and Instagram for free. The fastest online video downloader with no registration required. Try now!"
        keywords="video downloader, facebook video download, tiktok video download, pinterest video download, instagram video download, social media downloader, free video downloader, online video downloader, download videos, hd video downloader, fast video downloader, no registration video downloader, best video downloader 2025"
        structuredData={structuredData}
      />
      <MobileOptimizedLayout className="flex flex-col">
      <Header />
      
      {/* Download Stats Banner */}
      <DownloadStatsBanner />
      
      {/* Header Ad */}
      <AdBanner 
        placement="header" 
        className="w-full bg-background border-b border-border/20" 
      />
      
      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-6 lg:py-8 space-y-3 sm:space-y-4 md:space-y-6">
        <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3 md:mb-4 lg:mb-6 px-1">
            #1 Free Video Downloader for Social Media
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto px-2 sm:px-0 leading-relaxed">
            Download high-quality videos from Facebook, TikTok, Pinterest, and Instagram instantly. 
            Fast, free, and no registration required. Join millions of users worldwide!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <Star className="w-4 h-4 fill-current" />
              4.8/5 Rating
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4" />
              2.5M+ Downloads
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4" />
              100% Safe
            </div>
            <div className="bg-orange-100 text-orange-800 px-3 py-2 rounded-full flex items-center gap-1.5 font-medium">
              <Zap className="w-4 h-4" />
              Free Forever
            </div>
          </div>
        </div>

        <DownloadForm />
        
        {/* Post-Download Ad - Shows after user has made at least one download */}
        <AdBanner 
          placement="post-download" 
          className="w-full my-4 sm:my-6 md:my-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
        />
        
        {/* Interstitial Ad */}
        <AdBanner 
          placement="interstitial" 
          className="w-full my-4 sm:my-6 md:my-8 p-3 sm:p-4 bg-muted/20 rounded-lg border border-border/20"
        />

        {/* Extra Interstitial Ad for users with 10+ downloads */}
        {shouldShowExtraInterstitial && (
          <AdBanner 
            placement="extra-interstitial" 
            className="w-full my-4 sm:my-6 md:my-8 p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
          />
        )}

        {/* Sidebar Ad for users with 5+ downloads */}
        {shouldShowMoreAds && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <RecentDownloads />
            </div>
            <div className="md:w-80">
              <AdBanner 
                placement="sidebar" 
                className="sticky top-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
              />
            </div>
          </div>
        )}

        {/* Regular layout for users with less than 5 downloads */}
        {!shouldShowMoreAds && <RecentDownloads />}
      </main>

        {/* Footer Ad */}
        <AdBanner 
          placement="footer" 
          className="w-full bg-background border-t border-border/20" 
        />

        <Footer />
      </MobileOptimizedLayout>
    </>
  );
}
