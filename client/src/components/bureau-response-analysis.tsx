import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Brain, CheckCircle, Clock, FileText, Target, TrendingUp, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BureauResponse {
  id: number;
  userId: number;
  disputeId?: number;
  bureau: "EXPERIAN" | "EQUIFAX" | "TRANSUNION";
  responseType: "VERIFIED" | "DELETED" | "UPDATED" | "FRIVOLOUS" | "PARTIAL";
  responseText: string;
  responseDate: string;
  documentUrl?: string;
  aiAnalysisId?: number;
  nextStepGenerated: boolean;
  createdAt: string;
}

interface BureauResponseAnalysis {
  id: number;
  responseId: number;
  analysisResult: string;
  rejectionReasons: string[];
  recommendedActions: string;
  successProbability: number;
  strategyType: "ESCALATION" | "REWRITE" | "DOCUMENTATION" | "VALIDATION" | "LEGAL";
  nextDisputeTemplate: string;
  confidenceScore: number;
  processingTime?: number;
  createdAt: string;
}

interface AIAnalysisResult {
  analysis: string;
  rejectionReasons: string[];
  recommendedActions: Array<{
    action: string;
    priority: string;
    timeframe: string;
    description: string;
  }>;
  successProbability: number;
  strategyType: "ESCALATION" | "REWRITE" | "DOCUMENTATION" | "VALIDATION" | "LEGAL";
  nextDisputeTemplate: string;
  confidenceScore: number;
}

interface BureauResponseAnalysisProps {
  userId?: number;
}

