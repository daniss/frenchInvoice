/**
 * French Business Validation Utilities
 * Comprehensive validation for French business identifiers and requirements
 */

/**
 * Validates a French SIREN number using the Luhn algorithm
 * SIREN: 9-digit unique identifier for French businesses
 */
export function validateSIREN(siren: string): boolean {
  // Remove spaces and validate format
  const cleanSiren = siren.replace(/\s/g, '')
  if (!/^\d{9}$/.test(cleanSiren)) {
    return false
  }

  // Apply Luhn algorithm for SIREN validation
  const digits = cleanSiren.split('').map(Number)
  let sum = 0

  for (let i = 0; i < 8; i++) {
    let digit = digits[i]
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === digits[8]
}

/**
 * Validates a French SIRET number (SIREN + NIC)
 * SIRET: 14-digit establishment identifier (SIREN + 5 digits)
 */
export function validateSIRET(siret: string): boolean {
  const cleanSiret = siret.replace(/\s/g, '')
  if (!/^\d{14}$/.test(cleanSiret)) {
    return false
  }

  // Validate the SIREN part (first 9 digits)
  const siren = cleanSiret.substring(0, 9)
  if (!validateSIREN(siren)) {
    return false
  }

  // Validate the full SIRET using Luhn algorithm
  const digits = cleanSiret.split('').map(Number)
  let sum = 0

  for (let i = 0; i < 13; i++) {
    let digit = digits[i]
    if (i % 2 === 0) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === digits[13]
}

/**
 * Validates a French VAT number (TVA intracommunautaire)
 * Format: FR + 2 check digits + 9-digit SIREN
 */
export function validateFrenchVAT(vatNumber: string): boolean {
  const cleanVat = vatNumber.replace(/\s/g, '').toUpperCase()
  const match = cleanVat.match(/^FR(\d{2})(\d{9})$/)
  
  if (!match) {
    return false
  }

  const [, checkDigits, siren] = match
  
  // Validate the SIREN part
  if (!validateSIREN(siren)) {
    return false
  }

  // Calculate expected check digits
  const calculatedCheck = (12 + 3 * (parseInt(siren) % 97)) % 97
  return parseInt(checkDigits) === calculatedCheck
}

/**
 * Validates an EU VAT number (basic format check)
 */
export function validateEUVAT(vatNumber: string): boolean {
  const cleanVat = vatNumber.replace(/\s/g, '').toUpperCase()
  
  // EU VAT patterns by country
  const patterns: Record<string, RegExp> = {
    AT: /^ATU\d{8}$/,
    BE: /^BE[0-1]\d{9}$/,
    BG: /^BG\d{9,10}$/,
    CY: /^CY\d{8}[A-Z]$/,
    CZ: /^CZ\d{8,10}$/,
    DE: /^DE\d{9}$/,
    DK: /^DK\d{8}$/,
    EE: /^EE\d{9}$/,
    EL: /^EL\d{9}$/,
    ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
    FI: /^FI\d{8}$/,
    FR: /^FR[A-Z0-9]{2}\d{9}$/,
    GB: /^GB(\d{9}|\d{12}|GD\d{3}|HA\d{3})$/,
    HR: /^HR\d{11}$/,
    HU: /^HU\d{8}$/,
    IE: /^IE[A-Z0-9]{8,9}$/,
    IT: /^IT\d{11}$/,
    LT: /^LT(\d{9}|\d{12})$/,
    LU: /^LU\d{8}$/,
    LV: /^LV\d{11}$/,
    MT: /^MT\d{8}$/,
    NL: /^NL\d{9}B\d{2}$/,
    PL: /^PL\d{10}$/,
    PT: /^PT\d{9}$/,
    RO: /^RO\d{2,10}$/,
    SE: /^SE\d{12}$/,
    SI: /^SI\d{8}$/,
    SK: /^SK\d{10}$/,
  }

  const countryCode = cleanVat.substring(0, 2)
  const pattern = patterns[countryCode]
  
  return pattern ? pattern.test(cleanVat) : false
}

/**
 * Formats a SIREN number for display (XXX XXX XXX)
 */
export function formatSIREN(siren: string): string {
  const cleanSiren = siren.replace(/\D/g, '')
  if (cleanSiren.length !== 9) {
    return siren
  }
  return `${cleanSiren.substring(0, 3)} ${cleanSiren.substring(3, 6)} ${cleanSiren.substring(6)}`
}

/**
 * Formats a SIRET number for display (XXX XXX XXX XXXXX)
 */
export function formatSIRET(siret: string): string {
  const cleanSiret = siret.replace(/\D/g, '')
  if (cleanSiret.length !== 14) {
    return siret
  }
  return `${cleanSiret.substring(0, 3)} ${cleanSiret.substring(3, 6)} ${cleanSiret.substring(6, 9)} ${cleanSiret.substring(9)}`
}

/**
 * Formats a French VAT number for display (FR XX XXX XXX XXX)
 */
export function formatFrenchVAT(vatNumber: string): string {
  const cleanVat = vatNumber.replace(/\s/g, '').toUpperCase()
  const match = cleanVat.match(/^FR(\d{2})(\d{9})$/)
  
  if (!match) {
    return vatNumber
  }

  const [, checkDigits, siren] = match
  const formattedSiren = formatSIREN(siren)
  return `FR ${checkDigits} ${formattedSiren}`
}

/**
 * Validates French postal code
 */
export function validateFrenchPostalCode(postalCode: string): boolean {
  // French postal codes: 5 digits, first 2 represent department
  return /^\d{5}$/.test(postalCode)
}

/**
 * Validates an invoice number according to French requirements
 * Must be sequential and unique per company
 */
export function validateInvoiceNumber(invoiceNumber: string): boolean {
  // French invoice numbers must be:
  // - Unique and sequential
  // - Can contain letters and numbers
  // - No specific format mandated, but must be systematic
  return /^[A-Z0-9\-_]{1,50}$/i.test(invoiceNumber)
}

/**
 * Validates French business phone number
 */
export function validateFrenchPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\.]/g, '')
  
  // French phone formats:
  // - 10 digits starting with 0
  // - International format +33 followed by 9 digits
  return /^0[1-9]\d{8}$/.test(cleanPhone) || /^\+33[1-9]\d{8}$/.test(cleanPhone)
}

