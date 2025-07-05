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
import { User, CreditReport, CreditIssue, Dispute } from "@shared/schema";
import { Users, FileText, AlertTriangle, Send, Settings, Menu, X, TrendingUp, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Link href="/admin-portal">
                  <div className="flex items-center cursor-pointer">
                    <Shield className="h-8 w-8 text-blue-600 mr-2" />
                    <h1 className="text-xl md:text-2xl font-bold text-blue-600">CreditFix Pro Admin</h1>
                  </div>
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <span
                        className={cn(
                          "px-1 pb-4 text-sm font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1",
                          location === item.href
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-500 hover:text-gray-700 border-transparent"
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
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center text-sm text-gray-700">
                <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                        location === item.href
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage client accounts and access their credit repair tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Client */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
          </CardHeader>
          <CardContent>
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

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Advanced analytics and reporting features will be available in the next update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Page Component
function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure system settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Configure system settings and preferences.
          </p>
          <Button disabled>
            Coming Soon - Advanced Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}