import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, TestTube, Plus, Check, X, Settings } from "lucide-react";

interface EmailGateway {
  id: string;
  name: string;
  provider: string;
  config: any;
  isActive: boolean;
  isDefault: boolean;
  testEmail?: string;
  lastTested?: string;
  testStatus?: string;
  createdAt: string;
  updatedAt: string;
}

const emailGatewaySchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.enum(["sendgrid", "smtp"]),
  config: z.object({
    apiKey: z.string().optional(),
    from: z.string().email("Valid email address required"),
    host: z.string().optional(),
    port: z.number().optional(),
    secure: z.boolean().optional(),
    auth: z.object({
      user: z.string().optional(),
      pass: z.string().optional(),
    }).optional(),
  }),
});

type EmailGatewayFormData = z.infer<typeof emailGatewaySchema>;

export default function EmailGatewaySettings() {
  const [isAddingGateway, setIsAddingGateway] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const { toast } = useToast();

  // Fetch email gateways
  const { data: gateways = [], isLoading: gatewaysLoading } = useQuery<EmailGateway[]>({
    queryKey: ["/api/admin/email-gateways"],
  });

  const form = useForm<EmailGatewayFormData>({
    resolver: zodResolver(emailGatewaySchema),
    defaultValues: {
      name: "",
      provider: "sendgrid",
      config: {
        from: "",
        apiKey: "",
        host: "",
        port: 587,
        secure: false,
        auth: {
          user: "",
          pass: "",
        },
      },
    },
  });

  // Create gateway mutation
  const createGatewayMutation = useMutation({
    mutationFn: async (data: EmailGatewayFormData) => {
      return await apiRequest("POST", "/api/admin/email-gateways", data);
    },
    onSuccess: () => {
      toast({
        title: "Email Gateway Created",
        description: "Email gateway has been configured successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-gateways"] });
      setIsAddingGateway(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure email gateway.",
        variant: "destructive",
      });
    },
  });

  // Test gateway mutation
  const testGatewayMutation = useMutation({
    mutationFn: async ({ gatewayId, email }: { gatewayId: string; email: string }) => {
      return await apiRequest("POST", `/api/admin/email-gateways/${gatewayId}/test`, { testEmail: email });
    },
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Check your inbox for the test email.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-gateways"] });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  const handleTestGateway = (gatewayId: string) => {
    if (!testEmail) {
      toast({
        title: "Test Email Required",
        description: "Please enter an email address for testing.",
        variant: "destructive",
      });
      return;
    }
    testGatewayMutation.mutate({ gatewayId, email: testEmail });
  };

  if (gatewaysLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Gateway Configuration</h2>
          <p className="text-muted-foreground">
            Configure email gateways for sending OTP verification and notifications
          </p>
        </div>
        <Button 
          onClick={() => setIsAddingGateway(true)}
          data-testid="button-add-gateway"
        >
          <Plus className="mr-2" />
          Add Gateway
        </Button>
      </div>

      {/* Test Email Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube />
            <span>Test Configuration</span>
          </CardTitle>
          <CardDescription>
            Enter an email address to test your gateway configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              type="email"
              data-testid="input-test-email"
            />
            <Button
              variant="outline"
              disabled={!testEmail}
              onClick={() => {
                if (gateways.length > 0) {
                  const activeGateway = gateways.find(g => g.isActive) || gateways[0];
                  handleTestGateway(activeGateway.id);
                }
              }}
              data-testid="button-test-all"
            >
              Test Active Gateway
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Gateways */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configured Gateways</h3>
        {gateways.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="mx-auto text-4xl text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No email gateways configured</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add an email gateway to enable OTP verification and notifications
              </p>
            </CardContent>
          </Card>
        ) : (
          gateways.map((gateway) => (
            <Card key={gateway.id} className={gateway.isActive ? "border-green-200" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail />
                    <span>{gateway.name}</span>
                    <Badge variant={gateway.provider === "sendgrid" ? "default" : "secondary"}>
                      {gateway.provider.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    {gateway.isActive && (
                      <Badge variant="default">Active</Badge>
                    )}
                    {gateway.testStatus && (
                      <Badge 
                        variant={gateway.testStatus === "success" ? "default" : "destructive"}
                      >
                        {gateway.testStatus === "success" ? <Check className="mr-1" /> : <X className="mr-1" />}
                        {gateway.testStatus}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                <CardDescription>
                  From: {gateway.config.from}
                  {gateway.lastTested && (
                    <span className="ml-2 text-xs">
                      Last tested: {new Date(gateway.lastTested).toLocaleDateString()}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTestGateway(gateway.id)}
                    disabled={testGatewayMutation.isPending || !testEmail}
                    data-testid={`button-test-${gateway.id}`}
                  >
                    {testGatewayMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2" />
                        Test Gateway
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid={`button-configure-${gateway.id}`}
                  >
                    <Settings className="mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Gateway Form */}
      {isAddingGateway && (
        <Card>
          <CardHeader>
            <CardTitle>Add Email Gateway</CardTitle>
            <CardDescription>
              Configure a new email gateway for sending notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createGatewayMutation.mutate(data))} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gateway Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SendGrid Production" {...field} data-testid="input-gateway-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-provider">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sendgrid">SendGrid</SelectItem>
                            <SelectItem value="smtp">SMTP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="config.from"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="noreply@yourdomain.com" {...field} data-testid="input-from-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("provider") === "sendgrid" ? (
                  <FormField
                    control={form.control}
                    name="config.apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SendGrid API Key</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="SG.xxx..." {...field} data-testid="input-sendgrid-key" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="config.host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} data-testid="input-smtp-host" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="587" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                data-testid="input-smtp-port"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="config.auth.user"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="your-username" {...field} data-testid="input-smtp-user" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="config.auth.pass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="your-password" {...field} data-testid="input-smtp-pass" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={createGatewayMutation.isPending}
                    data-testid="button-create-gateway"
                  >
                    {createGatewayMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Create Gateway"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddingGateway(false);
                      form.reset();
                    }}
                    data-testid="button-cancel-gateway"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}