/**
 * Validates French IBAN
 */
export function validateFrenchIBAN(iban: string): boolean {
  const cleanIban = iban.replace(/\s/g, '').toUpperCase()
  
  if (!cleanIban.startsWith('FR') || cleanIban.length !== 27) {
    return false
  }

  // Basic IBAN check digit validation
  const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4)
  const numericString = rearranged.replace(/[A-Z]/g, (letter) => 
    (letter.charCodeAt(0) - 55).toString()
  )

  let remainder = 0
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97
  }

  return remainder === 1
}

/**
 * Type definitions for validation results
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Comprehensive French business data validation
 */
export function validateFrenchBusinessData(data: {
  siren?: string
  siret?: string
  vatNumber?: string
  companyName: string
  address: string
  postalCode: string
  city: string
  phone?: string
  email: string
}): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // SIREN validation
  if (data.siren && !validateSIREN(data.siren)) {
    errors.push('Le numéro SIREN est invalide')
  }

  // SIRET validation
  if (data.siret && !validateSIRET(data.siret)) {
    errors.push('Le numéro SIRET est invalide')
  }

  // VAT number validation
  if (data.vatNumber) {
    if (data.vatNumber.startsWith('FR')) {
      if (!validateFrenchVAT(data.vatNumber)) {
        errors.push('Le numéro de TVA intracommunautaire français est invalide')
      }
    } else {
      if (!validateEUVAT(data.vatNumber)) {
        errors.push('Le numéro de TVA intracommunautaire européen est invalide')
      }
    }
  }

  // Postal code validation
  if (!validateFrenchPostalCode(data.postalCode)) {
    errors.push('Le code postal français doit contenir 5 chiffres')
  }

  // Phone validation
  if (data.phone && !validateFrenchPhone(data.phone)) {
    errors.push('Le numéro de téléphone français est invalide')
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    errors.push('L\'adresse email est invalide')
  }

  // Company name validation
  if (data.companyName.length < 2) {
    errors.push('La raison sociale doit contenir au moins 2 caractères')
  }

  // Address validation
  if (data.address.length < 5) {
    errors.push('L\'adresse doit être complète')
  }

  // Warnings
  if (!data.siren && !data.siret) {
    warnings.push('Il est recommandé de fournir un numéro SIREN ou SIRET')
  }

  if (!data.vatNumber) {
    warnings.push('Le numéro de TVA intracommunautaire est recommandé pour les échanges européens')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Check if a business is subject to French e-invoicing mandate
 */
export function isSubjectToEInvoicingMandate(data: {
  siren?: string
  annualRevenue?: number
  isPublicSector?: boolean
  employeeCount?: number
}): boolean {
  // All French businesses with SIREN will be subject to e-invoicing by 2026
  // Some may have earlier deadlines based on size/sector
  
  if (!data.siren) {
    return false // Foreign companies may not be subject
  }

  // Large companies (>250 employees or >€50M revenue) - earlier deadline
  if (data.employeeCount && data.employeeCount > 250) {
    return true
  }

  if (data.annualRevenue && data.annualRevenue > 50000000) {
    return true
  }

  // Public sector - already subject
  if (data.isPublicSector) {
    return true
  }

  // All other French businesses will be subject by 2026
  return true
}

/**
 * Get e-invoicing compliance deadline for a business
 */
export function getEInvoicingDeadline(data: {
  siren?: string
  annualRevenue?: number
  isPublicSector?: boolean
  employeeCount?: number
}): Date | null {
  if (!isSubjectToEInvoicingMandate(data)) {
    return null
  }

  // Public sector - already active
  if (data.isPublicSector) {
    return new Date('2017-01-01')
  }

  // Large companies - September 2026
  if (data.employeeCount && data.employeeCount > 250) {
    return new Date('2026-09-01')
  }

  if (data.annualRevenue && data.annualRevenue > 50000000) {
    return new Date('2026-09-01')
  }

  // SMEs - September 2026 (may be phased)
  return new Date('2026-09-01')
}