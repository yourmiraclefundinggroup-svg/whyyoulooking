import { useState, useEffect } from "react";
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
import { User, CreditReport, CreditIssue, Dispute, CreditReportUpload, CreditReportAccount, CreditReportInquiry, CreditReportCollection, CreditReportPublicRecord, DisputeLetterNew, DisputeCalendarEvent } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
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
  Upload,
  FolderOpen,
  Filter,
  Plus,
  Eye,
  ArrowLeft,
  CreditCard,
  Search as SearchIcon,
  AlertCircle,
  Landmark,
  Mail,
  Target,
  Sparkles,
  GitCompare,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
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
    } else if (location === "/admin-portal/credit-reports") {
      return <CreditReportsPage clientUsers={clientUsers} />;
    } else if (location.startsWith("/admin-portal/credit-reports/")) {
      const reportId = parseInt(location.split("/").pop() || "0");
      return <DisputeHubPage reportId={reportId} clientUsers={clientUsers} />;
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
    } else if (location === "/admin-portal/alerts") {
      return <AlertsPage />;
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
            {/* No credit report banner */}
            {!clientCreditReport?.creditScore && (
              <div className="mb-4 p-4 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-300">No Credit Report on File</p>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    This client has no credit data yet. Upload their credit report file to run Scoreshifting and populate their dashboard.
                  </p>
                </div>
                <Link href="/admin-portal/credit-reports">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs flex-shrink-0">
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Report
                  </Button>
                </Link>
              </div>
            )}
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
  const { toast } = useToast();
  const [disputeIQRound, setDisputeIQRound] = useState<string>("1");
  const [disputeIQReason, setDisputeIQReason] = useState("");
  const [disputeIQPriorResponse, setDisputeIQPriorResponse] = useState("");
  const [disputeIQSelectedIssue, setDisputeIQSelectedIssue] = useState<CreditIssue | null>(null);
  const [disputeIQBureau, setDisputeIQBureau] = useState<string>("EXPERIAN");
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [generatedLetterMeta, setGeneratedLetterMeta] = useState<{ clientName: string; round: string; bureau: string } | null>(null);

  const disputeIQMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClient || !disputeIQSelectedIssue) throw new Error("Select a client and issue first");
      const response = await fetch("/api/ai/dispute-iq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          creditor: disputeIQSelectedIssue.creditor,
          accountNumber: "XXXX",
          accountType: disputeIQSelectedIssue.type.toLowerCase().replace("_", "_"),
          disputeReason: disputeIQReason || disputeIQSelectedIssue.description,
          bureau: disputeIQBureau,
          roundNumber: parseInt(disputeIQRound),
          priorResponse: disputeIQPriorResponse || undefined,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate letter");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedLetter(data.letter);
      setGeneratedLetterMeta({
        clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
        round: disputeIQRound,
        bureau: disputeIQBureau,
      });
      toast({ title: "Dispute IQ™ Letter Generated", description: data.uniquenessNote });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

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

          <FollowUpAlerts />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<Brain className="h-5 w-5" />}>Scoreshifting Analysis</AdminCardTitle>
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

          {/* ── Dispute IQ™ Letter Generator ── */}
          <AdminCard className="border-amber-500/40">
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<Sparkles className="h-5 w-5 text-amber-400" />}>
                  Dispute IQ™ Letter Generator
                </AdminCardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  Dual-AI • GPT-4o + Claude
                </span>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-4">
                Generate uniquely crafted, legally-grounded dispute letters. Each letter is processed by GPT-4o then rewritten by Claude for maximum uniqueness.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Issue selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--admin-text-muted))]">Select Credit Issue</Label>
                  <Select
                    value={disputeIQSelectedIssue?.id?.toString() ?? ""}
                    onValueChange={(val) => {
                      const issue = clientIssues.find((i: CreditIssue) => i.id === parseInt(val));
                      setDisputeIQSelectedIssue(issue || null);
                    }}
                  >
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                      <SelectValue placeholder="Choose an issue..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientIssues.map((issue: CreditIssue) => (
                        <SelectItem key={issue.id} value={issue.id.toString()}>
                          {issue.creditor} — {issue.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bureau selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--admin-text-muted))]">Bureau</Label>
                  <Select value={disputeIQBureau} onValueChange={setDisputeIQBureau}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPERIAN">Experian</SelectItem>
                      <SelectItem value="EQUIFAX">Equifax</SelectItem>
                      <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Round selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--admin-text-muted))]">Dispute Round</Label>
                  <Select value={disputeIQRound} onValueChange={setDisputeIQRound}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Round 1 — Initial Dispute (FCRA 611)</SelectItem>
                      <SelectItem value="2">Round 2 — Method of Verification (FCRA 611a7)</SelectItem>
                      <SelectItem value="3">Round 3 — CFPB Threat + Permissible Purpose</SelectItem>
                      <SelectItem value="4">Round 4 — FDCPA Debt Validation (809b)</SelectItem>
                      <SelectItem value="5">Round 5 — Attorney-Ready + Litigation Threat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dispute reason */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-[hsl(var(--admin-text-muted))]">Dispute Reason</Label>
                  <Input
                    value={disputeIQReason}
                    onChange={(e) => setDisputeIQReason(e.target.value)}
                    placeholder="e.g. Account not mine, balance incorrect..."
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-muted))]"
                  />
                </div>
              </div>

              {/* Prior response textarea */}
              <div className="space-y-1.5 mb-4">
                <Label className="text-xs text-[hsl(var(--admin-text-muted))]">Prior Bureau Response (optional — for rounds 2-5)</Label>
                <textarea
                  value={disputeIQPriorResponse}
                  onChange={(e) => setDisputeIQPriorResponse(e.target.value)}
                  placeholder="Paste the bureau's previous response here to craft a targeted escalation..."
                  rows={3}
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] text-white text-sm px-3 py-2 placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <Button
                onClick={() => disputeIQMutation.mutate()}
                disabled={disputeIQMutation.isPending || !disputeIQSelectedIssue}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
              >
                {disputeIQMutation.isPending ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Generating with Dispute IQ™...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate with Dispute IQ™
                  </>
                )}
              </Button>

              {/* Generated letter result */}
              {generatedLetter && generatedLetterMeta && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                      Dispute IQ™ — Unique Letter
                    </span>
                    <span className="text-xs text-[hsl(var(--admin-text-muted))]">
                      Generated exclusively for {generatedLetterMeta.clientName} — Round {generatedLetterMeta.round} — {generatedLetterMeta.bureau}
                    </span>
                  </div>
                  <div className="relative">
                    <pre className="text-xs text-slate-300 bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] rounded-lg p-4 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed">
                      {generatedLetter}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 text-xs border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-white"
                      onClick={() => navigator.clipboard.writeText(generatedLetter)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>

          {/* ── Standard AI Dispute Letter Generator ── */}
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Quick Letter Generator</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-6">
                Generate standard dispute letters for each credit issue.
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

function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  useEffect(() => {
    fetch("/api/admin/alerts", { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setAlerts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resolveAlert = async (id: number) => {
    await fetch(`/api/admin/alerts/${id}/resolve`, { method: "PATCH", headers: authHeaders() });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const typeColor = (type: string) => {
    if (type === "error") return "border-red-700/40 bg-red-900/10";
    if (type === "warning") return "border-amber-700/40 bg-amber-900/10";
    return "border-blue-700/40 bg-blue-900/10";
  };
  const typeIcon = (type: string) => type === "error" ? "🔴" : type === "warning" ? "🟡" : "🔵";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Alerts
            {alerts.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
                {alerts.length}
              </span>
            )}
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Unresolved system alerts requiring your attention</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[hsl(var(--admin-text-muted))]">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="font-semibold text-white text-lg">All clear</h3>
          <p className="text-[hsl(var(--admin-text-muted))] text-sm mt-1">No unresolved alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <div key={alert.id} className={`rounded-xl border p-4 ${typeColor(alert.type)}`}>
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{typeIcon(alert.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{alert.title}</span>
                    <span className="text-xs text-[hsl(var(--admin-text-muted))]">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ""}
                    </span>
                  </div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">{alert.message}</p>
                  {alert.entityType && (
                    <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1 opacity-70">
                      Entity: {alert.entityType} #{alert.entityId}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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

interface CreditReportWithClient extends CreditReportUpload {
  clientName?: string;
}

function CreditReportsPage({ clientUsers }: { clientUsers: User[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterBureau, setFilterBureau] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [processingProgress, setProcessingProgress] = useState<Record<number, number>>({});

  const { data: creditReports = [], isLoading } = useQuery<CreditReportWithClient[]>({
    queryKey: ['/api/admin/credit-report-uploads'],
    refetchInterval: (query) => {
      const data = query.state.data as CreditReportWithClient[] | undefined;
      return data?.some((r: CreditReportWithClient) => r.parseStatus === 'processing') ? 3000 : false;
    },
  });

  const hasProcessingReports = creditReports.some((r: CreditReportWithClient) => r.parseStatus === 'processing');

  const getEstimatedTime = (progress: number) => {
    if (progress >= 90) return "Almost done...";
    if (progress >= 70) return "~15 seconds left";
    if (progress >= 50) return "~30 seconds left";
    if (progress >= 30) return "~45 seconds left";
    return "~1 minute left";
  };

  useEffect(() => {
    if (!hasProcessingReports) return;
    
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        const newProgress = { ...prev };
        creditReports.forEach(report => {
          if (report.parseStatus === 'processing') {
            const currentProgress = newProgress[report.id] || 5;
            if (currentProgress < 90) {
              newProgress[report.id] = Math.min(currentProgress + Math.random() * 5 + 2, 90);
            }
          } else if (report.parseStatus === 'succeeded') {
            newProgress[report.id] = 100;
          }
        });
        return newProgress;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, [hasProcessingReports, creditReports]);

  const getProcessingStatus = (reportId: number, status: string, parseError?: string | null) => {
    if (status === 'processing') {
      const progress = processingProgress[reportId] || 5;
      return (
        <div className="min-w-[140px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-amber-400 font-medium">Scoreshifting...</span>
            <span className="text-xs text-[hsl(var(--admin-text-muted))]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[hsl(var(--admin-bg))] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">{getEstimatedTime(progress)}</p>
        </div>
      );
    }
    if (status === 'failed' && parseError) {
      return (
        <div className="min-w-[140px]">
          {getStatusBadge(status)}
          <p className="text-xs text-red-400 mt-1 max-w-[200px] truncate" title={parseError}>{parseError}</p>
        </div>
      );
    }
    return getStatusBadge(status);
  };

  const reportsWithClientNames = creditReports.map(report => {
    const client = clientUsers.find(u => u.id === report.userId);
    return {
      ...report,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'
    };
  });

  const filteredReports = reportsWithClientNames.filter(report => {
    if (filterClient !== "all" && report.userId.toString() !== filterClient) return false;
    if (filterBureau !== "all" && report.bureau !== filterBureau) return false;
    if (filterStatus !== "all" && report.parseStatus !== filterStatus) return false;
    return true;
  });

  const [newUpload, setNewUpload] = useState({
    userId: "",
    fileName: "",
    fileType: "pdf",
    bureau: "EXPERIAN" as "EXPERIAN" | "EQUIFAX" | "TRANSUNION",
    sourceFormat: "pdf" as "pdf" | "html" | "txt" | "csv",
    creditScore: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const createUploadMutation = useMutation({
    mutationFn: async (data: typeof newUpload & { file: File | null }) => {
      let fileContent = "";
      if (data.file) {
        const reader = new FileReader();
        fileContent = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || result;
            resolve(base64);
          };
          reader.readAsDataURL(data.file);
        });
      }
      
      const response = await apiRequest("POST", "/api/admin/credit-report-uploads", {
        userId: parseInt(data.userId),
        uploadedBy: 1,
        fileName: data.fileName,
        fileType: data.fileType,
        bureau: data.bureau,
        sourceFormat: data.sourceFormat,
        creditScore: data.creditScore ? parseInt(data.creditScore) : null,
        parseStatus: "processing",
        fileContent: fileContent,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Processing",
        description: "Credit report uploaded! AI is now extracting the data...",
      });
      setUploadDialogOpen(false);
      setNewUpload({ userId: "", fileName: "", fileType: "pdf", bureau: "EXPERIAN", sourceFormat: "pdf", creditScore: "" });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/credit-report-uploads'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create credit report upload",
        variant: "destructive",
      });
    },
  });

  const handleCreateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpload.userId && newUpload.fileName) {
      createUploadMutation.mutate({ ...newUpload, file: selectedFile });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <AdminBadge variant="success">Parsed</AdminBadge>;
      case "processing":
        return <AdminBadge variant="warning">Processing</AdminBadge>;
      case "failed":
        return <AdminBadge variant="danger">Failed</AdminBadge>;
      default:
        return <AdminBadge variant="default">Queued</AdminBadge>;
    }
  };

  const getBureauBadge = (bureau: string) => {
    switch (bureau) {
      case "EXPERIAN":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">Experian</span>;
      case "EQUIFAX":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">Equifax</span>;
      case "TRANSUNION":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">TransUnion</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">{bureau}</span>;
    }
  };

  // Clients without any uploaded credit report
  const clientsWithReports = new Set(creditReports.map((r: CreditReportWithClient) => r.userId));
  const clientsAwaitingReport = clientUsers.filter(c => !clientsWithReports.has(c.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Reports</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage client credit report uploads and analysis.</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
              data-testid="button-upload-credit-report"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
            <DialogHeader>
              <DialogTitle className="text-white">Upload Credit Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUpload} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Client</Label>
                <Select value={newUpload.userId} onValueChange={(v) => setNewUpload({ ...newUpload, userId: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="select-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    {clientUsers.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()} className="text-white hover:bg-[hsl(var(--admin-bg))]">
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Select Credit Report File</Label>
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                    isDragging 
                      ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10' 
                      : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] hover:border-[hsl(var(--admin-accent))]/50'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      setSelectedFile(file);
                      setNewUpload({ ...newUpload, fileName: file.name });
                      const ext = file.name.split('.').pop()?.toLowerCase() as "pdf" | "html" | "txt" | "csv";
                      if (['pdf', 'html', 'txt', 'csv'].includes(ext)) {
                        setNewUpload(prev => ({ ...prev, fileName: file.name, sourceFormat: ext }));
                      }
                    }
                  }}
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    accept=".pdf,.html,.txt,.csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setNewUpload({ ...newUpload, fileName: file.name });
                        const ext = file.name.split('.').pop()?.toLowerCase() as "pdf" | "html" | "txt" | "csv";
                        if (['pdf', 'html', 'txt', 'csv'].includes(ext)) {
                          setNewUpload(prev => ({ ...prev, fileName: file.name, sourceFormat: ext }));
                        }
                      }
                    }}
                    data-testid="input-file-upload"
                  />
                  <div className="text-center">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-10 w-10 mx-auto text-[hsl(var(--admin-accent))]" />
                        <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                        {selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.size < 150000 && (
                          <div className="text-xs text-amber-400 bg-amber-900/30 border border-amber-700 rounded p-2 mt-1 text-left">
                            ⚠️ This PDF is very small ({(selectedFile.size / 1024).toFixed(0)} KB). Experian's printable report may not embed all content in PDFs. If parsing fails, save the page as HTML instead (see tip below).
                          </div>
                        )}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedFile(null); 
                            setNewUpload({ ...newUpload, fileName: "" }); 
                          }}
                          className="text-xs border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-white"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-[hsl(var(--admin-text-muted))]" />
                        <p className="text-sm text-white">
                          <span className="text-[hsl(var(--admin-accent))] font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                          PDF, HTML, TXT, or CSV files supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Experian HTML tip */}
                <div className="rounded-lg border border-blue-800 bg-blue-950/30 p-3 space-y-1">
                  <p className="text-xs font-medium text-blue-300">💡 Tip: Experian Printable Reports</p>
                  <p className="text-xs text-blue-200/80">
                    Experian's printable report URL uses JavaScript rendering — when saved as PDF it may capture only page headers with no credit data. For best results:
                  </p>
                  <ol className="text-xs text-blue-200/80 list-decimal list-inside space-y-0.5">
                    <li>Open the Experian printable report in your browser</li>
                    <li>Press <strong>Ctrl+S</strong> (or File → Save Page As)</li>
                    <li>Choose <strong>"Webpage, HTML Only"</strong></li>
                    <li>Upload the saved <code>.html</code> file and set format to <strong>HTML</strong></li>
                  </ol>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--admin-text))]">Bureau</Label>
                  <Select value={newUpload.bureau} onValueChange={(v: "EXPERIAN" | "EQUIFAX" | "TRANSUNION") => setNewUpload({ ...newUpload, bureau: v })}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="select-bureau">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                      <SelectItem value="EXPERIAN" className="text-white hover:bg-[hsl(var(--admin-bg))]">Experian</SelectItem>
                      <SelectItem value="EQUIFAX" className="text-white hover:bg-[hsl(var(--admin-bg))]">Equifax</SelectItem>
                      <SelectItem value="TRANSUNION" className="text-white hover:bg-[hsl(var(--admin-bg))]">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--admin-text))]">Format</Label>
                  <Select value={newUpload.sourceFormat} onValueChange={(v: "pdf" | "html" | "txt" | "csv") => setNewUpload({ ...newUpload, sourceFormat: v })}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="select-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                      <SelectItem value="pdf" className="text-white hover:bg-[hsl(var(--admin-bg))]">PDF</SelectItem>
                      <SelectItem value="html" className="text-white hover:bg-[hsl(var(--admin-bg))]">HTML</SelectItem>
                      <SelectItem value="txt" className="text-white hover:bg-[hsl(var(--admin-bg))]">TXT</SelectItem>
                      <SelectItem value="csv" className="text-white hover:bg-[hsl(var(--admin-bg))]">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Credit Score (optional)</Label>
                <Input
                  type="number"
                  value={newUpload.creditScore}
                  onChange={(e) => setNewUpload({ ...newUpload, creditScore: e.target.value })}
                  placeholder="e.g., 720"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white"
                  data-testid="input-credit-score"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                disabled={createUploadMutation.isPending}
                data-testid="button-submit-upload"
              >
                {createUploadMutation.isPending ? "Creating..." : "Create Upload Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <AdminCardTitle icon={<Filter className="h-5 w-5" />}>Filters</AdminCardTitle>
            <div className="flex flex-wrap gap-3">
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="w-[160px] bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="filter-client">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <SelectItem value="all" className="text-white hover:bg-[hsl(var(--admin-bg))]">All Clients</SelectItem>
                  {clientUsers.map(client => (
                    <SelectItem key={client.id} value={client.id.toString()} className="text-white hover:bg-[hsl(var(--admin-bg))]">
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterBureau} onValueChange={setFilterBureau}>
                <SelectTrigger className="w-[140px] bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="filter-bureau">
                  <SelectValue placeholder="All Bureaus" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <SelectItem value="all" className="text-white hover:bg-[hsl(var(--admin-bg))]">All Bureaus</SelectItem>
                  <SelectItem value="EXPERIAN" className="text-white hover:bg-[hsl(var(--admin-bg))]">Experian</SelectItem>
                  <SelectItem value="EQUIFAX" className="text-white hover:bg-[hsl(var(--admin-bg))]">Equifax</SelectItem>
                  <SelectItem value="TRANSUNION" className="text-white hover:bg-[hsl(var(--admin-bg))]">TransUnion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px] bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" data-testid="filter-status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <SelectItem value="all" className="text-white hover:bg-[hsl(var(--admin-bg))]">All Statuses</SelectItem>
                  <SelectItem value="queued" className="text-white hover:bg-[hsl(var(--admin-bg))]">Queued</SelectItem>
                  <SelectItem value="processing" className="text-white hover:bg-[hsl(var(--admin-bg))]">Processing</SelectItem>
                  <SelectItem value="succeeded" className="text-white hover:bg-[hsl(var(--admin-bg))]">Parsed</SelectItem>
                  <SelectItem value="failed" className="text-white hover:bg-[hsl(var(--admin-bg))]">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AdminCardHeader>
      </AdminCard>

      {/* Clients awaiting report uploads */}
      {clientsAwaitingReport.length > 0 && (
        <AdminCard className="border-amber-500/30">
          <AdminCardHeader>
            <AdminCardTitle icon={<AlertCircle className="h-5 w-5 text-amber-400" />}>
              <span className="text-amber-300">Clients Awaiting Credit Report ({clientsAwaitingReport.length})</span>
            </AdminCardTitle>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-2">
              {clientsAwaitingReport.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs font-bold">
                      {client.firstName?.[0]}{client.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-amber-400/70">{client.email} — No report on file</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                    onClick={() => {
                      setNewUpload(prev => ({ ...prev, userId: client.id.toString() }));
                      setUploadDialogOpen(true);
                    }}
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Now
                  </Button>
                </div>
              ))}
            </div>
          </AdminCardContent>
        </AdminCard>
      )}

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<FolderOpen className="h-5 w-5" />}>
            Credit Report Uploads ({filteredReports.length})
          </AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
            </div>
          ) : filteredReports.length === 0 ? (
            <AdminEmptyState
              icon={<FolderOpen className="h-8 w-8" />}
              title="No Credit Reports"
              description="Upload a credit report to get started with dispute analysis."
            />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <tr>
                  <AdminTableHead>Client</AdminTableHead>
                  <AdminTableHead>File</AdminTableHead>
                  <AdminTableHead>Bureau</AdminTableHead>
                  <AdminTableHead>Score</AdminTableHead>
                  <AdminTableHead>Status</AdminTableHead>
                  <AdminTableHead>Date</AdminTableHead>
                  <AdminTableHead>Actions</AdminTableHead>
                </tr>
              </AdminTableHeader>
              <tbody>
                {filteredReports.map((report) => (
                  <AdminTableRow key={report.id} data-testid={`row-credit-report-${report.id}`}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(25,95%,45%)] flex items-center justify-center text-white text-xs font-semibold">
                          {report.clientName?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <span className="font-medium text-white">{report.clientName}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="text-sm">
                        <p className="text-white font-medium truncate max-w-[180px]">{report.fileName}</p>
                        <p className="text-[hsl(var(--admin-text-muted))] text-xs uppercase">{report.sourceFormat}</p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{getBureauBadge(report.bureau)}</AdminTableCell>
                    <AdminTableCell>
                      {report.creditScore ? (
                        <span className="text-lg font-bold text-white">{report.creditScore}</span>
                      ) : (
                        <span className="text-[hsl(var(--admin-text-muted))]">--</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>{getProcessingStatus(report.id, report.parseStatus, report.parseError)}</AdminTableCell>
                    <AdminTableCell>
                      <span className="text-[hsl(var(--admin-text-muted))] text-sm">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '--'}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Link href={`/admin-portal/credit-reports/${report.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
                          data-testid={`button-view-report-${report.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </tbody>
            </AdminTable>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}

type SelectedItem = {
  id: number;
  type: 'account' | 'inquiry' | 'collection' | 'public_record';
  name: string;
  severity: number;
  strategy: string;
  reason: string;
};

function DisputeHubPage({ reportId, clientUsers }: { reportId: number; clientUsers: User[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [generateLetterOpen, setGenerateLetterOpen] = useState(false);
  const [letterType, setLetterType] = useState<'round1' | 'round2' | 'validation' | 'goodwill' | 'inquiry' | 'fraud'>('round1');
  const [isFraudDispute, setIsFraudDispute] = useState(false);
  const [letterBureau, setLetterBureau] = useState<'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION'>('EXPERIAN');
  const [generatedLetter, setGeneratedLetter] = useState<DisputeLetterNew | null>(null);
  const [viewLetterOpen, setViewLetterOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DisputeLetterNew | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [lobSendOpen, setLobSendOpen] = useState(false);
  const [lobAddress, setLobAddress] = useState({ fromName: '', fromAddressLine1: '', fromAddressLine2: '', fromCity: '', fromState: '', fromZip: '' });
  const [compareReportId, setCompareReportId] = useState<number | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventRound, setNewEventRound] = useState<'1' | '2' | 'validation'>('1');
  
  // Create Dispute tab state
  type DisputeItem = {
    id: number;
    type: 'account' | 'inquiry' | 'collection' | 'public_record' | 'late_payment';
    name: string;
    reason: 'fraud' | 'late_payment_error' | 'closed_account' | 'not_my_inquiry' | 'balance_incorrect' | 'account_not_mine' | 'paid_collection' | 'payment_made_on_time' | 'creditor_error' | 'goodwill' | 'disaster_relief' | 'other';
    customReason: string;
    selected: boolean;
    accountNumber?: string;
    openDate?: string;
    balance?: number;
    accountType?: string;
    latePayments?: { days30?: number; days60?: number; days90?: number };
    inquiryDate?: string;
    originalCreditor?: string;
    amount?: number;
  };
  const [disputeItems, setDisputeItems] = useState<DisputeItem[]>([]);
  const [disputeChat, setDisputeChat] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);
  const [disputeChatInput, setDisputeChatInput] = useState('');
  const [disputeLetterContent, setDisputeLetterContent] = useState('');
  const [isGeneratingDispute, setIsGeneratingDispute] = useState(false);
  const [disputeBureau, setDisputeBureau] = useState<'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION'>('EXPERIAN');
  const [disputeLetterType, setDisputeLetterType] = useState<'round1' | 'round2' | 'validation' | 'fraud'>('round1');
  
  const { data: report, isLoading: reportLoading } = useQuery<CreditReportUpload & { clientName?: string; clientAddress?: { line1?: string; line2?: string; city?: string; state?: string; zip?: string } }>({
    queryKey: ['/api/admin/credit-report-uploads', reportId],
    select: (data: any) => {
      if (Array.isArray(data)) {
        return data.find((r: any) => r.id === reportId);
      }
      // Detail endpoint returns { upload, client, accounts, ... }
      if (data && data.upload) {
        const client = data.client;
        return {
          ...data.upload,
          clientName: client ? `${client.firstName} ${client.lastName}` : undefined,
          clientAddress: client ? {
            line1: client.addressLine1,
            line2: client.addressLine2,
            city: client.city,
            state: client.state,
            zip: client.zipCode,
          } : undefined,
        };
      }
      return data;
    }
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery<CreditReportAccount[]>({
    queryKey: [`/api/admin/credit-report-accounts?uploadId=${reportId}`],
    enabled: !!reportId,
  });

  const { data: inquiries = [], isLoading: inquiriesLoading } = useQuery<CreditReportInquiry[]>({
    queryKey: [`/api/admin/credit-report-inquiries?uploadId=${reportId}`],
    enabled: !!reportId,
  });

  const { data: collections = [], isLoading: collectionsLoading } = useQuery<CreditReportCollection[]>({
    queryKey: [`/api/admin/credit-report-collections?uploadId=${reportId}`],
    enabled: !!reportId,
  });

  const { data: publicRecords = [], isLoading: publicRecordsLoading } = useQuery<CreditReportPublicRecord[]>({
    queryKey: [`/api/admin/credit-report-public-records?uploadId=${reportId}`],
    enabled: !!reportId,
  });

  const { data: letters = [], isLoading: lettersLoading } = useQuery<DisputeLetterNew[]>({
    queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`],
    enabled: !!reportId,
  });

  const { data: allClientReports = [] } = useQuery<(CreditReportUpload & { clientName?: string })[]>({
    queryKey: ['/api/admin/credit-report-uploads'],
    select: (data) => data.filter(r => r.userId === report?.userId && r.id !== reportId),
    enabled: !!report?.userId,
  });

  const { data: compareAccounts = [] } = useQuery<CreditReportAccount[]>({
    queryKey: [`/api/admin/credit-report-accounts?uploadId=${compareReportId}`],
    enabled: !!compareReportId,
  });

  const { data: calendarEvents = [], isLoading: calendarLoading } = useQuery<DisputeCalendarEvent[]>({
    queryKey: ['/api/admin/dispute-calendar/client', report?.userId],
    enabled: !!report?.userId,
  });

  const createCalendarEventMutation = useMutation({
    mutationFn: async (data: { scheduledSendDate: string; round: '1' | '2' | 'validation' }) => {
      const response = await apiRequest('POST', '/api/admin/dispute-calendar', {
        clientId: report?.userId,
        round: data.round,
        scheduledSendDate: data.scheduledSendDate,
        followUpDate: new Date(new Date(data.scheduledSendDate).getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        expectedResponseBy: new Date(new Date(data.scheduledSendDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'scheduled'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-calendar/client', report?.userId] });
      setCreateEventOpen(false);
      setNewEventDate('');
      toast({ title: 'Success', description: 'Calendar event created' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create calendar event', variant: 'destructive' });
    }
  });

  const updateCalendarEventMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/dispute-calendar/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-calendar/client', report?.userId] });
      toast({ title: 'Success', description: 'Event status updated' });
    }
  });

  const generateLetterMutation = useMutation({
    mutationFn: async (data: { items: SelectedItem[]; letterType: string; bureau: string; isFraud: boolean }) => {
      const response = await apiRequest('POST', '/api/admin/dispute-letters-new/generate', {
        uploadId: reportId,
        clientId: report?.userId,
        items: data.items.map(item => ({
          type: item.type,
          id: item.id,
          name: item.name,
          reason: item.reason,
          strategy: item.strategy
        })),
        letterType: data.letterType,
        bureau: data.bureau,
        isFraud: data.isFraud
      });
      return response.json();
    },
    onSuccess: (letter: DisputeLetterNew) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new', reportId] });
      setGeneratedLetter(letter);
      toast({ title: 'Success', description: 'Dispute letter generated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate letter', variant: 'destructive' });
    }
  });

  const updateLetterMutation = useMutation({
    mutationFn: async ({ id, status, trackingNumber, sentDate }: { id: number; status?: 'draft' | 'approved' | 'sent'; trackingNumber?: string; sentDate?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
      if (sentDate !== undefined) updates.sentDate = sentDate;
      const response = await apiRequest('PATCH', `/api/admin/dispute-letters-new/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`] });
      toast({ title: 'Success', description: 'Letter updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update letter', variant: 'destructive' });
    }
  });

  const sendLobMutation = useMutation({
    mutationFn: async (address: typeof lobAddress) => {
      if (!selectedLetter) throw new Error("No letter selected");
      const response = await apiRequest('POST', `/api/admin/dispute-letters-new/${selectedLetter.id}/send-lob`, address);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.details || err.error || 'Failed to send via Lob');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`] });
      setLobSendOpen(false);
      setViewLetterOpen(false);
      toast({
        title: 'Letter Sent via Certified Mail!',
        description: `Tracking: ${data.trackingNumber || data.lobId}${data.expectedDeliveryDate ? ` · Expected delivery: ${data.expectedDeliveryDate}` : ''}`,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Lob Error', description: error.message, variant: 'destructive' });
    }
  });

  const downloadLetterAsPdf = (letter: DisputeLetterNew) => {
    const content = letter.content;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Dispute Letter - ${letter.bureau}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 16pt; margin-bottom: 20px; }
          .header { margin-bottom: 30px; }
          .date { margin-bottom: 20px; }
          .content { white-space: pre-wrap; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Credit Dispute Letter</h1>
          <div>Bureau: ${letter.bureau}</div>
          <div>Type: ${letter.letterType}</div>
          <div class="date">Date: ${new Date().toLocaleDateString()}</div>
        </div>
        <div class="content">${content.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const calculateAccountSeverity = (account: CreditReportAccount): { score: number; strategy: string; reason: string } => {
    let score = 0;
    const reasons: string[] = [];
    if (account.derogatoryFlags && account.derogatoryFlags.length > 0) {
      score += 40;
      reasons.push('Derogatory marks');
    }
    const lateCount = (account.latePayments?.days30 || 0) + (account.latePayments?.days60 || 0) + (account.latePayments?.days90 || 0);
    if (lateCount > 0) {
      score += Math.min(lateCount * 5, 30);
      reasons.push(`${lateCount} late payments`);
    }
    if (account.status?.toLowerCase().includes('chargeoff')) {
      score += 50;
      reasons.push('Charge-off status');
    }
    if (account.status?.toLowerCase().includes('collection')) {
      score += 45;
      reasons.push('In collections');
    }
    if (account.balance && account.balance > 1000) {
      score += 10;
      reasons.push('High balance');
    }
    let strategy = 'Request Validation';
    if (score >= 50) strategy = 'Dispute as Inaccurate';
    if (score >= 70) strategy = 'Request Deletion - FCRA Violation';
    if (score >= 85) strategy = 'Escalate to CFPB';
    return { score: Math.min(score, 100), strategy, reason: reasons.join(', ') || 'Standard dispute' };
  };

  const calculateInquirySeverity = (inquiry: CreditReportInquiry): { score: number; strategy: string; reason: string } => {
    let score = 0;
    const reasons: string[] = [];
    if (inquiry.inquiryType === 'hard') {
      score += 30;
      reasons.push('Hard inquiry');
      const inquiryDate = inquiry.inquiryDate ? new Date(inquiry.inquiryDate) : null;
      if (inquiryDate) {
        const monthsAgo = (Date.now() - inquiryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsAgo < 6) { score += 20; reasons.push('Recent inquiry'); }
        else if (monthsAgo < 12) { score += 10; reasons.push('Within last year'); }
      }
    } else {
      score += 5;
      reasons.push('Soft inquiry');
    }
    let strategy = 'Monitor Only';
    if (inquiry.inquiryType === 'hard') {
      strategy = 'Request Written Authorization';
      if (score >= 40) strategy = 'Dispute Unauthorized Inquiry';
    }
    return { score: Math.min(score, 100), strategy, reason: reasons.join(', ') || 'Standard inquiry' };
  };

  const calculateCollectionSeverity = (collection: CreditReportCollection): { score: number; strategy: string; reason: string } => {
    let score = 60;
    const reasons: string[] = ['Collection account'];
    if (collection.amount && collection.amount > 500) {
      score += 15;
      reasons.push(`$${collection.amount.toLocaleString()} balance`);
    }
    if (collection.amount && collection.amount > 2000) {
      score += 15;
    }
    const dateOpened = collection.dateOpened ? new Date(collection.dateOpened) : null;
    if (dateOpened) {
      const yearsAgo = (Date.now() - dateOpened.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsAgo > 5) { score -= 20; reasons.push('Older than 5 years'); }
      else if (yearsAgo < 2) { score += 10; reasons.push('Recent collection'); }
    }
    let strategy = 'Request Debt Validation';
    if (score >= 70) strategy = 'Dispute Collection Validity';
    if (score >= 85) strategy = 'Challenge with Pay-for-Delete Negotiation';
    return { score: Math.min(score, 100), strategy, reason: reasons.join(', ') };
  };

  const calculatePublicRecordSeverity = (record: CreditReportPublicRecord): { score: number; strategy: string; reason: string } => {
    let score = 70;
    const reasons: string[] = [];
    if (record.recordType?.toLowerCase().includes('bankruptcy')) {
      score = 90;
      reasons.push('Bankruptcy filing');
    } else if (record.recordType?.toLowerCase().includes('judgment')) {
      score = 85;
      reasons.push('Civil judgment');
    } else if (record.recordType?.toLowerCase().includes('lien')) {
      score = 80;
      reasons.push('Tax lien');
    } else {
      reasons.push('Public record');
    }
    let strategy = 'Verify Court Records';
    if (score >= 80) strategy = 'Request Documentation Proof';
    if (score >= 90) strategy = 'Dispute Reporting Accuracy';
    return { score: Math.min(score, 100), strategy, reason: reasons.join(', ') || 'Public record item' };
  };

  const toggleItemSelection = (id: number, type: SelectedItem['type'], name: string, severityData: { score: number; strategy: string; reason: string }) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === id && item.type === type);
      if (exists) {
        return prev.filter(item => !(item.id === id && item.type === type));
      }
      return [...prev, { id, type, name, severity: severityData.score, strategy: severityData.strategy, reason: severityData.reason }];
    });
  };

  const isItemSelected = (id: number, type: SelectedItem['type']) => {
    return selectedItems.some(item => item.id === id && item.type === type);
  };

  const getSeverityBadge = (score: number) => {
    if (score >= 80) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400">Critical</span>;
    if (score >= 60) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">High</span>;
    if (score >= 40) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Medium</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">Low</span>;
  };

  const getBureauBadge = (bureau: string) => {
    switch (bureau) {
      case "EXPERIAN":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">Experian</span>;
      case "EQUIFAX":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">Equifax</span>;
      case "TRANSUNION":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">TransUnion</span>;
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-400">{bureau}</span>;
    }
  };

  const getAccountStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-[hsl(var(--admin-text-muted))]">--</span>;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('open') || lowerStatus.includes('current')) {
      return <AdminBadge variant="success">{status}</AdminBadge>;
    } else if (lowerStatus.includes('closed')) {
      return <AdminBadge variant="default">{status}</AdminBadge>;
    } else if (lowerStatus.includes('collection') || lowerStatus.includes('chargeoff') || lowerStatus.includes('delinquent')) {
      return <AdminBadge variant="danger">{status}</AdminBadge>;
    }
    return <AdminBadge variant="warning">{status}</AdminBadge>;
  };

  if (reportLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[hsl(var(--admin-accent))]" />
      </div>
    );
  }

  const derogatoryCount = accounts.filter(a => a.derogatoryFlags && a.derogatoryFlags.length > 0).length;
  const latePaymentCount = accounts.reduce((sum, a) => sum + ((a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0)), 0);
  const sortedSelectedItems = [...selectedItems].sort((a, b) => b.severity - a.severity);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-portal/credit-reports">
          <Button variant="ghost" size="sm" className="text-[hsl(var(--admin-text-muted))] hover:text-white" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Dispute Hub
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">
            {report?.clientName || 'Client'} • {getBureauBadge(report?.bureau || '')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {report?.creditScore && (
            <div className="text-center px-4 py-2 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
              <div className="text-2xl font-bold text-white">{report.creditScore}</div>
              <div className="text-xs text-[hsl(var(--admin-text-muted))]">Credit Score</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AdminStatCard
          label="Accounts"
          value={accounts.length}
          icon={<CreditCard className="h-5 w-5" />}
          color="blue"
        />
        <AdminStatCard
          label="Inquiries"
          value={inquiries.length}
          icon={<SearchIcon className="h-5 w-5" />}
          color="orange"
        />
        <AdminStatCard
          label="Collections"
          value={collections.length}
          icon={<AlertCircle className="h-5 w-5" />}
          color="red"
        />
        <AdminStatCard
          label="Derogatory"
          value={derogatoryCount}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="purple"
        />
        <AdminStatCard
          label="Late Payments"
          value={latePaymentCount}
          icon={<Clock className="h-5 w-5" />}
          color="green"
        />
      </div>

      {selectedItems.length > 0 && (
        <AdminCard className="border-[hsl(var(--admin-accent))]/50">
          <AdminCardHeader>
            <div className="flex items-center justify-between w-full">
              <AdminCardTitle icon={<CheckSquare className="h-5 w-5" />}>
                Selected for Dispute ({selectedItems.length})
              </AdminCardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItems([])}
                  className="text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]"
                  data-testid="button-clear-selection"
                >
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setGenerateLetterOpen(true)}
                  className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                  data-testid="button-generate-from-selection"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Letter
                </Button>
              </div>
            </div>
          </AdminCardHeader>
          <AdminCardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedSelectedItems.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-accent))]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => {
                        setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
                      }}
                      data-testid={`checkbox-selected-${item.type}-${item.id}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">{item.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        <span className="text-xs text-[hsl(var(--admin-text-muted))]">{item.severity}%</span>
                      </div>
                      <p className="text-xs text-[hsl(var(--admin-accent))]">{item.strategy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--admin-accent))]/10 border border-[hsl(var(--admin-accent))]/30">
              <div className="flex items-center gap-2 text-[hsl(var(--admin-accent))]">
                <Brain className="h-4 w-4" />
                <span className="text-sm font-medium">AI Strategy Recommendation</span>
              </div>
              <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">
                {sortedSelectedItems.length > 0 && sortedSelectedItems[0].severity >= 70 
                  ? "High priority items detected. Recommend starting with FCRA violation disputes for maximum impact."
                  : sortedSelectedItems.length >= 3 
                    ? "Multiple items selected. Consider grouping by type for more effective dispute letters."
                    : "Items ready for dispute. Generate a letter to begin the dispute process."
                }
              </p>
            </div>
          </AdminCardContent>
        </AdminCard>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] p-1 flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="accounts" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Accounts ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="derogatory" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white text-red-400">
            Derogatory ({derogatoryCount})
          </TabsTrigger>
          <TabsTrigger value="late-payments" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white text-yellow-400">
            Late Payments ({latePaymentCount})
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Inquiries ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="collections" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Collections ({collections.length})
          </TabsTrigger>
          <TabsTrigger value="public-records" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Public Records ({publicRecords.length})
          </TabsTrigger>
          <TabsTrigger value="create-dispute" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-green-400">
            <Plus className="h-4 w-4 mr-1" />
            Create Dispute
          </TabsTrigger>
          <TabsTrigger value="letters" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Letters ({letters.length})
          </TabsTrigger>
          <TabsTrigger value="diff-view" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Report Summary</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                    <span className="text-[hsl(var(--admin-text-muted))]">File Name</span>
                    <span className="text-white font-medium">{report?.fileName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                    <span className="text-[hsl(var(--admin-text-muted))]">Bureau</span>
                    <span>{getBureauBadge(report?.bureau || '')}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                    <span className="text-[hsl(var(--admin-text-muted))]">Parse Status</span>
                    <AdminBadge variant={report?.parseStatus === 'succeeded' ? 'success' : report?.parseStatus === 'failed' ? 'danger' : 'warning'}>
                      {report?.parseStatus}
                    </AdminBadge>
                  </div>
                  {report?.parseStatus === 'failed' && report?.parseError && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-800">
                      <p className="text-xs text-red-400 font-medium mb-1">Parse Error</p>
                      <p className="text-xs text-red-300 break-words">{report.parseError}</p>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                    <span className="text-[hsl(var(--admin-text-muted))]">Uploaded</span>
                    <span className="text-white">{report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : '--'}</span>
                  </div>
                </div>
              </AdminCardContent>
            </AdminCard>

            <AdminCard>
              <AdminCardHeader>
                <AdminCardTitle icon={<AlertTriangle className="h-5 w-5" />}>Issues Found</AdminCardTitle>
              </AdminCardHeader>
              <AdminCardContent>
                <div className="space-y-4">
                  {derogatoryCount > 0 && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-red-500/20">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                          <span className="text-white font-medium">Derogatory Accounts</span>
                        </div>
                        <span className="text-lg font-bold text-red-400">{derogatoryCount}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {accounts.filter(a => a.derogatoryFlags && a.derogatoryFlags.length > 0).map((account) => (
                          <div key={account.id} className="flex items-center justify-between py-2 px-3 rounded bg-red-500/5">
                            <div>
                              <span className="text-white text-sm font-medium">{account.creditorName}</span>
                              <p className="text-xs text-red-300">{account.derogatoryFlags?.join(', ')}</p>
                            </div>
                            <span className="text-red-400 text-sm">{account.balance ? `$${account.balance.toLocaleString()}` : '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {collections.length > 0 && (
                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-orange-500/20">
                        <div className="flex items-center gap-3">
                          <Landmark className="h-5 w-5 text-orange-400" />
                          <span className="text-white font-medium">Collection Accounts</span>
                        </div>
                        <span className="text-lg font-bold text-orange-400">{collections.length}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {collections.map((collection) => (
                          <div key={collection.id} className="flex items-center justify-between py-2 px-3 rounded bg-orange-500/5">
                            <div>
                              <span className="text-white text-sm font-medium">{collection.agencyName}</span>
                              {collection.originalCreditor && <p className="text-xs text-orange-300">Original: {collection.originalCreditor}</p>}
                            </div>
                            <span className="text-orange-400 text-sm font-medium">{collection.amount ? `$${collection.amount.toLocaleString()}` : '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {latePaymentCount > 0 && (
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-yellow-500/20">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-yellow-400" />
                          <span className="text-white font-medium">Late Payments</span>
                        </div>
                        <span className="text-lg font-bold text-yellow-400">{latePaymentCount}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0).map((account) => (
                          <div key={account.id} className="flex items-center justify-between py-2 px-3 rounded bg-yellow-500/5">
                            <div>
                              <span className="text-white text-sm font-medium">{account.creditorName}</span>
                              <p className="text-xs text-yellow-300">
                                {account.latePayments?.days30 ? `30-day: ${account.latePayments.days30}` : ''} 
                                {account.latePayments?.days60 ? ` | 60-day: ${account.latePayments.days60}` : ''} 
                                {account.latePayments?.days90 ? ` | 90-day: ${account.latePayments.days90}` : ''}
                              </p>
                            </div>
                            <span className="text-yellow-400 text-sm">{account.balance ? `$${account.balance.toLocaleString()}` : '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {inquiries.filter(i => i.inquiryType === 'hard').length > 0 && (
                    <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <SearchIcon className="h-5 w-5 text-purple-400" />
                          <span className="text-white font-medium">Hard Inquiries</span>
                        </div>
                        <span className="text-lg font-bold text-purple-400">{inquiries.filter(i => i.inquiryType === 'hard').length}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {inquiries.filter(i => i.inquiryType === 'hard').map((inquiry) => (
                          <div key={inquiry.id} className="flex items-center justify-between py-2 px-3 rounded bg-purple-500/5">
                            <span className="text-white text-sm font-medium">{inquiry.creditorName}</span>
                            <span className="text-purple-300 text-xs">{inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString() : '--'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {derogatoryCount === 0 && collections.length === 0 && latePaymentCount === 0 && inquiries.filter(i => i.inquiryType === 'hard').length === 0 && (
                    <AdminEmptyState
                      icon={<CheckSquare className="h-6 w-6" />}
                      title="No Major Issues"
                      description="This credit report looks clean!"
                    />
                  )}
                </div>
              </AdminCardContent>
            </AdminCard>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<CreditCard className="h-5 w-5" />}>Tradelines & Accounts</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : accounts.length === 0 ? (
                <AdminEmptyState
                  icon={<CreditCard className="h-8 w-8" />}
                  title="No Accounts Found"
                  description="No tradeline data has been parsed from this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Creditor</AdminTableHead>
                      <AdminTableHead>Balance</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead>Severity</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {accounts.map((account) => {
                      const severity = calculateAccountSeverity(account);
                      return (
                        <AdminTableRow key={account.id} data-testid={`row-account-${account.id}`} className={isItemSelected(account.id, 'account') ? 'bg-[hsl(var(--admin-accent))]/10' : ''}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(account.id, 'account')}
                              onCheckedChange={() => toggleItemSelection(account.id, 'account', account.creditorName || 'Unknown', severity)}
                              data-testid={`checkbox-account-${account.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <div>
                              <span className="font-medium text-white">{account.creditorName}</span>
                              <p className="text-xs text-[hsl(var(--admin-text-muted))]">{account.accountNumberMasked || account.accountType}</p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-white font-medium">
                              {account.balance ? `$${account.balance.toLocaleString()}` : '--'}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>{getAccountStatusBadge(account.status)}</AdminTableCell>
                          <AdminTableCell>{getSeverityBadge(severity.score)}</AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="derogatory" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<AlertCircle className="h-5 w-5 text-red-400" />}>Derogatory Accounts</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400" />
                </div>
              ) : accounts.filter(a => a.derogatoryFlags && a.derogatoryFlags.length > 0).length === 0 ? (
                <AdminEmptyState
                  icon={<CheckSquare className="h-8 w-8" />}
                  title="No Derogatory Accounts"
                  description="No accounts with derogatory marks found in this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Creditor</AdminTableHead>
                      <AdminTableHead>Balance</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead>Derogatory Flags</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {accounts.filter(a => a.derogatoryFlags && a.derogatoryFlags.length > 0).map((account) => {
                      const severity = calculateAccountSeverity(account);
                      return (
                        <AdminTableRow key={account.id} data-testid={`row-derogatory-${account.id}`} className={`bg-red-500/5 ${isItemSelected(account.id, 'account') ? 'bg-red-500/20' : ''}`}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(account.id, 'account')}
                              onCheckedChange={() => toggleItemSelection(account.id, 'account', account.creditorName || 'Unknown', severity)}
                              data-testid={`checkbox-derogatory-${account.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <div>
                              <span className="font-medium text-white">{account.creditorName}</span>
                              <p className="text-xs text-[hsl(var(--admin-text-muted))]">{account.accountNumberMasked || account.accountType}</p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-white font-medium">
                              {account.balance ? `$${account.balance.toLocaleString()}` : '--'}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>{getAccountStatusBadge(account.status)}</AdminTableCell>
                          <AdminTableCell>
                            <div className="flex flex-wrap gap-1">
                              {account.derogatoryFlags?.map((flag, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                                  {flag}
                                </span>
                              ))}
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="late-payments" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<Clock className="h-5 w-5 text-yellow-400" />}>Accounts with Late Payments</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {accountsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400" />
                </div>
              ) : accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0).length === 0 ? (
                <AdminEmptyState
                  icon={<CheckSquare className="h-8 w-8" />}
                  title="No Late Payments"
                  description="No accounts with late payment history found in this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Creditor</AdminTableHead>
                      <AdminTableHead>Balance</AdminTableHead>
                      <AdminTableHead>30 Days</AdminTableHead>
                      <AdminTableHead>60 Days</AdminTableHead>
                      <AdminTableHead>90+ Days</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0).map((account) => {
                      const severity = calculateAccountSeverity(account);
                      return (
                        <AdminTableRow key={account.id} data-testid={`row-late-payment-${account.id}`} className={`bg-yellow-500/5 ${isItemSelected(account.id, 'account') ? 'bg-yellow-500/20' : ''}`}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(account.id, 'account')}
                              onCheckedChange={() => toggleItemSelection(account.id, 'account', account.creditorName || 'Unknown', severity)}
                              data-testid={`checkbox-late-payment-${account.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <div>
                              <span className="font-medium text-white">{account.creditorName}</span>
                              <p className="text-xs text-[hsl(var(--admin-text-muted))]">{account.accountNumberMasked || account.accountType}</p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-white font-medium">
                              {account.balance ? `$${account.balance.toLocaleString()}` : '--'}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className={`font-medium ${account.latePayments?.days30 ? 'text-yellow-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                              {account.latePayments?.days30 || 0}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className={`font-medium ${account.latePayments?.days60 ? 'text-orange-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                              {account.latePayments?.days60 || 0}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className={`font-medium ${account.latePayments?.days90 ? 'text-red-400' : 'text-[hsl(var(--admin-text-muted))]'}`}>
                              {account.latePayments?.days90 || 0}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<SearchIcon className="h-5 w-5" />}>Credit Inquiries</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {inquiriesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : inquiries.length === 0 ? (
                <AdminEmptyState
                  icon={<SearchIcon className="h-8 w-8" />}
                  title="No Inquiries Found"
                  description="No inquiry data has been parsed from this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Creditor</AdminTableHead>
                      <AdminTableHead>Type</AdminTableHead>
                      <AdminTableHead>Date</AdminTableHead>
                      <AdminTableHead>Severity</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {inquiries.map((inquiry) => {
                      const severity = calculateInquirySeverity(inquiry);
                      return (
                        <AdminTableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`} className={isItemSelected(inquiry.id, 'inquiry') ? 'bg-[hsl(var(--admin-accent))]/10' : ''}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(inquiry.id, 'inquiry')}
                              onCheckedChange={() => toggleItemSelection(inquiry.id, 'inquiry', inquiry.creditorName || 'Unknown', severity)}
                              data-testid={`checkbox-inquiry-${inquiry.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="font-medium text-white">{inquiry.creditorName}</span>
                          </AdminTableCell>
                          <AdminTableCell>
                            {inquiry.inquiryType === 'hard' ? (
                              <AdminBadge variant="danger">Hard</AdminBadge>
                            ) : (
                              <AdminBadge variant="success">Soft</AdminBadge>
                            )}
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-white">
                              {inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString() : '--'}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>{getSeverityBadge(severity.score)}</AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="collections" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<Landmark className="h-5 w-5" />}>Collection Accounts</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {collectionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : collections.length === 0 ? (
                <AdminEmptyState
                  icon={<Landmark className="h-8 w-8" />}
                  title="No Collections Found"
                  description="No collection accounts found in this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Agency</AdminTableHead>
                      <AdminTableHead>Balance</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead>Severity</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {collections.map((collection) => {
                      const severity = calculateCollectionSeverity(collection);
                      return (
                        <AdminTableRow key={collection.id} data-testid={`row-collection-${collection.id}`} className={isItemSelected(collection.id, 'collection') ? 'bg-[hsl(var(--admin-accent))]/10' : ''}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(collection.id, 'collection')}
                              onCheckedChange={() => toggleItemSelection(collection.id, 'collection', collection.agencyName || 'Unknown', severity)}
                              data-testid={`checkbox-collection-${collection.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <div>
                              <span className="font-medium text-white">{collection.agencyName}</span>
                              <p className="text-xs text-[hsl(var(--admin-text-muted))]">{collection.originalCreditor || '--'}</p>
                            </div>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-red-400 font-medium">
                              {collection.amount ? `$${collection.amount.toLocaleString()}` : '--'}
                            </span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <AdminBadge variant={collection.status === 'paid' ? 'success' : 'danger'}>
                              {collection.status || 'Open'}
                            </AdminBadge>
                          </AdminTableCell>
                          <AdminTableCell>{getSeverityBadge(severity.score)}</AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="public-records" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Public Records</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {publicRecordsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : publicRecords.length === 0 ? (
                <AdminEmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No Public Records"
                  description="No public records found in this credit report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead className="w-10"></AdminTableHead>
                      <AdminTableHead>Type</AdminTableHead>
                      <AdminTableHead>Court</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead>Severity</AdminTableHead>
                      <AdminTableHead>Strategy</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {publicRecords.map((record) => {
                      const severity = calculatePublicRecordSeverity(record);
                      return (
                        <AdminTableRow key={record.id} data-testid={`row-public-record-${record.id}`} className={isItemSelected(record.id, 'public_record') ? 'bg-[hsl(var(--admin-accent))]/10' : ''}>
                          <AdminTableCell>
                            <Checkbox
                              checked={isItemSelected(record.id, 'public_record')}
                              onCheckedChange={() => toggleItemSelection(record.id, 'public_record', record.recordType || 'Unknown', severity)}
                              data-testid={`checkbox-public-record-${record.id}`}
                            />
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="font-medium text-white capitalize">{record.recordType}</span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <span className="text-[hsl(var(--admin-text-muted))]">{record.court || '--'}</span>
                          </AdminTableCell>
                          <AdminTableCell>
                            <AdminBadge variant={record.status === 'dismissed' ? 'success' : 'danger'}>
                              {record.status || 'Active'}
                            </AdminBadge>
                          </AdminTableCell>
                          <AdminTableCell>{getSeverityBadge(severity.score)}</AdminTableCell>
                          <AdminTableCell>
                            <span className="text-xs text-[hsl(var(--admin-accent))]">{severity.strategy}</span>
                          </AdminTableCell>
                        </AdminTableRow>
                      );
                    })}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="create-dispute" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitle icon={<Plus className="h-5 w-5 text-green-400" />}>Select Items to Dispute</AdminCardTitle>
                </AdminCardHeader>
                <AdminCardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-[hsl(var(--admin-text-muted))]">Letter Type</Label>
                        <Select value={disputeLetterType} onValueChange={(v: any) => setDisputeLetterType(v)}>
                          <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                            <SelectItem value="round1">Round 1 - Initial Dispute</SelectItem>
                            <SelectItem value="round2">Round 2 - Follow-up</SelectItem>
                            <SelectItem value="validation">Debt Validation</SelectItem>
                            <SelectItem value="fraud">Fraud/Identity Theft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[hsl(var(--admin-text-muted))]">Target Bureau</Label>
                        <Select value={disputeBureau} onValueChange={(v: any) => setDisputeBureau(v)}>
                          <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                            <SelectItem value="EXPERIAN">Experian</SelectItem>
                            <SelectItem value="EQUIFAX">Equifax</SelectItem>
                            <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
                      <div className="bg-[hsl(var(--admin-bg))] p-3 border-b border-[hsl(var(--admin-border))]">
                        <span className="text-white font-medium">Accounts ({accounts.length})</span>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto">
                        {accounts.map((account) => {
                          const item = disputeItems.find(d => d.id === account.id && d.type === 'account');
                          return (
                            <div key={account.id} className={`p-3 border-b border-[hsl(var(--admin-border))] last:border-b-0 ${item?.selected ? 'bg-green-500/10' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item?.selected || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setDisputeItems(prev => [...prev.filter(d => !(d.id === account.id && d.type === 'account')), {
                                        id: account.id,
                                        type: 'account',
                                        name: account.creditorName || 'Unknown',
                                        reason: 'other',
                                        customReason: '',
                                        selected: true,
                                        accountNumber: account.accountNumberMasked || account.accountNumber,
                                        openDate: account.dateOpened,
                                        balance: account.balance,
                                        accountType: account.accountType,
                                        latePayments: account.latePayments
                                      }]);
                                    } else {
                                      setDisputeItems(prev => prev.filter(d => !(d.id === account.id && d.type === 'account')));
                                    }
                                  }}
                                  data-testid={`checkbox-dispute-account-${account.id}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{account.creditorName}</span>
                                    <span className="text-xs text-[hsl(var(--admin-text-muted))]">{account.accountNumberMasked}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-[hsl(var(--admin-text-muted))]">
                                      {account.balance ? `$${account.balance.toLocaleString()}` : '--'}
                                    </span>
                                    {account.derogatoryFlags?.map((flag, i) => (
                                      <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">{flag}</span>
                                    ))}
                                  </div>
                                  {item?.selected && (
                                    <div className="mt-2 space-y-2">
                                      <Select 
                                        value={item.reason} 
                                        onValueChange={(v: any) => {
                                          setDisputeItems(prev => prev.map(d => 
                                            d.id === account.id && d.type === 'account' ? {...d, reason: v} : d
                                          ));
                                        }}
                                      >
                                        <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                                          <SelectValue placeholder="Select dispute reason" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                                          <SelectItem value="fraud">Fraud - Not My Account</SelectItem>
                                          <SelectItem value="late_payment_error">Late Payment Reported in Error</SelectItem>
                                          <SelectItem value="closed_account">Account Should Show Closed</SelectItem>
                                          <SelectItem value="balance_incorrect">Balance is Incorrect</SelectItem>
                                          <SelectItem value="account_not_mine">Account Does Not Belong to Me</SelectItem>
                                          <SelectItem value="paid_collection">Collection Already Paid</SelectItem>
                                          <SelectItem value="other">Other (specify below)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {item.reason === 'other' && (
                                        <input
                                          type="text"
                                          placeholder="Describe the issue..."
                                          value={item.customReason}
                                          onChange={(e) => {
                                            setDisputeItems(prev => prev.map(d => 
                                              d.id === account.id && d.type === 'account' ? {...d, customReason: e.target.value} : d
                                            ));
                                          }}
                                          className="w-full px-3 py-1.5 rounded bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white text-sm"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden border-yellow-500/30">
                      <div className="bg-yellow-500/10 p-3 border-b border-[hsl(var(--admin-border))]">
                        <span className="text-yellow-400 font-medium">Late Payments ({accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0 || a.derogatoryFlags?.includes('Late Payment')).length})</span>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto">
                        {accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0 || a.derogatoryFlags?.includes('Late Payment')).length === 0 ? (
                          <div className="p-4 text-center text-[hsl(var(--admin-text-muted))]">No accounts with late payments</div>
                        ) : accounts.filter(a => (a.latePayments?.days30 || 0) + (a.latePayments?.days60 || 0) + (a.latePayments?.days90 || 0) > 0 || a.derogatoryFlags?.includes('Late Payment')).map((account) => {
                          const item = disputeItems.find(d => d.id === account.id && d.type === 'late_payment');
                          const totalLates = (account.latePayments?.days30 || 0) + (account.latePayments?.days60 || 0) + (account.latePayments?.days90 || 0);
                          return (
                            <div key={`late-${account.id}`} className={`p-3 border-b border-[hsl(var(--admin-border))] last:border-b-0 ${item?.selected ? 'bg-yellow-500/10' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item?.selected || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setDisputeItems(prev => [...prev.filter(d => !(d.id === account.id && d.type === 'late_payment')), {
                                        id: account.id,
                                        type: 'late_payment',
                                        name: account.creditorName || 'Unknown',
                                        reason: 'late_payment_error',
                                        customReason: '',
                                        selected: true,
                                        accountNumber: account.accountNumberMasked || account.accountNumber,
                                        openDate: account.dateOpened,
                                        balance: account.balance,
                                        accountType: account.accountType,
                                        latePayments: account.latePayments
                                      }]);
                                    } else {
                                      setDisputeItems(prev => prev.filter(d => !(d.id === account.id && d.type === 'late_payment')));
                                    }
                                  }}
                                  data-testid={`checkbox-dispute-late-${account.id}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{account.creditorName}</span>
                                    <div className="flex gap-1">
                                      {account.latePayments?.days30 ? <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">30d: {account.latePayments.days30}</span> : null}
                                      {account.latePayments?.days60 ? <span className="px-1.5 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400">60d: {account.latePayments.days60}</span> : null}
                                      {account.latePayments?.days90 ? <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">90d: {account.latePayments.days90}</span> : null}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-[hsl(var(--admin-text-muted))]">{account.accountType}</span>
                                    <span className="text-xs text-yellow-400">{totalLates} late payment{totalLates !== 1 ? 's' : ''}</span>
                                  </div>
                                  {item?.selected && (
                                    <div className="mt-2 space-y-2">
                                      <Select 
                                        value={item.reason} 
                                        onValueChange={(v: any) => {
                                          setDisputeItems(prev => prev.map(d => 
                                            d.id === account.id && d.type === 'late_payment' ? {...d, reason: v} : d
                                          ));
                                        }}
                                      >
                                        <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                                          <SelectValue placeholder="Select dispute reason" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                                          <SelectItem value="late_payment_error">Late Payment Reported in Error</SelectItem>
                                          <SelectItem value="payment_made_on_time">Payment Was Made On Time</SelectItem>
                                          <SelectItem value="creditor_error">Creditor Reporting Error</SelectItem>
                                          <SelectItem value="goodwill">Goodwill Adjustment Request</SelectItem>
                                          <SelectItem value="disaster_relief">Natural Disaster/COVID Relief</SelectItem>
                                          <SelectItem value="other">Other (specify below)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {item.reason === 'other' && (
                                        <input
                                          type="text"
                                          placeholder="Describe the issue..."
                                          value={item.customReason}
                                          onChange={(e) => {
                                            setDisputeItems(prev => prev.map(d => 
                                              d.id === account.id && d.type === 'late_payment' ? {...d, customReason: e.target.value} : d
                                            ));
                                          }}
                                          className="w-full px-3 py-1.5 rounded bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white text-sm"
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
                      <div className="bg-[hsl(var(--admin-bg))] p-3 border-b border-[hsl(var(--admin-border))]">
                        <span className="text-white font-medium">Inquiries ({inquiries.length})</span>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto">
                        {inquiries.length === 0 ? (
                          <div className="p-4 text-center text-[hsl(var(--admin-text-muted))]">No inquiries found</div>
                        ) : inquiries.map((inquiry) => {
                          const item = disputeItems.find(d => d.id === inquiry.id && d.type === 'inquiry');
                          return (
                            <div key={inquiry.id} className={`p-3 border-b border-[hsl(var(--admin-border))] last:border-b-0 ${item?.selected ? 'bg-green-500/10' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item?.selected || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setDisputeItems(prev => [...prev.filter(d => !(d.id === inquiry.id && d.type === 'inquiry')), {
                                        id: inquiry.id,
                                        type: 'inquiry',
                                        name: inquiry.creditorName || 'Unknown',
                                        reason: 'not_my_inquiry',
                                        customReason: '',
                                        selected: true,
                                        inquiryDate: inquiry.inquiryDate
                                      }]);
                                    } else {
                                      setDisputeItems(prev => prev.filter(d => !(d.id === inquiry.id && d.type === 'inquiry')));
                                    }
                                  }}
                                  data-testid={`checkbox-dispute-inquiry-${inquiry.id}`}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{inquiry.creditorName}</span>
                                    <span className="text-xs text-[hsl(var(--admin-text-muted))]">{inquiry.inquiryDate}</span>
                                  </div>
                                  {item?.selected && (
                                    <div className="mt-2">
                                      <Select 
                                        value={item.reason} 
                                        onValueChange={(v: any) => {
                                          setDisputeItems(prev => prev.map(d => 
                                            d.id === inquiry.id && d.type === 'inquiry' ? {...d, reason: v} : d
                                          ));
                                        }}
                                      >
                                        <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                                          <SelectItem value="not_my_inquiry">I Did Not Authorize This Inquiry</SelectItem>
                                          <SelectItem value="fraud">Fraudulent Inquiry</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-[hsl(var(--admin-border))] rounded-lg overflow-hidden">
                      <div className="bg-[hsl(var(--admin-bg))] p-3 border-b border-[hsl(var(--admin-border))]">
                        <span className="text-white font-medium">Collections ({collections.length})</span>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto">
                        {collections.length === 0 ? (
                          <div className="p-4 text-center text-[hsl(var(--admin-text-muted))]">No collections found</div>
                        ) : collections.map((collection) => {
                          const item = disputeItems.find(d => d.id === collection.id && d.type === 'collection');
                          return (
                            <div key={collection.id} className={`p-3 border-b border-[hsl(var(--admin-border))] last:border-b-0 ${item?.selected ? 'bg-green-500/10' : ''}`}>
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={item?.selected || false}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setDisputeItems(prev => [...prev.filter(d => !(d.id === collection.id && d.type === 'collection')), {
                                        id: collection.id,
                                        type: 'collection',
                                        name: collection.agencyName || collection.originalCreditor || 'Unknown',
                                        reason: 'paid_collection',
                                        customReason: '',
                                        selected: true,
                                        accountNumber: collection.accountNumber,
                                        openDate: collection.dateOpened,
                                        originalCreditor: collection.originalCreditor,
                                        amount: collection.amount
                                      }]);
                                    } else {
                                      setDisputeItems(prev => prev.filter(d => !(d.id === collection.id && d.type === 'collection')));
                                    }
                                  }}
                                  data-testid={`checkbox-dispute-collection-${collection.id}`}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{collection.agencyName || collection.originalCreditor}</span>
                                    <span className="text-red-400 font-medium">${collection.amount?.toLocaleString() || '0'}</span>
                                  </div>
                                  {item?.selected && (
                                    <div className="mt-2">
                                      <Select 
                                        value={item.reason} 
                                        onValueChange={(v: any) => {
                                          setDisputeItems(prev => prev.map(d => 
                                            d.id === collection.id && d.type === 'collection' ? {...d, reason: v} : d
                                          ));
                                        }}
                                      >
                                        <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                                          <SelectItem value="paid_collection">Already Paid/Settled</SelectItem>
                                          <SelectItem value="account_not_mine">Not My Debt</SelectItem>
                                          <SelectItem value="fraud">Fraudulent</SelectItem>
                                          <SelectItem value="balance_incorrect">Balance Incorrect</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </AdminCardContent>
              </AdminCard>

              {disputeLetterContent && (
                <AdminCard>
                  <AdminCardHeader>
                    <div className="flex items-center justify-between w-full">
                      <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Generated Letter</AdminCardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                              printWindow.document.write(`<html><head><title>Dispute Letter</title><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.6;padding:40px;max-width:800px;margin:0 auto;white-space:pre-wrap;}</style></head><body>${disputeLetterContent.replace(/\n/g, '<br>')}</body></html>`);
                              printWindow.document.close();
                              setTimeout(() => printWindow.print(), 250);
                            }
                          }}
                          className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
                          data-testid="button-print-dispute-letter"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await apiRequest('POST', '/api/admin/dispute-letters-new', {
                                uploadId: reportId,
                                clientId: report?.userId,
                                letterType: disputeLetterType,
                                bureau: disputeBureau,
                                content: disputeLetterContent,
                                status: 'draft'
                              });
                              if (response.ok) {
                                queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`] });
                                toast({ title: 'Success', description: 'Letter saved to Letters tab' });
                              }
                            } catch (error) {
                              toast({ title: 'Error', description: 'Failed to save letter', variant: 'destructive' });
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          data-testid="button-save-dispute-letter"
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Save Letter
                        </Button>
                      </div>
                    </div>
                  </AdminCardHeader>
                  <AdminCardContent>
                    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] max-h-[400px] overflow-y-auto">
                      <pre className="text-sm text-white whitespace-pre-wrap font-sans">{disputeLetterContent}</pre>
                    </div>
                  </AdminCardContent>
                </AdminCard>
              )}
            </div>

            <div className="space-y-6">
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitle icon={<Brain className="h-5 w-5 text-purple-400" />}>AI Assistant</AdminCardTitle>
                </AdminCardHeader>
                <AdminCardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                        Selected: <span className="text-white font-medium">{disputeItems.filter(d => d.selected).length} items</span>
                      </p>
                      {disputeItems.filter(d => d.selected).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-white">{item.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))]">
                            {item.reason.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="h-[200px] overflow-y-auto space-y-2 p-2 rounded-lg bg-[hsl(var(--admin-bg))]/30">
                      {disputeChat.length === 0 ? (
                        <div className="text-center text-[hsl(var(--admin-text-muted))] text-sm py-8">
                          Tell me what to include in the letter or how to adjust it...
                        </div>
                      ) : disputeChat.map((msg, idx) => (
                        <div key={idx} className={`p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-[hsl(var(--admin-accent))]/20 text-white ml-4' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] mr-4'}`}>
                          {msg.content}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tell AI what to fix or add..."
                        value={disputeChatInput}
                        onChange={(e) => setDisputeChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && disputeChatInput.trim()) {
                            const userMsg = disputeChatInput.trim();
                            setDisputeChat(prev => [...prev, { role: 'user', content: userMsg }]);
                            setDisputeChatInput('');
                            
                            (async () => {
                              try {
                                const response = await apiRequest('POST', '/api/admin/dispute-chat', {
                                  message: userMsg,
                                  currentLetter: disputeLetterContent,
                                  items: disputeItems.filter(d => d.selected),
                                  bureau: disputeBureau,
                                  letterType: disputeLetterType
                                });
                                const result = await response.json();
                                setDisputeChat(prev => [...prev, { role: 'ai', content: result.message }]);
                                if (result.updatedLetter) {
                                  setDisputeLetterContent(result.updatedLetter);
                                }
                              } catch (error) {
                                setDisputeChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
                              }
                            })();
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white text-sm"
                        data-testid="input-dispute-chat"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[hsl(var(--admin-accent))]"
                        onClick={() => {
                          if (disputeChatInput.trim()) {
                            const userMsg = disputeChatInput.trim();
                            setDisputeChat(prev => [...prev, { role: 'user', content: userMsg }]);
                            setDisputeChatInput('');
                            
                            (async () => {
                              try {
                                const response = await apiRequest('POST', '/api/admin/dispute-chat', {
                                  message: userMsg,
                                  currentLetter: disputeLetterContent,
                                  items: disputeItems.filter(d => d.selected),
                                  bureau: disputeBureau,
                                  letterType: disputeLetterType
                                });
                                const result = await response.json();
                                setDisputeChat(prev => [...prev, { role: 'ai', content: result.message }]);
                                if (result.updatedLetter) {
                                  setDisputeLetterContent(result.updatedLetter);
                                }
                              } catch (error) {
                                setDisputeChat(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
                              }
                            })();
                          }
                        }}
                        data-testid="button-send-chat"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={disputeItems.filter(d => d.selected).length === 0 || isGeneratingDispute}
                      onClick={async () => {
                        setIsGeneratingDispute(true);
                        try {
                          const selectedDisputeItems = disputeItems.filter(d => d.selected);
                          const response = await apiRequest('POST', '/api/admin/dispute-letters-new/generate', {
                            uploadId: reportId,
                            clientId: report?.userId,
                            items: selectedDisputeItems.map(item => ({
                              id: item.id,
                              type: item.type,
                              name: item.name,
                              reason: item.reason === 'other' ? item.customReason : item.reason.replace(/_/g, ' '),
                              strategy: item.reason,
                              accountNumber: item.accountNumber,
                              openDate: item.openDate,
                              balance: item.balance,
                              accountType: item.accountType,
                              latePayments: item.latePayments,
                              inquiryDate: item.inquiryDate,
                              originalCreditor: item.originalCreditor,
                              amount: item.amount
                            })),
                            letterType: disputeLetterType,
                            bureau: disputeBureau,
                            isFraud: disputeLetterType === 'fraud' || selectedDisputeItems.some(i => i.reason === 'fraud')
                          });
                          const result = await response.json();
                          if (result.content) {
                            setDisputeLetterContent(result.content);
                            setDisputeChat(prev => [...prev, { role: 'ai', content: 'Letter generated! You can now review it, make changes, or ask me to modify specific parts.' }]);
                          }
                        } catch (error) {
                          toast({ title: 'Error', description: 'Failed to generate letter', variant: 'destructive' });
                        } finally {
                          setIsGeneratingDispute(false);
                        }
                      }}
                      data-testid="button-generate-dispute-letter"
                    >
                      {isGeneratingDispute ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Letter
                        </>
                      )}
                    </Button>
                  </div>
                </AdminCardContent>
              </AdminCard>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="letters" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<Mail className="h-5 w-5" />}>Dispute Letters</AdminCardTitle>
                <Button 
                  className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                  data-testid="button-generate-letter"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Letter
                </Button>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              {lettersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : letters.length === 0 ? (
                <AdminEmptyState
                  icon={<Mail className="h-8 w-8" />}
                  title="No Letters Yet"
                  description="Generate dispute letters for items found in this report."
                />
              ) : (
                <AdminTable>
                  <AdminTableHeader>
                    <tr>
                      <AdminTableHead>Round</AdminTableHead>
                      <AdminTableHead>Bureau</AdminTableHead>
                      <AdminTableHead>Status</AdminTableHead>
                      <AdminTableHead>Created</AdminTableHead>
                      <AdminTableHead>Actions</AdminTableHead>
                    </tr>
                  </AdminTableHeader>
                  <tbody>
                    {letters.map((letter) => (
                      <AdminTableRow key={letter.id} data-testid={`row-letter-${letter.id}`}>
                        <AdminTableCell>
                          <span className="text-white font-medium capitalize">{letter.letterType}</span>
                        </AdminTableCell>
                        <AdminTableCell>
                          {getBureauBadge(letter.bureau || '')}
                        </AdminTableCell>
                        <AdminTableCell>
                          <AdminBadge variant={
                            letter.status === 'approved' ? 'success' : 
                            letter.status === 'sent' ? 'success' : 'warning'
                          }>
                            {letter.status}
                          </AdminBadge>
                        </AdminTableCell>
                        <AdminTableCell>
                          <span className="text-white">
                            {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : '--'}
                          </span>
                        </AdminTableCell>
                        <AdminTableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
                              onClick={() => { setSelectedLetter(letter); setViewLetterOpen(true); }}
                              data-testid={`button-view-letter-${letter.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:bg-blue-400/10"
                              onClick={() => downloadLetterAsPdf(letter)}
                              data-testid={`button-download-letter-${letter.id}`}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </AdminTableCell>
                      </AdminTableRow>
                    ))}
                  </tbody>
                </AdminTable>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="diff-view" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<GitCompare className="h-5 w-5" />}>Compare Credit Reports</AdminCardTitle>
                <div className="flex items-center gap-4">
                  <Select value={compareReportId?.toString() || ''} onValueChange={(v) => setCompareReportId(v ? parseInt(v) : null)}>
                    <SelectTrigger className="w-[250px] bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                      <SelectValue placeholder="Select report to compare" />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                      {allClientReports.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.bureau} - {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Unknown date'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              {allClientReports.length === 0 ? (
                <AdminEmptyState
                  icon={<GitCompare className="h-8 w-8" />}
                  title="No Other Reports"
                  description="Upload another credit report for this client to compare changes over time."
                />
              ) : !compareReportId ? (
                <AdminEmptyState
                  icon={<GitCompare className="h-8 w-8" />}
                  title="Select a Report to Compare"
                  description="Choose an older report to see what has changed."
                />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] text-center">
                      <p className="text-[hsl(var(--admin-text-muted))] text-xs mb-1">Current Report</p>
                      <p className="text-2xl font-bold text-white">{report?.creditScore || '--'}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">{report?.createdAt ? new Date(report.createdAt).toLocaleDateString() : '--'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] text-center flex items-center justify-center">
                      {report?.creditScore && allClientReports.find(r => r.id === compareReportId)?.creditScore ? (
                        <div className="flex items-center gap-2">
                          {(report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) > 0 ? (
                            <ArrowUp className="h-6 w-6 text-green-400" />
                          ) : (report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) < 0 ? (
                            <ArrowDown className="h-6 w-6 text-red-400" />
                          ) : (
                            <Minus className="h-6 w-6 text-gray-400" />
                          )}
                          <span className={`text-2xl font-bold ${
                            (report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) > 0 ? 'text-green-400' :
                            (report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) < 0 ? 'text-red-400' : 'text-gray-400'
                          }`}>
                            {Math.abs(report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0))} pts
                          </span>
                        </div>
                      ) : (
                        <Minus className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] text-center">
                      <p className="text-[hsl(var(--admin-text-muted))] text-xs mb-1">Previous Report</p>
                      <p className="text-2xl font-bold text-white">{allClientReports.find(r => r.id === compareReportId)?.creditScore || '--'}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">{allClientReports.find(r => r.id === compareReportId)?.createdAt ? new Date(allClientReports.find(r => r.id === compareReportId)!.createdAt).toLocaleDateString() : '--'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-white">Account Changes</h4>
                    <AdminTable>
                      <AdminTableHeader>
                        <tr>
                          <AdminTableHead>Account</AdminTableHead>
                          <AdminTableHead>Current Balance</AdminTableHead>
                          <AdminTableHead>Previous Balance</AdminTableHead>
                          <AdminTableHead>Change</AdminTableHead>
                          <AdminTableHead>Status</AdminTableHead>
                        </tr>
                      </AdminTableHeader>
                      <tbody>
                        {accounts.map((account) => {
                          const prevAccount = compareAccounts.find(a => a.creditorName === account.creditorName);
                          const balanceChange = (account.balance || 0) - (prevAccount?.balance || 0);
                          return (
                            <AdminTableRow key={account.id}>
                              <AdminTableCell>
                                <span className="font-medium text-white">{account.creditorName}</span>
                              </AdminTableCell>
                              <AdminTableCell>
                                <span className="text-white">${(account.balance || 0).toLocaleString()}</span>
                              </AdminTableCell>
                              <AdminTableCell>
                                <span className="text-[hsl(var(--admin-text-muted))]">${(prevAccount?.balance || 0).toLocaleString()}</span>
                              </AdminTableCell>
                              <AdminTableCell>
                                {balanceChange !== 0 ? (
                                  <span className={`flex items-center gap-1 ${balanceChange < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {balanceChange < 0 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                                    ${Math.abs(balanceChange).toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">No change</span>
                                )}
                              </AdminTableCell>
                              <AdminTableCell>
                                {prevAccount ? (
                                  account.status !== prevAccount.status ? (
                                    <span className="flex items-center gap-2">
                                      <span className="text-[hsl(var(--admin-text-muted))]">{prevAccount.status}</span>
                                      <ArrowRight className="h-4 w-4 text-[hsl(var(--admin-accent))]" />
                                      <span className="text-white">{account.status}</span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">Unchanged</span>
                                  )
                                ) : (
                                  <AdminBadge variant="success">New</AdminBadge>
                                )}
                              </AdminTableCell>
                            </AdminTableRow>
                          );
                        })}
                      </tbody>
                    </AdminTable>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <h5 className="text-green-400 font-medium mb-2">Improvements</h5>
                      <ul className="text-sm text-[hsl(var(--admin-text-muted))] space-y-1">
                        {accounts.filter(a => {
                          const prev = compareAccounts.find(p => p.creditorName === a.creditorName);
                          return prev && (a.balance || 0) < (prev.balance || 0);
                        }).length > 0 ? (
                          accounts.filter(a => {
                            const prev = compareAccounts.find(p => p.creditorName === a.creditorName);
                            return prev && (a.balance || 0) < (prev.balance || 0);
                          }).map(a => <li key={a.id}>{a.creditorName} balance decreased</li>)
                        ) : (
                          <li>No balance improvements detected</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <h5 className="text-red-400 font-medium mb-2">Areas of Concern</h5>
                      <ul className="text-sm text-[hsl(var(--admin-text-muted))] space-y-1">
                        {accounts.filter(a => {
                          const prev = compareAccounts.find(p => p.creditorName === a.creditorName);
                          return prev && (a.balance || 0) > (prev.balance || 0);
                        }).length > 0 ? (
                          accounts.filter(a => {
                            const prev = compareAccounts.find(p => p.creditorName === a.creditorName);
                            return prev && (a.balance || 0) > (prev.balance || 0);
                          }).map(a => <li key={a.id}>{a.creditorName} balance increased</li>)
                        ) : (
                          <li>No balance increases detected</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<Calendar className="h-5 w-5" />}>Dispute Calendar</AdminCardTitle>
                <Button
                  onClick={() => setCreateEventOpen(true)}
                  className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                  data-testid="button-create-event"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Event
                </Button>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              {calendarLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                </div>
              ) : calendarEvents.length === 0 ? (
                <AdminEmptyState
                  icon={<Calendar className="h-8 w-8" />}
                  title="No Scheduled Events"
                  description="Create dispute calendar events to track sending dates and follow-ups."
                />
              ) : (
                <div className="space-y-4">
                  {calendarEvents.sort((a, b) => new Date(a.scheduledSendDate).getTime() - new Date(b.scheduledSendDate).getTime()).map((event) => {
                    const sendDate = new Date(event.scheduledSendDate);
                    const followUpDate = event.followUpDate ? new Date(event.followUpDate) : null;
                    const today = new Date();
                    const daysUntilSend = Math.ceil((sendDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysUntilSend < 0 && event.status === 'scheduled';
                    
                    return (
                      <div key={event.id} className={`p-4 rounded-lg border ${
                        isOverdue ? 'bg-red-500/10 border-red-500/30' : 
                        event.status === 'sent' ? 'bg-green-500/10 border-green-500/30' :
                        event.status === 'completed' ? 'bg-blue-500/10 border-blue-500/30' :
                        'bg-[hsl(var(--admin-bg))]/50 border-[hsl(var(--admin-border))]'
                      }`} data-testid={`calendar-event-${event.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isOverdue ? 'bg-red-500/20' : 
                              event.status === 'sent' ? 'bg-green-500/20' :
                              'bg-[hsl(var(--admin-accent))]/20'
                            }`}>
                              <CalendarDays className={`h-6 w-6 ${
                                isOverdue ? 'text-red-400' : 
                                event.status === 'sent' ? 'text-green-400' :
                                'text-[hsl(var(--admin-accent))]'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-white">Round {event.round}</span>
                                <AdminBadge variant={
                                  isOverdue ? 'danger' :
                                  event.status === 'sent' ? 'success' :
                                  event.status === 'completed' ? 'success' :
                                  event.status === 'follow-up' ? 'warning' :
                                  'default'
                                }>
                                  {isOverdue ? 'Overdue' : event.status}
                                </AdminBadge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-[hsl(var(--admin-text-muted))]">
                                <span>Send: {sendDate.toLocaleDateString()}</span>
                                {followUpDate && <span>Follow-up: {followUpDate.toLocaleDateString()}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.status === 'scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCalendarEventMutation.mutate({ id: event.id, status: 'sent' })}
                                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                data-testid={`button-mark-sent-${event.id}`}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Mark Sent
                              </Button>
                            )}
                            {event.status === 'sent' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCalendarEventMutation.mutate({ id: event.id, status: 'follow-up' })}
                                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                                data-testid={`button-follow-up-${event.id}`}
                              >
                                <Clock className="h-4 w-4 mr-1" />
                                Follow Up
                              </Button>
                            )}
                            {event.status === 'follow-up' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateCalendarEventMutation.mutate({ id: event.id, status: 'completed' })}
                                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                                data-testid={`button-complete-${event.id}`}
                              >
                                <CheckSquare className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        {daysUntilSend > 0 && event.status === 'scheduled' && (
                          <div className="mt-3 text-xs text-[hsl(var(--admin-text-muted))]">
                            {daysUntilSend} days until scheduled send date
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </AdminCardContent>
          </AdminCard>
        </TabsContent>
      </Tabs>

      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Schedule Dispute Event
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Dispute Round</Label>
              <Select value={newEventRound} onValueChange={(v: '1' | '2' | 'validation') => setNewEventRound(v)}>
                <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <SelectItem value="1">Round 1 - Initial</SelectItem>
                  <SelectItem value="2">Round 2 - Follow-up</SelectItem>
                  <SelectItem value="validation">Validation Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text-muted))]">Scheduled Send Date</Label>
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white"
                data-testid="input-event-date"
              />
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-300">
                Follow-up date will automatically be set to 45 days after the send date, and expected response by 30 days.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--admin-border))]">
              <Button
                variant="outline"
                onClick={() => setCreateEventOpen(false)}
                className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createCalendarEventMutation.mutate({ scheduledSendDate: newEventDate, round: newEventRound })}
                disabled={!newEventDate || createCalendarEventMutation.isPending}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                data-testid="button-save-event"
              >
                {createCalendarEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={generateLetterOpen} onOpenChange={setGenerateLetterOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Generate Dispute Letter
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))]">Letter Type</Label>
                <Select value={letterType} onValueChange={(v: any) => setLetterType(v)}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="round1">Round 1 - Initial Dispute</SelectItem>
                    <SelectItem value="round2">Round 2 - Follow-up</SelectItem>
                    <SelectItem value="validation">Debt Validation</SelectItem>
                    <SelectItem value="goodwill">Goodwill Letter</SelectItem>
                    <SelectItem value="inquiry">Inquiry Removal</SelectItem>
                    <SelectItem value="fraud">Fraud/Identity Theft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))]">Target Bureau</Label>
                <Select value={letterBureau} onValueChange={(v: any) => setLetterBureau(v)}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="EXPERIAN">Experian</SelectItem>
                    <SelectItem value="EQUIFAX">Equifax</SelectItem>
                    <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <Checkbox 
                id="fraud-disclosure" 
                checked={isFraudDispute || letterType === 'fraud'}
                onCheckedChange={(checked) => setIsFraudDispute(checked as boolean)}
                data-testid="checkbox-fraud-disclosure"
              />
              <div className="flex-1">
                <Label htmlFor="fraud-disclosure" className="text-red-400 font-medium cursor-pointer">
                  Fraud/Identity Theft Disclosure
                </Label>
                <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                  Check this if these accounts were opened fraudulently. The letter will include identity theft affidavit language.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
              <h4 className="font-medium text-white mb-2">Items to Dispute ({selectedItems.length})</h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-sm">
                    <span className="text-white">{item.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))] capitalize">{item.type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {generatedLetter && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">Generated Letter Preview</h4>
                  <AdminBadge variant="success">Generated</AdminBadge>
                </div>
                <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] max-h-[200px] overflow-y-auto">
                  <pre className="text-sm text-[hsl(var(--admin-text-muted))] whitespace-pre-wrap font-sans">{generatedLetter.content}</pre>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLetterAsPdf(generatedLetter)}
                    className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
                    data-testid="button-download-generated"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      updateLetterMutation.mutate({ id: generatedLetter.id, status: 'approved' });
                      setGeneratedLetter(null);
                      setGenerateLetterOpen(false);
                      setSelectedItems([]);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    data-testid="button-approve-letter"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Approve Letter
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--admin-border))]">
              <Button
                variant="outline"
                onClick={() => { setGenerateLetterOpen(false); setGeneratedLetter(null); }}
                className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
                data-testid="button-cancel-generate"
              >
                Cancel
              </Button>
              <Button
                onClick={() => generateLetterMutation.mutate({ items: selectedItems, letterType, bureau: letterBureau, isFraud: isFraudDispute || letterType === 'fraud' })}
                disabled={generateLetterMutation.isPending || selectedItems.length === 0}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                data-testid="button-generate"
              >
                {generateLetterMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewLetterOpen} onOpenChange={setViewLetterOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Dispute Letter
            </DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <span className="text-[hsl(var(--admin-text-muted))] text-xs">Type</span>
                  <p className="text-white font-medium capitalize">{selectedLetter.letterType}</p>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <span className="text-[hsl(var(--admin-text-muted))] text-xs">Bureau</span>
                  <p className="text-white font-medium">{selectedLetter.bureau}</p>
                </div>
                <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <span className="text-[hsl(var(--admin-text-muted))] text-xs">Status</span>
                  <AdminBadge variant={selectedLetter.status === 'approved' || selectedLetter.status === 'sent' ? 'success' : 'warning'}>
                    {selectedLetter.status}
                  </AdminBadge>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-white whitespace-pre-wrap font-sans leading-relaxed">{selectedLetter.content}</pre>
              </div>

              {/* Tracking Number Section */}
              <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[hsl(var(--admin-accent))]" />
                  <span className="text-white font-medium">USPS Tracking</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={trackingNumberInput || selectedLetter.trackingNumber || ''}
                    onChange={(e) => setTrackingNumberInput(e.target.value)}
                    placeholder="Enter USPS tracking number..."
                    className="flex-1 px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
                    data-testid="input-tracking-number"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      updateLetterMutation.mutate({ 
                        id: selectedLetter.id, 
                        trackingNumber: trackingNumberInput || selectedLetter.trackingNumber,
                        sentDate: new Date().toISOString().split('T')[0]
                      });
                      setTrackingNumberInput('');
                    }}
                    className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/80 text-white"
                    disabled={updateLetterMutation.isPending || (!trackingNumberInput && !selectedLetter.trackingNumber)}
                    data-testid="button-save-tracking"
                  >
                    Save Tracking
                  </Button>
                </div>
                {selectedLetter.trackingNumber && (
                  <div className="text-sm text-green-400 flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Current: {selectedLetter.trackingNumber}
                    {selectedLetter.sentDate && ` (Sent: ${new Date(selectedLetter.sentDate).toLocaleDateString()})`}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t border-[hsl(var(--admin-border))]">
                <div className="flex gap-2">
                  {selectedLetter.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => { updateLetterMutation.mutate({ id: selectedLetter.id, status: 'approved' }); setViewLetterOpen(false); }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={updateLetterMutation.isPending}
                      data-testid="button-approve-view"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {(selectedLetter.status === 'approved' || selectedLetter.status === 'draft') && !selectedLetter.lobId && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setLobAddress({
                          fromName: report?.clientName || '',
                          fromAddressLine1: report?.clientAddress?.line1 || '',
                          fromAddressLine2: report?.clientAddress?.line2 || '',
                          fromCity: report?.clientAddress?.city || '',
                          fromState: report?.clientAddress?.state || '',
                          fromZip: report?.clientAddress?.zip || '',
                        });
                        setLobSendOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      data-testid="button-send-lob"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send via Certified Mail
                    </Button>
                  )}
                  {selectedLetter.lobId && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1 px-2">
                      <CheckSquare className="h-3 w-3" />
                      Sent via Lob
                    </div>
                  )}
                  {selectedLetter.status === 'approved' && !selectedLetter.lobId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { updateLetterMutation.mutate({ id: selectedLetter.id, status: 'sent' }); setViewLetterOpen(false); }}
                      className="text-slate-400 hover:text-white text-xs"
                      disabled={updateLetterMutation.isPending}
                      data-testid="button-mark-sent"
                    >
                      Mark Sent Manually
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadLetterAsPdf(selectedLetter)}
                    className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
                    data-testid="button-download-view"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setViewLetterOpen(false)}
                    className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]"
                    data-testid="button-close-view"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lob Certified Mail Send Dialog */}
      <Dialog open={lobSendOpen} onOpenChange={setLobSendOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-400" />
              Send via Certified Mail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-emerald-950/40 border border-emerald-800 p-3 text-xs text-emerald-300 space-y-1">
              <p className="font-medium">Lob will print and mail this letter automatically.</p>
              <p className="text-emerald-400/80">
                Addressed to: <strong>{selectedLetter?.bureau === 'EXPERIAN' ? 'Experian, P.O. Box 4500, Allen TX 75013' : selectedLetter?.bureau === 'EQUIFAX' ? 'Equifax, P.O. Box 740256, Atlanta GA 30374' : 'TransUnion, P.O. Box 2000, Chester PA 19016'}</strong>
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-[hsl(var(--admin-text-muted))]">Client mailing address (return address on letter):</p>
              <div className="space-y-2">
                <input
                  placeholder="Full name"
                  value={lobAddress.fromName}
                  onChange={e => setLobAddress(a => ({ ...a, fromName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  placeholder="Address line 1"
                  value={lobAddress.fromAddressLine1}
                  onChange={e => setLobAddress(a => ({ ...a, fromAddressLine1: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={lobAddress.fromAddressLine2}
                  onChange={e => setLobAddress(a => ({ ...a, fromAddressLine2: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="City"
                    value={lobAddress.fromCity}
                    onChange={e => setLobAddress(a => ({ ...a, fromCity: e.target.value }))}
                    className="col-span-1 px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <input
                    placeholder="State"
                    maxLength={2}
                    value={lobAddress.fromState}
                    onChange={e => setLobAddress(a => ({ ...a, fromState: e.target.value.toUpperCase() }))}
                    className="px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <input
                    placeholder="ZIP"
                    maxLength={10}
                    value={lobAddress.fromZip}
                    onChange={e => setLobAddress(a => ({ ...a, fromZip: e.target.value }))}
                    className="px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => sendLobMutation.mutate(lobAddress)}
                disabled={sendLobMutation.isPending || !lobAddress.fromName || !lobAddress.fromAddressLine1 || !lobAddress.fromCity || !lobAddress.fromState || !lobAddress.fromZip}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="button-confirm-send-lob"
              >
                {sendLobMutation.isPending ? 'Sending...' : 'Send Letter ($)'}
              </Button>
              <Button variant="outline" onClick={() => setLobSendOpen(false)} className="border-[hsl(var(--admin-border))] text-white">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
