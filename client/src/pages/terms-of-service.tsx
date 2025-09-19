import { ArrowLeft, FileText, AlertTriangle, Scale, Users, Gavel } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TermsOfService() {
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
            <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h2>
          <p className="text-muted-foreground text-lg">
            Last updated: August 12, 2025
          </p>
          <p className="text-muted-foreground mt-2">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the SocialGrab video downloading service operated by PA Creatives.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the service.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="text-primary" size={24} />
                <span>Acceptance of Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  By accessing and using SocialGrab, you accept and agree to be bound by the terms and provision of this agreement. Additionally, when using SocialGrab's services, you shall be subject to any posted guidelines or rules applicable to such services.
                </p>
                <p>
                  These Terms constitute the entire agreement between you and PA Creatives regarding your use of the service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="text-primary" size={24} />
                <span>Description of Service</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  SocialGrab is a web-based service that allows users to download publicly available videos from supported social media platforms including Facebook, TikTok, and Pinterest.
                </p>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Features:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Video URL processing and information extraction</li>
                    <li>Multiple quality download options</li>
                    <li>Download progress tracking</li>
                    <li>Recent downloads history</li>
                    <li>Cross-platform compatibility</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="text-primary" size={24} />
                <span>Acceptable Use Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Permitted Uses:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Downloading videos for personal, non-commercial use</li>
                    <li>Backing up your own content from social platforms</li>
                    <li>Educational or research purposes (with proper attribution)</li>
                    <li>Accessing publicly available content you have permission to download</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Prohibited Uses:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Downloading private, restricted, or copyrighted content without permission</li>
                    <li>Commercial redistribution of downloaded content</li>
                    <li>Violating the terms of service of source platforms (Facebook, TikTok, Pinterest)</li>
                    <li>Using the service to harm, harass, or violate the rights of others</li>
                    <li>Attempting to circumvent technical restrictions or security measures</li>
                    <li>Using automated scripts or bots to abuse the service</li>
                    <li>Downloading content for illegal purposes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gavel className="text-primary" size={24} />
                <span>Copyright and Intellectual Property</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">User Responsibility:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>You are solely responsible for ensuring you have the right to download any content</li>
                    <li>You must respect the intellectual property rights of content creators</li>
                    <li>You agree not to infringe on copyrights, trademarks, or other proprietary rights</li>
                    <li>You will comply with all applicable copyright laws and regulations</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">DMCA Compliance:</h4>
                  <p>
                    We respect intellectual property rights and will respond to valid DMCA takedown requests. If you believe your content has been used inappropriately, please contact us with proper documentation.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Intellectual Property:</h4>
                  <p>
                    The SocialGrab service, including its design, functionality, and code, is owned by PA Creatives and protected by intellectual property laws.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts and Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  While SocialGrab does not require user registration, users are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Providing accurate information when contacting support</li>
                  <li>Maintaining the security of their download sessions</li>
                  <li>Notifying us of any security vulnerabilities or unauthorized access</li>
                  <li>Using the service in compliance with all applicable laws</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Availability and Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Availability:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                    <li>Scheduled maintenance will be announced when possible</li>
                    <li>Third-party platform changes may affect service functionality</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Modifications:</h4>
                  <p>
                    We reserve the right to modify, suspend, or discontinue any aspect of the service at any time. We will provide reasonable notice for significant changes when possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitations of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Service Disclaimer:</h4>
                  <p>
                    SocialGrab is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or usefulness of any information on the service.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Limitation of Liability:</h4>
                  <p>
                    To the fullest extent permitted by law, PA Creatives shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Third-Party Platforms:</h4>
                  <p>
                    We are not responsible for the availability, content, or policies of third-party platforms (Facebook, TikTok, Pinterest). Your use of those platforms is subject to their respective terms of service.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">
                <p>
                  Your privacy is important to us. Our collection and use of personal information is governed by our{" "}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, 
                  which is incorporated into these Terms by reference.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We may terminate or suspend your access to the service immediately, without prior notice, for any reason, including violation of these Terms.
                </p>
                <p>
                  You may discontinue use of the service at any time. Upon termination, your right to use the service will cease immediately.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of the service should first be addressed through our support channels. We encourage good faith efforts to resolve disputes amicably.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to this page with an updated revision date.
                </p>
                <p>
                  Your continued use of the service after changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the service.
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
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-1">
                  <p>Email: <a href="mailto:legal@socialgrab.app" className="text-primary hover:underline">legal@socialgrab.app</a></p>
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