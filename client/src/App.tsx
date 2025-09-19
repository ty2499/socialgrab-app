import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsLoader } from "@/components/analytics-loader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import HelpCenter from "@/pages/help-center";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSettings from "@/pages/admin/settings";
import AdminEmailManager from "@/pages/admin/email-manager";
import AdminLogin from "@/pages/admin/login";
import Subscription from "@/pages/subscription";
import Checkout from "@/pages/checkout";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import PremiumPurchase from "@/pages/premium/purchase";
import PremiumVerify from "@/pages/premium/verify";
import analytics from "@/utils/analytics";
import { useEffect, useRef } from "react";

function Router() {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  // Track page views when routes change
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      analytics.trackPageView(document.title, window.location.href);
      prevLocationRef.current = location;
    }
  }, [location]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/premium/purchase" component={PremiumPurchase} />
      <Route path="/premium/verify" component={PremiumVerify} />
      <Route path="/admin" component={() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/settings" component={() => <ProtectedRoute><AdminSettings /></ProtectedRoute>} />
      <Route path="/admin/email-manager" component={() => <ProtectedRoute><AdminEmailManager /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    analytics.init().catch(error => {
      console.warn('Analytics initialization failed:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnalyticsLoader />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
