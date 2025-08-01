import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency for French locale
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for French locale
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj)
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj)
}

/**
 * Format phone number for French locale
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('33')) {
    // International format: +33 1 23 45 67 89
    const national = cleaned.substring(2)
    return `+33 ${national.charAt(0)} ${national.substring(1, 3)} ${national.substring(3, 5)} ${national.substring(5, 7)} ${national.substring(7)}`
  }
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    // National format: 01 23 45 67 89
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
  }
  
  return phone
}

/**
 * Calculate days until 2026 e-invoicing deadline
 */
export function getDaysUntilDeadline(): number {
  const deadline = new Date('2026-09-01')
  const today = new Date()
  const diffTime = deadline.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get urgency level based on days until deadline
 */
export function getComplianceUrgency(): 'high' | 'medium' | 'low' {
  const days = getDaysUntilDeadline()
  if (days < 365) return 'high'
  if (days < 500) return 'medium'
  return 'low'
}

/**
 * Calculate VAT amount from HT amount and rate
 */
export function calculateVAT(amountHT: number, vatRate: number): number {
  return Math.round((amountHT * vatRate / 100) * 100) / 100
}

/**
 * Calculate TTC amount from HT amount and VAT rate
 */
export function calculateTTC(amountHT: number, vatRate: number): number {
  const vatAmount = calculateVAT(amountHT, vatRate)
  return Math.round((amountHT + vatAmount) * 100) / 100
}

/**
 * Generate next invoice number
 */
export function generateInvoiceNumber(lastNumber?: string, prefix: string = 'F'): string {
  const year = new Date().getFullYear()
  
  if (!lastNumber) {
    return `${prefix}-${year}-001`
  }
  
  // Extract number from last invoice (e.g., "F-2024-005" -> 5)
  const match = lastNumber.match(/(\d+)$/)
  if (!match) {
    return `${prefix}-${year}-001`
  }
  
  const lastNum = parseInt(match[1])
  const nextNum = lastNum + 1
  
  return `${prefix}-${year}-${nextNum.toString().padStart(3, '0')}`
}

/**
 * Calculate due date based on payment terms
 */
export function calculateDueDate(issueDate: Date, paymentTerms: number): Date {
  const dueDate = new Date(issueDate)
  dueDate.setDate(dueDate.getDate() + paymentTerms)
  return dueDate
}

/**
 * Get payment delay in days
 */
export function getPaymentDelay(dueDate: Date, paidDate?: Date): number {
  const checkDate = paidDate || new Date()
  const diffTime = checkDate.getTime() - dueDate.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(dueDate: Date): boolean {
  return new Date() > dueDate
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['octets', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 octet'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)
  
  return `${size} ${sizes[i]}`
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Sleep function for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitize filename for storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase()
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (fallbackError) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Convert file to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/type;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise(resolve => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  })
}