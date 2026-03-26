import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'blue' | 'green' | 'gold' | 'slate' | 'red' | 'outline-blue'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'blue', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    green: 'bg-green-50 text-green-700 border border-green-100',
    gold: 'bg-gold-50 text-gold-600 border border-gold-100',
    slate: 'bg-slate-100 text-slate-600 border border-slate-200',
    red: 'bg-red-50 text-red-600 border border-red-100',
    'outline-blue': 'bg-transparent text-blue-600 border border-blue-300',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs font-semibold',
    md: 'px-3 py-1 text-sm font-semibold',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
