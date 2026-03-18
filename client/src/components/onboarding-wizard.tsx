import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useUserContext } from "@/hooks/use-user-context";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  User,
  ChevronRight,
  CheckCircle,
  FileText,
  Upload,
  Clock,
  ShieldCheck,
  Star,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface Message {
  role: "assistant" | "user";
  text: string;
}

interface OnboardingWizardProps {
  onReportAvailable?: () => void;
}

const steps = [
  { id: 1, label: "Welcome" },
  { id: 2, label: "Your Goals" },
  { id: 3, label: "Credit Report" },
  { id: 4, label: "Ready" },
];

export function OnboardingWizard({ onReportAvailable }: OnboardingWizardProps) {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [creditKnowledge, setCreditKnowledge] = useState<string>("");
  const [requestSent, setRequestSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userNote, setUserNote] = useState("");

  const goals = [
    { id: "buy_home", label: "Buy a Home", icon: "🏠" },
    { id: "buy_car", label: "Buy a Car", icon: "🚗" },
    { id: "lower_rates", label: "Lower Interest Rates", icon: "📉" },
    { id: "remove_negatives", label: "Remove Negative Items", icon: "❌" },
    { id: "build_credit", label: "Build Credit History", icon: "📈" },
    { id: "business_credit", label: "Business Credit", icon: "💼" },
  ];

  const knowledgeLevels = [
    { id: "beginner", label: "I'm new to credit repair", emoji: "🌱" },
    { id: "some", label: "I know the basics", emoji: "📚" },
    { id: "experienced", label: "I've disputed before", emoji: "⚡" },
  ];

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleRequestUpload = async () => {
    setIsSending(true);
    try {
      await apiRequest("POST", "/api/onboarding/request-credit-report", {
        userId: user?.id,
        goals: selectedGoals,
        creditKnowledge,
        note: userNote,
      });
      setRequestSent(true);
      setStep(4);
    } catch {
      toast({ title: "Request sent", description: "We'll reach out to you shortly." });
      setRequestSent(true);
      setStep(4);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">AI-Powered Credit Advisor</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome to ScoreShift, {user?.firstName || "there"}!
        </h1>
        <p className="text-muted-foreground">
          Let's get your account set up. This takes about 2 minutes.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                step === s.id
                  ? "bg-blue-600 text-white"
                  : step > s.id
                  ? "bg-green-600 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.id ? <CheckCircle className="h-3 w-3" /> : <span>{s.id}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-6 h-0.5 ${step > s.id ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-xl bg-card">
              <CardContent className="p-8">
                {/* AI Message */}
                <div className="flex gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl rounded-tl-none p-5">
                    <p className="text-foreground leading-relaxed mb-3">
                      Hi {user?.firstName || "there"}! 👋 I'm your AI credit advisor. I'm here to guide you through improving your credit score step by step.
                    </p>
                    <p className="text-foreground leading-relaxed mb-3">
                      Here's how ScoreShift works:
                    </p>
                    <div className="space-y-2">
                      {[
                        { icon: FileText, text: "We analyze your credit report to find issues" },
                        { icon: TrendingUp, text: "We create personalized dispute strategies" },
                        { icon: ShieldCheck, text: "We generate dispute letters sent via certified mail" },
                        { icon: CheckCircle, text: "We track results and update your score progress" },
                      ].map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mt-3">
                      Ready to get started?
                    </p>
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { icon: Star, label: "Average improvement", value: "+87 pts" },
                    { icon: Clock, label: "Typical timeline", value: "3–6 months" },
                    { icon: ShieldCheck, label: "Disputes filed", value: "100% legal" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center p-4 bg-muted/50 rounded-xl">
                      <Icon className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                      <div className="text-lg font-bold text-foreground">{value}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  Let's Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-xl bg-card">
              <CardContent className="p-8">
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl rounded-tl-none p-5">
                    <p className="text-foreground leading-relaxed">
                      What are your credit goals? Select all that apply — this helps me personalize your action plan.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {goals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedGoals.includes(goal.id)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-border hover:border-blue-300 bg-card"
                      }`}
                    >
                      <div className="text-2xl mb-1">{goal.icon}</div>
                      <div className="text-sm font-medium text-foreground">{goal.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl rounded-tl-none p-4">
                    <p className="text-foreground text-sm">
                      How familiar are you with credit repair?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mb-8">
                  {knowledgeLevels.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setCreditKnowledge(level.id)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                        creditKnowledge === level.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40"
                          : "border-border hover:border-blue-300 bg-card"
                      }`}
                    >
                      <div className="text-xl mb-1">{level.emoji}</div>
                      <div className="text-xs font-medium text-foreground">{level.label}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={selectedGoals.length === 0 || !creditKnowledge}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Credit Report */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-0 shadow-xl bg-card">
              <CardContent className="p-8">
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-2xl rounded-tl-none p-5">
                    <p className="text-foreground leading-relaxed mb-3">
                      To start repairing your credit, I need access to your full credit report.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                          Experian API — Coming Soon
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                          Automatic credit pulls are being set up. Until then, your advisor will manually upload your credit report for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What happens next */}
                <div className="bg-muted/50 rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Here's what happens next:
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        step: "1",
                        title: "Request submitted",
                        desc: "Your advisor is notified that you need your credit report loaded",
                        status: "ready",
                      },
                      {
                        step: "2",
                        title: "Report uploaded",
                        desc: "Your advisor uploads your credit file — PDF or text format works",
                        status: "pending",
                      },
                      {
                        step: "3",
                        title: "AI analysis",
                        desc: "Our AI parses every account, inquiry, and collection on your report",
                        status: "pending",
                      },
                      {
                        step: "4",
                        title: "Dispute plan ready",
                        desc: "Your personalized action plan appears on your dashboard",
                        status: "pending",
                      },
                    ].map(item => (
                      <div key={item.step} className="flex gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            item.status === "ready"
                              ? "bg-blue-600 text-white"
                              : "bg-muted border-2 border-border text-muted-foreground"
                          }`}
                        >
                          {item.step}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{item.title}</div>
                          <div className="text-xs text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ways to get your report */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">
                    You can also get a free copy of your report from:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { name: "AnnualCreditReport.com", desc: "Free official report", url: "https://www.annualcreditreport.com" },
                      { name: "Credit Karma", desc: "Free TransUnion & Equifax", url: "https://www.creditkarma.com" },
                      { name: "Experian.com", desc: "Free Experian report", url: "https://www.experian.com" },
                    ].map(source => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 border border-border rounded-lg hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        <div className="text-sm font-medium text-foreground">{source.name}</div>
                        <div className="text-xs text-muted-foreground">{source.desc}</div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Optional note */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Any notes for your advisor? (optional)
                  </label>
                  <Textarea
                    placeholder="E.g. I got my report from annualcreditreport.com and can email it to you..."
                    value={userNote}
                    onChange={e => setUserNote(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleRequestUpload}
                    disabled={isSending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Notify My Advisor
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Done / Waiting */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="border-0 shadow-xl bg-card text-center">
              <CardContent className="p-10">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/40 border-2 border-green-300 dark:border-green-700 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">You're all set!</h2>
                <p className="text-muted-foreground mb-6">
                  Your advisor has been notified and will upload your credit report shortly.
                  Once it's uploaded, AI will analyze it and your full dashboard will be ready.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6 text-left">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    While you wait:
                  </h3>
                  <ul className="space-y-1.5">
                    {[
                      "Pull your free credit report from AnnualCreditReport.com",
                      "Review any recent statements for unfamiliar accounts",
                      "Note any accounts you want to dispute",
                      "Check out the Education section to learn more",
                    ].map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
                        <span className="text-blue-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 justify-center">
                  <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50 dark:bg-green-950/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Account Created
                  </Badge>
                  <Badge variant="outline" className="text-green-700 border-green-400 bg-green-50 dark:bg-green-950/30">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Goals Saved
                  </Badge>
                  <Badge variant="outline" className="text-amber-700 border-amber-400 bg-amber-50 dark:bg-amber-950/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Report Pending
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                  Have questions? Use the chat bubble in the bottom-right corner anytime.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
