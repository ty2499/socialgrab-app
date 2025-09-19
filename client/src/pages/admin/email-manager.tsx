import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// Removed useToast - using inline AJAX feedback instead
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Settings, FileText, Users, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailSendRequest {
  to: string;
  subject: string;
  templateType?: string;
  customMessage?: string;
  userName?: string;
}

export default function EmailManager() {
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("send");
  
  // Email sending form state
  const [emailForm, setEmailForm] = useState<EmailSendRequest>({
    to: "",
    subject: "",
    templateType: "notification",
    customMessage: "",
    userName: "User"
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    template: "",
    type: "notification"
  });

  // SMTP config form state
  const [smtpForm, setSmtpForm] = useState({
    host: "",
    port: "587",
    secure: "false",
    user: "",
    pass: ""
  });

  // Fetch email templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/admin/email-templates"],
  });

  // Fetch email configuration
  const { data: emailConfig } = useQuery({
    queryKey: ["/api/admin/email-config"],
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (data: EmailSendRequest) => apiRequest("/api/admin/send-email", "POST", data),
    onSuccess: () => {
      toast({
        title: "Email Sent Successfully",
        description: "Your email has been delivered successfully.",
      });
      setEmailForm({
        to: "",
        subject: "",
        templateType: "notification",
        customMessage: "",
        userName: "User"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Email Send Failed",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/email-templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      toast({
        title: "Template Saved",
        description: "Email template has been saved successfully.",
      });
      setTemplateForm({
        name: "",
        subject: "",
        template: "",
        type: "notification"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save template.",
        variant: "destructive",
      });
    },
  });

  // Save SMTP config mutation
  const saveSmtpMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/email-config", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-config"] });
      toast({
        title: "Configuration Saved",
        description: "SMTP configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to save SMTP configuration.",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => apiRequest("/api/admin/test-email", "POST", { testEmail: email }),
    onSuccess: () => {
      toast({
        title: "Test Email Sent",
        description: "Test email has been sent successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    if (!emailForm.to || !emailForm.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in recipient email and subject.",
        variant: "destructive",
      });
      return;
    }
    sendEmailMutation.mutate(emailForm);
  };

  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.template) {
      toast({
        title: "Missing Information",
        description: "Please fill in all template fields.",
        variant: "destructive",
      });
      return;
    }
    saveTemplateMutation.mutate(templateForm);
  };

  const handleSaveSmtp = () => {
    if (!smtpForm.host || !smtpForm.user || !smtpForm.pass) {
      toast({
        title: "Missing Information",
        description: "Please fill in all SMTP configuration fields.",
        variant: "destructive",
      });
      return;
    }
    
    saveSmtpMutation.mutate({
      name: "supabase-smtp",
      provider: "smtp",
      config: {
        host: smtpForm.host,
        port: parseInt(smtpForm.port),
        secure: smtpForm.secure === "true",
        auth: {
          user: smtpForm.user,
          pass: smtpForm.pass,
        }
      },
      isActive: true
    });
  };

  const handleTestEmail = () => {
    if (!emailForm.to) {
      toast({
        title: "Missing Email",
        description: "Please enter an email address to test.",
        variant: "destructive",
      });
      return;
    }
    testEmailMutation.mutate(emailForm.to);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Manager</h1>
          <p className="text-muted-foreground">
            Send emails and manage email templates for your application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            Email System
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Email
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Email
              </CardTitle>
              <CardDescription>
                Send emails to users using predefined templates or custom messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    placeholder="user@example.com"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    data-testid="input-recipient-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">User Name</Label>
                  <Input
                    id="userName"
                    placeholder="User's display name"
                    value={emailForm.userName}
                    onChange={(e) => setEmailForm({ ...emailForm, userName: e.target.value })}
                    data-testid="input-user-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  data-testid="input-email-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="templateType">Template Type</Label>
                <Select 
                  value={emailForm.templateType} 
                  onValueChange={(value) => setEmailForm({ ...emailForm, templateType: value })}
                >
                  <SelectTrigger data-testid="select-template-type">
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="password-reset">Password Reset</SelectItem>
                    <SelectItem value="verification">Email Verification</SelectItem>
                    <SelectItem value="notification">Custom Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage">Custom Message</Label>
                <Textarea
                  id="customMessage"
                  placeholder="Your custom message (optional for template emails)"
                  value={emailForm.customMessage}
                  onChange={(e) => setEmailForm({ ...emailForm, customMessage: e.target.value })}
                  rows={4}
                  data-testid="textarea-custom-message"
                />
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={sendEmailMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-send-email"
                >
                  {sendEmailMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send Email
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={testEmailMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-test-email"
                >
                  {testEmailMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Test Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Template</CardTitle>
                <CardDescription>
                  Create custom email templates for different use cases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    placeholder="e.g., Welcome Email"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    data-testid="input-template-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateSubject">Subject</Label>
                  <Input
                    id="templateSubject"
                    placeholder="Email subject line"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    data-testid="input-template-subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">Type</Label>
                  <Select 
                    value={templateForm.type} 
                    onValueChange={(value) => setTemplateForm({ ...templateForm, type: value })}
                  >
                    <SelectTrigger data-testid="select-template-type-new">
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome</SelectItem>
                      <SelectItem value="password-reset">Password Reset</SelectItem>
                      <SelectItem value="verification">Verification</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateContent">Template Content (HTML)</Label>
                  <Textarea
                    id="templateContent"
                    placeholder="Enter your HTML template content..."
                    value={templateForm.template}
                    onChange={(e) => setTemplateForm({ ...templateForm, template: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    data-testid="textarea-template-content"
                  />
                </div>

                <Button
                  onClick={handleSaveTemplate}
                  disabled={saveTemplateMutation.isPending}
                  className="w-full"
                  data-testid="button-save-template"
                >
                  {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Templates</CardTitle>
                <CardDescription>
                  Manage your email templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No email templates found</p>
                    <p className="text-sm">Create your first template to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                        data-testid={`template-item-${template.id}`}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">{template.subject}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.type}
                            </Badge>
                            {template.isActive ? (
                              <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure your email service settings for Supabase integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    data-testid="input-smtp-host"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                    data-testid="input-smtp-port"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">Username</Label>
                  <Input
                    id="smtpUser"
                    placeholder="your-email@domain.com"
                    value={smtpForm.user}
                    onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                    data-testid="input-smtp-user"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPass">Password</Label>
                  <Input
                    id="smtpPass"
                    type="password"
                    placeholder="your-app-password"
                    value={smtpForm.pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    data-testid="input-smtp-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpSecure">Security</Label>
                <Select 
                  value={smtpForm.secure} 
                  onValueChange={(value) => setSmtpForm({ ...smtpForm, secure: value })}
                >
                  <SelectTrigger data-testid="select-smtp-security">
                    <SelectValue placeholder="Select security option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">STARTTLS (Port 587)</SelectItem>
                    <SelectItem value="true">SSL/TLS (Port 465)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleSaveSmtp}
                  disabled={saveSmtpMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-save-smtp"
                >
                  {saveSmtpMutation.isPending ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}