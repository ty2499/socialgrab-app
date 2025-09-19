import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TestTube, Eye, Smartphone, Monitor } from "lucide-react";

interface AdConfig {
  placement: string;
  adCode: string;
  isEnabled: boolean;
  adSenseSlot?: string;
  adMobUnitId?: string;
  adType?: 'adsense' | 'admob' | 'both';
  updatedAt: string;
}

interface SiteConfig {
  key: string;
  value: string;
  description: string;
  type: string;
  category: string;
}

export default function AdSenseSettings() {
  const { toast } = useToast();

  // Fetch ad configurations
  const { data: adConfigs = [], isLoading: adsLoading } = useQuery<AdConfig[]>({
    queryKey: ["/api/admin/ads"],
  });

  // Update ad configuration
  const updateAdMutation = useMutation({
    mutationFn: async ({ placement, adCode, isEnabled, adSenseSlot, adMobUnitId, adType }: { 
      placement: string; 
      adCode: string; 
      isEnabled: boolean;
      adSenseSlot?: string;
      adMobUnitId?: string;
      adType?: string;
    }) => {
      return await apiRequest("POST", "/api/admin/ads", {
        placement, adCode, isEnabled, adSenseSlot, adMobUnitId, adType
      });
    },
    onSuccess: () => {
      toast({
        title: "Ad Configuration Updated",
        description: "Ad settings saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ads"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update ad configuration.",
        variant: "destructive",
      });
    },
  });

  // Test ad configuration
  const testAdMutation = useMutation({
    mutationFn: async (placement: string) => {
      return await apiRequest("POST", `/api/admin/ads/${placement}/test`);
    },
    onSuccess: () => {
      toast({
        title: "Test Successful",
        description: "Ad configuration is working correctly.",
      });
    },
    onError: () => {
      toast({
        title: "Test Failed",
        description: "Ad configuration test failed. Please check your ad code.",
        variant: "destructive",
      });
    },
  });

  const handleAdConfigUpdate = (placement: string, adCode: string, isEnabled: boolean, adSenseSlot?: string, adMobUnitId?: string, adType?: string) => {
    updateAdMutation.mutate({ placement, adCode, isEnabled, adSenseSlot, adMobUnitId, adType });
  };

  const adPlacements = [
    { id: "header", name: "Header Banner", description: "Displayed at the top of the page (Web: AdSense, Mobile: AdMob Banner)" },
    { id: "footer", name: "Footer Banner", description: "Displayed at the bottom of the page (Web: AdSense, Mobile: AdMob Banner)" },
    { id: "sidebar", name: "Sidebar", description: "Displayed on the side of content (Web Only)" },
    { id: "interstitial", name: "Interstitial", description: "Displayed between content sections (Web: AdSense, Mobile: AdMob Interstitial)" },
    { id: "extra-interstitial", name: "Extra Interstitial", description: "Additional interstitial for power users (10+ downloads)" }
  ];

  if (adsLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AdSense Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye />
            <span>Ad Platform Status</span>
          </CardTitle>
          <CardDescription>
            Configure both AdSense (for web) and AdMob (for mobile APK) ads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 text-blue-800">
              <p className="text-sm font-medium">🌐 AdSense (Web Users)</p>
              <p className="text-xs text-blue-600">Desktop & Mobile Browser</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 text-green-800">
              <p className="text-sm font-medium">📱 AdMob (APK Users)</p>
              <p className="text-xs text-green-600">Mobile App (APK)</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            The system automatically detects platform and shows appropriate ads.
          </div>
        </CardContent>
      </Card>

      {/* Individual Ad Placements */}
      <div className="grid gap-6">
        <h3 className="text-lg font-semibold">Ad Placement Configuration</h3>
        {adPlacements.map((placement) => {
          const config = adConfigs.find(ad => ad.placement === placement.id);
          return (
            <AdPlacementConfig
              key={placement.id}
              placement={placement}
              config={config}
              onUpdate={handleAdConfigUpdate}
              onTest={() => testAdMutation.mutate(placement.id)}
              isTestLoading={testAdMutation.isPending}
              isUpdateLoading={updateAdMutation.isPending}
              globallyEnabled={true}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AdPlacementConfigProps {
  placement: { id: string; name: string; description: string };
  config?: AdConfig;
  onUpdate: (placement: string, adCode: string, isEnabled: boolean, adSenseSlot?: string, adMobUnitId?: string, adType?: string) => void;
  onTest: () => void;
  isTestLoading: boolean;
  isUpdateLoading: boolean;
  globallyEnabled: boolean;
}

function AdPlacementConfig({ 
  placement, 
  config, 
  onUpdate, 
  onTest, 
  isTestLoading, 
  isUpdateLoading, 
  globallyEnabled 
}: AdPlacementConfigProps) {
  const [adCode, setAdCode] = useState(config?.adCode || "");
  const [isEnabled, setIsEnabled] = useState(config?.isEnabled ?? true);
  const [adSenseSlot, setAdSenseSlot] = useState(config?.adSenseSlot || "");
  const [adMobUnitId, setAdMobUnitId] = useState(config?.adMobUnitId || "");
  const [adType, setAdType] = useState<string>(config?.adType || "both");

  const handleSave = () => {
    onUpdate(placement.id, adCode, isEnabled, adSenseSlot, adMobUnitId, adType);
  };

  return (
    <Card className={`${!globallyEnabled ? "opacity-60" : ""}`}>
      <CardHeader>
        <CardTitle>{placement.name}</CardTitle>
        <CardDescription>{placement.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${placement.id}-enabled`}>Enable this placement</Label>
          <Switch
            id={`${placement.id}-enabled`}
            checked={isEnabled && globallyEnabled}
            onCheckedChange={setIsEnabled}
            disabled={!globallyEnabled}
            data-testid={`switch-${placement.id}-enabled`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${placement.id}-type`}>Ad Platform</Label>
          <Select value={adType} onValueChange={setAdType}>
            <SelectTrigger>
              <SelectValue placeholder="Select ad platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="both">Both AdSense & AdMob (Recommended)</SelectItem>
              <SelectItem value="adsense">AdSense Only (Web)</SelectItem>
              <SelectItem value="admob">AdMob Only (Mobile)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
              Platform IDs
            </TabsTrigger>
            <TabsTrigger value="adsense" className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
              AdSense
            </TabsTrigger>
            <TabsTrigger value="admob" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              AdMob
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`${placement.id}-adsense-slot`}>AdSense Ad Slot ID</Label>
                <Input
                  id={`${placement.id}-adsense-slot`}
                  placeholder="e.g., 1234567890"
                  value={adSenseSlot}
                  onChange={(e) => setAdSenseSlot(e.target.value)}
                  disabled={!globallyEnabled}
                />
                <p className="text-xs text-gray-500">For web users (desktop & mobile browsers)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`${placement.id}-admob-unit`}>AdMob Ad Unit ID</Label>
                <Input
                  id={`${placement.id}-admob-unit`}
                  placeholder="e.g., ca-app-pub-xxx/xxx"
                  value={adMobUnitId}
                  onChange={(e) => setAdMobUnitId(e.target.value)}
                  disabled={!globallyEnabled}
                />
                <p className="text-xs text-gray-500">For APK mobile app users</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adsense" className="space-y-4">
            <div className="space-y-2">
              <Label>AdSense Configuration Examples</Label>
              <div className="p-4 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-2">Example AdSense Code:</p>
                <code className="text-xs text-blue-700 bg-blue-100 p-2 rounded block">
                  {`<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-XXXXXXXX" data-ad-slot="1234567890" data-ad-format="auto"></ins>`}
                </code>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="admob" className="space-y-4">
            <div className="space-y-2">
              <Label>AdMob Configuration Guide</Label>
              <div className="p-4 bg-green-50 rounded-lg text-sm">
                <p className="font-medium text-green-800 mb-2">AdMob Ad Unit Types:</p>
                <ul className="text-green-700 space-y-1 text-xs">
                  <li>• Banner: ca-app-pub-XXXXX/1111111111</li>
                  <li>• Interstitial: ca-app-pub-XXXXX/2222222222</li>
                  <li>• Rewarded: ca-app-pub-XXXXX/3333333333</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor={`${placement.id}-code`}>Custom Ad Code (Optional)</Label>
          <Textarea
            id={`${placement.id}-code`}
            placeholder="Custom ad code (overrides platform-specific settings)"
            value={adCode}
            onChange={(e) => setAdCode(e.target.value)}
            rows={6}
            disabled={!globallyEnabled}
            data-testid={`textarea-${placement.id}-code`}
          />
          <p className="text-xs text-gray-500">Leave empty to use platform-specific AdSense/AdMob configuration</p>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleSave}
            disabled={isUpdateLoading || !globallyEnabled}
            data-testid={`button-save-${placement.id}`}
          >
            {isUpdateLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onTest}
            disabled={isTestLoading || !adCode.trim() || !globallyEnabled}
            data-testid={`button-test-${placement.id}`}
          >
            {isTestLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <TestTube className="mr-2" />
                Test Ad
              </>
            )}
          </Button>
        </div>

        {config?.updatedAt && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}