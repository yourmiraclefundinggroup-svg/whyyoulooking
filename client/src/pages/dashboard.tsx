import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreditScoreCircle } from "@/components/credit-score-circle";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { FollowUpAlerts } from "@/components/follow-up-alerts";
import { ScoreShiftHeroLogo } from "@/components/scoreshift-logo";
import { SupportChat } from "@/components/support-chat";
import { formatCurrency, formatRelativeDate, getIssueTypeColor, getIssueTypeIcon, getDisputeStatusColor } from "@/lib/utils";
import { useUserContext } from "@/hooks/use-user-context";
import type { User, CreditReport, CreditIssue, Dispute, CreditGoal, EducationalContent, CreditBuildingAction } from "@shared/schema";

export default function Dashboard() {
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [simulatorModalOpen, setSimulatorModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();

  // Get current user from context
  const { user } = useUserContext();
  const userId = user?.id || 1;

  const { data: creditReport } = useQuery<CreditReport>({
    queryKey: ['/api/credit-reports'],
  });

  const { data: creditIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues'],
  });

  const { data: disputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes'],
  });

  const { data: creditGoal } = useQuery<CreditGoal>({
    queryKey: ['/api/credit-goals'],
  });

  const { data: educationalContent = [] } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content'],
  });

  const { data: creditBuildingActions = [] } = useQuery<CreditBuildingAction[]>({
    queryKey: ['/api/credit-building-actions'],
  });

  const handleDispute = (issue: CreditIssue) => {
    setSelectedIssue(issue);
    setDisputeModalOpen(true);
  };

  const activeIssues = creditIssues.filter(issue => issue.status === 'ACTIVE');
  const pendingDisputes = disputes.filter(dispute => dispute.status === 'PENDING');
  const resolvedIssues = creditIssues.filter(issue => issue.status === 'RESOLVED');

  const scoreProgress = creditGoal ? ((creditReport?.creditScore || 0) / creditGoal.targetScore) * 100 : 0;
  const issuesProgress = creditIssues.length > 0 ? (resolvedIssues.length / creditIssues.length) * 100 : 0;
  const accountAgeProgress = creditReport ? Math.min((creditReport.accountAge / 60) * 100, 100) : 0; // 60 months = 5 years target

  return (
    <>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Hero Section with ScoreShift Branding */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <ScoreShiftHeroLogo className="mb-4" />
            <h2 className="text-2xl font-bold leading-7 text-blue-900 sm:text-3xl">
              Welcome back, {user?.firstName || 'User'}!
            </h2>
            <p className="mt-2 text-blue-600 font-medium">Transform your credit score with AI-powered insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700">{creditReport?.creditScore || '---'}</div>
              <div className="text-sm text-blue-600">Current Score</div>
            </div>
            <div className="h-12 w-px bg-blue-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+23</div>
              <div className="text-sm text-green-600">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Score Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Primary Credit Score Card */}
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Current Credit Score</h3>
                <span className="text-xs text-gray-500">
                  Last updated: {creditReport ? formatRelativeDate(creditReport.lastUpdated) : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-center mb-6">
                {creditReport && <CreditScoreCircle score={creditReport.creditScore} />}
              </div>
              
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">Poor (300-579)</span>
                <span className="text-gray-500">Excellent (740-850)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <i className="fas fa-arrow-up text-green-600"></i>
                <span className="text-sm text-green-600 font-medium">+23 points this month</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
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
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-yellow-600 text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Pending Disputes</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingDisputes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check-circle text-green-600 text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Items Removed</p>
                    <p className="text-2xl font-bold text-green-600">{resolvedIssues.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Follow-up Alerts - High Priority */}
          <FollowUpAlerts />
          {/* Credit Report Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Credit Report Analysis</CardTitle>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
                  View Full Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${getIssueTypeColor(issue.type)}`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                        <i className={`${getIssueTypeIcon(issue.type)} text-white text-xs`}></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{issue.title}</h4>
                      <p className="text-sm">{issue.description}</p>
                      <p className="text-xs mt-1">
                        Impact: {issue.impact} points • Added: {formatRelativeDate(issue.dateAdded)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDispute(issue)}
                    >
                      Dispute
                    </Button>
                  </div>
                ))}
                {activeIssues.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                    <p>No active credit issues found!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dispute Management */}
          <Card>
            <CardHeader>
              <CardTitle>Active Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${getDisputeStatusColor(dispute.status)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        dispute.status === 'PENDING' ? 'bg-blue-600 animate-pulse' : 'bg-green-600'
                      }`}></div>
                      <div>
                        <h4 className="text-sm font-medium">
                          {dispute.bureau} - {creditIssues.find(i => i.id === dispute.issueId)?.title}
                        </h4>
                        <p className="text-sm">
                          Dispute sent on {formatRelativeDate(dispute.dateSent)}
                        </p>
                        <p className="text-xs">
                          {dispute.status === 'PENDING' 
                            ? `Response expected by ${formatRelativeDate(dispute.expectedResponse)}`
                            : `Completed on ${formatRelativeDate(dispute.actualResponse || dispute.dateSent)}`
                          }
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      dispute.status === 'PENDING' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {dispute.status}
                    </span>
                  </div>
                ))}
                {disputes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-file-alt text-gray-400 text-2xl mb-2"></i>
                    <p>No disputes filed yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Credit Analysis */}
          <AICreditAnalysis userId={userId} />

          {/* Credit Building Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Building Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {creditBuildingActions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg border ${
                      action.priority === 'HIGH' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        action.priority === 'HIGH' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        <i className="fas fa-credit-card text-white text-sm"></i>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        action.priority === 'HIGH' ? 'text-green-900' : 'text-blue-900'
                      }`}>
                        {action.title}
                      </h4>
                      <p className={`text-sm ${
                        action.priority === 'HIGH' ? 'text-green-700' : 'text-blue-700'
                      }`}>
                        {action.description}
                      </p>
                      <p className={`text-xs mt-1 ${
                        action.priority === 'HIGH' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        Potential impact: +{action.potentialImpact} points in {action.timeframe}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={action.priority === 'HIGH' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      Learn More
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Credit Score Goal</span>
                  <span className="font-medium">
                    {creditReport?.creditScore || 0} / {creditGoal?.targetScore || 720}
                  </span>
                </div>
                <Progress value={scoreProgress} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Issues Resolved</span>
                  <span className="font-medium">
                    {resolvedIssues.length} / {creditIssues.length}
                  </span>
                </div>
                <Progress value={issuesProgress} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Account Age</span>
                  <span className="font-medium">{creditReport?.accountAge || 0} months</span>
                </div>
                <Progress value={accountAgeProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full bg-trust-blue hover:bg-blue-700 flex items-center justify-center space-x-2"
                onClick={() => setDisputeModalOpen(true)}
              >
                <i className="fas fa-file-alt"></i>
                <span>Generate Dispute Letter</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
              >
                <i className="fas fa-sync-alt"></i>
                <span>Update Credit Report</span>
              </Button>
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => setSimulatorModalOpen(true)}
              >
                <i className="fas fa-calculator"></i>
                <span>Score Simulator</span>
              </Button>
            </CardContent>
          </Card>

          {/* Educational Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {educationalContent.slice(0, 3).map((content) => (
                  <a key={content.id} href="#" className="block">
                    {content.imageUrl && (
                      <img
                        src={content.imageUrl}
                        alt={content.title}
                        className="w-full h-24 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="text-sm font-medium text-gray-900">{content.title}</h4>
                    <p className="text-xs text-gray-600">{content.description}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <DisputeLetterModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        issue={selectedIssue}
      />

      <CreditSimulatorModal
        open={simulatorModalOpen}
        onOpenChange={setSimulatorModalOpen}
        currentScore={creditReport?.creditScore || 658}
      />

      {/* Support Chat Widget */}
      <SupportChat userId={userId} />
    </>
  );
}
