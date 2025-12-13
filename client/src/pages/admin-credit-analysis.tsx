import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AdminShell } from "@/components/admin";
import {
  Upload,
  FileText,
  Brain,
  AlertTriangle,
  DollarSign,
  Search,
  Clock,
  CheckCircle,
  Loader2,
  Copy,
  Printer,
  Sparkles,
  CreditCard,
  FileWarning,
  User,
  TrendingDown,
  ChevronRight,
  FileUp,
  Zap,
  Target,
  Shield,
} from "lucide-react";
import type { User as UserType, CreditReportUpload, CreditReportFinding } from "@shared/schema";

interface AIAnalysis {
  creditScore: number | null;
  issuesFound: Array<{
    type: string;
    creditor: string;
    amount: number | null;
    description: string;
    impact: string;
    suggestedAction: string;
  }>;
  recommendations: string[];
}

export default function AdminCreditAnalysis() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysis | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ['/api/users'],
  });

  const clientUsers = users.filter(u => u.accessLevel !== "ADMIN");
  const selectedUser = users.find(u => u.id.toString() === selectedUserId);

  const uploadMutation = useMutation({
    mutationFn: async (data: { userId: string; fileName: string; fileData: string; fileType: string }) => {
      const response = await apiRequest("POST", "/api/admin/upload-credit-report", JSON.stringify(data));
      return response.json();
    },
    onSuccess: (result) => {
      setAnalysisResult(result.aiAnalysis);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-report-uploads'] });
      toast({
        title: "Analysis Complete",
        description: `Found ${result.aiAnalysis.issuesFound.length} items to review.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze credit report",
        variant: "destructive",
      });
    }
  });

  const generateLetterMutation = useMutation({
    mutationFn: async (issue: { type: string; creditor: string; amount: number | null; description: string; suggestedAction: string }) => {
      const response = await apiRequest("POST", "/api/admin/generate-dispute-letter", JSON.stringify({
        issue,
        clientName: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Client",
      }));
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedLetter(result.letter);
      toast({
        title: "Letter Generated",
        description: "Custom dispute letter created.",
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (!selectedUserId) {
      toast({
        title: "Select Client First",
        description: "Please choose a client before uploading.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      const base64Data = fileData.split(',')[1];
      uploadMutation.mutate({
        userId: selectedUserId,
        fileName: file.name,
        fileData: base64Data,
        fileType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toUpperCase()) {
      case 'HIGH': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'LOW': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getImpactBg = (impact: string) => {
    switch (impact.toUpperCase()) {
      case 'HIGH': return 'from-red-500/20 to-red-500/5';
      case 'MEDIUM': return 'from-amber-500/20 to-amber-500/5';
      case 'LOW': return 'from-emerald-500/20 to-emerald-500/5';
      default: return 'from-slate-500/20 to-slate-500/5';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'COLLECTION': return <DollarSign className="h-4 w-4" />;
      case 'LATE_PAYMENT': return <Clock className="h-4 w-4" />;
      case 'INQUIRY': return <Search className="h-4 w-4" />;
      case 'CHARGE_OFF': return <FileWarning className="h-4 w-4" />;
      case 'HIGH_UTILIZATION': return <CreditCard className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const allIssues = analysisResult?.issuesFound || [];
  const collections = allIssues.filter(i => i.type === 'COLLECTION');
  const latePayments = allIssues.filter(i => i.type === 'LATE_PAYMENT');
  const inquiries = allIssues.filter(i => i.type === 'INQUIRY');
  const highImpactCount = allIssues.filter(i => i.impact === 'HIGH').length;

  const getFilteredIssues = () => {
    switch (activeTab) {
      case 'collections': return collections;
      case 'late': return latePayments;
      case 'inquiries': return inquiries;
      default: return allIssues;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-950 border border-slate-700/50 p-8">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Credit Report Analysis</h1>
                  <p className="text-slate-400 text-sm">AI-powered credit report scanning and dispute generation</p>
                </div>
              </div>
            </div>

            {analysisResult && (
              <div className="flex flex-wrap gap-4">
                <div className="bg-slate-800/60 backdrop-blur rounded-xl px-5 py-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Credit Score</div>
                  <div className="text-2xl font-bold text-white">{analysisResult.creditScore || '---'}</div>
                </div>
                <div className="bg-slate-800/60 backdrop-blur rounded-xl px-5 py-3 border border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Issues Found</div>
                  <div className="text-2xl font-bold text-white">{allIssues.length}</div>
                </div>
                <div className="bg-red-500/10 backdrop-blur rounded-xl px-5 py-3 border border-red-500/20">
                  <div className="text-xs text-red-400 uppercase tracking-wider mb-1">High Impact</div>
                  <div className="text-2xl font-bold text-red-400">{highImpactCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Sidebar - Client & Upload */}
          <div className="xl:col-span-4 space-y-6">
            {/* Client Selection Card */}
            <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-white text-sm">Select Client</span>
                </div>
              </div>
              <div className="p-5">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full bg-slate-800/60 border-slate-700 text-white h-11" data-testid="client-selector">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                          {user.firstName} {user.lastName}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUser && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-medium">
                        {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                        <p className="text-xs text-slate-400">{selectedUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Card */}
            <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <FileUp className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-white text-sm">Upload Credit Report</span>
                </div>
              </div>
              <div className="p-5">
                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all ${
                    dragOver 
                      ? 'border-orange-500 bg-orange-500/10' 
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                  } ${uploadMutation.isPending ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => !uploadMutation.isPending && fileInputRef.current?.click()}
                  data-testid="upload-drop-zone"
                >
                  <div className="p-8 text-center">
                    {uploadMutation.isPending ? (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center">
                          <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Analyzing Report...</p>
                          <p className="text-sm text-slate-400">AI is extracting credit issues</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Upload className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Drop file here or click to browse</p>
                          <p className="text-sm text-slate-400">PDF, PNG, or JPG up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    data-testid="file-input"
                  />
                </div>

                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 h-11"
                  disabled={!selectedUserId || uploadMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-button"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Experian Report
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            {analysisResult && (
              <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-white text-sm">Issue Breakdown</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-slate-300">Collections</span>
                    </div>
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">{collections.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-sm text-slate-300">Late Payments</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">{latePayments.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-slate-300">Inquiries</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">{inquiries.length}</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Analysis Results */}
          <div className="xl:col-span-8 space-y-6">
            {!analysisResult ? (
              <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center mb-6 border border-slate-700">
                  <Sparkles className="h-10 w-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Analysis Yet</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Select a client and upload their Experian credit report to begin AI-powered analysis.
                </p>
              </div>
            ) : (
              <>
                {/* Tab Navigation */}
                <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 overflow-hidden">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-4 pt-4 pb-0">
                      <TabsList className="w-full justify-start bg-slate-800/50 p-1 gap-1">
                        <TabsTrigger 
                          value="all" 
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4"
                        >
                          All Issues
                          <Badge className="ml-2 bg-slate-700/50 text-xs">{allIssues.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="collections"
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4"
                        >
                          Collections
                          <Badge className="ml-2 bg-slate-700/50 text-xs">{collections.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="late"
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4"
                        >
                          Late Payments
                          <Badge className="ml-2 bg-slate-700/50 text-xs">{latePayments.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger 
                          value="inquiries"
                          className="data-[state=active]:bg-orange-500 data-[state=active]:text-white px-4"
                        >
                          Inquiries
                          <Badge className="ml-2 bg-slate-700/50 text-xs">{inquiries.length}</Badge>
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-4">
                      <TabsContent value={activeTab} className="mt-0">
                        <div className="space-y-3">
                          {getFilteredIssues().length === 0 ? (
                            <div className="text-center py-8">
                              <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                              <p className="text-white font-medium">No issues in this category</p>
                              <p className="text-slate-400 text-sm">This is great news for your client!</p>
                            </div>
                          ) : (
                            getFilteredIssues().map((issue, idx) => (
                              <div 
                                key={idx}
                                className={`rounded-xl bg-gradient-to-r ${getImpactBg(issue.impact)} border border-slate-700/50 overflow-hidden transition-all hover:border-slate-600`}
                              >
                                <div className="p-5">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                      <div className={`p-2.5 rounded-lg ${getImpactColor(issue.impact)} border`}>
                                        {getTypeIcon(issue.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                          <h3 className="font-semibold text-white truncate">{issue.creditor}</h3>
                                          <Badge className={`${getImpactColor(issue.impact)} border text-xs`}>
                                            {issue.impact}
                                          </Badge>
                                          <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs">
                                            {getTypeLabel(issue.type)}
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-2">{issue.description}</p>
                                        {issue.amount && (
                                          <p className="text-lg font-bold text-orange-400">${issue.amount.toLocaleString()}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                                      onClick={() => generateLetterMutation.mutate({
                                        type: issue.type,
                                        creditor: issue.creditor,
                                        amount: issue.amount,
                                        description: issue.description,
                                        suggestedAction: issue.suggestedAction,
                                      })}
                                      disabled={generateLetterMutation.isPending}
                                      data-testid={`generate-letter-${idx}`}
                                    >
                                      {generateLetterMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <Zap className="h-4 w-4 mr-1.5" />
                                          Generate Letter
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                  
                                  {issue.suggestedAction && (
                                    <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                      <div className="flex items-start gap-2">
                                        <Shield className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                                        <div>
                                          <p className="text-xs font-medium text-blue-400 mb-0.5">Recommended Strategy</p>
                                          <p className="text-sm text-slate-300">{issue.suggestedAction}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Generated Letter Preview */}
                {generatedLetter && (
                  <div className="rounded-xl bg-slate-900/60 backdrop-blur border border-slate-800 overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-white text-sm">Generated Dispute Letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLetter);
                            toast({ title: "Copied!", description: "Letter copied to clipboard" });
                          }}
                          data-testid="copy-letter-btn"
                        >
                          <Copy className="h-4 w-4 mr-1.5" />
                          Copy
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white"
                          onClick={() => {
                            const w = window.open("", "_blank");
                            if (w) {
                              w.document.write(`<pre style="font-family: 'Times New Roman', serif; white-space: pre-wrap; padding: 40px; max-width: 800px; margin: 0 auto;">${generatedLetter}</pre>`);
                              w.document.close();
                              w.print();
                            }
                          }}
                          data-testid="print-letter-btn"
                        >
                          <Printer className="h-4 w-4 mr-1.5" />
                          Print
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="p-6">
                        <div className="bg-white text-slate-900 p-8 rounded-lg shadow-sm font-mono text-sm whitespace-pre-wrap leading-relaxed">
                          {generatedLetter}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
