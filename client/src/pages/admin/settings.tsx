import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Removed useToast - using inline AJAX feedback instead
import { apiRequest } from "@/lib/queryClient";
import { Settings, Globe, DollarSign, BarChart3, Search, Mail, Wrench } from "lucide-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'text' | 'boolean' | 'number' | 'email';
  category: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery<Setting[]>({
    queryKey: ['/api/admin/settings'],
    staleTime: 30000
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      const response = await apiRequest("POST", "/api/admin/settings", { settings });
      return response.json();
    },
    onSuccess: () => {
      setStatusMessage({type: 'success', message: "Settings saved successfully!"});
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      setTimeout(() => setStatusMessage({type: null, message: ""}), 3000);
    },
    onError: (error: Error) => {
      setStatusMessage({type: 'error', message: error.message});
      setTimeout(() => setStatusMessage({type: null, message: ""}), 5000);
    },
  });

  useEffect(() => {
    if (settingsData) {
      const settingsMap: Record<string, string> = {};
      settingsData.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    }
  }, [settingsData]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const groupedSettings = settingsData?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, Setting[]>) || {};

  const renderSettingInput = (setting: Setting) => {
    const value = settings[setting.key] || setting.value;
    
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => handleSettingChange(setting.key, checked ? 'true' : 'false')}
              id={setting.key}
            />
            <Label htmlFor={setting.key}>{setting.description}</Label>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.description}</Label>
            <Textarea
              id={setting.key}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              placeholder={setting.description}
              className="min-h-[80px]"
            />
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={setting.key}>{setting.description}</Label>
            <Input
              id={setting.key}
              type={setting.type === 'email' ? 'email' : setting.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleSettingChange(setting.key, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      site: Globe,
      adsense: DollarSign,
      analytics: BarChart3,
      seo: Search,
      features: Settings,
      email: Mail,
      maintenance: Wrench,
      social: Globe,
      technical: Wrench,
      monetization: DollarSign,
      general: Settings
    };
    const Icon = icons[category as keyof typeof icons] || Settings;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryTitle = (category: string) => {
    const titles = {
      site: 'Site Settings',
      adsense: 'Google AdSense',
      analytics: 'Analytics & Tracking', 
      seo: 'SEO Configuration',
      features: 'Features & Limits',
      email: 'Email Settings',
      maintenance: 'Maintenance Mode',
      social: 'Social Media',
      technical: 'Technical SEO',
      monetization: 'AdSense & Monetization',
      general: 'General Settings'
    };
    return titles[category as keyof typeof titles] || category;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Configure your site settings, integrations, and features</p>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || saveSettingsMutation.isPending}
          className="min-w-[120px]"
        >
          {saveSettingsMutation.isPending ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
        </Button>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          {Object.keys(groupedSettings).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center space-x-2">
              {getCategoryIcon(category)}
              <span className="hidden sm:inline">{getCategoryTitle(category).split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span>{getCategoryTitle(category)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    {renderSettingInput(setting)}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-6 right-6">
          <Card className="p-4 shadow-lg border-2 border-primary">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">You have unsaved changes</span>
              <Button size="sm" onClick={handleSave} disabled={saveSettingsMutation.isPending}>
                Save Now
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}