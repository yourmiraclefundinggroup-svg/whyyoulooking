import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BarChart3, DollarSign, AlertCircle, Settings, LogOut, Menu, X,
  ChevronRight, Plus, Search, Filter, Download, TrendingUp, Mail,
  CheckCircle, Clock, XCircle, Eye, EyeOff, Copy, Settings2, Shield,
  Zap, Globe, Package
} from 'lucide-react'
import { useUserContext } from '@/hooks/use-user-context'
import { useLocation } from 'wouter'

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
