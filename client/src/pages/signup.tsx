import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import {
  ChevronRight, ChevronLeft, Eye, EyeOff,
  CheckCircle, Shield, CreditCard, Zap, Star, Sparkles, AlertCircle
} from "lucide-react";
import {
  trackSignupStarted, trackSignupCompleted,
  trackCreditPullStarted, trackCreditPullCompleted,
} from "@/lib/analytics";
import {
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import { extractArrayEventPII } from "@/lib/array-enrollment-event";

import entranceImg from "@assets/ChatGPT_Image_Jun_10,_2026,_05_51_10_PM_1781128284149.png";

/* ── CSS injected once ────────────────────────────────────────────────── */
const STYLE_ID = "ss-signup-styles";
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes ssSignupReflect {
      0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
      8%   { opacity: 1; }
      40%  { transform: translateX(220%) skewX(-18deg); opacity: 0; }
      100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
    }
    .ss-su-reflect {
      animation: ssSignupReflect 11s ease-in-out infinite;
      animation-delay: 3s;
    }
    .ss-su-input::placeholder { color: rgba(30,27,24,0.32); }
    .ss-su-input:focus {
      border-color: rgba(99,102,241,0.55) !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.12), inset 0 2px 4px rgba(255,255,255,0.40) !important;
      outline: none;
    }
    .ss-su-scroll::-webkit-scrollbar { width: 4px; }
    .ss-su-scroll::-webkit-scrollbar-track { background: transparent; }
    .ss-su-scroll::-webkit-scrollbar-thumb { background: rgba(30,27,24,0.14); border-radius: 999px; }
    .ss-su-step-btn:hover { background: rgba(30,27,24,0.06) !important; }
    @media (max-width: 600px) {
      .ss-su-outer { justify-content: center !important; padding: 20px 16px !important; }
      .ss-su-panel { max-width: 100% !important; max-height: calc(100vh - 40px) !important; border-radius: 24px !important; }
    }
  `;
  document.head.appendChild(s);
}

/* ── Constants ────────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Your Rights",    icon: Shield    },
  { label: "AI Consent",     icon: Sparkles  },
  { label: "Create Account", icon: CheckCircle },
  { label: "Credit Profile", icon: CreditCard },
  { label: "Your Plan",      icon: Star      },
];

const PLANS = [
  {
    id: "free", name: "Free Trial", price: "$0", interval: "/7 days",
    badge: "Start Free", badgeColor: "#4CAF82",
    features: ["Full access for 7 days","Credit score tracking","AI dispute letter preview","No credit card required"],
    note: "Upgrade required after 7 days",
  },
  {
    id: "basic", name: "Basic", price: "$49", interval: "/mo",
    badge: null, badgeColor: "",
    features: ["Up to 3 disputes/month","Credit score tracking","Basic AI analysis","Email support"],
    note: null,
  },
  {
    id: "premium", name: "Premium", price: "$99", interval: "/mo",
    badge: "Most Popular", badgeColor: "#7C6BCB",
    features: ["Unlimited disputes","USPS certified mail tracking","Full AI dispute letters","Priority support","Credit report analysis"],
    note: null,
  },
  {
    id: "professional", name: "Professional", price: "$149", interval: "/mo",
    badge: "Best Value", badgeColor: "#4A4541",
    features: ["Everything in Premium","Business credit portal","Dedicated advisor","White-glove service","Same-day dispute filing"],
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

/* ── Shared styles ────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px 18px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.72)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.45)",
  boxShadow: "inset 0 2px 6px rgba(255,255,255,0.50), 0 1px 0 rgba(255,255,255,0.30)",
  color: "#1E1B18",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(30,27,24,0.50)",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.13em",
  textTransform: "uppercase" as const,
  marginBottom: "10px",
};

/* ────────────────────────────────────────────────────────────────────── */
export default function Signup() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setCurrentUserId } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);

  const [enrollScriptReady, setEnrollScriptReady] = useState(false);
  const [arrayEnrolled, setArrayEnrolled]         = useState(false);
  const arrayEnrollRef = useRef<HTMLDivElement>(null);

  const [capturedArrayUserId,  setCapturedArrayUserId]  = useState<string | null>(null);
  const [capturedDob,          setCapturedDob]          = useState<string | null>(null);
  const [capturedSsnLast4,     setCapturedSsnLast4]     = useState<string | null>(null);
  const [capturedAddress, setCapturedAddress] = useState<{ line1: string; line2: string; city: string; state: string; zip: string } | null>(null);
  const [capturedArrayContact, setCapturedArrayContact] = useState<{ firstName?: string; lastName?: string; email?: string } | null>(null);

  const [croaAccepted,    setCroaAccepted]    = useState(false);
  const [croaAcceptedAt,  setCroaAcceptedAt]  = useState<string | null>(null);
  const [aiConsent1, setAiConsent1] = useState(false);
  const [aiConsent2, setAiConsent2] = useState(false);
  const [aiConsent3, setAiConsent3] = useState(false);
  const [aiConsent4, setAiConsent4] = useState(false);
  const [aiConsent5, setAiConsent5] = useState(false);
  const [aiConsentAcceptedAt, setAiConsentAcceptedAt] = useState<string | null>(null);

  const [firstName,       setFirstName]       = useState("");
  const [lastName,        setLastName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const firstNameRef = useRef(firstName);
  const lastNameRef  = useRef(lastName);
  const emailRef     = useRef(email);
  useEffect(() => { firstNameRef.current = firstName; }, [firstName]);
  useEffect(() => { lastNameRef.current  = lastName;  }, [lastName]);
  useEffect(() => { emailRef.current     = email;     }, [email]);

  const [selectedPlan, setSelectedPlan] = useState("free");
  const [inviteCode,           setInviteCode]           = useState("");
  const [inviteCodeApplied,    setInviteCodeApplied]    = useState(false);
  const [inviteCodeError,      setInviteCodeError]      = useState("");
  const [inviteCodeLoading,    setInviteCodeLoading]    = useState(false);
  const [showInviteField,      setShowInviteField]      = useState(false);

  /* Load enrollment script */
  useEffect(() => {
    const TAG = "array-account-enroll";
    if (document.querySelector(`script[data-array-enroll]`) || customElements.get(TAG)) {
      setEnrollScriptReady(true); return;
    }
    const script = document.createElement("script");
    script.src = `https://embed.array.io/cms/${TAG}.js?appKey=${ARRAY_SANDBOX_APP_KEY}`;
    script.dataset.arrayEnroll = "1";
    const settle = () => {
      customElements.whenDefined(TAG).then(() => setEnrollScriptReady(true)).catch(() => setEnrollScriptReady(true));
      setTimeout(() => setEnrollScriptReady(true), 3000);
    };
    script.onload = settle; script.onerror = settle;
    document.head.appendChild(script);
  }, []);

  /* Mount enrollment component on step 3 */
  useEffect(() => {
    if (step !== 3 || !arrayEnrollRef.current || !enrollScriptReady) return;
    trackCreditPullStarted();
    arrayEnrollRef.current.innerHTML = "";
    const el = document.createElement("array-account-enroll") as any;
    el.setAttribute("appKey",      ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("sandbox",     "true");
    el.setAttribute("apiUrl",      ARRAY_SANDBOX_API_URL);
    el.setAttribute("userToken",   ARRAY_SANDBOX_TOKENS.default);
    el.setAttribute("showQuickView", "true");
    const handleEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const pii = extractArrayEventPII(detail as Record<string, unknown>);
      if (pii.rawUserId) setCapturedArrayUserId(pii.rawUserId);
      if (pii.rawDob)    setCapturedDob(pii.rawDob);
      if (pii.ssnLast4)  setCapturedSsnLast4(pii.ssnLast4);
      if (pii.address)   setCapturedAddress(pii.address);
      if (pii.firstName || pii.lastName || pii.email) {
        setCapturedArrayContact({ firstName: pii.firstName ?? undefined, lastName: pii.lastName ?? undefined, email: pii.email ?? undefined });
      }
      if (!firstNameRef.current && pii.firstName) setFirstName(pii.firstName);
      if (!lastNameRef.current  && pii.lastName)  setLastName(pii.lastName);
      if (!emailRef.current     && pii.email)     setEmail(pii.email);
      trackCreditPullCompleted();
      setArrayEnrolled(true);
    };
    el.addEventListener("array-event", handleEvent);
    arrayEnrollRef.current.appendChild(el);
    return () => { if (arrayEnrollRef.current) arrayEnrollRef.current.innerHTML = ""; };
  }, [step, enrollScriptReady]);

  const handleCroaCheck = (checked: boolean) => {
    setCroaAccepted(checked);
    if (checked && !croaAcceptedAt) setCroaAcceptedAt(new Date().toISOString());
  };

  const allAiChecked = aiConsent1 && aiConsent2 && aiConsent3 && aiConsent4 && aiConsent5;

  const validateStep = () => {
    if (step === 0) {
      if (!croaAccepted) { toast({ title: "Disclosure Required", description: "Please acknowledge the Consumer Credit Rights Disclosure.", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 1) {
      if (!allAiChecked) { toast({ title: "AI Consent Required", description: "Please acknowledge all AI data processing disclosures.", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 2) {
      if (!firstName.trim()) { toast({ title: "First name is required", variant: "destructive" }); return false; }
      if (!lastName.trim())  { toast({ title: "Last name is required",  variant: "destructive" }); return false; }
      if (!email.trim())     { toast({ title: "Email address is required", variant: "destructive" }); return false; }
      if (!password)         { toast({ title: "Password is required",   variant: "destructive" }); return false; }
      if (password.length < 8) { toast({ title: "Password must be at least 8 characters", variant: "destructive" }); return false; }
      if (password !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return false; }
      return true;
    }
    if (step === 3) {
      if (!arrayEnrolled) { toast({ title: "Credit Profile Required", description: "Please complete the credit profile setup.", variant: "destructive" }); return false; }
      return true;
    }
    return true;
  };

  const applyInviteCode = async () => {
    if (!inviteCode.trim()) return;
    setInviteCodeLoading(true); setInviteCodeError("");
    try {
      const res = await fetch("/api/validate-invite-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: inviteCode.trim() }) });
      const data = await res.json();
      if (data.valid) { setInviteCodeApplied(true); setSelectedPlan("elite-invite"); setShowInviteField(false); }
      else { setInviteCodeError("Invalid code. Please check and try again."); }
    } catch { setInviteCodeError("Unable to validate code. Please try again."); }
    setInviteCodeLoading(false);
  };

  const handleNext = () => { if (!validateStep()) return; if (step === 0) trackSignupStarted(); setStep(s => s + 1); };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const createRes = await apiRequest("POST", "/api/users", {
        firstName, lastName, email, password,
        accessLevel: "CLIENT_VIEWER", passwordResetRequired: false,
        subscriptionPlan: inviteCodeApplied ? "ELITE" : selectedPlan === "free" ? "FREE" : selectedPlan.toUpperCase(),
        subscriptionTier: inviteCodeApplied ? "elite" : undefined,
        subscriptionStatus: inviteCodeApplied ? "ACTIVE" : selectedPlan === "free" ? "TRIALING" : null,
        croaAcceptedAt, aiConsentAcceptedAt, source: "signup",
        ...(capturedDob            ? { dateOfBirth: capturedDob }           : {}),
        ...(capturedSsnLast4       ? { ssnLast4: capturedSsnLast4 }         : {}),
        ...(capturedAddress?.line1 ? { addressLine1: capturedAddress.line1 }: {}),
        ...(capturedAddress?.line2 ? { addressLine2: capturedAddress.line2 }: {}),
        ...(capturedAddress?.city  ? { city: capturedAddress.city }         : {}),
        ...(capturedAddress?.state ? { state: capturedAddress.state }       : {}),
        ...(capturedAddress?.zip   ? { zipCode: capturedAddress.zip }       : {}),
      });
      if (!createRes.ok) { const err = await createRes.json(); throw new Error(err.message || "Failed to create account"); }

      const loginRes = await apiRequest("POST", "/api/auth/login", { email, password, loginType: "client" });
      if (!loginRes.ok) throw new Error("Account created but login failed");
      const loginData = await loginRes.json();
      localStorage.setItem("auth_token", loginData.token);
      localStorage.setItem("user_id",    loginData.user.id.toString());
      setCurrentUserId(loginData.user.id);

      if (arrayEnrolled) {
        try { await apiRequest("POST", "/api/array/enroll", { ...(capturedArrayUserId ? { arrayUserId: capturedArrayUserId } : {}) }); }
        catch (e) { console.warn("[Array] Failed to record enrollment after signup:", e); }
      }

      const piiPatch: Record<string, string> = {};
      if (capturedDob)            piiPatch.dateOfBirth  = capturedDob;
      if (capturedSsnLast4)       piiPatch.ssnLast4     = capturedSsnLast4;
      if (capturedAddress?.line1) piiPatch.addressLine1 = capturedAddress.line1;
      if (capturedAddress?.line2) piiPatch.addressLine2 = capturedAddress.line2;
      if (capturedAddress?.city)  piiPatch.city         = capturedAddress.city;
      if (capturedAddress?.state) piiPatch.state        = capturedAddress.state;
      if (capturedAddress?.zip)   piiPatch.zipCode      = capturedAddress.zip;
      if (Object.keys(piiPatch).length > 0) {
        apiRequest("PATCH", `/api/users/${loginData.user.id}`, piiPatch).catch((e) => console.warn("[Array PII] Background profile update failed:", e));
      }

      trackSignupCompleted();
      toast({ title: "Welcome to ScoreShift!", description: "Your account has been created successfully." });
      window.location.href = (inviteCodeApplied || selectedPlan === "free") ? "/portal" : "/billing";
    } catch (error: any) {
      toast({ title: "Signup Failed", description: error.message || "Something went wrong. Please try again.", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  /* ── Shared section heading ───────────────────────────────────────── */
  const SectionHead = ({ icon: Icon, title, sub, iconBg }: { icon: any; title: string; sub: string; iconBg: string }) => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} style={{ color: "#1E1B18" }} />
      </div>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1E1B18", letterSpacing: "-0.4px", marginBottom: 3 }}>{title}</h2>
        <p style={{ fontSize: 13, color: "rgba(30,27,24,0.55)", lineHeight: 1.4 }}>{sub}</p>
      </div>
    </div>
  );

  /* ── AI consent items ─────────────────────────────────────────────── */
  const AI_ITEMS = [
    { state: aiConsent1, set: setAiConsent1, title: "Credit Report Access", body: "I authorize ScoreShift's AI system to access and analyze my credit reports from Experian, Equifax, and TransUnion for the purpose of identifying inaccuracies and generating dispute letters." },
    { state: aiConsent2, set: setAiConsent2, title: "Automated Analysis",   body: "I understand ScoreShift uses AI to automatically analyze credit data, categorize negative items, and generate personalized dispute strategies." },
    { state: aiConsent3, set: setAiConsent3, title: "Data Processing",      body: "I consent to ScoreShift processing my personal financial data, including credit scores, account history, and payment records to provide credit repair services." },
    { state: aiConsent4, set: setAiConsent4, title: "Communication",        body: "I agree to receive automated notifications about my credit repair progress, dispute status updates, and service recommendations via email and in-app messages." },
    { state: aiConsent5, set: setAiConsent5, title: "Service Limitations",  body: "I understand that AI-generated dispute letters are tools to assist in the dispute process and ScoreShift cannot guarantee specific outcomes or credit score improvements." },
  ];

  /* ──────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ position: "fixed", inset: 0, fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

      {/* Full-bleed background */}
      <img
        src={entranceImg} alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
      />

      {/* Warm directional overlay — light on right (entrance+logo), gently darker on left */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, rgba(8,5,2,0.28) 0%, rgba(8,5,2,0.10) 48%, rgba(8,5,2,0.04) 100%)",
      }} />

      {/* Ambient indigo glow — sits behind the panel on the left */}
      <div style={{
        position: "absolute",
        top: "50%", left: "-80px",
        width: 600, height: 600,
        transform: "translateY(-50%)",
        background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Scroll container — panel aligned LEFT */}
      <div className="ss-su-outer" style={{
        position: "absolute", inset: 0,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "40px 0 40px 5.5vw",
      }}>

        {/* ═══════════════════════════════════════════
            GLASS PANEL
            ═══════════════════════════════════════════ */}
        <div className="ss-su-panel" style={{
          width: "100%",
          maxWidth: "500px",
          maxHeight: "calc(100vh - 80px)",
          background: "rgba(255,253,248,0.48)",
          backdropFilter: "blur(36px)",
          WebkitBackdropFilter: "blur(36px)",
          border: "1px solid rgba(255,255,255,0.75)",
          borderRadius: 36,
          boxShadow: "0 30px 90px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.12)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>

          {/* Reflection sweep */}
          <div className="ss-su-reflect" style={{
            position: "absolute", top: 0, left: 0,
            width: "38%", height: "100%",
            background: "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.09) 50%, transparent 100%)",
            pointerEvents: "none", zIndex: 10,
          }} />

          {/* Top-edge highlight */}
          <div style={{
            position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.80), transparent)",
            borderRadius: 100,
          }} />

          {/* ── Panel header ─────────────────────────────────────── */}
          <div style={{ padding: "32px 36px 0", flexShrink: 0 }}>
            {/* Logo row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
              <Link href="/">
                <img src="/images/scoreshift-wordmark-transparent.png" alt="ScoreShift"
                  style={{ height: 90, width: "auto", objectFit: "contain", display: "block", marginTop: -24, marginBottom: -24 }} />
              </Link>
              <Link href="/login">
                <span style={{ fontSize: 13, color: "rgba(30,27,24,0.45)", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(30,27,24,0.75)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(30,27,24,0.45)")}>
                  Already have an account? <span style={{ color: "#6366F1", fontWeight: 500 }}>Sign in</span>
                </span>
              </Link>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 26, fontWeight: 600, color: "#1E1B18", letterSpacing: "-0.6px", lineHeight: 1.15, marginBottom: 6 }}>
              Start your guided plan.
            </h1>
            <p style={{ fontSize: 14, color: "rgba(30,27,24,0.50)", lineHeight: 1.55, marginBottom: 24 }}>
              Create your account and choose the level of guidance that fits where you are today.
            </p>

            {/* Progress steps */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              {/* Track */}
              <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 2, background: "rgba(30,27,24,0.10)", zIndex: 0 }} />
              <div style={{
                position: "absolute", top: 18, left: 0, height: 2, zIndex: 0,
                width: `${(step / (STEPS.length - 1)) * 100}%`,
                background: "linear-gradient(90deg, #6366F1, #818CF8)",
                transition: "width 0.45s cubic-bezier(0.23,1,0.32,1)",
              }} />
              {STEPS.map(({ label }, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                    transition: "all 0.3s",
                    ...(i < step
                      ? { background: "rgba(99,102,241,0.18)", color: "#6366F1", border: "2px solid rgba(99,102,241,0.35)" }
                      : i === step
                      ? { background: "linear-gradient(135deg, #818CF8, #6366F1)", color: "#fff", boxShadow: "0 4px 14px rgba(99,102,241,0.35)", transform: "scale(1.08)" }
                      : { background: "rgba(255,255,255,0.55)", color: "rgba(30,27,24,0.35)", border: "1.5px solid rgba(30,27,24,0.12)" })
                  }}>
                    {i < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 10, marginTop: 5, fontWeight: 600, color: i <= step ? "#1E1B18" : "rgba(30,27,24,0.35)", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Scrollable step content ───────────────────────── */}
          <div className="ss-su-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 36px" }}>

            {/* ── Step 0: CROA Disclosure ── */}
            {step === 0 && (
              <div style={{ paddingBottom: 8 }}>
                <SectionHead icon={Shield} title="Consumer Credit File Rights" sub="Required by Federal Law (15 U.S.C. §1679c)" iconBg="rgba(99,102,241,0.10)" />

                <div style={{
                  fontSize: 11, padding: "8px 12px", borderRadius: 10, marginBottom: 16,
                  background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.16)", color: "rgba(30,27,24,0.55)"
                }}>
                  Step 1 of 5 — Please read the disclosure before continuing.
                </div>

                <div style={{
                  maxHeight: 220, overflowY: "auto", borderRadius: 14, padding: "14px 16px",
                  background: "rgba(255,255,255,0.55)", border: "1px solid rgba(30,27,24,0.10)",
                  fontSize: 12, lineHeight: 1.7, color: "#4A4541", whiteSpace: "pre-line", marginBottom: 16,
                }}>
                  {CROA_TEXT}
                </div>

                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 14,
                  border: `2px solid ${croaAccepted ? "rgba(99,102,241,0.35)" : "rgba(30,27,24,0.12)"}`,
                  background: croaAccepted ? "rgba(99,102,241,0.05)" : "rgba(255,255,255,0.45)",
                  transition: "all 0.2s",
                }}>
                  <Checkbox id="croa" checked={croaAccepted} onCheckedChange={(c) => handleCroaCheck(c as boolean)} style={{ marginTop: 2, flexShrink: 0 }} />
                  <label htmlFor="croa" style={{ cursor: "pointer" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E1B18", display: "block", marginBottom: 4 }}>
                      Acknowledge Disclosure <span style={{ color: "#ef4444" }}>*</span>
                    </span>
                    <span style={{ fontSize: 11.5, color: "rgba(30,27,24,0.55)", lineHeight: 1.55 }}>
                      I have read this disclosure, understand my 3-day cancellation right, and agree to the{" "}
                      <a href="/terms" target="_blank" style={{ color: "#6366F1", textDecoration: "underline" }} onClick={e => e.stopPropagation()}>Terms</a>
                      {" & "}
                      <a href="/privacy-policy" target="_blank" style={{ color: "#6366F1", textDecoration: "underline" }} onClick={e => e.stopPropagation()}>Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {croaAcceptedAt && (
                  <p style={{ fontSize: 11, color: "rgba(30,27,24,0.35)", marginTop: 10, fontFamily: "monospace" }}>
                    Acknowledged at {new Date(croaAcceptedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 1: AI Consent ── */}
            {step === 1 && (
              <div style={{ paddingBottom: 8 }}>
                <SectionHead icon={Sparkles} title="How We Use AI to Help You" sub="Please acknowledge all five items to continue." iconBg="rgba(228,162,111,0.14)" />

                <div style={{ fontSize: 11, padding: "8px 12px", borderRadius: 10, marginBottom: 16,
                  background: "rgba(228,162,111,0.08)", border: "1px solid rgba(228,162,111,0.22)", color: "rgba(30,27,24,0.55)" }}>
                  Step 2 of 5 — All five items must be acknowledged.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {AI_ITEMS.map(({ state, set, title, body }, idx) => (
                    <div key={idx} style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "12px 14px", borderRadius: 14,
                      border: `1.5px solid ${state ? "rgba(99,102,241,0.30)" : "rgba(30,27,24,0.10)"}`,
                      background: state ? "rgba(99,102,241,0.04)" : "rgba(255,255,255,0.45)",
                      transition: "all 0.2s",
                    }}>
                      <Checkbox id={`ai${idx}`} checked={state} onCheckedChange={(c) => { set(c as boolean); if (c && !aiConsentAcceptedAt && allAiChecked) setAiConsentAcceptedAt(new Date().toISOString()); }} style={{ marginTop: 2, flexShrink: 0 }} />
                      <label htmlFor={`ai${idx}`} style={{ cursor: "pointer" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#1E1B18", display: "block", marginBottom: 3 }}>{title}</span>
                        <span style={{ fontSize: 11.5, color: "rgba(30,27,24,0.52)", lineHeight: 1.55 }}>{body}</span>
                      </label>
                    </div>
                  ))}
                </div>

                {allAiChecked && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", borderRadius: 12,
                    background: "rgba(107,174,138,0.10)", border: "1px solid rgba(107,174,138,0.25)", color: "#4A8A6A", fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={14} /> All items acknowledged — you may continue.
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Create Account ── */}
            {step === 2 && (
              <div style={{ paddingBottom: 8 }}>
                <SectionHead icon={CheckCircle} title="Create Your Account" sub="Your information is encrypted and never sold." iconBg="rgba(107,174,138,0.12)" />

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Name row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>First Name</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="Jane" autoComplete="given-name" className="ss-su-input" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Last Name</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Doe" autoComplete="family-name" className="ss-su-input" style={inputStyle} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" autoComplete="email" className="ss-su-input" style={inputStyle} />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters" autoComplete="new-password" className="ss-su-input"
                        style={{ ...inputStyle, paddingRight: 52 }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                        position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "rgba(30,27,24,0.35)", padding: 0 }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password" autoComplete="new-password" className="ss-su-input"
                        style={{ ...inputStyle, paddingRight: 52 }} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                        position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "rgba(30,27,24,0.35)", padding: 0 }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && password !== confirmPassword && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, color: "#ef4444" }}>
                        <AlertCircle size={13} /> Passwords don't match
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Credit Profile ── */}
            {step === 3 && (
              <div style={{ paddingBottom: 8 }}>
                <SectionHead icon={CreditCard} title="Connect Your Credit Profile" sub="Pull your credit report to personalize your plan." iconBg="rgba(99,102,241,0.10)" />

                {!enrollScriptReady ? (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(30,27,24,0.45)", fontSize: 13 }}>
                    <div style={{ width: 24, height: 24, border: "2.5px solid rgba(30,27,24,0.15)", borderTopColor: "#6366F1",
                      borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
                    Loading credit profile setup…
                  </div>
                ) : (
                  <div ref={arrayEnrollRef} style={{ borderRadius: 16, overflow: "hidden", minHeight: 200 }} />
                )}

                {arrayEnrolled && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", borderRadius: 12,
                    background: "rgba(107,174,138,0.10)", border: "1px solid rgba(107,174,138,0.25)", color: "#4A8A6A", fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle size={14} /> Credit profile connected — you may continue.
                  </div>
                )}

                <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14,
                  background: "rgba(255,255,255,0.45)", border: "1px solid rgba(30,27,24,0.08)", fontSize: 12, color: "rgba(30,27,24,0.50)" }}>
                  <strong style={{ color: "rgba(30,27,24,0.65)" }}>Optional step.</strong> You can skip and connect your credit profile after signing up.
                </div>
              </div>
            )}

            {/* ── Step 4: Choose Plan ── */}
            {step === 4 && (
              <div style={{ paddingBottom: 8 }}>
                <SectionHead icon={Star} title="Choose Your Plan" sub="Select the level of guidance that fits your goals." iconBg="rgba(228,162,111,0.12)" />

                {inviteCodeApplied ? (
                  <div style={{ padding: "20px", borderRadius: 16, textAlign: "center",
                    background: "rgba(107,174,138,0.10)", border: "2px solid rgba(107,174,138,0.30)" }}>
                    <CheckCircle size={28} style={{ color: "#4A8A6A", margin: "0 auto 10px" }} />
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1E1B18", marginBottom: 4 }}>Elite Access Unlocked</div>
                    <div style={{ fontSize: 12, color: "rgba(30,27,24,0.55)" }}>Your invite code has been applied.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {PLANS.map(plan => (
                      <button key={plan.id} type="button" onClick={() => setSelectedPlan(plan.id)} style={{
                        width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 16,
                        border: `2px solid ${selectedPlan === plan.id ? "rgba(99,102,241,0.40)" : "rgba(30,27,24,0.10)"}`,
                        background: selectedPlan === plan.id ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.45)",
                        cursor: "pointer", transition: "all 0.2s",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%",
                              border: `2px solid ${selectedPlan === plan.id ? "#6366F1" : "rgba(30,27,24,0.20)"}`,
                              background: selectedPlan === plan.id ? "#6366F1" : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {selectedPlan === plan.id && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1E1B18" }}>{plan.name}</span>
                            {plan.badge && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: plan.badgeColor, color: "#fff" }}>
                                {plan.badge}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#1E1B18" }}>
                            {plan.price}<span style={{ fontSize: 11, fontWeight: 400, color: "rgba(30,27,24,0.45)" }}>{plan.interval}</span>
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginLeft: 28 }}>
                          {plan.features.map((f, i) => (
                            <span key={i} style={{ fontSize: 11.5, color: "rgba(30,27,24,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ color: "#6366F1", fontSize: 9 }}>●</span> {f}
                            </span>
                          ))}
                        </div>
                        {plan.note && (
                          <p style={{ marginTop: 6, marginLeft: 28, fontSize: 11, color: "#E4A26F", fontWeight: 500 }}>⚠ {plan.note}</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Invite code */}
                {!inviteCodeApplied && (
                  <div style={{ marginTop: 14 }}>
                    {!showInviteField ? (
                      <button type="button" onClick={() => setShowInviteField(true)}
                        style={{ background: "none", border: "none", padding: 0, fontSize: 13, color: "rgba(30,27,24,0.40)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
                        Have an invite code?
                      </button>
                    ) : (
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#1E1B18", marginBottom: 8 }}>Enter your invite code</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={inviteCode} onChange={e => { setInviteCode(e.target.value.toUpperCase()); setInviteCodeError(""); }}
                            placeholder="e.g. ARRAYTEST2026" className="ss-su-input"
                            style={{ ...inputStyle, fontFamily: "monospace", letterSpacing: "0.12em", flex: 1 }}
                            onKeyDown={e => { if (e.key === "Enter") applyInviteCode(); }} />
                          <button type="button" onClick={applyInviteCode} disabled={inviteCodeLoading || !inviteCode.trim()}
                            style={{ padding: "0 20px", borderRadius: 14, background: "linear-gradient(135deg, #818CF8, #6366F1)", color: "#fff",
                              border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: inviteCodeLoading || !inviteCode.trim() ? 0.5 : 1 }}>
                            {inviteCodeLoading ? "…" : "Apply"}
                          </button>
                        </div>
                        {inviteCodeError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>{inviteCodeError}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>{/* end scrollable */}

          {/* ── Navigation ───────────────────────────────────────── */}
          <div style={{
            padding: "20px 36px 28px", flexShrink: 0,
            borderTop: "1px solid rgba(30,27,24,0.08)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            {/* Back */}
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="ss-su-step-btn" style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "11px 20px", borderRadius: 100,
                background: "rgba(255,255,255,0.55)", border: "1px solid rgba(30,27,24,0.14)",
                color: "#1E1B18", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                <ChevronLeft size={15} /> Back
              </button>
            ) : (
              <Link href="/">
                <button type="button" className="ss-su-step-btn" style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "11px 20px", borderRadius: 100,
                  background: "rgba(255,255,255,0.55)", border: "1px solid rgba(30,27,24,0.14)",
                  color: "#1E1B18", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}>
                  <ChevronLeft size={15} /> Back to Home
                </button>
              </Link>
            )}

            {/* Forward / Submit */}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={handleNext}
                disabled={(step === 0 && !croaAccepted) || (step === 1 && !allAiChecked)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "12px 28px", borderRadius: 100, border: "none",
                  background: (step === 0 && !croaAccepted) || (step === 1 && !allAiChecked)
                    ? "rgba(99,102,241,0.30)"
                    : "linear-gradient(135deg, #818CF8 0%, #6366F1 38%, #4338CA 100%)",
                  color: "#FFFCF5", fontSize: 14, fontWeight: 600,
                  cursor: (step === 0 && !croaAccepted) || (step === 1 && !allAiChecked) ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 24px rgba(67,56,202,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => { if (!((step === 0 && !croaAccepted) || (step === 1 && !allAiChecked))) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(67,56,202,0.40), inset 0 1px 0 rgba(255,255,255,0.20)"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(67,56,202,0.30), inset 0 1px 0 rgba(255,255,255,0.20)"; }}
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isSubmitting}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "12px 28px", borderRadius: 100, border: "none",
                  background: isSubmitting ? "rgba(99,102,241,0.30)" : "linear-gradient(135deg, #818CF8 0%, #6366F1 38%, #4338CA 100%)",
                  color: "#FFFCF5", fontSize: 14, fontWeight: 600,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: "0 6px 24px rgba(67,56,202,0.30), inset 0 1px 0 rgba(255,255,255,0.20)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                {isSubmitting ? (
                  <><div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Creating Account…</>
                ) : (
                  <><Zap size={14} /> Create My Account</>
                )}
              </button>
            )}
          </div>

          {/* ── Trust line ───────────────────────────────────────── */}
          <p style={{
            textAlign: "center", paddingBottom: 20, paddingTop: 0,
            color: "rgba(30,27,24,0.28)", fontSize: 11, letterSpacing: "0.05em",
          }}>
            🔒 Secure access to your ScoreShift dashboard.
          </p>

        </div>{/* end glass panel */}
      </div>

      {/* ── Bottom-right back link ───────────────────────────────────────── */}
      <Link href="/">
        <div style={{
          position: "fixed", bottom: 28, right: 40,
          color: "rgba(255,252,245,0.35)", fontSize: 11,
          letterSpacing: "0.10em", textTransform: "uppercase", fontWeight: 600,
          cursor: "pointer", transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,252,245,0.65)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,252,245,0.35)")}>
          ← Back to ScoreShift
        </div>
      </Link>

    </div>
  );
}
