import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Crown, Check, CreditCard, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SEOHead from "@/components/seo-head";
import { useCurrency } from "@/hooks/useCurrency";
import { useState } from "react";

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
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { formatPrice, convertPrice, selectedCurrency } = useCurrency();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Get plan ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  const currency = urlParams.get('currency') || selectedCurrency;

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: ''
  });

  const { data: plans } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    retry: 1
  });

  const selectedPlan = plans?.find(plan => plan.id === planId);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }
    
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubscribe = async () => {
    setFormError(null);
    
    if (!selectedPlan) {
      setFormError("Please select a valid plan");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Subscription created successfully:', data);
        console.log('Data structure:', {
          hasSubscriptionId: !!data.subscriptionId,
          hasClientSecret: !!data.clientSecret,
          status: data.status,
          keys: Object.keys(data)
        });
        
        if (selectedPlan.interval === 'lifetime') {
          // For lifetime plans, redirect to one-time payment
          const paymentResponse = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: convertPrice(selectedPlan.price) / 100, // Convert to dollars
              currency: currency.toLowerCase(),
              planId: selectedPlan.id,
              email: formData.email,
              name: `${formData.firstName} ${formData.lastName}`
            }),
          });

          const paymentData = await paymentResponse.json();
          
          if (paymentResponse.ok) {
            // Store payment intent info and redirect to payment page
            sessionStorage.setItem('payment_intent', JSON.stringify(paymentData));
            sessionStorage.setItem('user_info', JSON.stringify(formData));
            sessionStorage.setItem('plan_info', JSON.stringify(selectedPlan));
            setLocation('/payment');
          } else {
            throw new Error(paymentData.message);
          }
        } else {
          // For recurring subscriptions, use Stripe subscription flow
          if (data.subscriptionId && data.clientSecret) {
            // Store subscription info and redirect to payment page
            sessionStorage.setItem('subscription_info', JSON.stringify(data));
            sessionStorage.setItem('user_info', JSON.stringify(formData));
            sessionStorage.setItem('plan_info', JSON.stringify(selectedPlan));
            
            // Subscription created successfully, redirect to payment
            
            // Redirect with URL parameters as backup
            const params = new URLSearchParams({
              subscriptionId: data.subscriptionId,
              clientSecret: data.clientSecret,
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              planPrice: selectedPlan.price.toString(),
              planCurrency: selectedPlan.currency,
              email: formData.email,
              firstName: formData.firstName,
              lastName: formData.lastName
            });
            
            setLocation(`/payment?${params.toString()}`);
          } else {
            console.error('Missing subscription data:', data);
            throw new Error('Subscription created but missing required data');
          }
        }
      } else {
        throw new Error(data.message || 'Failed to process subscription');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setFormError(error.message || "There was an error processing your subscription. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">Plan not found or invalid</p>
            <Button onClick={() => setLocation('/subscription')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const discountPercentage = selectedPlan.interval === 'year' 
    ? Math.round((1 - (selectedPlan.price / 12) / 999) * 100)
    : 0;

  return (
    <>
      <SEOHead
        title={`Checkout - ${selectedPlan.name} | SocialGrab`}
        description={`Complete your ${selectedPlan.name} subscription and unlock premium features`}
        url="/checkout"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Button 
              onClick={() => setLocation('/subscription')} 
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Complete Your Order</h1>
            <p className="text-gray-600 mt-2">You're just one step away from premium access</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                    </div>
                    <Badge 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    >
                      {selectedPlan.maxVideoQuality.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Total</span>
                      <div className="text-right">
                        <div>{formatPrice(convertPrice(selectedPlan.price))}</div>
                        <div className="text-sm font-normal text-gray-600">
                          {selectedPlan.interval === 'lifetime' ? 'One-time payment' : `per ${selectedPlan.interval}`}
                        </div>
                        {discountPercentage > 0 && (
                          <div className="text-sm text-green-600">
                            Save {discountPercentage}% vs monthly
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        Up to {selectedPlan.maxVideoQuality.toUpperCase()} quality downloads
                      </li>
                      {selectedPlan.removeAds && (
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

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                {formError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        handleInputChange('email', e.target.value);
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="your@email.com"
                      required
                      data-testid="input-email"
                      className={validationErrors.email ? 'border-red-500' : ''}
                    />
                    {validationErrors.email ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        You'll receive your account details at this email
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => {
                          handleInputChange('firstName', e.target.value);
                          if (validationErrors.firstName) {
                            setValidationErrors(prev => ({ ...prev, firstName: '' }));
                          }
                        }}
                        placeholder="John"
                        required
                        data-testid="input-firstName"
                        className={validationErrors.firstName ? 'border-red-500' : ''}
                      />
                      {validationErrors.firstName && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => {
                          handleInputChange('lastName', e.target.value);
                          if (validationErrors.lastName) {
                            setValidationErrors(prev => ({ ...prev, lastName: '' }));
                          }
                        }}
                        placeholder="Doe"
                        required
                        data-testid="input-lastName"
                        className={validationErrors.lastName ? 'border-red-500' : ''}
                      />
                      {validationErrors.lastName && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6 bg-pink-600 hover:bg-pink-700 text-white border-none" 
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    data-testid="button-subscribe"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Continue to Payment"
                    )}
                  </Button>

                  <div className="text-xs text-gray-500 text-center mt-4">
                    <p>🔒 Secure payment powered by Stripe</p>
                    <p className="mt-1">
                      {selectedPlan.interval === 'lifetime' 
                        ? 'One-time payment - no recurring charges'
                        : 'You can cancel anytime from your account settings'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}