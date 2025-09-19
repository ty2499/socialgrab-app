import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpVerificationSchema, type OtpVerificationData } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// Removed useToast - using inline AJAX feedback instead
import { Loader2, Check, Mail, RefreshCw } from "lucide-react";
import { Link } from "wouter";

export default function VerifyEmailPage() {
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error' | null, message: string}>({type: null, message: ""});
  
  const form = useForm<OtpVerificationData>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      email: "",
      otpCode: "",
      purpose: "email_verification",
    },
  });
  
  const verifyMutation = useMutation({
    mutationFn: async (data: OtpVerificationData) => {
      const response = await apiRequest('POST', '/api/premium/verify-otp', data);
      return await response.json();
    },
    onSuccess: () => {
      setVerificationSuccess(true);
      setStatusMessage({type: 'success', message: "Your email has been successfully verified. You can now log in to your premium account."});
      form.reset();
    },
    onError: (error: any) => {
      setStatusMessage({type: 'error', message: error.message || "Please check your OTP code and try again."});
    },
  });
  
  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest('POST', '/api/premium/resend-otp', { email });
      return await response.json();
    },
    onSuccess: () => {
      setStatusMessage({type: 'success', message: "A new verification code has been sent to your email."});
    },
    onError: (error: any) => {
      setStatusMessage({type: 'error', message: error.message || "Please try again later."});
    },
  });
  
  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600 text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Email Verified!</CardTitle>
            <CardDescription>
              Your premium account is now fully activated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Account Activated</h4>
              <p className="text-sm text-green-800">
                Your email has been verified and you can now enjoy all premium features including ad-free experience and high-quality downloads.
              </p>
            </div>
            
            <div className="space-y-2">
              <Button asChild className="w-full" data-testid="button-go-home">
                <Link href="/">Start Using Premium</Link>
              </Button>
              <Button asChild variant="outline" className="w-full" data-testid="button-premium-login">
                <Link href="/premium/login">Premium Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="text-blue-600 text-2xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Verify Your Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => verifyMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="your-email@example.com"
                        {...field} 
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="otpCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-2xl font-mono tracking-widest"
                        {...field}
                        data-testid="input-otpCode"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={verifyMutation.isPending}
                data-testid="button-verify"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resendMutation.isPending || !form.watch("email")}
                  onClick={() => {
                    const email = form.getValues("email");
                    if (email) resendMutation.mutate(email);
                  }}
                  data-testid="button-resend"
                >
                  {resendMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2" />
                      Resend Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <Button asChild variant="ghost" size="sm" data-testid="button-back-home">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}