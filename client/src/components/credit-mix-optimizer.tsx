import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, TrendingUp, Target, Clock, AlertTriangle } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface CreditMixOptimizerProps {
  userId: number;
}

export function CreditMixOptimizer({ userId }: CreditMixOptimizerProps) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: optimization, isLoading } = useQuery({
    queryKey: [`/api/credit-mix-optimization/${userId}`],
    enabled: !!userId
  });

  const generateOptimizationMutation = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/credit-mix-optimization/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/credit-mix-optimization/${userId}`] });
    }
  });

  const applyRecommendationMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await fetch(`/api/credit-mix-optimization/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId })
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/credit-mix-optimization/${userId}`] });
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

  if (!optimization) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Credit Mix Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No credit mix analysis available</p>
              <Button 
                onClick={() => generateOptimizationMutation.mutate()}
                disabled={generateOptimizationMutation.isPending}
              >
                {generateOptimizationMutation.isPending ? "Analyzing..." : "Analyze Credit Mix"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "destructive";
      case "MEDIUM": return "secondary";
      case "LOW": return "outline";
      default: return "outline";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Mix Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(optimization.currentMixScore)}`}>
                  {optimization.currentMixScore}%
                </p>
              </div>
              <CircularProgress value={optimization.currentMixScore} size="sm" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Target Score</p>
                <p className="text-2xl font-bold text-green-600">{optimization.targetMixScore}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement Potential</p>
                <p className="text-2xl font-bold text-blue-600">+{optimization.improvementPotential} pts</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="current-mix">Current Mix</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Credit Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimization.recommendedProducts?.map((product: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{product.type}</h4>
                      <p className="text-sm text-gray-600">{product.provider}</p>
                      {product.amount && (
                        <p className="text-sm">Amount: ${(product.amount / 100).toLocaleString()}</p>
                      )}
                      {product.limit && (
                        <p className="text-sm">Limit: ${(product.limit / 100).toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-green-600">
                        {product.impact}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{product.timeline}</p>
                    </div>
                  </div>
                  
                  {product.benefits && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Benefits:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {product.benefits.map((benefit: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedProduct(product)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="action-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimization.actionPlan?.map((step: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{step.step}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{step.action}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-3 w-3" />
                          {step.timeline}
                        </div>
                      </div>
                      {step.description && (
                        <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>0% Complete</span>
                </div>
                <Progress value={0} className="h-2" />
                <p className="text-sm text-gray-600">
                  Expected completion: {optimization.implementationTimeline}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current-mix" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Credit Product Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimization.currentProducts?.map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.type}</h4>
                      <p className="text-sm text-gray-600">{product.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(product.balance / 100).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        {product.status === "ACTIVE" ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Credit Mix Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p>{optimization.aiAnalysis}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Risk Assessment</h4>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm">{optimization.riskAssessment}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>{selectedProduct.type} Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold">Provider</h4>
                <p>{selectedProduct.provider}</p>
              </div>
              
              {selectedProduct.requirements && (
                <div>
                  <h4 className="font-semibold">Requirements</h4>
                  <ul className="text-sm space-y-1">
                    {selectedProduct.requirements.map((req: string, idx: number) => (
                      <li key={idx}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => applyRecommendationMutation.mutate(selectedProduct.id)}
                  disabled={applyRecommendationMutation.isPending}
                  className="flex-1"
                >
                  {applyRecommendationMutation.isPending ? "Processing..." : "Apply Now"}
                </Button>
                <Button 
                  onClick={() => setSelectedProduct(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}