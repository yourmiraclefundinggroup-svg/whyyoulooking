import { useState, useEffect, useRef } from "react";
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
  Lock, Eye, EyeOff, CheckCircle, Shield, CreditCard, Zap, Star, Sparkles
} from "lucide-react";
import {
  useArrayScript,
  ARRAY_SANDBOX_APP_KEY,
} from "@/hooks/use-array-script";
import {
  extractArrayEventPII,
  ARRAY_COMPLETION_TYPES,
} from "@/lib/array-enrollment-event";

const STEPS = [
  { label: "Your Rights", icon: Shield },
  { label: "AI Consent", icon: Sparkles },
  { label: "Your Info", icon: User },
  { label: "Credit Profile", icon: CreditCard },
  { label: "Password", icon: Lock },
  { label: "Your Plan", icon: Star },
];

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

const CROA_TEXT = `CONSUMER CREDIT FILE RIGHTS UNDER STATE AND FEDERAL LAW

You have a right to dispute inaccurate information in your credit report by contacting the credit bureau directly. There is no fee for doing so. Any reputable credit counseling organization can help you do this at no charge.

Any legitimate credit repair law firm or credit repair organization that charges fees must give you written information about your rights.

You have the right to sue a credit repair organization that violates the Credit Repair Organizations Act. This law prohibits deceptive practices by credit repair organizations.

Before signing a contract with any credit repair organization, you should understand all of your rights and what credit repair organizations can and cannot legally do on your behalf.

ScoreShift will only dispute information that may be inaccurate, incomplete, or unverifiable. We will never advise you to dispute accurate information, create a new credit identity, or engage in any illegal activity.

YOUR RIGHT TO CANCEL: You may cancel this contract without any penalty or obligation within THREE (3) BUSINESS DAYS from the date you sign up. To cancel, email support@scoreshiftapp.com with subject line: Cancel My ScoreShift Account. Services will not begin until the 3-day cancellation period has expired.`;

