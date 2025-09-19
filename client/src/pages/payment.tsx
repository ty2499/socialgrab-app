import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Check, Shield, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEOHead from "@/components/seo-head";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  clientSecret: string;
  planInfo: any;
  userInfo: any;
  subscriptionInfo?: any;
  paymentIntent?: any;
}

function PaymentForm({ clientSecret, planInfo, userInfo, subscriptionInfo, paymentIntent }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        setPaymentError(error.message || "There was an error processing your payment.");
      } else {
        setPaymentSuccess(true);
        // Short delay to show success, then redirect
        setTimeout(() => {
          setLocation('/payment-success');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Payment submission error:', err);
      setPaymentError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-700">Payment Successful!</h3>
          <p className="text-green-600">
            {planInfo.interval === 'lifetime' ? "Thank you for your purchase!" : "You are now subscribed!"}
          </p>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-600">Redirecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}
      
      <div className="p-4 border rounded-lg bg-gray-50">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full h-12 text-lg" 
        disabled={!stripe || !elements || isProcessing}
        data-testid="button-submit-payment"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            {planInfo.interval === 'lifetime' 
              ? `Pay ${planInfo.formattedPrice} Once` 
              : `Subscribe for ${planInfo.formattedPrice}/${planInfo.interval}`
            }
          </>
        )}
      </Button>
      
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Secure payment powered by Stripe</span>
      </div>
    </form>
  );
}

export default function Payment() {
  const [, setLocation] = useLocation();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    // First try to get data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSubscriptionId = urlParams.get('subscriptionId');
    const urlClientSecret = urlParams.get('clientSecret');
    const urlPlanId = urlParams.get('planId');
    
    console.log('URL parameters:', {
      subscriptionId: urlSubscriptionId,
      clientSecret: !!urlClientSecret,
      planId: urlPlanId
    });

    // If URL has the data, use it
    if (urlSubscriptionId && urlClientSecret && urlPlanId) {
      const urlPlanInfo = {
        id: urlPlanId,
        name: urlParams.get('planName') || 'Premium Plan',
        price: parseInt(urlParams.get('planPrice') || '999'),
        currency: urlParams.get('planCurrency') || 'usd',
        interval: 'month',
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: (urlParams.get('planCurrency') || 'usd').toUpperCase()
        }).format(parseInt(urlParams.get('planPrice') || '999') / 100)
      };

      const urlUserInfo = {
        email: urlParams.get('email') || '',
        firstName: urlParams.get('firstName') || '',
        lastName: urlParams.get('lastName') || ''
      };

      const urlSubscriptionInfo = {
        subscriptionId: urlSubscriptionId,
        clientSecret: urlClientSecret
      };

      setPaymentData({
        clientSecret: urlClientSecret,
        userInfo: urlUserInfo,
        planInfo: urlPlanInfo,
        subscriptionInfo: urlSubscriptionInfo,
        paymentIntent: null
      });
      setLoading(false);
      return;
    }

    // Fallback to session storage
    const subscriptionInfo = sessionStorage.getItem('subscription_info');
    const paymentIntent = sessionStorage.getItem('payment_intent');
    const userInfo = sessionStorage.getItem('user_info');
    const planInfo = sessionStorage.getItem('plan_info');

    console.log('Session data check:', {
      hasSubscriptionInfo: !!subscriptionInfo,
      hasPaymentIntent: !!paymentIntent,
      hasUserInfo: !!userInfo,
      hasPlanInfo: !!planInfo
    });

    if (!userInfo || !planInfo) {
      setLoadingError("Session expired. Please start the checkout process again.");
      setTimeout(() => {
        setLocation('/subscription');
      }, 2000);
      return;
    }

    const parsedUserInfo = JSON.parse(userInfo);
    const parsedPlanInfo = JSON.parse(planInfo);

    let clientSecret = '';
    let parsedSubscriptionInfo = null;
    let parsedPaymentIntent = null;

    if (subscriptionInfo) {
      parsedSubscriptionInfo = JSON.parse(subscriptionInfo);
      console.log('Subscription info:', parsedSubscriptionInfo);
      clientSecret = parsedSubscriptionInfo.clientSecret;
    } else if (paymentIntent) {
      parsedPaymentIntent = JSON.parse(paymentIntent);
      console.log('Payment intent info:', parsedPaymentIntent);
      clientSecret = parsedPaymentIntent.clientSecret;
    }

    console.log('Client secret found:', !!clientSecret);

    if (!clientSecret) {
      setLoadingError("Unable to initialize payment. Please try again.");
      setTimeout(() => {
        setLocation('/checkout');
      }, 1500);
      return;
    }

    // Add formatted price to plan info
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: parsedPlanInfo.currency?.toUpperCase() || 'USD'
    }).format(parsedPlanInfo.price / 100);

    setPaymentData({
      clientSecret,
      userInfo: parsedUserInfo,
      planInfo: { ...parsedPlanInfo, formattedPrice },
      subscriptionInfo: parsedSubscriptionInfo,
      paymentIntent: parsedPaymentIntent
    });
    setLoading(false);
  }, [setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Setting up payment...</p>
          {loadingError && (
            <Alert variant="destructive" className="mt-4 max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loadingError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Unable to load payment information</p>
            <Button onClick={() => setLocation('/subscription')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { planInfo, userInfo } = paymentData;

  return (
    <>
      <SEOHead
        title={`Complete Payment - ${planInfo.name} | SocialGrab`}
        description={`Complete your ${planInfo.name} subscription payment`}
        url="/payment"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Button 
              onClick={() => setLocation('/checkout')} 
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checkout
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Payment</h1>
            <p className="text-gray-600 mt-2">Enter your payment details to activate your subscription</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{planInfo.name}</h3>
                      <p className="text-sm text-gray-600">{planInfo.description}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      {planInfo.maxVideoQuality?.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <div className="text-right">
                        <div>{planInfo.formattedPrice}</div>
                        <div className="text-sm font-normal text-gray-600">
                          {planInfo.interval === 'lifetime' ? 'One-time payment' : `per ${planInfo.interval}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Customer:</h4>
                    <p className="text-sm text-gray-600">{userInfo.firstName} {userInfo.lastName}</p>
                    <p className="text-sm text-gray-600">{userInfo.email}</p>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="space-y-2">
                      {planInfo.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        Up to {planInfo.maxVideoQuality?.toUpperCase()} quality downloads
                      </li>
                      {planInfo.removeAds && (
                        <li className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          Remove all advertisements
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements 
                  stripe={stripePromise} 
                  options={{ 
                    clientSecret: paymentData.clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#7c3aed',
                      }
                    }
                  }}
                >
                  <PaymentForm 
                    clientSecret={paymentData.clientSecret}
                    planInfo={planInfo}
                    userInfo={userInfo}
                    subscriptionInfo={paymentData.subscriptionInfo}
                    paymentIntent={paymentData.paymentIntent}
                  />
                </Elements>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}