import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Download, 
  TrendingUp, 
  Settings, 
  DollarSign,
  Activity,
  Calendar,
  Smartphone,
  Monitor,
  Zap,
  Shield,
  Globe,
  TestTube,
  ExternalLink,
  Search,
  BarChart3,
  FileText,
  Copy,
  CheckCircle,
  Mail
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import MobileAppModal from "@/components/MobileAppModal";
import AdSenseSettings from "@/components/admin/AdSenseSettings";
import EmailGatewaySettings from "@/components/admin/EmailGatewaySettings";
import { SiGoogleplay, SiApple } from "react-icons/si";

interface Stats {
  totalDownloads: number;
  totalUsers: number;
  downloadsToday: number;
  platformBreakdown: Record<string, number>;
}

interface Analytics {
  id: string;
  event: string;
  platform: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  metadata: any;
  timestamp: string;
}

interface AppConfig {
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

interface AdConfig {
  placement: string;
  adCode: string;
  adType?: string;
  isEnabled: boolean;
  imageDesktopUrl?: string;
  imageTabletUrl?: string;
  imageMobileUrl?: string;
  clickUrl?: string;
  altText?: string;
  updatedAt: string;
}

interface AdNetworkConfig {
  admob_web_enabled: boolean;
  admob_android_enabled: boolean;
  adsense_web_enabled: boolean;
  adsense_android_enabled: boolean;
  ads_frequency_web: string;
  ads_frequency_android: string;
  premium_ads_disabled: boolean;
  ad_testing_mode: boolean;
}

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
  createdAt: string;
  updatedAt: string;
}

interface ApiKey {
  key: string;
  value: string;
  isSet: boolean;
}

interface ImageUploadFieldProps {
  label: string;
  name: string;
  description: string;
  testId: string;
}

