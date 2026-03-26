import { Link } from 'wouter'
import { motion } from 'framer-motion'
import {
  Bot, Mail, Building2, Sparkles, Map, Trophy,
  Check, ArrowRight, Play, Star,
  Shield, Zap, ChevronRight
} from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'
import { PaymentCard3D } from '../components/ui/PaymentCard3D'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { StatCounter } from '../components/ui/StatCounter'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
}

const features = [
  {
    icon: Bot,
    title: 'Dispute IQ™',
    desc: 'AI writes a completely unique letter every round. No two ever identical. Bureaus can\'t flag it.',
    accent: 'blue',
    accentClass: 'bg-blue-100 text-blue-600',
    borderClass: 'border-l-blue-500',
  },
  {
    icon: Mail,
    title: 'Auto Certified Mail',
    desc: 'Letters printed, mailed, and tracked automatically via Lob.com. No post office trips. Ever.',
    accent: 'gold',
    accentClass: 'bg-gold-50 text-gold-600',
    borderClass: 'border-l-gold-500',
  },
  {
    icon: Shield,
    title: 'Metro2 Compliance Engine',
    desc: 'Every dispute letter is Metro2-formatted by default. Legally bulletproof, bureau-recognized, and AI-unique every single time.',
    accent: 'blue',
    accentClass: 'bg-blue-100 text-blue-600',
    borderClass: 'border-l-blue-500',
  },
  {
    icon: Building2,
    title: 'LoanBridge™',
    desc: 'Hit your target score and we connect you to DSCR lenders automatically. The finish line matters.',
    accent: 'green',
    accentClass: 'bg-green-50 text-green-600',
    borderClass: 'border-l-green-500',
  },
  {
    icon: Sparkles,
    title: 'Credit Coach AI',
    desc: '24/7 AI that has your full credit file. Ask anything at 2am. Get real answers, not FAQs.',
    accent: 'blue',
    accentClass: 'bg-blue-100 text-blue-600',
    borderClass: 'border-l-blue-500',
  },
  {
    icon: Map,
    title: 'ScoreMap™',
    desc: 'AI roadmap from your score today to loan approval. Week-by-week. Updates as you progress.',
    accent: 'gold',
    accentClass: 'bg-gold-50 text-gold-600',
    borderClass: 'border-l-gold-500',
  },
  {
    icon: Trophy,
    title: 'Victory Room™',
    desc: 'Celebrate every removal. Share your wins. Milestones you can show your family.',
    accent: 'green',
    accentClass: 'bg-green-50 text-green-600',
    borderClass: 'border-l-green-500',
  },
  {
    icon: Zap,
    title: 'Auto Marketing Engine™',
    desc: 'Set your ad budget. ScoreShift AI runs your Facebook, Google, and TikTok campaigns automatically. Clients come to you. — Coming Q2 2026',
    accent: 'gold',
    accentClass: 'bg-gold-50 text-gold-600',
    borderClass: 'border-l-gold-500',
  },
]

const testimonials = [
  {
    quote: 'My credit was 486 when I started, going through a divorce and struggling to get approved for anything. Now I\'m at 610 and just got approved for my own place. We\'re still working together to get me ready to buy a house next year. The advice and guidance has been incredible.',
    name: 'Olivia G.',
    location: 'Rebuilding After Divorce',
    score: '486 → 610',
    avatar: 'OG',
    color: 'bg-blue-600',
  },
  {
    quote: 'In less than 30 days, my credit score increased by 95 points. Ervin was professional, consistent, and kept me informed every step of the way. Truly awesome experience for my husband and I!',
    name: 'Orlandria Washington',
    location: 'New York, NY',
    score: '+95 pts',
    avatar: 'OW',
    color: 'bg-gold-500',
  },
  {
    quote: 'Went from 572 to 664 in 4 months. DSCR loan approved last week. ScoreShift is the real deal.',
    name: 'Marcus T.',
    location: 'Atlanta, GA',
    score: '+92 pts',
    avatar: 'MT',
    color: 'bg-green-600',
  },
]



const personalChecks = [
  'All 3 credit bureaus covered',
  'AI-unique dispute letters every round',
  'Automated certified mail via Lob.com',
  'ScoreMap™ week-by-week roadmap',
  'Credit Coach AI — 24/7 answers',
  'LoanBridge™ DSCR loan connection',
]

const businessChecks = [
  'Full white-label client portal',
  'Metro2 Compliance Engine — built in',
  'Dispute IQ™ for every client',
  'AutoCycle batch automation',
  'Affiliate revenue engine',
  'Voice AI lead qualifier',
  'API + Zapier integration',
]

