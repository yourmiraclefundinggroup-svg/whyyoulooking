/**
 * White-Label Onboarding Wizard
 * Route: /white-label/onboarding
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUserContext } from "@/hooks/use-user-context";

const STEP_LABELS: Record<string, { label: string; description: string; estimatedTime: string }> = {
  account_created: {
    label: "Account Created",
    description: "Your white-label account has been created automatically.",
    estimatedTime: "Done",
  },
  branding_setup: {
    label: "Set Up Branding",
    description: "Upload your logo and set your brand colors.",
    estimatedTime: "5 min",
  },
  first_client_added: {
    label: "Add Your First Client",
    description: "Add a client to your portal so you can start working their case.",
    estimatedTime: "3 min",
  },
  first_report_uploaded: {
    label: "Upload First Credit Report",
    description: "Upload a credit report to trigger Scoreshifting and see results.",
    estimatedTime: "5 min",
  },
  first_letter_generated: {
    label: "Generate First Dispute Letter",
    description: "Generate a dispute letter using our AI-powered dispute engine.",
    estimatedTime: "2 min",
  },
  stripe_connected: {
    label: "Connect Stripe",
    description: "Connect your Stripe account to accept payments from clients.",
    estimatedTime: "5 min",
  },
  onboarding_complete: {
    label: "Onboarding Complete",
    description: "All steps done — your white-label portal is fully operational.",
    estimatedTime: "Done",
  },
};

const STEP_ORDER = [
  "account_created",
  "branding_setup",
  "first_client_added",
  "first_report_uploaded",
  "first_letter_generated",
  "stripe_connected",
  "onboarding_complete",
];

function estimateTimeRemaining(steps: any[]): string {
  const pending = steps.filter((s) => s.stepStatus === "pending");
  if (pending.length === 0) return "Complete!";
  const mins = pending.length * 4;
  if (mins < 60) return `~${mins} min`;
  return `~${Math.round(mins / 60)}h`;
}

export default function WhiteLabelOnboarding() {
  const { user } = useUserContext();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<any>(null);
  const [brandName, setBrandName] = useState("");
  const [initializing, setInitializing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = () => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    fetch("/api/white-label/status", { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleInitialize = async () => {
    if (!brandName.trim()) return;
    setInitializing(true);
    setError(null);
    try {
      const res = await fetch("/api/white-label/initialize", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ brandName }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Reload status
      const s = await fetch("/api/white-label/status", {
        headers: authHeaders(),
      }).then((r) => r.json());
      setStatus(s);
    } catch (e: any) {
      setError(e.message || "Failed to initialize account");
    } finally {
      setInitializing(false);
    }
  };

  const handleCompleteStep = async (stepName: string) => {
    try {
      await fetch(`/api/white-label/step/${stepName}`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const s = await fetch("/api/white-label/status", {
        headers: authHeaders(),
      }).then((r) => r.json());
      setStatus(s);
    } catch (e) {
      console.error("Failed to complete step:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // No account yet — show initialization form
  if (!status?.hasAccount) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 mb-4">
              <span className="text-3xl">🏷️</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Start Your White-Label Portal</h1>
            <p className="text-slate-400 text-sm mt-2">
              Power your credit repair business with ScoreShift. Your brand, your clients, full automation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Your Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. ClearPath Credit Solutions"
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleInitialize}
              disabled={initializing || !brandName.trim()}
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold transition-colors"
            >
              {initializing ? "Setting up..." : "Launch My Portal →"}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    );
  }

  const { account, steps } = status;
  const progress = account?.setupProgress ?? 0;
  const orderedSteps = STEP_ORDER.map((name) => {
    const step = (steps as any[]).find((s: any) => s.stepName === name);
    return step ?? { stepName: name, stepStatus: "pending", autoCompleted: false };
  });
  const currentStep = orderedSteps.find((s: any) => s.stepStatus === "pending");

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">
            {account?.brandName || "Your Portal"} Setup
          </h1>
          <p className="text-slate-400 mt-2">
            Complete these steps to go live with your white-label portal.
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-slate-400">Setup Progress</span>
            <span className="text-amber-400 font-semibold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-3 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">
            Estimated time remaining: {estimateTimeRemaining(orderedSteps)}
          </p>
        </div>

        {/* Steps list */}
        <div className="space-y-3">
          {orderedSteps.map((step: any, idx: number) => {
            const meta = STEP_LABELS[step.stepName] ?? { label: step.stepName, description: "", estimatedTime: "" };
            const isComplete = step.stepStatus === "completed";
            const isCurrent = step.stepName === currentStep?.stepName;
            const isPending = step.stepStatus === "pending" && !isCurrent;

            return (
              <div
                key={step.stepName}
                className={`rounded-xl border p-4 transition-all ${
                  isComplete
                    ? "border-emerald-700/40 bg-emerald-900/10"
                    : isCurrent
                    ? "border-amber-500/60 bg-amber-900/10"
                    : "border-slate-700 bg-slate-900/40 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step icon */}
                  <div
                    className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
                      isComplete
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : isCurrent
                        ? "bg-amber-500/20 border-amber-500 text-amber-400"
                        : "bg-slate-800 border-slate-600 text-slate-500"
                    }`}
                  >
                    {isComplete ? "✓" : idx + 1}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${isComplete ? "text-emerald-300" : isCurrent ? "text-white" : "text-slate-400"}`}>
                        {meta.label}
                      </span>
                      {step.autoCompleted && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
                          Auto-completed
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/40 text-amber-400 border border-amber-700/40">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{meta.description}</p>
                  </div>

                  {/* Action or time */}
                  <div className="flex-shrink-0 text-right">
                    {isComplete ? (
                      <span className="text-xs text-slate-500">Done</span>
                    ) : isCurrent ? (
                      <button
                        onClick={() => handleCompleteStep(step.stepName)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
                      >
                        Mark Done
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600">{meta.estimatedTime}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* All complete */}
        {progress === 100 && (
          <div className="mt-8 rounded-xl bg-emerald-900/20 border border-emerald-700/40 p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-bold text-emerald-300 text-lg">Your portal is live!</h3>
            <p className="text-slate-400 text-sm mt-1 mb-4">
              Start adding clients and running credit repair cases under your brand.
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="px-6 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
            >
              Go to Admin Portal →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
