// Constants and utilities for financial categories and formatting
export const EXPENSE_CATEGORIES = [
  'Logement',
  'Alimentation',
  'Transport',
  'Loisirs',
  'Shopping',
  'Santé',
  'Éducation',
  'Abonnements',
  'Autre',
] as const

export const INCOME_CATEGORIES = [
  'Salaire',
  'Freelance',
  'Investissement',
  'Cadeau',
  'Remboursement',
  'Autre',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  // Expenses
  Logement: '#7c3aed',
  Alimentation: '#f59e0b',
  Transport: '#3b82f6',
  Loisirs: '#ec4899',
  Shopping: '#a78bfa',
  Santé: '#10b981',
  Éducation: '#14b8a6',
  Abonnements: '#f97316',
  Autre: '#64748b',
  // Income
  Salaire: '#00d4aa',
  Freelance: '#34d399',
  Investissement: '#a78bfa',
  Cadeau: '#fb7185',
  Remboursement: '#38bdf8',
}

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Logiciel',
  'Cloud',
  'Sécurité',
  'Musique',
  'Sport',
  'Info',
  'Autre',
] as const

export const SUBSCRIPTION_ICONS: Record<string, string> = {
  Streaming: '🎬',
  Logiciel: '💻',
  Cloud: '☁️',
  Sécurité: '🔒',
  Musique: '🎵',
  Sport: '⚽',
  Info: '📰',
  Autre: '📦',
}

export const SUBSCRIPTION_COLORS: Record<string, string> = {
  Streaming: '#ec4899',
  Logiciel: '#a78bfa',
  Cloud: '#38bdf8',
  Sécurité: '#f59e0b',
  Musique: '#00d4aa',
  Sport: '#f97316',
  Info: '#38bdf8',
  Autre: '#4a6080',
}

export const INVESTMENT_SECTORS = [
  'Actions',
  'ETF',
  'Obligations',
  'Crypto',
  'Fonds',
  'Autre',
] as const

export const INVESTMENT_SECTOR_COLORS: Record<string, string> = {
  Actions: '#a78bfa',
  ETF: '#38bdf8',
  Obligations: '#f59e0b',
  Crypto: '#00d4aa',
  Fonds: '#fb7185',
  Autre: '#4a6080',
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current month in ISO format (YYYY-MM)
 */
export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

/**
 * Format date to French locale
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

/**
 * Get category color
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#64748b'
}

/**
 * Validate amount is positive
 */
export function isValidAmount(amount: number | string): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return !isNaN(num) && num > 0
}

/**
 * Calculate days until date
 */
export function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

/**
 * Check if date is overdue
 */
export function isOverdue(dateStr: string): boolean {
  return daysUntil(dateStr) < 0
}

/**
 * Check if date is urgent (within 30 days)
 */
export function isUrgent(dateStr: string): boolean {
  const days = daysUntil(dateStr)
  return days >= 0 && days <= 30
}
