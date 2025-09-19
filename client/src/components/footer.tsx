import { Download, ExternalLink, Smartphone } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiTiktok, SiPinterest, SiGoogleplay, SiApple } from "react-icons/si";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MobileAppModal from "./MobileAppModal";

export default function Footer() {
  const { data: appConfig } = useQuery({
    queryKey: ['/admin/config'],
  });

  // Check if mobile app features are enabled
  const isMobileAppEnabled = Array.isArray(appConfig) ? appConfig.find((config: any) => config.key === 'mobile_app_enabled')?.value === 'true' : false;
  const playStoreUrl = Array.isArray(appConfig) ? appConfig.find((config: any) => config.key === 'play_store_url')?.value : '';
  return (
    <footer className="bg-card border-t border-gray-100 mt-8 sm:mt-12 md:mt-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isMobileAppEnabled ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6 sm:gap-8`}>
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Download className="text-white" size={16} />
              </div>
              <span className="text-lg font-bold text-gray-900">SocialGrab</span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Download videos from Facebook, TikTok, Pinterest, and Instagram with ease. Fast, reliable, and secure video downloading service.
            </p>
            <div className="mb-4">
              <a 
                href="https://pacreatives.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors duration-200"
              >
                Visit PA Creatives
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/profile.php?id=100086228821563&mibextid=wwXIfr&mibextid=wwXIfr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <SiFacebook size={20} />
              </a>
              <a 
                href="https://x.com/pacreatives?s=21" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <SiX size={20} />
              </a>
              <a 
                href="https://www.instagram.com/its_pa_creatives?igsh=eTZoM24xNXk0Y3Mx&utm_source=qr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors duration-200"
              >
                <SiInstagram size={20} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Supported Platforms</h4>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <SiFacebook size={16} />
                <span>Facebook Videos</span>
              </li>
              <li className="flex items-center space-x-2">
                <SiTiktok size={16} />
                <span>TikTok Videos</span>
              </li>
              <li className="flex items-center space-x-2">
                <SiPinterest size={16} />
                <span>Pinterest Videos</span>
              </li>
              <li className="flex items-center space-x-2">
                <SiInstagram size={16} />
                <span>Instagram Videos</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          {isMobileAppEnabled && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Smartphone size={16} />
                <span>Mobile App</span>
              </h4>
              <div className="space-y-3">
                <MobileAppModal>
                  <button 
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:border-primary hover:from-primary/5 hover:to-primary/10 hover:shadow-lg transition-all duration-300 group w-full text-left transform hover:scale-105"
                    title="Download from Google Play Store"
                    data-testid="button-mobile-app-modal"
                  >
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <SiGoogleplay size={20} className="text-green-600 group-hover:text-green-700" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Get it on</div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">Google Play</div>
                    </div>
                  </button>
                </MobileAppModal>
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 opacity-70">
                  <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                    <SiApple size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Download on the</div>
                    <div className="text-sm font-semibold text-gray-500">App Store</div>
                    <div className="text-xs text-orange-500 italic font-medium">Coming Soon</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} SocialGrab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
