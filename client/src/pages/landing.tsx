import { Link } from 'wouter'
import { Shield, Eye, Bot, Lock, ArrowRight, Check } from 'lucide-react'
import { Navbar } from '../components/layout/Navbar'

function LockedScoreGauge() {
  return (
    <div style={{ position: 'relative', width: 128, height: 128, margin: '0 auto' }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r="50" fill="none" stroke="rgba(201,168,76,0.1)" strokeWidth="8" />
        <circle cx="64" cy="64" r="50" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="8"
          strokeDasharray="94 314" strokeLinecap="round" transform="rotate(-90 64 64)" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Lock size={18} color="rgba(201,168,76,0.55)" />
        <span style={{ fontSize: 22, fontWeight: 800, color: '#E8C96B', letterSpacing: '-0.02em' }}>---</span>
      </div>
    </div>
  )
}

const bureaus = [
  { name: 'Experian', color: '#0062FF' },
  { name: 'Equifax', color: '#E12726' },
  { name: 'TransUnion', color: '#662D8C' },
]

const services = [
  { icon: Shield, title: 'Credit Repair', desc: 'Expert dispute management with certified USPS mail tracking.' },
  { icon: Eye, title: 'Credit Monitoring', desc: 'Live alerts, identity theft protection, and 3-bureau score tracking.' },
  { icon: Bot, title: 'Dispute IQ', desc: 'AI-powered Metro 2 and FCRA analysis. Letters built for you.' },
]

const plans = [
  {
    name: 'Basic', price: '$29.99', period: '/mo',
    desc: 'Pay-per-letter through the app',
    features: ['Credit score tracker', 'Pay-per-letter disputes', 'Credit report viewer', 'ScoreMap™ roadmap'],
    popular: false,
  },
  {
    name: 'Professional', price: '$79.99', period: '/mo',
    desc: '1 free letter credit/month, buy additional',
    features: ['Everything in Basic', '1 free letter credit/month', 'Real-Time Alerts', 'Debt Navigator'],
    popular: true,
  },
  {
    name: 'Elite', price: 'Custom', period: '',
    desc: '2 letter credits/month, full platform unlocked',
    features: ['Everything in Professional', '2 free letter credits/month', 'Identity Protect', 'Dedicated account manager'],
    popular: false,
  },
]

const card: React.CSSProperties = {
  background: '#0F1520',
  border: '1px solid rgba(201,168,76,0.15)',
  borderRadius: 16,
  padding: 28,
  boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
}

const goldGradientBtn: React.CSSProperties = {
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
  color: '#080C14',
  fontWeight: 700,
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  fontSize: 15,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontFamily: 'inherit',
}

const ghostBtn: React.CSSProperties = {
  padding: '14px 28px',
  background: 'transparent',
  color: '#C9A84C',
  fontWeight: 600,
  borderRadius: 10,
  border: '1px solid #C9A84C',
  cursor: 'pointer',
  fontSize: 15,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  textDecoration: 'none',
  fontFamily: 'inherit',
}

export default function LandingPage() {
  return (
    <div style={{
      background: '#080C14',
      color: '#F0EDE8',
      minHeight: '100vh',
      fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <Navbar variant="dark" />

      {/* ─── SECTION 1: HERO ─── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 120,
        paddingBottom: 80,
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 900, height: 650,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 68%)',
          pointerEvents: 'none',
        }} />

        <div style={{ textAlign: 'center', maxWidth: 700, padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <p style={{
            color: '#C9A84C', fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 28,
          }}>
            The Future of Credit Repair
          </p>

          <h1 style={{
            fontSize: 'clamp(46px, 8vw, 64px)', fontWeight: 800, lineHeight: 1.08,
            letterSpacing: '-0.02em', marginBottom: 28, color: '#F0EDE8',
          }}>
            Your Credit.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Restored.</span>
            <br />
            Protected.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Elevated.</span>
          </h1>

          <p style={{
            color: '#8A9BB5', fontSize: 16, maxWidth: 560,
            margin: '0 auto 36px', lineHeight: 1.7,
          }}>
            ScoreShift gives you private, expert-level credit repair and live 3-bureau monitoring — all in one exclusive platform.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/signup">
              <button style={goldGradientBtn}>Get Started <ArrowRight size={16} /></button>
            </Link>
            <a href="#how-it-works" style={ghostBtn}>See How It Works</a>
          </div>

          <p style={{ color: '#4A566A', fontSize: 13, letterSpacing: '0.1em' }}>
            Experian · Equifax · TransUnion — Live Bureau Access
          </p>
        </div>
      </section>

      {/* ─── SECTION 2: BUREAU SCORE DISPLAY ─── */}
      <section style={{ background: '#0F1520', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{
              color: '#C9A84C', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: 16,
            }}>
              Real-Time Credit Intelligence
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800,
              color: '#F0EDE8', letterSpacing: '-0.02em',
            }}>
              All 3 Bureaus. One Dashboard.
            </h2>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24, marginBottom: 44,
          }}>
            {bureaus.map((bureau) => (
              <div key={bureau.name} style={{
                background: '#161D2E',
                border: '1px solid rgba(201,168,76,0.15)',
                borderTop: '3px solid #C9A84C',
                borderRadius: 16, padding: 36,
                textAlign: 'center',
              }}>
                <h3 style={{
                  color: bureau.color, fontSize: 20, fontWeight: 700,
                  marginBottom: 28, letterSpacing: '0.02em',
                }}>
                  {bureau.name}
                </h3>
                <LockedScoreGauge />
                <p style={{ color: '#8A9BB5', fontSize: 13, marginTop: 20, marginBottom: 16 }}>
                  Connect to view your live score
                </p>
                <p style={{ color: '#C9A84C', fontSize: 11, fontWeight: 500 }}>
                  Powered by ScoreShift
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link href="/signup">
              <button style={{ ...goldGradientBtn, fontSize: 15 }}>Connect Your Credit</button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: SERVICES ─── */}
      <section id="how-it-works" style={{ background: '#080C14', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800,
              color: '#F0EDE8', letterSpacing: '-0.02em', marginBottom: 12,
            }}>
              Everything You Need to Win
            </h2>
            <p style={{ color: '#8A9BB5', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
              One platform. Three core tools. Complete credit transformation.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {services.map((s) => (
              <div key={s.title} style={card}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <s.icon size={24} color="#C9A84C" />
                </div>
                <h3 style={{
                  color: '#F0EDE8', fontSize: 18, fontWeight: 700,
                  letterSpacing: '0.02em', marginBottom: 10,
                }}>
                  {s.title}
                </h3>
                <p style={{ color: '#8A9BB5', fontSize: 14, lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: PRICING ─── */}
      <section style={{ background: '#0F1520', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800,
              color: '#F0EDE8', letterSpacing: '-0.02em', marginBottom: 12,
            }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: '#8A9BB5', fontSize: 16 }}>
              Choose the plan that matches your goals.
            </p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24, alignItems: 'center',
          }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                background: '#161D2E',
                border: plan.popular ? '2px solid #C9A84C' : '1px solid rgba(201,168,76,0.15)',
                borderRadius: 16, padding: 32, position: 'relative',
                transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                boxShadow: plan.popular ? '0 8px 36px rgba(201,168,76,0.12)' : '0 4px 24px rgba(0,0,0,0.5)',
              }}>
                {plan.popular && (
                  <div style={{
                    position: 'absolute', top: -14, right: 20,
                    background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
                    color: '#080C14', fontSize: 11, fontWeight: 800,
                    padding: '4px 14px', borderRadius: 20, letterSpacing: '0.06em',
                  }}>
                    MOST POPULAR
                  </div>
                )}

                <h3 style={{ color: '#F0EDE8', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: 800, color: plan.popular ? '#E8C96B' : '#F0EDE8' }}>
                    {plan.price}
                  </span>
                  {plan.period && <span style={{ color: '#8A9BB5', fontSize: 14 }}>{plan.period}</span>}
                </div>
                <p style={{ color: '#8A9BB5', fontSize: 13, marginBottom: 24, lineHeight: 1.55 }}>
                  {plan.desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Check size={15} color="#C9A84C" />
                      <span style={{ color: '#8A9BB5', fontSize: 14 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <button style={{
                    width: '100%', padding: '12px 20px',
                    background: plan.popular ? 'linear-gradient(135deg, #C9A84C, #E8C96B)' : 'transparent',
                    color: plan.popular ? '#080C14' : '#C9A84C',
                    border: plan.popular ? 'none' : '1px solid #C9A84C',
                    borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                    fontFamily: 'inherit',
                  }}>
                    Get Started
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: FOOTER ─── */}
      <footer style={{
        background: '#080C14',
        borderTop: '1px solid rgba(201,168,76,0.15)',
        padding: '48px 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #C9A84C, #E8C96B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#080C14', fontWeight: 900, fontSize: 14,
            }}>
              SS
            </div>
            <span style={{ color: '#F0EDE8', fontWeight: 700, fontSize: 18 }}>ScoreShift</span>
          </div>

          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy-policy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Sign In', href: '/login' },
            ].map((link) => (
              <Link key={link.label} href={link.href}>
                <span style={{ color: '#4A566A', fontSize: 14, cursor: 'pointer' }}>
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          <p style={{ color: '#4A566A', fontSize: 13 }}>
            © ScoreShift. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