export function BureauResponseAnalysis({ userId = 2 }: BureauResponseAnalysisProps) {
  const [newResponseText, setNewResponseText] = useState("");
  const [selectedBureau, setSelectedBureau] = useState<string>("");
  const [selectedResponseType, setSelectedResponseType] = useState<string>("");
  const [selectedResponse, setSelectedResponse] = useState<BureauResponse | null>(null);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bureau responses
  const { data: responses = [], isLoading } = useQuery({
    queryKey: ["/api/bureau-responses", userId],
    queryFn: () => apiRequest(`/api/bureau-responses/${userId}`)
  });

  // Create new bureau response
  const createResponseMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/bureau-responses", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bureau-responses", userId] });
      setNewResponseText("");
      setSelectedBureau("");
      setSelectedResponseType("");
      setShowAnalysisForm(false);
      toast({ description: "Bureau response added successfully" });
    },
    onError: () => {
      toast({ description: "Failed to add bureau response", variant: "destructive" });
    }
  });

  // Analyze bureau response with AI
  const analyzeResponseMutation = useMutation({
    mutationFn: (responseId: number) => apiRequest(`/api/bureau-response/${responseId}/analyze`, { method: "POST" }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bureau-responses", userId] });
      setSelectedResponse(data.response);
      toast({ description: "AI analysis completed successfully" });
    },
    onError: () => {
      toast({ description: "Failed to analyze bureau response", variant: "destructive" });
    }
  });

  const handleCreateResponse = () => {
    if (!newResponseText.trim() || !selectedBureau || !selectedResponseType) {
      toast({ description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    createResponseMutation.mutate({
      userId,
      bureau: selectedBureau,
      responseType: selectedResponseType,
      responseText: newResponseText,
      responseDate: new Date().toISOString(),
      nextStepGenerated: false
    });
  };

  const handleAnalyzeResponse = (response: BureauResponse) => {
    setSelectedResponse(response);
    analyzeResponseMutation.mutate(response.id);
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case "DELETED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "VERIFIED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "FRIVOLOUS": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "UPDATED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case "ESCALATION": return <TrendingUp className="h-4 w-4" />;
      case "REWRITE": return <FileText className="h-4 w-4" />;
      case "DOCUMENTATION": return <AlertCircle className="h-4 w-4" />;
      case "VALIDATION": return <CheckCircle className="h-4 w-4" />;
      case "LEGAL": return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "text-red-600 dark:text-red-400";
      case "MEDIUM": return "text-yellow-600 dark:text-yellow-400";
      case "LOW": return "text-green-600 dark:text-green-400";
      default: return "text-gray-600 dark:text-gray-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bureau Response Analysis</h2>
          <p className="text-slate-600 dark:text-slate-300">
            AI-powered analysis of credit bureau responses and strategic escalation recommendations
          </p>
        </div>
        <Button 
          onClick={() => setShowAnalysisForm(!showAnalysisForm)}
          className="bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          <Brain className="mr-2 h-4 w-4" />
          Add Response
        </Button>
      </div>

      {showAnalysisForm && (
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Add Bureau Response</CardTitle>
            <CardDescription>
              Upload or paste a bureau response for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Credit Bureau</label>
                <Select value={selectedBureau} onValueChange={setSelectedBureau}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bureau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXPERIAN">Experian</SelectItem>
                    <SelectItem value="EQUIFAX">Equifax</SelectItem>
                    <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Response Type</label>
                <Select value={selectedResponseType} onValueChange={setSelectedResponseType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select response type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">Verified</SelectItem>
                    <SelectItem value="DELETED">Deleted</SelectItem>
                    <SelectItem value="UPDATED">Updated</SelectItem>
                    <SelectItem value="FRIVOLOUS">Frivolous</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Response Text</label>
              <Textarea
                value={newResponseText}
                onChange={(e) => setNewResponseText(e.target.value)}
                placeholder="Paste the complete bureau response letter here..."
                className="min-h-[150px] mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateResponse}
                disabled={createResponseMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {createResponseMutation.isPending ? "Adding..." : "Add & Analyze"}
              </Button>
              <Button variant="outline" onClick={() => setShowAnalysisForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {responses.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Brain className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No Bureau Responses Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Add bureau responses to get AI-powered analysis and strategic recommendations
                </p>
                <Button 
                  onClick={() => setShowAnalysisForm(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Add First Response
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          responses.map((response: BureauResponse) => (
            <ResponseAnalysisCard 
              key={response.id} 
              response={response} 
              onAnalyze={handleAnalyzeResponse}
              isAnalyzing={analyzeResponseMutation.isPending && selectedResponse?.id === response.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ResponseAnalysisCardProps {
  response: BureauResponse;
  onAnalyze: (response: BureauResponse) => void;
  isAnalyzing: boolean;
}

function ResponseAnalysisCard({ response, onAnalyze, isAnalyzing }: ResponseAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<BureauResponseAnalysis | null>(null);
  
  // Fetch analysis if it exists
  const { data: analysisData } = useQuery({
    queryKey: ["/api/bureau-response-analysis", response.id],
    queryFn: () => apiRequest(`/api/bureau-response-analysis/${response.id}`),
    enabled: !!response.aiAnalysisId
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case "DELETED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "VERIFIED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "FRIVOLOUS": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "UPDATED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getStrategyTypeIcon = (type: string) => {
    switch (type) {
      case "ESCALATION": return <TrendingUp className="h-4 w-4" />;
      case "REWRITE": return <FileText className="h-4 w-4" />;
      case "DOCUMENTATION": return <AlertCircle className="h-4 w-4" />;
      case "VALIDATION": return <CheckCircle className="h-4 w-4" />;
      case "LEGAL": return <Target className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const parsedAnalysis = analysisData ? JSON.parse(analysisData.recommendedActions) : null;

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getResponseTypeColor(response.responseType)}>
              {response.responseType}
            </Badge>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {response.bureau}
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {formatDate(response.responseDate)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {response.nextStepGenerated ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="mr-1 h-3 w-3" />
                Analyzed
              </Badge>
            ) : (
              <Button 
                onClick={() => onAnalyze(response)}
                disabled={isAnalyzing}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-3 w-3" />
                    Analyze
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!analysisData}>
              Analysis {analysisData && <Badge className="ml-2">AI</Badge>}
            </TabsTrigger>
            <TabsTrigger value="next-steps" disabled={!analysisData}>
              Next Steps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="response" className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                {response.responseText}
              </p>
            </div>
          </TabsContent>
          
          {analysisData && (
            <>
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysisData.successProbability}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {analysisData.confidenceScore}%
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">AI Confidence</div>
                  </div>
                  <div className="text-center flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      {getStrategyTypeIcon(analysisData.strategyType)}
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {analysisData.strategyType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Analysis</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {JSON.parse(analysisData.analysisResult).summary || "Analysis completed successfully."}
                  </p>
                </div>
                
                {analysisData.rejectionReasons && analysisData.rejectionReasons.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Rejection Reasons</h4>
                    <ul className="space-y-1">
                      {analysisData.rejectionReasons.map((reason, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <XCircle className="h-3 w-3 text-red-500" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="next-steps" className="space-y-4">
                {parsedAnalysis && parsedAnalysis.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Recommended Actions</h4>
                    <div className="space-y-3">
                      {parsedAnalysis.map((action: any, index: number) => (
                        <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-slate-900 dark:text-slate-100">{action.action}</h5>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`text-xs ${
                                action.priority === 'HIGH' ? 'border-red-500 text-red-600' :
                                action.priority === 'MEDIUM' ? 'border-yellow-500 text-yellow-600' :
                                'border-green-500 text-green-600'
                              }`}>
                                {action.priority}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                {action.timeframe}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{action.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysisData.nextDisputeTemplate && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Generated Dispute Template</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {analysisData.nextDisputeTemplate}
                      </pre>
                    </div>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}