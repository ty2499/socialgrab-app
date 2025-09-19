import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Crown, X, Zap, Loader2, ArrowLeft, CreditCard, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCurrency } from "@/hooks/useCurrency";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";

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

// Load Stripe early to avoid delays
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface SubscriptionModalProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  highlightFeature?: string;
}

type FlowStep = 'plans' | 'checkout' | 'payment';

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
}

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  userInfo: FormData;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}

function PaymentForm({ selectedPlan, userInfo, clientSecret, onSuccess, onError, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message || "There was an error processing your payment.");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Payment submission error:', err);
      onError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-right">
          <div className="font-semibold">
            {selectedPlan.name} - {selectedPlan.price / 100} {selectedPlan.currency.toUpperCase()}
            /{selectedPlan.interval === 'lifetime' ? 'lifetime' : selectedPlan.interval}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
        
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="w-full bg-pink-600 hover:bg-pink-700 text-white"
          data-testid="button-confirm-payment"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Complete Payment
            </div>
          )}
        </Button>
      </form>

      <div className="text-xs text-gray-500 text-center">
        <p>🔒 Secure payment powered by Stripe</p>
        <p className="mt-1">
          {selectedPlan.interval === 'lifetime' 
            ? 'One-time payment - no recurring charges'
            : 'You can cancel anytime'
          }
        </p>
      </div>
    </div>
  );
}

export default function SubscriptionModal({ 
  children, 
  title = "Upgrade to Premium", 
  description = "Unlock premium features and remove all ads",
  highlightFeature 
}: SubscriptionModalProps) {
  const { formatPrice, convertPrice, selectedCurrency } = useCurrency();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<FlowStep>('plans');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: ''
  });
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [formError, setFormError] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/subscription-plans'],
    retry: 1
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: { planId: string; email: string; name: string }) => {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscription');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setCurrentStep('payment');
      } else {
        throw new Error('Missing payment details');
      }
    },
    onError: (error: any) => {
      console.error('Subscription creation error:', error);
      setFormError(error.message || 'Failed to create subscription');
    }
  });

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('checkout');
    setFormError(null);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckoutSubmit = () => {
    if (!selectedPlan || !validateForm()) return;

    createSubscriptionMutation.mutate({
      planId: selectedPlan.id,
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`
    });
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful!",
      description: `Your ${selectedPlan?.name} subscription is now active.`,
    });
    setIsOpen(false);
    // Reset state
    setCurrentStep('plans');
    setSelectedPlan(null);
    setClientSecret('');
    setFormData({ email: '', firstName: '', lastName: '' });
    
    // Optionally redirect to success page or refresh data
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    setFormError(error);
    // Stay on payment step to allow retry
  };

  const resetToPlans = () => {
    setCurrentStep('plans');
    setSelectedPlan(null);
    setClientSecret('');
    setFormError(null);
    setValidationErrors({});
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality) {
      case "4k": return "bg-gradient-to-r from-purple-500 to-pink-500 text-white";
      case "2k": return "bg-gradient-to-r from-blue-500 to-purple-500 text-white";
      case "high": return "bg-gradient-to-r from-green-500 to-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const renderContent = () => {
    if (plansLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (currentStep === 'plans' && plans && plans.length > 0) {
      return (
        <>
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
              <Crown className="h-6 w-6 text-amber-500" />
              {title}
            </DialogTitle>
            <p className="text-gray-600 mt-2">{description}</p>
            {highlightFeature && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  🔒 {highlightFeature} requires a premium subscription
                </p>
              </div>
            )}
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`relative border-2 rounded-xl p-6 ${
                  plan.name.toLowerCase().includes('yearly') 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200'
                }`}
              >
                {plan.name.toLowerCase().includes('yearly') && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">
                    {formatPrice(convertPrice(plan.price))}
                    <span className="text-lg font-normal text-gray-600">
                      /{plan.interval === 'lifetime' ? 'lifetime' : plan.interval}
                    </span>
                  </div>
                  
                  <Badge 
                    className={`px-3 py-1 ${getQualityBadgeColor(plan.maxVideoQuality)}`}
                  >
                    Max: {plan.maxVideoQuality.toUpperCase()}
                  </Badge>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className={highlightFeature && feature.toLowerCase().includes(highlightFeature.toLowerCase()) ? 'font-semibold text-primary' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white border-none"
                  data-testid={`button-choose-plan-${plan.id}`}
                >
                  Choose Plan
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secure payment powered by Stripe • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </>
      );
    }

    if (currentStep === 'checkout' && selectedPlan) {
      return (
        <>
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={resetToPlans} size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plans
              </Button>
              <DialogTitle className="text-xl font-bold">Complete Your Order</DialogTitle>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{selectedPlan.name}</h4>
                    <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    {selectedPlan.maxVideoQuality.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(convertPrice(selectedPlan.price))}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedPlan.interval === 'lifetime' ? 'One-time payment' : `per ${selectedPlan.interval}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              
              {formError && (
                <Alert variant="destructive">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className={validationErrors.email ? 'border-red-500' : ''}
                    data-testid="input-email"
                  />
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                      className={validationErrors.firstName ? 'border-red-500' : ''}
                      data-testid="input-firstName"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                      className={validationErrors.lastName ? 'border-red-500' : ''}
                      data-testid="input-lastName"
                    />
                    {validationErrors.lastName && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleCheckoutSubmit}
                  disabled={createSubscriptionMutation.isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                  data-testid="button-continue-payment"
                >
                  {createSubscriptionMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up payment...
                    </div>
                  ) : (
                    "Continue to Payment"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (currentStep === 'payment' && selectedPlan && clientSecret) {
      return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-center">Complete Payment</DialogTitle>
          </DialogHeader>
          
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <PaymentForm
            selectedPlan={selectedPlan}
            userInfo={formData}
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onBack={() => setCurrentStep('checkout')}
          />
        </Elements>
      );
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}