import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { CreditCard, Check, X, Calendar, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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
  active: boolean;
}

interface Invoice {
  id: string;
  amount_paid: number;
  created: number;
  status: string;
  hosted_invoice_url: string;
}

export default function Billing() {
  const { user } = useUserContext();
  const { toast } = useToast();

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/stripe/invoices"],
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery({
    queryKey: ["/api/stripe/payment-methods"],
  });

  const handleSubscribe = (planId: number) => {
    // Redirect to checkout page with plan ID
    window.location.href = `/checkout?planId=${planId}`;
  };

  const handleCancelSubscription = async () => {
    try {
      await apiRequest("DELETE", "/api/stripe/subscription");
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will end at the current billing period.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Subscriptions</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your ScoreShift subscription and billing information</p>
      </div>

      {/* Current Subscription Status */}
      {user?.subscriptionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Plan</div>
                <div className="font-semibold">{user.subscriptionPlan}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Status</div>
                <Badge variant={user.subscriptionStatus === "ACTIVE" ? "default" : "destructive"}>
                  {user.subscriptionStatus}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Billing Cycle</div>
                <div className="font-semibold capitalize">{user.billingCycle}</div>
              </div>
            </div>
            {user.subscriptionStatus === "ACTIVE" && (
              <div className="mt-4">
                <Button variant="outline" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.name === "Elite Plan" ? "border-blue-500 border-2" : ""}`}>
              {plan.name === "Elite Plan" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-lg text-gray-600 font-normal">/{plan.billingInterval}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.name === "Elite Plan" ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE"}
                >
                  {user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE" 
                    ? "Current Plan" 
                    : "Subscribe"
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentMethodsLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.map((method: any) => (
                <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <div className="font-medium">**** **** **** {method.card.last4}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {method.card.brand.toUpperCase()} • Expires {method.card.exp_month}/{method.card.exp_year}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No payment methods saved</p>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">${(invoice.amount_paid / 100).toFixed(2)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>
                      {invoice.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No invoices found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}