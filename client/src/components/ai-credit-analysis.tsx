import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, Loader2, Target, Clock, TrendingUp, AlertTriangle, Search, ChartLine, CheckCircle } from "lucide-react";

interface AIAnalysis {
  analysis: string;
  priorityIssues: string[];
  recommendations: Array<{
    action: string;
    priority: string;
    timeframe: string;
    expectedImpact: string;
    steps: string[];
  }>;
  disputeStrategy: {
    collections?: string;
    latePayments?: string;
    inquiries?: string;
  };
  scoreProjection: string;
}

interface AICreditAnalysisProps {
  userId: number;
}

export function AICreditAnalysis({ userId }: AICreditAnalysisProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai-credit-analysis", { userId });
      return response.json();
    },
    onSuccess: (data: AIAnalysis) => {
      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your credit profile and generated personalized recommendations.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate AI credit analysis. Please ensure your API key is configured.",
        variant: "destructive",
      });
    },
  });

  const handleRunAnalysis = () => {
    analysisMutation.mutate();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <Card className="border-0 shadow-lg overflow-hidden bg-card text-card-foreground">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-semibold">AI Credit Analysis</span>
              <p className="text-sm text-white/80 font-normal">Powered by advanced AI</p>
            </div>
          </CardTitle>
          <Button
            onClick={handleRunAnalysis}
            disabled={analysisMutation.isPending}
            data-testid="button-run-ai-analysis"
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg"
          >
            {analysisMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {analysisMutation.isPending && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600 bg-blue-50 dark:bg-blue-950 p-4 rounded-xl">
              <Brain className="h-5 w-5 animate-pulse" />
              <span className="font-medium">AI is analyzing your complete credit profile...</span>
            </div>
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {!analysis && !analysisMutation.isPending && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">AI Credit Analysis</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Get personalized insights and strategies based on your complete credit profile.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-left">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Target className="h-4 w-4 text-blue-500" />
                <span>Dispute strategies</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Priority issues</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>Score timeline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Action plan</span>
              </div>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Analysis */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Credit Profile Summary
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{analysis.analysis}</p>
            </div>

            {/* Priority Issues */}
            {analysis.priorityIssues.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Priority Issues to Address
                </h4>
                <div className="space-y-2">
                  {analysis.priorityIssues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-100 dark:border-red-900">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Personalized Recommendations
              </h4>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">{rec.action}</h5>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span><span className="font-medium">Impact:</span> {rec.expectedImpact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span><span className="font-medium">Timeframe:</span> {rec.timeframe}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Action Steps:</span>
                      <ul className="mt-2 space-y-1">
                        {rec.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Strategies */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                AI Dispute Strategies
              </h4>
              <div className="grid gap-4">
                {analysis.disputeStrategy.collections && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-5">
                    <h5 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Collections Strategy
                    </h5>
                    <p className="text-sm text-red-800 dark:text-red-200">{analysis.disputeStrategy.collections}</p>
                  </div>
                )}
                
                {analysis.disputeStrategy.latePayments && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
                    <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Late Payments Strategy
                    </h5>
                    <p className="text-sm text-orange-800 dark:text-orange-200">{analysis.disputeStrategy.latePayments}</p>
                  </div>
                )}
                
                {analysis.disputeStrategy.inquiries && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                    <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Inquiries Strategy
                    </h5>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{analysis.disputeStrategy.inquiries}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Score Projection */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Projection
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{analysis.scoreProjection}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}