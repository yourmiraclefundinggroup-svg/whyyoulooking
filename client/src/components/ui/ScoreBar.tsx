import { motion } from 'framer-motion'

interface ScoreBarProps {
  score: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function getScoreCategory(score: number) {
  if (score < 580) return { label: 'Poor', color: '#EF4444' }
  if (score < 620) return { label: 'Fair', color: '#F97316' }
  if (score < 660) return { label: 'Good', color: '#EAB308' }
  if (score < 720) return { label: 'Very Good', color: '#22C55E' }
  return { label: 'Excellent', color: '#16A34A' }
}

export function ScoreBar({ score, showLabel = true, size = 'md' }: ScoreBarProps) {
  const min = 300
  const max = 850
  const pct = ((score - min) / (max - min)) * 100
  const category = getScoreCategory(score)

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const markerSizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score Range</span>
          <span className="text-xs font-bold" style={{ color: category.color }}>{category.label}</span>
        </div>
      )}
      <div className="relative">
        <div className={`score-bar-track w-full ${heights[size]} rounded-full`} />
        <motion.div
          initial={{ left: 0 }}
          animate={{ left: `calc(${pct}% - 10px)` }}
          transition={{ duration: 1.2, type: 'spring', stiffness: 60, delay: 0.3 }}
          className={`absolute top-1/2 -translate-y-1/2 ${markerSizes[size]} rounded-full border-2 border-white shadow-md`}
          style={{ background: category.color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">300</span>
        <span className="text-xs text-slate-400">850</span>
      </div>
    </div>
  )
}
