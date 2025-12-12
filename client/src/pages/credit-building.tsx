import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { TrendingUp, Target, ArrowUp, ListTodo, CreditCard, Percent, CalendarCheck, CheckCircle, Shield, Info, Clock, PlayCircle, Check, Trophy } from "lucide-react";
import type { CreditReport, CreditBuildingAction, CreditGoal } from "@shared/schema";

export default function CreditBuilding() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showExperianForm, setShowExperianForm] = useState(false);
  const [experianForm, setExperianForm] = useState({
    firstName: '',
    lastName: '',
    ssn: '',
    dateOfBirth: '',
    address: {
      line1: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  // Hardcoded user ID for demo
  const userId = 1;

  const { data: creditReport } = useQuery<CreditReport>({
    queryKey: ['/api/credit-reports', userId],
  });

  const { data: creditBuildingActions = [], isLoading: actionsLoading } = useQuery<CreditBuildingAction[]>({
    queryKey: ['/api/credit-building-actions', userId],
  });

  const { data: creditGoal } = useQuery<CreditGoal>({
    queryKey: ['/api/credit-goals', userId],
  });

  const updateActionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CreditBuildingAction> }) => {
      const response = await apiRequest("PATCH", `/api/credit-building-actions/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-building-actions', userId] });
      toast({
        title: "Success",
        description: "Action updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update action",
        variant: "destructive",
      });
    },
  });

  const connectExperianMutation = useMutation({
    mutationFn: async (personalInfo: typeof experianForm) => {
      const response = await apiRequest("POST", `/api/experian/connect`, { personalInfo });
      return response.json();
    },
    onSuccess: () => {
      setShowExperianForm(false);
      setExperianForm({
        firstName: '',
        lastName: '',
        ssn: '',
        dateOfBirth: '',
        address: {
          line1: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      toast({
        title: "Successfully Connected",
        description: "Your Experian credit monitoring is now active",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Experian",
        variant: "destructive",
      });
    },
  });

  const handleStartAction = (action: CreditBuildingAction) => {
    updateActionMutation.mutate({
      id: action.id,
      updates: { status: 'IN_PROGRESS' }
    });
  };

  const handleCompleteAction = (action: CreditBuildingAction) => {
    updateActionMutation.mutate({
      id: action.id,
      updates: { status: 'COMPLETED' }
    });
  };

  const recommendedActions = creditBuildingActions.filter(action => action.status === 'RECOMMENDED');
  const inProgressActions = creditBuildingActions.filter(action => action.status === 'IN_PROGRESS');
  const completedActions = creditBuildingActions.filter(action => action.status === 'COMPLETED');

  const scoreProgress = creditGoal && creditReport 
    ? ((creditReport.creditScore) / creditGoal.targetScore) * 100 
    : 0;

  const totalPotentialImprovement = recommendedActions.reduce((sum, action) => sum + action.potentialImpact, 0);

  if (actionsLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Credit Building</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Build and improve your credit score with personalized recommendations and strategies.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current Score</p>
                <p className="text-2xl font-bold text-blue-600">{creditReport?.creditScore || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Target Score</p>
                <p className="text-2xl font-bold text-green-600">{creditGoal?.targetScore || 720}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ArrowUp className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Potential Gain</p>
                <p className="text-2xl font-bold text-purple-600">+{totalPotentialImprovement}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ListTodo className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Actions Completed</p>
                <p className="text-2xl font-bold text-orange-600">{completedActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Credit Score Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Progress to Goal ({creditReport?.creditScore || 0} / {creditGoal?.targetScore || 720})
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(scoreProgress)}%</span>
            </div>
            <Progress value={scoreProgress} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Current: {creditReport?.creditScore || 0}</span>
              <span>Target: {creditGoal?.targetScore || 720}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended">Actions</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recommended Actions</span>
                <Badge variant="secondary">{recommendedActions.length} Available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedActions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      action.priority === 'HIGH' 
                        ? 'bg-green-50 border-green-200' 
                        : action.priority === 'MEDIUM'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        action.priority === 'HIGH' 
                          ? 'bg-green-600' 
                          : action.priority === 'MEDIUM'
                          ? 'bg-blue-600'
                          : 'bg-gray-600'
                      }`}>
                        {action.type === 'SECURED_CARD' && <CreditCard className="h-4 w-4 text-white" />}
                        {action.type === 'UTILIZATION_REDUCTION' && <Percent className="h-4 w-4 text-white" />}
                        {action.type === 'PAYMENT_HISTORY' && <CalendarCheck className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className={`text-sm font-medium ${
                            action.priority === 'HIGH' 
                              ? 'text-green-900' 
                              : action.priority === 'MEDIUM'
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}>
                            {action.title}
                          </h4>
                          <p className={`text-sm ${
                            action.priority === 'HIGH' 
                              ? 'text-green-700' 
                              : action.priority === 'MEDIUM'
                              ? 'text-blue-700'
                              : 'text-gray-700'
                          }`}>
                            {action.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs">
                            <span className={action.priority === 'HIGH' ? 'text-green-600' : action.priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600'}>
                              Potential impact: +{action.potentialImpact} points
                            </span>
                            <span className={action.priority === 'HIGH' ? 'text-green-600' : action.priority === 'MEDIUM' ? 'text-blue-600' : 'text-gray-600'}>
                              Timeframe: {action.timeframe}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge variant={action.priority === 'HIGH' ? 'default' : 'secondary'}>
                            {action.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`${
                        action.priority === 'HIGH' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : action.priority === 'MEDIUM'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                      onClick={() => handleStartAction(action)}
                      disabled={updateActionMutation.isPending}
                    >
                      Start Action
                    </Button>
                  </div>
                ))}
                {recommendedActions.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      You've started all available credit building actions. Keep up the great work!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Credit Bureau Connections */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Bureau Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Experian Connection */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Experian Credit Monitoring</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Connect to monitor your Experian credit report in real-time</p>
                    </div>
                  </div>
                  <Dialog open={showExperianForm} onOpenChange={setShowExperianForm}>
                    <DialogTrigger asChild>
                      <Button>Connect Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Connect to Experian</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={experianForm.firstName}
                              onChange={(e) => setExperianForm(prev => ({ ...prev, firstName: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={experianForm.lastName}
                              onChange={(e) => setExperianForm(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="ssn">Social Security Number</Label>
                          <Input
                            id="ssn"
                            type="password"
                            placeholder="XXX-XX-XXXX"
                            value={experianForm.ssn}
                            onChange={(e) => setExperianForm(prev => ({ ...prev, ssn: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={experianForm.dateOfBirth}
                            onChange={(e) => setExperianForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Street Address</Label>
                          <Input
                            id="address"
                            value={experianForm.address.line1}
                            onChange={(e) => setExperianForm(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, line1: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={experianForm.address.city}
                              onChange={(e) => setExperianForm(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, city: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              placeholder="CA"
                              maxLength={2}
                              value={experianForm.address.state}
                              onChange={(e) => setExperianForm(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, state: e.target.value.toUpperCase() }
                              }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={experianForm.address.zipCode}
                            onChange={(e) => setExperianForm(prev => ({ 
                              ...prev, 
                              address: { ...prev.address, zipCode: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowExperianForm(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => connectExperianMutation.mutate(experianForm)}
                            disabled={connectExperianMutation.isPending}
                          >
                            {connectExperianMutation.isPending ? 'Connecting...' : 'Connect'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Other bureau connections coming soon */}
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Equifax Credit Monitoring</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Coming soon - comprehensive Equifax integration</p>
                    </div>
                  </div>
                  <Button disabled>Coming Soon</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">TransUnion Credit Monitoring</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Coming soon - real-time TransUnion data</p>
                    </div>
                  </div>
                  <Button disabled>Coming Soon</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Building Services & Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recommended Credit Building Services</span>
                <Badge variant="secondary">External Partners</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                
                {/* Secured Credit Cards Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Secured Credit Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Kova */}
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Kova</h4>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Recommended</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Build credit with no deposit required. Kova reports to all three credit bureaus and offers credit building tools.
                      </p>
                      <div className="text-xs text-blue-600 mb-4 space-y-1">
                        <div>✓ No security deposit required</div>
                        <div>✓ Reports to all 3 bureaus</div>
                        <div>✓ Credit monitoring included</div>
                        <div>✓ Mobile app with insights</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open('https://www.getkova.com', '_blank')}
                      >
                        Visit Kova →
                      </Button>
                    </div>

                    {/* Discover it Secured */}
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900">Discover it® Secured</h4>
                        <Badge variant="outline" className="bg-green-100 text-green-800">Popular</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Earn cash back while building credit. Your security deposit becomes your credit limit.
                      </p>
                      <div className="text-xs text-green-600 mb-4 space-y-1">
                        <div>✓ Earn 2% cash back on gas & restaurants</div>
                        <div>✓ 1% on all other purchases</div>
                        <div>✓ No annual fee</div>
                        <div>✓ Automatic reviews for credit line increases</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => window.open('https://www.discover.com/credit-cards/secured/', '_blank')}
                      >
                        Learn More →
                      </Button>
                    </div>

                  </div>
                </div>

                {/* Credit Monitoring & Building Tools */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Monitoring & Building Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Credit Karma */}
                    <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-purple-900">Credit Karma</h4>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">Free</Badge>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        Free credit scores, monitoring, and personalized recommendations for improving your credit.
                      </p>
                      <div className="text-xs text-purple-600 mb-4 space-y-1">
                        <div>✓ Free credit scores from 2 bureaus</div>
                        <div>✓ Credit monitoring alerts</div>
                        <div>✓ Personalized recommendations</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.open('https://www.creditkarma.com', '_blank')}
                      >
                        Visit Credit Karma →
                      </Button>
                    </div>

                    {/* Experian Boost */}
                    <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-orange-900">Experian Boost™</h4>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">Instant Impact</Badge>
                      </div>
                      <p className="text-sm text-orange-700 mb-3">
                        Get credit for paying utilities, phone, and streaming services. Potential instant score increase.
                      </p>
                      <div className="text-xs text-orange-600 mb-4 space-y-1">
                        <div>✓ Count utility payments toward credit</div>
                        <div>✓ Potential instant score boost</div>
                        <div>✓ Free to use</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-orange-600 hover:bg-orange-700"
                        onClick={() => window.open('https://www.experian.com/consumer-products/credit-score-boost.html', '_blank')}
                      >
                        Try Experian Boost →
                      </Button>
                    </div>

                    {/* Self Credit Builder */}
                    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-indigo-900">Self Credit Builder</h4>
                        <Badge variant="outline" className="bg-indigo-100 text-indigo-800">Build + Save</Badge>
                      </div>
                      <p className="text-sm text-indigo-700 mb-3">
                        Build credit while saving money. Make payments to yourself that are reported to credit bureaus.
                      </p>
                      <div className="text-xs text-indigo-600 mb-4 space-y-1">
                        <div>✓ Reports to all 3 credit bureaus</div>
                        <div>✓ Build savings while building credit</div>
                        <div>✓ No credit check to get started</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => window.open('https://www.self.inc/credit-builder-account/', '_blank')}
                      >
                        Learn About Self →
                      </Button>
                    </div>

                  </div>
                </div>

                {/* Authorized User Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Authorized User Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">ScoreShift Tradelines</h4>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Our Service</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Get access to our curated selection of high-quality tradelines with personalized recommendations and support.
                      </p>
                      <div className="text-xs text-blue-600 mb-4 space-y-1">
                        <div>✓ Hand-selected quality tradelines</div>
                        <div>✓ Personalized recommendations</div>
                        <div>✓ Full customer support included</div>
                        <div>✓ Competitive pricing with guarantees</div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.open('mailto:tradelines@scoreshift.com?subject=Tradeline Inquiry&body=Hi, I would like to learn more about your available tradelines and pricing. Please contact me with more information.', '_blank')}
                      >
                        Contact Us for Tradelines →
                      </Button>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Family & Friends</h4>
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">Free Option</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Ask trusted family or friends to add you as an authorized user on their well-managed accounts.
                      </p>
                      <div className="text-xs text-gray-600 mb-4 space-y-1">
                        <div>✓ Free if you know someone willing</div>
                        <div>✓ Can significantly boost scores</div>
                        <div>✓ Benefits from their payment history</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        disabled
                      >
                        Ask Family/Friends
                      </Button>
                    </div>

                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">Important Disclaimer</h4>
                      <p className="text-xs text-yellow-700">
                        These are external services not affiliated with our platform. Always research thoroughly and read terms before applying. 
                        Credit building takes time and responsible financial habits. Results may vary based on individual circumstances.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Actions In Progress</span>
                <Badge variant="secondary">{inProgressActions.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inProgressActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-yellow-900">{action.title}</h4>
                      <p className="text-sm text-yellow-700">{action.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-yellow-600">
                        <span>Expected impact: +{action.potentialImpact} points</span>
                        <span>Timeframe: {action.timeframe}</span>
                        <span>Priority: {action.priority}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      onClick={() => handleCompleteAction(action)}
                      disabled={updateActionMutation.isPending}
                    >
                      Mark Complete
                    </Button>
                  </div>
                ))}
                {inProgressActions.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <PlayCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Actions In Progress</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Start working on recommended actions to improve your credit score.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Completed Actions</span>
                <Badge variant="secondary">{completedActions.length} Completed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-900">{action.title}</h4>
                      <p className="text-sm text-green-700">{action.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                        <span>Impact: +{action.potentialImpact} points applied</span>
                        <span>Completed in: {action.timeframe}</span>
                        <span>Priority was: {action.priority}</span>
                      </div>
                    </div>
                    <Badge className="bg-green-600">Completed</Badge>
                  </div>
                ))}
                {completedActions.length === 0 && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Trophy className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Completed Actions Yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Complete recommended actions to see your progress here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
