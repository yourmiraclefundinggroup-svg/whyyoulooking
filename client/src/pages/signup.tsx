import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp, ChevronRight, ChevronLeft, User, Phone, Mail,
  Lock, Eye, EyeOff, CheckCircle, Shield, CreditCard, Zap, Star
} from "lucide-react";

const STEPS = ["Personal Info", "Account Setup", "Choose Plan"];

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: "$0",
    interval: "/7 days",
    badge: "Start Free",
    badgeColor: "bg-green-600",
    features: ["Full access for 7 days", "Credit score tracking", "AI dispute letter preview", "No credit card required"],
    note: "Upgrade required after 7 days",
  },
  {
    id: "basic",
    name: "Basic",
    price: "$49",
    interval: "/mo",
    badge: null,
    badgeColor: "",
    features: ["Up to 3 disputes/month", "Credit score tracking", "Basic AI analysis", "Email support"],
    note: null,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$99",
    interval: "/mo",
    badge: "Most Popular",
    badgeColor: "bg-blue-600",
    features: ["Unlimited disputes", "USPS certified mail tracking", "Full AI dispute letters", "Priority support", "Credit report analysis"],
    note: null,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$149",
    interval: "/mo",
    badge: "Best Value",
    badgeColor: "bg-purple-600",
    features: ["Everything in Premium", "Business credit portal", "Dedicated advisor", "White-glove service", "Same-day dispute filing"],
    note: null,
  },
];

export default function Signup() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setCurrentUserId } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free");

  // Step 1 validation
  const validateStep1 = () => {
    if (!firstName.trim()) { toast({ title: "First name is required", variant: "destructive" }); return false; }
    if (!lastName.trim()) { toast({ title: "Last name is required", variant: "destructive" }); return false; }
    if (!phone.trim()) { toast({ title: "Phone number is required", variant: "destructive" }); return false; }
    if (!email.trim()) { toast({ title: "Email address is required", variant: "destructive" }); return false; }
    if (!smsOptIn) {
      toast({ title: "SMS Consent Required", description: "Please check the SMS opt-in box to continue.", variant: "destructive" });
      return false;
    }
    return true;
  };

  // Step 2 validation
  const validateStep2 = () => {
    if (!password) { toast({ title: "Password is required", variant: "destructive" }); return false; }
    if (password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return false; }
    if (password !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the user account
      const createRes = await apiRequest("POST", "/api/users", {
        firstName,
        lastName,
        email,
        phone,
        smsOptIn,
        password,
        accessLevel: "CLIENT_VIEWER",
        passwordResetRequired: false,
        subscriptionPlan: selectedPlan === "free" ? "FREE" : selectedPlan.toUpperCase(),
        subscriptionStatus: selectedPlan === "free" ? "TRIALING" : null,
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.message || "Failed to create account");
      }

      // Auto-login
      const loginRes = await apiRequest("POST", "/api/auth/login", {
        email,
        password,
        loginType: "client",
      });

      if (!loginRes.ok) throw new Error("Account created but login failed");

      const loginData = await loginRes.json();
      localStorage.setItem("auth_token", loginData.token);
      localStorage.setItem("user_id", loginData.user.id.toString());
      setCurrentUserId(loginData.user.id);

      toast({
        title: "Welcome to ScoreShift!",
        description: "Your account has been created successfully.",
      });

      // Free plan → go to dashboard, paid plan → go to billing to complete payment
      if (selectedPlan === "free") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/billing";
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">ScoreShift</span>
            </div>
          </Link>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((label, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  i < step
                    ? "bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-900"
                    : i === step
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900 scale-110"
                    : "bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700"
                }`}>
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  i <= step ? "text-gray-900 dark:text-white" : "text-gray-400"
                }`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl dark:bg-gray-900">
          <CardContent className="p-8">

            {/* Step 1: Personal Info */}
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Let's get started</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Tell us a bit about yourself to personalize your credit repair plan.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* SMS Opt-In */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  smsOptIn
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                }`}>
                  <Checkbox
                    id="smsOptIn"
                    checked={smsOptIn}
                    onCheckedChange={(c) => setSmsOptIn(c as boolean)}
                    className="mt-0.5 shrink-0"
                  />
                  <label htmlFor="smsOptIn" className="cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-1">
                      SMS Consent <span className="text-red-500">*</span>
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      By submitting this form you agree to receive SMS messages from ScoreShift regarding your credit repair progress. Message and data rates may apply. Reply STOP to opt out at any time.
                    </span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Setup */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your login</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Choose a secure password to protect your credit repair account.</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You'll use <strong>{email}</strong> to sign in.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                {/* Password strength indicators */}
                <div className="space-y-2">
                  {[
                    { label: "At least 8 characters", ok: password.length >= 8 },
                    { label: "Passwords match", ok: password.length > 0 && password === confirmPassword },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${r.ok ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`}>
                        {r.ok && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-xs ${r.ok ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>{r.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your information is encrypted and protected with enterprise-grade security.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Choose Plan */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose your plan</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Select the plan that best fits your credit repair goals.</p>
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? plan.id === "free"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30 shadow-lg"
                            : "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                      }`}
                    >
                      {plan.badge && (
                        <Badge className={`absolute -top-3 left-4 ${plan.badgeColor} text-white text-xs px-2 py-0.5`}>
                          {plan.badge}
                        </Badge>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedPlan === plan.id
                              ? plan.id === "free" ? "border-green-500 bg-green-500" : "border-blue-500 bg-blue-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}>
                            {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white text-lg">{plan.name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${plan.id === "free" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                            {plan.price}
                          </span>
                          <span className="text-gray-500 text-sm">{plan.interval}</span>
                        </div>
                      </div>
                      <ul className="space-y-1.5 ml-8">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckCircle className={`h-3.5 w-3.5 shrink-0 ${plan.id === "free" ? "text-green-500" : "text-green-500"}`} />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {plan.note && (
                        <div className="ml-8 mt-2 flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                            <span className="text-white text-[9px] font-bold">!</span>
                          </div>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{plan.note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back to Home
                  </Button>
                </Link>
              )}

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 shadow-lg"
                >
                  {isSubmitting ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Creating Account...</>
                  ) : (
                    <><Zap className="h-4 w-4 mr-2" /> Create My Account</>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-green-500" /> Bank-level security</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> FCRA Compliant</div>
          <div className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-yellow-500" /> 4.9★ Rated</div>
        </div>
      </main>
    </div>
  );
}
