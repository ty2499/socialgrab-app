import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiGoogleplay, SiApple, SiAndroid } from "react-icons/si";
import { 
  Smartphone, 
  Download, 
  Star, 
  Shield, 
  Zap, 
  Clock, 
  CheckCircle, 
  Users,
  Trophy,
  ExternalLink,
  Mail
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface MobileAppModalProps {
  children: React.ReactNode;
}

export default function MobileAppModal({ children }: MobileAppModalProps) {
  const [email, setEmail] = useState("");
  const [isNotifying, setIsNotifying] = useState(false);
  const { toast } = useToast();

  // Fetch app configuration for store URLs
  const { data: appConfig } = useQuery<any[]>({
    queryKey: ['/api/admin/config'],
    staleTime: 30000
  });

  const playStoreUrl = appConfig?.find(config => config.key === 'play_store_url')?.value || '#';
  const emailGatewayEnabled = appConfig?.find(config => config.key === 'email_gateway_enabled')?.value === 'true';

  const handleNotifyForIOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to get notified.",
        variant: "destructive",
      });
      return;
    }

    setIsNotifying(true);
    try {
      const response = await fetch('/api/notify-ios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You'll be notified when the iOS app is available.",
        });
        setEmail("");
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe for notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNotifying(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-6 mb-8">
          <DialogTitle className="flex items-center justify-center space-x-4 text-3xl font-bold">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary-dark to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Download className="text-white drop-shadow-sm" size={28} />
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                SocialGrab Mobile App
              </div>
              <div className="text-sm font-normal text-gray-500 mt-1">Download videos anywhere, anytime</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 py-8 bg-gradient-to-r from-blue-50 via-white to-red-50 rounded-2xl border border-gray-100 shadow-inner">
            <div className="flex justify-center space-x-6 mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-primary via-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Smartphone className="text-white drop-shadow-lg" size={40} />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Download Videos on the Go
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the fastest and most reliable video downloader directly on your mobile device. 
              <span className="text-primary font-semibold">Premium features</span>, offline downloads, and ad-free experience.
            </p>
          </div>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a 
              href={playStoreUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-4 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white px-8 py-5 rounded-2xl hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 transition-all duration-300 shadow-2xl transform hover:scale-105 hover:-translate-y-1 border border-gray-700"
              data-testid="button-download-android"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors duration-300">
                <SiGoogleplay size={32} className="text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-xs text-gray-300 font-medium uppercase tracking-wide">GET IT ON</div>
                <div className="text-xl font-bold">Google Play</div>
                <div className="text-xs text-green-400 font-medium">Available Now</div>
              </div>
            </a>
            
            <div className="flex items-center space-x-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 text-gray-500 px-8 py-5 rounded-2xl shadow-lg border border-gray-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex items-center justify-center w-12 h-12 bg-gray-300 rounded-xl">
                <SiApple size={32} className="text-gray-500" />
              </div>
              <div className="text-left relative z-10">
                <div className="text-xs font-medium uppercase tracking-wide">Download on the</div>
                <div className="text-xl font-bold">App Store</div>
                <div className="text-xs italic text-orange-500 font-medium">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* App Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gradient-to-r from-white via-blue-50 to-white rounded-2xl p-8 border border-blue-100 shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-yellow-500 mb-3">
                <Star className="fill-current drop-shadow-sm" size={22} />
                <Star className="fill-current drop-shadow-sm" size={22} />
                <Star className="fill-current drop-shadow-sm" size={22} />
                <Star className="fill-current drop-shadow-sm" size={22} />
                <Star className="fill-current drop-shadow-sm" size={22} />
              </div>
              <div className="text-3xl font-bold text-gray-900">4.8</div>
              <div className="text-sm text-gray-600 font-medium">User Rating</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Users className="text-primary" size={26} />
              </div>
              <div className="text-3xl font-bold text-gray-900">50K+</div>
              <div className="text-sm text-gray-600 font-medium">Downloads</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3">
                <Trophy className="text-yellow-600" size={26} />
              </div>
              <div className="text-3xl font-bold text-gray-900">#1</div>
              <div className="text-sm text-gray-600 font-medium">Video App</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-green-500/10 rounded-xl flex items-center justify-center mb-3">
                <Shield className="text-green-600" size={26} />
              </div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600 font-medium">Safe</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile Exclusive Features</h3>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="text-primary" size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Offline Downloads</h4>
                  <p className="text-sm text-gray-600">Download videos and watch them offline without internet connection.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="text-primary" size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">3x Faster Processing</h4>
                  <p className="text-sm text-gray-600">Native mobile optimization for lightning-fast video processing.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-primary" size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Ad-Free Experience</h4>
                  <p className="text-sm text-gray-600">No ads, no interruptions. Pure downloading experience.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-primary" size={16} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Batch Downloads</h4>
                  <p className="text-sm text-gray-600">Queue multiple videos and download them all at once.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Support</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">f</span>
                    </div>
                    <span className="font-medium">Facebook</span>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">T</span>
                    </div>
                    <span className="font-medium">TikTok</span>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <span className="font-medium">Pinterest</span>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">I</span>
                    </div>
                    <span className="font-medium">Instagram</span>
                  </div>
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Premium Features Banner */}
          <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Premium Mobile Features</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>4K & HD Downloads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Unlimited Downloads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Priority Processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} />
                    <span>Cloud Storage Sync</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$9.99</div>
                <div className="text-sm opacity-90">/month</div>
                <Badge variant="secondary" className="mt-2 bg-white text-primary">
                  Most Popular
                </Badge>
              </div>
            </div>
          </div>

          {/* App Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
              <SiAndroid className="text-blue-600" size={20} />
              <span>System Requirements</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Android</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• Android 7.0 or higher</li>
                  <li>• 50MB free storage</li>
                  <li>• Internet connection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Coming Soon - iOS</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• iOS 12.0 or higher</li>
                  <li>• iPhone 6s or newer</li>
                  <li>• 50MB free storage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Ready to Download?</h3>
            <p className="text-gray-600">Join thousands of users who trust SocialGrab for their video downloading needs.</p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <a
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-download-main"
                >
                  <SiGoogleplay className="mr-2" size={20} />
                  Download for Android
                </Button>
              </a>
              
              {emailGatewayEnabled ? (
                <div className="flex flex-col space-y-2">
                  <form onSubmit={handleNotifyForIOS} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-48"
                      data-testid="input-notify-email"
                    />
                    <Button 
                      type="submit"
                      variant="outline" 
                      size="lg"
                      disabled={isNotifying}
                      data-testid="button-notify-ios"
                    >
                      {isNotifying ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Subscribing...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2" size={16} />
                          Notify for iOS
                        </>
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-gray-500">Get notified when the iOS app is available</p>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="lg"
                  disabled
                  data-testid="button-notify-ios"
                >
                  Notify for iOS
                  <ExternalLink className="ml-2" size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}