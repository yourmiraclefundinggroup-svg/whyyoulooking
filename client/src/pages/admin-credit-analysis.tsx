import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AdminShell,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin";
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
  Download,
  Eye,
  Sparkles,
  TrendingDown,
  CreditCard,
  FileWarning,
} from "lucide-react";
import type { User, CreditReportUpload, CreditReportFinding } from "@shared/schema";

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
  const [selectedFinding, setSelectedFinding] = useState<CreditReportFinding | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: uploads = [] } = useQuery<CreditReportUpload[]>({
    queryKey: ['/api/admin/credit-report-uploads', selectedUserId],
    enabled: !!selectedUserId,
  });

  const { data: findings = [] } = useQuery<CreditReportFinding[]>({
    queryKey: ['/api/admin/credit-report-findings', selectedUserId],
    enabled: !!selectedUserId,
  });

  const clientUsers = users.filter(u => u.accessLevel !== "ADMIN");
  const selectedUser = users.find(u => u.id.toString() === selectedUserId);

  const uploadMutation = useMutation({
    mutationFn: async (data: { userId: string; fileName: string; fileData: string; fileType: string }) => {
      const response = await apiRequest("POST", "/api/admin/analyze-credit-report", JSON.stringify(data));
      return response.json();
    },
    onSuccess: (result) => {
      setAnalysisResult(result.aiAnalysis);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-report-uploads'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-report-findings'] });
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
    mutationFn: async (finding: CreditReportFinding) => {
      const response = await apiRequest("POST", "/api/admin/generate-finding-letter", JSON.stringify({
        findingId: finding.id,
        clientName: selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Client",
      }));
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedLetter(result.letter);
      toast({
        title: "Letter Generated",
        description: "Custom dispute letter created based on the specific issue.",
      });
    }
  });

  const handleFileSelect = (file: File) => {
    if (!selectedUserId) {
      toast({
        title: "Select Client",
        description: "Please select a client first.",
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
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'COLLECTION': return <DollarSign className="h-5 w-5" />;
      case 'LATE_PAYMENT': return <Clock className="h-5 w-5" />;
      case 'INQUIRY': return <Search className="h-5 w-5" />;
      case 'CHARGE_OFF': return <FileWarning className="h-5 w-5" />;
      case 'HIGH_UTILIZATION': return <CreditCard className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const collections = analysisResult?.issuesFound.filter(i => i.type === 'COLLECTION') || findings.filter(f => f.findingType === 'COLLECTION');
  const latePayments = analysisResult?.issuesFound.filter(i => i.type === 'LATE_PAYMENT') || findings.filter(f => f.findingType === 'LATE_PAYMENT');
  const inquiries = analysisResult?.issuesFound.filter(i => i.type === 'INQUIRY') || findings.filter(f => f.findingType === 'INQUIRY');
  const otherIssues = analysisResult?.issuesFound.filter(i => !['COLLECTION', 'LATE_PAYMENT', 'INQUIRY'].includes(i.type)) || findings.filter(f => !['COLLECTION', 'LATE_PAYMENT', 'INQUIRY'].includes(f.findingType));

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Brain className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
              Credit Report Analysis
            </h1>
            <p className="text-[hsl(var(--admin-text-muted))]">
              Upload Experian reports, analyze issues, and generate custom dispute letters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<Upload className="h-5 w-5" />}>Upload Report</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent className="space-y-4">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))]">Select Client</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clientUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragOver ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10' : 'border-[hsl(var(--admin-border))]'
                } ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                data-testid="upload-drop-zone"
              >
                {uploadMutation.isPending ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
                    <span className="text-[hsl(var(--admin-accent))]">Analyzing with AI...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto mb-3 text-[hsl(var(--admin-text-muted))]" />
                    <p className="text-white font-medium">Drop Experian Report</p>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">PDF, PNG, JPG supported</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  data-testid="file-input"
                />
              </div>

              {selectedUser && (
                <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Selected:</p>
                  <p className="font-medium text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-xs text-[hsl(var(--admin-text-subtle))]">{selectedUser.email}</p>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>

          <AdminCard className="lg:col-span-2">
            <AdminCardHeader>
              <AdminCardTitle icon={<Sparkles className="h-5 w-5" />}>
                Analysis Results
                {analysisResult && (
                  <Badge className="ml-2 bg-[hsl(var(--admin-accent))]">
                    {analysisResult.issuesFound.length} Issues Found
                  </Badge>
                )}
              </AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {!analysisResult && !uploadMutation.isPending ? (
                <AdminEmptyState
                  icon={<Brain className="h-8 w-8" />}
                  title="No Analysis Yet"
                  description="Upload a credit report to see AI-powered analysis results."
                />
              ) : uploadMutation.isPending ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--admin-accent))] mx-auto mb-4" />
                    <p className="text-white font-medium">AI is analyzing the credit report...</p>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">Extracting all negative items and strategies</p>
                  </div>
                </div>
              ) : analysisResult && (
                <div className="space-y-4">
                  {analysisResult.creditScore && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                      <div className="text-3xl font-bold text-white">{analysisResult.creditScore}</div>
                      <div>
                        <p className="text-sm text-blue-300">Credit Score Detected</p>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">From uploaded report</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="text-2xl font-bold text-red-400">{collections.length}</div>
                      <p className="text-xs text-red-300">Collections</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                      <div className="text-2xl font-bold text-orange-400">{latePayments.length}</div>
                      <p className="text-xs text-orange-300">Late Payments</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="text-2xl font-bold text-yellow-400">{inquiries.length}</div>
                      <p className="text-xs text-yellow-300">Inquiries</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400">{otherIssues.length}</div>
                      <p className="text-xs text-purple-300">Other</p>
                    </div>
                  </div>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </div>

        {analysisResult && analysisResult.issuesFound.length > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[hsl(var(--admin-accent))]">
                All Issues ({analysisResult.issuesFound.length})
              </TabsTrigger>
              <TabsTrigger value="collections" className="data-[state=active]:bg-[hsl(var(--admin-accent))]">
                Collections ({collections.length})
              </TabsTrigger>
              <TabsTrigger value="late" className="data-[state=active]:bg-[hsl(var(--admin-accent))]">
                Late Payments ({latePayments.length})
              </TabsTrigger>
              <TabsTrigger value="inquiries" className="data-[state=active]:bg-[hsl(var(--admin-accent))]">
                Inquiries ({inquiries.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4">
                {analysisResult.issuesFound.map((issue, idx) => (
                  <AdminCard key={idx}>
                    <AdminCardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getImpactColor(issue.impact)}`}>
                            {getTypeIcon(issue.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{issue.creditor}</h3>
                              <Badge className={getImpactColor(issue.impact)}>{issue.impact}</Badge>
                              <Badge variant="outline" className="text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]">
                                {issue.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-2">{issue.description}</p>
                            {issue.amount && (
                              <p className="text-lg font-bold text-[hsl(var(--admin-accent))]">${issue.amount.toLocaleString()}</p>
                            )}
                            <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                              <p className="text-xs text-blue-300 font-medium mb-1">Dispute Strategy:</p>
                              <p className="text-sm text-blue-200">{issue.suggestedAction}</p>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(25,95%,45%)]"
                          onClick={() => {
                            generateLetterMutation.mutate({
                              id: idx,
                              findingType: issue.type,
                              creditor: issue.creditor,
                              amount: issue.amount,
                              description: issue.description,
                              impact: issue.impact,
                              suggestedAction: issue.suggestedAction,
                            } as any);
                          }}
                          disabled={generateLetterMutation.isPending}
                          data-testid={`generate-letter-${idx}`}
                        >
                          {generateLetterMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              Generate Letter
                            </>
                          )}
                        </Button>
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="collections" className="mt-4">
              <div className="grid gap-4">
                {collections.length === 0 ? (
                  <AdminEmptyState icon={<CheckCircle className="h-8 w-8" />} title="No Collections" description="No collection accounts found." />
                ) : collections.map((issue: any, idx) => (
                  <AdminCard key={idx}>
                    <AdminCardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-red-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{issue.creditor}</h3>
                            <p className="text-sm text-[hsl(var(--admin-text-muted))]">{issue.description}</p>
                            {issue.amount && <p className="text-[hsl(var(--admin-accent))] font-bold">${issue.amount.toLocaleString()}</p>}
                          </div>
                        </div>
                        <Button size="sm" className="bg-[hsl(var(--admin-accent))]">
                          <FileText className="h-4 w-4 mr-2" />
                          Dispute
                        </Button>
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="late" className="mt-4">
              <div className="grid gap-4">
                {latePayments.length === 0 ? (
                  <AdminEmptyState icon={<CheckCircle className="h-8 w-8" />} title="No Late Payments" description="No late payment records found." />
                ) : latePayments.map((issue: any, idx) => (
                  <AdminCard key={idx}>
                    <AdminCardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{issue.creditor}</h3>
                            <p className="text-sm text-[hsl(var(--admin-text-muted))]">{issue.description}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-[hsl(var(--admin-accent))]">
                          <FileText className="h-4 w-4 mr-2" />
                          Goodwill Letter
                        </Button>
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="mt-4">
              <div className="grid gap-4">
                {inquiries.length === 0 ? (
                  <AdminEmptyState icon={<CheckCircle className="h-8 w-8" />} title="No Inquiries" description="No hard inquiries found." />
                ) : inquiries.map((issue: any, idx) => (
                  <AdminCard key={idx}>
                    <AdminCardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Search className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{issue.creditor}</h3>
                            <p className="text-sm text-[hsl(var(--admin-text-muted))]">{issue.description}</p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-[hsl(var(--admin-accent))]">
                          <FileText className="h-4 w-4 mr-2" />
                          Dispute Inquiry
                        </Button>
                      </div>
                    </AdminCardContent>
                  </AdminCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {generatedLetter && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Generated Dispute Letter</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="bg-white text-black p-6 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {generatedLetter}
              </div>
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLetter);
                    toast({ title: "Copied", description: "Letter copied to clipboard" });
                  }}
                  className="bg-[hsl(var(--admin-accent))]"
                >
                  Copy Letter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const w = window.open("", "_blank");
                    if (w) {
                      w.document.write(`<html><head><title>Dispute Letter</title><style>body{font-family:serif;margin:40px;line-height:1.6;white-space:pre-wrap;}</style></head><body>${generatedLetter}</body></html>`);
                      w.document.close();
                      w.print();
                    }
                  }}
                  className="border-[hsl(var(--admin-border))] text-white"
                >
                  Print Letter
                </Button>
              </div>
            </AdminCardContent>
          </AdminCard>
        )}

        {analysisResult && analysisResult.recommendations.length > 0 && (
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<TrendingDown className="h-5 w-5" />}>AI Recommendations</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-3">
                {analysisResult.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-200">{rec}</p>
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}
