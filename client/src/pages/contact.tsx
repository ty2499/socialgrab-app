import { ArrowLeft, Mail, MessageSquare, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiFacebook, SiX, SiInstagram } from "react-icons/si";

export default function Contact() {
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
            <h1 className="text-2xl font-bold text-foreground">Contact Us</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get in Touch</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about SocialGrab? Need technical support? We're here to help you with any issues or feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="text-primary" size={24} />
                  <span>Email Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  For technical support and general inquiries
                </p>
                <a 
                  href="mailto:support@socialgrab.app" 
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  support@socialgrab.app
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="text-primary" size={24} />
                  <span>Response Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We typically respond within 24-48 hours during business days.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="text-primary" size={24} />
                  <span>Follow Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Stay connected for updates and announcements
                </p>
                <div className="flex space-x-4">
                  <a 
                    href="https://www.facebook.com/profile.php?id=100086228821563&mibextid=wwXIfr&mibextid=wwXIfr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <SiFacebook size={24} />
                  </a>
                  <a 
                    href="https://x.com/pacreatives?s=21" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <SiX size={24} />
                  </a>
                  <a 
                    href="https://www.instagram.com/its_pa_creatives?igsh=eTZoM24xNXk0Y3Mx&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <SiInstagram size={24} />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="Your first name" className="mt-1" data-testid="input-firstName" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Your last name" className="mt-1" data-testid="input-lastName" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" className="mt-1" data-testid="input-email" />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger className="mt-1" data-testid="select-subject">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="business">Business/Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Please describe your issue or inquiry in detail..."
                      className="mt-1 min-h-[120px]"
                      data-testid="textarea-message"
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Before contacting support:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Check our <Link href="/help" className="text-primary hover:underline">Help Center</Link> for common solutions</li>
                      <li>• Make sure you're using a valid, public video URL</li>
                      <li>• Try refreshing the page and attempting your download again</li>
                    </ul>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3"
                    data-testid="button-submit"
                  >
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block p-6">
            <div className="flex items-center space-x-3">
              <MapPin className="text-primary" size={24} />
              <div className="text-left">
                <h3 className="font-semibold text-foreground">PA Creatives</h3>
                <p className="text-muted-foreground">Digital Solutions & Creative Services</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}