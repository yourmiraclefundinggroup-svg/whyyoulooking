import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Key, Clock, ArrowRight, CheckCircle, AlertTriangle, Zap } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

// ─── Types ──────────────────────────────────────────────────────────────────

interface DenialReason {
  reason: string;
  explanation: string;
  fixStatus: "Already Working On This" | "Action Needed" | "Quick Fix";
  action: string;
  timeToFix: string;
}

interface DenialResult {
  reasons: DenialReason[];
  summary: string;
}

// ─── Sample Denial Letter ───────────────────────────────────────────────────

const SAMPLE_DENIAL_LETTER = `Dear Applicant,

Thank you for your recent application for a $25,000 personal loan. After careful review, we regret to inform you that we are unable to approve your application at this time.

The primary reasons for this decision are as follows:

1. Derogatory marks on your credit report — Your credit file contains two collection accounts totaling $3,847 from medical bills dated 2022, as well as a charge-off from First National Bank reported in January 2023.

2. High credit utilization ratio — Your revolving credit utilization is currently at 84%, significantly above the recommended threshold of 30%.

3. Insufficient credit history length — The average age of your accounts is 2 years and 3 months. Lenders typically prefer a minimum average account age of 4 years.

4. Recent hard inquiries — Your credit report shows 5 hard inquiries within the past 12 months, indicating recent credit-seeking behavior which may suggest financial stress.

Your credit score at the time of this decision was 594 (Equifax).

You have the right to obtain a free copy of your credit report from the consumer reporting agency used in this decision. Please contact Equifax at 1-800-685-1111 or www.equifax.com.

This decision was based in whole or in part on information obtained from a consumer reporting agency. The agency did not make this decision and is unable to explain why it was made.

Sincerely,
Lending Decisions Department
Metro Financial Services`;

// ─── Fix Status Badge ────────────────────────────────────────────────────────

function FixStatusBadge({ status }: { status: DenialReason["fixStatus"] }) {
  if (status === "Already Working On This") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Already Working On This
      </span>
    );
  }
  if (status === "Action Needed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <AlertTriangle className="w-3 h-3" />
        Action Needed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <Zap className="w-3 h-3" />
      Quick Fix
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DenialDecoder() {
  const [denialText, setDenialText] = useState("");

  const mutation = useMutation({
    mutationFn: async (denialLetterText: string) => {
      const response = await fetch("/api/ai/denial-decoder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denialLetterText }),
      });
      if (!response.ok) throw new Error("Failed to analyze letter");
      return response.json() as Promise<DenialResult>;
    },
  });

  const handleDecode = () => {
    if (denialText.trim().length < 20) return;
    mutation.mutate(denialText.trim());
  };

  const handleLoadSample = () => {
    setDenialText(SAMPLE_DENIAL_LETTER);
    mutation.reset();
  };

  const result = mutation.data as DenialResult | undefined;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-black text-sm tracking-tight">SS</span>
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">ScoreShift</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-slate-600 border-slate-300 hover:border-amber-400 hover:text-amber-600 transition-colors">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Hero Section ── */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
              <Key className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Denial Decoder
            </h1>
          </div>
          <p className="text-slate-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Paste your loan denial letter below. Our AI tells you exactly what to fix and how long it will take.
          </p>
        </div>

        {/* ── Input Card ── */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-700">Your Denial Letter</CardTitle>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-amber-600 hover:text-amber-700 hover:underline font-medium transition-colors"
              >
                Load sample denial letter
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={denialText}
              onChange={(e) => {
                setDenialText(e.target.value);
                if (mutation.isError || mutation.isSuccess) mutation.reset();
              }}
              placeholder="Paste your denial letter here... (e.g., 'Dear Applicant, we regret to inform you that your application for...')"
              className="min-h-[180px] text-sm leading-relaxed resize-y border-slate-300 focus:border-amber-400 focus:ring-amber-400 placeholder:text-slate-400"
              rows={6}
            />
            <Button
              onClick={handleDecode}
              disabled={mutation.isPending || denialText.trim().length < 20}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-base py-5 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing your denial letter...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Decode My Denial
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Error State ── */}
        {mutation.isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-5 pb-5">
              <p className="text-red-700 text-sm font-medium text-center">
                {(mutation.error as Error)?.message ?? "Something went wrong. Please try again."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Results Section ── */}
        {mutation.isSuccess && result && (
          <div className="space-y-5">

            {/* Section heading */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">Analysis Results</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Reason cards */}
            {result.reasons.map((reason, idx) => (
              <Card key={idx} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base font-bold text-slate-900 leading-snug">
                      {reason.reason}
                    </CardTitle>
                    <div className="shrink-0 mt-0.5">
                      <FixStatusBadge status={reason.fixStatus} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 text-sm leading-relaxed">{reason.explanation}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">What to do</p>
                      <p className="text-sm text-slate-800 leading-relaxed">{reason.action}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Time to fix</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <p className="text-sm text-slate-800 font-medium">{reason.timeToFix}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Summary box */}
            {result.summary && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 mb-0.5">Bottom Line</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{result.summary}</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base py-5 shadow-sm hover:shadow-md transition-all group">
                  Start Fixing My Credit Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-8 mt-4">
        <p className="text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} ScoreShift &mdash; Credit Repair Technology
        </p>
      </footer>
    </div>
  );
}
