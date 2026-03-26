import { motion } from 'framer-motion'

interface StatChipProps {
  label: string
  color: 'green' | 'gold' | 'blue'
  position: string
  delay?: number
}

function StatChip({ label, color, position, delay = 0 }: StatChipProps) {
  const colors = {
    green: 'bg-green-500 text-white shadow-glow-green',
    gold: 'bg-gold-500 text-white shadow-glow-gold',
    blue: 'bg-blue-600 text-white shadow-glow-blue',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + 0.8, duration: 0.5, type: 'spring' }}
      className={`absolute ${position} ${colors[color]} px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap chip-float z-20`}
      style={{ animationDelay: `${delay}s` }}
    >
      {label}
    </motion.div>
  )
}

export function PaymentCard3D() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 420, height: 420 }}>
      {/* Glow shadow beneath card */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 h-8 rounded-full blur-2xl opacity-40"
        style={{ background: 'radial-gradient(ellipse, #3B82F6 0%, transparent 70%)' }}
      />

      {/* Stat chips */}
      <StatChip label="▲ +47 pts this month" color="green" position="top-8 right-4" delay={0} />
      <StatChip label="4 items removed" color="gold" position="bottom-16 left-0" delay={0.2} />
      <StatChip label="Loan Ready: 68%" color="blue" position="top-20 left-0" delay={0.4} />

      {/* The 3D Card */}
      <div className="card-3d-container card-float" style={{ animationDelay: '0s' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, rotateY: -15 }}
          animate={{ opacity: 1, y: 0, rotateY: -2 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="card-3d"
          style={{
            width: 320,
            height: 200,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #E8F0FE 0%, #DBEAFE 40%, #EFF6FF 60%, #F0F9FF 100%)',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 25px 60px rgba(37, 99, 235, 0.25), 0 8px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Metallic sheen overlay */}
          <div
            className="shimmer absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
              borderRadius: 20,
            }}
          />

          {/* Top row: logo + network */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
            {/* ScoreShift overlapping circles logo */}
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-5">
                <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-blue-500 opacity-90" />
                <div className="absolute left-3 top-0 w-5 h-5 rounded-full bg-gold-500 opacity-85" />
              </div>
              <span className="text-slate-700 font-black text-sm tracking-tight">ScoreShift</span>
            </div>
            {/* Contactless icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-500">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>

          {/* EMV Chip */}
          <div
            className="absolute"
            style={{ top: 60, left: 24 }}
          >
            <div
              style={{
                width: 36,
                height: 28,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 40%, #FBBF24 60%, #92400E 100%)',
                border: '1px solid rgba(245,158,11,0.5)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Chip lines */}
              <div style={{ position: 'absolute', top: 4, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
              <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
              <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 12, width: 1, background: 'rgba(0,0,0,0.15)' }} />
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 24, width: 1, background: 'rgba(0,0,0,0.15)' }} />
            </div>
          </div>

          {/* Card number */}
          <div
            className="absolute text-slate-600 font-mono font-semibold tracking-widest"
            style={{ bottom: 44, left: 24, fontSize: 13, letterSpacing: '0.2em' }}
          >
            •••• •••• •••• 4242
          </div>

          {/* Bottom row */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
            <div>
              <div className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-0.5">Card Holder</div>
              <div className="text-slate-700 font-bold text-xs tracking-widest uppercase">SCORESHIFT CAPITAL</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-0.5">Expires</div>
              <div className="text-slate-700 font-bold text-xs">12/28</div>
            </div>
          </div>

          {/* Subtle watermark pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #3B82F6 0px, #3B82F6 1px, transparent 1px, transparent 8px)',
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
