import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="flex items-center space-x-2 text-primary hover:text-primary-dark transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Privacy Policy</h2>
          <p className="text-muted-foreground text-lg">
            Last updated: August 12, 2025
          </p>
          <p className="text-muted-foreground mt-2">
            This Privacy Policy describes how SocialGrab ("we", "our", or "us") collects, uses, and protects your information when you use our video downloading service.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="text-primary" size={24} />
                <span>Information We Collect</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <h4 className="font-semibold text-foreground mb-3">Information You Provide</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
                <li>Video URLs that you submit for downloading</li>
                <li>Contact information when you reach out to support</li>
                <li>Feedback and communications you send to us</li>
              </ul>

              <h4 className="font-semibold text-foreground mb-3">Information Automatically Collected</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Browser type and version</li>
                <li>Operating system information</li>
                <li>IP address and general location</li>
                <li>Pages visited and time spent on our service</li>
                <li>Download history during your session</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="text-primary" size={24} />
                <span>How We Use Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain our video downloading service</li>
                <li>To process and fulfill your download requests</li>
                <li>To improve our service quality and user experience</li>
                <li>To respond to your support requests and communications</li>
                <li>To detect and prevent abuse or misuse of our service</li>
                <li>To comply with legal obligations and enforce our terms</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="text-primary" size={24} />
                <span>Information Sharing and Disclosure</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">We Do Not Sell Your Information</h4>
                  <p>We do not sell, trade, or rent your personal information to third parties.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Limited Sharing</h4>
                  <p>We may share information only in these circumstances:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 ml-4">
                    <li>With your explicit consent</li>
                    <li>To comply with legal requirements or court orders</li>
                    <li>To protect our rights, property, or safety</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="text-primary" size={24} />
                <span>Data Security and Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Security Measures</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Encrypted data transmission using HTTPS</li>
                    <li>Secure server infrastructure and access controls</li>
                    <li>Regular security audits and updates</li>
                    <li>Limited employee access to personal information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Data Retention</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Download history is stored temporarily during your session</li>
                    <li>Downloaded files are automatically deleted after 24 hours</li>
                    <li>Support communications are retained for 2 years</li>
                    <li>Analytics data is aggregated and anonymized</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="text-primary" size={24} />
                <span>Your Rights and Choices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Access:</strong> Request information about data we have collected</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-out:</strong> Decline certain data collection practices</li>
                  <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                </ul>
                
                <p className="mt-4">
                  To exercise these rights, please contact us at{" "}
                  <a href="mailto:privacy@socialgrab.app" className="text-primary hover:underline">
                    privacy@socialgrab.app
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>Our service interacts with third-party platforms to download videos:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>We retrieve video information from Facebook, TikTok, and Pinterest</li>
                  <li>We do not store your login credentials for these platforms</li>
                  <li>We only access publicly available video content</li>
                  <li>Each platform has its own privacy policy and terms of service</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Maintain your session and download history</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze service usage and performance</li>
                  <li>Improve user experience and functionality</li>
                </ul>
                <p className="mt-3">
                  You can control cookie settings through your browser preferences. Disabling cookies may affect service functionality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the "Last updated" date</li>
                  <li>Sending notifications for significant changes</li>
                </ul>
                <p className="mt-3">
                  Your continued use of the service after changes take effect constitutes acceptance of the updated policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                <p className="mb-3">
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div className="space-y-1">
                  <p>Email: <a href="mailto:privacy@socialgrab.app" className="text-primary hover:underline">privacy@socialgrab.app</a></p>
                  <p>Support: <a href="mailto:support@socialgrab.app" className="text-primary hover:underline">support@socialgrab.app</a></p>
                </div>
                <p className="mt-4 text-sm">
                  PA Creatives - Digital Solutions & Creative Services
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}