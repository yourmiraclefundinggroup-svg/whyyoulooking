import { Link, useLocation } from 'wouter'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, Home,
  TrendingUp, Settings, LogOut, Sparkles
} from 'lucide-react'

interface SidebarProps {
  dark: boolean
  setDark: (v: boolean) => void
}

export function Sidebar({ dark }: SidebarProps) {
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Disputes', href: '/disputes', badge: '7' },
    { icon: Home, label: 'Loan Readiness', href: '/loan-readiness' },
    { icon: TrendingUp, label: 'Progress', href: '/dashboard' },
    { icon: Sparkles, label: 'Talk to Emma', href: '/dashboard' },
    { icon: Settings, label: 'Settings', href: '/dashboard' },
  ]

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col border-r border-slate-200 dark:border-white/8 z-40"
      style={{
        background: dark ? '#0F1E35' : '#FFFFFF',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-200 dark:border-white/8 shrink-0">
        <div className="relative w-8 h-6">
          <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-blue-600" />
          <div className="absolute left-3 top-0.5 w-5 h-5 rounded-full bg-gold-500 opacity-90" />
        </div>
        <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">ScoreShift</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-full" />
                )}
                <item.icon size={18} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User info at bottom */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-white/8 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-all cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">Marcus T.</div>
            <div className="text-xs text-slate-400 truncate">Personal Pro</div>
          </div>
          <LogOut size={16} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </motion.aside>
  )
}
