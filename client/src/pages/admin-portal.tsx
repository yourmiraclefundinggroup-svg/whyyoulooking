import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { AdminUSPSTracking } from "@/components/admin-usps-tracking";
import { FollowUpAlerts } from "@/components/follow-up-alerts";
import { BureauResponseAnalysis } from "@/components/bureau-response-analysis";
import { SecureChat } from "@/components/secure-chat";
import { AdminSettings } from "@/components/admin-settings";
import { User, CreditReport, CreditIssue, Dispute } from "@shared/schema";
import { Users, FileText, AlertTriangle, Send, Settings, Menu, X, TrendingUp, Shield, UserPlus, Brain, BarChart, CheckSquare, Clock, CalendarDays, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPortal() {
  const { user, isAdmin, logout } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">This portal is restricted to administrators only.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Navigation items for admin portal
  const adminNavItems = [
    { href: "/admin-portal", label: "Client Management", icon: Users },
    { href: "/admin-portal/disputes", label: "Dispute Center", icon: Send },
    { href: "/admin-portal/bureau-analysis", label: "Bureau Analysis", icon: Brain },
    { href: "/admin-portal/chat", label: "Client Communication", icon: MessageCircle },
    { href: "/admin-portal/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/admin-portal/settings", label: "Settings", icon: Settings },
  ];

  // Get all users for client management
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");
  const selectedClient = selectedClientId ? allUsers.find(u => u.id === selectedClientId) : null;

  // Get selected client's data
  const { data: clientCreditReport } = useQuery<CreditReport>({
    queryKey: ['/api/credit-reports', selectedClientId],
    enabled: !!selectedClientId,
  });

  const { data: clientIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues', selectedClientId],
    enabled: !!selectedClientId,
  });

  const { data: clientDisputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', selectedClientId],
    enabled: !!selectedClientId,
  });

  // Create new client mutation
  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", email: "" });
  const createClientMutation = useMutation({
    mutationFn: async (clientData: { firstName: string; lastName: string; email: string }) => {
      const response = await apiRequest("POST", "/api/users", {
        ...clientData,
        accessLevel: "STANDARD",
        isTestUser: true
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      setNewClient({ firstName: "", lastName: "", email: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      });
    },
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.firstName && newClient.lastName && newClient.email) {
      createClientMutation.mutate(newClient);
    }
  };

  // Determine which page content to show based on location
  const renderPageContent = () => {
    if (location === "/admin-portal" || location === "/admin-portal/") {
      return <ClientManagementPage 
        clientUsers={clientUsers}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        selectedClient={selectedClient}
        clientCreditReport={clientCreditReport}
        clientIssues={clientIssues}
        clientDisputes={clientDisputes}
        newClient={newClient}
        setNewClient={setNewClient}
        handleCreateClient={handleCreateClient}
        createClientMutation={createClientMutation}
      />;
    } else if (location === "/admin-portal/disputes") {
      return <DisputeCenterPage 
        selectedClient={selectedClient}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        clientUsers={clientUsers}
        clientCreditReport={clientCreditReport}
        clientIssues={clientIssues}
        setSelectedIssue={setSelectedIssue}
        setDisputeModalOpen={setDisputeModalOpen}
      />;
    } else if (location === "/admin-portal/bureau-analysis") {
      return <BureauAnalysisPage />;
    } else if (location === "/admin-portal/chat") {
      return <ClientCommunicationPage 
        clientUsers={clientUsers}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        selectedClient={selectedClient}
      />;
    } else if (location === "/admin-portal/analytics") {
      return <AnalyticsPage clientUsers={clientUsers} />;
    } else if (location === "/admin-portal/settings") {
      return <SettingsPage />;
    }
    return <ClientManagementPage 
      clientUsers={clientUsers}
      selectedClientId={selectedClientId}
      setSelectedClientId={setSelectedClientId}
      selectedClient={selectedClient}
      clientCreditReport={clientCreditReport}
      clientIssues={clientIssues}
      clientDisputes={clientDisputes}
      newClient={newClient}
      setNewClient={setNewClient}
      handleCreateClient={handleCreateClient}
      createClientMutation={createClientMutation}
    />;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/admin-portal">
                  <div className="flex items-center cursor-pointer">
                    <Shield className="h-8 w-8 text-orange-400 mr-3" />
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-white">CreditFix Pro</h1>
                      <p className="text-xs text-orange-300 font-medium">ADMIN PORTAL</p>
                    </div>
                  </div>
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-10 md:flex md:space-x-8">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-2",
                          location === item.href
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-slate-300 hover:text-white hover:bg-slate-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            {/* Admin User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center text-sm">
                <div className="text-right mr-3">
                  <div className="font-medium text-white">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-orange-300">Administrator</div>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Logout
              </Button>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-700 border-t border-slate-600">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium cursor-pointer",
                        location === item.href
                          ? "bg-orange-500 text-white"
                          : "text-slate-300 hover:bg-slate-600 hover:text-white"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderPageContent()}
        </div>
      </main>

      {/* Modals */}
      <DisputeLetterModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        issue={selectedIssue}
      />
    </div>
  );
}

// Client Management Page Component
function ClientManagementPage({ 
  clientUsers, selectedClientId, setSelectedClientId, selectedClient, 
  clientCreditReport, clientIssues, clientDisputes, newClient, setNewClient, 
  handleCreateClient, createClientMutation 
}: any) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="h-7 w-7 text-orange-500" />
              Client Management
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage client accounts and access their credit repair tools.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{clientUsers.length}</div>
            <div className="text-sm text-slate-600">Active Clients</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Client */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Add New Client
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={createClientMutation.isPending}
                className="w-full"
              >
                {createClientMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Client List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Accounts ({clientUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientUsers.map((client: User) => (
                <Button
                  key={client.id}
                  variant={selectedClientId === client.id ? "default" : "outline"}
                  className={`w-full p-4 h-auto justify-start ${
                    selectedClientId === client.id
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <div className="font-medium">
                        {client.firstName} {client.lastName}
                      </div>
                      <div className="text-sm opacity-75">{client.email}</div>
                    </div>
                    {selectedClientId === client.id && (
                      <div className="text-right">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Client Details */}
      {selectedClient && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Client: {selectedClient.firstName} {selectedClient.lastName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {clientCreditReport?.creditScore || '---'}
                </div>
                <p className="text-sm text-gray-600">Credit Score</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {clientIssues.length}
                </div>
                <p className="text-sm text-gray-600">Active Issues</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {clientDisputes.filter((d: Dispute) => d.status === 'PENDING').length}
                </div>
                <p className="text-sm text-gray-600">Pending Disputes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {clientDisputes.length}
                </div>
                <p className="text-sm text-gray-600">Total Disputes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Dispute Center Page Component
function DisputeCenterPage({ 
  selectedClient, selectedClientId, setSelectedClientId, clientUsers, 
  clientCreditReport, clientIssues, setSelectedIssue, setDisputeModalOpen 
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dispute Center</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage disputes and track USPS delivery status for client communications.
        </p>
      </div>

      {!selectedClient ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Select a Client First</h3>
              <p className="text-yellow-700 mb-4">
                Choose a client to access their dispute management and USPS tracking tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {clientUsers.map((client: User) => (
                  <Button
                    key={client.id}
                    variant="outline"
                    className="p-3 h-auto"
                    onClick={() => setSelectedClientId(client.id)}
                  >
                    <div className="text-center">
                      <div className="font-medium">{client.firstName} {client.lastName}</div>
                      <div className="text-xs text-gray-600">{client.email}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selected Client Header */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-sm text-blue-700">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {clientCreditReport?.creditScore || '---'}
                  </div>
                  <p className="text-sm text-blue-700">Credit Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* USPS Tracking Section */}
          <AdminUSPSTracking userId={selectedClient.id} />

          {/* Follow-up Alerts */}
          <FollowUpAlerts />

          {/* AI Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Credit Analysis */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="text-blue-600 mr-2 h-5 w-5" />
                  AI Credit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  AI-powered analysis and personalized recommendations for this client's credit profile.
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                  <AICreditAnalysis userId={selectedClient.id} />
                </div>
              </CardContent>
            </Card>

            {/* Credit Score Simulator */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="text-green-600 mr-2 h-5 w-5" />
                  Credit Score Simulator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Simulate potential credit score improvements for client presentations.
                </p>
                {clientCreditReport ? (
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // This would open the simulator modal
                      }}
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Run Score Simulation
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No credit report available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dispute Letter Generation */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="text-purple-600 mr-2 h-5 w-5" />
                AI Dispute Letter Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-6">
                Generate professional, legally compliant dispute letters using AI for each credit issue.
              </p>
              
              {clientIssues.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {clientIssues.map((issue: CreditIssue) => (
                      <Card key={issue.id} className="border-gray-200 hover:border-purple-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{issue.title}</h4>
                              <p className="text-sm text-gray-600">{issue.creditor}</p>
                              {issue.amount && (
                                <p className="text-sm font-medium text-red-600">
                                  ${issue.amount.toLocaleString()}
                                </p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {issue.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            Impact: <span className="font-medium text-red-600">{Math.abs(issue.impact)} points</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setDisputeModalOpen(true);
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Generate AI Letter
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No credit issues found for this client.</p>
                  <p className="text-sm mt-2">Credit issues will appear here once a credit report is added.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Analytics Page Component
function AnalyticsPage({ clientUsers }: { clientUsers: User[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-600">
          View performance metrics and client statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clientUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Issues</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disputes Sent</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Features Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              AI Features Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { feature: "Bureau Response Analysis", usage: 24, trend: "+12%" },
                { feature: "Credit Utilization Optimizer", usage: 18, trend: "+8%" },
                { feature: "Loan Readiness Assessment", usage: 15, trend: "+15%" },
                { feature: "Dispute Letter Generation", usage: 32, trend: "+22%" },
                { feature: "Identity Theft Recovery", usage: 6, trend: "+3%" },
                { feature: "Financial Behavior Coaching", usage: 11, trend: "+18%" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.feature}</p>
                    <p className="text-xs text-gray-600">{item.usage} uses this month</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-green-700 bg-green-100">
                      {item.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-600" />
              Credit Score Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "Sarah M.", improvement: "+87 pts", timeframe: "3 months" },
                { client: "Michael R.", improvement: "+65 pts", timeframe: "4 months" },
                { client: "Jennifer L.", improvement: "+52 pts", timeframe: "2 months" },
                { client: "David K.", improvement: "+94 pts", timeframe: "5 months" },
                { client: "Lisa W.", improvement: "+71 pts", timeframe: "3 months" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{item.client}</p>
                    <p className="text-xs text-gray-600">{item.timeframe}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{item.improvement}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Integrations Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Integrations Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">Bank Account Integration</span>
              </div>
              <p className="text-sm text-gray-600">18 active connections</p>
              <p className="text-xs text-green-700 mt-1">256-bit AES encrypted</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Tax Software Integration</span>
              </div>
              <p className="text-sm text-gray-600">12 verified connections</p>
              <p className="text-xs text-blue-700 mt-1">IRS-approved OAuth</p>
            </div>
            
            <div className="p-4 border rounded-lg bg-purple-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium">Employment Verification</span>
              </div>
              <p className="text-sm text-gray-600">15 HR system connections</p>
              <p className="text-xs text-purple-700 mt-1">Document verification active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dispute Success Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              Dispute Success Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { bureau: "Experian", success: 78, total: 45 },
                { bureau: "Equifax", success: 82, total: 38 },
                { bureau: "TransUnion", success: 75, total: 42 }
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.bureau}</span>
                    <span className="text-sm text-gray-600">{item.success}% success rate</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${item.success}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{item.total} disputes processed</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              Response Times
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Average Response Time</span>
                  <span className="text-lg font-bold text-blue-600">18 days</span>
                </div>
                <p className="text-sm text-gray-600">Bureau response to disputes</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Fastest Response</span>
                  <span className="text-lg font-bold text-green-600">12 days</span>
                </div>
                <p className="text-sm text-gray-600">TransUnion (last month)</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Follow-up Success</span>
                  <span className="text-lg font-bold text-purple-600">89%</span>
                </div>
                <p className="text-sm text-gray-600">14-day follow-up protocol</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
            Monthly Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">127</div>
              <p className="text-sm text-gray-600">Total Disputes Filed</p>
              <Badge variant="secondary" className="mt-1 text-green-700 bg-green-100">+23%</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">96</div>
              <p className="text-sm text-gray-600">Successful Removals</p>
              <Badge variant="secondary" className="mt-1 text-green-700 bg-green-100">+18%</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">$2.3M</div>
              <p className="text-sm text-gray-600">Debt Removed</p>
              <Badge variant="secondary" className="mt-1 text-green-700 bg-green-100">+34%</Badge>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">67</div>
              <p className="text-sm text-gray-600">Avg Score Improvement</p>
              <Badge variant="secondary" className="mt-1 text-green-700 bg-green-100">+12%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Page Component
function SettingsPage() {
  return <AdminSettings />;
}

// Client Communication Page Component
function ClientCommunicationPage({ clientUsers, selectedClientId, setSelectedClientId, selectedClient }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <MessageCircle className="h-7 w-7 text-orange-500" />
              Client Communication
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Secure messaging and document exchange with clients.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-600">{clientUsers.length}</div>
            <div className="text-sm text-slate-600">Active Clients</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Client List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Client List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clientUsers.map((client: User) => (
                <Button
                  key={client.id}
                  variant={selectedClientId === client.id ? "default" : "outline"}
                  className={`w-full p-3 h-auto justify-start ${
                    selectedClientId === client.id
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">
                      {client.firstName} {client.lastName}
                    </div>
                    <div className="text-xs opacity-75">{client.email}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          {selectedClient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Chat with {selectedClient.firstName} {selectedClient.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SecureChat userId={selectedClient.id} userType="admin" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Client
                </h3>
                <p className="text-gray-600">
                  Choose a client from the list to start secure communication
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Bureau Analysis Page Component
function BureauAnalysisPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BureauResponseAnalysis userId={2} />
    </div>
  );
}