export default function LandingPage() {
  const logos = ['Equifax Partners', 'FCRA Compliant', 'Lob.com', 'Stripe Secured', 'Anthropic AI']

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30 dark:opacity-15"
            style={{ background: 'radial-gradient(ellipse, #DBEAFE 0%, transparent 70%)' }} />
          <div className="absolute top-20 right-0 w-96 h-96 rounded-full opacity-20 dark:opacity-10"
            style={{ background: 'radial-gradient(ellipse, #FFFBEB 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy */}
            <motion.div
              variants={stagger}
              initial="initial"
              animate="animate"
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} className="inline-flex mb-6">
                <Badge variant="blue" size="md" className="gap-1.5">
                  <span className="text-gold-500">✦</span>
                  Trusted by 2,400+ clients · 16,000+ items removed
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-slate-900 dark:text-white mb-4"
              >
                Fix Your Credit.<br />
                <span className="gradient-text">Get Loan-Ready.</span>
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mb-8 leading-relaxed mx-auto lg:mx-0"
              >
                The only credit repair platform that connects your dispute journey directly to DSCR loan approval.
                AI-powered. Automated. Built for results.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                <Link to="/signup">
                  <Button variant="primary" size="lg">
                    Start Free Trial <ArrowRight size={18} />
                  </Button>
                </Link>
                <button className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-navy-700 border border-slate-200 dark:border-white/15 rounded-xl hover:bg-slate-50 dark:hover:bg-navy-600 transition-all shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <Play size={12} fill="white" className="text-white ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </motion.div>

              {/* Trust strip */}
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start">
                {['No credit card required', 'Results in 30 days', '3-day free trial'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-slate-400">
                    <Check size={14} className="text-green-500" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: 3D Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <PaymentCard3D />
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-100 dark:border-white/8"
          >
            {[
              { label: 'Clients Served', value: 2400, suffix: '+' },
              { label: 'Items Removed', value: 16000, suffix: '+' },
              { label: 'Avg Score Gain', value: 74, suffix: ' pts' },
              { label: 'Loan Approvals', value: 890, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-black text-3xl md:text-4xl text-slate-900 dark:text-white mb-1">
                  <StatCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── LOGOS BAR ─── */}
      <section className="py-10 bg-slate-50 dark:bg-navy-800 border-y border-slate-100 dark:border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Trusted by clients at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {logos.map((logo) => (
              <div
                key={logo}
                className="text-sm font-bold text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500 transition-colors cursor-default tracking-wide uppercase"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="py-24 bg-white dark:bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <Badge variant="blue" className="mb-4">Platform Features</Badge>
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">
              Everything You Need to Win
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Built for the serious credit repair journey. Every tool connects to your end goal: loan approval.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -3, boxShadow: '0 12px 35px rgba(59,130,246,0.12)' }}
                className={`bg-white dark:bg-navy-700 rounded-2xl p-6 border border-slate-200 dark:border-white/8 border-l-4 ${f.borderClass} shadow-sm transition-all`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.accentClass} flex items-center justify-center mb-4`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 bg-slate-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="green" className="mb-4">Simple Process</Badge>
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">
              Three Steps to Loan-Ready
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-green-400" />

            <motion.div
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  step: '01',
                  title: 'Upload Your Report',
                  desc: 'Upload your credit report. Our AI ScoreShifts it in seconds — identifying every dispute opportunity.',
                  color: 'bg-blue-600',
                  icon: '📄',
                },
                {
                  step: '02',
                  title: 'We Dispute Automatically',
                  desc: 'AI generates unique letters per bureau. Certified mail is printed and sent automatically via Lob.com.',
                  color: 'bg-blue-500',
                  icon: '✉️',
                },
                {
                  step: '03',
                  title: 'Score Up. Loan Approved.',
                  desc: 'Watch items get removed. Hit your target score. LoanBridge™ connects you to DSCR lenders.',
                  color: 'bg-green-600',
                  icon: '🏡',
                },
              ].map((step) => (
                <motion.div key={step.step} variants={fadeUp} className="text-center flex flex-col items-center">
                  <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center text-3xl mb-5 shadow-lg relative z-10`}>
                    {step.icon}
                  </div>
                  <div className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mb-2">
                    Step {step.step}
                  </div>
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DUAL AUDIENCE SPLIT ─── */}
      <section className="py-24 bg-white dark:bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">
              Built for You. Or Your Business.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-navy-700 rounded-2xl p-8 border border-slate-200 dark:border-white/8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-5 text-blue-600 text-2xl">
                👤
              </div>
              <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2">For You</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Fix your credit. Get loan-ready. Track every step.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {personalChecks.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
              <div className="flex items-end gap-2 mb-6">
                <span className="font-black text-4xl text-slate-900 dark:text-white">$29</span>
                <span className="text-slate-400 mb-1">/month</span>
              </div>
              <Link to="/signup">
                <Button variant="primary" fullWidth size="lg">Start Free Trial</Button>
              </Link>
            </motion.div>

            {/* Business */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-navy-800 dark:to-navy-700 rounded-2xl p-8 border border-slate-700 dark:border-white/15 shadow-lg hover:-translate-y-0.5 transition-all relative overflow-hidden"
            >
              {/* Gold accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600 rounded-t-2xl" />

              <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center mb-5 text-2xl border border-gold-500/30">
                🏢
              </div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black text-2xl text-white">For Your Business</h3>
                <Badge variant="gold" className="shrink-0">White Label</Badge>
              </div>
              <p className="text-slate-400 mb-6">Run a credit repair business on autopilot.</p>
              <ul className="flex flex-col gap-3 mb-8">
                {businessChecks.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check size={16} className="text-gold-500 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
              <div className="flex items-end gap-2 mb-2">
                <span className="font-black text-4xl text-white">$49</span>
                <span className="text-slate-400 mb-1">/month</span>
              </div>

              <Button variant="gold" fullWidth size="lg">
                Start White Label →
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-white dark:bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#F59E0B" className="text-gold-500" />
              ))}
            </div>
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 dark:text-white mb-4 tracking-tight">
              Real Results. Real People.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{ marginTop: i === 1 ? 20 : 0 }}
                className="bg-white dark:bg-navy-700 rounded-2xl p-6 border border-slate-200 dark:border-white/8 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} fill="#F59E0B" className="text-gold-500" />
                    ))}
                  </div>
                  <Badge variant="green" className="text-xs">{t.score}</Badge>
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING PREVIEW ─── */}
      <section className="py-24 bg-slate-50 dark:bg-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="blue" className="mb-4">Pricing</Badge>
            <h2 className="font-black text-4xl text-slate-900 dark:text-white mb-3 tracking-tight">Simple, Fair Pricing</h2>
            <p className="text-slate-500 dark:text-slate-400">Start free. Upgrade when ready. No contracts.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-5 mb-8"
          >
            {[
              { name: 'Personal Pro', price: '$29', popular: false, desc: 'For individuals fixing their credit', badge: null },
              { name: 'Business Pro', price: '$99', popular: true, desc: 'For credit repair professionals', badge: 'Most Popular' },
              { name: 'White Label', price: '$399', popular: false, desc: 'Your brand, powered by ScoreShift', badge: '🏆' },
            ].map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.popular
                    ? 'bg-blue-600 border-blue-500 shadow-glow-blue text-white'
                    : 'bg-white dark:bg-navy-700 border-slate-200 dark:border-white/8 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {plan.badge && (
                  <div className="mb-3">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${plan.popular ? 'bg-white/20 text-white' : 'bg-gold-50 text-gold-600 border border-gold-200'}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className={`font-bold text-lg mb-1 ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>{plan.desc}</p>
                <div className="flex items-end gap-1 mb-5">
                  <span className={`font-black text-4xl ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.price}</span>
                  <span className={`mb-1 text-sm ${plan.popular ? 'text-blue-200' : 'text-slate-400'}`}>/mo</span>
                </div>
                <Link to="/pricing">
                  <button className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    Get Started →
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center">
            <Link to="/pricing" className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:gap-2 transition-all text-sm">
              See all plans & features <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 60%, #F0FDF4 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue text-2xl">
              🚀
            </div>
            <h2 className="font-black text-4xl md:text-5xl text-slate-900 mb-4 tracking-tight">
              Ready to ScoreShift<br />Your Credit?
            </h2>
            <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Join 2,400+ clients already on their way to loan approval. Start free — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Start Free — No Credit Card <ArrowRight size={18} />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Talk to a Specialist
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield size={14} className="text-blue-400" />
                FCRA Compliant
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Check size={14} className="text-green-400" />
                SOC2 Certified
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Check size={14} className="text-green-400" />
                256-bit Encryption
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Zap size={14} className="text-gold-500" />
                Powered by Anthropic AI
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
