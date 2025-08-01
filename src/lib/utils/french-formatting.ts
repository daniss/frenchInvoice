/**
 * French formatting utilities for dates, currency, and business data
 */

export function formatFrenchCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatFrenchDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export function formatFrenchDateTime(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatFrenchPhone(phone: string): string {
  // Format French phone numbers: 01 23 45 67 89
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  return phone
}

export function formatSIREN(siren: string): string {
  // Format SIREN: 123 456 789
  const cleaned = siren.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  }
  return siren
}

export function formatSIRET(siret: string): string {
  // Format SIRET: 123 456 789 00012
  const cleaned = siret.replace(/\D/g, '')
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4')
  }
  return siret
}

export function formatFrenchVAT(vat: string): string {
  // Format French VAT: FR 12 345678901
  if (vat.startsWith('FR') && vat.length === 13) {
    return vat.replace(/FR(\d{2})(\d{9})/, 'FR $1 $2')
  }
  return vat
}

export function formatFrenchNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatFrenchPostalCode(postalCode: string): string {
  const cleaned = postalCode.replace(/\D/g, '').slice(0, 5)
  return cleaned
}

export function parseFrenchCurrency(currencyStr: string): number {
  // Parse French currency format: "123,45 €" -> 123.45
  const cleaned = currencyStr.replace(/[€\s]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export function parseFrenchNumber(numberStr: string): number {
  // Parse French number format: "123,45" -> 123.45
  const cleaned = numberStr.replace(/\s/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}