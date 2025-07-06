import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Target, Trophy, AlertCircle } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface FinancialBehaviorCoachProps {
  userId: number;
}

export function FinancialBehaviorCoach({ userId }: FinancialBehaviorCoachProps) {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/financial-behavior-profiles/${userId}`],
    enabled: !!userId
  });

  const generateAnalysisMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/financial-behavior-profiles/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial-behavior-profiles/${userId}`] });
    }
  });

  const completeWeekMutation = useMutation({
    mutationFn: async (weekId: number) => {
      return await fetch(`/api/financial-behavior-profiles/complete-week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, weekId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/financial-behavior-profiles/${userId}`] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Financial Behavior Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Personalized Financial Coaching</h3>
              <p className="text-gray-500 mb-4">Get AI-powered insights to improve your financial habits</p>
              <Button 
                onClick={() => generateAnalysisMutation.mutate()}
                disabled={generateAnalysisMutation.isPending}
              >
                {generateAnalysisMutation.isPending ? "Analyzing..." : "Start Financial Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "IMPROVING": return "text-green-600";
      case "STABLE": return "text-blue-600";
      case "DECLINING": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      housing: "bg-blue-100 text-blue-800",
      transportation: "bg-green-100 text-green-800",
      food: "bg-yellow-100 text-yellow-800",
      entertainment: "bg-purple-100 text-purple-800",
      savings: "bg-emerald-100 text-emerald-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Behavior Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Behavior Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(profile.behaviorScore)}`}>
                  {profile.behaviorScore}
                </p>
              </div>
              <CircularProgress value={profile.behaviorScore} size="md" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rewards Earned</p>
                <p className="text-2xl font-bold text-yellow-600">{profile.rewardsEarned}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Analysis</p>
                <p className="text-lg font-bold">
                  {new Date(profile.lastAnalysisDate).toLocaleDateString()}
                </p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending-patterns" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spending-patterns">Spending Analysis</TabsTrigger>
          <TabsTrigger value="coaching-plan">Coaching Plan</TabsTrigger>
          <TabsTrigger value="budget-optimizer">Budget Optimizer</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="spending-patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Pattern Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.spendingPatterns?.map((pattern: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{pattern.category}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">${(pattern.amount / 100).toLocaleString()}</Badge>
                        <Badge variant={pattern.trend === "INCREASING" ? "destructive" : 
                                      pattern.trend === "STABLE" ? "secondary" : "default"}>
                          {pattern.trend}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pattern.recommendation}</p>
                    
                    {pattern.monthlyBreakdown && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Monthly Breakdown:</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {pattern.monthlyBreakdown.map((month: any, idx: number) => (
                            <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                              <p className="font-medium">{month.month}</p>
                              <p>${(month.amount / 100).toFixed(0)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Improvement Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profile.improvementAreas?.map((area: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaching-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Coaching Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.coachingPlan?.map((week: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Week {week.week}: {week.focus}</h4>
                        <p className="text-sm text-gray-600">{week.description}</p>
                      </div>
                      <Badge variant={week.completed ? "default" : "outline"}>
                        {week.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Activities:</p>
                      <ul className="space-y-1">
                        {week.activities?.map((activity: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${
                              week.completed ? 'bg-green-600' : 'bg-gray-300'
                            }`} />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {!week.completed && (
                      <Button
                        onClick={() => completeWeekMutation.mutate(week.week)}
                        disabled={completeWeekMutation.isPending}
                        size="sm"
                        className="mt-3"
                      >
                        Complete Week
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Budget Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.budgetRecommendations && Object.entries(profile.budgetRecommendations).map(([category, percentage]: [string, any]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{category}</span>
                      <Badge className={getCategoryColor(category)}>
                        {percentage}%
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.currentBudget && Object.entries(profile.currentBudget).map(([category, data]: [string, any]) => (
                  <div key={category} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium">{category}</span>
                      <div className="text-right">
                        <p className="text-sm">${(data.actual / 100).toFixed(0)} / ${(data.budget / 100).toFixed(0)}</p>
                        <p className={`text-xs ${data.actual <= data.budget ? 'text-green-600' : 'text-red-600'}`}>
                          {data.actual <= data.budget ? 'Under Budget' : 'Over Budget'}
                        </p>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min((data.actual / data.budget) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Progress Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.progressMetrics && Object.entries(profile.progressMetrics).map(([metric, value]: [string, any]) => (
                  <div key={metric} className="border rounded-lg p-4">
                    <h4 className="font-semibold capitalize mb-2">{metric.replace('_', ' ')}</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={value.percentage} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{value.percentage}%</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{value.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements & Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Budget Master</h4>
                  <p className="text-sm text-gray-600">Stayed under budget for 3 months</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Goal Achiever</h4>
                  <p className="text-sm text-gray-600">Met savings goal</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold">Habit Builder</h4>
                  <p className="text-sm text-gray-600">14-day streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}