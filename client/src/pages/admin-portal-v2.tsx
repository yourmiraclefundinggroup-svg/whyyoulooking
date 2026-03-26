import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, BarChart3, DollarSign, AlertCircle,
  Settings, LogOut, Menu, X, ChevronRight,
  Plus, Search, Filter, Download, TrendingUp,
  Mail, CheckCircle, Clock, XCircle
} from 'lucide-react'
import { useUserContext } from '@/hooks/use-user-context'
import { useLocation, useRoute } from 'wouter'

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
  trend: {
    clients: number
    revenue: number
  }
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

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const stagger = {
  animate: {
    transition: { staggerChildren: 0.05 }
  }
}

const sections: AdminSection[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'clients', label: 'Clients', icon: Users, badge: 847 },
  { id: 'disputes', label: 'Disputes', icon: Mail, badge: 142 },
  { id: 'reporting', label: 'Reporting', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// Mock data for initial load
const mockMetrics: ClientMetrics = {
  totalClients: 847,
  activeDisputes: 142,
  monthlyRevenue: 18940,
  itemsRemoved: 1247,
  trend: { clients: 12, revenue: 18 }
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Marcus Thompson',
    email: 'marcus@example.com',
    status: 'active',
    score: 664,
    scoreChange: 47,
    plan: 'Elite',
    joinedDate: '2026-02-15',
    itemsRemoved: 4,
    nextDispute: '2026-03-28'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    status: 'active',
    score: 712,
    scoreChange: 89,
    plan: 'Pro',
    joinedDate: '2026-01-20',
    itemsRemoved: 8,
    nextDispute: '2026-03-30'
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@example.com',
    status: 'active',
    score: 598,
    scoreChange: 23,
    plan: 'Pro',
    joinedDate: '2026-03-01',
    itemsRemoved: 2,
    nextDispute: '2026-03-27'
  },
]

export default function AdminPortalV2() {
  const { user, logout } = useUserContext()
  const [location, setLocation] = useLocation()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [metrics, setMetrics] = useState<ClientMetrics>(mockMetrics)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Extract section from URL
    const path = location.split('/').pop()
    if (path && sections.some(s => s.id === path)) {
      setActiveSection(path)
    }
  }, [location])

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 lg:relative lg:translate-x-0 lg:transition-none`}
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
                  onClick={() => {
                    setActiveSection(section.id)
                    setLocation(`/admin-portal/${section.id}`)
                  }}
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
              <div className="text-sm font-bold text-slate-900 dark:text-white">{user?.email}</div>
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

      {/* Mobile Sidebar Overlay */}
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
          {activeSection === 'dashboard' && (
            <DashboardView metrics={metrics} clients={clients} />
          )}
          {activeSection === 'clients' && (
            <ClientsView clients={filteredClients} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          )}
          {activeSection === 'disputes' && (
            <DisputesView />
          )}
          {activeSection === 'reporting' && (
            <ReportingView metrics={metrics} />
          )}
          {activeSection === 'settings' && (
            <SettingsView />
          )}
        </div>
      </div>
    </div>
  )
}

function DashboardView({ metrics, clients }: { metrics: ClientMetrics; clients: Client[] }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6 space-y-6"
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Clients</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{metrics.totalClients}</div>
              <div className="text-sm text-green-600 mt-1">+{metrics.trend.clients}% this month</div>
            </div>
            <Users className="w-10 h-10 text-blue-500/20" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Disputes</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{metrics.activeDisputes}</div>
              <div className="text-sm text-amber-600 mt-1">Awaiting response</div>
            </div>
            <Mail className="w-10 h-10 text-amber-500/20" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Monthly Revenue</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">${metrics.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-green-600 mt-1">+{metrics.trend.revenue}% vs last month</div>
            </div>
            <DollarSign className="w-10 h-10 text-green-500/20" />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Items Removed</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{metrics.itemsRemoved}</div>
              <div className="text-sm text-blue-600 mt-1">All time</div>
            </div>
            <CheckCircle className="w-10 h-10 text-blue-500/20" />
          </div>
        </motion.div>
      </div>

      {/* Recent Clients */}
      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Clients</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Credit Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Items Removed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {clients.slice(0, 5).map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{client.name}</div>
                      <div className="text-sm text-slate-500">{client.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-900 dark:text-white">{client.score}</div>
                      <div className="text-sm text-green-600">+{client.scoreChange}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full">
                      {client.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      client.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{client.itemsRemoved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ClientsView({ clients, searchQuery, setSearchQuery }: { clients: Client[]; searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6 space-y-6"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <motion.div
            key={client.id}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                <p className="text-sm text-slate-500">{client.email}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                client.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {client.status}
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
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Plan</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{client.plan}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Items Removed</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">{client.itemsRemoved}</div>
                </div>
              </div>

              <button className="w-full mt-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-medium text-sm transition-colors">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function DisputesView() {
  const disputes = [
    { id: '1', client: 'Marcus Thompson', item: 'Collection Account', status: 'mailed', daysLeft: 33, uspsTrackingId: '9400111899223456789012' },
    { id: '2', client: 'Sarah Johnson', item: 'Late Payment (2024)', status: 'responded', daysLeft: 0, uspsTrackingId: '9400111899223456790012' },
    { id: '3', client: 'David Chen', item: 'Charge-off', status: 'mailed', daysLeft: 28, uspsTrackingId: '9400111899223456791012' },
  ]

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6"
    >
      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Disputes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {disputes.map((dispute) => (
                <tr key={dispute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{dispute.client}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{dispute.item}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                      dispute.status === 'mailed'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {dispute.status === 'mailed' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {dispute.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">{dispute.daysLeft} days</td>
                  <td className="px-6 py-4">
                    <a href={`https://tools.usps.com/go/TrackConfirmAction_input?tLabels=${dispute.uspsTrackingId}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-mono text-sm">
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
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6 space-y-6"
    >
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Overview</h3>
            <Download className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-slate-600 dark:text-slate-400">This Month</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">${metrics.monthlyRevenue.toLocaleString()}</div>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full" style={{ width: '75%' }}></div>
            </div>
            <div className="text-sm text-slate-500">Target: $25,000</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth Metrics</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-slate-600 dark:text-slate-400 mb-2">New Clients</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">+{metrics.trend.clients}%</div>
            </div>
            <div>
              <div className="text-slate-600 dark:text-slate-400 mb-2">Revenue Growth</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">+{metrics.trend.revenue}%</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Performance by Plan</h3>
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
                <div className="text-sm text-green-600">+{plan.growth}% growth</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function SettingsView() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="p-6 space-y-6"
    >
      <motion.div variants={fadeUp} className="max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Account Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">Account Name</label>
              <input
                type="text"
                defaultValue="ScoreShift"
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

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">API Keys</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                  <div className="font-mono text-sm text-slate-600 dark:text-slate-400">ss_prod_...</div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">Regenerate</button>
                </div>
              </div>
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
