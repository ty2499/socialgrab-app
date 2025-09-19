import { ArrowLeft, Download, AlertCircle, CheckCircle, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpCenter() {
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
            <h1 className="text-2xl font-bold text-foreground">Help Center</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">How can we help you?</h2>
          <p className="text-muted-foreground text-lg">Find answers to common questions and learn how to use SocialGrab effectively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center p-6">
            <Download className="mx-auto mb-4 text-primary" size={48} />
            <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
            <p className="text-muted-foreground">Learn the basics of downloading videos</p>
          </Card>
          <Card className="text-center p-6">
            <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="font-semibold text-lg mb-2">Supported Platforms</h3>
            <p className="text-muted-foreground">See which platforms we support</p>
          </Card>
          <Card className="text-center p-6">
            <AlertCircle className="mx-auto mb-4 text-orange-600" size={48} />
            <h3 className="font-semibold text-lg mb-2">Troubleshooting</h3>
            <p className="text-muted-foreground">Fix common download issues</p>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="text-primary" size={24} />
              <span>Frequently Asked Questions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I download a video?</AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Copy the video URL from Facebook, TikTok, or Pinterest</li>
                    <li>Paste the URL into the input field on our homepage</li>
                    <li>Wait for the video preview to load</li>
                    <li>Select your preferred quality (High, Medium, or Low)</li>
                    <li>Click the "Download Video" button</li>
                    <li>Wait for the download to complete and click the download button in your history</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Which platforms are supported?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-muted-foreground">
                    <p>SocialGrab currently supports:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><strong>Facebook:</strong> Public videos and posts</li>
                      <li><strong>TikTok:</strong> All public videos</li>
                      <li><strong>Pinterest:</strong> Video pins</li>
                    </ul>
                    <p className="text-sm">Note: Private or restricted content cannot be downloaded due to platform policies.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>What video qualities are available?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-muted-foreground">
                    <ul className="space-y-2">
                      <li><strong>High Quality (1080p):</strong> Best video quality, larger file size</li>
                      <li><strong>Medium Quality (720p):</strong> Good balance of quality and file size</li>
                      <li><strong>Low Quality (480p):</strong> Smaller file size, faster download</li>
                    </ul>
                    <p className="text-sm mt-3">The available qualities depend on the original video uploaded by the creator.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>Why is my download failing?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Common reasons for download failures:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>The video is private or restricted</li>
                      <li>The video has been deleted by the creator</li>
                      <li>The URL is incorrect or expired</li>
                      <li>The platform has changed their video delivery system</li>
                      <li>Network connection issues</li>
                    </ul>
                    <p className="mt-3"><strong>Solution:</strong> Try refreshing the page and using a fresh URL from the platform.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Is it legal to download videos?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-muted-foreground">
                    <p>Downloading videos for personal use is generally acceptable, but:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Always respect the original creator's rights</li>
                      <li>Do not redistribute downloaded content without permission</li>
                      <li>Do not use downloaded content for commercial purposes</li>
                      <li>Follow the terms of service of the original platform</li>
                    </ul>
                    <p className="mt-3 text-sm">
                      <strong>Disclaimer:</strong> Users are responsible for complying with applicable laws and platform terms of service.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>How long are download links valid?</AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground">
                    <p>Download links in your recent downloads history remain active for your current session. For permanent storage, we recommend downloading the video file to your device immediately after processing.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Can I download multiple videos at once?</AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground">
                    <p>Currently, SocialGrab processes one video at a time to ensure optimal quality and speed. You can queue multiple downloads by submitting them one after another.</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Still need help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Get in touch with our support team.
            </p>
            <Link href="/contact">
              <button className="bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-2 px-6 rounded-lg transition-colors">
                Contact Support
              </button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}