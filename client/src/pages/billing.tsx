import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { CreditCard, CheckCircle, Star, Zap, Shield, ExternalLink, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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

interface PaymentMethod {
  id: string;
  card: {
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
}

const PLAN_ICONS: Record<string, typeof Star> = {
  Starter: Zap,
  Pro: Star,
  Elite: Shield,
};

export default function Billing() {
  const { user } = useUserContext();
  const { toast } = useToast();

  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/stripe/invoices"],
  });

  const { data: paymentMethods = [], isLoading: paymentMethodsLoading } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/stripe/payment-methods"],
  });

  const handleSubscribe = (planId: number) => {
    window.location.href = `/checkout?planId=${planId}`;
  };

  const handleCancelSubscription = async () => {
    try {
      await apiRequest("DELETE", "/api/stripe/subscription");
      toast({ title: "Subscription Cancelled", description: "Your subscription will end at the current billing period." });
    } catch (error: any) {
      toast({ title: "Cancellation Error", description: error.message, variant: "destructive" });
    }
  };

  const isLoading = plansLoading || invoicesLoading || paymentMethodsLoading;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
          <div className="relative">
            <div className="ss-overline mb-2">Account</div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>
              Billing & Subscriptions
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your plan, payment method, and billing history.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="ss-card !p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>Loading billing info...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ── Current Plan ── */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
            >
              <div className="ss-overline mb-4">Current Plan</div>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>
                    {user?.subscriptionPlan || "No Active Plan"}
                  </h2>
                  {user?.subscriptionStatus && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: user.subscriptionStatus === "ACTIVE" ? "rgba(46,204,138,0.12)" : "rgba(224,82,82,0.12)",
                          color: user.subscriptionStatus === "ACTIVE" ? "#2ECC8A" : "#E05252",
                        }}
                      >
                        {user.subscriptionStatus}
                      </span>
                      {user.billingCycle && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Billed {user.billingCycle}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/pricing">
                    <button className="ss-btn-primary !py-2 !px-4 text-sm">
                      Upgrade Plan
                    </button>
                  </Link>
                  {user?.subscriptionStatus === "ACTIVE" && (
                    <button
                      className="ss-btn-ghost !py-2 !px-4 text-sm"
                      onClick={handleCancelSubscription}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Available Plans ── */}
            {plans.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
              >
                <div className="ss-overline mb-4">Available Plans</div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const isCurrentPlan = user?.subscriptionPlan === plan.name && user?.subscriptionStatus === "ACTIVE";
                    const PlanIcon = PLAN_ICONS[plan.name] || Zap;
                    return (
                      <div
                        key={plan.id}
                        className="rounded-xl p-4 transition-all"
                        style={{
                          background: isCurrentPlan ? "rgba(201,168,76,0.06)" : "var(--bg-elevated)",
                          border: `1px solid ${isCurrentPlan ? "rgba(201,168,76,0.4)" : "var(--border-gold)"}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ background: "rgba(201,168,76,0.12)" }}
                          >
                            <PlanIcon className="h-4 w-4" style={{ color: "var(--gold)" }} />
                          </div>
                          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{plan.name}</span>
                          {isCurrentPlan && (
                            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(46,204,138,0.12)", color: "#2ECC8A" }}>Active</span>
                          )}
                        </div>
                        <div className="mb-3">
                          <span className="text-2xl font-black" style={{ color: "var(--gold)" }}>${plan.price}</span>
                          <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>/{plan.billingInterval}</span>
                        </div>
                        {plan.features?.length > 0 && (
                          <ul className="space-y-1.5 mb-4">
                            {plan.features.slice(0, 3).map((feature, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                                <CheckCircle className="h-3 w-3 shrink-0" style={{ color: "#2ECC8A" }} />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${isCurrentPlan ? "cursor-default" : ""}`}
                          style={{
                            background: isCurrentPlan ? "rgba(201,168,76,0.08)" : "linear-gradient(135deg, var(--gold), var(--gold-light))",
                            color: isCurrentPlan ? "var(--text-muted)" : "var(--bg-primary)",
                          }}
                          onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                          disabled={isCurrentPlan}
                        >
                          {isCurrentPlan ? "Current Plan" : "Select Plan"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Payment Method ── */}
            <div
              className="rounded-2xl p-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
            >
              <div className="ss-overline mb-4">Payment Method</div>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}
                    >
                      <CreditCard className="h-4 w-4 shrink-0" style={{ color: "var(--gold)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        •••• •••• •••• {method.card.last4}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {method.card.brand.toUpperCase()} · {method.card.exp_month}/{method.card.exp_year}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  Your payment information is securely stored and processed by Stripe.
                </p>
              )}
              <button className="ss-btn-ghost !py-2.5 !px-5 text-sm">
                <CreditCard className="h-4 w-4" />
                Update Payment Method
              </button>
            </div>

            {/* ── Billing History ── */}
            {invoices.length > 0 && (
              <div
                className="rounded-2xl p-6"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
              >
                <div className="ss-overline mb-4">Billing History</div>
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-3 gap-4"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Subscription</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(invoice.created * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: invoice.status === "paid" ? "rgba(46,204,138,0.12)" : "rgba(232,160,32,0.12)",
                            color: invoice.status === "paid" ? "#2ECC8A" : "#E8A020",
                          }}
                        >
                          {invoice.status}
                        </span>
                        <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          ${(invoice.amount_paid / 100).toFixed(2)}
                        </span>
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-0.5 text-xs font-semibold"
                            style={{ color: "var(--gold)" }}
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
