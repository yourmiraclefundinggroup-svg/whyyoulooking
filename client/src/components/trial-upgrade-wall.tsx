import { useUserContext } from "@/hooks/use-user-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, Zap, CheckCircle, ArrowRight, Star } from "lucide-react";

export function TrialUpgradeWall({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useUserContext();
  const [location] = useLocation();

  // Always allow billing/checkout through so users can upgrade
  const isPaymentRoute = location === "/billing" || location === "/checkout" || location.startsWith("/checkout");
  if (isPaymentRoute) return <>{children}</>;

  // Admins and paid users always pass through
  if (!user || isAdmin) return <>{children}</>;

  // Only block FREE / TRIALING plan users
  const isFree = user.subscriptionPlan === "FREE" || user.subscriptionPlan === "TRIALING" || !user.subscriptionPlan;
  if (!isFree) return <>{children}</>;

  // Calculate days since account creation
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const daysSince = createdAt
    ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const daysRemaining = Math.max(0, 7 - daysSince);
  const trialExpired = daysSince >= 7;

  // Show a banner warning when trial is running (but not blocking yet)
  if (!trialExpired) {
    return (
      <>
        <div className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 px-4">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                Free trial — <strong>{daysRemaining} day{daysRemaining !== 1 ? "s" : ""}</strong> remaining. Upgrade to keep full access.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => window.location.href = "/billing"}
              className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shrink-0 h-7 px-3 text-xs"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
        {children}
      </>
    );
  }

  // Trial expired — show full blocking upgrade wall
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ScoreShift</span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Clock className="h-10 w-10 text-orange-500" />
            </div>

            <Badge className="mb-4 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 px-3 py-1">
              Free Trial Ended
            </Badge>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Your 7-day trial has expired
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 max-w-md mx-auto">
              You've experienced what ScoreShift can do for your credit. Choose a plan to keep your progress and continue repairing your credit.
            </p>

            {/* Plan options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
              {[
                {
                  name: "Basic",
                  price: "$49",
                  color: "border-gray-200 dark:border-gray-700",
                  highlight: false,
                  features: ["3 disputes/month", "Credit tracking", "Email support"],
                },
                {
                  name: "Premium",
                  price: "$99",
                  color: "border-blue-500",
                  highlight: true,
                  badge: "Most Popular",
                  features: ["Unlimited disputes", "USPS tracking", "AI letters", "Priority support"],
                },
                {
                  name: "Professional",
                  price: "$149",
                  color: "border-purple-500",
                  highlight: false,
                  features: ["Everything in Premium", "Business credit", "Dedicated advisor"],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-4 rounded-xl border-2 ${plan.color} ${
                    plan.highlight ? "bg-blue-50 dark:bg-blue-950/30" : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  {plan.highlight && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs">
                      Most Popular
                    </Badge>
                  )}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white mb-3">{plan.name}</p>
                  <ul className="space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                        <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button
              onClick={() => window.location.href = "/billing"}
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 text-lg font-semibold shadow-xl shadow-blue-500/25 h-auto"
            >
              <Zap className="h-5 w-5 mr-2" />
              Choose My Plan
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="mt-4 text-xs text-gray-400">
              Secure checkout · Cancel anytime · 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span>4.9 / 5 rating</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>FCRA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
