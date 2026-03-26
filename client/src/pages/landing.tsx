import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Mail, Building2, MessageSquare, Map, Trophy, Star, TrendingUp, Shield, ArrowRight, X } from "lucide-react";
import { PaymentCard3D } from "@/components/ui/payment-card-3d";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#050A14" }}>
      {/* === PUBLIC NAVIGATION === */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b"
        style={{
          background: "rgba(5,10,20,0.85)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
                style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
              >
                SS
              </div>
              <span className="text-white font-bold text-lg tracking-tight">ScoreShift</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors">Features</a>
              <Link href="/pricing"><span className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">Pricing</span></Link>
              <a href="#business" className="text-slate-400 hover:text-white text-sm transition-colors">For Business</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold glow-gold">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* === HERO SECTION === */}
      <section
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden grid-bg"
      >
        {/* Ambient orbs */}
        <div
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl pointer-events-none animate-pulse-slow"
          style={{ background: "rgba(245,158,11,0.05)" }}
        />
        <div
          className="absolute bottom-40 left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none animate-float"
          style={{ background: "rgba(96,165,250,0.05)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(245,158,11,0.02)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          {/* Announcement badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Now with Dispute IQ™ — AI letters bureaus can't flag
          </div>

          {/* Main headline */}
          <h1
            className="text-6xl md:text-8xl font-black text-white tracking-tight leading-none mb-6"
          >
            Fix Your Credit.<br />
            <span className="gradient-text">Get Loan Ready.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            ScoreShift is the only credit repair platform that connects your repair journey directly to DSCR loan approval. AI-powered. Automated. Built for results.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 h-14 text-lg glow-gold"
              >
                Start Free Trial →
              </Button>
            </Link>
            <a href="#features">
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 px-8 h-14 text-lg"
              >
                See How It Works
              </Button>
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 md:gap-8 text-slate-500 text-sm flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 3-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime</span>
          </div>

          {/* Hero visual */}
          <div className="relative mt-20 flex items-center justify-center">
            {/* Floating stat chips */}
            <div
              className="absolute -left-4 md:left-8 top-4 z-10 animate-stat-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 backdrop-blur-sm"
            >
              <div className="text-emerald-400 font-bold text-sm">+47 pts</div>
              <div className="text-slate-400 text-xs">this month</div>
            </div>
            <div
              className="absolute -right-4 md:right-8 top-8 z-10 animate-stat-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 backdrop-blur-sm"
            >
              <div className="text-amber-400 font-bold text-sm">4 items</div>
              <div className="text-slate-400 text-xs">removed</div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-8 z-10 animate-stat-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2 backdrop-blur-sm"
            >
              <div className="text-blue-400 font-bold text-sm">Loan Ready: 68%</div>
              <div className="text-slate-400 text-xs">on track</div>
            </div>

            <PaymentCard3D animated={true} className="relative z-10" />
          </div>
        </div>
      </section>

      {/* === STATS BAR === */}
      <section
        className="py-10 border-t border-b"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "16,000+", label: "Items Removed" },
              { value: "94%", label: "Client Satisfaction" },
              { value: "30-Day", label: "Average First Result" },
              { value: "$0", label: "Hidden Fees" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm uppercase tracking-widest text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-amber-400 mb-3 font-medium">Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Everything You Need
            </h2>
            <p className="text-slate-400 mt-4 text-lg max-w-2xl mx-auto">
              Six powerful tools working together to get you loan-ready faster than any other platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-amber-400" />,
                title: "Dispute IQ™",
                desc: "AI writes a unique letter every round. Bureaus can't pattern-flag it.",
                color: "amber",
              },
              {
                icon: <Mail className="w-5 h-5 text-blue-400" />,
                title: "Auto Certified Mail",
                desc: "Lob.com sends letters automatically. Real USPS tracking, zero trips.",
                color: "blue",
              },
              {
                icon: <Building2 className="w-5 h-5 text-emerald-400" />,
                title: "Loan Bridge",
                desc: "Hit your target score? We connect you to DSCR lenders automatically.",
                color: "emerald",
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-amber-400" />,
                title: "Credit Coach AI",
                desc: "24/7 AI that knows your full credit file. Ask anything, anytime.",
                color: "amber",
              },
              {
                icon: <Map className="w-5 h-5 text-blue-400" />,
                title: "Score Map",
                desc: "AI roadmap from your score today to loan approval. Updated in real time.",
                color: "blue",
              },
              {
                icon: <Trophy className="w-5 h-5 text-emerald-400" />,
                title: "Victory Room",
                desc: "Celebrate every win. Share your progress. Build momentum.",
                color: "emerald",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="card-3d card-3d-gold p-6 group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background:
                      feature.color === "amber"
                        ? "rgba(245,158,11,0.1)"
                        : feature.color === "blue"
                        ? "rgba(96,165,250,0.1)"
                        : "rgba(52,211,153,0.1)",
                    border:
                      feature.color === "amber"
                        ? "1px solid rgba(245,158,11,0.2)"
                        : feature.color === "blue"
                        ? "1px solid rgba(96,165,250,0.2)"
                        : "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === DUAL AUDIENCE SECTION === */}
      <section id="business" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-amber-400 mb-3 font-medium">Who It's For</div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Personal or Business
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal */}
            <div
              className="card-3d p-8 border"
              style={{ borderColor: "rgba(96,165,250,0.2)" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                Personal Credit
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Fix your credit.<br />Get loan-ready.
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                From $49/mo — Start with a 3-day free trial.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Track all 3 bureaus",
                  "AI dispute letters",
                  "Certified mail automation",
                  "Loan readiness meter",
                  "24/7 Credit Coach AI",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold">
                  Start Free →
                </Button>
              </Link>
            </div>

            {/* White Label */}
            <div
              className="card-3d p-8 border relative"
              style={{ borderColor: "rgba(245,158,11,0.25)" }}
            >
              <div
                className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-black text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
              >
                Most Popular for Businesses
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-6">
                White Label Business
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Run your credit repair<br />business on autopilot.
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                From $99/mo — Unlimited clients. Your brand.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Your brand + portal",
                  "Unlimited clients",
                  "AutoCycle dispute automation",
                  "Built-in DSCR pipeline",
                  "Starts at $99/mo vs CRC's $179",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold glow-gold">
                  Start White Label →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section
        className="py-24 px-4"
        style={{ background: "rgba(255,255,255,0.01)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs uppercase tracking-widest text-amber-400 mb-3 font-medium">Client Stories</div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Real Results
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I went from 572 to 664 in 4 months. My DSCR loan was approved last week.",
                name: "Marcus T.",
                location: "Atlanta, GA",
              },
              {
                quote: "My credit was 486 when I started, going through a divorce and struggling to get approved for anything. Now I'm at 610 and just got approved for my own place. We're still working together to get me ready to buy a house next year. The advice and guidance has been incredible.",
                name: "Olivia G.",
                location: "Rebuilding After Divorce",
              },
              {
                quote: "I had an amazing experience! In less than 30 days, my credit score increased by 95 points. Ervin was professional, consistent, and kept me informed every step of the way. Truly awesome experience for my husband and I!",
                name: "Orlandria Washington",
                location: "New York, NY",
              },
            ].map((t) => (
              <div key={t.name} className="card-3d p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* === FINAL CTA === */}
      <section
        className="py-32 px-4 relative overflow-hidden"
        style={{ background: "#0A1628" }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: "rgba(245,158,11,0.05)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="text-xs uppercase tracking-widest text-amber-400 mb-4 font-medium">Get Started Today</div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
            Ready to ScoreShift?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join thousands of clients on their way to loan approval.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-10 h-14 text-lg glow-gold"
              >
                Start Free Trial →
              </Button>
            </Link>
            <Link href="/get-started">
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 px-10 h-14 text-lg"
              >
                Talk to a Loan Specialist
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-slate-600 text-sm flex-wrap">
            <span>✓ No credit card required</span>
            <span>✓ 3-day free trial</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer
        className="py-10 px-4 border-t"
        style={{
          background: "#050A14",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-black text-xs"
              style={{ background: "linear-gradient(135deg, #F59E0B, #FCD34D)" }}
            >
              SS
            </div>
            <span className="text-white font-bold">ScoreShift</span>
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <Link href="/privacy-policy"><span className="hover:text-white cursor-pointer transition-colors">Privacy</span></Link>
            <Link href="/terms"><span className="hover:text-white cursor-pointer transition-colors">Terms</span></Link>
            <Link href="/pricing"><span className="hover:text-white cursor-pointer transition-colors">Pricing</span></Link>
            <Link href="/denial-decoder"><span className="hover:text-white cursor-pointer transition-colors">Denial Decoder</span></Link>
          </div>
          <div className="text-slate-600 text-sm">© 2027 ScoreShift. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
