import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BarChart3, DollarSign, AlertCircle, Settings, LogOut, Menu, X,
  ChevronRight, Plus, Search, Filter, Download, TrendingUp, Mail,
  CheckCircle, Clock, XCircle, Eye, EyeOff, Copy, Settings2, Shield,
  Zap, Globe, Package, CreditCard, Inbox, Minus
} from 'lucide-react'
import { useUserContext } from '@/hooks/use-user-context'
import { useLocation } from 'wouter'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'

interface AdminSection {
  id: string
  label: string
  icon: any
  badge?: number
}

interface ClientMetrics {
  totalClients: number
  activeDisputes: number
  monthlyRevenue: number
  itemsRemoved: number
  trend: { clients: number; revenue: number }
  topPlan?: string
}

interface Client {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive' | 'paused'
  score: number
  scoreChange: number
  plan: string
  joinedDate: string
  itemsRemoved: number
  nextDispute?: string
}

interface Dispute {
  id: string
  clientName: string
  item: string
  status: 'mailed' | 'responded' | 'removed'
  daysLeft: number
  uspsTrackingId: string
  bureaus: string[]
}

interface TeamMember {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'support'
  joinedDate: string
  active: boolean
}

interface WhiteLabelConfig {
  brandName: string
  domain: string
  logoUrl?: string
  primaryColor: string
  supportEmail: string
  maxClients: number
  clientsUsed: number
  customBranding: boolean
  apiKey: string
}

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } }
}

const sections: AdminSection[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'clients', label: 'Clients', icon: Users, badge: 847 },
  { id: 'disputes', label: 'Disputes', icon: Mail, badge: 142 },
  { id: 'concierge', label: 'Concierge', icon: Shield },
  { id: 'mail-wallet', label: 'Mail Wallet', icon: Inbox },
  { id: 'reporting', label: 'Reporting', icon: TrendingUp },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'white-label', label: 'White Label', icon: Package },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// Mock data
const mockMetrics: ClientMetrics = {
  totalClients: 847,
  activeDisputes: 142,
  monthlyRevenue: 18940,
  itemsRemoved: 1247,
  trend: { clients: 12, revenue: 18 },
  topPlan: 'Elite'
}

const mockDisputes: Dispute[] = [
  { id: '1', clientName: 'Marcus T.', item: 'Collection', status: 'mailed', daysLeft: 33, uspsTrackingId: '9400111899223456789012', bureaus: ['Equifax', 'Experian'] },
  { id: '2', clientName: 'Sarah J.', item: 'Late Payment', status: 'responded', daysLeft: 0, uspsTrackingId: '9400111899223456790012', bureaus: ['TransUnion'] },
  { id: '3', clientName: 'David C.', item: 'Charge-off', status: 'mailed', daysLeft: 28, uspsTrackingId: '9400111899223456791012', bureaus: ['All 3'] },
]

const mockTeam: TeamMember[] = [
  { id: '1', email: 'admin@scoreshift.com', name: 'You', role: 'admin', joinedDate: '2026-01-15', active: true },
  { id: '2', email: 'support@scoreshift.com', name: 'Sarah Manager', role: 'manager', joinedDate: '2026-02-01', active: true },
  { id: '3', email: 'cs@scoreshift.com', name: 'David Support', role: 'support', joinedDate: '2026-02-15', active: true },
]

const mockWhiteLabelConfig: WhiteLabelConfig = {
  brandName: 'ScoreShift',
  domain: 'app.scoreshift.com',
  logoUrl: 'https://...',
  primaryColor: '#3B82F6',
  supportEmail: 'support@scoreshift.com',
  maxClients: 50,
  clientsUsed: 847,
  customBranding: true,
  apiKey: 'sk_live_...'
}

