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
  Clock,
  CheckCircle,
  AlertTriangle,
  PlusCircle,
  Download,
  Target,
  Zap,
  Brain,
  Users,
  Building,
  Shield
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
  const [selectedLoan, setSelectedLoan] = useState<StudentLoan | null>(null);

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

  // Calculate totals and insights
  const totalBalance = studentLoans.reduce((sum, loan) => sum + parseFloat(loan.loanBalance), 0);
  const totalMonthlyPayment = studentLoans.reduce((sum, loan) => sum + parseFloat(loan.monthlyPayment), 0);
  const weightedInterestRate = studentLoans.length > 0 
    ? studentLoans.reduce((sum, loan) => sum + (parseFloat(loan.interestRate) * parseFloat(loan.loanBalance)), 0) / totalBalance
    : 0;

  const activeNegotiations = loanNegotiations.filter(n => n.status === 'IN_PROGRESS');
  const completedNegotiations = loanNegotiations.filter(n => n.status === 'COMPLETED');
  const totalSavings = completedNegotiations.reduce((sum, n) => sum + parseFloat(n.savingsAchieved || "0"), 0);

  // AI-powered insights
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
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-white rounded-2xl p-6 border border-green-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-12 w-12 text-green-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-green-900">Student Loan Management</h1>
                <p className="text-green-600">AI-powered negotiation and optimization</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <Dialog open={addLoanOpen} onOpenChange={setAddLoanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
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
                      className="w-full" 
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
      </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {studentLoans.length} active loans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payment</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthlyPayment)}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {weightedInterestRate.toFixed(2)}% interest
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</div>
            <p className="text-xs text-muted-foreground">
              From {completedNegotiations.length} negotiations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Negotiations</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeNegotiations.length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
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

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid gap-6">
            {studentLoans.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Student Loans Added</h3>
                  <p className="text-gray-600 mb-4">
                    Add your student loans to start optimizing payments and exploring forgiveness options
                  </p>
                  <Button onClick={() => setAddLoanOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Loan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              studentLoans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          {loan.servicerName}
                          <Badge 
                            variant={loan.loanType === 'FEDERAL' ? 'default' : 'secondary'}
                            className="ml-2"
                          >
                            {loan.loanType}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{loan.repaymentPlan}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatCurrency(parseFloat(loan.loanBalance))}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{loan.interestRate}% APR</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Monthly Payment</Label>
                        <div className="font-semibold">{formatCurrency(parseFloat(loan.monthlyPayment))}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Status</Label>
                        <div className="font-semibold capitalize">{loan.status.toLowerCase()}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Original Balance</Label>
                        <div className="font-semibold">
                          {loan.originalBalance ? formatCurrency(parseFloat(loan.originalBalance)) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Progress</Label>
                        <div className="font-semibold">
                          {loan.originalBalance ? 
                            `${Math.round((1 - parseFloat(loan.loanBalance) / parseFloat(loan.originalBalance)) * 100)}%` : 
                            'N/A'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
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
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={insight.impact === 'HIGH' ? 'destructive' : 'default'}>
                      {insight.impact} Impact
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <Button size="sm" variant="outline">
                    <Zap className="h-4 w-4 mr-1" />
                    {insight.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="negotiations" className="space-y-6">
          <div className="grid gap-6">
            {loanNegotiations.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Negotiations</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start negotiating better terms for your student loans
                  </p>
                </CardContent>
              </Card>
            ) : (
              loanNegotiations.map((negotiation) => (
                <Card key={negotiation.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="capitalize">
                        {negotiation.negotiationType.replace('_', ' ').toLowerCase()}
                      </CardTitle>
                      <Badge variant={
                        negotiation.status === 'COMPLETED' ? 'default' :
                        negotiation.status === 'IN_PROGRESS' ? 'secondary' :
                        'outline'
                      }>
                        {negotiation.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {negotiation.outcome && (
                      <div className="mb-4">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">Outcome</Label>
                        <p className="text-sm">{negotiation.outcome}</p>
                      </div>
                    )}
                    {negotiation.savingsAchieved && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Monthly Savings</Label>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(parseFloat(negotiation.savingsAchieved))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Started</Label>
                          <div className="font-semibold">
                            {formatRelativeDate(negotiation.createdAt)}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Generated Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Documents Generated</h3>
                <p className="text-gray-600 mb-4">
                  Documents will appear here as negotiations progress
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}