export default function Signup() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setCurrentUserId } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Array script + enrollment state
  // Start with empty string so useArrayScript waits for the real key from the server
  // before injecting scripts — prevents script injection with the wrong/sandbox key.
  const [enrollAppKey, setEnrollAppKey] = useState<string>("");
  const [enrollSandboxMode, setEnrollSandboxMode] = useState<boolean>(true);
  const { loaded: scriptReady } = useArrayScript(enrollAppKey);
  const [arrayEnrolled, setArrayEnrolled] = useState(false);
  const arrayEnrollRef = useRef<HTMLDivElement>(null);

  // PII captured from the Array enrollment event
  const [capturedArrayUserId, setCapturedArrayUserId] = useState<string | null>(null);
  const [capturedDob, setCapturedDob] = useState<string | null>(null);
  const [capturedSsnLast4, setCapturedSsnLast4] = useState<string | null>(null);
  const [capturedAddress, setCapturedAddress] = useState<{ line1: string; city: string; state: string; zip: string } | null>(null);
  // Contact PII captured from Array — stored separately so we can offer prefill
  // if the user navigates back to Step 2 with empty fields after completing Step 3.
  const [capturedArrayContact, setCapturedArrayContact] = useState<{
    firstName?: string; lastName?: string; email?: string; phone?: string;
  } | null>(null);

  // Step 0 — CROA
  const [croaAccepted, setCroaAccepted] = useState(false);
  const [croaAcceptedAt, setCroaAcceptedAt] = useState<string | null>(null);

  // Step 1 — AI Consent
  const [aiConsent1, setAiConsent1] = useState(false);
  const [aiConsent2, setAiConsent2] = useState(false);
  const [aiConsent3, setAiConsent3] = useState(false);
  const [aiConsent4, setAiConsent4] = useState(false);
  const [aiConsentAcceptedAt, setAiConsentAcceptedAt] = useState<string | null>(null);

  // Step 2 — Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  // Refs that always reflect the latest contact field values.
  // Used inside the Array event handler closure so we don't read stale state
  // and accidentally overwrite something the user has already typed.
  const firstNameRef = useRef(firstName);
  const lastNameRef = useRef(lastName);
  const emailRef = useRef(email);
  const phoneRef = useRef(phone);
  useEffect(() => { firstNameRef.current = firstName; }, [firstName]);
  useEffect(() => { lastNameRef.current = lastName; }, [lastName]);
  useEffect(() => { emailRef.current = email; }, [email]);
  useEffect(() => { phoneRef.current = phone; }, [phone]);

  // Step 3 — Password
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 4 — Plan
  const [selectedPlan, setSelectedPlan] = useState("free");

  // Fetch the real appKey from the server on mount (public endpoint, no auth needed).
  // Scripts won't be injected until this resolves because enrollAppKey starts as "".
  useEffect(() => {
    fetch("/api/array/enroll-config")
      .then(r => r.json())
      .then(data => {
        if (data.appKey) setEnrollAppKey(data.appKey);
        // sandboxMode defaults to true on the server; only false when ARRAY_PRODUCTION_MODE=true
        setEnrollSandboxMode(data.sandboxMode !== false);
      })
      .catch(() => {
        // Fall back to sandbox mode with the constant so enrollment isn't blocked
        setEnrollAppKey(ARRAY_SANDBOX_APP_KEY);
        setEnrollSandboxMode(true);
      });
  }, []);

  // Mount array-account-enroll when on step 3 and script is ready
  useEffect(() => {
    if (step !== 3 || !arrayEnrollRef.current || !scriptReady) return;
    arrayEnrollRef.current.innerHTML = "";

    const el = document.createElement("array-account-enroll");
    // Only set appKey (and sandbox when required) — do NOT set userToken or apiUrl.
    // Passing userToken blocks new-user enrollment; Array must create the user fresh.
    el.setAttribute("appKey", enrollAppKey);
    // sandbox="true" tells the component to use Array's sandbox infrastructure.
    // Required whenever credentials target sandbox.array.io (which they always do
    // until ARRAY_PRODUCTION_MODE=true is explicitly set).
    if (enrollSandboxMode) el.setAttribute("sandbox", "true");

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Log event type and non-sensitive fields only — redact SSN and full DOB
      const safeLog = { type: detail?.type, userId: detail?.userId ?? detail?.data?.userId };
      console.log("[Array signup] array-event:", JSON.stringify(safeLog));

      const type: string = detail?.type ?? "";

      if (ARRAY_COMPLETION_TYPES.has(type)) {
        // Extract PII from the event payload so we can save it on account creation
        const pii = extractArrayEventPII(detail as Record<string, unknown>);

        if (pii.rawUserId) setCapturedArrayUserId(pii.rawUserId);
        if (pii.rawDob) setCapturedDob(pii.rawDob);
        if (pii.ssnLast4) setCapturedSsnLast4(pii.ssnLast4);
        if (pii.address) setCapturedAddress(pii.address);

        // Always save Array contact PII so we can offer prefill if the user
        // returns to Step 2 (Your Info) with empty fields after completing Step 3.
        if (pii.firstName || pii.lastName || pii.email || pii.phone) {
          setCapturedArrayContact({
            firstName: pii.firstName ?? undefined,
            lastName: pii.lastName ?? undefined,
            email: pii.email ?? undefined,
            phone: pii.phone ?? undefined,
          });
        }

        // Auto-populate contact fields from the event ONLY if the user hasn't
        // already typed into them — read refs to get the latest values, not
        // the stale closure values from when the effect first ran.
        if (!firstNameRef.current && pii.firstName) setFirstName(pii.firstName);
        if (!lastNameRef.current && pii.lastName) setLastName(pii.lastName);
        if (!emailRef.current && pii.email) setEmail(pii.email);
        if (!phoneRef.current && pii.phone) setPhone(pii.phone);

        setArrayEnrolled(true);
        // Do NOT auto-advance — user must still confirm their info fields
        // and click Continue (validateStep will confirm arrayEnrolled is true)
      }
    };

    el.addEventListener("array-event", handleEvent);
    arrayEnrollRef.current.appendChild(el);

    return () => {
      if (arrayEnrollRef.current) arrayEnrollRef.current.innerHTML = "";
    };
  }, [step, scriptReady, enrollAppKey, enrollSandboxMode]);

  const handleCroaCheck = (checked: boolean) => {
    setCroaAccepted(checked);
    if (checked && !croaAcceptedAt) {
      setCroaAcceptedAt(new Date().toISOString());
    }
  };

  const handleAllAiChecked = () => {
    const allChecked = aiConsent1 && aiConsent2 && aiConsent3 && aiConsent4;
    if (allChecked && !aiConsentAcceptedAt) {
      setAiConsentAcceptedAt(new Date().toISOString());
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!croaAccepted) {
        toast({ title: "Disclosure Required", description: "You must read and acknowledge the Consumer Credit Rights Disclosure to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!aiConsent1 || !aiConsent2 || !aiConsent3 || !aiConsent4) {
        toast({ title: "AI Consent Required", description: "Please acknowledge all AI data processing disclosures to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!firstName.trim()) { toast({ title: "First name is required", variant: "destructive" }); return false; }
      if (!lastName.trim()) { toast({ title: "Last name is required", variant: "destructive" }); return false; }
      if (!phone.trim()) { toast({ title: "Phone number is required", variant: "destructive" }); return false; }
      if (!email.trim()) { toast({ title: "Email address is required", variant: "destructive" }); return false; }
      if (!smsOptIn) {
        toast({ title: "SMS Consent Required", description: "Please check the SMS opt-in box to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!arrayEnrolled) {
        toast({ title: "Credit Profile Required", description: "Please complete the credit profile setup to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!password) { toast({ title: "Password is required", variant: "destructive" }); return false; }
      if (password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return false; }
      if (password !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return false; }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
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
        croaAcceptedAt,
        aiConsentAcceptedAt,
        source: "signup",
        // PII captured from the Array enrollment event
        ...(capturedDob ? { dateOfBirth: capturedDob } : {}),
        ...(capturedSsnLast4 ? { ssnLast4: capturedSsnLast4 } : {}),
        ...(capturedAddress?.line1 ? { addressLine1: capturedAddress.line1 } : {}),
        ...(capturedAddress?.city ? { city: capturedAddress.city } : {}),
        ...(capturedAddress?.state ? { state: capturedAddress.state } : {}),
        ...(capturedAddress?.zip ? { zipCode: capturedAddress.zip } : {}),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.message || "Failed to create account");
      }

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

      // Record Array enrollment in DB now that we have a valid auth token
      // Pass the real arrayUserId from the enrollment event so the DB row
      // stores the genuine Array UUID instead of a placeholder
      if (arrayEnrolled) {
        try {
          await apiRequest("POST", "/api/array/enroll", {
            ...(capturedArrayUserId ? { arrayUserId: capturedArrayUserId } : {}),
          });
        } catch (e) {
          console.warn("[Array] Failed to record enrollment after signup:", e);
        }
      }

      toast({
        title: "Welcome to ScoreShift!",
        description: "Your account has been created successfully.",
      });

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

  const allAiChecked = aiConsent1 && aiConsent2 && aiConsent3 && aiConsent4;

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
            {STEPS.map(({ label }, i) => (
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

            {/* Step 0: CROA Disclosure */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consumer Credit File Rights</h2>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mt-0.5">Required by Federal Law (15 U.S.C. §1679c)</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 px-3 py-1.5 rounded-md border border-blue-100 dark:border-blue-900">
                  Step 1 of 6 — Please read the disclosure below before continuing.
                </div>

                <div
                  className="max-h-[300px] overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800/60 p-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                >
                  {CROA_TEXT}
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                  croaAccepted
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                }`}>
                  <Checkbox
                    id="croaAccepted"
                    checked={croaAccepted}
                    onCheckedChange={(c) => handleCroaCheck(c as boolean)}
                    className="mt-0.5 shrink-0"
                  />
                  <label htmlFor="croaAccepted" className="cursor-pointer">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-1">
                      Acknowledge Disclosure <span className="text-red-500">*</span>
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      I have received and read this Consumer Credit Rights Disclosure and understand my right to cancel within 3 business days.
                    </span>
                  </label>
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Time of acknowledgment will be recorded:{" "}
                  <span className="font-mono">
                    {croaAcceptedAt ? new Date(croaAcceptedAt).toLocaleString() : new Date().toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* Step 1: AI Data Processing Acknowledgment */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How We Use AI to Help You</h2>
                    <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-0.5">Please review and acknowledge each item below</p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-md border border-amber-100 dark:border-amber-900">
                  Step 2 of 6 — All four items must be acknowledged to continue.
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "aiConsent1",
                      checked: aiConsent1,
                      onChange: (c: boolean) => { setAiConsent1(c); if (c) handleAllAiChecked(); },
                      text: "I understand that ScoreShift uses artificial intelligence (AI) technology, including services from Anthropic and OpenAI, to read and analyze my credit report data including my name, address, account information, payment history, and other personal financial information.",
                    },
                    {
                      id: "aiConsent2",
                      checked: aiConsent2,
                      onChange: (c: boolean) => { setAiConsent2(c); if (c) handleAllAiChecked(); },
                      text: "I understand my credit report data may be processed by third-party AI providers (Anthropic, PBC and OpenAI, LLC) to generate dispute letters and analysis. My data is not used to train AI models.",
                    },
                    {
                      id: "aiConsent3",
                      checked: aiConsent3,
                      onChange: (c: boolean) => { setAiConsent3(c); if (c) handleAllAiChecked(); },
                      text: "I understand my information is stored securely in encrypted cloud databases. ScoreShift uses industry-standard security to protect my data.",
                    },
                    {
                      id: "aiConsent4",
                      checked: aiConsent4,
                      onChange: (c: boolean) => { setAiConsent4(c); if (c) handleAllAiChecked(); },
                      text: "I understand I can request deletion of my personal data at any time by contacting support@scoreshiftapp.com, and that ScoreShift retains data for 2 years after account closure unless deletion is requested.",
                    },
                  ].map((item) => (
                    <div key={item.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      item.checked
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-600"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                    }`}>
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={(c) => item.onChange(c as boolean)}
                        className="mt-0.5 shrink-0"
                      />
                      <label htmlFor={item.id} className="cursor-pointer text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.text}
                      </label>
                    </div>
                  ))}
                </div>

                {/* AI Notice Box */}
                <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">AI Analysis Notice</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      ScoreShift AI analyzes your credit information and generates dispute letters for your review. AI does not make final decisions — you retain full control over which items are disputed on your behalf.
                    </p>
                  </div>
                </div>

                {aiConsentAcceptedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Time of acknowledgment will be recorded:{" "}
                    <span className="font-mono">{new Date(aiConsentAcceptedAt).toLocaleString()}</span>
                  </p>
                )}
              </div>
            )}

            {/* Step 2: Your Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Contact Info</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Enter your details and agree to SMS updates before connecting your credit profile.</p>
                </div>

                {/* Prefill hint — shown only when the user returns here after completing
                    Step 3 (Credit Profile) and at least one contact field is still empty
                    but the corresponding value was captured from the Array event. */}
                {arrayEnrolled && capturedArrayContact && (
                  (!firstName.trim() && capturedArrayContact.firstName) ||
                  (!lastName.trim() && capturedArrayContact.lastName) ||
                  (!email.trim() && capturedArrayContact.email) ||
                  (!phone.trim() && capturedArrayContact.phone)
                ) && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
                    <Sparkles className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        We can prefill these from your credit profile info.
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 leading-relaxed">
                        Your credit profile contains contact information you entered during enrollment. You can apply it to any empty fields below — you can edit them afterwards.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (capturedArrayContact.firstName && !firstName.trim()) setFirstName(capturedArrayContact.firstName);
                          if (capturedArrayContact.lastName && !lastName.trim()) setLastName(capturedArrayContact.lastName);
                          if (capturedArrayContact.email && !email.trim()) setEmail(capturedArrayContact.email);
                          if (capturedArrayContact.phone && !phone.trim()) setPhone(capturedArrayContact.phone);
                        }}
                        className="text-xs font-semibold text-blue-700 dark:text-blue-300 underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                      >
                        Apply prefill
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact details */}
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Your Contact Details</p>

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
                </div>
              </div>
            )}

            {/* Step 3: Credit Profile */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Credit Profile</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Securely link your credit data so ScoreShift can identify issues and build your dispute plan.</p>
                </div>

                <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 overflow-hidden">
                  <div className="px-5 py-4 border-b border-blue-200 dark:border-blue-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <CreditCard className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Credit Profile Setup</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Required to access your live credit data</p>
                      </div>
                    </div>
                    {arrayEnrolled ? (
                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-semibold">
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        Awaiting
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {!scriptReady ? (
                      <div className="flex items-center justify-center py-8 gap-3">
                        <div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading secure enrollment form...</span>
                      </div>
                    ) : (
                      <div ref={arrayEnrollRef} className="w-full min-h-[180px]" />
                    )}
                  </div>

                  <div className="px-5 pb-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                    <Shield className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    <span>Your information is encrypted and secured by ScoreShift.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Password */}
            {step === 4 && (
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

            {/* Step 5: Choose Plan */}
            {step === 5 && (
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
                            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-500" />
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
                  disabled={
                    (step === 0 && !croaAccepted) ||
                    (step === 1 && !allAiChecked)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
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