export default function AdminPortalV2Full() {
  const { user, logout } = useUserContext()
  const [location, setLocation] = useLocation()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState<ClientMetrics>(mockMetrics)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const path = location.split('/').pop()
    if (path && sections.some(s => s.id === path)) {
      setActiveSection(path)
    }
  }, [location])

  // Fetch data from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const clientsRes = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        const disputesRes = await fetch('/api/admin/all-disputes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        if (clientsRes.ok && disputesRes.ok) {
          const clients = await clientsRes.json()
          const disputes = await disputesRes.json()

          setMetrics({
            ...metrics,
            totalClients: clients.length,
            activeDisputes: disputes.filter((d: any) => d.status !== 'removed').length,
            itemsRemoved: disputes.filter((d: any) => d.status === 'removed').length
          })
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (activeSection === 'dashboard') {
      fetchMetrics()
    }
  }, [activeSection])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 lg:relative lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white">ScoreShift</div>
                <div className="text-xs text-slate-500">Admin Portal</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              return (
                <motion.button
                  key={section.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-4 border-blue-500'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{section.label}</span>
                  {section.badge && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded-full">
                      {section.badge}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-3">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">Logged in as</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white capitalize">
              {sections.find(s => s.id === activeSection)?.label}
            </h1>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' && <DashboardView metrics={metrics} disputes={mockDisputes} />}
          {activeSection === 'clients' && <ClientsView />}
          {activeSection === 'disputes' && <DisputesView disputes={mockDisputes} />}
          {activeSection === 'concierge' && <ConciergeAdminView />}
          {activeSection === 'mail-wallet' && <MailWalletAdminView />}
          {activeSection === 'reporting' && <ReportingView metrics={metrics} />}
          {activeSection === 'team' && <TeamManagementView team={mockTeam} />}
          {activeSection === 'white-label' && <WhiteLabelView config={mockWhiteLabelConfig} />}
          {activeSection === 'settings' && <SettingsView />}
        </div>
      </div>
    </div>
  )
}

function DashboardView({ metrics, disputes }: { metrics: ClientMetrics; disputes: Dispute[] }) {
  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="Total Clients" value={metrics.totalClients} trend={`+${metrics.trend.clients}%`} color="blue" />
        <MetricCard icon={Mail} label="Active Disputes" value={metrics.activeDisputes} trend="Awaiting" color="amber" />
        <MetricCard icon={DollarSign} label="Monthly Revenue" value={`$${metrics.monthlyRevenue.toLocaleString()}`} trend={`+${metrics.trend.revenue}%`} color="green" />
        <MetricCard icon={CheckCircle} label="Items Removed" value={metrics.itemsRemoved} trend="All time" color="blue" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Revenue Trend (30 days)</h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 72, 58, 81, 90, 78, 95].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg" style={{ height: `${(val / 100) * 100}%` }} />
            ))}
          </div>
          <div className="mt-4 text-sm text-slate-500">7-day moving average</div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Plan Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Pro</span>
                <span className="font-semibold text-slate-900 dark:text-white">280 (33%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '33%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">Elite</span>
                <span className="font-semibold text-slate-900 dark:text-white">113 (50%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gold-500 h-full" style={{ width: '50%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400">White Label</span>
                <span className="font-semibold text-slate-900 dark:text-white">2 (17%)</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full" style={{ width: '17%' }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Disputes */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Disputes</h2>
          <a href="#" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Days Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {disputes.slice(0, 5).map((dispute) => (
                <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{dispute.clientName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{dispute.item}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      dispute.status === 'removed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {dispute.status === 'removed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{dispute.daysLeft} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

function MetricCard({ icon: Icon, label, value, trend, color }: any) {
  return (
    <motion.div variants={fadeUp} className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{value}</div>
          <div className={`text-sm mt-1 ${color === 'green' ? 'text-green-600' : 'text-slate-500'}`}>{trend}</div>
        </div>
        <Icon className={`w-10 h-10 ${color === 'green' ? 'text-green-500/20' : 'text-blue-500/20'}`} />
      </div>
    </motion.div>
  )
}

function ClientsView() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        if (res.ok) {
          const data = await res.json()
          setClients(data.slice(0, 12))
        }
      } catch (error) {
        console.error('Error fetching clients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </motion.div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading clients...</div>
      ) : (
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

function ClientCard({ client }: { client: Client }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
          <p className="text-sm text-slate-500">{client.email}</p>
        </div>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
          Active
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Credit Score</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {client.score}
            <span className="text-sm text-green-600 ml-2">+{client.scoreChange}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Plan</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{client.plan}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold">Items Removed</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{client.itemsRemoved}</div>
          </div>
        </div>

        <button className="w-full mt-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm transition-colors">
          View Details
        </button>
      </div>
    </motion.div>
  )
}

function DisputesView({ disputes }: { disputes: Dispute[] }) {
  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6">
      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Disputes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Bureaus</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{dispute.clientName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{dispute.item}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{dispute.bureaus.join(', ')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      dispute.status === 'removed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{dispute.daysLeft}</td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-mono">
                      {dispute.uspsTrackingId.substring(0, 10)}...
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ReportingView({ metrics }: { metrics: ClientMetrics }) {
  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Revenue This Month</h3>
            <Download className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">${metrics.monthlyRevenue.toLocaleString()}</div>
          <div className="text-sm text-green-600 mt-2">+18% from last month</div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Items Removed</h3>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics.itemsRemoved}</div>
          <div className="text-sm text-slate-500 mt-2">All time total</div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Active Clients</h3>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics.totalClients}</div>
          <div className="text-sm text-green-600 mt-2">+12% this month</div>
        </motion.div>
      </div>

      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Performance by Plan</h3>
        <div className="space-y-4">
          {[
            { name: 'Pro', revenue: 8200, clients: 280, growth: 14 },
            { name: 'Elite', revenue: 9740, clients: 113, growth: 22 },
            { name: 'White Label', revenue: 1000, clients: 2, growth: 5 },
          ].map((plan) => (
            <div key={plan.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{plan.name}</div>
                <div className="text-sm text-slate-500">{plan.clients} clients</div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900 dark:text-white">${plan.revenue.toLocaleString()}</div>
                <div className="text-sm text-green-600">+{plan.growth}%</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function TeamManagementView({ team }: { team: TeamMember[] }) {
  const [members, setMembers] = useState(team)

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Team Members</h2>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Member
        </button>
      </motion.div>

      <motion.div variants={stagger} className="space-y-3">
        {members.map((member) => (
          <motion.div key={member.id} variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-sm text-slate-500">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">
                  {member.role}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  member.active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Settings2 className="w-5 h-5 text-slate-500" />
            </button>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function WhiteLabelView({ config }: { config: WhiteLabelConfig }) {
  const [showKey, setShowKey] = useState(false)

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      <motion.div variants={fadeUp} className="max-w-3xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">White Label Configuration</h2>

          <div className="space-y-6">
            {/* Branding */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Brand Name</label>
              <input
                type="text"
                defaultValue={config.brandName}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Custom Domain</label>
              <input
                type="text"
                defaultValue={config.domain}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue={config.primaryColor}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  defaultValue={config.primaryColor}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Support Email</label>
              <input
                type="email"
                defaultValue={config.supportEmail}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Client Limits */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Client Capacity</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="text-slate-600 dark:text-slate-400">Clients Used</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  {config.clientsUsed} / {config.maxClients}
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full" style={{ width: `${(config.clientsUsed / config.maxClients) * 100}%` }} />
              </div>
              <div className="text-sm text-slate-500 mt-2">{Math.ceil((config.clientsUsed / config.maxClients) * 100)}% capacity used</div>
            </div>

            {/* API Key */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">API Key</h3>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                <input
                  type={showKey ? 'text' : 'password'}
                  defaultValue={config.apiKey}
                  className="flex-1 bg-transparent font-mono text-sm text-slate-900 dark:text-white outline-none"
                  readOnly
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SettingsView() {
  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6">
      <motion.div variants={fadeUp} className="max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Account Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Account Name</label>
              <input
                type="text"
                defaultValue="ScoreShift Admin"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@scoreshift.com"
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Mail Wallet Admin View ───────────────────────────────────────────────────

interface AdminWalletRow {
  id: number
  userId: number
  balance: number
  updatedAt: string
  user: { id: number; firstName: string; lastName: string; email: string }
  lettersCount: number
}

// ─── Concierge Admin View ────────────────────────────────────────────────────

interface ConciergeRow {
  id: number
  userId: number
  packageType: string
  paymentOption: string
  totalPriceCents: number
  amountPaidCents: number
  momentumMonths: number
  contractStatus: string
  signedAt: string | null
  serviceStartedAt: string | null
  serviceCompletedAt: string | null
  momentumUnlockedAt: string | null
  paymentSchedule: any[]
  signatureName: string | null
  adminNotes: string | null
  createdAt: string
  clientFirstName: string
  clientLastName: string
  clientEmail: string
  clientState: string | null
  user: { id: number; firstName: string; lastName: string; email: string }
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  draft: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
  pending_signature: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400' },
  signed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-400' },
  active: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400' },
  completed: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-400' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-400' },
}

const PKG_LABELS: Record<string, string> = {
  'fast-track': 'Fast-Track ($800)',
  'rush': 'Fast-Track Rush ($1,500)',
  'elite': 'Fast-Track Elite ($2,500)',
}

function ConciergeAdminView() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ConciergeRow | null>(null)
  const [contractText, setContractText] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [showContract, setShowContract] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [markingActive, setMarkingActive] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [paymentIdx, setPaymentIdx] = useState<number | null>(null)
  const [recordingPayment, setRecordingPayment] = useState(false)

  const { data: contracts = [], isLoading } = useQuery<ConciergeRow[]>({
    queryKey: ['/api/admin/concierge'],
  })

  const filtered = contracts.filter(c => {
    const q = search.toLowerCase()
    return (
      `${c.user.firstName} ${c.user.lastName}`.toLowerCase().includes(q) ||
      c.user.email.toLowerCase().includes(q) ||
      c.packageType.includes(q) ||
      c.contractStatus.includes(q)
    )
  })

  const activeCount = contracts.filter(c => c.contractStatus === 'active').length
  const completedCount = contracts.filter(c => c.contractStatus === 'completed').length
  const totalRevenue = contracts.reduce((s, c) => s + (c.amountPaidCents || 0), 0)

  async function openDetail(row: ConciergeRow) {
    setSelected(row)
    setNotes(row.adminNotes || '')
    setShowContract(false)
    setContractText('')
  }

  async function loadContractText() {
    if (!selected) return
    setLoadingText(true)
    try {
      const token = localStorage.getItem('auth_token')
      const r = await fetch(`/api/admin/concierge/${selected.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await r.json()
      setContractText(data.contractText || '')
      setShowContract(true)
    } finally {
      setLoadingText(false)
    }
  }

  async function markActive() {
    if (!selected) return
    setMarkingActive(true)
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/admin/concierge/${selected.userId}/mark-active`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      qc.invalidateQueries({ queryKey: ['/api/admin/concierge'] })
      setSelected(prev => prev ? { ...prev, contractStatus: 'active' } : null)
    } finally { setMarkingActive(false) }
  }

  async function markComplete() {
    if (!selected) return
    setMarkingComplete(true)
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/admin/concierge/${selected.userId}/mark-complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      qc.invalidateQueries({ queryKey: ['/api/admin/concierge'] })
      setSelected(prev => prev ? { ...prev, contractStatus: 'completed', momentumUnlockedAt: new Date().toISOString() } : null)
    } finally { setMarkingComplete(false) }
  }

  async function saveNotes() {
    if (!selected) return
    setSavingNotes(true)
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/admin/concierge/${selected.userId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes }),
      })
      qc.invalidateQueries({ queryKey: ['/api/admin/concierge'] })
    } finally { setSavingNotes(false) }
  }

  async function recordPayment(idx: number, amountCents: number) {
    if (!selected) return
    setRecordingPayment(true)
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`/api/admin/concierge/${selected.userId}/mark-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ installmentIndex: idx, amountCents }),
      })
      qc.invalidateQueries({ queryKey: ['/api/admin/concierge'] })
      setSelected(prev => {
        if (!prev) return null
        const sched = [...(prev.paymentSchedule || [])]
        if (sched[idx]) sched[idx] = { ...sched[idx], paid: true }
        return { ...prev, paymentSchedule: sched, amountPaidCents: (prev.amountPaidCents || 0) + amountCents }
      })
      setPaymentIdx(null)
    } finally { setRecordingPayment(false) }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Concierge Contracts</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage Concierge client agreements, service status, and Momentum unlocks.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Contracts', value: contracts.length, icon: '📋' },
          { label: 'Active Service', value: activeCount, icon: '⚡' },
          { label: 'Completed', value: completedCount, icon: '✅' },
          { label: 'Total Revenue', value: `$${(totalRevenue / 100).toLocaleString()}`, icon: '💰' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
              </div>
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={`flex gap-6 ${selected ? 'flex-col lg:flex-row' : ''}`}>
        {/* Table */}
        <div className={selected ? 'lg:w-1/2' : 'w-full'}>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search clients, packages, status…"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-slate-400">Loading contracts…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-3xl mb-3">📋</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{search ? 'No matching contracts' : 'No concierge contracts yet'}</div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(row => {
                  const statusCls = STATUS_COLORS[row.contractStatus] || STATUS_COLORS.draft
                  const paidPct = row.totalPriceCents > 0 ? Math.round((row.amountPaidCents / row.totalPriceCents) * 100) : 0
                  return (
                    <div
                      key={row.id}
                      onClick={() => openDetail(row)}
                      className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selected?.id === row.id ? 'bg-amber-50/60 dark:bg-amber-900/10 border-l-2 border-amber-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                            {row.user.firstName} {row.user.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.user.email}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{PKG_LABELS[row.packageType] || row.packageType}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCls.bg} ${statusCls.text}`}>
                            {row.contractStatus.replace(/_/g, ' ')}
                          </span>
                          <div className="text-xs text-slate-500">{paidPct}% paid</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="lg:w-1/2 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-bold text-lg text-slate-900 dark:text-white">{selected.user.firstName} {selected.user.lastName}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{selected.user.email}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">✕</button>
              </div>

              {/* Status + actions */}
              <div className="flex flex-wrap gap-2 mb-4">
                {(() => { const s = STATUS_COLORS[selected.contractStatus] || STATUS_COLORS.draft; return (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>{selected.contractStatus.replace(/_/g,'  ')}</span>
                )})()}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Package', value: PKG_LABELS[selected.packageType] || selected.packageType },
                  { label: 'Payment', value: selected.paymentOption === 'full' ? 'Full Payment' : 'Flexible Pay' },
                  { label: 'Total', value: `$${(selected.totalPriceCents / 100).toLocaleString()}` },
                  { label: 'Paid', value: `$${((selected.amountPaidCents || 0) / 100).toLocaleString()}` },
                  { label: 'Momentum', value: `${selected.momentumMonths} months` },
                  { label: 'Signed', value: selected.signedAt ? new Date(selected.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</div>
                  </div>
                ))}
              </div>

              {/* Signature */}
              {selected.signatureName && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">E-Signature</div>
                  <div className="text-base" style={{ fontFamily: 'cursive', color: '#7B6AAB' }}>{selected.signatureName}</div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.contractStatus !== 'active' && selected.contractStatus !== 'completed' && (
                  <button
                    onClick={markActive}
                    disabled={markingActive}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {markingActive ? 'Activating…' : 'Mark Service Active'}
                  </button>
                )}
                {selected.contractStatus === 'active' && (
                  <button
                    onClick={markComplete}
                    disabled={markingComplete}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    {markingComplete ? 'Completing…' : 'Mark Complete + Unlock Momentum'}
                  </button>
                )}
                {selected.contractStatus === 'completed' && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-lg border border-purple-200 dark:border-purple-800">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Momentum Unlocked {selected.momentumMonths}mo
                  </div>
                )}
                <button
                  onClick={loadingText ? undefined : loadContractText}
                  disabled={loadingText}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {loadingText ? 'Loading…' : 'View Contract'}
                </button>
              </div>

              {/* Payment schedule */}
              {selected.paymentSchedule && selected.paymentSchedule.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Payment Schedule</div>
                  <div className="flex flex-col gap-2">
                    {selected.paymentSchedule.map((p: any, i: number) => (
                      <div key={i} className={`flex items-center justify-between p-3 rounded-lg border text-sm ${p.paid ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">{p.label}</div>
                          <div className="text-xs text-slate-400">{p.dueDate ? new Date(p.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">${(p.amountCents / 100).toFixed(0)}</span>
                          {p.paid ? (
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Paid</span>
                          ) : (
                            <button
                              onClick={() => paymentIdx === i ? recordPayment(i, p.amountCents) : setPaymentIdx(i)}
                              disabled={recordingPayment}
                              className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 transition-colors"
                            >
                              {paymentIdx === i && recordingPayment ? 'Recording…' : paymentIdx === i ? 'Confirm?' : 'Mark Paid'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin notes */}
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Admin Notes</div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes about this client's case…"
                  className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="mt-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  {savingNotes ? 'Saving…' : 'Save Notes'}
                </button>
              </div>
            </div>

            {/* Contract text panel */}
            {showContract && contractText && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">Contract Document</div>
                  <button onClick={() => setShowContract(false)} className="text-slate-400 hover:text-slate-600 text-sm">Hide</button>
                </div>
                <pre className="text-xs font-mono text-slate-600 dark:text-slate-300 whitespace-pre-wrap overflow-auto max-h-80 bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 leading-relaxed">
                  {contractText}
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(contractText)}
                  className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Copy className="w-3 h-3" /> Copy Contract
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MailWalletAdminView() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [adjustUserId, setAdjustUserId] = useState<number | null>(null)
  const [adjustCredits, setAdjustCredits] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState('')
  const [detailUserId, setDetailUserId] = useState<number | null>(null)

  const { data: wallets = [], isLoading } = useQuery<AdminWalletRow[]>({
    queryKey: ['/api/admin/mail-wallet'],
  })

  const { data: detail } = useQuery<{
    wallet: { balance: number }
    transactions: { id: number; type: string; credits: number; balanceAfter: number; description: string; createdAt: string }[]
    letters: { id: number; letterName: string; recipient: string; status: string; trackingNumber: string | null; mailedAt: string | null; creditsUsed: number }[]
  }>({
    queryKey: ['/api/admin/mail-wallet', detailUserId],
    enabled: detailUserId !== null,
  })

  const filtered = wallets.filter(w => {
    const q = search.toLowerCase()
    return (
      !q ||
      w.user.firstName.toLowerCase().includes(q) ||
      w.user.lastName.toLowerCase().includes(q) ||
      w.user.email.toLowerCase().includes(q)
    )
  })

  const totalCredits = wallets.reduce((s, w) => s + w.balance, 0)
  const totalLetters = wallets.reduce((s, w) => s + w.lettersCount, 0)

  async function submitAdjustment() {
    if (!adjustUserId) return
    const n = parseInt(adjustCredits)
    if (isNaN(n) || n === 0) { setAdjustError('Enter a non-zero number'); return }
    if (!adjustReason.trim()) { setAdjustError('Reason is required'); return }
    setAdjusting(true)
    setAdjustError('')
    try {
      await apiRequest('POST', `/api/admin/mail-wallet/${adjustUserId}/adjust`, {
        credits: n,
        reason: adjustReason.trim(),
      })
      qc.invalidateQueries({ queryKey: ['/api/admin/mail-wallet'] })
      if (detailUserId === adjustUserId) qc.invalidateQueries({ queryKey: ['/api/admin/mail-wallet', adjustUserId] })
      setAdjustUserId(null)
      setAdjustCredits('')
      setAdjustReason('')
    } catch (e: any) {
      setAdjustError(e.message || 'Failed to adjust credits')
    } finally {
      setAdjusting(false)
    }
  }

  const statusColor: Record<string, string> = {
    QUEUED: '#8b8fa8', MAILED: '#4f6ef7', IN_TRANSIT: '#f59e0b',
    DELIVERED: '#10b981', RETURNED: '#ef4444', FAILED: '#ef4444',
  }

  return (
    <motion.div initial="initial" animate="animate" variants={stagger} className="p-6 space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mail Wallet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage certified mail credits for all clients</p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Accounts', value: wallets.length, icon: <Users className="w-5 h-5" />, color: 'text-blue-600' },
          { label: 'Total Credits Held', value: totalCredits, icon: <CreditCard className="w-5 h-5" />, color: 'text-emerald-600' },
          { label: 'Letters Mailed', value: totalLetters, icon: <Inbox className="w-5 h-5" />, color: 'text-violet-600' },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className={`${card.color} mb-2`}>{card.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Adjustment modal */}
      {adjustUserId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adjust Credits</h3>
              <button onClick={() => { setAdjustUserId(null); setAdjustError('') }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              For: <strong className="text-slate-900 dark:text-white">
                {wallets.find(w => w.userId === adjustUserId)?.user.firstName} {wallets.find(w => w.userId === adjustUserId)?.user.lastName}
              </strong>
              {' · '}Current balance: <strong>{wallets.find(w => w.userId === adjustUserId)?.balance ?? '—'}</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1 block">
                  Credits (+ to add, − to remove)
                </label>
                <input
                  type="number"
                  value={adjustCredits}
                  onChange={e => setAdjustCredits(e.target.value)}
                  placeholder="e.g. 5 or -2"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-1 block">
                  Reason
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="e.g. Courtesy credit, refund, etc."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              {adjustError && <p className="text-red-500 text-xs">{adjustError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setAdjustUserId(null); setAdjustError('') }}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAdjustment}
                  disabled={adjusting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                >
                  {adjusting ? 'Saving…' : 'Apply Adjustment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      {detailUserId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {wallets.find(w => w.userId === detailUserId)?.user.firstName} {wallets.find(w => w.userId === detailUserId)?.user.lastName}
                </h3>
                <p className="text-sm text-slate-500">{wallets.find(w => w.userId === detailUserId)?.user.email}</p>
              </div>
              <button onClick={() => setDetailUserId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              {!detail ? (
                <div className="text-center py-8 text-slate-400">Loading…</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Balance</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{detail.wallet.balance} credits</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Letters Mailed</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{detail.letters.length}</div>
                    </div>
                  </div>

                  {detail.letters.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mail History</h4>
                      <div className="space-y-2">
                        {detail.letters.slice(0, 10).map(l => (
                          <div key={l.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{l.letterName}</div>
                              <div className="text-xs text-slate-500">To: {l.recipient} · {l.creditsUsed} credit{l.creditsUsed !== 1 ? 's' : ''}</div>
                              {l.trackingNumber && <div className="text-xs text-blue-500 font-mono mt-0.5">{l.trackingNumber}</div>}
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: (statusColor[l.status] || '#8b8fa8') + '18', color: statusColor[l.status] || '#8b8fa8' }}>
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail.transactions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transaction Log</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-600">
                              {['Date', 'Description', 'Credits', 'Balance'].map(h => (
                                <th key={h} className="text-left py-2 px-2 text-xs text-slate-500 uppercase tracking-wide font-semibold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {detail.transactions.map(t => (
                              <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700">
                                <td className="py-2 px-2 text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{t.description}</td>
                                <td className="py-2 px-2 font-semibold" style={{ color: t.credits > 0 ? '#10b981' : '#ef4444' }}>
                                  {t.credits > 0 ? '+' : ''}{t.credits}
                                </td>
                                <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{t.balanceAfter}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setAdjustUserId(detailUserId); setDetailUserId(null) }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Adjust Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client list */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-slate-400">Loading wallets…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            {wallets.length === 0 ? 'No mail wallets yet. They are created when a client visits their Mail Wallet page.' : 'No results'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {['Client', 'Email', 'Balance', 'Letters Sent', 'Last Activity', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{row.user.firstName} {row.user.lastName}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{row.user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${row.balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {row.balance} credit{row.balance !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{row.lettersCount}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(row.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDetailUserId(row.userId)}
                          className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        <button
                          onClick={() => setAdjustUserId(row.userId)}
                          className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" /> Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
