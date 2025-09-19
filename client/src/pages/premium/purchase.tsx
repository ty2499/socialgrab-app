import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseFormSchema, type PurchaseFormData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, CreditCard } from "lucide-react";
import { Link } from "wouter";

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
}

export default function PurchasePage() {
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const { toast } = useToast();
  
  // Fetch subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });
  
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      country: "",
      planId: "",
      paymentMethodId: "",
    },
  });
  
  const purchaseMutation = useMutation({
    mutationFn: async (data: PurchaseFormData) => {
      const response = await apiRequest("POST", "/api/premium/purchase", data);
      return response.json();
    },
    onSuccess: (response) => {
      setPurchaseSuccess(true);
      toast({
        title: "Purchase Successful!",
        description: "Your premium account has been created. Check your email for login details and verification instructions.",
        duration: 10000,
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });
  
  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600 text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Welcome to Premium!</CardTitle>
            <CardDescription>
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your email for login credentials</li>
                <li>• Verify your email with the OTP code</li>
                <li>• Start enjoying premium features!</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full" data-testid="button-go-home">
                <Link href="/">Go to Home</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" data-testid="button-verify-email">
                <Link href="/premium/verify">Verify Email</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Upgrade to Premium</h1>
          <p className="text-lg text-muted-foreground">
            Enjoy ad-free experience and premium features
          </p>
        </div>
        
        {plansLoading ? (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-2xl" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Subscription Plans */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Choose Your Plan</h2>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      form.watch("planId") === plan.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => form.setValue("planId", plan.id)}
                    data-testid={`plan-card-${plan.id}`}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        {plan.name}
                        <span className="text-2xl font-bold">
                          ${plan.price / 100}/{plan.interval}
                        </span>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features?.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center space-x-2">
                            <Check className="text-green-500 text-sm" />
                            <span>{feature}</span>
                          </li>
                        )) || []}
                        <li className="flex items-center space-x-2">
                          <Check className="text-green-500 text-sm" />
                          <span>{plan.maxVideoQuality} quality downloads</span>
                        </li>
                        {plan.removeAds && (
                          <li className="flex items-center space-x-2">
                            <Check className="text-green-500 text-sm" />
                            <span>Ad-free experience</span>
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Purchase Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard />
                    <span>Account & Payment Details</span>
                  </CardTitle>
                  <CardDescription>
                    Your account will be created automatically after purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => purchaseMutation.mutate(data))} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-firstName" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-lastName" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-phoneNumber" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-country" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethodId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-paymentMethod">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="stripe">Stripe</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">Account Creation</h4>
                        <p className="text-sm text-yellow-700">
                          After successful payment, we'll automatically create your premium account and send login details to your email.
                        </p>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={purchaseMutation.isPending || !form.watch("planId")}
                        data-testid="button-purchase"
                      >
                        {purchaseMutation.isPending ? (
                          <>
                            <Loader2 className="animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          "Complete Purchase"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}