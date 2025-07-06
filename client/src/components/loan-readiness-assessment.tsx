import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CircularProgress } from '@/components/ui/circular-progress';
import { apiRequest } from '@/lib/queryClient';
import { Banknote, TrendingUp, Clock, AlertTriangle, CheckCircle, Target, DollarSign, Calendar, Building2, PiggyBank } from 'lucide-react';

interface LoanReadinessAssessmentProps {
  userId: number;
}

interface LoanReadinessData {
  annualIncome: number;
  monthlyIncome: number;
  monthlyDebtPayments: number;
  employmentStatus: string;
  employmentLength: number;
  jobTitle?: string;
  employer?: string;
  savingsAmount: number;
  checkingAmount: number;
  investmentAmount: number;
  hasOtherAssets: boolean;
  otherAssetsValue?: number;
  housingStatus: string;
  monthlyRentMortgage: number;
  creditScore: number;
  loanAmount: number;
  downPayment: number;
  loanType: "MORTGAGE" | "AUTO" | "PERSONAL" | "BUSINESS";
}

interface LoanReadinessResult {
  readinessScore: number;
  approvalProbability: number;
  debtToIncomeRatio: number;
  timelineToQualification: string;
  estimatedInterestRate: number;
  monthlyPaymentEstimate: number;
  strengths: string[];
  concerns: string[];
  recommendedActions: Array<{
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    timeframe: string;
    impact: string;
  }>;
  nextSteps: string[];
  aiInsights: {
    summary: string;
    keyFactors: string[];
    riskAssessment: string;
    recommendations: string[];
  };
}

