import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { PaymentCard3D } from "@/components/ui/payment-card-3d";
import { trackSubscriptionCancelled } from "@/lib/analytics";

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
    window.location.href = `/checkout?planId=${planId}`;
  };

  const handleCancelSubscription = async () => {
    try {
      await apiRequest("DELETE", "/api/stripe/subscription");
      trackSubscriptionCancelled();
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

  const isLoading = plansLoading || invoicesLoading || paymentMethodsLoading;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">Account</div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Billing & Subscriptions</h1>
          <p className="text-muted-foreground mt-1">Manage your plan, payment method, and billing history.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan */}
            <Card className="border-amber-500/20 dark:border-amber-500/20">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">Current Plan</div>
                    <h2 className="text-xl font-black text-foreground">
                      {user?.subscriptionPlan || "No Active Plan"}
                    </h2>
                    {user?.subscriptionStatus && (
                      <p className="text-muted-foreground text-sm mt-1">
                        Status:{" "}
                        <span className={user.subscriptionStatus === "ACTIVE" ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}>
                          {user.subscriptionStatus}
                        </span>
                        {user.billingCycle && <span> · Billed {user.billingCycle}</span>}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href="/pricing">
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                        Upgrade Plan
                      </Button>
                    </Link>
                    {user?.subscriptionStatus === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelSubscription}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Plans */}
            {plans && plans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">Available Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {plans.map((plan) => {
                      const isCurrentPlan = user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE";
                      return (
                        <div
                          key={plan.id}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            isCurrentPlan
                              ? "border-amber-500/40 bg-amber-500/5"
                              : "border-border hover:border-amber-500/30 bg-card"
                          }`}
                        >
                          <div className="text-foreground font-bold mb-1">{plan.name}</div>
                          <div className="text-amber-500 dark:text-amber-400 font-black text-lg mb-3">
                            ${plan.price}
                            <span className="text-muted-foreground text-xs font-normal">/{plan.billingInterval}</span>
                          </div>
                          {plan.features && plan.features.length > 0 && (
                            <ul className="space-y-1 mb-3">
                              {plan.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                          <Button
                            size="sm"
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                            onClick={() => handleSubscribe(plan.id)}
                            disabled={isCurrentPlan}
                          >
                            {isCurrentPlan ? "Current Plan" : "Select Plan"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <PaymentCard3D animated={false} className="flex-shrink-0" />
                  <div className="flex-1">
                    {paymentMethods && (paymentMethods as any[]).length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {(paymentMethods as any[]).map((method: any) => (
                          <div key={method.id} className="flex items-center gap-3 text-sm">
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground">**** **** **** {method.card.last4}</span>
                            <span className="text-muted-foreground">
                              {method.card.brand.toUpperCase()} · {method.card.exp_month}/{method.card.exp_year}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm mb-4">
                        Your payment information is securely stored and processed by Stripe.
                      </div>
                    )}
                    <Button variant="outline">
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            {invoices && invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex justify-between items-center py-3 border-b border-border last:border-0"
                      >
                        <div>
                          <div className="text-foreground text-sm font-medium">Subscription</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(invoice.created * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              invoice.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {invoice.status}
                          </span>
                          <span className="text-foreground font-semibold text-sm">
                            ${(invoice.amount_paid / 100).toFixed(2)}
                          </span>
                          {invoice.hosted_invoice_url && (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-500 dark:text-amber-400 hover:text-amber-400 dark:hover:text-amber-300 text-xs"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
