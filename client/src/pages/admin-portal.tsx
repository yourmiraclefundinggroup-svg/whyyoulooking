import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { User, CreditReport, CreditIssue, Dispute, CreditReportUpload, CreditReportAccount, CreditReportInquiry, CreditReportCollection, CreditReportPublicRecord, DisputeLetterNew, DisputeCalendarEvent, Lead, Affiliate, AffiliateSignup, DeletionEvent } from "@shared/schema";
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
  Sun,
  Moon,
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
  Share2,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  RefreshCw,
  Printer,
  FileUp,
  Save,
  IdCard,
  Edit3,
  X,
  Download,
} from "lucide-react";

export default function AdminPortal() {
  const { isAdmin } = useUserContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CreditIssue | undefined>();
  const { theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const setIsDarkMode = (dark: boolean) => setTheme(dark ? 'dark' : 'light');

  // All hooks must be declared before any early returns (React Rules of Hooks)
  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: !!isAdmin,
  });

  const { data: clientCreditReport } = useQuery<CreditReport>({
    queryKey: ['/api/credit-reports', selectedClientId],
    enabled: !!isAdmin && !!selectedClientId,
  });

  const { data: clientIssues = [] } = useQuery<CreditIssue[]>({
    queryKey: ['/api/credit-issues', selectedClientId],
    enabled: !!isAdmin && !!selectedClientId,
  });

  const { data: clientDisputes = [] } = useQuery<Dispute[]>({
    queryKey: ['/api/disputes', selectedClientId],
    enabled: !!isAdmin && !!selectedClientId,
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

  const clientUsers = allUsers.filter(u => u.accessLevel !== "ADMIN");
  const selectedClient = selectedClientId ? allUsers.find(u => u.id === selectedClientId) : null;

  // Guard rendered after all hooks (React Rules of Hooks compliance)
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
        onRefetchUsers={() => queryClient.invalidateQueries({ queryKey: ['/api/users'] })}
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
    } else if (location === "/admin-portal/mail") {
      return <MailQueuePage clientUsers={clientUsers} />;
    } else if (location === "/admin-portal/leads") {
      return <LeadsCRMPage />;
    } else if (location === "/admin-portal/affiliates") {
      return <AffiliatesPage />;
    } else if (location === "/admin-portal/analytics") {
      return <AnalyticsPage clientUsers={clientUsers} />;
    } else if (location === "/admin-portal/white-label") {
      return <WhiteLabelPage />;
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
    <div className={isDarkMode ? 'dark' : 'light'}>
      <AdminShell>
        <div className="flex items-center justify-end mb-6 pb-4 border-b border-[hsl(var(--admin-border))]">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent))]/50 hover:bg-[hsl(var(--admin-accent))]/8 transition-all text-sm font-medium"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode
              ? <><Sun className="h-4 w-4 text-[hsl(var(--admin-warning))]" /><span>Light mode</span></>
              : <><Moon className="h-4 w-4 text-[hsl(var(--admin-info))]" /><span>Dark mode</span></>
            }
          </button>
        </div>
        {renderPageContent()}
        <DisputeLetterModal
          open={disputeModalOpen}
          onOpenChange={setDisputeModalOpen}
          issue={selectedIssue}
        />
      </AdminShell>
    </div>
  );
}

function DashboardPage({ clientUsers }: { clientUsers: User[] }) {
  const { data: stats } = useQuery<{ totalClients: number; totalLetters: number; lettersSentThisMonth: number; activeDisputes: number }>({
    queryKey: ['/api/admin/stats'],
  });

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
          value={stats?.totalClients ?? clientUsers.length}
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 12, positive: true }}
          color="blue"
        />
        <AdminStatCard
          label="Active Disputes"
          value={stats?.activeDisputes ?? 0}
          icon={<FileText className="h-6 w-6" />}
          trend={{ value: 8, positive: true }}
          color="orange"
        />
        <AdminStatCard
          label="Letters Generated"
          value={stats?.totalLetters ?? 0}
          icon={<Mail className="h-6 w-6" />}
          trend={{ value: 5, positive: true }}
          color="green"
        />
        <AdminStatCard
          label="Mailed This Month"
          value={stats?.lettersSentThisMonth ?? 0}
          icon={<Send className="h-6 w-6" />}
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
                    {item.type === "mail" && <Package className="h-5 w-5 text-[hsl(var(--admin-info))]" />}
                    {item.type === "client" && <Users className="h-5 w-5 text-green-400" />}
                    {item.type === "response" && <MessageCircle className="h-5 w-5 text-[hsl(var(--admin-text-muted))]" />}
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

