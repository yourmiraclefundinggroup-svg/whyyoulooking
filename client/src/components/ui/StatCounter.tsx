import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

interface StatCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function StatCounter({ value, prefix = '', suffix = '', duration = 1.5, className = '' }: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      onViewportEnter={() => {
        if (hasAnimated.current) return
        hasAnimated.current = true
        const start = 0
        const end = value
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / (duration * 1000), 1)
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3)
          setDisplayValue(Math.round(start + (end - start) * eased))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  )
}
