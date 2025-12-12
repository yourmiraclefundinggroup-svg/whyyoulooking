import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserContext } from "@/hooks/use-user-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DisputeLetterModal } from "@/components/dispute-letter-modal";
import { AICreditAnalysis } from "@/components/ai-credit-analysis";
import { CreditSimulatorModal } from "@/components/credit-simulator-modal";
import { AdminDisputeTracking } from "@/components/admin-dispute-tracking";
import { FollowUpAlerts } from "@/components/follow-up-alerts";
import { BureauResponseAnalysis } from "@/components/bureau-response-analysis";
import { SecureChat } from "@/components/secure-chat";
import { AdminSettings } from "@/components/admin-settings";
import { User, CreditReport, CreditIssue, Dispute } from "@shared/schema";
import {
  AdminShell,
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardContent,
  AdminStatCard,
  AdminTable,
  AdminTableHeader,
  AdminTableRow,
  AdminTableHead,
  AdminTableCell,
  AdminBadge,
  AdminEmptyState,
} from "@/components/admin";
import {
  Users,
  FileText,
  AlertTriangle,
  Send,
  TrendingUp,
  Shield,
  UserPlus,
  Brain,
  BarChart,
  CheckSquare,
  Clock,
  CalendarDays,
  MessageCircle,
  Package,
  Activity,
  DollarSign,
} from "lucide-react";

