import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronRight, ChevronLeft, User, Mail,
  Lock, Eye, EyeOff, CheckCircle, Shield, CreditCard, Zap, Star, Sparkles
} from "lucide-react";
import {
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import {
  extractArrayEventPII,
} from "@/lib/array-enrollment-event";

const STEPS = [
  { label: "Your Rights", icon: Shield },
  { label: "AI Consent", icon: Sparkles },
  { label: "Create Account", icon: User },
  { label: "Credit Profile", icon: CreditCard },
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
    badgeColor: "bg-[#7C6BCB]",
    features: ["Unlimited disputes", "USPS certified mail tracking", "Full AI dispute letters", "Priority support", "Credit report analysis"],
    note: null,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$149",
    interval: "/mo",
    badge: "Best Value",
    badgeColor: "bg-[#5B5652]",
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

  const [enrollSandboxMode] = useState<boolean>(true);
  const [enrollScriptReady, setEnrollScriptReady] = useState(false);
  const [arrayEnrolled, setArrayEnrolled] = useState(false);
  const arrayEnrollRef = useRef<HTMLDivElement>(null);

  const [capturedArrayUserId, setCapturedArrayUserId] = useState<string | null>(null);
  const [capturedDob, setCapturedDob] = useState<string | null>(null);
  const [capturedSsnLast4, setCapturedSsnLast4] = useState<string | null>(null);
  const [capturedAddress, setCapturedAddress] = useState<{ line1: string; line2: string; city: string; state: string; zip: string } | null>(null);
  const [capturedArrayContact, setCapturedArrayContact] = useState<{
    firstName?: string; lastName?: string; email?: string;
  } | null>(null);

  const [croaAccepted, setCroaAccepted] = useState(false);
  const [croaAcceptedAt, setCroaAcceptedAt] = useState<string | null>(null);

  const [aiConsent1, setAiConsent1] = useState(false);
  const [aiConsent2, setAiConsent2] = useState(false);
  const [aiConsent3, setAiConsent3] = useState(false);
  const [aiConsent4, setAiConsent4] = useState(false);
  const [aiConsent5, setAiConsent5] = useState(false);
  const [aiConsentAcceptedAt, setAiConsentAcceptedAt] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const firstNameRef = useRef(firstName);
  const lastNameRef = useRef(lastName);
  const emailRef = useRef(email);
  useEffect(() => { firstNameRef.current = firstName; }, [firstName]);
  useEffect(() => { lastNameRef.current = lastName; }, [lastName]);
  useEffect(() => { emailRef.current = email; }, [email]);

  const [selectedPlan, setSelectedPlan] = useState("free");

  const [inviteCode, setInviteCode] = useState("");
  const [inviteCodeApplied, setInviteCodeApplied] = useState(false);
  const [inviteCodeError, setInviteCodeError] = useState("");
  const [inviteCodeLoading, setInviteCodeLoading] = useState(false);
  const [showInviteField, setShowInviteField] = useState(false);

  // Load ONLY the array-account-enroll script directly — bypasses the 14-script
  // singleton which can stall if any of the other scripts fail to load.
  useEffect(() => {
    const TAG = "array-account-enroll";
    if (document.querySelector(`script[data-array-enroll]`) || customElements.get(TAG)) {
      setEnrollScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://embed.array.io/cms/${TAG}.js?appKey=${ARRAY_SANDBOX_APP_KEY}`;
    script.dataset.arrayEnroll = "1";
    const settle = () => {
      customElements.whenDefined(TAG)
        .then(() => setEnrollScriptReady(true))
        .catch(() => setEnrollScriptReady(true));
      // fallback in case whenDefined never resolves (script error)
      setTimeout(() => setEnrollScriptReady(true), 3000);
    };
    script.onload = settle;
    script.onerror = settle;
    document.head.appendChild(script);
  }, []);

  // Mount the enrollment web component once the script is ready and we're on step 3
  useEffect(() => {
    if (step !== 3 || !arrayEnrollRef.current || !enrollScriptReady) return;
    arrayEnrollRef.current.innerHTML = "";

    const el = document.createElement("array-account-enroll");
    el.setAttribute("appKey", ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("sandbox", "true");
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("userToken", ARRAY_SANDBOX_TOKENS.default);
    el.setAttribute("showQuickView", "true");

    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const type: string = detail?.type ?? "";
      const safeLog = { type, userId: detail?.userId ?? detail?.data?.userId };
      console.log("[Array signup] array-event received:", JSON.stringify(safeLog));

      const pii = extractArrayEventPII(detail as Record<string, unknown>);

      if (pii.rawUserId) setCapturedArrayUserId(pii.rawUserId);
      if (pii.rawDob) setCapturedDob(pii.rawDob);
      if (pii.ssnLast4) setCapturedSsnLast4(pii.ssnLast4);
      if (pii.address) setCapturedAddress(pii.address);

      if (pii.firstName || pii.lastName || pii.email) {
        setCapturedArrayContact({
          firstName: pii.firstName ?? undefined,
          lastName: pii.lastName ?? undefined,
          email: pii.email ?? undefined,
        });
      }

      if (!firstNameRef.current && pii.firstName) setFirstName(pii.firstName);
      if (!lastNameRef.current && pii.lastName) setLastName(pii.lastName);
      if (!emailRef.current && pii.email) setEmail(pii.email);

      setArrayEnrolled(true);
    };

    el.addEventListener("array-event", handleEvent);
    arrayEnrollRef.current.appendChild(el);

    return () => {
      if (arrayEnrollRef.current) arrayEnrollRef.current.innerHTML = "";
    };
  }, [step, enrollScriptReady]);

  const handleCroaCheck = (checked: boolean) => {
    setCroaAccepted(checked);
    if (checked && !croaAcceptedAt) {
      setCroaAcceptedAt(new Date().toISOString());
    }
  };

  const handleAllAiChecked = () => {
    const allChecked = aiConsent1 && aiConsent2 && aiConsent3 && aiConsent4 && aiConsent5;
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
      if (!aiConsent1 || !aiConsent2 || !aiConsent3 || !aiConsent4 || !aiConsent5) {
        toast({ title: "AI Consent Required", description: "Please acknowledge all AI data processing disclosures to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!firstName.trim()) { toast({ title: "First name is required", variant: "destructive" }); return false; }
      if (!lastName.trim()) { toast({ title: "Last name is required", variant: "destructive" }); return false; }
      if (!email.trim()) { toast({ title: "Email address is required", variant: "destructive" }); return false; }
      if (!password) { toast({ title: "Password is required", variant: "destructive" }); return false; }
      if (password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return false; }
      if (password !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 3) {
      if (!arrayEnrolled) {
        toast({ title: "Credit Profile Required", description: "Please complete the credit profile setup to continue.", variant: "destructive" });
        return false;
      }
      return true;
    }
    return true;
  };

  const applyInviteCode = async () => {
    if (!inviteCode.trim()) return;
    setInviteCodeLoading(true);
    setInviteCodeError("");
    try {
      const res = await fetch("/api/validate-invite-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setInviteCodeApplied(true);
        setSelectedPlan("elite-invite");
        setShowInviteField(false);
      } else {
        setInviteCodeError("Invalid code. Please check and try again.");
      }
    } catch {
      setInviteCodeError("Unable to validate code. Please try again.");
    }
    setInviteCodeLoading(false);
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
        password,
        accessLevel: "CLIENT_VIEWER",
        passwordResetRequired: false,
        subscriptionPlan: inviteCodeApplied ? "ELITE" : selectedPlan === "free" ? "FREE" : selectedPlan.toUpperCase(),
        subscriptionTier: inviteCodeApplied ? "elite" : undefined,
        subscriptionStatus: inviteCodeApplied ? "ACTIVE" : selectedPlan === "free" ? "TRIALING" : null,
        croaAcceptedAt,
        aiConsentAcceptedAt,
        source: "signup",
        ...(capturedDob ? { dateOfBirth: capturedDob } : {}),
        ...(capturedSsnLast4 ? { ssnLast4: capturedSsnLast4 } : {}),
        ...(capturedAddress?.line1 ? { addressLine1: capturedAddress.line1 } : {}),
        ...(capturedAddress?.line2 ? { addressLine2: capturedAddress.line2 } : {}),
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

      if (arrayEnrolled) {
        try {
          await apiRequest("POST", "/api/array/enroll", {
            ...(capturedArrayUserId ? { arrayUserId: capturedArrayUserId } : {}),
          });
        } catch (e) {
          console.warn("[Array] Failed to record enrollment after signup:", e);
        }
      }

      const piiPatch: Record<string, string> = {};
      if (capturedDob) piiPatch.dateOfBirth = capturedDob;
      if (capturedSsnLast4) piiPatch.ssnLast4 = capturedSsnLast4;
      if (capturedAddress?.line1) piiPatch.addressLine1 = capturedAddress.line1;
      if (capturedAddress?.line2) piiPatch.addressLine2 = capturedAddress.line2;
      if (capturedAddress?.city) piiPatch.city = capturedAddress.city;
      if (capturedAddress?.state) piiPatch.state = capturedAddress.state;
      if (capturedAddress?.zip) piiPatch.zipCode = capturedAddress.zip;
      if (Object.keys(piiPatch).length > 0) {
        apiRequest("PATCH", `/api/users/${loginData.user.id}`, piiPatch).catch((e) =>
          console.warn("[Array PII] Background profile update failed:", e)
        );
      }

      toast({
        title: "Welcome to ScoreShift!",
        description: "Your account has been created successfully.",
      });

      if (inviteCodeApplied || selectedPlan === "free") {
        window.location.href = "/portal";
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

  const allAiChecked = aiConsent1 && aiConsent2 && aiConsent3 && aiConsent4 && aiConsent5;

  return (
    <div className="min-h-screen signup-page" style={{ background: "#F1E8DA" }}>
      {/* Header */}
      <header
        className="border-b backdrop-blur sticky top-0 z-10"
        style={{
          background: "rgba(243,238,230,0.90)",
          borderColor: "rgba(42,39,37,0.12)",
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div style={{ height: 36, overflow: "hidden", display: "flex", alignItems: "center" }}>
              <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift" style={{ height: 130, width: "auto", objectFit: "contain" }} />
            </div>
          </Link>
          <div className="text-sm" style={{ color: "#5B5652" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium hover:underline" style={{ color: "#7C6BCB" }}>Sign in</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div
              className="absolute top-5 left-0 right-0 h-0.5 z-0"
              style={{ background: "rgba(42,39,37,0.12)" }}
            />
            <div
              className="absolute top-5 left-0 h-0.5 z-0 transition-all duration-500"
              style={{
                width: `${(step / (STEPS.length - 1)) * 100}%`,
                background: "#7C6BCB",
              }}
            />
            {STEPS.map(({ label }, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300"
                  style={
                    i < step
                      ? { background: "#7B8A7A", color: "#fff", boxShadow: "0 4px 12px rgba(123,138,122,0.3)" }
                      : i === step
                      ? { background: "#7C6BCB", color: "#fff", boxShadow: "0 4px 12px rgba(124,107,203,0.3)", transform: "scale(1.1)" }
                      : { background: "#F3EEE6", color: "#8B8480", border: "2px solid rgba(42,39,37,0.15)" }
                  }
                >
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                <span
                  className="text-xs mt-2 font-medium"
                  style={{ color: i <= step ? "#2A2725" : "#8B8480" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div
          className="rounded-2xl shadow-xl"
          style={{
            background: "#F3EEE6",
            border: "1px solid rgba(42,39,37,0.08)",
          }}
        >
          <div className="p-8">

            {/* Step 0: CROA Disclosure */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(124,107,203,0.12)" }}
                  >
                    <Shield className="h-5 w-5" style={{ color: "#7C6BCB" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: "#2A2725" }}>Consumer Credit File Rights</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#7C6BCB" }}>Required by Federal Law (15 U.S.C. §1679c)</p>
                  </div>
                </div>

                <div
                  className="text-xs px-3 py-1.5 rounded-md"
                  style={{
                    background: "rgba(124,107,203,0.06)",
                    border: "1px solid rgba(124,107,203,0.18)",
                    color: "#5B5652",
                  }}
                >
                  Step 1 of 5 — Please read the disclosure below before continuing.
                </div>

                <div
                  className="max-h-[300px] overflow-y-auto rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    background: "#E0D5C4",
                    border: "1px solid rgba(42,39,37,0.12)",
                    color: "#4A4541",
                  }}
                >
                  {CROA_TEXT}
                </div>

                <div
                  className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200"
                  style={
                    croaAccepted
                      ? { borderColor: "#7C6BCB", background: "rgba(124,107,203,0.06)" }
                      : { borderColor: "rgba(42,39,37,0.15)", background: "#E0D5C4" }
                  }
                >
                  <Checkbox
                    id="croaAccepted"
                    checked={croaAccepted}
                    onCheckedChange={(c) => handleCroaCheck(c as boolean)}
                    className="mt-0.5 shrink-0"
                  />
                  <label htmlFor="croaAccepted" className="cursor-pointer">
                    <span className="text-sm font-semibold block mb-1" style={{ color: "#2A2725" }}>
                      Acknowledge Disclosure <span className="text-red-500">*</span>
                    </span>
                    <span className="text-xs leading-relaxed" style={{ color: "#5B5652" }}>
                      I have received and read this Consumer Credit Rights Disclosure and understand my right to cancel within 3 business days, and I agree to the{" "}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#7C6BCB" }} onClick={(e) => e.stopPropagation()}>Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#7C6BCB" }} onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                <p className="text-xs" style={{ color: "#8B8480" }}>
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
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "rgba(228,162,111,0.15)" }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: "#E4A26F" }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: "#2A2725" }}>How We Use AI to Help You</h2>
                    <p className="text-sm font-medium mt-0.5" style={{ color: "#E4A26F" }}>Please review and acknowledge each item below</p>
                  </div>
                </div>

                <div
                  className="text-xs px-3 py-1.5 rounded-md"
                  style={{
                    background: "rgba(228,162,111,0.08)",
                    border: "1px solid rgba(228,162,111,0.22)",
                    color: "#5B5652",
                  }}
                >
                  Step 2 of 5 — All five items must be acknowledged to continue.
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "aiConsent1",
                      checked: aiConsent1,
                      onChange: (c: boolean) => { setAiConsent1(c); if (c) handleAllAiChecked(); },
                      node: null as React.ReactNode,
                      text: "I understand that ScoreShift uses artificial intelligence (AI) technology, including services from Anthropic and OpenAI, to read and analyze my credit report data including my name, address, account information, payment history, and other personal financial information.",
                    },
                    {
                      id: "aiConsent2",
                      checked: aiConsent2,
                      onChange: (c: boolean) => { setAiConsent2(c); if (c) handleAllAiChecked(); },
                      node: null as React.ReactNode,
                      text: "I understand my credit report data may be processed by third-party AI providers (Anthropic, PBC and OpenAI, LLC) to generate dispute letters and analysis. My data is not used to train AI models.",
                    },
                    {
                      id: "aiConsent3",
                      checked: aiConsent3,
                      onChange: (c: boolean) => { setAiConsent3(c); if (c) handleAllAiChecked(); },
                      node: null as React.ReactNode,
                      text: "I understand my information is stored securely in encrypted cloud databases. ScoreShift uses industry-standard security to protect my data.",
                    },
                    {
                      id: "aiConsent4",
                      checked: aiConsent4,
                      onChange: (c: boolean) => { setAiConsent4(c); if (c) handleAllAiChecked(); },
                      node: null as React.ReactNode,
                      text: "I understand I can request deletion of my personal data at any time by contacting support@scoreshiftapp.com, and that ScoreShift retains data for 2 years after account closure unless deletion is requested.",
                    },
                    {
                      id: "aiConsent5",
                      checked: aiConsent5,
                      onChange: (c: boolean) => { setAiConsent5(c); if (c) handleAllAiChecked(); },
                      text: "",
                      node: (
                        <>
                          I authorize ScoreShift and Array US, Inc. to access my credit report and credit score data from one or more consumer reporting agencies (Experian, Equifax, TransUnion) for the permissible purpose of providing credit repair, dispute preparation, and credit monitoring services as described in the{" "}
                          <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#7C6BCB" }} onClick={(e) => e.stopPropagation()}>Terms of Service</a>
                          {" "}and{" "}
                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline font-medium" style={{ color: "#7C6BCB" }} onClick={(e) => e.stopPropagation()}>Privacy Policy</a>.
                        </>
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200"
                      style={
                        item.checked
                          ? { borderColor: "#7C6BCB", background: "rgba(124,107,203,0.06)" }
                          : { borderColor: "rgba(42,39,37,0.15)", background: "#E0D5C4" }
                      }
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={(c) => item.onChange(c as boolean)}
                        className="mt-0.5 shrink-0"
                      />
                      <label htmlFor={item.id} className="cursor-pointer text-sm leading-relaxed" style={{ color: "#4A4541" }}>
                        {item.node ?? item.text}
                      </label>
                    </div>
                  ))}
                </div>

                {/* AI Notice Box */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    border: "1px solid rgba(228,162,111,0.30)",
                    background: "rgba(228,162,111,0.07)",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "#E4A26F" }}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#3A3734" }}>AI Analysis Notice</p>
                    <p className="text-xs leading-relaxed" style={{ color: "#5B5652" }}>
                      ScoreShift AI analyzes your credit information and generates dispute letters for your review. AI does not make final decisions — you retain full control over which items are disputed on your behalf.
                    </p>
                  </div>
                </div>

                {aiConsentAcceptedAt && (
                  <p className="text-xs" style={{ color: "#8B8480" }}>
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
                  <h2 className="text-2xl font-bold" style={{ color: "#2A2725" }}>Create Your Account</h2>
                  <p className="mt-1" style={{ color: "#5B5652" }}>Enter your name, email, and choose a password to get started.</p>
                </div>

                {arrayEnrolled && capturedArrayContact && (
                  (!firstName.trim() && capturedArrayContact.firstName) ||
                  (!lastName.trim() && capturedArrayContact.lastName) ||
                  (!email.trim() && capturedArrayContact.email)
                ) && (
                  <div
                    className="flex items-start gap-3 p-4 rounded-xl"
                    style={{
                      border: "1px solid rgba(124,107,203,0.28)",
                      background: "rgba(124,107,203,0.06)",
                    }}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "#7C6BCB" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold mb-1" style={{ color: "#3A3734" }}>
                        We can prefill these from your credit profile info.
                      </p>
                      <p className="text-xs mb-3 leading-relaxed" style={{ color: "#5B5652" }}>
                        Your credit profile contains contact information you entered during enrollment. You can apply it to any empty fields below — you can edit them afterwards.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (capturedArrayContact.firstName && !firstName.trim()) setFirstName(capturedArrayContact.firstName);
                          if (capturedArrayContact.lastName && !lastName.trim()) setLastName(capturedArrayContact.lastName);
                          if (capturedArrayContact.email && !email.trim()) setEmail(capturedArrayContact.email);
                        }}
                        className="text-xs font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
                        style={{ color: "#7C6BCB" }}
                      >
                        Apply prefill
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B8480" }} />
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="pl-9"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B8480" }} />
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className="pl-9"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B8480" }} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="pl-9"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B8480" }} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="pl-9 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "#8B8480" }}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#8B8480" }} />
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="pl-9 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                        style={{ color: "#8B8480" }}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    {[
                      { label: "At least 8 characters", ok: password.length >= 8 },
                      { label: "Passwords match", ok: password.length > 0 && password === confirmPassword },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: r.ok ? "#7B8A7A" : "rgba(42,39,37,0.12)" }}
                        >
                          {r.ok && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className="text-xs" style={{ color: r.ok ? "#6A7769" : "#8B8480" }}>{r.label}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ background: "#E0D5C4" }}
                  >
                    <Shield className="h-4 w-4 shrink-0" style={{ color: "#7C6BCB" }} />
                    <p className="text-xs" style={{ color: "#5B5652" }}>
                      Your information is encrypted and protected with enterprise-grade security.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Credit Profile */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#2A2725" }}>Connect Your Credit Profile</h2>
                  <p className="mt-1" style={{ color: "#5B5652" }}>Securely link your credit data so ScoreShift can identify issues and build your dispute plan.</p>
                </div>

                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: "2px solid rgba(124,107,203,0.22)",
                    background: "rgba(124,107,203,0.04)",
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(124,107,203,0.15)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg, #7C6BCB, #9F93D9)" }}
                      >
                        <CreditCard className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#2A2725" }}>Credit Profile Setup</p>
                        <p className="text-xs" style={{ color: "#5B5652" }}>Required to access your live credit data</p>
                      </div>
                    </div>
                    {arrayEnrolled ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#6A7769" }}>
                        <CheckCircle className="h-4 w-4" />
                        Connected
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: "#8B8480" }}>
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ background: "#E4A26F" }}
                        />
                        Awaiting
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Ref div always mounted so the effect can access it without timing races */}
                    <div ref={arrayEnrollRef} className="w-full min-h-[300px]">
                      {!enrollScriptReady && (
                        <div className="flex items-center justify-center py-8 gap-3">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                            style={{ borderColor: "#7C6BCB", borderTopColor: "transparent" }}
                          />
                          <span className="text-sm" style={{ color: "#5B5652" }}>Loading secure enrollment form...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-4 flex items-center gap-2 text-xs" style={{ color: "#8B8480" }}>
                    <Shield className="h-3.5 w-3.5 shrink-0" style={{ color: "#7B8A7A" }} />
                    <span>Your information is encrypted and secured by ScoreShift.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Choose Plan */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: "#2A2725" }}>Choose your plan</h2>
                  <p className="mt-1" style={{ color: "#5B5652" }}>Select the plan that best fits your credit repair goals.</p>
                </div>

                {inviteCodeApplied ? (
                  <div
                    className="rounded-xl p-6 space-y-4"
                    style={{
                      border: "2px solid #7B8A7A",
                      background: "rgba(123,138,122,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "#7B8A7A" }}
                      >
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg" style={{ color: "#2A2725" }}>Elite Plan — Full Access Unlocked</p>
                        <p className="text-sm" style={{ color: "#6A7769" }}>Invite code applied — no payment required</p>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-13">
                      {[
                        "Unlimited disputes",
                        "3-bureau credit monitoring",
                        "Full AI dispute letters",
                        "USPS certified mail tracking",
                        "Priority support",
                        "Credit report analysis",
                        "Business credit portal",
                      ].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#4A4541" }}>
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#7B8A7A" }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => { setInviteCodeApplied(false); setSelectedPlan("free"); setInviteCode(""); setShowInviteField(true); }}
                      className="text-xs hover:underline"
                      style={{ color: "#6A7769" }}
                    >
                      Remove invite code
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {PLANS.map((plan) => (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className="relative p-5 rounded-xl cursor-pointer transition-all duration-200"
                        style={
                          selectedPlan === plan.id
                            ? plan.id === "free"
                              ? { border: "2px solid #7B8A7A", background: "rgba(123,138,122,0.07)", boxShadow: "0 4px 16px rgba(123,138,122,0.15)" }
                              : { border: "2px solid #7C6BCB", background: "rgba(124,107,203,0.06)", boxShadow: "0 4px 16px rgba(124,107,203,0.14)" }
                            : { border: "2px solid rgba(42,39,37,0.13)", background: "#F3EEE6" }
                        }
                      >
                        {plan.badge && (
                          <Badge className={`absolute -top-3 left-4 ${plan.badgeColor} text-white text-xs px-2 py-0.5`}>
                            {plan.badge}
                          </Badge>
                        )}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
                              style={
                                selectedPlan === plan.id
                                  ? plan.id === "free"
                                    ? { borderColor: "#7B8A7A", background: "#7B8A7A" }
                                    : { borderColor: "#7C6BCB", background: "#7C6BCB" }
                                  : { borderColor: "rgba(42,39,37,0.20)" }
                              }
                            >
                              {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="font-bold text-lg" style={{ color: "#2A2725" }}>{plan.name}</span>
                          </div>
                          <div className="text-right">
                            <span
                              className="text-2xl font-bold"
                              style={{ color: plan.id === "free" ? "#6A7769" : "#2A2725" }}
                            >
                              {plan.price}
                            </span>
                            <span className="text-sm" style={{ color: "#8B8480" }}>{plan.interval}</span>
                          </div>
                        </div>
                        <ul className="space-y-1.5 ml-8">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#5B5652" }}>
                              <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: "#7B8A7A" }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {plan.note && (
                          <div className="ml-8 mt-2 flex items-center gap-1.5">
                            <div
                              className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                              style={{ background: "#E4A26F" }}
                            >
                              <span className="text-white text-[9px] font-bold">!</span>
                            </div>
                            <span className="text-xs font-medium" style={{ color: "#c47a42" }}>{plan.note}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Invite code section */}
                {!inviteCodeApplied && (
                  <div className="pt-2">
                    {!showInviteField ? (
                      <button
                        type="button"
                        onClick={() => setShowInviteField(true)}
                        className="text-sm underline underline-offset-2 transition-colors hover:opacity-70"
                        style={{ color: "#8B8480" }}
                      >
                        Have an invite code?
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium" style={{ color: "#4A4541" }}>Enter your invite code</p>
                        <div className="flex gap-2">
                          <Input
                            value={inviteCode}
                            onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setInviteCodeError(""); }}
                            placeholder="e.g. ARRAYTEST2026"
                            className="font-mono tracking-widest uppercase flex-1"
                            onKeyDown={(e) => { if (e.key === "Enter") applyInviteCode(); }}
                          />
                          <button
                            type="button"
                            onClick={applyInviteCode}
                            disabled={inviteCodeLoading || !inviteCode.trim()}
                            className="px-4 py-2 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: "#7C6BCB" }}
                          >
                            {inviteCodeLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : "Apply"}
                          </button>
                        </div>
                        {inviteCodeError && (
                          <p className="text-xs text-red-500">{inviteCodeError}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div
              className="flex items-center justify-between mt-8 pt-6"
              style={{ borderTop: "1px solid rgba(42,39,37,0.10)" }}
            >
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
                <button
                  onClick={handleNext}
                  disabled={
                    (step === 0 && !croaAccepted) ||
                    (step === 1 && !allAiChecked)
                  }
                  className="px-8 py-2 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  style={{ background: "#7C6BCB" }}
                  onMouseEnter={(e) => { if (!((step === 0 && !croaAccepted) || (step === 1 && !allAiChecked))) (e.currentTarget.style.background = "#8D80D3"); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.background = "#7C6BCB"); }}
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                  style={{ background: "#7C6BCB" }}
                  onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget.style.background = "#8D80D3"); }}
                  onMouseLeave={(e) => { (e.currentTarget.style.background = "#7C6BCB"); }}
                >
                  {isSubmitting ? (
                    <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Creating Account...</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Create My Account</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs" style={{ color: "#8B8480" }}>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" style={{ color: "#7B8A7A" }} /> Bank-level security
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" style={{ color: "#7B8A7A" }} /> FCRA Compliant
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-yellow-500" /> 4.9★ Rated
          </div>
        </div>
      </main>
    </div>
  );
}
