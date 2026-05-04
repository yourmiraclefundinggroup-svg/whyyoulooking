import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { USPSTracking } from "@/components/usps-tracking";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { SecureChat } from "@/components/secure-chat";
import { PasswordReset } from "@/components/password-reset";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatRelativeDate, getIssueTypeColor, getDisputeStatusColor } from "@/lib/utils";
import {
  useArrayScript,
  ARRAY_SANDBOX_APP_KEY,
  ARRAY_SANDBOX_API_URL,
  ARRAY_SANDBOX_TOKENS,
} from "@/hooks/use-array-script";
import { useFeatureAccess, FEATURES } from "@/hooks/use-feature-access";
import { ScoreHero } from "@/components/dashboard/score-hero";
import {
  X, Clock, Search, AlertCircle, CheckCircle, Gavel, Check, FileText, Bot,
  Eye, CreditCard, Calendar, Wallet, FileWarning, Mail, ChevronRight,
  Sparkles, BarChart3, Shield, Zap, TrendingUp, Lock, ArrowRight,
  MessageSquare, Settings, LayoutDashboard, Activity,
} from "lucide-react";
import type { CreditIssue, Dispute, CreditReportUpload, CreditReportAccount, CreditReportInquiry, CreditReportCollection, DisputeLetterNew, DisputeCalendarEvent, CreditScoreHistory } from "@shared/schema";
import { LogOut } from "lucide-react";
import { Link } from "wouter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/* ── Array web component helpers ─────────────────────────────────────────── */
function ArrayWebComponent({
  tag,
  userToken,
  scriptReady,
  attrs = {},
  className = "w-full min-h-[200px]",
}: {
  tag: string;
  userToken?: string;
  scriptReady?: boolean;
  attrs?: Record<string, string>;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (scriptReady === false) return;
    containerRef.current.innerHTML = "";

    const el = document.createElement(tag);
    el.setAttribute("appKey", ARRAY_SANDBOX_APP_KEY);
    el.setAttribute("apiUrl", ARRAY_SANDBOX_API_URL);
    el.setAttribute("sandbox", "true");
    if (userToken) el.setAttribute("userToken", userToken);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));

    containerRef.current.appendChild(el);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tag, userToken, scriptReady, JSON.stringify(attrs)]);

  if (scriptReady === false) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent ss-spinner" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading credit data...</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
}

