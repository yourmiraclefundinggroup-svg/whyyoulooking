import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Target,
  Brain,
  Zap,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Bell
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface CreditCardData {
  id: number;
  cardName: string;
  bank: string;
  creditLimit: number;
  currentBalance: number;
  minimumPayment: number;
  dueDate: string;
  interestRate: number;
  isActive: boolean;
}

interface UtilizationAlert {
  id: number;
  cardId?: number;
  alertType: "SPENDING_LIMIT" | "UTILIZATION_THRESHOLD" | "PAYMENT_DUE" | "OPTIMIZATION_OPPORTUNITY";
  message: string;
  actionSuggestion: string;
  currentAmount?: number;
  suggestedAmount?: number;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  isRead: boolean;
  createdAt: string;
}

interface OptimizationResult {
  overall: {
    currentUtilization: number;
    targetUtilization: number;
    scoreImpact: number;
    totalOptimization: number;
  };
  cardOptimizations: Array<{
    cardId: number;
    cardName: string;
    currentBalance: number;
    currentUtilization: number;
    targetUtilization: number;
    suggestedAction: string;
    amountSuggestion: number;
    priority: "HIGH" | "MEDIUM" | "LOW";
    timeframe: string;
    scoreImpact: number;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    actionSuggestion: string;
    urgency: string;
    cardId?: number;
    suggestedAmount?: number;
  }>;
}

interface CreditUtilizationOptimizerProps {
  userId: number;
}

