import { useState } from 'react'
import { Link } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { Button } from '../ui/Button'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(false)

  const links = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'For Business', href: '/pricing#business' },
    { label: 'Resources', href: '/#resources' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/80 dark:border-white/8"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-8 h-6">
              <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-blue-600" />
              <div className="absolute left-3 top-0.5 w-5 h-5 rounded-full bg-gold-500 opacity-90" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tight dark:text-white">ScoreShift</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1 flex-1">
            {links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-all dark:text-slate-400 dark:hover:bg-white/8"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300 dark:hover:bg-white/8"
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
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
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
            className="md:hidden border-t border-slate-200 bg-white dark:bg-navy-800 dark:border-white/8"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-all dark:text-slate-300"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-200 dark:border-white/8 mt-2 flex flex-col gap-2">
                <Link to="/login" className="px-4 py-3 text-sm font-medium text-center text-slate-700 border border-slate-200 rounded-xl">Sign In</Link>
                <Link to="/signup">
                  <Button variant="primary" fullWidth>Start Free →</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