function ArrayCard({
  title,
  description,
  children,
  icon: Icon,
  badge,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1E35] overflow-hidden shadow-sm">
      <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0">
            {badge ?? "Powered by Array"}
          </span>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ── Issue helpers ────────────────────────────────────────────────────────── */
function getIssueIcon(type: string) {
  switch (type) {
    case "COLLECTION":
    case "CHARGE_OFF":
      return <X className="h-4 w-4 text-white" />;
    case "LATE_PAYMENT":
      return <Clock className="h-4 w-4 text-white" />;
    case "INQUIRY":
      return <Search className="h-4 w-4 text-white" />;
    default:
      return <AlertCircle className="h-4 w-4 text-white" />;
  }
}

function IssueTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; icon: JSX.Element; bgColor: string; textColor: string; borderColor: string }> = {
    COLLECTION: { label: "Collection", icon: <X className="h-3.5 w-3.5" />, bgColor: "bg-red-600 dark:bg-red-700", textColor: "text-white", borderColor: "border-red-700 dark:border-red-600" },
    CHARGE_OFF: { label: "Charge-Off", icon: <AlertCircle className="h-3.5 w-3.5" />, bgColor: "bg-rose-600 dark:bg-rose-700", textColor: "text-white", borderColor: "border-rose-700 dark:border-rose-600" },
    LATE_PAYMENT: { label: "Late Payment", icon: <Clock className="h-3.5 w-3.5" />, bgColor: "bg-orange-500 dark:bg-orange-600", textColor: "text-white", borderColor: "border-orange-600 dark:border-orange-500" },
    INQUIRY: { label: "Inquiry", icon: <Search className="h-3.5 w-3.5" />, bgColor: "bg-amber-500 dark:bg-amber-600", textColor: "text-white", borderColor: "border-amber-600 dark:border-amber-500" },
  };
  const { label, icon, bgColor, textColor, borderColor } = config[type] || { label: type, icon: <AlertCircle className="h-3.5 w-3.5" />, bgColor: "bg-muted", textColor: "text-white", borderColor: "border-border" };
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} border ${borderColor} shadow-sm`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

/* ── Progress Tab ─────────────────────────────────────────────────────────── */
function ClientProgressTab() {
  const { data: progress, isLoading } = useQuery<{
    hasData: boolean;
    startingScore?: number;
    currentScore?: number;
    scoreDelta?: number;
    totalUploads?: number;
    lettersSent?: number;
    lettersRemoved?: number;
    lettersDraft?: number;
    nextDisputeDate?: string | null;
    nextDisputeRound?: string | null;
    latestUploadDate?: string;
    latestBureau?: string;
  }>({ queryKey: ["/api/client/progress-summary"] });

  const { data: scoreHistory = [], isError: scoreHistoryError } = useQuery<CreditScoreHistory[]>({
    queryKey: ["/api/client/score-history"],
  });

  const scoreChartData = scoreHistory
    .slice()
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((entry) => ({
      date: new Date(entry.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }),
      score: entry.score,
    }));

  const handlePrint = () => {
    const el = document.getElementById("client-progress-printable");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>My Credit Repair Progress</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111;max-width:700px;margin:0 auto}h1{border-bottom:3px solid #2563eb;padding-bottom:8px;color:#1e3a8a}.stat{display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 20px;margin:6px 4px;text-align:center;min-width:110px}.stat-val{font-size:28px;font-weight:bold;color:#2563eb}.stat-lbl{font-size:11px;color:#6b7280;margin-top:2px}@media print{body{padding:20px}}</style></head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading) return <Card><CardContent className="p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-muted rounded w-1/3" /><div className="h-24 bg-muted rounded-xl" /></div></CardContent></Card>;

  if (!progress?.hasData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Progress Data Yet</h3>
          <p className="text-muted-foreground text-sm">Your progress report will appear here once your admin uploads your credit report.</p>
        </CardContent>
      </Card>
    );
  }

  const scoreDelta = progress.scoreDelta ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-amber-500" />
            My Credit Repair Progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on {progress.totalUploads} credit report{(progress.totalUploads ?? 0) > 1 ? "s" : ""}
            {progress.latestBureau ? ` · ${progress.latestBureau}` : ""}
          </p>
        </div>
        <Button onClick={handlePrint} size="sm" variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div id="client-progress-printable">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-foreground">{progress.startingScore ?? "—"}</div><div className="text-xs text-muted-foreground mt-1">Starting Score</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{progress.currentScore ?? "—"}</div><div className="text-xs text-muted-foreground mt-1">Current Score</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className={`text-3xl font-bold ${scoreDelta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{scoreDelta >= 0 ? "+" : ""}{scoreDelta}</div><div className="text-xs text-muted-foreground mt-1">Score Change</div></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><div className="text-3xl font-bold text-green-600 dark:text-green-400">{progress.lettersRemoved ?? 0}</div><div className="text-xs text-muted-foreground mt-1">Items Removed</div></CardContent></Card>
        </div>

        <Card className="mt-4">
          <CardHeader><CardTitle className="text-base text-foreground">Dispute Letter Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{progress.lettersSent ?? 0}</div><div className="text-xs text-muted-foreground mt-1">Sent to Bureaus</div></div>
              <div><div className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.lettersRemoved ?? 0}</div><div className="text-xs text-muted-foreground mt-1">Confirmed Removed</div></div>
              <div><div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progress.lettersDraft ?? 0}</div><div className="text-xs text-muted-foreground mt-1">In Progress</div></div>
            </div>
          </CardContent>
        </Card>

        {progress.nextDisputeDate && (
          <Card className="mt-4">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Next Dispute Round {progress.nextDisputeRound ?? ""}</div>
                <div className="text-xs text-muted-foreground">
                  Scheduled for {new Date(progress.nextDisputeDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scoreHistoryError ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-destructive text-center">
                Unable to load score history. Please try refreshing the page.
              </p>
            </div>
          ) : scoreChartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Score snapshots are recorded automatically each time your credit report is processed.
              </p>
            </div>
          ) : scoreChartData.length === 1 ? (
            <div className="flex items-center gap-6 py-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{scoreChartData[0].score}</div>
                <div className="text-xs text-muted-foreground mt-1">Score on {scoreChartData[0].date}</div>
              </div>
              <p className="text-sm text-muted-foreground">Upload additional reports over time to see your score trajectory.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {scoreChartData[scoreChartData.length - 1].score}
                  </div>
                  <div className="text-xs text-muted-foreground">Latest Score</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${scoreChartData[scoreChartData.length - 1].score - scoreChartData[0].score >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {scoreChartData[scoreChartData.length - 1].score - scoreChartData[0].score >= 0 ? "+" : ""}
                    {scoreChartData[scoreChartData.length - 1].score - scoreChartData[0].score} pts
                  </div>
                  <div className="text-xs text-muted-foreground">Total Change</div>
                </div>
                <div className="ml-auto text-xs text-muted-foreground">
                  {scoreChartData.length} data point{scoreChartData.length !== 1 ? "s" : ""}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={scoreChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [value, "Score"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--amber-500, 245 158 11))"
                    strokeWidth={2}
                    dot={{ fill: "#d97706", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: "#d97706" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Credit Reports Tab ───────────────────────────────────────────────────── */
function ClientCreditReportsTab({ userId }: { userId: number }) {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const { data: uploads = [], isLoading: uploadsLoading } = useQuery<CreditReportUpload[]>({
    queryKey: ["/api/client/credit-report-uploads"],
  });

  const { data: reportDetails } = useQuery<{
    upload: CreditReportUpload;
    accounts: CreditReportAccount[];
    inquiries: CreditReportInquiry[];
    collections: CreditReportCollection[];
    publicRecords: any[];
    disputeItems: any[];
    letters: DisputeLetterNew[];
  }>({
    queryKey: ["/api/client/credit-report-uploads", selectedReportId],
    enabled: !!selectedReportId,
  });

  const { data: calendarEvents = [] } = useQuery<DisputeCalendarEvent[]>({
    queryKey: ["/api/client/dispute-calendar"],
  });

  if (uploadsLoading) {
    return <Card><CardContent className="p-6"><div className="animate-pulse space-y-4"><div className="h-6 bg-muted rounded w-1/4" /><div className="h-20 bg-muted rounded-xl" /></div></CardContent></Card>;
  }

  if (uploads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Credit Reports Yet</h3>
          <p className="text-muted-foreground text-sm">Your admin will upload your credit report data. Once available, you'll be able to view your accounts, disputes, and progress here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <CreditCard className="h-5 w-5 mr-2 text-amber-500" />
            Your Credit Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                onClick={() => setSelectedReportId(upload.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:-translate-y-0.5 ${
                  selectedReportId === upload.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                    : "border-slate-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-600/50"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      upload.bureau === "EXPERIAN" ? "bg-blue-100 dark:bg-blue-900/50" :
                      upload.bureau === "EQUIFAX" ? "bg-red-100 dark:bg-red-900/50" : "bg-purple-100 dark:bg-purple-900/50"
                    }`}>
                      <CreditCard className={`h-5 w-5 ${
                        upload.bureau === "EXPERIAN" ? "text-blue-600" :
                        upload.bureau === "EQUIFAX" ? "text-red-600" : "text-purple-600"
                      }`} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-foreground">{upload.bureau}</p>
                      <p className="text-xs text-muted-foreground">{new Date(upload.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 transition-transform ${selectedReportId === upload.id ? "rotate-90 text-amber-500" : "text-muted-foreground"}`} />
                </div>
                {upload.creditScore && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/10">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className={`text-lg font-bold ${(upload.creditScore || 0) >= 700 ? "text-green-600" : (upload.creditScore || 0) >= 600 ? "text-yellow-600" : "text-red-600"}`}>
                      {upload.creditScore}
                    </span>
                  </div>
                )}
                <Badge className={`mt-2 text-xs ${upload.parseStatus === "succeeded" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : upload.parseStatus === "processing" ? "bg-yellow-100 text-yellow-700" : "bg-muted text-muted-foreground"}`}>
                  {upload.parseStatus}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedReportId && reportDetails && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Accounts", value: reportDetails.accounts.length, icon: Wallet, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/50" },
              { label: "Inquiries", value: reportDetails.inquiries.length, icon: Search, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/50" },
              { label: "Collections", value: reportDetails.collections.length, icon: FileWarning, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/50" },
              { label: "Letters", value: reportDetails.letters.length, icon: Mail, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/50" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-xl font-bold text-foreground">{value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {reportDetails.accounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center"><Wallet className="h-5 w-5 mr-2 text-purple-600" />Accounts ({reportDetails.accounts.length})</CardTitle></CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {reportDetails.accounts.map((account) => (
                    <AccordionItem key={account.id} value={`account-${account.id}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center">
                            <span className="font-medium">{account.creditorName}</span>
                            <Badge className="ml-2" variant={account.status === "Open" ? "default" : "secondary"}>{account.status || "Unknown"}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatCurrency(account.balance || 0)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 py-2 text-sm">
                          <div><span className="text-muted-foreground">Account Type:</span><span className="ml-2 font-medium">{account.accountType}</span></div>
                          <div><span className="text-muted-foreground">Credit Limit:</span><span className="ml-2 font-medium">{formatCurrency(account.creditLimit || 0)}</span></div>
                          <div><span className="text-muted-foreground">Payment Status:</span><span className="ml-2 font-medium">{account.paymentStatus}</span></div>
                          <div><span className="text-muted-foreground">Opened:</span><span className="ml-2 font-medium">{account.dateOpened ? new Date(account.dateOpened).toLocaleDateString() : "N/A"}</span></div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {reportDetails.inquiries.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center"><Search className="h-5 w-5 mr-2 text-orange-600" />Credit Inquiries ({reportDetails.inquiries.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{inquiry.creditorName}</p>
                        <p className="text-sm text-muted-foreground">{inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <Badge variant={inquiry.inquiryType === "hard" ? "destructive" : "secondary"}>{inquiry.inquiryType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportDetails.collections.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center"><FileWarning className="h-5 w-5 mr-2 text-red-600" />Collections ({reportDetails.collections.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.collections.map((collection) => (
                    <div key={collection.id} className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-200">{collection.agencyName}</p>
                          <p className="text-sm text-red-700 dark:text-red-300">Original: {collection.originalCreditor}</p>
                        </div>
                        <span className="text-lg font-bold text-red-600">{formatCurrency(collection.amount || 0)}</span>
                      </div>
                      <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Reported: {collection.dateReported ? new Date(collection.dateReported).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {reportDetails.letters.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center"><Mail className="h-5 w-5 mr-2 text-amber-500" />Dispute Letters ({reportDetails.letters.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportDetails.letters.map((letter) => (
                    <div key={letter.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground">{letter.letterType} — {letter.bureau}</p>
                          <p className="text-sm text-muted-foreground">Created: {new Date(letter.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge className={
                          letter.status === "approved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                          letter.status === "sent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                          letter.status === "draft" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                          "bg-muted text-muted-foreground"
                        }>
                          {letter.status}
                        </Badge>
                      </div>
                      {letter.downloadUrl && (
                        <div className="flex items-center text-sm text-muted-foreground mt-2">
                          <Mail className="h-4 w-4 mr-1" />
                          Download available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {calendarEvents.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center"><Calendar className="h-5 w-5 mr-2 text-amber-500" />Dispute Timeline</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calendarEvents.map((event) => (
                    <div key={event.id} className="flex items-center p-3 border border-slate-200 dark:border-white/10 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mr-4 ${event.status === "completed" ? "bg-green-500" : event.status === "sent" ? "bg-amber-500" : event.status === "overdue" ? "bg-red-500" : "bg-yellow-500"}`} />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Round {event.round}</p>
                        <p className="text-sm text-muted-foreground">{event.scheduledSendDate ? `Scheduled: ${new Date(event.scheduledSendDate).toLocaleDateString()}` : ""}</p>
                      </div>
                      <Badge variant="outline">{event.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Static score placeholder for non-enrolled users ─────────────────────── */
const STATIC_SCORE_DATA = {
  scores: { experian: 621, equifax: 618, transunion: 625 },
  scoreChange: { experian: 12, equifax: 8, transunion: 11 },
  scoreHistory: [582, 591, 603, 610, 618, 621],
  lastUpdated: "Sample data",
};

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function CreditRepair() {
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, canCreateDisputes, isClientViewer, logout } = useUserContext();

  const userId = user?.id || 1;

  const { loaded: scriptReady } = useArrayScript();
  const userToken = ARRAY_SANDBOX_TOKENS.default;
  const featureAccess = useFeatureAccess();

  const { data: creditIssues = [], isLoading: issuesLoading } = useQuery<CreditIssue[]>({
    queryKey: ["/api/credit-issues", userId],
  });

  const { data: disputes = [], isLoading: disputesLoading } = useQuery<Dispute[]>({
    queryKey: ["/api/disputes", userId],
  });

  const { data: arrayEnrollment } = useQuery<{ enrolled: boolean; arrayUserId: string | null; productCodes: string[] }>({
    queryKey: ["/api/array/enrollment"],
    enabled: !!user,
    retry: false,
  });

  const isEnrolled = arrayEnrollment?.enrolled ?? false;

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CreditIssue> }) => {
      const response = await apiRequest("PATCH", `/api/credit-issues/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/credit-issues", userId] });
      toast({ title: "Success", description: "Issue updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update issue", variant: "destructive" });
    },
  });

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
  };

  const handleMarkResolved = (issue: CreditIssue) => {
    updateIssueMutation.mutate({ id: issue.id, updates: { status: "RESOLVED" } });
  };

  const activeIssues = creditIssues.filter((i) => i.status === "ACTIVE");
  const disputedIssues = creditIssues.filter((i) => i.status === "DISPUTED");
  const resolvedIssues = creditIssues.filter((i) => i.status === "RESOLVED");
  const pendingDisputes = disputes.filter((d) => d.status === "PENDING" || d.status === "SENT" || d.status === "DELIVERED");
  const resolvedDisputes = disputes.filter((d) => d.status === "RESOLVED");

  if (issuesLoading || disputesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subtle animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-amber-50/20 to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300" />
      </div>

      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 relative space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">ScoreShift</div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Credit Repair</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isClientViewer ? "Viewing the work being done on your credit file." : "Dispute negative items and track your credit repair progress."}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-muted-foreground hidden sm:block">{user.firstName} {user.lastName}</span>}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>

        {isClientViewer && (
          <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <Eye className="h-4 w-4 mt-0.5 shrink-0" />
              <span><strong>Client View:</strong> You can view dispute progress and tracking but cannot create new disputes.</span>
            </p>
          </div>
        )}

        {/* ── Live Credit Score Section ────────────────────────────────────── */}
        {isEnrolled ? (
          <div className="space-y-4">
            {/* Bureau badges row */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["Experian", "Equifax", "TransUnion"] as const).map((b) => {
                const colors: Record<string, string> = { Experian: "bg-[#0062FF]", Equifax: "bg-[#E12726]", TransUnion: "bg-[#662D8C]" };
                return (
                  <span key={b} className={`text-[11px] font-bold px-2.5 py-1 rounded-full text-white ${colors[b]}`}>
                    ✓ {b}
                  </span>
                );
              })}
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Credit Data
              </Badge>
            </div>

            {/* Credit Overview — full width */}
            <ArrayCard title="Credit Overview" description="Live 3-bureau credit scores and account summary" icon={Sparkles} badge="Live · 3 Bureaus">
              <ArrayWebComponent tag="array-credit-overview" userToken={userToken} scriptReady={scriptReady} className="w-full min-h-[220px]" />
            </ArrayCard>

            {/* Score Tracker + Debt Analysis — side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ArrayCard title="Score Tracker" description="Experian · Equifax · TransUnion score trends" icon={BarChart3} badge="All 3 Bureaus">
                <ArrayWebComponent tag="array-credit-score" userToken={userToken} scriptReady={scriptReady} attrs={{ bureau: "all", scoreTracker: "true" }} className="w-full min-h-[200px]" />
              </ArrayCard>
              <ArrayCard title="Debt Analysis" description="Credit utilization and balance breakdown" icon={Zap} badge="Live">
                <ArrayWebComponent tag="array-credit-debt-analysis" userToken={userToken} scriptReady={scriptReady} className="w-full min-h-[200px]" />
              </ArrayCard>
            </div>
          </div>
        ) : (
          /* Not enrolled — static score card with activate CTA */
          <ScoreHero data={STATIC_SCORE_DATA} isEnrolled={false} scriptReady={scriptReady} />
        )}

        {/* ── Stats row ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Active Issues", value: activeIssues.length, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30", icon: AlertCircle },
            { label: "Disputed", value: disputedIssues.length, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: Gavel },
            { label: "Resolved", value: resolvedIssues.length, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", icon: CheckCircle },
            { label: "Pending", value: pendingDisputes.length, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30", icon: Clock },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1 w-full bg-muted/60">
            <TabsTrigger value="issues" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <AlertCircle className="h-3.5 w-3.5" />Issues
            </TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <Gavel className="h-3.5 w-3.5" />Disputes
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <Shield className="h-3.5 w-3.5" />Monitor
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <Bot className="h-3.5 w-3.5" />Tools
            </TabsTrigger>
            <TabsTrigger value="credit-reports" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <FileText className="h-3.5 w-3.5" />Reports
            </TabsTrigger>
            <TabsTrigger value="progress" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <Activity className="h-3.5 w-3.5" />Progress
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <MessageSquare className="h-3.5 w-3.5" />Chat
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs px-3 py-2 flex items-center gap-1.5 flex-1 sm:flex-none">
              <Settings className="h-3.5 w-3.5" />Settings
            </TabsTrigger>
          </TabsList>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base sm:text-lg">
                  <span>Active Credit Issues</span>
                  <Badge variant="destructive" className="text-xs">{activeIssues.length} Issues</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {activeIssues.map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.07 }}
                      className={`flex flex-col sm:flex-row sm:items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${getIssueTypeColor(issue.type)}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
                          {getIssueIcon(issue.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground truncate">{issue.title}</h4>
                              <p className="text-sm text-muted-foreground mt-0.5">{issue.description}</p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                                <span>Creditor: {issue.creditor}</span>
                                {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                                <span>Impact: {issue.impact} pts</span>
                              </div>
                            </div>
                            <IssueTypeBadge type={issue.type} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        {canCreateDisputes ? (
                          <>
                            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-1 sm:flex-none text-xs" onClick={() => handleDispute(issue)}>Dispute</Button>
                            <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-xs" onClick={() => handleMarkResolved(issue)} disabled={updateIssueMutation.isPending}>Resolved</Button>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <Eye className="h-3.5 w-3.5" /><span>View Only</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {activeIssues.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-base font-medium text-foreground mb-1">No Active Issues</h3>
                      <p className="text-sm text-muted-foreground">Great! No active credit issues to address.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {resolvedIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Resolved Issues</span>
                    <Badge variant="secondary">{resolvedIssues.length} Resolved</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resolvedIssues.map((issue) => (
                      <div key={issue.id} className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800/50">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-green-900 dark:text-green-100">{issue.title}</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">{issue.description}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-green-600 dark:text-green-400">
                            <span>Creditor: {issue.creditor}</span>
                            {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                            <span>Was impacting: {Math.abs(issue.impact)} pts</span>
                          </div>
                        </div>
                        <Badge className="bg-green-600 shrink-0">Resolved</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Disputes Tab */}
          <TabsContent value="disputes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Pending Disputes</span>
                  <Badge variant="secondary">{pendingDisputes.length} Pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingDisputes.map((dispute) => {
                    const issue = creditIssues.find((i) => i.id === dispute.issueId);
                    return (
                      <div key={dispute.id} className="space-y-3">
                        <div className={`flex items-start gap-4 p-4 rounded-xl border ${getDisputeStatusColor(dispute.status)}`}>
                          <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse mt-2 shrink-0" />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-foreground">{dispute.bureau} – {issue?.title}</h4>
                            <p className="text-sm text-muted-foreground">{issue?.description}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                              <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                              <span>Expected: {formatRelativeDate(dispute.expectedResponse)}</span>
                              <span>Bureau: {dispute.bureau}</span>
                            </div>
                          </div>
                          <Badge className="bg-amber-500 text-black shrink-0">{dispute.status}</Badge>
                        </div>
                        <USPSTracking dispute={dispute} />
                      </div>
                    );
                  })}
                  {pendingDisputes.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-4 opacity-40" />
                      <h3 className="text-base font-medium text-foreground mb-1">No Pending Disputes</h3>
                      <p className="text-sm text-muted-foreground">No disputes currently pending with credit bureaus.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {resolvedDisputes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>Resolved Disputes</span>
                    <Badge variant="secondary">{resolvedDisputes.length} Resolved</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resolvedDisputes.map((dispute) => {
                      const issue = creditIssues.find((i) => i.id === dispute.issueId);
                      return (
                        <div key={dispute.id} className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800/50">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-green-900 dark:text-green-100">{dispute.bureau} – {issue?.title}</h4>
                            <p className="text-sm text-green-700 dark:text-green-300">Successfully resolved and removed from credit report</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-green-600 dark:text-green-400">
                              <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                              <span>Resolved: {formatRelativeDate(dispute.actualResponse || dispute.dateSent)}</span>
                            </div>
                          </div>
                          <Badge className="bg-green-600 shrink-0">Resolved</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Monitor Tab — tier-gated Array credit alerts + identity protect */}
          <TabsContent value="monitoring" className="space-y-4">
            {!isEnrolled ? (
              /* Not enrolled — activate CTA */
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Credit Monitoring Not Active</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                    Activate credit monitoring to see real-time alerts and identity protection across all 3 bureaus.
                  </p>
                  <Link href="/credit-monitoring">
                    <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2">
                      <Shield className="h-4 w-4" />
                      Activate Monitoring
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : featureAccess.canAccess(FEATURES.CREDIT_ALERTS) ? (
              /* Enrolled + Pro or Elite — show credit alerts (+ identity protect if elite) */
              <>
                <ArrayCard title="Credit Alerts" description="Real-time notifications for changes across all 3 bureaus" icon={Shield} badge="Live Monitoring">
                  <ArrayWebComponent tag="array-credit-alerts" userToken={userToken} scriptReady={scriptReady} className="w-full min-h-[300px]" />
                </ArrayCard>

                {featureAccess.canAccess(FEATURES.IDENTITY_PROTECT) ? (
                  <ArrayCard title="Identity Protection" description="Monitor for fraud, data breaches, and identity theft" icon={Lock} badge="Elite · Identity Shield">
                    <ArrayWebComponent tag="array-identity-protect" userToken={userToken} scriptReady={scriptReady} className="w-full min-h-[300px]" />
                  </ArrayCard>
                ) : (
                  /* Pro users — identity protect locked behind Elite */
                  <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shadow-sm">
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Lock className="h-6 w-6 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-white">Identity Protection</h3>
                          <Badge className="bg-amber-500 text-black text-[10px] font-bold px-2">Elite</Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          Full dark-web monitoring, data breach alerts, and identity theft protection. Available on the Elite plan.
                        </p>
                      </div>
                      <Link href="/pricing">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5 shrink-0">
                          Upgrade to Elite <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Enrolled but Starter (no credit_alerts) or no plan — upgrade to Pro */
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Shield className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-white">Credit Alerts</h3>
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] font-bold px-2">Pro+</Badge>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Get instant alerts when your credit score changes, new accounts are opened, or inquiries are made — across all 3 bureaus.
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mb-6">
                    {["Score change alerts", "New account notifications", "Inquiry alerts", "Balance change tracking"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle className="h-4 w-4 text-amber-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/pricing">
                    <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2">
                      Upgrade to Pro — $79/mo <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tools Tab — AI analysis + Array score simulator */}
          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* AI Credit Analysis */}
              <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1E35] overflow-hidden shadow-sm">
                <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">AI Credit Analysis</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Personalized dispute strategy powered by AI</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <AICreditAnalysis userId={userId} />
                </div>
              </div>

              {/* Array Score Simulator */}
              {isEnrolled ? (
                <ArrayCard title="Score Simulator" description="See how credit actions could impact your score" icon={TrendingUp} badge="Interactive">
                  <ArrayWebComponent tag="array-credit-score-simulator" userToken={userToken} scriptReady={scriptReady} className="w-full min-h-[300px]" />
                </ArrayCard>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#0F1E35] overflow-hidden shadow-sm flex flex-col">
                  <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Score Simulator</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Interactive credit score modeling</p>
                      </div>
                      <Lock className="h-4 w-4 text-slate-400 ml-auto" />
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex items-center justify-center text-center">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Activate credit monitoring to use the interactive score simulator.</p>
                      <Link href="/credit-monitoring">
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5">
                          Activate <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="credit-reports" className="space-y-4">
            <ClientCreditReportsTab userId={userId} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <ClientProgressTab />
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <SecureChat userId={userId} userType="client" />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-5 w-5 text-amber-500" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PasswordReset />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!isClientViewer && (
          <DisputeLetterModal
            open={disputeModalOpen}
            onOpenChange={setDisputeModalOpen}
            issue={selectedIssue}
          />
        )}
      </div>
    </>
  );
}