function ImageUploadField({ label, name, description, testId }: ImageUploadFieldProps) {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "Image must be smaller than 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 401) {
        toast({ title: "Session expired. Please log in again.", variant: "destructive" });
        window.location.href = '/admin/login';
        return;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();
      setUploadedImageUrl(result.imageUrl);
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Image upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
        data-testid={testId}
      />
      
      {/* Hidden URL input for form submission */}
      <input
        type="hidden"
        name={name}
        value={uploadedImageUrl}
      />

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {uploadedImageUrl ? (
          <div className="space-y-3">
            <img
              src={uploadedImageUrl}
              alt="Uploaded ad"
              className="max-w-full max-h-32 mx-auto rounded"
            />
            <p className="text-sm text-green-600">✓ Image uploaded successfully</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setUploadedImageUrl('');
              }}
            >
              Replace Image
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {uploading ? (
              <div className="text-orange-600">
                <div className="animate-spin h-8 w-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2">Uploading...</p>
              </div>
            ) : (
              <>
                <div className="text-gray-400 text-4xl">📸</div>
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </>
            )}
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function AdminDashboardContent() {
  const [, setLocation] = useLocation();
  const { user, isLoading, logout } = useAuth();
  const { toast } = useToast();
  
  // All useState hooks must be called before any conditional returns
  const [configForm, setConfigForm] = useState({ key: '', value: '', description: '' });
  const [adForm, setAdForm] = useState({ placement: 'header', adCode: '', isEnabled: true });
  const [planForm, setPlanForm] = useState({
    name: '',
    description: '',
    price: 0,
    interval: 'month',
    features: [''],
    maxVideoQuality: 'high',
    removeAds: false
  });
  const [apiKeyForm, setApiKeyForm] = useState({ key: '', value: '' });
  
  // Ad Network Configuration
  const [adNetworkSettings, setAdNetworkSettings] = useState<AdNetworkConfig>({
    admob_web_enabled: false,
    admob_android_enabled: true,
    adsense_web_enabled: true,
    adsense_android_enabled: false,
    ads_frequency_web: 'medium',
    ads_frequency_android: 'medium',
    premium_ads_disabled: true,
    ad_testing_mode: false,
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics[]>({
    queryKey: ['/api/admin/analytics'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: appConfig, isLoading: configLoading } = useQuery<AppConfig[]>({
    queryKey: ['/api/admin/config'],
  });

  const { data: adConfigs, isLoading: adsLoading } = useQuery<AdConfig[]>({
    queryKey: ['/api/admin/ads'],
  });

  const saveAdNetworkMutation = useMutation({
    mutationFn: async (settings: Partial<AdNetworkConfig>) => {
      const promises = Object.entries(settings).map(([key, value]) => 
        fetch('/api/admin/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: String(value), description: `Ad network setting: ${key}` })
        }).then(res => res.json())
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({ title: "Ad network settings saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
    },
    onError: () => {
      toast({ title: "Failed to save ad network settings", variant: "destructive" });
    },
  });

  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/subscription-plans'],
  });

  // Mutations
  const configMutation = useMutation({
    mutationFn: async (data: { key: string; value: string; description: string }) => {
      return await apiRequest('POST', '/api/admin/config', data);
    },
    onSuccess: () => {
      toast({ title: "Configuration updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/config'] });
      setConfigForm({ key: '', value: '', description: '' });
    },
    onError: () => {
      toast({ title: "Failed to update configuration", variant: "destructive" });
    }
  });

  const adMutation = useMutation({
    mutationFn: async (data: { placement: string; adCode: string; isEnabled: boolean }) => {
      return await apiRequest('POST', '/api/admin/ads', data);
    },
    onSuccess: () => {
      toast({ title: "Ad configuration updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ads'] });
      setAdForm({ placement: 'header', adCode: '', isEnabled: true });
    },
    onError: () => {
      toast({ title: "Failed to update ad configuration", variant: "destructive" });
    }
  });

  const planMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/admin/subscription-plans', data);
    },
    onSuccess: () => {
      toast({ title: "Subscription plan created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
      setPlanForm({
        name: '',
        description: '',
        price: 0,
        interval: 'month',
        features: [''],
        maxVideoQuality: 'high',
        removeAds: false
      });
    },
    onError: () => {
      toast({ title: "Failed to create subscription plan", variant: "destructive" });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/subscription-plans/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Subscription plan deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscription-plans'] });
    },
    onError: () => {
      toast({ title: "Failed to delete subscription plan", variant: "destructive" });
    }
  });

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (configForm.key && configForm.value) {
      configMutation.mutate(configForm);
    }
  };

  const handleAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adForm.placement && adForm.adCode) {
      adMutation.mutate(adForm);
    }
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (planForm.name && planForm.price >= 0) {
      const planData = {
        ...planForm,
        features: planForm.features.filter(f => f.trim() !== '')
      };
      planMutation.mutate(planData);
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKeyForm.key && apiKeyForm.value) {
      configMutation.mutate({
        key: apiKeyForm.key,
        value: apiKeyForm.value,
        description: `API key for ${apiKeyForm.key}`
      });
      setApiKeyForm({ key: '', value: '' });
    }
  };

  const deletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription plan?')) {
      deletePlanMutation.mutate(id);
    }
  };

  const addFeature = () => {
    setPlanForm({ ...planForm, features: [...planForm.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({ ...planForm, features: newFeatures });
  };

  const toggleAdStatus = (placement: string, currentStatus: boolean) => {
    const config = adConfigs?.find(ad => ad.placement === placement);
    if (config) {
      adMutation.mutate({
        placement,
        adCode: config.adCode,
        isEnabled: !currentStatus
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your SocialGrab application settings and monitor analytics
            </p>
          </div>
          <Button
            onClick={async () => {
              await logout();
              setLocation('/admin/login');
            }}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-logout"
          >
            <Shield className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 md:grid-cols-10 p-1.5 sm:p-2 bg-muted rounded-lg overflow-x-auto">
            <TabsTrigger value="overview" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Analytics</TabsTrigger>
            <TabsTrigger value="plans" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Plans</TabsTrigger>
            <TabsTrigger value="adsense" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">AdSense</TabsTrigger>
            <TabsTrigger value="seo" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">SEO</TabsTrigger>
            <TabsTrigger value="email" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Email</TabsTrigger>
            <TabsTrigger value="apikeys" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">API Keys</TabsTrigger>
            <TabsTrigger value="config" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Config</TabsTrigger>
            <TabsTrigger value="ads" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Ads</TabsTrigger>
            <TabsTrigger value="mobile" className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Mobile App</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.totalDownloads || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.totalUsers || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Downloads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? "..." : stats?.downloadsToday || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0.00</div>
                  <p className="text-xs text-muted-foreground">Connect ads for revenue</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Breakdown */}
            {stats?.platformBreakdown && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Platform Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.platformBreakdown).map(([platform, count]) => (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="capitalize">{platform}</span>
                        <Badge variant="secondary">{count} downloads</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div>Loading analytics...</div>
                ) : analytics && analytics.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {analytics.map((event) => (
                      <div key={event.id} className="flex flex-col space-y-1 p-3 bg-muted/20 rounded-lg">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline">{event.event}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp ? format(new Date(event.timestamp), 'MMM d, HH:mm') : 'Unknown time'}
                          </span>
                        </div>
                        {event.platform && (
                          <p className="text-sm text-muted-foreground">Platform: {event.platform}</p>
                        )}
                        {event.metadata && (
                          <p className="text-xs text-muted-foreground">
                            {JSON.stringify(event.metadata)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No analytics data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Add Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleConfigSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="config-key">Configuration Key</Label>
                      <Input
                        id="config-key"
                        value={configForm.key}
                        onChange={(e) => setConfigForm({...configForm, key: e.target.value})}
                        placeholder="e.g., app_name, max_downloads_per_day"
                      />
                    </div>
                    <div>
                      <Label htmlFor="config-value">Value</Label>
                      <Input
                        id="config-value"
                        value={configForm.value}
                        onChange={(e) => setConfigForm({...configForm, value: e.target.value})}
                        placeholder="Configuration value"
                      />
                    </div>
                    <div>
                      <Label htmlFor="config-description">Description (Optional)</Label>
                      <Textarea
                        id="config-description"
                        value={configForm.description}
                        onChange={(e) => setConfigForm({...configForm, description: e.target.value})}
                        placeholder="Brief description of this configuration"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={configMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {configMutation.isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Configurations */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Configurations</CardTitle>
                </CardHeader>
                <CardContent>
                  {configLoading ? (
                    <div>Loading configurations...</div>
                  ) : appConfig && appConfig.length > 0 ? (
                    <div className="space-y-4">
                      {appConfig.map((config) => (
                        <div key={config.key} className="p-3 bg-muted/20 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{config.key}</h4>
                            <span className="text-xs text-muted-foreground">
                              {config.updatedAt ? format(new Date(config.updatedAt), 'MMM d, yyyy') : 'Not set'}
                            </span>
                          </div>
                          <p className="text-sm mb-1">{config.value}</p>
                          {config.description && (
                            <p className="text-xs text-muted-foreground">{config.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No configurations set</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Plans Tab */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Create Subscription Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePlanSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="plan-name">Plan Name</Label>
                        <Input
                          id="plan-name"
                          value={planForm.name}
                          onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                          placeholder="e.g., Basic, Premium, Pro"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="plan-price">Price (in cents)</Label>
                        <Input
                          id="plan-price"
                          type="number"
                          value={planForm.price}
                          onChange={(e) => setPlanForm({...planForm, price: parseInt(e.target.value) || 0})}
                          placeholder="e.g., 999 for $9.99"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="plan-description">Description</Label>
                      <Textarea
                        id="plan-description"
                        value={planForm.description}
                        onChange={(e) => setPlanForm({...planForm, description: e.target.value})}
                        placeholder="Describe what this plan includes..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="plan-interval">Billing Interval</Label>
                        <select
                          id="plan-interval"
                          value={planForm.interval}
                          onChange={(e) => setPlanForm({...planForm, interval: e.target.value})}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          <option value="month">Monthly</option>
                          <option value="year">Yearly</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="plan-quality">Max Video Quality</Label>
                        <select
                          id="plan-quality"
                          value={planForm.maxVideoQuality}
                          onChange={(e) => setPlanForm({...planForm, maxVideoQuality: e.target.value})}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          <option value="low">Low Quality</option>
                          <option value="medium">Medium Quality</option>
                          <option value="high">High Quality</option>
                          <option value="2k">2K Quality</option>
                          <option value="4k">4K Quality</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="remove-ads"
                        checked={planForm.removeAds}
                        onCheckedChange={(checked) => setPlanForm({...planForm, removeAds: checked})}
                      />
                      <Label htmlFor="remove-ads">Remove Ads</Label>
                    </div>
                    <div>
                      <Label>Plan Features</Label>
                      <div className="space-y-2">
                        {planForm.features.map((feature, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => updateFeature(index, e.target.value)}
                              placeholder="Feature description"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFeature(index)}
                              disabled={planForm.features.length === 1}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addFeature}>
                          Add Feature
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" disabled={planMutation.isPending}>
                      {planMutation.isPending ? "Creating..." : "Create Plan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  {plansLoading ? (
                    <div>Loading subscription plans...</div>
                  ) : subscriptionPlans && subscriptionPlans.length > 0 ? (
                    <div className="space-y-4">
                      {subscriptionPlans.map((plan) => (
                        <div key={plan.id} className="p-4 border rounded-lg bg-muted/20">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-lg">{plan.name}</h4>
                              <p className="text-2xl font-bold text-primary">
                                ${(plan.price / 100).toFixed(2)}
                                <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={plan.isActive ? "default" : "secondary"}>
                                {plan.isActive ? "Active" : "Inactive"}
                              </Badge>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deletePlan(plan.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">Max Quality: {plan.maxVideoQuality}</Badge>
                            {plan.removeAds && <Badge variant="outline">Ad-Free</Badge>}
                          </div>
                          {plan.features && plan.features.length > 0 && (
                            <div className="text-sm">
                              <strong>Features:</strong>
                              <ul className="list-disc list-inside ml-2">
                                {plan.features.map((feature, idx) => (
                                  <li key={idx}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No subscription plans created yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apikeys">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    API Keys Configuration
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure API keys for Stripe payments and other services
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="api-key-name">API Key Name</Label>
                      <select
                        id="api-key-name"
                        value={apiKeyForm.key}
                        onChange={(e) => setApiKeyForm({...apiKeyForm, key: e.target.value})}
                        className="w-full p-2 border rounded-md bg-background"
                        required
                      >
                        <option value="">Select API Key</option>
                        <option value="STRIPE_SECRET_KEY">Stripe Secret Key</option>
                        <option value="VITE_STRIPE_PUBLIC_KEY">Stripe Public Key</option>
                        <option value="STRIPE_WEBHOOK_SECRET">Stripe Webhook Secret</option>
                        <option value="OPENAI_API_KEY">OpenAI API Key</option>
                        <option value="SENDGRID_API_KEY">SendGrid API Key</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="api-key-value">API Key Value</Label>
                      <Input
                        id="api-key-value"
                        type="password"
                        value={apiKeyForm.value}
                        onChange={(e) => setApiKeyForm({...apiKeyForm, value: e.target.value})}
                        placeholder="Enter the API key value"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={configMutation.isPending}>
                      {configMutation.isPending ? "Saving..." : "Save API Key"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current API Keys */}
              <Card>
                <CardHeader>
                  <CardTitle>Configured API Keys</CardTitle>
                </CardHeader>
                <CardContent>
                  {configLoading ? (
                    <div>Loading API keys...</div>
                  ) : appConfig ? (
                    <div className="space-y-2">
                      {[
                        'STRIPE_SECRET_KEY',
                        'VITE_STRIPE_PUBLIC_KEY', 
                        'STRIPE_WEBHOOK_SECRET',
                        'OPENAI_API_KEY',
                        'SENDGRID_API_KEY'
                      ].map((keyName) => {
                        const configItem = appConfig.find(c => c.key === keyName);
                        return (
                          <div key={keyName} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <div>
                              <span className="font-medium">{keyName}</span>
                              <p className="text-xs text-muted-foreground">
                                {keyName.startsWith('STRIPE') ? 'Stripe Payment Processing' :
                                 keyName.startsWith('OPENAI') ? 'AI Features' :
                                 keyName.startsWith('SENDGRID') ? 'Email Services' : 'API Configuration'}
                              </p>
                            </div>
                            <Badge variant={configItem ? "default" : "secondary"}>
                              {configItem ? "Configured" : "Not Set"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Loading...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ads Tab */}
          <TabsContent value="ads">
            <div className="space-y-6">
              {/* Professional Ad Network Management */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Professional Ad Network Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Control ad networks across web browser and Android app platforms with precision
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Platform Controls */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Web Browser Ads */}
                    <div className="border rounded-lg p-4 bg-blue-50/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Web Browser Platform</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">AdSense (Web)</Label>
                            <p className="text-xs text-muted-foreground">Google AdSense for web browsers</p>
                          </div>
                          <Switch
                            checked={adNetworkSettings.adsense_web_enabled}
                            onCheckedChange={(checked) => 
                              setAdNetworkSettings(prev => ({ ...prev, adsense_web_enabled: checked }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">AdMob (Web)</Label>
                            <p className="text-xs text-muted-foreground">AdMob for web browsers (experimental)</p>
                          </div>
                          <Switch
                            checked={adNetworkSettings.admob_web_enabled}
                            onCheckedChange={(checked) => 
                              setAdNetworkSettings(prev => ({ ...prev, admob_web_enabled: checked }))
                            }
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Ad Frequency (Web)</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={adNetworkSettings.ads_frequency_web}
                            onChange={(e) => 
                              setAdNetworkSettings(prev => ({ ...prev, ads_frequency_web: e.target.value }))
                            }
                          >
                            <option value="low">Low (Every 5 pages)</option>
                            <option value="medium">Medium (Every 3 pages)</option>
                            <option value="high">High (Every page)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Android App Ads */}
                    <div className="border rounded-lg p-4 bg-green-50/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-green-900">Android App Platform</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">AdMob (Android)</Label>
                            <p className="text-xs text-muted-foreground">Google AdMob for Android APK</p>
                          </div>
                          <Switch
                            checked={adNetworkSettings.admob_android_enabled}
                            onCheckedChange={(checked) => 
                              setAdNetworkSettings(prev => ({ ...prev, admob_android_enabled: checked }))
                            }
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-medium">AdSense (Android)</Label>
                            <p className="text-xs text-muted-foreground">AdSense in Android (if supported)</p>
                          </div>
                          <Switch
                            checked={adNetworkSettings.adsense_android_enabled}
                            onCheckedChange={(checked) => 
                              setAdNetworkSettings(prev => ({ ...prev, adsense_android_enabled: checked }))
                            }
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Ad Frequency (Android)</Label>
                          <select 
                            className="w-full p-2 border rounded"
                            value={adNetworkSettings.ads_frequency_android}
                            onChange={(e) => 
                              setAdNetworkSettings(prev => ({ ...prev, ads_frequency_android: e.target.value }))
                            }
                          >
                            <option value="low">Low (Every 10 downloads)</option>
                            <option value="medium">Medium (Every 5 downloads)</option>
                            <option value="high">High (Every 2 downloads)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Global Settings */}
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Global Ad Settings
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="font-medium">Premium Users</Label>
                          <p className="text-xs text-muted-foreground">Hide all ads for premium subscribers</p>
                        </div>
                        <Switch
                          checked={adNetworkSettings.premium_ads_disabled}
                          onCheckedChange={(checked) => 
                            setAdNetworkSettings(prev => ({ ...prev, premium_ads_disabled: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label className="font-medium">Testing Mode</Label>
                          <p className="text-xs text-muted-foreground">Show test ads only (development)</p>
                        </div>
                        <Switch
                          checked={adNetworkSettings.ad_testing_mode}
                          onCheckedChange={(checked) => 
                            setAdNetworkSettings(prev => ({ ...prev, ad_testing_mode: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => saveAdNetworkMutation.mutate(adNetworkSettings)}
                      disabled={saveAdNetworkMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Shield className="h-4 w-4" />
                      {saveAdNetworkMutation.isPending ? "Saving..." : "Save Ad Network Settings"}
                    </Button>
                    <Button variant="outline">
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ad Network Status Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Ad Network Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {adNetworkSettings.adsense_web_enabled ? "🟢" : "🔴"}
                      </div>
                      <p className="font-medium">AdSense Web</p>
                      <p className="text-xs text-muted-foreground">
                        {adNetworkSettings.adsense_web_enabled ? "Active" : "Disabled"}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {adNetworkSettings.admob_android_enabled ? "🟢" : "🔴"}
                      </div>
                      <p className="font-medium">AdMob Android</p>
                      <p className="text-xs text-muted-foreground">
                        {adNetworkSettings.admob_android_enabled ? "Active" : "Disabled"}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {adNetworkSettings.premium_ads_disabled ? "🛡️" : "💰"}
                      </div>
                      <p className="font-medium">Premium Mode</p>
                      <p className="text-xs text-muted-foreground">
                        {adNetworkSettings.premium_ads_disabled ? "Ad-Free" : "Show Ads"}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {adNetworkSettings.ad_testing_mode ? "🧪" : "🚀"}
                      </div>
                      <p className="font-medium">Environment</p>
                      <p className="text-xs text-muted-foreground">
                        {adNetworkSettings.ad_testing_mode ? "Testing" : "Production"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Ad Management */}
              <Card className="border-2 border-orange-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Image Ad Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload custom images for different screen sizes and manage ad placements
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const placement = formData.get('placement') as string;
                    const adType = formData.get('adType') as string;
                    const clickUrl = formData.get('clickUrl') as string;
                    const altText = formData.get('altText') as string;
                    const isEnabled = ((e.target as HTMLFormElement).querySelector('#image-ad-enabled') as HTMLInputElement)?.checked;
                    
                    // For now, we'll handle image uploads as URLs
                    // TODO: Implement proper file upload handling
                    const imageDesktopUrl = formData.get('imageDesktopUrl') as string;
                    const imageTabletUrl = formData.get('imageTabletUrl') as string;
                    const imageMobileUrl = formData.get('imageMobileUrl') as string;
                    
                    if (!placement) {
                      toast({ title: "Please select a placement", variant: "destructive" });
                      return;
                    }
                    
                    const data = {
                      placement,
                      adType: adType || 'image',
                      isEnabled: !!isEnabled,
                      adCode: '', // Empty for image ads
                      imageDesktopUrl,
                      imageTabletUrl,
                      imageMobileUrl,
                      clickUrl,
                      altText: altText || 'Advertisement'
                    };
                    
                    adMutation.mutate(data);
                  }} className="space-y-6">
                    
                    {/* Placement and Type Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="placement">Ad Placement</Label>
                        <select
                          id="placement"
                          name="placement"
                          className="w-full p-2 border rounded"
                          data-testid="select-placement"
                        >
                          <option value="">Select placement...</option>
                          <option value="post-download">Post-Download</option>
                          <option value="header">Header</option>
                          <option value="sidebar">Sidebar</option>
                          <option value="footer">Footer</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adType">Ad Type</Label>
                        <select
                          id="adType"
                          name="adType"
                          className="w-full p-2 border rounded"
                          data-testid="select-ad-type"
                        >
                          <option value="image">Image Ad</option>
                          <option value="code">Custom Code</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4 border rounded-lg p-4 bg-orange-50/30">
                      <h4 className="font-medium text-orange-900 flex items-center gap-2">
                        🖼️ Upload Images (Responsive)
                      </h4>
                      
                      <div className="grid gap-4">
                        <ImageUploadField
                          label="Desktop Image (1024px+)"
                          name="imageDesktopUrl"
                          description="Recommended: 728×90 (banner) or 300×250 (rectangle)"
                          testId="input-desktop-image"
                        />
                        
                        <ImageUploadField
                          label="Tablet Image (768px+)"
                          name="imageTabletUrl"
                          description="Recommended: 468×60 or 320×50"
                          testId="input-tablet-image"
                        />
                        
                        <ImageUploadField
                          label="Mobile Image (320px+)"
                          name="imageMobileUrl"
                          description="Recommended: 320×50 or 300×100"
                          testId="input-mobile-image"
                        />
                      </div>
                    </div>

                    {/* Click URL and Alt Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="clickUrl">Click URL (Optional)</Label>
                        <Input
                          id="clickUrl"
                          name="clickUrl"
                          placeholder="https://example.com/landing-page"
                          data-testid="input-click-url"
                        />
                        <p className="text-xs text-muted-foreground">
                          Where users go when they click the ad
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="altText">Alt Text</Label>
                        <Input
                          id="altText"
                          name="altText"
                          placeholder="Advertisement"
                          defaultValue="Advertisement"
                          data-testid="input-alt-text"
                        />
                        <p className="text-xs text-muted-foreground">
                          Accessibility text for screen readers
                        </p>
                      </div>
                    </div>

                    {/* Enable/Disable Switch */}
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="image-ad-enabled"
                        name="image-ad-enabled"
                        defaultChecked={true}
                        data-testid="switch-enabled"
                      />
                      <Label htmlFor="image-ad-enabled">Enable this image ad</Label>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      disabled={adMutation.isPending}
                      className="w-full md:w-auto flex items-center gap-2"
                      data-testid="button-save-image-ad"
                    >
                      {adMutation.isPending ? "Saving..." : "Save Image Ad"}
                    </Button>
                  </form>

                  {/* Current Image Ads Display */}
                  {!adsLoading && adConfigs && adConfigs.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h4 className="font-medium mb-4">Current Image Ads</h4>
                      <div className="grid gap-4">
                        {adConfigs
                          .filter(ad => ad.adType === 'image' || (!ad.adCode && (ad.imageDesktopUrl || ad.imageTabletUrl || ad.imageMobileUrl)))
                          .map((adConfig) => (
                          <div key={adConfig.placement} className="border rounded-lg p-4 bg-gradient-to-r from-orange-50/50 to-transparent">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium capitalize flex items-center gap-2">
                                🖼️ {adConfig.placement} Image Ad
                              </h5>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={adConfig.isEnabled}
                                  onCheckedChange={() => toggleAdStatus(adConfig.placement, adConfig.isEnabled)}
                                />
                                <Badge variant={adConfig.isEnabled ? "default" : "secondary"}>
                                  {adConfig.isEnabled ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Image Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mb-3">
                              {adConfig.imageDesktopUrl && (
                                <div className="p-2 bg-blue-50 rounded border">
                                  <p className="font-medium text-blue-700">Desktop</p>
                                  <p className="truncate text-blue-600">{adConfig.imageDesktopUrl}</p>
                                </div>
                              )}
                              {adConfig.imageTabletUrl && (
                                <div className="p-2 bg-green-50 rounded border">
                                  <p className="font-medium text-green-700">Tablet</p>
                                  <p className="truncate text-green-600">{adConfig.imageTabletUrl}</p>
                                </div>
                              )}
                              {adConfig.imageMobileUrl && (
                                <div className="p-2 bg-purple-50 rounded border">
                                  <p className="font-medium text-purple-700">Mobile</p>
                                  <p className="truncate text-purple-600">{adConfig.imageMobileUrl}</p>
                                </div>
                              )}
                            </div>
                            
                            {adConfig.clickUrl && (
                              <p className="text-xs text-muted-foreground mb-2">
                                <strong>Click URL:</strong> {adConfig.clickUrl}
                              </p>
                            )}
                            
                            <p className="text-xs text-muted-foreground">
                              Updated: {adConfig.updatedAt ? format(new Date(adConfig.updatedAt), 'MMM d, yyyy HH:mm') : 'Not set'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Legacy Ad Code Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Legacy Ad Code Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Traditional ad placement management (HTML/JavaScript)
                  </p>
                </CardHeader>
                <CardContent>
                  {adsLoading ? (
                    <p className="text-muted-foreground">Loading ad configurations...</p>
                  ) : adConfigs && adConfigs.length > 0 ? (
                    <div className="grid gap-4">
                      {adConfigs.filter(ad => ad.adType !== 'image' && ad.adCode).map((adConfig) => (
                        <div key={adConfig.placement} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{adConfig.placement} Ad</h4>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={adConfig.isEnabled}
                                onCheckedChange={() => toggleAdStatus(adConfig.placement, adConfig.isEnabled)}
                              />
                              <Badge variant={adConfig.isEnabled ? "default" : "secondary"}>
                                {adConfig.isEnabled ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Updated: {adConfig.updatedAt ? format(new Date(adConfig.updatedAt), 'MMM d, yyyy HH:mm') : 'Not set'}
                          </p>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-muted-foreground">View Ad Code</summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {adConfig.adCode}
                            </pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No ad configurations set</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Mobile App Tab */}
          <TabsContent value="mobile">
            <div className="grid gap-6">
              {/* Mobile App Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile App Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                          <Download className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">SocialGrab Mobile App</h3>
                          <p className="text-sm text-gray-600">Professional video downloader for mobile devices</p>
                        </div>
                      </div>
                      <MobileAppModal>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-2"
                          data-testid="button-mobile-preview"
                        >
                          <ExternalLink size={16} />
                          <span>Preview App</span>
                        </Button>
                      </MobileAppModal>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg border">
                        <SiGoogleplay size={20} className="text-green-600" />
                        <div>
                          <div className="text-xs text-gray-500">Available on</div>
                          <div className="text-sm font-medium text-gray-900">Google Play Store</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border opacity-60">
                        <SiApple size={20} className="text-gray-400" />
                        <div>
                          <div className="text-xs text-gray-400">Coming to</div>
                          <div className="text-sm font-medium text-gray-400">App Store</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-600">
                      <p>Click "Preview App" to see the complete mobile app presentation with features, pricing, and download options.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile App Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    
                    try {
                      const configs = [
                        { key: 'play_store_url', value: formData.get('play-store-url') as string, description: 'Google Play Store download URL' },
                        { key: 'app_store_url', value: formData.get('app-store-url') as string, description: 'Apple App Store download URL' },
                        { key: 'email_gateway_enabled', value: ((e.target as HTMLFormElement).querySelector('#email-gateway') as HTMLInputElement)?.checked ? 'true' : 'false', description: 'Enable email notifications for iOS app' },
                        { key: 'mobile_app_enabled', value: ((e.target as HTMLFormElement).querySelector('#mobile-app-enabled') as HTMLInputElement)?.checked ? 'true' : 'false', description: 'Show mobile app section in footer and enable APK features' }
                      ];
                      
                      for (const config of configs) {
                        if (config.value && config.value !== 'false') {
                          await apiRequest("POST", "/api/admin/config", config);
                        } else if (config.key === 'email_gateway_enabled') {
                          await apiRequest("POST", "/api/admin/config", config);
                        }
                      }
                      
                      toast({
                        title: "Success",
                        description: "Mobile app configuration updated!",
                      });
                      
                      queryClient.invalidateQueries({ queryKey: ['/admin/config'] });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to update configuration",
                        variant: "destructive",
                      });
                    }
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="play-store-url">Google Play Store URL</Label>
                      <Input
                        id="play-store-url"
                        name="play-store-url"
                        placeholder="https://play.google.com/store/apps/details?id=com.socialgrab.app"
                        defaultValue={appConfig?.find(c => c.key === 'play_store_url')?.value || ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        URL where users can download your Android app
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="app-store-url">Apple App Store URL</Label>
                      <Input
                        id="app-store-url"
                        name="app-store-url"
                        placeholder="https://apps.apple.com/app/socialgrab/idXXXXXXXXX"
                        defaultValue={appConfig?.find(c => c.key === 'app_store_url')?.value || ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        iOS app URL (will be enabled when app is ready)
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="mobile-app-enabled"
                          name="mobile-app-enabled"
                          defaultChecked={appConfig?.find(c => c.key === 'mobile_app_enabled')?.value === 'true'}
                        />
                        <Label htmlFor="mobile-app-enabled">Enable Mobile App Section</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Show mobile app section in footer and enable APK download features
                      </p>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="email-gateway"
                          name="email-gateway"
                          defaultChecked={appConfig?.find(c => c.key === 'email_gateway_enabled')?.value === 'true'}
                        />
                        <Label htmlFor="email-gateway">Enable Email Gateway for iOS Notifications</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Allow users to subscribe for iOS app release notifications
                      </p>
                    </div>

                    <Button type="submit" className="w-full">
                      Save Mobile App Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    AdMob Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 AdMob Integration</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Configure your AdMob settings for mobile app monetization. These settings will be used when you convert your web app to APK.
                    </p>
                    <div className="text-xs text-blue-600">
                      <p>• Banner ads for continuous revenue</p>
                      <p>• Interstitial ads between downloads</p>
                      <p>• Rewarded ads for premium features</p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admob-app-id">AdMob Application ID</Label>
                      <Input
                        id="admob-app-id"
                        placeholder="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
                        // value={admobAppId}
                        // onChange={(e) => setAdmobAppId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Your AdMob App ID from Google AdMob console
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admob-banner-id">Banner Ad Unit ID</Label>
                      <Input
                        id="admob-banner-id"
                        placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                        // value={admobBannerId}
                        // onChange={(e) => setAdmobBannerId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ad unit ID for banner advertisements
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admob-interstitial-id">Interstitial Ad Unit ID</Label>
                      <Input
                        id="admob-interstitial-id"
                        placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                        // value={admobInterstitialId}
                        // onChange={(e) => setAdmobInterstitialId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ad unit ID for full-screen interstitial ads
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="admob-rewarded-id">Rewarded Ad Unit ID</Label>
                      <Input
                        id="admob-rewarded-id"
                        placeholder="ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX"
                        // value={admobRewardedId}
                        // onChange={(e) => setAdmobRewardedId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ad unit ID for rewarded video advertisements
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      // onClick={saveAdMobConfig}
                      // disabled={savingAdMob}
                    >
                      {/* {savingAdMob ? "Saving..." : "Save AdMob Settings"} */}
                      Save AdMob Settings
                    </Button>
                    <Button variant="outline">
                      Test Configuration
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">📱 Mobile App Features</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <p className="font-medium mb-1">Revenue Strategies:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Premium subscriptions (ad-free)</li>
                          <li>• AdMob banner advertisements</li>
                          <li>• Interstitial ads between downloads</li>
                          <li>• Rewarded ads for faster downloads</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-1">App Features:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Offline video downloads</li>
                          <li>• Batch processing</li>
                          <li>• Background downloads</li>
                          <li>• Push notifications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Manager Tab */}
          <TabsContent value="seo">
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Google Search Console */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Google Search Console
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="search-console-property">Property URL</Label>
                      <Input
                        id="search-console-property"
                        placeholder={window.location.origin}
                        readOnly
                        value={window.location.origin}
                      />
                    </div>
                    <Button
                      onClick={() => window.open("https://search.google.com/search-console", "_blank")}
                      variant="outline"
                      className="w-full"
                      data-testid="button-search-console"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Search Console
                    </Button>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>1. Go to Google Search Console</p>
                      <p>2. Add your property: {window.location.origin}</p>
                      <p>3. Verify ownership using meta tag</p>
                      <p>4. Submit your sitemap</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Analytics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Google Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ga-measurement-id">Measurement ID</Label>
                      <Input
                        id="ga-measurement-id"
                        placeholder="G-XXXXXXXXXX"
                        data-testid="input-ga-measurement-id"
                      />
                    </div>
                    <Button
                      onClick={() => window.open("https://analytics.google.com", "_blank")}
                      variant="outline"
                      className="w-full"
                      data-testid="button-analytics"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Analytics
                    </Button>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>1. Create a Google Analytics account</p>
                      <p>2. Add a new property for your website</p>
                      <p>3. Copy your Measurement ID (starts with G-)</p>
                      <p>4. Paste it above to enable tracking</p>
                    </div>
                  </CardContent>
                </Card>

                {/* PageSpeed Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      PageSpeed Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => window.open(`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(window.location.origin)}`, "_blank")}
                      variant="outline"
                      className="w-full"
                      data-testid="button-pagespeed"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test Your Site Speed
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Get insights on your website's Core Web Vitals and performance metrics
                    </div>
                  </CardContent>
                </Card>

                {/* Google Business Profile */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Google Business Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => window.open("https://business.google.com", "_blank")}
                      variant="outline"
                      className="w-full"
                      data-testid="button-business-profile"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Business Profile
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Create or claim your business listing to appear in local search results
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Meta Tags Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Website Meta Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const siteTitle = formData.get('site-title') as string;
                    const siteDescription = formData.get('site-description') as string;
                    const siteKeywords = formData.get('site-keywords') as string;
                    
                    configMutation.mutate({ key: 'site_title', value: siteTitle, description: 'Website title for SEO' });
                    configMutation.mutate({ key: 'site_description', value: siteDescription, description: 'Website meta description' });
                    configMutation.mutate({ key: 'site_keywords', value: siteKeywords, description: 'SEO keywords' });
                    
                    toast({
                      title: "Meta tags updated",
                      description: "Your SEO meta tags have been saved successfully.",
                    });
                  }} className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="site-title">Site Title</Label>
                      <Input
                        id="site-title"
                        name="site-title"
                        placeholder="SocialGrab - Video Downloader"
                        data-testid="input-site-title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site-keywords">Keywords</Label>
                      <Input
                        id="site-keywords"
                        name="site-keywords"
                        placeholder="video downloader, facebook, tiktok, instagram"
                        data-testid="input-site-keywords"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="site-description">Meta Description</Label>
                      <Textarea
                        id="site-description"
                        name="site-description"
                        placeholder="Download videos from Facebook, TikTok, Instagram, and Pinterest quickly and easily."
                        rows={3}
                        data-testid="textarea-site-description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Button type="submit" className="w-full" data-testid="button-save-meta-tags">
                        Save Meta Tags
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Sitemap Management */}
              <Card>
                <CardHeader>
                  <CardTitle>XML Sitemap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sitemap URL</p>
                      <p className="text-sm text-muted-foreground">{window.location.origin}/sitemap.xml</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/sitemap.xml`);
                          toast({
                            title: "Copied to clipboard",
                            description: "Sitemap URL copied successfully.",
                          });
                        }}
                        data-testid="button-copy-sitemap"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`${window.location.origin}/sitemap.xml`, "_blank")}
                        data-testid="button-view-sitemap"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="font-medium">Submit to Search Engines:</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.google.com/ping?sitemap=${encodeURIComponent(window.location.origin + '/sitemap.xml')}`, "_blank")}
                        data-testid="button-submit-google"
                      >
                        Submit to Google
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.bing.com/ping?sitemap=${encodeURIComponent(window.location.origin + '/sitemap.xml')}`, "_blank")}
                        data-testid="button-submit-bing"
                      >
                        Submit to Bing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Site Verification */}
              <Card>
                <CardHeader>
                  <CardTitle>Site Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target as HTMLFormElement);
                    const googleVerification = formData.get('google-verification') as string;
                    const bingVerification = formData.get('bing-verification') as string;
                    
                    if (googleVerification) {
                      configMutation.mutate({ 
                        key: 'google_site_verification', 
                        value: googleVerification, 
                        description: 'Google site verification meta tag' 
                      });
                    }
                    if (bingVerification) {
                      configMutation.mutate({ 
                        key: 'bing_site_verification', 
                        value: bingVerification, 
                        description: 'Bing site verification meta tag' 
                      });
                    }
                    
                    toast({
                      title: "Verification codes saved",
                      description: "Your site verification codes have been updated.",
                    });
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="google-verification">Google Search Console Verification</Label>
                      <Input
                        id="google-verification"
                        name="google-verification"
                        placeholder="Enter verification code from Search Console"
                        data-testid="input-google-verification"
                      />
                      <p className="text-xs text-muted-foreground">
                        Get this from Google Search Console → Settings → Users and permissions → Verification details
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bing-verification">Bing Webmaster Tools Verification</Label>
                      <Input
                        id="bing-verification"
                        name="bing-verification"
                        placeholder="Enter verification code from Bing Webmaster Tools"
                        data-testid="input-bing-verification"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" data-testid="button-save-verification">
                      Save Verification Codes
                    </Button>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <p className="font-medium">Quick Links:</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://search.google.com/search-console", "_blank")}
                          data-testid="button-google-console"
                        >
                          Google Search Console
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open("https://www.bing.com/webmasters", "_blank")}
                          data-testid="button-bing-webmasters"
                        >
                          Bing Webmaster Tools
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AdSense Settings Tab */}
          <TabsContent value="adsense">
            <AdSenseSettings />
          </TabsContent>

          {/* Email Manager Tab */}
          <TabsContent value="email">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Email Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage email templates, send emails, and configure SMTP settings
                  </p>
                </div>
                <Button
                  onClick={() => setLocation('/admin/email-manager')}
                  className="flex items-center gap-2"
                  data-testid="button-open-email-manager"
                >
                  <Mail className="w-4 h-4" />
                  Open Email Manager
                </Button>
              </div>
              <EmailGatewaySettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent />;
}