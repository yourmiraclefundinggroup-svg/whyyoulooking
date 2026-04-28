import { useState } from 'react'
import { Link } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { useTheme } from '@/components/theme-provider'

const LAUNCH_DATE = new Date('2026-06-01T00:00:00')

interface NavbarProps {
  variant?: 'light' | 'dark'
}

export function Navbar({ variant = 'light' }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const isPostLaunch = new Date() >= LAUNCH_DATE
  const isDark = variant === 'dark'

  const links = [
    { label: 'Features', href: '/#features' },
    { label: 'Credit Monitoring', href: '/#credit-monitoring' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'For Business', href: '/pricing#business' },
  ]

  return (
    <>
      {/* ─── LAUNCH ANNOUNCEMENT BAR ─── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white text-xs sm:text-sm py-2 px-4 text-center flex items-center justify-center gap-2">
        <Sparkles size={14} className="text-gold-300 shrink-0" />
        {isPostLaunch ? (
          <>
            <span className="font-semibold">
              🎉 Now live: <span className="text-gold-300 font-black">3-Bureau Credit Monitoring</span> powered by Array
            </span>
            <Link to="/pricing">
              <span className="hidden sm:inline ml-2 underline underline-offset-2 cursor-pointer hover:text-gold-200 transition-colors font-semibold">
                Get started →
              </span>
            </Link>
          </>
        ) : (
          <>
            <span className="font-semibold">
              🚀 Live 3-Bureau Credit Monitoring launches <span className="text-gold-300 font-black">June 1st</span>
            </span>
            <Link to="/pricing">
              <span className="hidden sm:inline ml-2 underline underline-offset-2 cursor-pointer hover:text-gold-200 transition-colors font-semibold">
                See what's included →
              </span>
            </Link>
          </>
        )}
      </div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={
          isDark
            ? 'fixed top-[36px] left-0 right-0 z-50 border-b navbar-dark'
            : 'fixed top-[36px] left-0 right-0 z-50 glass border-b border-slate-200/80 dark:border-white/10'
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="relative w-8 h-6">
                <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-blue-600" />
                <div className="absolute left-3 top-0.5 w-5 h-5 rounded-full bg-gold-500 opacity-90" />
              </div>
              <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>ScoreShift</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1 flex-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={
                    isDark
                      ? 'px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 rounded-lg transition-all'
                      : 'px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Dark mode toggle */}
              <button
                onClick={toggleTheme}
                className={
                  isDark
                    ? 'p-2 rounded-lg text-slate-400 hover:bg-white/8 transition-all'
                    : 'p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all dark:text-slate-400 dark:hover:bg-white/8'
                }
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Link
                to="/login"
                className={
                  isDark
                    ? 'hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/8 rounded-lg transition-all'
                    : 'hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300 dark:hover:bg-white/8'
                }
              >
                Sign In
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Start Free →
                </Button>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={
                  isDark
                    ? 'md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/8 transition-all'
                    : 'md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all'
                }
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={
                isDark
                  ? 'md:hidden border-t border-white/8 bg-[#050A14]'
                  : 'md:hidden border-t border-slate-200 bg-white dark:bg-navy-800 dark:border-white/8'
              }
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      isDark
                        ? 'px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/8 rounded-lg transition-all'
                        : 'px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300'
                    }
                  >
                    {link.label}
                  </Link>
                ))}
                <div className={`pt-3 border-t mt-2 flex flex-col gap-2 ${isDark ? 'border-white/8' : 'border-slate-200 dark:border-white/8'}`}>
                  <Link
                    to="/login"
                    className={`px-4 py-3 text-sm font-medium text-center rounded-xl border ${isDark ? 'text-slate-300 border-white/10' : 'text-slate-700 border-slate-200'}`}
                  >
                    Sign In
                  </Link>
                  <Link to="/signup">
                    <Button variant="primary" fullWidth>Start Free →</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
