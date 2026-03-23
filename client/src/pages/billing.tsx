import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { CreditCard, Check, X, Calendar, DollarSign } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { PaymentCard3D } from "@/components/ui/payment-card-3d";

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

  const isLoading = plansLoading || invoicesLoading || paymentMethodsLoading;

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: "#050A14" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">Billing & Subscriptions</h1>
          <p className="text-slate-400 mt-1">Manage your plan, payment method, and billing history.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="card-3d p-6" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs uppercase tracking-widest text-amber-400 mb-1 font-medium">Current Plan</div>
                  <h2 className="text-xl font-black text-white">
                    {user?.subscriptionPlan || "No Active Plan"}
                  </h2>
                  {user?.subscriptionStatus && (
                    <p className="text-slate-400 text-sm mt-1">
                      Status: <span className={user.subscriptionStatus === "ACTIVE" ? "text-emerald-400" : "text-red-400"}>{user.subscriptionStatus}</span>
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
                      className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                      onClick={handleCancelSubscription}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Available Plans */}
            {plans && plans.length > 0 && (
              <div className="card-3d p-6">
                <h2 className="text-lg font-bold text-white mb-4">Available Plans</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-4 rounded-xl border transition-all cursor-pointer hover:border-amber-500/30"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE"
                          ? "rgba(245,158,11,0.4)"
                          : "rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="text-white font-bold mb-1">{plan.name}</div>
                      <div className="text-amber-400 font-black text-lg mb-3">${plan.price}<span className="text-slate-500 text-xs font-normal">/{plan.billingInterval}</span></div>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-1 mb-3">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center gap-1.5 text-slate-400 text-xs">
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
                        disabled={user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE"}
                      >
                        {user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE" ? "Current Plan" : "Select Plan"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="card-3d p-6">
              <h2 className="text-lg font-bold text-white mb-6">Payment Method</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <PaymentCard3D animated={false} className="flex-shrink-0" />
                <div className="flex-1">
                  {paymentMethods && (paymentMethods as any[]).length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {(paymentMethods as any[]).map((method: any) => (
                        <div key={method.id} className="flex items-center gap-3 text-sm">
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span className="text-white">**** **** **** {method.card.last4}</span>
                          <span className="text-slate-500">{method.card.brand.toUpperCase()} · {method.card.exp_month}/{method.card.exp_year}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm mb-4">
                      Your payment information is securely stored and processed by Stripe.
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    Update Payment Method
                  </Button>
                </div>
              </div>
            </div>

            {/* Invoices */}
            {invoices && invoices.length > 0 && (
              <div className="card-3d p-6">
                <h2 className="text-lg font-bold text-white mb-4">Billing History</h2>
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex justify-between items-center py-3 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div>
                        <div className="text-white text-sm font-medium">Subscription</div>
                        <div className="text-slate-500 text-xs">{new Date(invoice.created * 1000).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            invoice.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {invoice.status}
                        </span>
                        <span className="text-white font-semibold text-sm">${(invoice.amount_paid / 100).toFixed(2)}</span>
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 text-xs"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
