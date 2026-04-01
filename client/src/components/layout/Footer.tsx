import { Shield, Mail } from 'lucide-react'
import { Link } from 'wouter'

const linkRoutes: Record<string, string> = {
  'Privacy Policy': '/privacy-policy',
  'Terms of Service': '/terms',
}

export function Footer() {
  const cols = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Dashboard', 'Dispute IQ™', 'LoanBridge™', 'Credit Coach AI'],
    },
    {
      title: 'Business',
      links: ['White Label', 'API Access', 'Affiliate Program', 'Resellers', 'Enterprise'],
    },
    {
      title: 'Resources',
      links: ['Help Center', 'Blog', 'FCRA Guide', 'Dispute Templates', 'Credit Calculator'],
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service'],
    },
  ]

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-navy-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-8 h-6">
                <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-blue-500" />
                <div className="absolute left-3 top-0.5 w-5 h-5 rounded-full bg-gold-500 opacity-90" />
              </div>
              <span className="font-black text-white text-lg">ScoreShift</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              AI-powered credit repair that connects your dispute journey to loan approval.
            </p>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-400 shrink-0" />
                <span>FCRA Compliant · SOC2</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" />
                <span>support@scoreshift.io</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-4 tracking-wide">{col.title}</h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    {linkRoutes[link] ? (
                      <Link href={linkRoutes[link]} className="text-sm text-slate-400 hover:text-white transition-colors">
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © 2026 ScoreShift, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <a href="#" className="hover:text-slate-300 transition-colors">FCRA Notice</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
