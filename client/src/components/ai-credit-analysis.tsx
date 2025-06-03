import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="fas fa-brain text-white text-xs"></i>
            </div>
            <span>AI Credit Analysis</span>
          </CardTitle>
          <Button
            onClick={handleRunAnalysis}
            disabled={analysisMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {analysisMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Analyzing...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {analysisMutation.isPending && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <i className="fas fa-brain animate-pulse"></i>
              <span>AI is analyzing your complete credit profile...</span>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {!analysis && !analysisMutation.isPending && (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-brain text-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Credit Analysis</h3>
            <p className="text-gray-600 mb-4">
              Get personalized insights and strategies based on your complete credit profile.
            </p>
            <ul className="text-sm text-gray-500 text-left max-w-md mx-auto space-y-1">
              <li>• Personalized dispute strategies</li>
              <li>• Priority issue identification</li>
              <li>• Score improvement timeline</li>
              <li>• Custom action plan</li>
            </ul>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Overall Analysis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Credit Profile Summary</h4>
              <p className="text-sm text-blue-800">{analysis.analysis}</p>
            </div>

            {/* Priority Issues */}
            {analysis.priorityIssues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Priority Issues to Address</h4>
                <div className="space-y-2">
                  {analysis.priorityIssues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personalized Recommendations</h4>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{rec.action}</h5>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Expected Impact:</span> {rec.expectedImpact}
                      </div>
                      <div>
                        <span className="font-medium">Timeframe:</span> {rec.timeframe}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Steps:</span>
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                        {rec.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispute Strategies */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">AI Dispute Strategies</h4>
              <div className="grid gap-4">
                {analysis.disputeStrategy.collections && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h5 className="font-medium text-red-900 mb-2">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Collections Strategy
                    </h5>
                    <p className="text-sm text-red-800">{analysis.disputeStrategy.collections}</p>
                  </div>
                )}
                
                {analysis.disputeStrategy.latePayments && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h5 className="font-medium text-orange-900 mb-2">
                      <i className="fas fa-clock mr-2"></i>
                      Late Payments Strategy
                    </h5>
                    <p className="text-sm text-orange-800">{analysis.disputeStrategy.latePayments}</p>
                  </div>
                )}
                
                {analysis.disputeStrategy.inquiries && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-medium text-yellow-900 mb-2">
                      <i className="fas fa-search mr-2"></i>
                      Inquiries Strategy
                    </h5>
                    <p className="text-sm text-yellow-800">{analysis.disputeStrategy.inquiries}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Score Projection */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">
                <i className="fas fa-chart-line mr-2"></i>
                Score Projection
              </h4>
              <p className="text-sm text-green-800">{analysis.scoreProjection}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}