export function LoanReadinessAssessment({ userId }: LoanReadinessAssessmentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<LoanReadinessData>({
    annualIncome: 0,
    monthlyIncome: 0,
    monthlyDebtPayments: 0,
    employmentStatus: 'EMPLOYED',
    employmentLength: 0,
    jobTitle: '',
    employer: '',
    savingsAmount: 0,
    checkingAmount: 0,
    investmentAmount: 0,
    hasOtherAssets: false,
    otherAssetsValue: 0,
    housingStatus: 'RENT',
    monthlyRentMortgage: 0,
    creditScore: 650,
    loanAmount: 0,
    downPayment: 0,
    loanType: 'MORTGAGE'
  });

  const [activeTab, setActiveTab] = useState('profile');

  // Fetch existing profile
  const { data: profile } = useQuery({
    queryKey: ['/api/loan-readiness/profile', userId],
    enabled: !!userId
  });

  // Fetch recent assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['/api/loan-readiness/assessments', userId],
    enabled: !!userId
  });

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: LoanReadinessData) => {
      return apiRequest(`/api/loan-readiness/profile`, {
        method: 'POST',
        body: {
          userId,
          ...data
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your financial profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-readiness/profile', userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Assessment mutation
  const assessmentMutation = useMutation({
    mutationFn: async (data: LoanReadinessData) => {
      return apiRequest(`/api/loan-readiness/assess`, {
        method: 'POST',
        body: {
          userId,
          ...data
        }
      });
    },
    onSuccess: (result: LoanReadinessResult) => {
      toast({
        title: "Assessment Complete",
        description: `Your loan readiness score is ${result.readinessScore}%`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loan-readiness/assessments', userId] });
      setActiveTab('results');
    },
    onError: () => {
      toast({
        title: "Assessment Failed",
        description: "Failed to generate assessment. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Load profile data when available
  React.useEffect(() => {
    if (profile) {
      setFormData({
        ...formData,
        ...profile,
        annualIncome: profile.annualIncome || 0,
        monthlyIncome: profile.monthlyIncome || 0,
        monthlyDebtPayments: profile.monthlyDebtPayments || 0,
        savingsAmount: profile.savingsAmount || 0,
        checkingAmount: profile.checkingAmount || 0,
        investmentAmount: profile.investmentAmount || 0,
        otherAssetsValue: profile.otherAssetsValue || 0,
        monthlyRentMortgage: profile.monthlyRentMortgage || 0
      });
    }
  }, [profile]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  const formatPercent = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
  };

  const handleInputChange = (field: keyof LoanReadinessData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    saveProfileMutation.mutate(formData);
  };

  const handleRunAssessment = () => {
    assessmentMutation.mutate(formData);
  };

  const totalAssets = formData.savingsAmount + formData.checkingAmount + formData.investmentAmount + (formData.hasOtherAssets ? formData.otherAssetsValue || 0 : 0);
  const debtToIncomeRatio = formData.monthlyIncome > 0 ? (formData.monthlyDebtPayments / formData.monthlyIncome) * 100 : 0;

  const latestAssessment = assessments[0] as LoanReadinessResult | undefined;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "default";
      case "LOW": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mortgage & Loan Readiness AI</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered loan approval probability and debt-to-income analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Banknote className="w-6 h-6 text-blue-600" />
          <Badge variant="outline" className="hidden sm:flex">AI Enhanced</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Financial Profile</TabsTrigger>
          <TabsTrigger value="assessment">Loan Assessment</TabsTrigger>
          <TabsTrigger value="results">Results & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Income Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="annualIncome">Annual Income</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={formData.annualIncome / 100}
                    onChange={(e) => handleInputChange('annualIncome', parseInt(e.target.value || '0') * 100)}
                    placeholder="75000"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    value={formData.monthlyIncome / 100}
                    onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value || '0') * 100)}
                    placeholder="6250"
                  />
                </div>
                <div>
                  <Label htmlFor="employmentStatus">Employment Status</Label>
                  <Select value={formData.employmentStatus} onValueChange={(value) => handleInputChange('employmentStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYED">Employed</SelectItem>
                      <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                      <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                      <SelectItem value="RETIRED">Retired</SelectItem>
                      <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employmentLength">Employment Length (months)</Label>
                  <Input
                    id="employmentLength"
                    type="number"
                    value={formData.employmentLength}
                    onChange={(e) => handleInputChange('employmentLength', parseInt(e.target.value || '0'))}
                    placeholder="36"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Assets & Savings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <PiggyBank className="w-5 h-5 mr-2 text-blue-600" />
                  Assets & Savings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="savingsAmount">Savings Account</Label>
                  <Input
                    id="savingsAmount"
                    type="number"
                    value={formData.savingsAmount / 100}
                    onChange={(e) => handleInputChange('savingsAmount', parseInt(e.target.value || '0') * 100)}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <Label htmlFor="checkingAmount">Checking Account</Label>
                  <Input
                    id="checkingAmount"
                    type="number"
                    value={formData.checkingAmount / 100}
                    onChange={(e) => handleInputChange('checkingAmount', parseInt(e.target.value || '0') * 100)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="investmentAmount">Investments</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    value={formData.investmentAmount / 100}
                    onChange={(e) => handleInputChange('investmentAmount', parseInt(e.target.value || '0') * 100)}
                    placeholder="15000"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Total Assets: {formatCurrency(totalAssets)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Debt Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-600" />
                  Debt & Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="monthlyDebtPayments">Monthly Debt Payments</Label>
                  <Input
                    id="monthlyDebtPayments"
                    type="number"
                    value={formData.monthlyDebtPayments / 100}
                    onChange={(e) => handleInputChange('monthlyDebtPayments', parseInt(e.target.value || '0') * 100)}
                    placeholder="800"
                  />
                </div>
                <div>
                  <Label htmlFor="housingStatus">Housing Status</Label>
                  <Select value={formData.housingStatus} onValueChange={(value) => handleInputChange('housingStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RENT">Rent</SelectItem>
                      <SelectItem value="OWN">Own</SelectItem>
                      <SelectItem value="LIVE_WITH_FAMILY">Live with Family</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="monthlyRentMortgage">Monthly Rent/Mortgage</Label>
                  <Input
                    id="monthlyRentMortgage"
                    type="number"
                    value={formData.monthlyRentMortgage / 100}
                    onChange={(e) => handleInputChange('monthlyRentMortgage', parseInt(e.target.value || '0') * 100)}
                    placeholder="1500"
                  />
                </div>
                <div className="pt-2">
                  <p className="text-sm font-medium text-gray-700">
                    Debt-to-Income Ratio: {formatPercent(debtToIncomeRatio)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Credit Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Credit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="creditScore">Current Credit Score</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    value={formData.creditScore}
                    onChange={(e) => handleInputChange('creditScore', parseInt(e.target.value || '650'))}
                    placeholder="720"
                    min="300"
                    max="850"
                  />
                </div>
                <div className="pt-2">
                  <Badge variant={formData.creditScore >= 740 ? "default" : formData.creditScore >= 670 ? "secondary" : "destructive"}>
                    {formData.creditScore >= 740 ? "Excellent" : 
                     formData.creditScore >= 670 ? "Good" : 
                     formData.creditScore >= 580 ? "Fair" : "Poor"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              onClick={handleSaveProfile}
              disabled={saveProfileMutation.isPending}
              variant="outline"
            >
              {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Loan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select value={formData.loanType} onValueChange={(value) => handleInputChange('loanType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MORTGAGE">Mortgage</SelectItem>
                      <SelectItem value="AUTO">Auto Loan</SelectItem>
                      <SelectItem value="PERSONAL">Personal Loan</SelectItem>
                      <SelectItem value="BUSINESS">Business Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    value={formData.loanAmount / 100}
                    onChange={(e) => handleInputChange('loanAmount', parseInt(e.target.value || '0') * 100)}
                    placeholder="300000"
                  />
                </div>
                <div>
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    id="downPayment"
                    type="number"
                    value={formData.downPayment / 100}
                    onChange={(e) => handleInputChange('downPayment', parseInt(e.target.value || '0') * 100)}
                    placeholder="60000"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Down Payment: {formData.loanAmount > 0 ? formatPercent((formData.downPayment / formData.loanAmount) * 100) : "0%"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button
              onClick={handleRunAssessment}
              disabled={assessmentMutation.isPending || formData.loanAmount === 0}
              size="lg"
              className="px-8"
            >
              {assessmentMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Run AI Assessment
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {latestAssessment ? (
            <>
              {/* Overview Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <CircularProgress 
                        value={latestAssessment.readinessScore} 
                        size="lg"
                        className={getScoreColor(latestAssessment.readinessScore)}
                      />
                      <p className="text-sm font-medium text-gray-600">Readiness Score</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className={`text-2xl font-bold ${getScoreColor(latestAssessment.approvalProbability)}`}>
                        {latestAssessment.approvalProbability}%
                      </div>
                      <p className="text-sm font-medium text-gray-600">Approval Probability</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {latestAssessment.debtToIncomeRatio}%
                      </div>
                      <p className="text-sm font-medium text-gray-600">Debt-to-Income</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPercent(latestAssessment.estimatedInterestRate / 100)}
                      </div>
                      <p className="text-sm font-medium text-gray-600">Est. Interest Rate</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    AI Analysis & Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{latestAssessment.aiInsights.summary}</AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Strengths
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {latestAssessment.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Areas of Concern
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {latestAssessment.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {concern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {latestAssessment.recommendedActions.map((action, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Badge variant={getPriorityColor(action.priority)} className="mt-0.5">
                          {action.priority}
                        </Badge>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{action.action}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {action.timeframe}
                            </span>
                            <span>Impact: {action.impact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Qualification Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {latestAssessment.timelineToQualification}
                    </div>
                    <p className="text-gray-600">Estimated time to loan qualification</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Next Steps:</h4>
                    <ul className="space-y-1 text-sm">
                      {latestAssessment.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessment Results</h3>
                <p className="text-gray-600 mb-4">
                  Complete your financial profile and run an assessment to see your loan readiness score.
                </p>
                <Button onClick={() => setActiveTab('profile')}>
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}