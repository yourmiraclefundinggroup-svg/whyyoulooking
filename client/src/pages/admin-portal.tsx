import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { User, CreditReport, CreditIssue, Dispute } from "@shared/schema";
import { Users, FileText, AlertTriangle, Send, Settings } from "lucide-react";

export default function AdminPortal() {
  const { user, isAdmin } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();

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

  // Get all users for client management
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

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

  // Client users (non-admin)
  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");
  const selectedClient = selectedClientId ? allUsers.find(u => u.id === selectedClientId) : null;

  const createClientMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      const response = await apiRequest("POST", "/api/users", JSON.stringify({
        ...data,
        accessLevel: "CLIENT_VIEWER"
      }));
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Client created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create client", variant: "destructive" });
    },
  });

  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.firstName || !newClient.lastName || !newClient.email) return;
    
    createClientMutation.mutate(newClient);
    setNewClient({ firstName: "", lastName: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage client accounts and credit repair services
          </p>
        </div>

        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Client Management
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Dispute Center
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create New Client */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateClient} className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={newClient.firstName}
                        onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={newClient.lastName}
                        onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
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
                        onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
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
              <Card>
                <CardHeader>
                  <CardTitle>Client Accounts ({clientUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {clientUsers.map((client) => (
                      <div
                        key={client.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedClientId === client.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedClientId(client.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{client.email}</p>
                          </div>
                          <Badge variant="secondary">
                            {client.accessLevel === "CLIENT_VIEWER" ? "Client" : client.accessLevel}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Client Details */}
            {selectedClient && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedClient.firstName} {selectedClient.lastName} - Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Credit Score */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {clientCreditReport?.creditScore || '---'}
                      </div>
                      <p className="text-sm text-gray-600">Current Credit Score</p>
                    </div>

                    {/* Active Issues */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {clientIssues.length}
                      </div>
                      <p className="text-sm text-gray-600">Active Issues</p>
                    </div>

                    {/* Disputes Sent */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {clientDisputes.length}
                      </div>
                      <p className="text-sm text-gray-600">Disputes Sent</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={() => window.open(`/client-portal?userId=${selectedClient.id}`, '_blank')}
                      variant="outline"
                    >
                      View Client Portal
                    </Button>
                    <Button 
                      onClick={() => {
                        // Switch to client view for testing
                        const { setCurrentUserId } = useUserContext();
                        setCurrentUserId(selectedClient.id);
                      }}
                    >
                      Switch to Client View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
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
                      <p className="text-2xl font-bold text-gray-900">
                        {clientUsers.reduce((sum, client) => {
                          // This would need to be calculated from actual client data
                          return sum + 1; // Placeholder
                        }, 0)}
                      </p>
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
                      <p className="text-2xl font-bold text-gray-900">
                        {clientUsers.reduce((sum, client) => {
                          // This would need to be calculated from actual dispute data
                          return sum + 2; // Placeholder
                        }, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            {/* AI-Powered Dispute Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 text-blue-600 mr-3" />
                  AI-Powered Dispute Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Use AI to generate professional dispute letters and manage client disputes efficiently.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Credit Analysis */}
                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-robot text-blue-600 mr-2"></i>
                        AI Credit Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Get AI-powered analysis and recommendations for any client's credit profile.
                      </p>
                      {selectedClient ? (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                          <AICreditAnalysis userId={selectedClient.id} />
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Select a client to view AI analysis
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Credit Score Simulator */}
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <i className="fas fa-calculator text-green-600 mr-2"></i>
                        Credit Score Simulator
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Simulate potential credit score improvements for client presentations.
                      </p>
                      {selectedClient && clientCreditReport ? (
                        <CreditSimulatorModal 
                          open={false} 
                          onOpenChange={() => {}} 
                          currentScore={clientCreditReport.creditScore} 
                        />
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          Select a client to simulate credit improvements
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Dispute Letter Generation */}
                <Card className="mt-6 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <i className="fas fa-file-text text-purple-600 mr-2"></i>
                      AI Dispute Letter Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate professional, legally compliant dispute letters using AI. Select a client and their credit issues to create targeted dispute letters.
                    </p>
                    {selectedClient && clientIssues.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {clientIssues.map((issue) => (
                            <Card key={issue.id} className="border-gray-200">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-gray-900 mb-2">{issue.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{issue.creditor}</p>
                                <Button 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => {
                                    // Open dispute modal for this issue
                                    setSelectedIssue(issue);
                                    setDisputeModalOpen(true);
                                  }}
                                >
                                  <i className="fas fa-magic mr-2"></i>
                                  Generate AI Letter
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : selectedClient ? (
                      <div className="text-center py-6 text-gray-500">
                        <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                        <p>No active credit issues for this client</p>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <i className="fas fa-user-plus text-gray-400 text-3xl mb-2"></i>
                        <p>Select a client to generate dispute letters</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
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
          </TabsContent>
        </Tabs>
        
        <DisputeLetterModal
          open={disputeModalOpen}
          onOpenChange={setDisputeModalOpen}
          issue={selectedIssue}
        />
      </div>
    </div>
  );
}