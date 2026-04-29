import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/hooks/use-user-context";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { StudentLoan, LoanNegotiation, User } from "@shared/schema";
import {
  GraduationCap,
  DollarSign,
  TrendingDown,
  FileText,
  MessageSquare,
  Calculator,
  CheckCircle,
  PlusCircle,
  Target,
  Zap,
  Brain,
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

export default function StudentLoans() {
  const { user } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addLoanOpen, setAddLoanOpen] = useState(false);

  const { data: studentLoans = [] } = useQuery<StudentLoan[]>({
    queryKey: ['/api/student-loans'],
  });

  const { data: loanNegotiations = [] } = useQuery<LoanNegotiation[]>({
    queryKey: ['/api/loan-negotiations'],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/users/current'],
  });

  const addLoanForm = useForm<AddLoanForm>({
    resolver: zodResolver(addLoanSchema),
    defaultValues: {
      servicerName: "",
      loanBalance: "",
      interestRate: "",
      monthlyPayment: "",
      repaymentPlan: "",
      loanType: "FEDERAL",
      originalBalance: "",
      graduationDate: "",
    },
  });

  const addLoanMutation = useMutation({
    mutationFn: (data: AddLoanForm) => {
      const transformedData = {
        servicerName: data.servicerName,
        loanBalance: parseFloat(data.loanBalance),
        interestRate: parseFloat(data.interestRate),
        monthlyPayment: parseFloat(data.monthlyPayment),
        repaymentPlan: data.repaymentPlan,
        loanType: data.loanType,
        originalBalance: data.originalBalance ? parseFloat(data.originalBalance) : undefined,
        graduationDate: data.graduationDate || undefined,
      };
      return apiRequest("POST", "/api/student-loans", transformedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-loans'] });
      setAddLoanOpen(false);
      addLoanForm.reset();
      toast({
        title: "Student Loan Added",
        description: "Your loan has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add student loan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startNegotiationMutation = useMutation({
    mutationFn: (data: { loanId?: number; negotiationType: string }) =>
      apiRequest("POST", "/api/loan-negotiations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loan-negotiations'] });
      toast({
        title: "Negotiation Started",
        description: "We've initiated your loan negotiation process.",
      });
    },
  });

  const onAddLoan = (data: AddLoanForm) => {
    addLoanMutation.mutate(data);
  };

  const startNegotiation = (loanId: number, type: string) => {
    startNegotiationMutation.mutate({ loanId, negotiationType: type });
  };

  const totalBalance = studentLoans.reduce((sum, loan) => sum + parseFloat(loan.loanBalance), 0);
  const totalMonthlyPayment = studentLoans.reduce((sum, loan) => sum + parseFloat(loan.monthlyPayment), 0);
  const weightedInterestRate = studentLoans.length > 0
    ? studentLoans.reduce((sum, loan) => sum + (parseFloat(loan.interestRate) * parseFloat(loan.loanBalance)), 0) / totalBalance
    : 0;

  const activeNegotiations = loanNegotiations.filter(n => n.status === 'IN_PROGRESS');
  const completedNegotiations = loanNegotiations.filter(n => n.status === 'COMPLETED');
  const totalSavings = completedNegotiations.reduce((sum, n) => sum + parseFloat(n.savingsAchieved || "0"), 0);

  const insights = [
    {
      type: "CONSOLIDATION",
      title: "Consolidation Opportunity",
      description: `You could save $${Math.floor(totalMonthlyPayment * 0.15)} per month by consolidating federal loans`,
      impact: "HIGH",
      action: "Analyze Consolidation"
    },
    {
      type: "FORGIVENESS",
      title: "PSLF Eligibility Check",
      description: "You may qualify for Public Service Loan Forgiveness based on your employment",
      impact: "HIGH",
      action: "Check Eligibility"
    },
    {
      type: "PAYMENT_PLAN",
      title: "Income-Driven Repayment",
      description: "Switch to IDR plan could reduce payments by up to 40%",
      impact: "MEDIUM",
      action: "Calculate Savings"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-1 font-medium">Finance</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight">Student Loan Management</h1>
                  <p className="text-muted-foreground text-sm">AI-powered negotiation and optimization</p>
                </div>
              </div>
            </div>
            <Dialog open={addLoanOpen} onOpenChange={setAddLoanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Student Loan</DialogTitle>
                </DialogHeader>
                <Form {...addLoanForm}>
                  <form onSubmit={addLoanForm.handleSubmit(onAddLoan)} className="space-y-4">
                    <FormField
                      control={addLoanForm.control}
                      name="servicerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Loan Servicer</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Navient, Nelnet" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addLoanForm.control}
                        name="loanBalance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Balance</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="25000" type="number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addLoanForm.control}
                        name="interestRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interest Rate (%)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="6.5" type="number" step="0.01" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addLoanForm.control}
                      name="monthlyPayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monthly Payment</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="300" type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addLoanForm.control}
                        name="loanType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Loan Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="FEDERAL">Federal</SelectItem>
                                <SelectItem value="PRIVATE">Private</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addLoanForm.control}
                        name="repaymentPlan"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repayment Plan</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Standard 10-year" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
                      disabled={addLoanMutation.isPending}
                    >
                      {addLoanMutation.isPending ? "Adding..." : "Add Loan"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Balance</p>
                  <p className="text-xl font-black text-foreground">{formatCurrency(totalBalance)}</p>
                  <p className="text-xs text-muted-foreground">{studentLoans.length} active loans</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calculator className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Monthly Payment</p>
                  <p className="text-xl font-black text-foreground">{formatCurrency(totalMonthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground">Avg. {weightedInterestRate.toFixed(2)}% interest</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Savings</p>
                  <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSavings)}</p>
                  <p className="text-xs text-muted-foreground">From {completedNegotiations.length} negotiations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Active Negotiations</p>
                  <p className="text-xl font-black text-foreground">{activeNegotiations.length}</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="portfolio">Loan Portfolio</TabsTrigger>
            <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
            <TabsTrigger value="negotiations">Negotiations</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            {studentLoans.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Student Loans Added</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Add your student loans to start optimizing payments and exploring forgiveness options.
                  </p>
                  <Button
                    onClick={() => setAddLoanOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Loan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              studentLoans.map((loan) => (
                <Card key={loan.id} className="hover:border-amber-500/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                          {loan.servicerName}
                          <Badge
                            className={loan.loanType === 'FEDERAL'
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              : "bg-muted text-muted-foreground"
                            }
                          >
                            {loan.loanType}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">{loan.repaymentPlan}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-foreground">{formatCurrency(parseFloat(loan.loanBalance))}</div>
                        <div className="text-sm text-amber-500 dark:text-amber-400 font-medium">{loan.interestRate}% APR</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Monthly Payment</Label>
                        <div className="font-semibold text-foreground">{formatCurrency(parseFloat(loan.monthlyPayment))}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <div className="font-semibold text-foreground capitalize">{loan.status.toLowerCase()}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Original Balance</Label>
                        <div className="font-semibold text-foreground">
                          {loan.originalBalance ? formatCurrency(parseFloat(loan.originalBalance)) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Progress</Label>
                        <div className="font-semibold text-foreground">
                          {loan.originalBalance
                            ? `${Math.round((1 - parseFloat(loan.loanBalance) / parseFloat(loan.originalBalance)) * 100)}%`
                            : 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
                        onClick={() => startNegotiation(loan.id, 'PAYMENT_REDUCTION')}
                      >
                        <TrendingDown className="h-4 w-4 mr-1" />
                        Reduce Payment
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startNegotiation(loan.id, 'FORGIVENESS')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Check Forgiveness
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Brain className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  AI-Powered Optimization Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-colors ${
                      insight.impact === 'HIGH'
                        ? 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-foreground">{insight.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        insight.impact === 'HIGH'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                      }`}>
                        {insight.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                    <Button size="sm" variant="outline" className="hover:border-amber-500/40 hover:text-amber-600 dark:hover:text-amber-400">
                      <Zap className="h-4 w-4 mr-1" />
                      {insight.action}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="negotiations" className="space-y-4">
            {loanNegotiations.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Active Negotiations</h3>
                  <p className="text-muted-foreground text-sm">
                    Start negotiating better terms for your student loans
                  </p>
                </CardContent>
              </Card>
            ) : (
              loanNegotiations.map((negotiation) => (
                <Card key={negotiation.id} className="hover:border-amber-500/20 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="capitalize text-foreground">
                        {negotiation.negotiationType.replace('_', ' ').toLowerCase()}
                      </CardTitle>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        negotiation.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : negotiation.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {negotiation.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {negotiation.outcome && (
                      <div className="mb-4">
                        <Label className="text-xs text-muted-foreground">Outcome</Label>
                        <p className="text-sm text-foreground mt-0.5">{negotiation.outcome}</p>
                      </div>
                    )}
                    {negotiation.savingsAchieved && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Monthly Savings</Label>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(parseFloat(negotiation.savingsAchieved))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Started</Label>
                          <div className="font-semibold text-foreground">
                            {formatRelativeDate(negotiation.createdAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <FileText className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  Generated Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No Documents Generated</h3>
                  <p className="text-muted-foreground text-sm">
                    Documents will appear here as negotiations progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
