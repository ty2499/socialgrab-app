import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Check, Zap, Download, X, Globe } from "lucide-react";
import { useLocation } from "wouter";
// Removed useToast - using inline AJAX feedback instead
import SEOHead from "@/components/seo-head";
import { useCurrency } from "@/hooks/useCurrency";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  maxVideoQuality: string;
  removeAds: boolean;
  isActive: boolean;
}

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    convertPrice, 
    formatPrice, 
    getSupportedCurrencies,
    isLoading: currencyLoading 
  } = useCurrency();

  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    retry: 1
  });

  const handleUpgrade = (planId: string, planName: string) => {
    // Navigate to checkout page with the selected plan
    window.location.href = `/checkout?plan=${planId}&currency=${selectedCurrency}`;
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case "4k": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "2k": return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      case "high": return "bg-gradient-to-r from-green-500 to-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <>
      <SEOHead
        title="Subscription Plans - SocialGrab"
        description="Choose your plan and unlock premium features like 2K/4K video downloads and ad-free experience on SocialGrab"
        url="/subscription"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="rounded-full p-2 hover:bg-gray-100"
              data-testid="button-close-subscription"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock premium features and download videos in the highest quality available. 
              No ads, unlimited downloads, and priority support.
            </p>
            
            {/* Currency Selector */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Globe className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Currency:</span>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getSupportedCurrencies().map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Free vs Premium Comparison */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Free vs Premium</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="relative">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Download className="h-5 w-5" />
                    Free Plan
                  </CardTitle>
                  <div className="text-3xl font-bold">$0</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Up to 1080p downloads</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Facebook, TikTok, Pinterest</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-gray-500">Contains ads</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <X className="h-5 w-5 text-red-500" />
                      <span className="text-gray-500">No 2K/4K downloads</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="relative border-2 border-primary">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Premium Plan
                  </CardTitle>
                  <div className="text-3xl font-bold">{formatPrice(convertPrice(999))}<span className="text-lg font-normal">/month</span></div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Up to 4K downloads</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>All supported platforms</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Ad-free experience</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="font-medium">2K & 4K quality</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white border-none"
                    onClick={() => {
                      // Find the premium plan from the loaded plans
                      const premiumPlan = plans?.find(p => p.id === 'plan_premium_monthly' || p.id === 'fallback-premium');
                      if (premiumPlan) {
                        handleUpgrade(premiumPlan.id, premiumPlan.name);
                      } else {
                        // Show loading message instead of using toast
                        console.log("Plans are still loading, please try again.");
                      }
                    }}
                    data-testid="button-upgrade-premium"
                  >
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* All Available Plans */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscription plans...</p>
            </div>
          ) : plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.name.toLowerCase().includes('premium') ? 'border-2 border-primary shadow-lg' : ''}`}>
                  {plan.name.toLowerCase().includes('premium') && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Crown className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 mb-2">
                      {plan.name.toLowerCase().includes('premium') ? (
                        <Crown className="h-5 w-5 text-amber-500" />
                      ) : plan.name.toLowerCase().includes('pro') ? (
                        <Zap className="h-5 w-5 text-purple-500" />
                      ) : (
                        <Download className="h-5 w-5" />
                      )}
                      {plan.name}
                    </CardTitle>
                    
                    <div className="text-3xl font-bold mb-2">
                      {formatPrice(convertPrice(plan.price))}
                      <span className="text-lg font-normal text-gray-600">/{plan.interval === 'lifetime' ? 'lifetime' : plan.interval}</span>
                    </div>
                    
                    {plan.interval === 'year' && (
                      <div className="text-sm text-green-600 font-medium">
                        Save {Math.round((1 - (plan.price / 12) / 999) * 100)}% vs monthly
                      </div>
                    )}
                    
                    
                    
                    {plan.interval === 'lifetime' && (
                      <div className="text-sm text-purple-600 font-medium">
                        Pay once, use forever
                      </div>
                    )}
                    
                    <div className="flex justify-center gap-2 mb-4">
                      <Badge 
                        className={`px-3 py-1 ${getQualityBadgeColor(plan.maxVideoQuality)}`}
                      >
                        Max: {plan.maxVideoQuality.toUpperCase()}
                      </Badge>
                      {plan.removeAds && (
                        <Badge variant="outline" className="border-green-500 text-green-700">
                          Ad-Free
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                      
                      {/* Quality indicator */}
                      <li className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Up to {plan.maxVideoQuality.toUpperCase()} quality downloads</span>
                      </li>
                      
                      {plan.removeAds && (
                        <li className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Remove all advertisements</span>
                        </li>
                      )}
                    </ul>
                    
                    <Button 
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white border-none"
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                      data-testid={`button-choose-${plan.id}`}
                    >
                      Choose Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No subscription plans available at this time.</p>
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">What's the difference between 2K and 4K quality?</h3>
                  <p className="text-gray-600">
                    2K (1440p) offers superior clarity compared to standard HD, while 4K (2160p) provides 
                    the highest quality available with exceptional detail and sharpness.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Can I cancel my subscription anytime?</h3>
                  <p className="text-gray-600">
                    Yes, you can cancel your subscription at any time. You'll continue to have access 
                    to premium features until the end of your billing period.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-gray-600">
                    We offer a 7-day money-back guarantee. If you're not satisfied with our service, 
                    contact support within 7 days for a full refund.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}