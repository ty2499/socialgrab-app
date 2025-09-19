import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";
import SEOHead from "@/components/seo-head";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear session storage since payment is complete
    sessionStorage.removeItem('subscription_info');
    sessionStorage.removeItem('payment_intent');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('plan_info');
  }, []);

  return (
    <>
      <SEOHead
        title="Payment Successful | SocialGrab"
        description="Your subscription payment was processed successfully"
        url="/payment-success"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-gray-600">
                Thank you for your subscription! Your premium features are now active.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  🎉 You now have access to:
                </p>
                <ul className="text-sm text-green-700 mt-2 space-y-1">
                  <li>• Unlimited downloads</li>
                  <li>• High quality video downloads</li>
                  <li>• Ad-free experience</li>
                  <li>• Premium support</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setLocation('/')} 
                className="w-full"
                data-testid="button-start-downloading"
              >
                <Download className="h-4 w-4 mr-2" />
                Start Downloading Videos
              </Button>
              
              <Button 
                onClick={() => setLocation('/subscription')} 
                variant="outline"
                className="w-full"
                data-testid="button-view-plans"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                View All Plans
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              A confirmation email has been sent to your email address.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}