// ─── Client Intake Card ──────────────────────────────────────────────────────
function ClientIntakeCard({ client, onUpdated }: { client: User; onUpdated: () => void }) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: client.firstName || "",
    lastName: client.lastName || "",
    phone: client.phone || "",
    addressLine1: client.addressLine1 || "",
    addressLine2: client.addressLine2 || "",
    city: client.city || "",
    state: client.state || "",
    zipCode: client.zipCode || "",
    dateOfBirth: client.dateOfBirth || "",
    ssnLast4: client.ssnLast4 || "",
    caseType: client.caseType || "STANDARD",
    policeReportNumber: client.policeReportNumber || "",
    ftcReportNumber: client.ftcReportNumber || "",
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`/api/admin/users/${client.id}/intake`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error((await resp.json()).error || "Save failed");
      return resp.json();
    },
    onSuccess: () => {
      toast({ title: "Client profile saved" });
      setEditing(false);
      onUpdated();
    },
    onError: (e: Error) => toast({ title: "Save failed", description: e.message, variant: "destructive" }),
  });

  const uploadDoc = async (docType: "id_photo" | "police_report" | "ftc_report", file: File) => {
    setUploadingDoc(docType);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", docType);
      const resp = await fetch(`/api/admin/users/${client.id}/intake-doc`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: fd,
      });
      if (!resp.ok) throw new Error((await resp.json()).error || "Upload failed");
      toast({ title: "Document uploaded" });
      onUpdated();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingDoc(null);
    }
  };

  const DocUploadBtn = ({ docType, label, existing }: { docType: "id_photo" | "police_report" | "ftc_report"; label: string; existing?: string }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" className="hidden" accept="image/*,application/pdf"
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(docType, f); }} />
        <Button size="sm" variant="outline"
          className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] gap-1.5"
          disabled={uploadingDoc === docType}
          onClick={() => inputRef.current?.click()}>
          <FileUp className="h-3.5 w-3.5" />
          {uploadingDoc === docType ? "Uploading..." : label}
        </Button>
        {existing && <span className="text-xs text-green-500">✓ On file</span>}
      </div>
    );
  };

  const isIdentityTheft = form.caseType === "IDENTITY_THEFT";

  const fieldClass = "bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))] h-8 text-sm";
  const labelClass = "text-xs text-[hsl(var(--admin-text-muted))]";

  return (
    <AdminCard>
      <AdminCardHeader>
        <div className="flex items-center justify-between w-full">
          <AdminCardTitle icon={<IdCard className="h-5 w-5" />}>Client Intake Profile</AdminCardTitle>
          {!editing ? (
            <Button size="sm" variant="outline"
              className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] gap-1.5"
              onClick={() => setEditing(true)}>
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline"
                className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] gap-1"
                onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm"
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white gap-1.5"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}>
                <Save className="h-3.5 w-3.5" />
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </AdminCardHeader>
      <AdminCardContent>
        <div className="space-y-4">
          {/* Case Type */}
          <div>
            <Label className={labelClass}>Case Type</Label>
            {editing ? (
              <Select value={form.caseType} onValueChange={v => setForm(p => ({ ...p, caseType: v }))}>
                <SelectTrigger className={`${fieldClass} mt-1`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard Credit Repair</SelectItem>
                  <SelectItem value="IDENTITY_THEFT">Identity Theft Recovery</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  isIdentityTheft ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-green-500/15 text-green-400 border border-green-500/30"
                }`}>
                  {isIdentityTheft ? "⚠ Identity Theft Recovery" : "✓ Standard Credit Repair"}
                </span>
              </div>
            )}
          </div>

          {/* Name & Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>First Name</Label>
              {editing ? <Input className={`${fieldClass} mt-1`} value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} />
                : <p className="text-sm text-[hsl(var(--admin-text))] mt-1">{client.firstName}</p>}
            </div>
            <div>
              <Label className={labelClass}>Last Name</Label>
              {editing ? <Input className={`${fieldClass} mt-1`} value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} />
                : <p className="text-sm text-[hsl(var(--admin-text))] mt-1">{client.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Phone</Label>
              {editing ? <Input className={`${fieldClass} mt-1`} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" />
                : <p className="text-sm text-[hsl(var(--admin-text))] mt-1">{client.phone || <span className="text-[hsl(var(--admin-text-subtle))] italic">Not set</span>}</p>}
            </div>
            <div>
              <Label className={labelClass}>Date of Birth</Label>
              {editing ? <Input type="date" className={`${fieldClass} mt-1`} value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))} />
                : <p className="text-sm text-[hsl(var(--admin-text))] mt-1">{client.dateOfBirth || <span className="text-[hsl(var(--admin-text-subtle))] italic">Not set</span>}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>SSN Last 4</Label>
              {editing ? <Input className={`${fieldClass} mt-1`} value={form.ssnLast4} onChange={e => setForm(p => ({ ...p, ssnLast4: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="####" maxLength={4} />
                : <p className="text-sm text-[hsl(var(--admin-text))] mt-1 font-mono">{client.ssnLast4 ? `***-**-${client.ssnLast4}` : <span className="text-[hsl(var(--admin-text-subtle))] italic">Not set</span>}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="pt-2 border-t border-[hsl(var(--admin-border))]">
            <Label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] mb-2 block">Mailing Address</Label>
            {editing ? (
              <div className="space-y-2">
                <Input className={fieldClass} value={form.addressLine1} onChange={e => setForm(p => ({ ...p, addressLine1: e.target.value }))} placeholder="Street Address" />
                <Input className={fieldClass} value={form.addressLine2} onChange={e => setForm(p => ({ ...p, addressLine2: e.target.value }))} placeholder="Apt / Suite (optional)" />
                <div className="grid grid-cols-3 gap-2">
                  <Input className={fieldClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="City" />
                  <Input className={fieldClass} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value.toUpperCase().slice(0, 2) }))} placeholder="ST" maxLength={2} />
                  <Input className={fieldClass} value={form.zipCode} onChange={e => setForm(p => ({ ...p, zipCode: e.target.value.replace(/\D/g, "").slice(0, 5) }))} placeholder="ZIP" maxLength={5} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--admin-text))]">
                {client.addressLine1 ? (
                  <>
                    {client.addressLine1}{client.addressLine2 ? `, ${client.addressLine2}` : ""}<br />
                    {[client.city, client.state, client.zipCode].filter(Boolean).join(", ")}
                  </>
                ) : <span className="text-[hsl(var(--admin-text-subtle))] italic">No address on file</span>}
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="pt-2 border-t border-[hsl(var(--admin-border))]">
            <Label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] mb-2 block">Identity Documents</Label>
            <div className="space-y-2">
              <DocUploadBtn docType="id_photo" label="Upload ID Photo" existing={client.idPhotoPath ?? undefined} />
            </div>
          </div>

          {/* Identity Theft Fields */}
          {isIdentityTheft && (
            <div className="pt-2 border-t border-red-500/30">
              <Label className="text-xs font-medium text-red-400 mb-3 block flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Identity Theft Documentation
              </Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={labelClass}>Police Report #</Label>
                    {editing
                      ? <Input className={`${fieldClass} mt-1`} value={form.policeReportNumber} onChange={e => setForm(p => ({ ...p, policeReportNumber: e.target.value }))} placeholder="Case number" />
                      : <p className="text-sm text-[hsl(var(--admin-text))] mt-1 font-mono">{client.policeReportNumber || <span className="text-[hsl(var(--admin-text-subtle))] italic">Not set</span>}</p>}
                  </div>
                  <div>
                    <Label className={labelClass}>FTC Report #</Label>
                    {editing
                      ? <Input className={`${fieldClass} mt-1`} value={form.ftcReportNumber} onChange={e => setForm(p => ({ ...p, ftcReportNumber: e.target.value }))} placeholder="Confirmation #" />
                      : <p className="text-sm text-[hsl(var(--admin-text))] mt-1 font-mono">{client.ftcReportNumber || <span className="text-[hsl(var(--admin-text-subtle))] italic">Not set</span>}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <DocUploadBtn docType="police_report" label="Upload Police Report" existing={client.policeReportPath ?? undefined} />
                  <DocUploadBtn docType="ftc_report" label="Upload FTC Report" existing={client.ftcReportPath ?? undefined} />
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminCardContent>
    </AdminCard>
  );
}

function ClientManagementPage({ 
  clientUsers, selectedClientId, setSelectedClientId, selectedClient, 
  clientCreditReport, clientIssues, clientDisputes, newClient, setNewClient, 
  handleCreateClient, createClientMutation,
  onRefetchUsers,
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
                  onChange={(e) => setNewClient((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-first-name"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-[hsl(var(--admin-text-muted))]">Last Name</Label>
                <Input
                  id="lastName"
                  value={newClient.lastName}
                  onChange={(e) => setNewClient((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
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
                  onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@example.com"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
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
                  onChange={(e) => setNewClient((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Set a secure password"
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] placeholder:text-[hsl(var(--admin-text-subtle))]"
                  required
                  data-testid="input-password"
                />
              </div>
              <div className="bg-[hsl(var(--admin-info))]/10 p-3 rounded-lg border border-[hsl(var(--admin-info))]/30">
                <div className="flex items-center gap-2 text-[hsl(var(--admin-info))]">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Setup</span>
                </div>
                <p className="text-xs text-[hsl(var(--admin-info))]/70 mt-1">
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
                          <div className="font-medium text-[hsl(var(--admin-text))]">{client.firstName} {client.lastName}</div>
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
        <>
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
                      This client has no credit data yet. Upload their credit report file so the AI can parse it and populate their dashboard.
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
                  <div className="text-3xl font-bold text-[hsl(var(--admin-accent))]">
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
                  <div className="text-3xl font-bold text-[hsl(var(--admin-accent))]">
                    {clientDisputes.filter((d: Dispute) => d.status === 'PENDING').length}
                  </div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Pending Disputes</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <div className="text-3xl font-bold text-[hsl(var(--admin-accent))]">
                    {clientDisputes.length}
                  </div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total Disputes</p>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>

          {/* Client Intake Card */}
          <ClientIntakeCard
            client={selectedClient}
            onUpdated={onRefetchUsers}
          />
        </>
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
          <AdminCard className="border-[hsl(var(--admin-accent))]/30 bg-[hsl(var(--admin-accent))]/5">
            <AdminCardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-deep))] flex items-center justify-center text-white font-semibold">
                    {selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">{selectedClient.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[hsl(var(--admin-accent))]">
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

          {/* ── Dispute IQ™ Letter Generator ── */}
          <AdminCard className="border-[hsl(var(--admin-accent))]/40">
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<Sparkles className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}>
                  Dispute IQ™ Letter Generator
                </AdminCardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))] border border-[hsl(var(--admin-accent))]/30 font-semibold">
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
                  className="w-full rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))] text-white text-sm px-3 py-2 placeholder:text-[hsl(var(--admin-text-muted))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--admin-accent))] resize-none"
                />
              </div>

              <Button
                onClick={() => disputeIQMutation.mutate()}
                disabled={disputeIQMutation.isPending || !disputeIQSelectedIssue}
                className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white font-semibold"
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
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))] border border-[hsl(var(--admin-accent))]/30 font-semibold">
                      Dispute IQ™ — Unique Letter
                    </span>
                    <span className="text-xs text-[hsl(var(--admin-text-muted))]">
                      Generated exclusively for {generatedLetterMeta.clientName} — Round {generatedLetterMeta.round} — {generatedLetterMeta.bureau}
                    </span>
                  </div>
                  <div className="relative">
                    <pre className="text-xs text-[hsl(var(--admin-text-muted))] bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] rounded-lg p-4 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono leading-relaxed">
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
                        className="w-full bg-[hsl(var(--admin-accent))]/15 text-[hsl(var(--admin-accent))] border border-[hsl(var(--admin-accent))]/30 hover:bg-[hsl(var(--admin-accent))]/25"
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
                  <span className="font-bold text-[hsl(var(--admin-success))]">{item.improvement}</span>
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

function WhiteLabelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--admin-text))]">White Label Configuration</h2>
        <p className="text-[hsl(var(--admin-text-muted))] mt-1">Customize your branded portal settings, domain, and API access.</p>
      </div>
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<Package className="h-5 w-5" />}>White Label Configuration</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[hsl(var(--admin-text))] mb-2 block">Brand Name</Label>
                <Input defaultValue="ScoreShift" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text))] mb-2 block">Custom Domain</Label>
                <Input defaultValue="app.scoreshift.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text))] mb-2 block">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" defaultValue="#3B82F6" className="h-10 rounded-lg cursor-pointer" />
                  <Input defaultValue="#3B82F6" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] font-mono text-sm flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text))] mb-2 block">Support Email</Label>
                <Input defaultValue="support@scoreshift.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" />
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[hsl(var(--admin-text))] font-medium">Client Capacity</h4>
                <span className="text-[hsl(var(--admin-text-muted))] text-sm">847 / 1,000</span>
              </div>
              <div className="w-full bg-[hsl(var(--admin-bg))] h-2 rounded-full overflow-hidden">
                <div className="bg-[hsl(var(--admin-accent))] h-full" style={{ width: '84.7%' }}></div>
              </div>
              <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-2">84.7% capacity used</p>
            </div>
            <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
              <h4 className="text-[hsl(var(--admin-text))] font-medium mb-3">API Key</h4>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                <input type="password" defaultValue="sk_live_..." className="flex-1 bg-transparent text-[hsl(var(--admin-text))] outline-none font-mono text-sm" readOnly />
                <Button size="sm" variant="outline" className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]">Copy</Button>
              </div>
            </div>
            <Button className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white">Save Configuration</Button>
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
                  <div className={`w-3 h-3 rounded-full ${item.color === 'green' ? 'bg-[hsl(var(--admin-success))]' : 'bg-[hsl(var(--admin-danger))]'}`} />
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

function MailQueuePage({ clientUsers }: { clientUsers: User[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewLetterOpen, setViewLetterOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<DisputeLetterNew | null>(null);
  const [lobSendOpen, setLobSendOpen] = useState(false);
  const [lobAddress, setLobAddress] = useState({ fromName: '', fromAddressLine1: '', fromAddressLine2: '', fromCity: '', fromState: '', fromZip: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkSelected, setBulkSelected] = useState<number[]>([]);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Sync Lob delivery status mutation
  const syncLobStatusMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/sync-lob-status', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: `Status synced`, description: `Updated ${data.synced} letter${data.synced !== 1 ? 's' : ''} from Lob.` });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new/all'] });
    },
    onError: () => toast({ title: 'Sync failed', description: 'Could not reach Lob API.', variant: 'destructive' }),
  });

  // Upload & Send state
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadClientId, setUploadClientId] = useState('');
  const [uploadBureau, setUploadBureau] = useState('');
  const [uploadLetterType, setUploadLetterType] = useState('round1');
  const [uploadAddress, setUploadAddress] = useState({ fromName: '', fromAddressLine1: '', fromAddressLine2: '', fromCity: '', fromState: '', fromZip: '' });
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadAndSendMutation = useMutation({
    mutationFn: async () => {
      if (!uploadFile) throw new Error('No file selected');
      if (uploadFile.type !== 'application/pdf') throw new Error('Only PDF files are accepted. Please convert your document to PDF first.');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('clientId', uploadClientId);
      formData.append('bureau', uploadBureau);
      formData.append('letterType', uploadLetterType);
      Object.entries(uploadAddress).forEach(([k, v]) => { if (v) formData.append(k, v); });
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/upload-and-send-letter', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send letter');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Letter sent via certified mail!', description: `Tracking: ${data.trackingNumber || data.lobId}` });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new/all'] });
      setUploadPanelOpen(false);
      setUploadFile(null);
      setUploadClientId('');
      setUploadBureau('');
      setUploadAddress({ fromName: '', fromAddressLine1: '', fromAddressLine2: '', fromCity: '', fromState: '', fromZip: '' });
    },
    onError: (error: any) => {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleClientSelect = (clientId: string) => {
    setUploadClientId(clientId);
    const client = clientUsers.find(u => String(u.id) === clientId);
    if (client) {
      setUploadAddress({
        fromName: `${client.firstName} ${client.lastName}`,
        fromAddressLine1: client.addressLine1 || '',
        fromAddressLine2: client.addressLine2 || '',
        fromCity: client.city || '',
        fromState: client.state || '',
        fromZip: client.zipCode || '',
      });
    }
  };

  const { data: allLetters = [], isLoading: lettersLoading } = useQuery<DisputeLetterNew[]>({
    queryKey: ['/api/admin/dispute-letters-new/all'],
  });

  const sendLobMutation = useMutation({
    mutationFn: async ({ letterId, address }: { letterId: number; address: typeof lobAddress }) => {
      const response = await apiRequest('POST', `/api/admin/dispute-letters-new/${letterId}/send-lob`, address);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Letter sent!', description: 'Letter has been queued for certified mail delivery.' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setLobSendOpen(false);
      setSelectedLetter(null);
    },
    onError: (error: any) => {
      toast({ title: 'Send failed', description: error.message || 'Failed to send letter via Lob.', variant: 'destructive' });
    },
  });

  const openLobSend = (letter: DisputeLetterNew) => {
    setSelectedLetter(letter);
    const client = clientUsers.find(u => u.id === letter.clientId);
    if (client) {
      setLobAddress({
        fromName: `${client.firstName} ${client.lastName}`,
        fromAddressLine1: client.addressLine1 || '',
        fromAddressLine2: client.addressLine2 || '',
        fromCity: client.city || '',
        fromState: client.state || '',
        fromZip: client.zipCode || '',
      });
    }
    setLobSendOpen(true);
  };

  const handleBulkSend = async () => {
    const readyLetters = filteredLetters.filter(l => bulkSelected.includes(l.id));
    if (readyLetters.length === 0) return;
    setIsBulkSending(true);
    setBulkProgress(0);
    let sent = 0;
    for (const letter of readyLetters) {
      try {
        const client = clientUsers.find(u => u.id === letter.clientId);
        const address = {
          fromName: client ? `${client.firstName} ${client.lastName}` : 'Client',
          fromAddressLine1: client?.addressLine1 || '',
          fromAddressLine2: client?.addressLine2 || '',
          fromCity: client?.city || '',
          fromState: client?.state || '',
          fromZip: client?.zipCode || '',
        };
        if (!address.fromAddressLine1 || !address.fromCity || !address.fromState || !address.fromZip) {
          toast({ title: `Skipped: ${letter.bureau}`, description: 'Client address not on file.', variant: 'destructive' });
        } else {
          await apiRequest('POST', `/api/admin/dispute-letters-new/${letter.id}/send-lob`, address);
          sent++;
        }
      } catch {
        toast({ title: 'Error', description: `Failed to send letter ID ${letter.id}`, variant: 'destructive' });
      }
      setBulkProgress(Math.round(((sent + 1) / readyLetters.length) * 100));
    }
    setIsBulkSending(false);
    setBulkSelected([]);
    queryClient.invalidateQueries({ queryKey: ['/api/admin/dispute-letters-new/all'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    toast({ title: `Bulk send complete`, description: `${sent} of ${readyLetters.length} letters sent successfully.` });
  };

  const getLobStatusInfo = (letter: any) => {
    const lob = (letter.lobStatus || '').toLowerCase();
    const appStatus = letter.status || '';
    if (lob === 'delivered') return { label: 'Delivered ✓', variant: 'success' as const, color: 'text-green-400' };
    if (lob === 'processed_for_delivery') return { label: 'Out for Delivery', variant: 'success' as const, color: 'text-green-400' };
    if (lob === 'in_local_area') return { label: 'In Local Area', variant: 'info' as const, color: 'text-blue-400' };
    if (lob === 'in_transit') return { label: 'In Transit', variant: 'info' as const, color: 'text-blue-400' };
    if (lob === 're-routed') return { label: 'Re-routed', variant: 'warning' as const, color: 'text-yellow-400' };
    if (lob === 'returned_to_sender') return { label: 'Returned to Sender', variant: 'default' as const, color: 'text-red-400' };
    if (lob === 'processed' || appStatus === 'sent') return { label: 'Mailed — Pending USPS Scan', variant: 'info' as const, color: 'text-amber-400' };
    if (appStatus === 'approved') return { label: 'Ready to Send', variant: 'warning' as const, color: 'text-yellow-400' };
    if (appStatus === 'draft') return { label: 'Draft', variant: 'default' as const, color: 'text-[hsl(var(--admin-text-muted))]' };
    return { label: appStatus || 'Unknown', variant: 'default' as const, color: 'text-[hsl(var(--admin-text-muted))]' };
  };

  const getBureauBadge = (bureau: string) => {
    const colors: Record<string, string> = {
      EXPERIAN: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      EQUIFAX: 'bg-red-500/20 text-red-400 border-red-500/30',
      TRANSUNION: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[bureau] || 'bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]'}`}>
        {bureau}
      </span>
    );
  };

  const filteredLetters = statusFilter === 'all'
    ? allLetters
    : statusFilter === 'delivered'
      ? allLetters.filter(l => l.lobStatus === 'delivered')
      : statusFilter === 'ready'
        ? allLetters.filter(l => l.status === 'approved')
        : allLetters.filter(l => l.status === statusFilter);

  const statusCounts = {
    all: allLetters.length,
    draft: allLetters.filter(l => l.status === 'draft').length,
    ready: allLetters.filter(l => l.status === 'approved').length,
    sent: allLetters.filter(l => l.status === 'sent').length,
    delivered: allLetters.filter(l => l.lobStatus === 'delivered').length,
  };

  const toggleBulkSelect = (id: number) => {
    setBulkSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    const readyToSend = filteredLetters.filter(l => l.status === 'approved').map(l => l.id);
    setBulkSelected(readyToSend.length === bulkSelected.length ? [] : readyToSend);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mail className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Mail Queue
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Send dispute letters via certified mail to credit bureaus.</p>
        </div>
        {bulkSelected.length > 0 && (
          <Button
            className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
            onClick={handleBulkSend}
            disabled={isBulkSending}
          >
            {isBulkSending ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sending {bulkProgress}%...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Send {bulkSelected.length} Selected via Certified Mail</>
            )}
          </Button>
        )}
      </div>

      {/* Upload & Send Panel */}
      <AdminCard>
        <AdminCardHeader>
          <div className="flex items-center justify-between w-full">
            <AdminCardTitle icon={<Upload className="h-5 w-5" />}>Upload & Send Letter</AdminCardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadPanelOpen(!uploadPanelOpen)}
              className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))] hover:border-[hsl(var(--admin-accent))]/50"
            >
              {uploadPanelOpen ? 'Collapse' : 'Send an Existing Letter'}
            </Button>
          </div>
        </AdminCardHeader>
        {uploadPanelOpen && (
          <AdminCardContent>
            <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-5">
              Upload a dispute letter you already wrote and send it via Lob certified mail directly to the bureau.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: File drop zone + bureau/client */}
              <div className="space-y-4">
                {/* File drop zone */}
                <div
                  className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    isDraggingOver
                      ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10'
                      : uploadFile
                      ? 'border-green-500/50 bg-green-500/5'
                      : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50 hover:border-[hsl(var(--admin-accent))]/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) {
                      if (f.type !== 'application/pdf') {
                        toast({ title: 'PDF required', description: 'Lob only accepts PDF files. Please convert your document to PDF first.', variant: 'destructive' });
                        return;
                      }
                      setUploadFile(f);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.type !== 'application/pdf') {
                          toast({ title: 'PDF required', description: 'Lob only accepts PDF files. Please convert your document to PDF first.', variant: 'destructive' });
                          e.target.value = '';
                          return;
                        }
                        setUploadFile(f);
                      }
                    }}
                  />
                  {uploadFile ? (
                    <>
                      <FileText className="h-8 w-8 text-green-400 mb-2" />
                      <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{uploadFile.name}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[hsl(var(--admin-text-muted))] mb-2" />
                      <p className="text-sm font-medium text-[hsl(var(--admin-text))]">Drop PDF here or click to browse</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">PDF only — up to 20 MB (Lob requirement)</p>
                    </>
                  )}
                </div>

                {/* Client selector */}
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Client</Label>
                  <Select value={uploadClientId} onValueChange={handleClientSelect}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                      <SelectValue placeholder="Select a client…" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientUsers.map(u => (
                        <SelectItem key={u.id} value={String(u.id)}>{u.firstName} {u.lastName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bureau selector */}
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Bureau</Label>
                  <Select value={uploadBureau} onValueChange={setUploadBureau}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                      <SelectValue placeholder="Select bureau…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPERIAN">Experian</SelectItem>
                      <SelectItem value="EQUIFAX">Equifax</SelectItem>
                      <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Letter type */}
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Letter Type</Label>
                  <Select value={uploadLetterType} onValueChange={setUploadLetterType}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round1">Round 1</SelectItem>
                      <SelectItem value="round2">Round 2</SelectItem>
                      <SelectItem value="validation">Debt Validation</SelectItem>
                      <SelectItem value="goodwill">Goodwill</SelectItem>
                      <SelectItem value="inquiry">Inquiry Removal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right: From address */}
              <div className="space-y-4">
                <p className="text-sm font-medium text-[hsl(var(--admin-text))]">From Address <span className="text-[hsl(var(--admin-text-muted))] font-normal">(client's mailing address)</span></p>
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Full Name</Label>
                  <Input
                    value={uploadAddress.fromName}
                    onChange={(e) => setUploadAddress(a => ({ ...a, fromName: e.target.value }))}
                    placeholder="Jane Smith"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                  />
                </div>
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Street Address</Label>
                  <Input
                    value={uploadAddress.fromAddressLine1}
                    onChange={(e) => setUploadAddress(a => ({ ...a, fromAddressLine1: e.target.value }))}
                    placeholder="123 Main St"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                  />
                </div>
                <div>
                  <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">Apt / Unit <span className="text-[hsl(var(--admin-text-muted))]">(optional)</span></Label>
                  <Input
                    value={uploadAddress.fromAddressLine2}
                    onChange={(e) => setUploadAddress(a => ({ ...a, fromAddressLine2: e.target.value }))}
                    placeholder="Apt 4B"
                    className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">City</Label>
                    <Input
                      value={uploadAddress.fromCity}
                      onChange={(e) => setUploadAddress(a => ({ ...a, fromCity: e.target.value }))}
                      placeholder="Dallas"
                      className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                    />
                  </div>
                  <div>
                    <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">State</Label>
                    <Input
                      value={uploadAddress.fromState}
                      onChange={(e) => setUploadAddress(a => ({ ...a, fromState: e.target.value }))}
                      placeholder="TX"
                      maxLength={2}
                      className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] uppercase"
                    />
                  </div>
                  <div>
                    <Label className="text-[hsl(var(--admin-text))] mb-1.5 block text-sm">ZIP</Label>
                    <Input
                      value={uploadAddress.fromZip}
                      onChange={(e) => setUploadAddress(a => ({ ...a, fromZip: e.target.value }))}
                      placeholder="75001"
                      className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white mt-2"
                  disabled={
                    !uploadFile || !uploadClientId || !uploadBureau ||
                    !uploadAddress.fromName || !uploadAddress.fromAddressLine1 ||
                    !uploadAddress.fromCity || !uploadAddress.fromState || !uploadAddress.fromZip ||
                    uploadAndSendMutation.isPending
                  }
                  onClick={() => uploadAndSendMutation.mutate()}
                >
                  {uploadAndSendMutation.isPending ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sending via Lob…</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" />Send via Certified Mail</>
                  )}
                </Button>
              </div>
            </div>
          </AdminCardContent>
        )}
      </AdminCard>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.entries(statusCounts) as [string, number][]).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === status
                ? 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10'
                : 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/50 hover:border-[hsl(var(--admin-accent))]/50'
            }`}
          >
            <div className="text-2xl font-bold text-white">{count}</div>
            <div className="text-xs text-[hsl(var(--admin-text-muted))] capitalize mt-0.5">{status === 'all' ? 'Total' : status}</div>
          </button>
        ))}
      </div>

      <AdminCard>
        <AdminCardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <AdminCardTitle icon={<Mail className="h-5 w-5" />}>
              {statusFilter === 'all' ? 'All Letters' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Letters`}
            </AdminCardTitle>
            <div className="flex items-center gap-2">
              {filteredLetters.some(l => l.status === 'approved') && (
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-[hsl(var(--admin-text-muted))] hover:text-white">
                  {bulkSelected.length > 0 ? 'Deselect All' : 'Select All Ready'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => syncLobStatusMutation.mutate()}
                disabled={syncLobStatusMutation.isPending}
                className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-white hover:border-[hsl(var(--admin-accent))]/50 gap-1.5"
              >
                {syncLobStatusMutation.isPending ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Sync Delivery Status
              </Button>
            </div>
          </div>
        </AdminCardHeader>
        <AdminCardContent>
          {lettersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
            </div>
          ) : filteredLetters.length === 0 ? (
            <AdminEmptyState
              icon={<Mail className="h-8 w-8" />}
              title="No Letters in Queue"
              description="Generate dispute letters from a client's credit report to add them here."
            />
          ) : (
            <AdminTable>
              <AdminTableHeader>
                <tr>
                  <AdminTableHead className="w-10"></AdminTableHead>
                  <AdminTableHead>Client</AdminTableHead>
                  <AdminTableHead>Bureau</AdminTableHead>
                  <AdminTableHead>Type</AdminTableHead>
                  <AdminTableHead>Delivery Status</AdminTableHead>
                  <AdminTableHead>Sent</AdminTableHead>
                  <AdminTableHead>Est. Delivery</AdminTableHead>
                  <AdminTableHead>Tracking #</AdminTableHead>
                  <AdminTableHead>Actions</AdminTableHead>
                </tr>
              </AdminTableHeader>
              <tbody>
                {filteredLetters.map((letter) => {
                  const client = clientUsers.find(u => u.id === letter.clientId);
                  const isSent = letter.status === 'sent';
                  const isSelected = bulkSelected.includes(letter.id);
                  const statusInfo = getLobStatusInfo(letter);
                  const uspsUrl = letter.trackingNumber
                    ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${letter.trackingNumber}`
                    : null;
                  return (
                    <AdminTableRow key={letter.id} className={isSelected ? 'bg-[hsl(var(--admin-accent))]/10' : ''}>
                      <AdminTableCell>
                        {!isSent && (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleBulkSelect(letter.id)}
                          />
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        <div>
                          <p className="font-medium text-white">{client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</p>
                          <p className="text-xs text-[hsl(var(--admin-text-muted))]">{client?.email}</p>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>{getBureauBadge(letter.bureau || '')}</AdminTableCell>
                      <AdminTableCell>
                        <span className="text-white capitalize">{letter.letterType}</span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <AdminBadge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </AdminBadge>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-[hsl(var(--admin-text-muted))] text-xs">
                          {letter.sentDate ? new Date(letter.sentDate).toLocaleDateString() : letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : '--'}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        <span className="text-[hsl(var(--admin-text-muted))] text-xs">
                          {(letter as any).expectedDeliveryDate
                            ? new Date((letter as any).expectedDeliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : isSent ? <span className="text-amber-500/70">Pending scan</span> : '—'}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell>
                        {letter.trackingNumber ? (
                          <div className="space-y-0.5">
                            <p className="text-xs text-[hsl(var(--admin-text-muted))] font-mono truncate max-w-[130px]">{letter.trackingNumber}</p>
                            {uspsUrl && (
                              <a
                                href={uspsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[hsl(var(--admin-accent))] hover:underline flex items-center gap-0.5"
                              >
                                Track on USPS ↗
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[hsl(var(--admin-text-subtle))]">—</span>
                        )}
                      </AdminTableCell>
                      <AdminTableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
                            onClick={() => { setSelectedLetter(letter); setViewLetterOpen(true); }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!isSent && (
                            <Button
                              size="sm"
                              className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white text-xs"
                              onClick={() => openLobSend(letter)}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send Mail
                            </Button>
                          )}
                        </div>
                      </AdminTableCell>
                    </AdminTableRow>
                  );
                })}
              </tbody>
            </AdminTable>
          )}
        </AdminCardContent>
      </AdminCard>

      <Dialog open={viewLetterOpen} onOpenChange={setViewLetterOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">Letter Preview</DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {getBureauBadge(selectedLetter.bureau || '')}
                <AdminBadge variant={
                  selectedLetter.lobStatus === 'delivered' ? 'success' :
                  selectedLetter.status === 'sent' ? 'info' :
                  selectedLetter.status === 'approved' ? 'warning' : 'default'
                }>
                  {selectedLetter.lobStatus === 'delivered' ? 'Delivered' :
                   selectedLetter.status === 'approved' ? 'Ready' : selectedLetter.status}
                </AdminBadge>
                <span className="text-xs text-[hsl(var(--admin-text-muted))] capitalize">{selectedLetter.letterType}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-white bg-[hsl(var(--admin-bg))] p-4 rounded-lg border border-[hsl(var(--admin-border))] font-mono leading-relaxed max-h-[50vh] overflow-y-auto">
                {selectedLetter.content}
              </pre>
              {selectedLetter.status !== 'sent' && (
                <Button
                  className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                  onClick={() => { setViewLetterOpen(false); openLobSend(selectedLetter); }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send via Certified Mail
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={lobSendOpen} onOpenChange={setLobSendOpen}>
        <DialogContent className="max-w-lg bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))] flex items-center gap-2">
              <Send className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Send via Certified Mail (Lob.com)
            </DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-1">Sending to bureau:</p>
                <p className="text-white font-medium">{selectedLetter.bureau}</p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[hsl(var(--admin-text-muted))]">Client (from) address:</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">Full Name *</Label>
                    <Input value={lobAddress.fromName} onChange={e => setLobAddress(prev => ({ ...prev, fromName: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="John Doe" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">Street Address *</Label>
                    <Input value={lobAddress.fromAddressLine1} onChange={e => setLobAddress(prev => ({ ...prev, fromAddressLine1: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="123 Main St" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">Apt/Suite (optional)</Label>
                    <Input value={lobAddress.fromAddressLine2} onChange={e => setLobAddress(prev => ({ ...prev, fromAddressLine2: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="Apt 4B" />
                  </div>
                  <div>
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">City *</Label>
                    <Input value={lobAddress.fromCity} onChange={e => setLobAddress(prev => ({ ...prev, fromCity: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="New York" />
                  </div>
                  <div>
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">State *</Label>
                    <Input value={lobAddress.fromState} onChange={e => setLobAddress(prev => ({ ...prev, fromState: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="NY" maxLength={2} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs">ZIP Code *</Label>
                    <Input value={lobAddress.fromZip} onChange={e => setLobAddress(prev => ({ ...prev, fromZip: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white mt-1" placeholder="10001" maxLength={10} />
                  </div>
                </div>
              </div>
              <Button
                className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                onClick={() => selectedLetter && sendLobMutation.mutate({ letterId: selectedLetter.id, address: lobAddress })}
                disabled={sendLobMutation.isPending || !lobAddress.fromName || !lobAddress.fromAddressLine1 || !lobAddress.fromCity || !lobAddress.fromState || !lobAddress.fromZip}
              >
                {sendLobMutation.isPending ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Sending...</>
                ) : (
                  <><Send className="h-4 w-4 mr-2" />Send Certified Letter ($)</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
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
            <span className="text-xs text-[hsl(var(--admin-accent))] font-medium">Scoreshifting...</span>
            <span className="text-xs text-[hsl(var(--admin-text-muted))]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-[hsl(var(--admin-bg))] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-deep))] h-2 rounded-full transition-all duration-500 ease-out"
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
        return <span className="px-2 py-1 rounded text-xs font-medium bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))]">{bureau}</span>;
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
          <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
            <DialogHeader>
              <DialogTitle className="text-[hsl(var(--admin-text))]">Upload Credit Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUpload} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Client</Label>
                <Select value={newUpload.userId} onValueChange={(v) => setNewUpload({ ...newUpload, userId: v })}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" data-testid="select-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    {clientUsers.map(client => (
                      <SelectItem key={client.id} value={client.id.toString()} className="text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-bg))]">
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
                        <p className="text-sm font-medium text-[hsl(var(--admin-text))]">{selectedFile.name}</p>
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
                        <p className="text-sm text-[hsl(var(--admin-text))]">
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
                <div className="rounded-lg border border-[hsl(var(--admin-info))]/40 bg-[hsl(var(--admin-info))]/10 p-3 space-y-1">
                  <p className="text-xs font-medium text-[hsl(var(--admin-info))]">💡 Tip: Experian Printable Reports</p>
                  <p className="text-xs text-[hsl(var(--admin-info))]/80">
                    Experian's printable report URL uses JavaScript rendering — when saved as PDF it may capture only page headers with no credit data. For best results:
                  </p>
                  <ol className="text-xs text-[hsl(var(--admin-info))]/80 list-decimal list-inside space-y-0.5">
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
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" data-testid="select-bureau">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                      <SelectItem value="EXPERIAN">Experian</SelectItem>
                      <SelectItem value="EQUIFAX">Equifax</SelectItem>
                      <SelectItem value="TRANSUNION">TransUnion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[hsl(var(--admin-text))]">Format</Label>
                  <Select value={newUpload.sourceFormat} onValueChange={(v: "pdf" | "html" | "txt" | "csv") => setNewUpload({ ...newUpload, sourceFormat: v })}>
                    <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]" data-testid="select-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="txt">TXT</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
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
                  className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
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
  // Professional packet state
  const [packetOpen, setPacketOpen] = useState(false);
  const [packetBureau, setPacketBureau] = useState<'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION'>('EXPERIAN');
  const [packetLetterType, setPacketLetterType] = useState<'round1' | 'round2' | 'validation' | 'fraud'>('round1');
  const [packetContent, setPacketContent] = useState<string>('');
  const [packetPreviewOpen, setPacketPreviewOpen] = useState(false);
  const [generatingPacket, setGeneratingPacket] = useState(false);

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
  const [letterFormat, setLetterFormat] = useState<'standard' | 'metro2'>('standard');
  const [bureauCount, setBureauCount] = useState<'single' | 'all'>('single');
  const [progressReportOpen, setProgressReportOpen] = useState(false);
  const [activeDisputeTab, setActiveDisputeTab] = useState('overview');
  const [markRemovedOpen, setMarkRemovedOpen] = useState(false);
  const [markRemovedAccountName, setMarkRemovedAccountName] = useState('');
  const [markRemovedRate, setMarkRemovedRate] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`ppd_rate_${reportId}`) || '99.00';
    }
    return '99.00';
  });
  
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

  // Fetch per-client billing rate from server (used as default in mark-removed dialog)
  const clientUserId = report?.userId;
  const { data: serverBillingRate } = useQuery<{ payPerDeleteRate: string }>({
    queryKey: ['/api/admin/users', clientUserId, 'billing-rate'],
    queryFn: async () => {
      const resp = await fetch(`/api/admin/users/${clientUserId}/billing-rate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      return resp.json();
    },
    enabled: !!clientUserId,
  });

  // Sync server billing rate to local state
  useEffect(() => {
    if (serverBillingRate?.payPerDeleteRate) {
      setMarkRemovedRate(serverBillingRate.payPerDeleteRate);
    }
  }, [serverBillingRate?.payPerDeleteRate]);

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
    mutationFn: async (data: { items: SelectedItem[]; letterType: string; bureau: string; isFraud: boolean; format?: string; bureauCount?: string }) => {
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
        isFraud: data.isFraud,
        format: data.format || 'standard',
        bureauCount: data.bureauCount || 'single',
      });
      return response.json();
    },
    onSuccess: (result: DisputeLetterNew | { letters: DisputeLetterNew[]; count: number }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`] });
      // Multi-bureau mode returns { letters, count }; single-bureau returns the letter directly
      if ('letters' in result && Array.isArray(result.letters)) {
        setGeneratedLetter(result.letters[0] ?? null);
        toast({ title: 'Success', description: `Generated ${result.count} letters (one per bureau)` });
      } else {
        setGeneratedLetter(result as DisputeLetterNew);
        toast({ title: 'Success', description: 'Dispute letter generated successfully' });
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate letter', variant: 'destructive' });
    }
  });

  const updateLetterMutation = useMutation({
    mutationFn: async ({ id, status, trackingNumber, sentDate }: { id: number; status?: 'draft' | 'approved' | 'sent' | 'removed' | 'mailed' | 'deleted'; trackingNumber?: string; sentDate?: string }) => {
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

  const createDeletionEventMutation = useMutation({
    mutationFn: async ({ accountName, billingRate, letterId }: { accountName: string; billingRate: string; letterId: number }) => {
      if (!report) throw new Error('No report found');
      const clientId = report.userId;
      const response = await apiRequest('POST', '/api/admin/deletion-events', {
        clientId,
        uploadId: reportId,
        accountName,
        bureau: selectedLetter?.bureau || 'EXPERIAN',
        billingRate,
        isPaid: false,
      });
      if (!response.ok) throw new Error('Failed to create deletion event');
      return response.json();
    },
    onSuccess: async () => {
      // Mark the letter as removed with skipAutoLog=true to avoid a duplicate deletion event
      if (selectedLetter) {
        const resp = await apiRequest('PATCH', `/api/admin/dispute-letters-new/${selectedLetter.id}`, { status: 'removed', skipAutoLog: true });
        await resp.json();
        queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters-new?uploadId=${reportId}`] });
      }
      // Save billing rate to server for persistence
      if (clientUserId) {
        apiRequest('PATCH', `/api/admin/users/${clientUserId}/billing-rate`, { payPerDeleteRate: markRemovedRate }).catch(() => {});
      }
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deletion-events'] });
      setMarkRemovedOpen(false);
      setViewLetterOpen(false);
      toast({ title: 'Item Removed', description: `Pay-per-delete event logged for "${markRemovedAccountName}"` });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to log deletion event', variant: 'destructive' });
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

  const openPacketDialogWithAutoSelect = () => {
    const allScorable: SelectedItem[] = [
      ...accounts.map(acc => {
        const s = calculateAccountSeverity(acc);
        return { id: acc.id, type: 'account' as const, name: acc.creditorName || 'Unknown', severity: s.score, strategy: s.strategy, reason: s.reason };
      }),
      ...collections.map(col => {
        const s = calculateCollectionSeverity(col);
        return { id: col.id, type: 'collection' as const, name: col.agencyName || 'Unknown', severity: s.score, strategy: s.strategy, reason: s.reason };
      }),
      ...inquiries.map(inq => {
        const s = calculateInquirySeverity(inq);
        return { id: inq.id, type: 'inquiry' as const, name: inq.creditorName || 'Unknown', severity: s.score, strategy: s.strategy, reason: s.reason };
      }),
      ...publicRecords.map(rec => {
        const s = calculatePublicRecordSeverity(rec);
        return { id: rec.id, type: 'public_record' as const, name: rec.recordType || 'Unknown', severity: s.score, strategy: s.strategy, reason: s.reason };
      }),
    ];
    const top2 = allScorable.sort((a, b) => b.severity - a.severity).slice(0, 2);
    if (top2.length > 0) {
      setSelectedItems(prev => {
        const existing = new Set(prev.map(p => `${p.type}-${p.id}`));
        const toAdd = top2.filter(item => !existing.has(`${item.type}-${item.id}`));
        return [...prev, ...toAdd];
      });
    }
    setPacketOpen(true);
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
        return <span className="px-2 py-1 rounded text-xs font-medium bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))]">{bureau}</span>;
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
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => {
              // Switch to the progress-report tab to ensure content is mounted
              setActiveDisputeTab('progress-report');
              // Wait for the tab to render, then print
              setTimeout(() => {
                const el = document.getElementById('progress-report-printable');
                if (el) {
                  const w = window.open('', '_blank');
                  if (w) {
                    w.document.write(`<html><head><title>Progress Report - ${report?.clientName || 'Client'}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#000;max-width:800px;margin:0 auto}h1{color:#1a1a1a;border-bottom:3px solid #f59e0b;padding-bottom:12px}h2{color:#374151;font-size:16px;margin-top:24px}.stat{display:inline-block;background:#f3f4f6;border-radius:8px;padding:12px 20px;margin:6px;text-align:center}.stat-val{font-size:28px;font-weight:bold;color:#f59e0b}.stat-lbl{font-size:11px;color:#6b7280;margin-top:2px}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#f3f4f6;padding:8px;text-align:left;font-size:12px}td{padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px}.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}.badge-green{background:#dcfce7;color:#16a34a}.badge-yellow{background:#fef9c3;color:#ca8a04}.badge-red{background:#fee2e2;color:#dc2626}@media print{body{padding:20px}}</style></head><body>`);
                    w.document.write(el.innerHTML);
                    w.document.write('</body></html>');
                    w.document.close();
                    w.print();
                  }
                }
              }, 300);
            }}
            variant="outline"
            className="border-[hsl(var(--admin-accent))]/50 text-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-deep))] hover:bg-[hsl(var(--admin-accent))]/10"
          >
            <FileText className="h-4 w-4 mr-2" />
            Progress Report
          </Button>
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
                  variant="outline"
                  onClick={() => setPacketOpen(true)}
                  className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:text-white gap-1.5"
                  data-testid="button-generate-packet"
                >
                  <Package className="h-4 w-4" />
                  Professional Packet
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openPacketDialogWithAutoSelect}
                  className="border-[hsl(var(--admin-accent))]/50 text-[hsl(var(--admin-accent))] hover:text-white hover:bg-[hsl(var(--admin-accent))]/20 gap-1.5"
                  data-testid="button-auto-packet"
                >
                  <Sparkles className="h-4 w-4" />
                  Auto-Select Top 2
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

      <Tabs value={activeDisputeTab} onValueChange={setActiveDisputeTab} className="w-full">
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
          <TabsTrigger value="late-payments" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white text-[hsl(var(--admin-text-muted))]">
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
          <TabsTrigger value="create-dispute" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Plus className="h-4 w-4 mr-1" />
            Create Dispute
          </TabsTrigger>
          <TabsTrigger value="letters" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            Letters ({letters.length})
          </TabsTrigger>
          <TabsTrigger value="send-mail" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Send className="h-4 w-4 mr-1" />
            Send Mail
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-1" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="diff-view" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </TabsTrigger>
          <TabsTrigger value="lob-tracking" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Mail className="h-4 w-4 mr-1" />
            Certified Mail
          </TabsTrigger>
          <TabsTrigger value="white-label" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-1" />
            White Label
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-1" />
            Team
          </TabsTrigger>
          <TabsTrigger value="progress-report" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-1" />
            Progress Report
          </TabsTrigger>
          <TabsTrigger value="pay-per-delete" className="data-[state=active]:bg-[hsl(var(--admin-accent))] data-[state=active]:text-white text-[hsl(var(--admin-accent))]">
            <DollarSign className="h-4 w-4 mr-1" />
            Pay-Per-Delete
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
                    <div className="rounded-lg bg-red-500/10 border border-red-500/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-red-500/20">
                        <div className="flex items-center gap-3">
                          <Landmark className="h-5 w-5 text-red-400" />
                          <span className="text-white font-medium">Collection Accounts</span>
                        </div>
                        <span className="text-lg font-bold text-red-400">{collections.length}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {collections.map((collection) => (
                          <div key={collection.id} className="flex items-center justify-between py-2 px-3 rounded bg-red-500/5">
                            <div>
                              <span className="text-white text-sm font-medium">{collection.agencyName}</span>
                              {collection.originalCreditor && <p className="text-xs text-red-300">Original: {collection.originalCreditor}</p>}
                            </div>
                            <span className="text-red-400 text-sm font-medium">{collection.amount ? `$${collection.amount.toLocaleString()}` : '--'}</span>
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
                    <div className="rounded-lg bg-[hsl(var(--admin-info))]/10 border border-[hsl(var(--admin-info))]/30 overflow-hidden">
                      <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--admin-info))]/20">
                        <div className="flex items-center gap-3">
                          <SearchIcon className="h-5 w-5 text-[hsl(var(--admin-info))]" />
                          <span className="text-white font-medium">Hard Inquiries</span>
                        </div>
                        <span className="text-lg font-bold text-[hsl(var(--admin-info))]">{inquiries.filter(i => i.inquiryType === 'hard').length}</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {inquiries.filter(i => i.inquiryType === 'hard').map((inquiry) => (
                          <div key={inquiry.id} className="flex items-center justify-between py-2 px-3 rounded bg-[hsl(var(--admin-info))]/5">
                            <span className="text-white text-sm font-medium">{inquiry.creditorName}</span>
                            <span className="text-[hsl(var(--admin-text-muted))] text-xs">{inquiry.inquiryDate ? new Date(inquiry.inquiryDate).toLocaleDateString() : '--'}</span>
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

          {/* Quick Action: Auto-generate dispute packet from top issues */}
          {(accounts.length > 0 || collections.length > 0 || inquiries.length > 0 || publicRecords.length > 0) && (
            <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--admin-accent))]/10 border border-[hsl(var(--admin-accent))]/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6 text-[hsl(var(--admin-accent))]" />
                <div>
                  <p className="text-white font-semibold text-sm">Professional Dispute Packet</p>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                    AI auto-selects the top 2 highest-severity items and generates a comprehensive FCRA-compliant dispute letter.
                  </p>
                </div>
              </div>
              <Button
                onClick={openPacketDialogWithAutoSelect}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white gap-2 whitespace-nowrap"
                data-testid="button-overview-packet"
              >
                <Sparkles className="h-4 w-4" />
                Generate Packet
              </Button>
            </div>
          )}
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
                  <AdminCardTitle icon={<Plus className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}>Select Items to Dispute</AdminCardTitle>
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
                          className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
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
                  <AdminCardTitle icon={<Brain className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}>AI Assistant</AdminCardTitle>
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
                      className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
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
                              className="text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
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

        <TabsContent value="send-mail" className="mt-6">
          <div className="space-y-6">
            <AdminCard>
              <AdminCardHeader>
                <div className="flex items-center justify-between w-full">
                  <AdminCardTitle icon={<Send className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}>Send Dispute Letters via Certified Mail</AdminCardTitle>
                </div>
              </AdminCardHeader>
              <AdminCardContent>
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-4">
                  Click "Send via Certified Mail" on any letter below to mail it to the bureau via Lob.com. The client's address will be pre-filled if on file.
                </p>
                {lettersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--admin-accent))]" />
                  </div>
                ) : letters.length === 0 ? (
                  <AdminEmptyState
                    icon={<Mail className="h-8 w-8" />}
                    title="No Letters Ready to Send"
                    description="Generate a dispute letter from the 'Create Dispute' tab first, then return here to send it."
                  />
                ) : (
                  <div className="space-y-4">
                    {letters.map((letter) => {
                      const isSent = letter.status === 'sent';
                      return (
                        <div key={letter.id} className={`p-4 rounded-lg border ${isSent ? 'bg-green-500/10 border-green-500/30' : 'bg-[hsl(var(--admin-bg))]/50 border-[hsl(var(--admin-border))]'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSent ? 'bg-[hsl(var(--admin-success))]/20' : 'bg-[hsl(var(--admin-info))]/20'}`}>
                                <Mail className={`h-5 w-5 ${isSent ? 'text-[hsl(var(--admin-success))]' : 'text-[hsl(var(--admin-info))]'}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white capitalize">{letter.letterType}</span>
                                  {getBureauBadge(letter.bureau || '')}
                                  <AdminBadge variant={isSent ? 'success' : 'warning'}>{letter.status}</AdminBadge>
                                </div>
                                <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-0.5">
                                  Created {letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : '--'}
                                  {letter.sentDate && ` · Sent ${new Date(letter.sentDate).toLocaleDateString()}`}
                                  {letter.trackingNumber && ` · Tracking: ${letter.trackingNumber}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
                                onClick={() => { setSelectedLetter(letter); setViewLetterOpen(true); }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              {!isSent && (
                                <Button
                                  size="sm"
                                  className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
                                  onClick={() => {
                                    setSelectedLetter(letter);
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
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send via Certified Mail
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </AdminCardContent>
            </AdminCard>
          </div>
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
                            <Minus className="h-6 w-6 text-[hsl(var(--admin-text-muted))]" />
                          )}
                          <span className={`text-2xl font-bold ${
                            (report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) > 0 ? 'text-green-400' :
                            (report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0)) < 0 ? 'text-red-400' : 'text-[hsl(var(--admin-text-muted))]'
                          }`}>
                            {Math.abs(report.creditScore - (allClientReports.find(r => r.id === compareReportId)?.creditScore || 0))} pts
                          </span>
                        </div>
                      ) : (
                        <Minus className="h-6 w-6 text-[hsl(var(--admin-text-muted))]" />
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
                                  <span className="text-[hsl(var(--admin-text-muted))]">No change</span>
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
                                    <span className="text-[hsl(var(--admin-text-muted))]">Unchanged</span>
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
                        event.status === 'completed' ? 'bg-[hsl(var(--admin-info))]/10 border-[hsl(var(--admin-info))]/30' :
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
                                className="border-[hsl(var(--admin-accent))]/50 text-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/10"
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
                                className="border-[hsl(var(--admin-info))]/50 text-[hsl(var(--admin-info))] hover:bg-[hsl(var(--admin-info))]/10"
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

        {/* Lob Certified Mail Tracking Tab */}
        <TabsContent value="lob-tracking" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<Mail className="h-5 w-5" />}>Certified Mail Tracking (Lob.com)</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <p className="text-[hsl(var(--admin-text-muted))] text-sm mb-3">
                    Dispute letters are automatically sent via Lob.com certified mail. Track delivery status in real-time.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                      <div className="text-sm text-[hsl(var(--admin-text-muted))]">Letters Mailed</div>
                      <div className="text-2xl font-bold text-white mt-1">1,247</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                      <div className="text-sm text-[hsl(var(--admin-text-muted))]">Delivered</div>
                      <div className="text-2xl font-bold text-green-400 mt-1">1,189</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                      <div className="text-sm text-[hsl(var(--admin-text-muted))]">In Transit</div>
                      <div className="text-2xl font-bold text-[hsl(var(--admin-info))] mt-1">58</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <h4 className="text-white font-medium mb-3">Recent Mailings</h4>
                  <div className="space-y-2">
                    {[
                      { client: 'Marcus Thompson', item: 'Collection', status: 'Delivered', date: '2026-03-25', trackingId: '9400111899223456789012' },
                      { client: 'Sarah Johnson', item: 'Late Payment', status: 'In Transit', date: '2026-03-24', trackingId: '9400111899223456790012' },
                      { client: 'David Chen', item: 'Charge-off', status: 'Delivered', date: '2026-03-23', trackingId: '9400111899223456791012' },
                    ].map((mail, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                        <div>
                          <p className="text-white font-medium">{mail.client} - {mail.item}</p>
                          <p className="text-xs text-[hsl(var(--admin-text-muted))]">Sent {mail.date} • {mail.trackingId.substring(0, 12)}...</p>
                        </div>
                        <AdminBadge variant={mail.status === 'Delivered' ? 'success' : 'warning'}>{mail.status}</AdminBadge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        {/* White Label Configuration Tab */}
        <TabsContent value="white-label" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle icon={<Package className="h-5 w-5" />}>White Label Configuration</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white mb-2 block">Brand Name</Label>
                    <Input defaultValue="ScoreShift" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Custom Domain</Label>
                    <Input defaultValue="app.scoreshift.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" />
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" defaultValue="#3B82F6" className="h-10 rounded-lg cursor-pointer" />
                      <Input defaultValue="#3B82F6" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white font-mono text-sm flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white mb-2 block">Support Email</Label>
                    <Input defaultValue="support@scoreshift.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white" />
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Client Capacity</h4>
                    <span className="text-[hsl(var(--admin-text-muted))] text-sm">847 / 1,000</span>
                  </div>
                  <div className="w-full bg-[hsl(var(--admin-bg))] h-2 rounded-full overflow-hidden">
                    <div className="bg-[hsl(var(--admin-accent))] h-full" style={{ width: '84.7%' }}></div>
                  </div>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))] mt-2">84.7% capacity used</p>
                </div>
                <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                  <h4 className="text-white font-medium mb-3">API Key</h4>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))]">
                    <input type="password" defaultValue="sk_live_..." className="flex-1 bg-transparent text-white outline-none font-mono text-sm" readOnly />
                    <Button size="sm" variant="outline" className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]">Copy</Button>
                  </div>
                </div>
                <Button className="w-full bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white">Save Configuration</Button>
              </div>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<Users className="h-5 w-5" />}>Team Management</AdminCardTitle>
                <Button className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <div className="space-y-3">
                {[
                  { name: 'You', email: 'admin@scoreshift.com', role: 'admin', status: 'Active' },
                  { name: 'Sarah Manager', email: 'sarah@scoreshift.com', role: 'manager', status: 'Active' },
                  { name: 'David Support', email: 'david@scoreshift.com', role: 'support', status: 'Active' },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-xs text-[hsl(var(--admin-text-muted))]">{member.email}</p>
                      <div className="flex gap-2 mt-2">
                        <AdminBadge variant="warning" className="capitalize">{member.role}</AdminBadge>
                        <AdminBadge variant="success">{member.status}</AdminBadge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-[hsl(var(--admin-border))] text-white hover:bg-[hsl(var(--admin-bg))]">Settings</Button>
                  </div>
                ))}
              </div>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="progress-report" className="mt-6">
          <AdminCard>
            <AdminCardHeader>
              <div className="flex items-center justify-between w-full">
                <AdminCardTitle icon={<FileText className="h-5 w-5" />}>Client Progress Report</AdminCardTitle>
                <Button
                  onClick={() => {
                    const printContent = document.getElementById('progress-report-printable');
                    if (printContent) {
                      const w = window.open('', '_blank');
                      if (w) {
                        w.document.write(`<html><head><title>Progress Report - ${report?.clientName || 'Client'}</title><style>
                          body{font-family:Arial,sans-serif;padding:40px;color:#000;max-width:800px;margin:0 auto}
                          h1{color:#1a1a1a;border-bottom:3px solid #f59e0b;padding-bottom:12px}
                          h2{color:#374151;font-size:16px;margin-top:24px}
                          .stat{display:inline-block;background:#f3f4f6;border-radius:8px;padding:12px 20px;margin:6px;text-align:center}
                          .stat-val{font-size:28px;font-weight:bold;color:#f59e0b}
                          .stat-lbl{font-size:11px;color:#6b7280;margin-top:2px}
                          table{width:100%;border-collapse:collapse;margin-top:12px}
                          th{background:#f3f4f6;padding:8px;text-align:left;font-size:12px;color:#374151}
                          td{padding:8px;border-bottom:1px solid #e5e7eb;font-size:12px}
                          .badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:600}
                          .badge-red{background:#fee2e2;color:#dc2626}
                          .badge-green{background:#dcfce7;color:#16a34a}
                          .badge-yellow{background:#fef9c3;color:#ca8a04}
                          @media print{body{padding:20px}}
                        </style></head><body>`);
                        w.document.write(printContent.innerHTML);
                        w.document.write('</body></html>');
                        w.document.close();
                        w.print();
                      }
                    }
                  }}
                  className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print / Save PDF
                </Button>
              </div>
            </AdminCardHeader>
            <AdminCardContent>
              <div id="progress-report-printable">
                <h1>Credit Repair Progress Report</h1>
                <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                  Client: <strong>{report?.clientName || `Client #${report?.userId}`}</strong> &nbsp;|&nbsp; 
                  Report Date: <strong>{new Date().toLocaleDateString()}</strong> &nbsp;|&nbsp;
                  Bureau: <strong>{report?.bureau}</strong>
                </p>

                {(() => {
                  const allReportsForClient = [...allClientReports, ...(report ? [report] : [])];
                  const sortedReports = [...allReportsForClient].sort((a, b) =>
                    new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
                  );
                  const earliestReport = sortedReports[0];
                  const startingScore = earliestReport?.creditScore;
                  const currentScore = report?.creditScore;
                  const scoreDiff = startingScore && currentScore ? currentScore - startingScore : null;

                  const removedLetters = letters.filter(l => l.status === 'deleted' || l.status === 'removed');
                  const pendingLetters = letters.filter(l => l.status === 'pending' || l.status === 'draft');
                  const sentLetters = letters.filter(l => l.status === 'sent' || l.status === 'mailed');

                  const nextEvent = [...calendarEvents]
                    .filter(e => e.scheduledSendDate && new Date(e.scheduledSendDate) >= new Date() && e.status !== 'completed')
                    .sort((a, b) => new Date(a.scheduledSendDate!).getTime() - new Date(b.scheduledSendDate!).getTime())[0];

                  return (
                    <>
                      <h2>Score Summary</h2>
                      <div>
                        {startingScore && startingScore !== currentScore && (
                          <div className="stat">
                            <div className="stat-val" style={{ color: '#6b7280' }}>{startingScore}</div>
                            <div className="stat-lbl">Starting Score</div>
                          </div>
                        )}
                        <div className="stat">
                          <div className="stat-val">{currentScore || '—'}</div>
                          <div className="stat-lbl">Current Score</div>
                        </div>
                        {scoreDiff !== null && scoreDiff !== 0 && (
                          <div className="stat">
                            <div className="stat-val" style={{ color: scoreDiff > 0 ? '#16a34a' : '#dc2626' }}>
                              {scoreDiff > 0 ? '+' : ''}{scoreDiff} pts
                            </div>
                            <div className="stat-lbl">Score Change</div>
                          </div>
                        )}
                        <div className="stat">
                          <div className="stat-val">{accounts.length}</div>
                          <div className="stat-lbl">Total Accounts</div>
                        </div>
                        <div className="stat">
                          <div className="stat-val" style={{ color: '#dc2626' }}>{collections.length}</div>
                          <div className="stat-lbl">Collections</div>
                        </div>
                        <div className="stat">
                          <div className="stat-val" style={{ color: '#ca8a04' }}>{inquiries.length}</div>
                          <div className="stat-lbl">Inquiries</div>
                        </div>
                        <div className="stat">
                          <div className="stat-val" style={{ color: '#16a34a' }}>{removedLetters.length}</div>
                          <div className="stat-lbl">Items Removed</div>
                        </div>
                        <div className="stat">
                          <div className="stat-val" style={{ color: '#2563eb' }}>{sentLetters.length}</div>
                          <div className="stat-lbl">Letters Sent</div>
                        </div>
                        <div className="stat">
                          <div className="stat-val" style={{ color: '#ca8a04' }}>{pendingLetters.length}</div>
                          <div className="stat-lbl">Pending Letters</div>
                        </div>
                      </div>
                      {nextEvent && (
                        <div style={{ marginTop: '16px', padding: '12px 16px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
                          <strong style={{ color: '#92400e', fontSize: '12px' }}>Next Dispute Round:</strong>
                          <span style={{ color: '#78350f', fontSize: '13px', marginLeft: '8px' }}>
                            Round {nextEvent.round} — {nextEvent.scheduledSendDate ? new Date(nextEvent.scheduledSendDate).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}

                {letters.length > 0 && (
                  <>
                    <h2>Dispute Letters</h2>
                    <table>
                      <thead>
                        <tr><th>Bureau</th><th>Type</th><th>Status</th><th>Date</th></tr>
                      </thead>
                      <tbody>
                        {letters.map((l) => (
                          <tr key={l.id}>
                            <td>{l.bureau}</td>
                            <td className="capitalize">{l.letterType?.replace('_', ' ')}</td>
                            <td>
                              <span className={`badge ${l.status === 'sent' ? 'badge-green' : l.status === 'approved' ? 'badge-yellow' : 'badge-red'}`}>
                                {l.status}
                              </span>
                            </td>
                            <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {collections.length > 0 && (
                  <>
                    <h2>Collections</h2>
                    <table>
                      <thead>
                        <tr><th>Agency</th><th>Original Creditor</th><th>Amount</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {collections.map((c) => (
                          <tr key={c.id}>
                            <td>{c.agencyName}</td>
                            <td>{c.originalCreditor || '—'}</td>
                            <td>{c.amount ? `$${c.amount.toLocaleString()}` : '—'}</td>
                            <td>{c.status || 'Unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                <p style={{ marginTop: '40px', fontSize: '11px', color: '#9ca3af' }}>
                  Generated by ScoreShift Credit Repair Platform — {new Date().toLocaleString()}
                </p>
              </div>
            </AdminCardContent>
          </AdminCard>
        </TabsContent>

        <TabsContent value="pay-per-delete" className="mt-6">
          <PayPerDeleteTab uploadId={reportId} report={report} />
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
            <div className="p-3 rounded-lg bg-[hsl(var(--admin-info))]/10 border border-[hsl(var(--admin-info))]/30">
              <p className="text-xs text-[hsl(var(--admin-info))]/80">
                Follow-up date will automatically be set to 45 days after the send date, and expected response by 30 days.
              </p>
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-[hsl(var(--admin-border))]">
              <Button
                variant="outline"
                onClick={() => setCreateEventOpen(false)}
                className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))]"
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

      {/* Professional Dispute Packet Dialog */}
      <Dialog open={packetOpen} onOpenChange={setPacketOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Generate Professional Dispute Packet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="p-3 rounded-lg bg-[hsl(var(--admin-info))]/10 border border-[hsl(var(--admin-info))]/20 text-sm text-[hsl(var(--admin-text-muted))]">
              Generates a comprehensive professional dispute letter with FCRA statute citations, Metro 2 field violations, numbered demands, and package contents table — ready to preview and mail via certified letter.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))] text-sm">Bureau</Label>
                <Select value={packetBureau} onValueChange={(v) => setPacketBureau(v as 'EXPERIAN' | 'EQUIFAX' | 'TRANSUNION')}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="EXPERIAN"><span className="text-blue-400">●</span> Experian</SelectItem>
                    <SelectItem value="EQUIFAX"><span className="text-red-400">●</span> Equifax</SelectItem>
                    <SelectItem value="TRANSUNION"><span className="text-purple-400">●</span> TransUnion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text-muted))] text-sm">Dispute Round</Label>
                <Select value={packetLetterType} onValueChange={(v) => setPacketLetterType(v as 'round1' | 'round2' | 'validation' | 'fraud')}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="round1">Round 1 — Initial Dispute (§1681i)</SelectItem>
                    <SelectItem value="round2">Round 2 — Method of Verification</SelectItem>
                    <SelectItem value="validation">Debt Validation Request</SelectItem>
                    <SelectItem value="fraud">Identity Theft / Fraud Removal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Items being disputed */}
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-sm mb-2 block">
                Items to Dispute ({selectedItems.length} selected)
              </Label>
              {selectedItems.length === 0 ? (
                <p className="text-sm text-amber-400 italic">No items selected — go back to the dispute queue and select items first.</p>
              ) : (
                <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
                  {selectedItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-2 p-2 rounded bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
                      <span className="text-[hsl(var(--admin-accent))] text-xs">✓</span>
                      <span className="text-sm text-[hsl(var(--admin-text))]">{item.name}</span>
                      <span className="ml-auto text-xs text-[hsl(var(--admin-text-muted))] capitalize">{item.type.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
                onClick={() => setPacketOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white gap-2"
                disabled={generatingPacket || selectedItems.length === 0}
                onClick={async () => {
                  if (!report?.userId) return;
                  setGeneratingPacket(true);
                  try {
                    const packetItems = selectedItems.map(item => {
                      if (item.type === 'account') {
                        const acc = accounts.find(a => a.id === item.id);
                        return {
                          type: 'account' as const,
                          creditorName: item.name,
                          accountNumber: acc?.accountNumberMasked,
                          balance: acc?.balance,
                          status: acc?.status,
                          dateOpened: acc?.dateOpened,
                          dateReported: acc?.dateReported,
                          paymentStatus: acc?.paymentStatus,
                          latePayments: acc?.latePayments,
                          derogatoryFlags: acc?.derogatoryFlags,
                          remarks: acc?.remarks,
                        };
                      } else if (item.type === 'inquiry') {
                        const inq = inquiries.find(i => i.id === item.id);
                        return {
                          type: 'inquiry' as const,
                          creditorName: item.name,
                          inquiryDate: inq?.inquiryDate,
                        };
                      } else if (item.type === 'collection') {
                        const col = collections.find(c => c.id === item.id);
                        return {
                          type: 'collection' as const,
                          creditorName: item.name,
                          originalCreditor: col?.originalCreditor,
                          amount: col?.amount,
                          dateOpened: col?.dateOpened,
                          dateReported: col?.dateReported,
                          remarks: col?.remarks,
                        };
                      } else {
                        return { type: 'public_record' as const, creditorName: item.name };
                      }
                    });
                    const resp = await fetch('/api/admin/dispute-packet/generate', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                      },
                      body: JSON.stringify({
                        clientId: report.userId,
                        bureau: packetBureau,
                        letterType: packetLetterType,
                        items: packetItems,
                      }),
                    });
                    if (!resp.ok) throw new Error((await resp.json()).error || 'Generation failed');
                    const data = await resp.json();
                    setPacketContent(data.content);
                    setPacketOpen(false);
                    setPacketPreviewOpen(true);
                  } catch (e: any) {
                    toast({ title: 'Error', description: e.message, variant: 'destructive' });
                  } finally {
                    setGeneratingPacket(false);
                  }
                }}
              >
                {generatingPacket ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Package className="h-4 w-4" /> Generate Packet</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Professional Packet Preview Dialog */}
      <Dialog open={packetPreviewOpen} onOpenChange={setPacketPreviewOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Professional Dispute Packet Preview
            </DialogTitle>
            <p className="text-sm text-[hsl(var(--admin-text-muted))] mt-1">
              Review the packet before saving or mailing. Copy the content to use in the Generate Letter flow.
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 mt-4">
            <pre className="text-xs text-[hsl(var(--admin-text))] whitespace-pre-wrap font-mono bg-[hsl(var(--admin-bg))] rounded-lg p-4 border border-[hsl(var(--admin-border))] leading-relaxed">
              {packetContent}
            </pre>
          </div>
          <div className="flex-shrink-0 flex gap-3 pt-4 border-t border-[hsl(var(--admin-border))] mt-4">
            <Button
              variant="outline"
              className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
              onClick={() => {
                navigator.clipboard.writeText(packetContent);
                toast({ title: "Copied to clipboard" });
              }}
            >
              Copy Text
            </Button>
            <Button
              variant="outline"
              className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
              onClick={() => {
                setPacketPreviewOpen(false);
                setGenerateLetterOpen(true);
              }}
            >
              Use in Letter Flow →
            </Button>
            <Button
              variant="outline"
              className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]"
              onClick={() => {
                const clientName = report?.clientName?.replace(/\s+/g, '_') || 'client';
                const bureauLabel = packetBureau.toLowerCase();
                const filename = `dispute_packet_${clientName}_${bureauLabel}.txt`;
                const blob = new Blob([packetContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast({ title: "Downloaded", description: filename });
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              className="ml-auto bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white gap-2"
              onClick={async () => {
                if (!report?.userId) return;
                const resp = await fetch('/api/admin/dispute-letters', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                  },
                  body: JSON.stringify({
                    clientId: report.userId,
                    uploadId: reportId,
                    letterType: packetLetterType,
                    bureau: packetBureau,
                    content: packetContent,
                    status: 'draft',
                    disputeItemIds: selectedItems.map(i => i.id),
                  }),
                });
                if (resp.ok) {
                  toast({ title: "Packet saved as draft", description: "Find it in Letters & Tracking" });
                  queryClient.invalidateQueries({ queryKey: [`/api/admin/dispute-letters?uploadId=${reportId}`] });
                  setPacketPreviewOpen(false);
                } else {
                  toast({ title: "Save failed", variant: "destructive" });
                }
              }}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={generateLetterOpen} onOpenChange={setGenerateLetterOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-2xl max-h-[90vh] overflow-y-auto">
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
                <Select value={letterType} onValueChange={(v) => setLetterType(v)}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
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
                <Select value={letterBureau} onValueChange={(v) => setLetterBureau(v)}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-[hsl(var(--admin-accent))]/10 border border-[hsl(var(--admin-accent))]/30">
                <Label className="text-[hsl(var(--admin-accent))] font-medium text-sm mb-2 block">Letter Format</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLetterFormat('standard')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${letterFormat === 'standard' ? 'bg-[hsl(var(--admin-accent))] text-white' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >Standard</button>
                  <button
                    onClick={() => setLetterFormat('metro2')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${letterFormat === 'metro2' ? 'bg-[hsl(var(--admin-accent))] text-white' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >Metro2</button>
                </div>
                {letterFormat === 'metro2' && (
                  <p className="text-[10px] text-[hsl(var(--admin-text-muted))] mt-1">Metro2 format uses bureau data field codes (K4, DA, etc.)</p>
                )}
              </div>
              <div className="p-3 rounded-lg bg-[hsl(var(--admin-accent))]/10 border border-[hsl(var(--admin-accent))]/30">
                <Label className="text-[hsl(var(--admin-accent))] font-medium text-sm mb-2 block">Target Bureaus</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBureauCount('single')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${bureauCount === 'single' ? 'bg-[hsl(var(--admin-accent))] text-white' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >1 Bureau</button>
                  <button
                    onClick={() => setBureauCount('all')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all ${bureauCount === 'all' ? 'bg-[hsl(var(--admin-accent))] text-white' : 'bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text-muted))] hover:text-white'}`}
                  >All 3</button>
                </div>
                {bureauCount === 'all' && (
                  <p className="text-[10px] text-[hsl(var(--admin-accent))]/70 mt-1">Sends to Experian, Equifax & TransUnion</p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))]">
              <h4 className="font-medium text-[hsl(var(--admin-text))] mb-2">Items to Dispute ({selectedItems.length})</h4>
              <div className="space-y-2 max-h-[150px] overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-center justify-between text-sm">
                    <span className="text-[hsl(var(--admin-text))]">{item.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))] capitalize">{item.type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            {generatedLetter && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-[hsl(var(--admin-text))]">Generated Letter Preview</h4>
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
                    className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))]"
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
                    className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
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
                className="border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))]"
                data-testid="button-cancel-generate"
              >
                Cancel
              </Button>
              <Button
                onClick={() => generateLetterMutation.mutate({ items: selectedItems, letterType, bureau: letterBureau, isFraud: isFraudDispute || letterType === 'fraud', format: letterFormat, bureauCount })}
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
                    className="flex-1 px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
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
                      className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
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
                      className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
                      data-testid="button-send-lob"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send via Certified Mail
                    </Button>
                  )}
                  {selectedLetter.lobId && (
                    <div className="text-xs text-[hsl(var(--admin-success))] flex items-center gap-1 px-2">
                      <CheckSquare className="h-3 w-3" />
                      Sent via Lob
                    </div>
                  )}
                  {selectedLetter.status === 'approved' && !selectedLetter.lobId && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { updateLetterMutation.mutate({ id: selectedLetter.id, status: 'sent' }); setViewLetterOpen(false); }}
                      className="text-[hsl(var(--admin-text-muted))] hover:text-white text-xs"
                      disabled={updateLetterMutation.isPending}
                      data-testid="button-mark-sent"
                    >
                      Mark Sent Manually
                    </Button>
                  )}
                  {(selectedLetter.status === 'sent' || selectedLetter.status === 'mailed') && selectedLetter.status !== 'removed' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setMarkRemovedAccountName('');
                        setMarkRemovedOpen(true);
                      }}
                      className="text-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-deep))] text-xs border border-[hsl(var(--admin-accent))]/30 hover:bg-[hsl(var(--admin-accent))]/10"
                      title="Bureau confirmed this item was removed — logs a pay-per-delete event"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Bureau Removed Item
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
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))] flex items-center gap-2">
              <Send className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Send via Certified Mail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-[hsl(var(--admin-accent))]/10 border border-[hsl(var(--admin-accent))]/30 p-3 text-xs text-[hsl(var(--admin-accent))]/80 space-y-1">
              <p className="font-medium text-[hsl(var(--admin-accent))]">Lob will print and mail this letter automatically.</p>
              <p className="text-[hsl(var(--admin-text-muted))]">
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
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                />
                <input
                  placeholder="Address line 1"
                  value={lobAddress.fromAddressLine1}
                  onChange={e => setLobAddress(a => ({ ...a, fromAddressLine1: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={lobAddress.fromAddressLine2}
                  onChange={e => setLobAddress(a => ({ ...a, fromAddressLine2: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="City"
                    value={lobAddress.fromCity}
                    onChange={e => setLobAddress(a => ({ ...a, fromCity: e.target.value }))}
                    className="col-span-1 px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                  />
                  <input
                    placeholder="State"
                    maxLength={2}
                    value={lobAddress.fromState}
                    onChange={e => setLobAddress(a => ({ ...a, fromState: e.target.value.toUpperCase() }))}
                    className="px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                  />
                  <input
                    placeholder="ZIP"
                    maxLength={10}
                    value={lobAddress.fromZip}
                    onChange={e => setLobAddress(a => ({ ...a, fromZip: e.target.value }))}
                    className="px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => sendLobMutation.mutate(lobAddress)}
                disabled={sendLobMutation.isPending || !lobAddress.fromName || !lobAddress.fromAddressLine1 || !lobAddress.fromCity || !lobAddress.fromState || !lobAddress.fromZip}
                className="flex-1 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
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

      {/* Mark Account Removed — Pay-Per-Delete Dialog */}
      <Dialog open={markRemovedOpen} onOpenChange={setMarkRemovedOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))] flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Log Bureau Removal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <p className="text-[hsl(var(--admin-text-muted))]">
              Record that the bureau confirmed removal of this disputed item. A pay-per-delete billing event will be created.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-[hsl(var(--admin-text-muted))]">Account / Item Name <span className="text-red-400">*</span></label>
              <input
                value={markRemovedAccountName}
                onChange={e => setMarkRemovedAccountName(e.target.value)}
                placeholder="e.g. ABC Medical Center Collections"
                className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Bureau</label>
                <div className="px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))]/50 border border-[hsl(var(--admin-border))] text-white/70 text-sm">
                  {selectedLetter?.bureau || '—'}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[hsl(var(--admin-text-muted))]">Billing Rate ($)</label>
                <input
                  type="number"
                  value={markRemovedRate}
                  onChange={e => setMarkRemovedRate(e.target.value)}
                  placeholder="99.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 rounded-md bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] text-white placeholder:text-[hsl(var(--admin-text-subtle))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">The billing rate will be remembered for this client's next removal.</p>
            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => {
                  if (!markRemovedAccountName.trim()) return;
                  if (!selectedLetter) return;
                  createDeletionEventMutation.mutate({
                    accountName: markRemovedAccountName.trim(),
                    billingRate: markRemovedRate || '99.00',
                    letterId: selectedLetter.id,
                  });
                }}
                disabled={createDeletionEventMutation.isPending || !markRemovedAccountName.trim()}
                className="flex-1 bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
              >
                {createDeletionEventMutation.isPending ? 'Logging...' : 'Confirm Removal'}
              </Button>
              <Button variant="outline" onClick={() => setMarkRemovedOpen(false)} className="border-[hsl(var(--admin-border))] text-white">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

// ============================================================
// LEADS CRM PAGE — Kanban pipeline for prospective clients
// ============================================================
const LEAD_STAGES = [
  { id: 'new', label: 'New Lead', color: 'border-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-accent))]/10' },
  { id: 'contacted', label: 'Contacted', color: 'border-[hsl(var(--admin-info))] bg-[hsl(var(--admin-info))]/10' },
  { id: 'consultation', label: 'Consultation', color: 'border-[hsl(var(--admin-border-accent))] bg-[hsl(var(--admin-bg))]/50' },
  { id: 'onboarded', label: 'Onboarded', color: 'border-[hsl(var(--admin-success))] bg-[hsl(var(--admin-success))]/10' },
  { id: 'archived', label: 'Archived', color: 'border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-bg))]/30' },
];

function LeadsCRMPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [newLead, setNewLead] = useState({ firstName: '', lastName: '', email: '', phone: '', source: 'website', creditScoreEstimate: '', notes: '' });

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/admin/leads'],
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: typeof newLead) => {
      const response = await apiRequest('POST', '/api/admin/leads', {
        ...data,
        creditScoreEstimate: data.creditScoreEstimate ? parseInt(data.creditScoreEstimate) : null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
      setAddLeadOpen(false);
      setNewLead({ firstName: '', lastName: '', email: '', phone: '', source: 'website', creditScoreEstimate: '', notes: '' });
      toast({ title: 'Lead added', description: 'New lead added to pipeline.' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add lead.', variant: 'destructive' }),
  });

  const moveLeadMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/leads/${id}`, { stage });
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] }),
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/admin/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'] });
      toast({ title: 'Lead removed' });
    },
  });

  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.stage === 'new').length;
  const onboardedCount = leads.filter(l => l.stage === 'onboarded').length;

  const daysInStage = (lead: Lead) => {
    const ref = lead.stageUpdatedAt || lead.createdAt;
    if (!ref) return 0;
    return Math.floor((Date.now() - new Date(ref).getTime()) / 86400000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <UserPlus className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Leads CRM
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage your prospective client pipeline.</p>
        </div>
        <Button onClick={() => setAddLeadOpen(true)} className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <AdminStatCard label="Total Leads" value={totalLeads} icon={<UserPlus className="h-5 w-5" />} />
        <AdminStatCard label="New Leads" value={newLeadsCount} icon={<ArrowRight className="h-5 w-5" />} />
        <AdminStatCard label="Onboarded" value={onboardedCount} icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {LEAD_STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage.id);
            return (
              <div key={stage.id} className={`w-64 rounded-xl border-2 p-3 ${stage.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{stage.label}</h3>
                  <span className="text-xs bg-[hsl(var(--admin-bg))]/50 text-[hsl(var(--admin-text-muted))] px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="bg-[hsl(var(--admin-card))] rounded-lg p-3 border border-[hsl(var(--admin-border))]">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{lead.firstName} {lead.lastName}</p>
                          <p className="text-[hsl(var(--admin-text-muted))] text-xs truncate">{lead.email}</p>
                          {lead.phone && <p className="text-[hsl(var(--admin-text-muted))] text-xs flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" />{lead.phone}</p>}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {lead.creditScoreEstimate && <span className="text-[hsl(var(--admin-accent))] text-xs">~{lead.creditScoreEstimate}</span>}
                            {lead.source && <span className="text-[10px] bg-[hsl(var(--admin-bg))]/70 text-[hsl(var(--admin-text-subtle))] px-1.5 py-0.5 rounded capitalize">{lead.source.replace('_', ' ')}</span>}
                            <span className="text-[10px] text-[hsl(var(--admin-text-subtle))]">{daysInStage(lead)}d in stage</span>
                          </div>
                        </div>
                        <button onClick={() => deleteLeadMutation.mutate(lead.id)} className="text-red-400/60 hover:text-red-400 flex-shrink-0">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <Select
                          value={lead.stage}
                          onValueChange={(val) => moveLeadMutation.mutate({ id: lead.id, stage: val })}
                        >
                          <SelectTrigger className="h-6 text-[10px] bg-[hsl(var(--admin-bg))]/60 border-[hsl(var(--admin-border))]/50 text-[hsl(var(--admin-text-muted))]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                            {LEAD_STAGES.map(s => (
                              <SelectItem key={s.id} value={s.id} className="text-xs">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-center py-6 text-[hsl(var(--admin-text-subtle))] text-xs">No leads</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Add New Lead
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">First Name</Label>
                <Input value={newLead.firstName} onChange={e => setNewLead(p => ({ ...p, firstName: e.target.value }))} placeholder="John" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Last Name</Label>
                <Input value={newLead.lastName} onChange={e => setNewLead(p => ({ ...p, lastName: e.target.value }))} placeholder="Doe" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Email</Label>
              <Input type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} placeholder="john@email.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Phone</Label>
                <Input value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Est. Credit Score</Label>
                <Input type="number" value={newLead.creditScoreEstimate} onChange={e => setNewLead(p => ({ ...p, creditScoreEstimate: e.target.value }))} placeholder="580" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Source</Label>
              <Select value={newLead.source} onValueChange={v => setNewLead(p => ({ ...p, source: v }))}>
                <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  {['website', 'referral', 'affiliate', 'cold_call', 'social', 'other'].map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Notes</Label>
              <Input value={newLead.notes} onChange={e => setNewLead(p => ({ ...p, notes: e.target.value }))} placeholder="Any relevant notes..." className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-[hsl(var(--admin-border))]">
              <Button variant="outline" onClick={() => setAddLeadOpen(false)} className="border-[hsl(var(--admin-border))] text-white">Cancel</Button>
              <Button
                onClick={() => createLeadMutation.mutate(newLead)}
                disabled={createLeadMutation.isPending || !newLead.firstName || !newLead.email}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
              >
                {createLeadMutation.isPending ? 'Adding...' : 'Add Lead'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// AFFILIATES PAGE — Manage affiliate partners and commissions
// ============================================================
function AffiliatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({ name: '', email: '', code: '', commissionType: 'flat', commissionRate: '25.00' });
  const [signupsAffiliateId, setSignupsAffiliateId] = useState<number | null>(null);
  const [logSignupOpen, setLogSignupOpen] = useState(false);
  const [logSignupAffId, setLogSignupAffId] = useState<number | null>(null);
  const [signupClientId, setSignupClientId] = useState('');
  const [signupPaymentAmount, setSignupPaymentAmount] = useState('');

  const { data: affiliates = [], isLoading } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates'],
  });

  const { data: signups = [] } = useQuery<AffiliateSignup[]>({
    queryKey: ['/api/admin/affiliates', signupsAffiliateId, 'signups'],
    queryFn: async () => {
      if (!signupsAffiliateId) return [];
      const res = await fetch(`/api/admin/affiliates/${signupsAffiliateId}/signups`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!signupsAffiliateId,
  });

  const createAffiliateMutation = useMutation({
    mutationFn: async (data: typeof newAffiliate) => {
      const response = await apiRequest('POST', '/api/admin/affiliates', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
      setAddOpen(false);
      setNewAffiliate({ name: '', email: '', code: '', commissionType: 'flat', commissionRate: '25.00' });
      toast({ title: 'Affiliate added successfully.' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to add affiliate.', variant: 'destructive' }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/affiliates/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] }),
  });

  const logSignupMutation = useMutation({
    mutationFn: async ({ affiliateId, userId, paymentAmount }: { affiliateId: number; userId: number; paymentAmount?: string }) => {
      const aff = affiliates.find(a => a.id === affiliateId);
      let commissionAmount: string;
      if (aff?.commissionType === 'percent' && paymentAmount) {
        commissionAmount = ((parseFloat(String(aff.commissionRate)) / 100) * parseFloat(paymentAmount)).toFixed(2);
      } else {
        commissionAmount = String(aff?.commissionRate || '25.00');
      }
      const response = await apiRequest('POST', `/api/admin/affiliates/${affiliateId}/signups`, {
        userId,
        commissionAmount,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates', logSignupAffId, 'signups'] });
      setLogSignupOpen(false);
      setSignupClientId('');
      setSignupPaymentAmount('');
      toast({ title: 'Client signup attributed to affiliate.' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to log signup.', variant: 'destructive' }),
  });

  const totalEarned = affiliates.reduce((sum, a) => sum + parseFloat(String(a.totalEarned || 0)), 0);
  const totalClients = affiliates.reduce((sum, a) => sum + (a.totalClients || 0), 0);
  const totalOwed = affiliates.reduce((sum, a) => {
    const owed = parseFloat(String(a.totalEarned || 0)) - parseFloat(String(a.totalPaid || 0));
    return sum + Math.max(0, owed);
  }, 0);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return 'AFF-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Share2 className="h-7 w-7 text-[hsl(var(--admin-accent))]" />
            Affiliate Program
          </h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage partners, referral codes, and commissions.</p>
        </div>
        <Button onClick={() => { setNewAffiliate(p => ({ ...p, code: generateCode() })); setAddOpen(true); }} className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Affiliate
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <AdminStatCard label="Total Affiliates" value={affiliates.length} icon={<Share2 className="h-5 w-5" />} />
        <AdminStatCard label="Clients Referred" value={totalClients} icon={<Users className="h-5 w-5" />} />
        <AdminStatCard label="Total Earned" value={`$${totalEarned.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
        <AdminStatCard label="Commission Owed" value={`$${totalOwed.toFixed(2)}`} icon={<AlertCircle className="h-5 w-5" />} color="red" />
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle icon={<Share2 className="h-5 w-5" />}>Affiliate Partners</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[hsl(var(--admin-text-muted))]">Loading affiliates...</div>
          ) : affiliates.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 text-[hsl(var(--admin-text-subtle))] mx-auto mb-3" />
              <p className="text-[hsl(var(--admin-text-muted))]">No affiliates yet. Add your first partner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[hsl(var(--admin-text-muted))] border-b border-[hsl(var(--admin-border))]">
                    <th className="text-left py-2 px-3 font-medium">Affiliate</th>
                    <th className="text-left py-2 px-3 font-medium">Code</th>
                    <th className="text-left py-2 px-3 font-medium">Commission</th>
                    <th className="text-left py-2 px-3 font-medium">Clients</th>
                    <th className="text-left py-2 px-3 font-medium">Earned</th>
                    <th className="text-left py-2 px-3 font-medium">Paid</th>
                    <th className="text-left py-2 px-3 font-medium text-red-400">Owed</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-left py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map(aff => {
                    const earned = parseFloat(String(aff.totalEarned || 0));
                    const paid = parseFloat(String(aff.totalPaid || 0));
                    const owed = Math.max(0, earned - paid);
                    return (
                      <tr key={aff.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--admin-bg))]/30">
                        <td className="py-3 px-3">
                          <p className="text-white font-medium">{aff.name}</p>
                          <p className="text-xs text-[hsl(var(--admin-text-muted))]">{aff.email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <code className="text-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-bg))]/50 px-2 py-0.5 rounded text-xs font-mono">{aff.code}</code>
                        </td>
                        <td className="py-3 px-3 text-white">
                          {aff.commissionType === 'flat' ? `$${parseFloat(String(aff.commissionRate)).toFixed(2)}` : `${parseFloat(String(aff.commissionRate)).toFixed(1)}%`}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => setSignupsAffiliateId(signupsAffiliateId === aff.id ? null : aff.id)}
                            className="text-white hover:text-[hsl(var(--admin-accent))] font-medium transition-colors flex items-center gap-1"
                          >
                            {aff.totalClients}
                            <Users className="h-3 w-3 opacity-60" />
                          </button>
                        </td>
                        <td className="py-3 px-3 text-green-400">${earned.toFixed(2)}</td>
                        <td className="py-3 px-3 text-[hsl(var(--admin-accent))]">${paid.toFixed(2)}</td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${owed > 0 ? 'text-red-400' : 'text-[hsl(var(--admin-text-subtle))]'}`}>${owed.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${aff.isActive ? 'bg-green-500/20 text-green-400' : 'bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))]'}`}>
                            {aff.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setLogSignupAffId(aff.id); setLogSignupOpen(true); }}
                              className="text-xs text-[hsl(var(--admin-accent))] hover:text-white transition-colors"
                            >
                              + Client
                            </button>
                            <span className="text-[hsl(var(--admin-border))]">|</span>
                            <button
                              onClick={() => toggleActiveMutation.mutate({ id: aff.id, isActive: !aff.isActive })}
                              className="text-xs text-[hsl(var(--admin-text-muted))] hover:text-white transition-colors"
                            >
                              {aff.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {signupsAffiliateId && (
                <div className="mt-4 p-4 bg-[hsl(var(--admin-bg))]/50 rounded-lg border border-[hsl(var(--admin-border))]/50">
                  <h4 className="text-sm font-semibold text-white mb-3">
                    Signups for {affiliates.find(a => a.id === signupsAffiliateId)?.name}
                  </h4>
                  {signups.length === 0 ? (
                    <p className="text-xs text-[hsl(var(--admin-text-muted))]">No signups recorded yet. Click "+ Client" to attribute a client.</p>
                  ) : (
                    <div className="space-y-2">
                      {signups.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-xs">
                          <span className="text-[hsl(var(--admin-text-muted))]">Client #{s.userId}</span>
                          <span className="text-green-400">${parseFloat(String(s.commissionAmount || 0)).toFixed(2)}</span>
                          <span className={s.commissionPaid ? 'text-[hsl(var(--admin-text-subtle))]' : 'text-[hsl(var(--admin-accent))]'}>{s.commissionPaid ? 'Paid' : 'Owed'}</span>
                          <span className="text-[hsl(var(--admin-text-subtle))]">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </AdminCardContent>
      </AdminCard>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Add Affiliate Partner
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Full Name</Label>
                <Input value={newAffiliate.name} onChange={e => setNewAffiliate(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Email</Label>
                <Input type="email" value={newAffiliate.email} onChange={e => setNewAffiliate(p => ({ ...p, email: e.target.value }))} placeholder="jane@example.com" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Referral Code</Label>
              <div className="flex gap-2">
                <Input value={newAffiliate.code} onChange={e => setNewAffiliate(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="AFF-XXXXXX" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm font-mono" />
                <Button size="sm" variant="outline" onClick={() => setNewAffiliate(p => ({ ...p, code: generateCode() }))} className="border-[hsl(var(--admin-border))] text-white h-8 px-3 text-xs">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Commission Type</Label>
                <Select value={newAffiliate.commissionType} onValueChange={v => setNewAffiliate(p => ({ ...p, commissionType: v }))}>
                  <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                    <SelectItem value="flat">Flat Amount ($)</SelectItem>
                    <SelectItem value="percent">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Rate</Label>
                <Input type="number" step="0.01" value={newAffiliate.commissionRate} onChange={e => setNewAffiliate(p => ({ ...p, commissionRate: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-[hsl(var(--admin-border))]">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="border-[hsl(var(--admin-border))] text-white">Cancel</Button>
              <Button
                onClick={() => createAffiliateMutation.mutate(newAffiliate)}
                disabled={createAffiliateMutation.isPending || !newAffiliate.name || !newAffiliate.email || !newAffiliate.code}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
              >
                {createAffiliateMutation.isPending ? 'Adding...' : 'Add Affiliate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logSignupOpen} onOpenChange={setLogSignupOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Attribute Client to Affiliate
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {(() => {
              const aff = affiliates.find(a => a.id === logSignupAffId);
              const isPercent = aff?.commissionType === 'percent';
              const computedCommission = isPercent && signupPaymentAmount
                ? ((parseFloat(String(aff!.commissionRate)) / 100) * parseFloat(signupPaymentAmount)).toFixed(2)
                : null;
              return (
                <>
                  <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                    Affiliate: <strong className="text-white">{aff?.name || '—'}</strong>
                    {' '} — Rate: <strong className="text-green-400">
                      {isPercent ? `${parseFloat(String(aff!.commissionRate)).toFixed(1)}%` : `$${parseFloat(String(aff?.commissionRate || 0)).toFixed(2)}`}
                    </strong>
                    {computedCommission && <span className="text-[hsl(var(--admin-text-muted))] ml-2">→ <strong className="text-green-400">${computedCommission}</strong> commission</span>}
                  </p>
                  <div>
                    <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Client User ID</Label>
                    <Input
                      type="number"
                      value={signupClientId}
                      onChange={e => setSignupClientId(e.target.value)}
                      placeholder="e.g. 42"
                      className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm"
                    />
                    <p className="text-[10px] text-[hsl(var(--admin-text-subtle))] mt-1">Find the client's ID on the Clients page.</p>
                  </div>
                  {isPercent && (
                    <div>
                      <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Client First Payment Amount ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={signupPaymentAmount}
                        onChange={e => setSignupPaymentAmount(e.target.value)}
                        placeholder="e.g. 199.00"
                        className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm"
                      />
                      <p className="text-[10px] text-[hsl(var(--admin-text-subtle))] mt-1">Commission = {parseFloat(String(aff?.commissionRate || 0)).toFixed(1)}% of this amount.</p>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end pt-2 border-t border-[hsl(var(--admin-border))]">
                    <Button variant="outline" onClick={() => setLogSignupOpen(false)} className="border-[hsl(var(--admin-border))] text-white">Cancel</Button>
                    <Button
                      onClick={() => logSignupMutation.mutate({ affiliateId: logSignupAffId!, userId: parseInt(signupClientId), paymentAmount: signupPaymentAmount || undefined })}
                      disabled={logSignupMutation.isPending || !signupClientId || !logSignupAffId || (isPercent && !signupPaymentAmount)}
                      className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent))]/90 text-white"
                    >
                      {logSignupMutation.isPending ? 'Logging...' : 'Log Signup'}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// PAY-PER-DELETE TAB — Track deletion events and billing
// ============================================================
function PayPerDeleteTab({ uploadId, report }: { uploadId: number; report: (CreditReportUpload & { clientName?: string }) | undefined | null }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clientId = report?.userId;

  const [addOpen, setAddOpen] = useState(false);
  const [defaultRate, setDefaultRate] = useState('99.00');
  const [newEvent, setNewEvent] = useState({ accountName: '', bureau: 'Experian', billingRate: '99.00' });

  // Fetch per-client billing rate from server
  const { data: billingRateData } = useQuery<{ payPerDeleteRate: string }>({
    queryKey: ['/api/admin/users', clientId, 'billing-rate'],
    queryFn: async () => {
      const resp = await fetch(`/api/admin/users/${clientId}/billing-rate`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
      });
      return resp.json();
    },
    enabled: !!clientId,
  });

  // Sync server rate to local state when loaded
  useEffect(() => {
    if (billingRateData?.payPerDeleteRate) {
      setDefaultRate(billingRateData.payPerDeleteRate);
    }
  }, [billingRateData?.payPerDeleteRate]);

  const saveRateMutation = useMutation({
    mutationFn: async (rate: string) => {
      const resp = await apiRequest('PATCH', `/api/admin/users/${clientId}/billing-rate`, { payPerDeleteRate: rate });
      return resp.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users', clientId, 'billing-rate'] });
      toast({ title: 'Billing rate saved', description: `Default rate set to $${data.payPerDeleteRate}/deletion` });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to save billing rate', variant: 'destructive' }),
  });

  const openAddDialog = () => {
    setNewEvent({ accountName: '', bureau: 'Experian', billingRate: defaultRate });
    setAddOpen(true);
  };

  const printInvoice = () => {
    if (events.length === 0) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Pay-Per-Delete Invoice</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{font-size:22px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f5f5f5}tfoot td{font-weight:bold}.unpaid{color:#c00}.paid{color:#080}</style>
      </head><body>
      <h1>Pay-Per-Delete Invoice</h1>
      <p><strong>Client:</strong> ${report?.clientName || `Client #${clientId}`}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <table>
        <thead><tr><th>Account</th><th>Bureau</th><th>Amount</th><th>Date Deleted</th><th>Status</th></tr></thead>
        <tbody>${events.map(e => `
          <tr>
            <td>${e.accountName}</td>
            <td>${e.bureau}</td>
            <td>$${parseFloat(String(e.billingRate)).toFixed(2)}</td>
            <td>${e.deletedAt ? new Date(e.deletedAt).toLocaleDateString() : '—'}</td>
            <td class="${e.isPaid ? 'paid' : 'unpaid'}">${e.isPaid ? 'PAID' : 'UNPAID'}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr><td colspan="2">Total</td><td>$${totalRevenue.toFixed(2)}</td><td></td><td class="paid">Collected: $${paidRevenue.toFixed(2)}</td></tr></tfoot>
      </table>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const { data: allEvents = [], isLoading } = useQuery<DeletionEvent[]>({
    queryKey: ['/api/admin/deletion-events', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const res = await fetch(`/api/admin/deletion-events/${clientId}`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch deletion events');
      return res.json();
    },
    enabled: !!clientId,
  });

  const events = uploadId ? allEvents.filter(e => e.uploadId === uploadId) : allEvents;

  const createMutation = useMutation({
    mutationFn: async (data: typeof newEvent) => {
      const response = await apiRequest('POST', '/api/admin/deletion-events', {
        clientId,
        uploadId: uploadId || null,
        accountName: data.accountName,
        bureau: data.bureau,
        billingRate: data.billingRate,
        isPaid: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deletion-events', clientId] });
      setAddOpen(false);
      setNewEvent({ accountName: '', bureau: 'Experian', billingRate: '99.00' });
      toast({ title: 'Deletion event logged.' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to log deletion event.', variant: 'destructive' }),
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      const response = await apiRequest('PATCH', `/api/admin/deletion-events/${id}`, {
        isPaid,
        billedAt: isPaid ? new Date().toISOString() : null,
      });
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/admin/deletion-events', clientId] }),
  });

  const totalRevenue = events.reduce((sum, e) => sum + parseFloat(String(e.billingRate || 0)), 0);
  const paidRevenue = events.filter(e => e.isPaid).reduce((sum, e) => sum + parseFloat(String(e.billingRate || 0)), 0);
  const unpaidRevenue = totalRevenue - paidRevenue;

  if (!clientId) {
    return (
      <AdminCard>
        <AdminCardContent>
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-[hsl(var(--admin-text-subtle))] mx-auto mb-3" />
            <p className="text-[hsl(var(--admin-text-muted))]">No client selected. Open this tab from a client's dispute hub.</p>
          </div>
        </AdminCardContent>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <AdminStatCard label="Items Deleted" value={events.length} icon={<CheckCircle className="h-5 w-5 text-green-400" />} />
        <AdminStatCard label="Total Billed" value={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 text-[hsl(var(--admin-accent))]" />} />
        <AdminStatCard label="Outstanding" value={`$${unpaidRevenue.toFixed(2)}`} icon={<AlertCircle className="h-5 w-5 text-red-400" />} />
      </div>

      <AdminCard>
        <AdminCardHeader>
          <div className="flex items-center justify-between w-full flex-wrap gap-2">
            <AdminCardTitle icon={<DollarSign className="h-5 w-5 text-[hsl(var(--admin-accent))]" />}>Pay-Per-Delete Billing Tracker</AdminCardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-[hsl(var(--admin-text-muted))]">Rate/item ($)</span>
                <Input
                  type="number"
                  step="0.01"
                  value={defaultRate}
                  onChange={e => setDefaultRate(e.target.value)}
                  className="h-7 w-20 text-xs bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-[hsl(var(--admin-success))] hover:text-[hsl(var(--admin-success))]/80 px-2"
                  disabled={saveRateMutation.isPending}
                  onClick={() => saveRateMutation.mutate(defaultRate)}
                  title="Save billing rate for this client"
                >
                  {saveRateMutation.isPending ? '...' : 'Save'}
                </Button>
              </div>
              <Button onClick={printInvoice} size="sm" variant="outline" disabled={events.length === 0} className="border-[hsl(var(--admin-border))] text-white h-7 text-xs">
                <Printer className="h-3 w-3 mr-1" /> Invoice
              </Button>
              <Button onClick={openAddDialog} size="sm" className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" /> Log Deletion
              </Button>
            </div>
          </div>
        </AdminCardHeader>
        <AdminCardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[hsl(var(--admin-text-muted))]">Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-[hsl(var(--admin-text-subtle))] mx-auto mb-3" />
              <p className="text-[hsl(var(--admin-text-muted))]">No deleted items logged yet. Log a deletion when a bureau confirms removal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[hsl(var(--admin-text-muted))] border-b border-[hsl(var(--admin-border))]">
                    <th className="text-left py-2 px-3 font-medium">Account</th>
                    <th className="text-left py-2 px-3 font-medium">Bureau</th>
                    <th className="text-left py-2 px-3 font-medium">Billing Rate</th>
                    <th className="text-left py-2 px-3 font-medium">Deleted</th>
                    <th className="text-left py-2 px-3 font-medium">Status</th>
                    <th className="text-left py-2 px-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <tr key={event.id} className="border-b border-[hsl(var(--admin-border))]/50 hover:bg-[hsl(var(--admin-bg))]/30">
                      <td className="py-3 px-3 text-white font-medium">{event.accountName}</td>
                      <td className="py-3 px-3 text-[hsl(var(--admin-text-muted))]">{event.bureau}</td>
                      <td className="py-3 px-3 text-[hsl(var(--admin-accent))] font-semibold">${parseFloat(String(event.billingRate)).toFixed(2)}</td>
                      <td className="py-3 px-3 text-[hsl(var(--admin-text-muted))] text-xs">
                        {event.deletedAt ? new Date(event.deletedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-3">
                        {event.isPaid ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => markPaidMutation.mutate({ id: event.id, isPaid: !event.isPaid })}
                          className={`text-xs px-3 py-1 rounded transition-colors ${
                            event.isPaid
                              ? 'bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-border))]/60'
                              : 'bg-[hsl(var(--admin-success))]/40 text-[hsl(var(--admin-success))]/90 hover:bg-[hsl(var(--admin-success))]/50'
                          }`}
                        >
                          {event.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paidRevenue > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
                  <span className="text-green-400 text-sm font-medium">Total Collected</span>
                  <span className="text-green-400 text-lg font-bold">${paidRevenue.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </AdminCardContent>
      </AdminCard>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[hsl(var(--admin-accent))]" />
              Log Deleted Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Account / Item Name</Label>
              <Input value={newEvent.accountName} onChange={e => setNewEvent(p => ({ ...p, accountName: e.target.value }))} placeholder="e.g. Capital One Collection" className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Bureau</Label>
              <Select value={newEvent.bureau} onValueChange={v => setNewEvent(p => ({ ...p, bureau: v }))}>
                <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  <SelectItem value="Experian">Experian</SelectItem>
                  <SelectItem value="Equifax">Equifax</SelectItem>
                  <SelectItem value="TransUnion">TransUnion</SelectItem>
                  <SelectItem value="All 3">All 3 Bureaus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[hsl(var(--admin-text-muted))] text-xs mb-1 block">Billing Rate ($)</Label>
              <Input type="number" step="0.01" value={newEvent.billingRate} onChange={e => setNewEvent(p => ({ ...p, billingRate: e.target.value }))} className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-white h-8 text-sm" />
            </div>
            <div className="flex gap-3 justify-end pt-2 border-t border-[hsl(var(--admin-border))]">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="border-[hsl(var(--admin-border))] text-white">Cancel</Button>
              <Button
                onClick={() => createMutation.mutate(newEvent)}
                disabled={createMutation.isPending || !newEvent.accountName}
                className="bg-[hsl(var(--admin-accent))] hover:bg-[hsl(var(--admin-accent-deep))] text-white"
              >
                {createMutation.isPending ? 'Logging...' : 'Log Deletion'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
