import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatRelativeDate, getIssueTypeColor, getIssueTypeIcon, getDisputeStatusColor } from "@/lib/utils";
import type { CreditIssue, Dispute } from "@shared/schema";

export default function CreditRepair() {
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Hardcoded user ID for demo
  const userId = 1;

  const { data: creditIssues = [], isLoading: issuesLoading } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues', userId],
  });

  const { data: disputes = [], isLoading: disputesLoading } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', userId],
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<CreditIssue> }) => {
      const response = await apiRequest("PATCH", `/api/credit-issues/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-issues', userId] });
      toast({
        title: "Success",
        description: "Issue updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update issue",
        variant: "destructive",
      });
    },
  });

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
  };

  const handleMarkResolved = (issue: CreditIssue) => {
    updateIssueMutation.mutate({
      id: issue.id,
      updates: { status: 'RESOLVED' }
    });
  };

  const activeIssues = creditIssues.filter(issue => issue.status === 'ACTIVE');
  const disputedIssues = creditIssues.filter(issue => issue.status === 'DISPUTED');
  const resolvedIssues = creditIssues.filter(issue => issue.status === 'RESOLVED');

  const pendingDisputes = disputes.filter(dispute => dispute.status === 'PENDING');
  const resolvedDisputes = disputes.filter(dispute => dispute.status === 'RESOLVED');

  if (issuesLoading || disputesLoading) {
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
        <h1 className="text-3xl font-bold text-gray-900">Credit Repair</h1>
        <p className="mt-2 text-gray-600">
          Identify and dispute negative items on your credit report to improve your credit score.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-600 text-sm"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Active Issues</p>
                <p className="text-2xl font-bold text-red-600">{activeIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-gavel text-yellow-600 text-sm"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Disputed</p>
                <p className="text-2xl font-bold text-yellow-600">{disputedIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-check-circle text-green-600 text-sm"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedIssues.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-clock text-blue-600 text-sm"></i>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Pending Disputes</p>
                <p className="text-2xl font-bold text-blue-600">{pendingDisputes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="issues">Credit Issues</TabsTrigger>
          <TabsTrigger value="disputes">Dispute Management</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-6">
          {/* Active Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Active Credit Issues</span>
                <Badge variant="destructive">{activeIssues.length} Issues</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${getIssueTypeColor(issue.type)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <i className={`${getIssueTypeIcon(issue.type)} text-white text-sm`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{issue.title}</h4>
                          <p className="text-sm text-gray-600">{issue.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Creditor: {issue.creditor}</span>
                            {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                            <span>Impact: {issue.impact} points</span>
                            <span>Added: {formatRelativeDate(issue.dateAdded)}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {issue.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => handleDispute(issue)}
                      >
                        Dispute
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkResolved(issue)}
                        disabled={updateIssueMutation.isPending}
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                ))}
                {activeIssues.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-check-circle text-green-600 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Issues</h3>
                    <p className="text-gray-600">
                      Great! You don't have any active credit issues to address.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resolved Issues */}
          {resolvedIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resolved Issues</span>
                  <Badge variant="secondary">{resolvedIssues.length} Resolved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                          <i className="fas fa-check text-white text-sm"></i>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-900">{issue.title}</h4>
                        <p className="text-sm text-green-700">{issue.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                          <span>Creditor: {issue.creditor}</span>
                          {issue.amount && <span>Amount: {formatCurrency(issue.amount)}</span>}
                          <span>Was impacting: {Math.abs(issue.impact)} points</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600">Resolved</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="disputes" className="space-y-6">
          {/* Pending Disputes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Disputes</span>
                <Badge variant="secondary">{pendingDisputes.length} Pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDisputes.map((dispute) => {
                  const issue = creditIssues.find(i => i.id === dispute.issueId);
                  return (
                    <div
                      key={dispute.id}
                      className={`flex items-start space-x-4 p-4 rounded-lg border ${getDisputeStatusColor(dispute.status)}`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-900">
                          {dispute.bureau} - {issue?.title}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {issue?.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-blue-600">
                          <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                          <span>Expected Response: {formatRelativeDate(dispute.expectedResponse)}</span>
                          <span>Bureau: {dispute.bureau}</span>
                        </div>
                      </div>
                      <Badge className="bg-blue-600">Pending</Badge>
                    </div>
                  );
                })}
                {pendingDisputes.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-file-alt text-gray-400 text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Disputes</h3>
                    <p className="text-gray-600">
                      You don't have any disputes currently pending with credit bureaus.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resolved Disputes */}
          {resolvedDisputes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Resolved Disputes</span>
                  <Badge variant="secondary">{resolvedDisputes.length} Resolved</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resolvedDisputes.map((dispute) => {
                    const issue = creditIssues.find(i => i.id === dispute.issueId);
                    return (
                      <div
                        key={dispute.id}
                        className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-check text-white text-sm"></i>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-green-900">
                            {dispute.bureau} - {issue?.title}
                          </h4>
                          <p className="text-sm text-green-700">
                            Successfully resolved and removed from credit report
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-green-600">
                            <span>Sent: {formatRelativeDate(dispute.dateSent)}</span>
                            <span>Resolved: {formatRelativeDate(dispute.actualResponse || dispute.dateSent)}</span>
                            <span>Bureau: {dispute.bureau}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-600">Resolved</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <DisputeLetterModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        issue={selectedIssue}
      />
    </div>
  );
}
