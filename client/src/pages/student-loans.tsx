import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { StudentLoan, LoanNegotiation } from "@shared/schema";
import {
  GraduationCap, DollarSign, TrendingDown, FileText, MessageSquare,
  Calculator, CheckCircle, PlusCircle, Zap, Brain, AlertCircle,
} from "lucide-react";

const addLoanSchema = z.object({
  servicerName: z.string().min(1, "Servicer name is required"),
  loanBalance: z.string().min(1, "Balance is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  monthlyPayment: z.string().min(1, "Monthly payment is required"),
  repaymentPlan: z.string().min(1, "Repayment plan is required"),
  loanType: z.enum(["FEDERAL", "PRIVATE"]),
  originalBalance: z.string().optional(),
  graduationDate: z.string().optional(),
});
type AddLoanForm = z.infer<typeof addLoanSchema>;

const TABS = ["Portfolio", "Optimization", "Negotiations", "Documents"] as const;
type Tab = typeof TABS[number];

export default function StudentLoans() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addLoanOpen, setAddLoanOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Portfolio");

  const { data: studentLoans = [] } = useQuery<StudentLoan[]>({ queryKey: ["/api/student-loans"] });
  const { data: loanNegotiations = [] } = useQuery<LoanNegotiation[]>({ queryKey: ["/api/loan-negotiations"] });

  const addLoanForm = useForm<AddLoanForm>({
    resolver: zodResolver(addLoanSchema),
    defaultValues: {
      servicerName: "", loanBalance: "", interestRate: "", monthlyPayment: "",
      repaymentPlan: "", loanType: "FEDERAL", originalBalance: "", graduationDate: "",
    },
  });

  const addLoanMutation = useMutation({
    mutationFn: (data: AddLoanForm) => {
      const t = {
        servicerName: data.servicerName,
        loanBalance: parseFloat(data.loanBalance),
        interestRate: parseFloat(data.interestRate),
        monthlyPayment: parseFloat(data.monthlyPayment),
        repaymentPlan: data.repaymentPlan,
        loanType: data.loanType,
        originalBalance: data.originalBalance ? parseFloat(data.originalBalance) : undefined,
        graduationDate: data.graduationDate || undefined,
      };
      return apiRequest("POST", "/api/student-loans", t);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student-loans"] });
      setAddLoanOpen(false);
      addLoanForm.reset();
      toast({ title: "Student Loan Added", description: "Your loan has been added successfully." });
    },
    onError: () => toast({ title: "Error", description: "Failed to add student loan.", variant: "destructive" }),
  });

  const startNegotiationMutation = useMutation({
    mutationFn: (data: { loanId?: number; negotiationType: string }) =>
      apiRequest("POST", "/api/loan-negotiations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loan-negotiations"] });
      toast({ title: "Negotiation Started", description: "We've initiated your loan negotiation process." });
    },
  });

  const totalBalance = studentLoans.reduce((s, l) => s + parseFloat(l.loanBalance), 0);
  const totalMonthlyPayment = studentLoans.reduce((s, l) => s + parseFloat(l.monthlyPayment), 0);
  const weightedRate = studentLoans.length > 0
    ? studentLoans.reduce((s, l) => s + parseFloat(l.interestRate) * parseFloat(l.loanBalance), 0) / totalBalance
    : 0;
  const activeNegotiations = loanNegotiations.filter((n) => n.status === "IN_PROGRESS");
  const completedNegotiations = loanNegotiations.filter((n) => n.status === "COMPLETED");
  const totalSavings = completedNegotiations.reduce((s, n) => s + parseFloat(n.savingsAchieved || "0"), 0);

  const insights = [
    { type: "CONSOLIDATION", title: "Consolidation Opportunity", impact: "HIGH",
      desc: `Save ~$${Math.floor(totalMonthlyPayment * 0.15)}/mo by consolidating federal loans`, action: "Analyze" },
    { type: "FORGIVENESS", title: "PSLF Eligibility Check", impact: "HIGH",
      desc: "You may qualify for Public Service Loan Forgiveness", action: "Check Eligibility" },
    { type: "PAYMENT_PLAN", title: "Income-Driven Repayment", impact: "MEDIUM",
      desc: "IDR plan could reduce payments by up to 40%", action: "Calculate Savings" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Hero header ── */}
        <div
          className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="ss-overline mb-2">Finance</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(201,168,76,0.12)" }}>
                  <GraduationCap className="h-5 w-5" style={{ color: "var(--gold)" }} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--text-primary)" }}>
                    Student Loan Aid
                  </h1>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>AI-powered negotiation and optimization</p>
                </div>
              </div>
            </div>
            <Dialog open={addLoanOpen} onOpenChange={setAddLoanOpen}>
              <DialogTrigger asChild>
                <button className="ss-btn-primary shrink-0">
                  <PlusCircle className="h-4 w-4" />
                  Add Loan
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Student Loan</DialogTitle>
                </DialogHeader>
                <Form {...addLoanForm}>
                  <form onSubmit={addLoanForm.handleSubmit((d) => addLoanMutation.mutate(d))} className="space-y-4">
                    <FormField control={addLoanForm.control} name="servicerName" render={({ field }) => (
                      <FormItem><FormLabel>Loan Servicer</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., Navient, Nelnet" /></FormControl>
                        <FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={addLoanForm.control} name="loanBalance" render={({ field }) => (
                        <FormItem><FormLabel>Current Balance</FormLabel>
                          <FormControl><Input {...field} placeholder="25000" type="number" /></FormControl>
                          <FormMessage /></FormItem>
                      )} />
                      <FormField control={addLoanForm.control} name="interestRate" render={({ field }) => (
                        <FormItem><FormLabel>Interest Rate (%)</FormLabel>
                          <FormControl><Input {...field} placeholder="6.5" type="number" step="0.01" /></FormControl>
                          <FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={addLoanForm.control} name="monthlyPayment" render={({ field }) => (
                      <FormItem><FormLabel>Monthly Payment</FormLabel>
                        <FormControl><Input {...field} placeholder="300" type="number" /></FormControl>
                        <FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={addLoanForm.control} name="loanType" render={({ field }) => (
                        <FormItem><FormLabel>Loan Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="FEDERAL">Federal</SelectItem>
                              <SelectItem value="PRIVATE">Private</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage /></FormItem>
                      )} />
                      <FormField control={addLoanForm.control} name="repaymentPlan" render={({ field }) => (
                        <FormItem><FormLabel>Repayment Plan</FormLabel>
                          <FormControl><Input {...field} placeholder="Standard 10-year" /></FormControl>
                          <FormMessage /></FormItem>
                      )} />
                    </div>
                    <button type="submit" className="ss-btn-primary w-full justify-center" disabled={addLoanMutation.isPending}>
                      {addLoanMutation.isPending ? "Adding..." : "Add Loan"}
                    </button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Summary stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Total Balance", value: formatCurrency(totalBalance), sub: `${studentLoans.length} active loans`, color: "var(--gold)" },
            { icon: Calculator, label: "Monthly Payment", value: formatCurrency(totalMonthlyPayment), sub: `Avg. ${weightedRate.toFixed(2)}% interest`, color: "#60A5FA" },
            { icon: TrendingDown, label: "Total Savings", value: formatCurrency(totalSavings), sub: `From ${completedNegotiations.length} negotiations`, color: "#2ECC8A" },
            { icon: MessageSquare, label: "Active Negotiations", value: String(activeNegotiations.length), sub: "In progress", color: "var(--gold)" },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="ss-card !p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}14` }}>
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
                  <div className="text-lg font-black" style={{ color: "var(--text-primary)" }}>{value}</div>
                  <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-gold)" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all"
              style={{
                background: activeTab === tab ? "linear-gradient(135deg, var(--gold), var(--gold-light))" : "transparent",
                color: activeTab === tab ? "var(--bg-primary)" : "var(--text-muted)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Portfolio tab ── */}
        {activeTab === "Portfolio" && (
          <div className="space-y-4">
            {studentLoans.length === 0 ? (
              <div className="ss-card !p-12 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(201,168,76,0.08)" }}>
                  <GraduationCap className="h-8 w-8" style={{ color: "var(--gold)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Student Loans Added</h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                  Add your student loans to start optimizing payments and exploring forgiveness options.
                </p>
                <button className="ss-btn-primary" onClick={() => setAddLoanOpen(true)}>
                  <PlusCircle className="h-4 w-4" />
                  Add Your First Loan
                </button>
              </div>
            ) : (
              studentLoans.map((loan) => (
                <div key={loan.id} className="ss-card !p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-base" style={{ color: "var(--text-primary)" }}>{loan.servicerName}</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: loan.loanType === "FEDERAL" ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.06)",
                            color: loan.loanType === "FEDERAL" ? "var(--gold)" : "var(--text-muted)",
                          }}
                        >
                          {loan.loanType}
                        </span>
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>{loan.repaymentPlan}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                        {formatCurrency(parseFloat(loan.loanBalance))}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: "var(--gold)" }}>{loan.interestRate}% APR</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    {[
                      { label: "Monthly Payment", value: formatCurrency(parseFloat(loan.monthlyPayment)) },
                      { label: "Status", value: loan.status.toLowerCase() },
                      { label: "Original Balance", value: loan.originalBalance ? formatCurrency(parseFloat(loan.originalBalance)) : "N/A" },
                      { label: "Progress", value: loan.originalBalance ? `${Math.round((1 - parseFloat(loan.loanBalance) / parseFloat(loan.originalBalance)) * 100)}%` : "N/A" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
                        <div className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="ss-btn-primary !py-2 !px-4 text-sm"
                      onClick={() => startNegotiationMutation.mutate({ loanId: loan.id, negotiationType: "PAYMENT_REDUCTION" })}
                    >
                      <TrendingDown className="h-4 w-4" />
                      Reduce Payment
                    </button>
                    <button
                      className="ss-btn-ghost !py-2 !px-4 text-sm"
                      onClick={() => startNegotiationMutation.mutate({ loanId: loan.id, negotiationType: "FORGIVENESS" })}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Check Forgiveness
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Optimization tab ── */}
        {activeTab === "Optimization" && (
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-gold)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Brain className="h-5 w-5" style={{ color: "var(--gold)" }} />
              <div className="ss-overline">AI-Powered Optimization</div>
            </div>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.type}
                  className="p-4 rounded-xl"
                  style={{
                    background: insight.impact === "HIGH" ? "rgba(201,168,76,0.06)" : "var(--bg-elevated)",
                    border: `1px solid ${insight.impact === "HIGH" ? "rgba(201,168,76,0.3)" : "var(--border-gold)"}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{insight.title}</div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: insight.impact === "HIGH" ? "rgba(201,168,76,0.12)" : "rgba(96,165,250,0.12)",
                        color: insight.impact === "HIGH" ? "var(--gold)" : "#60A5FA",
                      }}
                    >
                      {insight.impact}
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>{insight.desc}</p>
                  <button className="ss-btn-ghost !py-1.5 !px-3 text-xs">
                    <Zap className="h-3 w-3" />
                    {insight.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Negotiations tab ── */}
        {activeTab === "Negotiations" && (
          <div className="space-y-4">
            {loanNegotiations.length === 0 ? (
              <div className="ss-card !p-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <MessageSquare className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
                </div>
                <div className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>No Active Negotiations</div>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Start negotiating better terms for your student loans.
                </div>
              </div>
            ) : (
              loanNegotiations.map((neg) => {
                const statusColor = neg.status === "COMPLETED" ? "#2ECC8A" : neg.status === "IN_PROGRESS" ? "var(--gold)" : "var(--text-muted)";
                return (
                  <div key={neg.id} className="ss-card !p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-bold capitalize text-sm" style={{ color: "var(--text-primary)" }}>
                        {neg.negotiationType.replace("_", " ").toLowerCase()}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: `${statusColor}14`, color: statusColor }}>
                        {neg.status}
                      </span>
                    </div>
                    {neg.outcome && (
                      <div className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{neg.outcome}</div>
                    )}
                    {neg.savingsAchieved && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Monthly Savings</div>
                          <div className="font-bold" style={{ color: "#2ECC8A" }}>{formatCurrency(parseFloat(neg.savingsAchieved))}</div>
                        </div>
                        <div>
                          <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Started</div>
                          <div className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{formatRelativeDate(neg.createdAt)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── Documents tab ── */}
        {activeTab === "Documents" && (
          <div className="ss-card !p-10 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <FileText className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <div className="font-bold mb-1" style={{ color: "var(--text-primary)" }}>No Documents Generated</div>
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Documents will appear here as negotiations progress.
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
