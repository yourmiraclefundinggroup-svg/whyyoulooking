import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, CreditCard, TrendingUp, FileText, Shield, CheckCircle, AlertTriangle, DollarSign, Target, Briefcase } from "lucide-react";

interface BusinessCreditPortalProps {
  userId: number;
}

export function BusinessCreditPortal({ userId }: BusinessCreditPortalProps) {
  const [businessProfile, setBusinessProfile] = useState({
    businessName: "",
    businessType: "",
    industry: "",
    yearsInBusiness: "",
    annualRevenue: "",
    employeeCount: "",
    ein: "",
    businessAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });

  const queryClient = useQueryClient();

  const { data: businessData, isLoading } = useQuery({
    queryKey: [`/api/business-credit/${userId}`],
    enabled: !!userId
  });

  const { data: personalCreditScore } = useQuery({
    queryKey: [`/api/credit-reports/${userId}`],
    enabled: !!userId
  });

  const setupBusinessMutation = useMutation({
    mutationFn: async (data: any) => {
      return await fetch(`/api/business-credit/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/business-credit/${userId}`] });
    }
  });

  // Demo data for business credit profile
  const demoBusinessData = businessData || {
    eligibilityScore: 78,
    businessCreditScore: 0, // New business
    personalCreditScore: personalCreditScore?.creditScore || 720,
    fundingReadiness: 65,
    businessProfile: {
      businessName: "Tech Solutions LLC",
      businessType: "LLC",
      industry: "Technology",
      yearsInBusiness: 2,
      annualRevenue: 250000,
      employeeCount: 5,
      ein: "XX-XXXXXXX"
    },
    tradeLines: [],
    fundingOptions: [
      {
        type: "Business Credit Card",
        provider: "Chase Business",
        creditLimit: 25000,
        approvalProbability: 85,
        requirements: ["Personal credit 680+", "2+ years in business"]
      },
      {
        type: "SBA Loan",
        provider: "Various Lenders",
        amount: 150000,
        approvalProbability: 72,
        requirements: ["Strong cash flow", "Collateral", "Business plan"]
      },
      {
        type: "Equipment Financing",
        provider: "Multiple Lenders",
        amount: 100000,
        approvalProbability: 88,
        requirements: ["Equipment as collateral", "Good personal credit"]
      }
    ],
    recommendedActions: [
      {
        action: "Establish business bank account with major bank",
        priority: "HIGH",
        timeframe: "Immediate",
        impact: "Foundation for business credit"
      },
      {
        action: "Register with Dun & Bradstreet",
        priority: "HIGH", 
        timeframe: "1-2 weeks",
        impact: "Get DUNS number for business credit file"
      },
      {
        action: "Apply for vendor accounts with net terms",
        priority: "MEDIUM",
        timeframe: "1-3 months",
        impact: "Build positive payment history"
      }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600";
    if (score >= 650) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "secondary";
      case "LOW": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="setup">Business Setup</TabsTrigger>
          <TabsTrigger value="tradelines">Trade Lines</TabsTrigger>
          <TabsTrigger value="funding">Funding Options</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Eligibility Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Business Credit Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(demoBusinessData.personalCreditScore)}`}>
                    {demoBusinessData.personalCreditScore}
                  </div>
                  <p className="text-sm text-gray-600">Personal Credit</p>
                  <Badge variant={demoBusinessData.personalCreditScore >= 680 ? "default" : "destructive"}>
                    {demoBusinessData.personalCreditScore >= 680 ? "Qualified" : "Needs Work"}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {demoBusinessData.eligibilityScore}%
                  </div>
                  <p className="text-sm text-gray-600">Eligibility Score</p>
                  <Badge variant="secondary">
                    Good Standing
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {demoBusinessData.fundingReadiness}%
                  </div>
                  <p className="text-sm text-gray-600">Funding Readiness</p>
                  <Badge variant="outline">
                    Almost Ready
                  </Badge>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Overall Business Credit Readiness</span>
                    <span className="text-sm text-gray-600">{demoBusinessData.fundingReadiness}%</span>
                  </div>
                  <Progress value={demoBusinessData.fundingReadiness} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { item: "Business Registration", status: "Complete", percentage: 100 },
                    { item: "Business Bank Account", status: "Complete", percentage: 100 },
                    { item: "Business Credit File", status: "In Progress", percentage: 30 },
                    { item: "Trade Line History", status: "Needs Setup", percentage: 0 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{item.item}</span>
                      <Badge variant={item.percentage === 100 ? "default" : item.percentage > 0 ? "secondary" : "outline"}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Business Profile */}
          {demoBusinessData.businessProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Business Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Business Name</p>
                      <p className="font-semibold">{demoBusinessData.businessProfile.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Business Type</p>
                      <p className="font-semibold">{demoBusinessData.businessProfile.businessType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Industry</p>
                      <p className="font-semibold">{demoBusinessData.businessProfile.industry}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Years in Business</p>
                      <p className="font-semibold">{demoBusinessData.businessProfile.yearsInBusiness} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Annual Revenue</p>
                      <p className="font-semibold">${demoBusinessData.businessProfile.annualRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Employee Count</p>
                      <p className="font-semibold">{demoBusinessData.businessProfile.employeeCount} employees</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Business Information Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Business LLC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select value={businessProfile.businessType} onValueChange={(value) => 
                    setBusinessProfile(prev => ({ ...prev, businessType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={businessProfile.industry} onValueChange={(value) => 
                    setBusinessProfile(prev => ({ ...prev, industry: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={businessProfile.yearsInBusiness}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, yearsInBusiness: e.target.value }))}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={businessProfile.annualRevenue}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, annualRevenue: e.target.value }))}
                    placeholder="250000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={businessProfile.employeeCount}
                    onChange={(e) => setBusinessProfile(prev => ({ ...prev, employeeCount: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setupBusinessMutation.mutate(businessProfile)}
                  disabled={setupBusinessMutation.isPending}
                  className="w-full"
                >
                  {setupBusinessMutation.isPending ? "Setting up..." : "Setup Business Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tradelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                Business Trade Lines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {demoBusinessData.tradeLines.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Trade Lines Yet</h3>
                  <p className="text-gray-600 mb-4">Start building business credit with vendor accounts</p>
                  <Button>Add First Trade Line</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Trade line list would go here */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {demoBusinessData.fundingOptions.map((option: any, idx: number) => (
              <Card key={idx} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    {option.type}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Provider</p>
                    <p className="font-semibold">{option.provider}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">
                      {option.creditLimit ? "Credit Limit" : "Loan Amount"}
                    </p>
                    <p className="font-semibold text-green-600">
                      ${(option.creditLimit || option.amount).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approval Probability</p>
                    <div className="flex items-center gap-2">
                      <Progress value={option.approvalProbability} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{option.approvalProbability}%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Requirements</p>
                    <ul className="space-y-1">
                      {option.requirements.map((req: string, reqIdx: number) => (
                        <li key={reqIdx} className="text-xs flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button variant="outline" className="w-full">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Recommended Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demoBusinessData.recommendedActions.map((action: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{action.action}</h4>
                      <Badge variant={getPriorityColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Timeframe: </span>
                        <span className="font-medium">{action.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Impact: </span>
                        <span className="font-medium">{action.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Credit Building Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { phase: "Foundation (Month 1-2)", tasks: ["Business registration", "EIN number", "Business bank account", "D&B registration"] },
                  { phase: "Initial Credit (Month 3-6)", tasks: ["First vendor accounts", "Business credit cards", "Monitor credit reports"] },
                  { phase: "Growth (Month 6-12)", tasks: ["Additional trade lines", "Higher credit limits", "SBA loan preparation"] },
                  { phase: "Expansion (Year 2+)", tasks: ["Major financing", "Equipment loans", "Business expansion funding"] }
                ].map((phase, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">{phase.phase}</h4>
                    <ul className="space-y-1">
                      {phase.tasks.map((task, taskIdx) => (
                        <li key={taskIdx} className="text-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}