export function CreditUtilizationOptimizer({ userId }: CreditUtilizationOptimizerProps) {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch credit cards
  const { data: creditCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ["/api/credit-cards", userId],
    queryFn: () => apiRequest(`/api/credit-cards/${userId}`)
  });

  // Fetch utilization alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["/api/utilization-alerts", userId],
    queryFn: () => apiRequest(`/api/utilization-alerts/${userId}`)
  });

  // Optimize utilization mutation
  const optimizeUtilizationMutation = useMutation({
    mutationFn: () => apiRequest(`/api/credit-utilization/optimize`, { 
      method: "POST",
      body: { userId }
    }),
    onSuccess: (data) => {
      setOptimizationResult(data);
      toast({ description: "AI optimization completed successfully" });
    },
    onError: () => {
      toast({ description: "Failed to optimize utilization", variant: "destructive" });
    }
  });

  // Mark alert as read mutation
  const markAlertReadMutation = useMutation({
    mutationFn: (alertId: number) => apiRequest(`/api/utilization-alerts/${alertId}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/utilization-alerts", userId] });
    }
  });

  const handleOptimizeUtilization = () => {
    setIsOptimizing(true);
    optimizeUtilizationMutation.mutate();
    setTimeout(() => setIsOptimizing(false), 2000);
  };

  const calculateUtilization = (card: CreditCardData) => {
    return Math.round((card.currentBalance / card.creditLimit) * 100);
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    return days > 0 ? `${days} days` : `${Math.abs(days)} days ago`;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 50) return "text-red-600 dark:text-red-400";
    if (utilization >= 30) return "text-orange-600 dark:text-orange-400";
    if (utilization >= 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressColor = (utilization: number) => {
    if (utilization >= 50) return "bg-red-500";
    if (utilization >= 30) return "bg-orange-500";
    if (utilization >= 10) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    };
    return colors[urgency as keyof typeof colors] || colors.LOW;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "HIGH": return <ArrowUp className="h-4 w-4 text-red-500" />;
      case "MEDIUM": return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case "LOW": return <ArrowDown className="h-4 w-4 text-green-500" />;
      default: return <ArrowUp className="h-4 w-4 text-gray-500" />;
    }
  };

  if (cardsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalLimit = creditCards.reduce((sum: number, card: CreditCardData) => sum + card.creditLimit, 0);
  const totalBalance = creditCards.reduce((sum: number, card: CreditCardData) => sum + card.currentBalance, 0);
  const overallUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

  const unreadAlertsCount = alerts.filter((alert: UtilizationAlert) => !alert.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Credit Utilization Optimizer</h2>
          <p className="text-slate-600 dark:text-slate-300">
            AI calculates optimal spending across all credit cards with real-time optimization alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadAlertsCount > 0 && (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              <Bell className="mr-1 h-3 w-3" />
              {unreadAlertsCount} Alert{unreadAlertsCount > 1 ? 's' : ''}
            </Badge>
          )}
          <Button 
            onClick={handleOptimizeUtilization}
            disabled={isOptimizing || creditCards.length === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isOptimizing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Optimizing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                AI Optimize
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overall Utilization Summary */}
      <Card className="bg-card text-card-foreground border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getUtilizationColor(overallUtilization)}`}>
                {overallUtilization}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Current Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalBalance)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Balance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalLimit)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Limit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {creditCards.length}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Active Cards</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Utilization Progress</span>
              <span className={getUtilizationColor(overallUtilization)}>{overallUtilization}%</span>
            </div>
            <Progress 
              value={overallUtilization} 
              className="h-3"
              style={{
                background: `linear-gradient(to right, ${getProgressColor(overallUtilization)} ${overallUtilization}%, #e2e8f0 ${overallUtilization}%)`
              }}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0%</span>
              <span className="text-green-600">10% (Optimal)</span>
              <span className="text-orange-600">30% (Warning)</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards">Credit Cards</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {unreadAlertsCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-red-500">
                {unreadAlertsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="optimization" disabled={!optimizationResult}>
            AI Optimization
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          {creditCards.length === 0 ? (
            <Card className="bg-card text-card-foreground border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CreditCard className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Credit Cards</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Add your credit cards to start optimizing your utilization
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            creditCards.map((card: CreditCardData) => {
              const utilization = calculateUtilization(card);
              const daysUntilDue = formatDate(card.dueDate);
              
              return (
                <Card key={card.id} className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{card.cardName}</CardTitle>
                        <CardDescription>{card.bank}</CardDescription>
                      </div>
                      <Badge className={getUtilizationColor(utilization).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-').replace('-600', '-100').replace('-400', '-800')}>
                        {utilization}% Used
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Balance</div>
                        <div className="font-semibold">{formatCurrency(card.currentBalance)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Limit</div>
                        <div className="font-semibold">{formatCurrency(card.creditLimit)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">APR</div>
                        <div className="font-semibold">{(card.interestRate / 100).toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Due Date</div>
                        <div className="font-semibold">{daysUntilDue}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Utilization</span>
                        <span className={getUtilizationColor(utilization)}>{utilization}%</span>
                      </div>
                      <Progress 
                        value={utilization} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="bg-card text-card-foreground border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">All Good!</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    No utilization alerts at this time
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert: UtilizationAlert) => (
              <Alert key={alert.id} className={`border-l-4 ${
                alert.urgency === 'CRITICAL' ? 'border-l-red-500' :
                alert.urgency === 'HIGH' ? 'border-l-orange-500' :
                alert.urgency === 'MEDIUM' ? 'border-l-yellow-500' :
                'border-l-blue-500'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.urgency === 'CRITICAL' ? 'text-red-500' :
                      alert.urgency === 'HIGH' ? 'text-orange-500' :
                      alert.urgency === 'MEDIUM' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getUrgencyBadge(alert.urgency)}>
                          {alert.urgency}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <AlertDescription className="text-slate-900 dark:text-slate-100 font-medium">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {alert.actionSuggestion}
                      </p>
                      {alert.suggestedAmount && (
                        <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                          Suggested Action: {formatCurrency(alert.suggestedAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                  {!alert.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAlertReadMutation.mutate(alert.id)}
                      className="ml-4"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          {optimizationResult ? (
            <>
              {/* Overall Optimization Summary */}
              <Card className="bg-card text-card-foreground border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {optimizationResult.overall.currentUtilization}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {optimizationResult.overall.targetUtilization}%
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Target</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        +{optimizationResult.overall.scoreImpact}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Score Impact</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(optimizationResult.overall.totalOptimization)}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Total Adjustment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card-by-Card Recommendations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Card-by-Card Recommendations
                </h3>
                {optimizationResult.cardOptimizations.map((optimization) => (
                  <Card key={optimization.cardId} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                          {optimization.cardName}
                        </h4>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(optimization.priority)}
                          <Badge className={`${
                            optimization.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            optimization.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {optimization.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Current</div>
                          <div className="font-semibold">{optimization.currentUtilization}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Target</div>
                          <div className="font-semibold text-green-600">{optimization.targetUtilization}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Score Impact</div>
                          <div className="font-semibold text-orange-600">+{optimization.scoreImpact}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Timeframe</div>
                          <div className="font-semibold">{optimization.timeframe}</div>
                        </div>
                      </div>

                      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <strong>Recommended Action:</strong> {optimization.suggestedAction}
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="bg-card text-card-foreground border-slate-200 dark:border-slate-700">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Brain className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Optimization</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Run AI optimization to get personalized spending recommendations across all your cards
                  </p>
                  <Button 
                    onClick={handleOptimizeUtilization}
                    disabled={creditCards.length === 0}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Start AI Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}