export default function AdminPortal() {
  const { isAdmin } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[hsl(230,15%,3%)] flex items-center justify-center">
        <AdminCard className="w-full max-w-md">
          <AdminCardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-[hsl(var(--admin-text-muted))]">This portal is restricted to administrators only.</p>
          </AdminCardContent>
        </AdminCard>
      </div>
    );
  }

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");
  const selectedClient = selectedClientId ? allUsers.find(u => u.id === selectedClientId) : null;

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

  const [newClient, setNewClient] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const createClientMutation = useMutation({
    mutationFn: async (clientData: { firstName: string; lastName: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/users", {
        ...clientData,
        accessLevel: "CLIENT_VIEWER",
        isTestUser: false
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      setNewClient({ firstName: "", lastName: "", email: "", password: "" });
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
    if (newClient.firstName && newClient.lastName && newClient.email && newClient.password) {
      createClientMutation.mutate(newClient);
    }
  };

  const renderPageContent = () => {
    if (location === "/admin-portal" || location === "/admin-portal/") {
      return <DashboardPage clientUsers={clientUsers} />;
    } else if (location === "/admin-portal/clients") {
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
    } else if (location === "/admin-portal/tracking") {
      return <AdminDisputeTracking selectedClientId={selectedClientId} />;
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
    } else if (location === "/admin-portal/users") {
      return <UsersRolesPage />;
    } else if (location === "/admin-portal/system") {
      return <SystemPage />;
    }
    return <DashboardPage clientUsers={clientUsers} />;
  };

  return (
    <AdminShell>
      {renderPageContent()}
      <DisputeLetterModal
        open={disputeModalOpen}
        onOpenChange={setDisputeModalOpen}
        issue={selectedIssue}
      />
    </AdminShell>
  );
}

function DashboardPage({ clientUsers }: { clientUsers: User[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Welcome back. Here's your overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          label="Total Clients"
          value={clientUsers.length}
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12, positive: true }}
          color="blue"
        />
        <AdminStatCard
          label="Active Disputes"
          value={23}
          icon={<FileText className="h-6 w-6" />}
          trend={{ value: 8, positive: true }}
          color="orange"
        />
        <AdminStatCard
          label="Success Rate"
          value="78%"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
          color="green"
        />
        <AdminStatCard
          label="Revenue"
          value="$24.5k"
          icon={<DollarSign className="h-6 w-6" />}
          trend={{ value: 18, positive: true }}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle icon={<Activity className="h-5 w-5" />}>Recent Activity</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-4">
              {[
                { action: "New dispute filed", client: "Sarah M.", time: "2 min ago", type: "dispute" },
                { action: "Letter sent via USPS", client: "Michael R.", time: "15 min ago", type: "mail" },
                { action: "Client onboarded", client: "Jennifer L.", time: "1 hour ago", type: "client" },
                { action: "Bureau response received", client: "David K.", time: "3 hours ago", type: "response" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <div className="w-10 h-10 rounded-lg bg-[hsl(var(--admin-accent))]/20 flex items-center justify-center">
                    {item.type === "dispute" && <FileText className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}
                    {item.type === "mail" && <Package className="h-5 w-5 text-blue-400" />}
                    {item.type === "client" && <Users className="h-5 w-5 text-green-400" />}
                    {item.type === "response" && <MessageCircle className="h-5 w-5 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.action}</p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.client}</p>
                  </div>
                  <span className="text-xs text-[hsl(var(--admin-text-subtle))]">{item.time}</span>
                </div>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle icon={<Users className="h-5 w-5" />}>Recent Clients</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <AdminTable>
              <AdminTableHeader>
                <tr>
                  <AdminTableHead>Name</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead>Score</AdminTableHead>
                </tr>
              </AdminTableHeader>
              <tbody>
                {clientUsers.slice(0, 5).map((client) => (
                  <AdminTableRow key={client.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white text-xs font-semibold">
                          {client.firstName?.[0]}{client.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{client.firstName} {client.lastName}</p>
                          <p className="text-xs text-[hsl(var(--admin-text-muted))]">{client.email}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <AdminBadge variant="success">Active</AdminBadge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="font-semibold text-[hsl(var(--admin-accent))]">---</span>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
                {clientUsers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[hsl(var(--admin-text-muted))]">
                      No clients yet
                    </td>
                  </tr>
                )}
              </tbody>
            </AdminTable>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<CheckSquare className="h-5 w-5" />}>Dispute Success Rates</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { bureau: "Experian", success: 78, total: 45 },
              { bureau: "Equifax", success: 82, total: 38 },
              { bureau: "TransUnion", success: 75, total: 42 }
            ].map((item) => (
              <div key={item.bureau} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{item.bureau}</span>
                  <span className="text-sm text-[hsl(var(--admin-accent))]">{item.success}%</span>
                </div>
                <div className="w-full bg-[hsl(var(--admin-bg))] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${item.success}%` }}
                  />
                </div>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.total} disputes processed</p>
              </div>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

function ClientManagementPage({ 
  clientUsers, selectedClientId, setSelectedClientId, selectedClient, 
  clientCreditReport, clientIssues, clientDisputes, newClient, setNewClient, 
  handleCreateClient, createClientMutation 
}: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Client Management
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage client accounts and credit repair tools.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[hsl(var(--admin-accent))]">{clientUsers.length}</div>
          <div className="text-sm text-[hsl(var(--admin-text-muted))]">Active Clients</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle icon={<UserPlus className="h-5 w-5" />}>Add New Client</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <Label htmlFor="firstName" className="text-[hsl(var(--admin-text-muted))]">First Name</Label>
                <Input
                  id="firstName"
                  value={newClient.firstName}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[hsl(var(--admin-text-muted))]">Last Name</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-last-name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[hsl(var(--admin-text-muted))]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-[hsl(var(--admin-text-muted))]">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient((prev: any) => ({ ...prev, password: e.target.value }))}
                  placeholder="Set a secure password"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-password"
                />
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 text-blue-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Setup</span>
                </div>
                <p className="text-xs text-blue-300/70 mt-1">
                  Client will be required to reset this password on first login.
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={createClientMutation.isPending}
                className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(25,95%,45%)] text-white"
                data-testid="button-create-client"
              >
                {createClientMutation.isPending ? "Creating..." : "Create Client"}
              </Button>
            </form>
          </AdminCardContent>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <AdminCardHeader>
            <AdminCardTitle icon={<Users className="h-5 w-5" />}>
              Client Accounts ({clientUsers.length})
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            {clientUsers.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {clientUsers.map((client: User) => (
                  <button
                    key={client.id}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                      selectedClientId === client.id
                        ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10'
                        : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50 hover:border-[hsl(var(--admin-border-accent))]'
                    }`}
                    onClick={() => setSelectedClientId(client.id)}
                    data-testid={`button-client-${client.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white font-semibold">
                          {client.firstName?.[0]}{client.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-white">{client.firstName} {client.lastName}</div>
                          <div className="text-sm text-[hsl(var(--admin-text-muted))]">{client.email}</div>
                        </div>
                      </div>
                      {selectedClientId === client.id && (
                        <div className="w-3 h-3 rounded-full bg-[hsl(var(--admin-accent))]" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <AdminEmptyState
                icon={<Users className="h-8 w-8" />}
                title="No Clients Yet"
                description="Create your first client using the form on the left."
              />
            )}
          </AdminCardContent>
        </AdminCard>
      </div>

      {selectedClient && (
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle>
              {selectedClient.firstName} {selectedClient.lastName}
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                <div className="text-3xl font-bold text-blue-400">
                  {clientCreditReport?.creditScore || '---'}
                </div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Credit Score</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                <div className="text-3xl font-bold text-red-400">
                  {clientIssues.length}
                </div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Active Issues</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                <div className="text-3xl font-bold text-amber-400">
                  {clientDisputes.filter((d: Dispute) => d.status === 'PENDING').length}
                </div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Pending Disputes</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                <div className="text-3xl font-bold text-emerald-400">
                  {clientDisputes.length}
                </div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total Disputes</p>
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}
    </div>
  );
}

function DisputeCenterPage({ 
  selectedClient, selectedClientId, setSelectedClientId, clientUsers, 
  clientCreditReport, clientIssues, setSelectedIssue, setDisputeModalOpen 
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dispute Center</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">
          Manage disputes and track USPS delivery status.
        </p>
      </div>

      {!selectedClient ? (
        <AdminCard className="border-amber-500/30 bg-amber-500/5">
          <AdminCardContent className="py-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Select a Client First</h3>
              <p className="text-[hsl(var(--admin-text-muted))] mb-6">
                Choose a client to access their dispute management tools.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {clientUsers.map((client: User) => (
                  <button
                    key={client.id}
                    className="p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]/50 hover:border-[hsl(var(--admin-accent))] transition-colors text-left"
                    onClick={() => setSelectedClientId(client.id)}
                    data-testid={`button-select-client-${client.id}`}
                  >
                    <div className="font-medium text-white">{client.firstName} {client.lastName}</div>
                    <div className="text-xs text-[hsl(var(--admin-text-muted))]">{client.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </AdminCardContent>
        </AdminCard>
      ) : (
        <div className="space-y-6">
          <AdminCard className="border-blue-500/30 bg-blue-500/5">
            <AdminCardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-sm text-blue-400">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {clientCreditReport?.creditScore || '---'}
                  </div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Credit Score</p>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>

          <AdminDisputeTracking selectedClientId={selectedClient.id} />
          <FollowUpAlerts />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<Brain className="h-5 w-5" />}>AI Credit Analysis</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                {selectedClient?.id ? (
                  <AICreditAnalysis userId={selectedClient.id} />
                ) : (
                  <div className="text-center py-4 text-[hsl(var(--admin-text-muted))]">
                    Select a client to view analysis
                  </div>
                )}
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<TrendingUp className="h-5 w-5" />}>Credit Score Simulator</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                {clientCreditReport ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                      Test different scenarios to see potential score improvements.
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--admin-accent))]">
                      {clientCreditReport.creditScore || '---'}
                    </p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                      Use the simulator to project improvements
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4 text-[hsl(var(--admin-text-muted))]">
                    No credit report available
                  </div>
                )}
              </AdminCardContent>
            </AdminCard>
          </div>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<FileText className="h-5 w-5" />}>AI Dispute Letter Generator</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-6">
                Generate professional dispute letters for each credit issue.
              </p>
              
              {clientIssues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {clientIssues.map((issue: CreditIssue) => (
                    <div key={issue.id} className="p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50 hover:border-[hsl(var(--admin-accent))]/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white mb-1">{issue.title}</h4>
                          <p className="text-sm text-[hsl(var(--admin-text-muted))]">{issue.creditor}</p>
                          {issue.amount && (
                            <p className="text-sm font-medium text-red-400">
                              ${issue.amount.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <AdminBadge variant="muted">{issue.type}</AdminBadge>
                      </div>
                      <div className="text-sm text-[hsl(var(--admin-text-muted))] mb-3">
                        Impact: <span className="font-medium text-red-400">{Math.abs(issue.impact)} points</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setDisputeModalOpen(true);
                        }}
                        data-testid={`button-generate-letter-${issue.id}`}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate AI Letter
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <AdminEmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No Credit Issues"
                  description="Credit issues will appear here once a credit report is added."
                />
              )}
            </AdminCardContent>
          </AdminCard>
        </div>
      )}
    </div>
  );
}

function AnalyticsPage({ clientUsers }: { clientUsers: User[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">Performance metrics and client statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          label="Total Clients"
          value={clientUsers.length}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        <AdminStatCard
          label="Active Issues"
          value={12}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="orange"
        />
        <AdminStatCard
          label="Disputes Sent"
          value={8}
          icon={<Send className="h-6 w-6" />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle icon={<TrendingUp className="h-5 w-5" />}>AI Features Usage</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-4">
              {[
                { feature: "Bureau Response Analysis", usage: 24, trend: "+12%" },
                { feature: "Credit Utilization Optimizer", usage: 18, trend: "+8%" },
                { feature: "Loan Readiness Assessment", usage: 15, trend: "+15%" },
                { feature: "Dispute Letter Generation", usage: 32, trend: "+22%" },
                { feature: "Identity Theft Recovery", usage: 6, trend: "+3%" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
                  <div>
                    <p className="font-medium text-sm text-white">{item.feature}</p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.usage} uses this month</p>
                  </div>
                  <AdminBadge variant="success">{item.trend}</AdminBadge>
                </div>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitle icon={<BarChart className="h-5 w-5" />}>Credit Score Improvements</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-4">
              {[
                { client: "Sarah M.", improvement: "+87 pts", timeframe: "3 months" },
                { client: "Michael R.", improvement: "+65 pts", timeframe: "4 months" },
                { client: "Jennifer L.", improvement: "+52 pts", timeframe: "2 months" },
                { client: "David K.", improvement: "+94 pts", timeframe: "5 months" },
                { client: "Lisa W.", improvement: "+71 pts", timeframe: "3 months" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
                  <div>
                    <p className="font-medium text-sm text-white">{item.client}</p>
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.timeframe}</p>
                  </div>
                  <span className="font-bold text-emerald-400">{item.improvement}</span>
                </div>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<CalendarDays className="h-5 w-5" />}>Monthly Performance Summary</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Disputes Filed", value: "127", trend: "+23%" },
              { label: "Successful Removals", value: "96", trend: "+18%" },
              { label: "Debt Removed", value: "$2.3M", trend: "+34%" },
              { label: "Avg Score Improvement", value: "67", trend: "+12%" },
            ].map((item, idx) => (
              <div key={idx} className="text-center p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
                <div className="text-2xl font-bold text-[hsl(var(--admin-accent))]">{item.value}</div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">{item.label}</p>
                <AdminBadge variant="success" className="mt-2">{item.trend}</AdminBadge>
              </div>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">Manage your admin account and system settings</p>
      </div>
      <AdminSettings />
    </div>
  );
}

function ClientCommunicationPage({ clientUsers, selectedClientId, setSelectedClientId, selectedClient }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Client Communication
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Secure messaging and document exchange.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AdminCard className="lg:col-span-1">
          <AdminCardHeader>
            <AdminCardTitle>Clients</AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-2">
              {clientUsers.map((client: User) => (
                <button
                  key={client.id}
                  className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedClientId === client.id
                      ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10'
                      : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50 hover:border-[hsl(var(--admin-border-accent))]'
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                  data-testid={`button-chat-client-${client.id}`}
                >
                  <div className="font-medium text-sm text-white">
                    {client.firstName} {client.lastName}
                  </div>
                  <div className="text-xs text-[hsl(var(--admin-text-muted))]">{client.email}</div>
                </button>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>

        <div className="lg:col-span-3">
          {selectedClient ? (
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<MessageCircle className="h-5 w-5" />}>
                  Chat with {selectedClient.firstName} {selectedClient.lastName}
                </AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <SecureChat userId={selectedClient.id} userType="admin" />
              </AdminCardContent>
            </AdminCard>
          ) : (
            <AdminCard>
              <AdminCardContent className="py-12">
                <AdminEmptyState
                  icon={<MessageCircle className="h-8 w-8" />}
                  title="Select a Client"
                  description="Choose a client from the list to start secure communication"
                />
              </AdminCardContent>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}

function BureauAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bureau Analysis</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">Analyze bureau responses and track disputes.</p>
      </div>
      <BureauResponseAnalysis userId={2} />
    </div>
  );
}

function UsersRolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users & Roles</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">Manage user accounts and permissions.</p>
      </div>
      <AdminCard>
        <AdminCardContent className="py-12">
          <AdminEmptyState
            icon={<Users className="h-8 w-8" />}
            title="User Management"
            description="User and role management features coming soon."
          />
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

function SystemPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">System health and configuration.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AdminStatCard
          label="System Status"
          value="Online"
          icon={<Activity className="h-6 w-6" />}
          color="green"
        />
        <AdminStatCard
          label="API Requests"
          value="1,247"
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
        />
        <AdminStatCard
          label="Uptime"
          value="99.9%"
          icon={<Clock className="h-6 w-6" />}
          color="purple"
        />
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<Shield className="h-5 w-5" />}>Integrations Status</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Database", status: "Connected", color: "green" },
              { name: "USPS API", status: "Active", color: "green" },
              { name: "OpenAI", status: "Active", color: "green" },
            ].map((item) => (
              <div key={item.name} className="p-4 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${item.color === 'green' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className="font-medium text-white">{item.name}</span>
                </div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">{item.status}</p>
              </div>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
