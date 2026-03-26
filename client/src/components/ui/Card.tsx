import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'featured' | 'stat' | 'dark' | 'gold'
  hover?: boolean
  className?: string
  onClick?: () => void
  delay?: number
  animate?: boolean
}

export function Card({
  children,
  variant = 'default',
  hover = true,
  className = '',
  onClick,
  delay = 0,
  animate = true,
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm dark:bg-navy-700 dark:border-white/8',
    featured: 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 shadow-glow-blue dark:from-navy-700 dark:to-navy-600 dark:border-blue-500',
    stat: 'bg-white border border-slate-200 shadow-sm hover:border-blue-200 dark:bg-navy-700 dark:border-white/8',
    dark: 'bg-slate-900 border border-slate-800 text-white',
    gold: 'bg-gradient-to-br from-gold-50 to-amber-50 border-2 border-gold-400 shadow-glow-gold dark:from-navy-700 dark:to-navy-600 dark:border-gold-500',
  }

  const hoverStyle = hover ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : ''

  const MotionDiv = animate ? motion.div : 'div'
  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.5, delay },
    whileHover: hover ? { y: -2, scale: 1.01 } : undefined,
  } : {}

  return (
    <MotionDiv
      {...motionProps}
      onClick={onClick}
      className={`rounded-2xl transition-all duration-250 ${variants[variant]} ${hoverStyle} ${className}`}
    >
      {children}
    </MotionDiv>
  )
}
