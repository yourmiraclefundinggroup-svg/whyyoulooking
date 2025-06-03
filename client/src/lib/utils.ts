import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  return formatDate(date)
}

export function getCreditRating(score: number): string {
  if (score >= 800) return 'EXCELLENT'
  if (score >= 740) return 'VERY GOOD'
  if (score >= 670) return 'GOOD'
  if (score >= 580) return 'FAIR'
  return 'POOR'
}

export function getCreditRatingColor(rating: string): string {
  switch (rating) {
    case 'EXCELLENT':
    case 'VERY GOOD':
      return 'text-green-600'
    case 'GOOD':
      return 'text-blue-600'
    case 'FAIR':
      return 'text-yellow-600'
    case 'POOR':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getIssueTypeColor(type: string): string {
  switch (type) {
    case 'COLLECTION':
    case 'CHARGE_OFF':
      return 'bg-red-50 border-red-200 text-red-900'
    case 'LATE_PAYMENT':
      return 'bg-orange-50 border-orange-200 text-orange-900'
    case 'INQUIRY':
      return 'bg-yellow-50 border-yellow-200 text-yellow-900'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900'
  }
}

export function getIssueTypeIcon(type: string): string {
  switch (type) {
    case 'COLLECTION':
    case 'CHARGE_OFF':
      return 'fas fa-times'
    case 'LATE_PAYMENT':
      return 'fas fa-clock'
    case 'INQUIRY':
      return 'fas fa-search'
    default:
      return 'fas fa-exclamation'
  }
}

export function getDisputeStatusColor(status: string): string {
  switch (status) {
    case 'RESOLVED':
      return 'bg-green-50 border-green-200 text-green-900'
    case 'PENDING':
      return 'bg-blue-50 border-blue-200 text-blue-900'
    case 'REJECTED':
      return 'bg-red-50 border-red-200 text-red-900'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-900'
  }
}

export function calculateCreditScorePercentage(score: number): number {
  // Convert credit score (300-850) to percentage (0-100)
  return ((score - 300) / (850 - 300)) * 100
}

export function calculateStrokeDashoffset(percentage: number): number {
  const circumference = 2 * Math.PI * 50 // radius = 50
  return circumference - (percentage / 100) * circumference
}
