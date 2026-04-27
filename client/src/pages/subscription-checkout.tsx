import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '@/components/stripe-payment-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

type TierKey = "starter" | "pro" | "elite";

const TIER_DISPLAY: Record<TierKey, {
  name: string;
  price: number;
  description: string;
  popular: boolean;
  features: string[];
}> = {
  starter: {
    name: "Starter",
    price: 29,
    description: "Essential credit repair tools",
    popular: false,
    features: [
      "Dashboard access",
      "Credit overview & score tracker",
      "3 dispute letters / month",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    description: "Unlimited disputes, alerts, and premium tools",
    popular: true,
    features: [
      "Everything in Starter",
      "Unlimited dispute letters",
      "Credit Alerts (real-time)",
      "Automated Lob.com certified mail",
      "Score Simulator",
      "Debt Analysis & Debt Navigator",
      "Priority support",
    ],
  },
  elite: {
    name: "Elite",
    price: 149,
    description: "Full protection suite with identity & privacy tools",
    popular: false,
    features: [
      "Everything in Pro",
      "Identity Protect",
      "Privacy Protect (data broker removal)",
      "Subscription Manager",
      "Student Loan Aid",
      "White-label documents",
      "Dedicated account manager",
    ],
  },
};

interface PlanDisplay {
  name: string;
  price: number;
  description: string;
  popular: boolean;
  features: string[];
  billingInterval: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  billingInterval: string;
  features: string[];
  maxDisputes: number | null;
  maxClients: number | null;
  aiCreditsPerMonth: number;
}

export default function SubscriptionCheckout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [plan, setPlan] = useState<PlanDisplay | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tierParam = urlParams.get('tier') as TierKey | null;
    const planIdParam = urlParams.get('planId');

    if (tierParam && TIER_DISPLAY[tierParam]) {
      initializeTierCheckout(tierParam);
    } else if (planIdParam) {
      initializePlanCheckout(parseInt(planIdParam));
    } else {
      setLocation('/pricing');
    }
  }, []);

  const initializeTierCheckout = async (tier: TierKey) => {
    try {
      setIsLoading(true);
      const info = TIER_DISPLAY[tier];
      setPlan({ ...info, billingInterval: "month" });

      const response = await apiRequest('POST', '/api/stripe/checkout-by-tier', { tier });
      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize checkout";
      toast({ title: "Checkout Error", description: message, variant: "destructive" });
      setLocation('/pricing');
    } finally {
      setIsLoading(false);
    }
  };

  const initializePlanCheckout = async (planId: number) => {
    try {
      setIsLoading(true);
      const plansResponse = await apiRequest('GET', '/api/subscription-plans');
      const plans = await plansResponse.json();
      const selectedPlan = plans.find((p: SubscriptionPlan) => p.id === planId);

      if (!selectedPlan) {
        toast({ title: "Plan Not Found", description: "The requested plan could not be found.", variant: "destructive" });
        setLocation('/billing');
        return;
      }

      setPlan({
        name: selectedPlan.name,
        price: parseFloat(selectedPlan.price),
        description: selectedPlan.description,
        popular: false,
        features: selectedPlan.features,
        billingInterval: selectedPlan.billingInterval,
      });

      const subscriptionResponse = await apiRequest('POST', '/api/stripe/subscription', { planId });
      const { clientSecret: secret } = await subscriptionResponse.json();
      setClientSecret(secret);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize checkout";
      toast({ title: "Checkout Error", description: message, variant: "destructive" });
      setLocation('/billing');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast({
      title: "Subscription Activated!",
      description: "Your subscription has been successfully activated. Welcome to ScoreShift!",
    });
    setLocation('/credit-repair');
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Setting up your checkout...</p>
        </div>
      </div>
    );
  }

  if (!plan || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setup Error</CardTitle>
            <CardDescription>Unable to initialize checkout process</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/pricing')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/pricing')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold text-center">Complete Your Subscription</h1>
          <p className="text-center text-gray-600 mt-2">
            You're one step away from transforming your credit repair journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.popular && (
                  <Badge className="bg-amber-500 text-black">Most Popular</Badge>
                )}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  ${plan.price}
                  <span className="text-lg text-gray-600 font-normal">/{plan.billingInterval}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Billed {plan.billingInterval}ly · Cancel anytime
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Key Benefits:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• AI-powered dispute letter generation</li>
                  <li>• Real-time credit monitoring</li>
                  <li>• USPS certified mail tracking</li>
                  <li>• 24/7 customer support</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                amount={plan.price}
                description={`${plan.name} Plan - Credit Repair Subscription`}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>

            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
              <p>🔒 Your payment information is secure and encrypted</p>
              <p className="mt-2">Cancel anytime from your billing settings</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
