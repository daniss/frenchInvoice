/**
 * French Business Validation Utilities
 * SIREN, SIRET, VAT number validation with checksums
 * Optimized for Deno runtime
 */

import type {
  SirenValidationResult,
  SiretValidationResult,
  FrenchVatValidationResult,
  ValidationError,
  ValidationResult
} from '../types/facturx.ts';

/**
 * SIREN validation with Luhn algorithm
 * SIREN = 9-digit identifier for French companies
 */
export function validateSiren(siren: string): SirenValidationResult {
  if (!siren) {
    return {
      is_valid: false,
      formatted_siren: '',
      checksum_valid: false,
      error: 'SIREN is required'
    };
  }

  // Remove spaces and non-digits
  const cleaned = siren.replace(/\D/g, '');
  
  if (cleaned.length !== 9) {
    return {
      is_valid: false,
      formatted_siren: cleaned,
      checksum_valid: false,
      error: 'SIREN must be exactly 9 digits'
    };
  }

  // Check for invalid patterns (all same digits, etc.)
  if (/^(\d)\1{8}$/.test(cleaned)) {
    return {
      is_valid: false,
      formatted_siren: cleaned,
      checksum_valid: false,
      error: 'SIREN cannot be all same digits'
    };
  }

  // Luhn algorithm for SIREN checksum
  const checksum_valid = validateSirenChecksum(cleaned);

  return {
    is_valid: checksum_valid,
    formatted_siren: cleaned,
    checksum_valid,
    error: checksum_valid ? undefined : 'Invalid SIREN checksum'
  };
}

/**
 * SIRET validation (SIREN + establishment number)
 * SIRET = 14-digit identifier (9-digit SIREN + 5-digit establishment)
 */
export function validateSiret(siret: string): SiretValidationResult {
  if (!siret) {
    return {
      is_valid: false,
      formatted_siret: '',
      siren: '',
      establishment_number: '',
      checksum_valid: false,
      error: 'SIRET is required'
    };
  }

  // Remove spaces and non-digits
  const cleaned = siret.replace(/\D/g, '');
  
  if (cleaned.length !== 14) {
    return {
      is_valid: false,
      formatted_siret: cleaned,
      siren: cleaned.substring(0, 9),
      establishment_number: cleaned.substring(9),
      checksum_valid: false,
      error: 'SIRET must be exactly 14 digits'
    };
  }

  const siren = cleaned.substring(0, 9);
  const establishment = cleaned.substring(9, 14);

  // Validate SIREN part first
  const sirenValidation = validateSiren(siren);
  if (!sirenValidation.is_valid) {
    return {
      is_valid: false,
      formatted_siret: cleaned,
      siren,
      establishment_number: establishment,
      checksum_valid: false,
      error: `Invalid SIREN in SIRET: ${sirenValidation.error}`
    };
  }

  // Validate SIRET checksum (Luhn algorithm on all 14 digits)
  const checksum_valid = validateSiretChecksum(cleaned);

  return {
    is_valid: checksum_valid,
    formatted_siret: cleaned,
    siren,
    establishment_number: establishment,
    checksum_valid,
    error: checksum_valid ? undefined : 'Invalid SIRET checksum'
  };
}

/**
 * French VAT number validation (TVA intracommunautaire)
 * Format: FR + 2 check digits + 9-digit SIREN
 */
export function validateFrenchVat(vat: string): FrenchVatValidationResult {
  if (!vat) {
    return {
      is_valid: false,
      formatted_vat: '',
      country_code: '',
      check_digits: '',
      siren: '',
      error: 'VAT number is required'
    };
  }

  // Clean and uppercase
  const cleaned = vat.replace(/\s/g, '').toUpperCase();
  
  // French VAT format: FR + 2 alphanumeric check digits + 9-digit SIREN
  const frenchVatPattern = /^FR([0-9A-Z]{2})([0-9]{9})$/;
  const match = cleaned.match(frenchVatPattern);
  
  if (!match) {
    return {
      is_valid: false,
      formatted_vat: cleaned,
      country_code: cleaned.substring(0, 2),
      check_digits: '',
      siren: '',
      error: 'Invalid French VAT format. Expected: FR + 2 check digits + 9-digit SIREN'
    };
  }

  const checkDigits = match[1];
  const siren = match[2];

  // Validate SIREN part
  const sirenValidation = validateSiren(siren);
  if (!sirenValidation.is_valid) {
    return {
      is_valid: false,
      formatted_vat: cleaned,
      country_code: 'FR',
      check_digits: checkDigits,
      siren,
      error: `Invalid SIREN in VAT number: ${sirenValidation.error}`
    };
  }

  // Validate check digits
  const checksum_valid = validateFrenchVatChecksum(checkDigits, siren);

  return {
    is_valid: checksum_valid,
    formatted_vat: cleaned,
    country_code: 'FR',
    check_digits: checkDigits,
    siren,
    error: checksum_valid ? undefined : 'Invalid VAT check digits'
  };
}

/**
 * SIREN checksum validation using Luhn algorithm
 */
function validateSirenChecksum(siren: string): boolean {
  let sum = 0;
  let alternate = false;

  // Process digits from right to left
  for (let i = siren.length - 1; i >= 0; i--) {
    let digit = parseInt(siren.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }

  return (sum % 10) === 0;
}

/**
 * SIRET checksum validation using Luhn algorithm
 */
function validateSiretChecksum(siret: string): boolean {
  let sum = 0;
  let alternate = false;

  // Process digits from right to left
  for (let i = siret.length - 1; i >= 0; i--) {
    let digit = parseInt(siret.charAt(i), 10);
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }
    
    sum += digit;
    alternate = !alternate;
  }

  return (sum % 10) === 0;
}

/**
 * French VAT check digits validation
 */
function validateFrenchVatChecksum(checkDigits: string, siren: string): boolean {
  // Convert SIREN to number for calculation
  const sirenNum = parseInt(siren, 10);
  
  // Calculate expected check digits
  let calculatedCheck;
  
  if (checkDigits.match(/^[0-9]{2}$/)) {
    // Numeric check digits
    calculatedCheck = (12 + 3 * (sirenNum % 97)) % 97;
    return parseInt(checkDigits, 10) === calculatedCheck;
  } else {
    // Alphanumeric check digits (old system, still valid)
    // This is more complex and involves character-to-number conversion
    // For simplicity, we'll accept any alphanumeric format for now
    // In production, implement full alphanumeric validation
    return /^[0-9A-Z]{2}$/.test(checkDigits);
  }
}

/**
 * Validate French postal code
 */
export function validateFrenchPostalCode(postalCode: string): boolean {
  if (!postalCode) return false;
  
  // French postal codes: 5 digits
  // Special codes for overseas territories are also valid
  const frenchPostalPattern = /^(?:0[1-9]|[1-8]\d|9[0-5]|9[78]\d{3})\d{2}$/;
  
  return frenchPostalPattern.test(postalCode.replace(/\s/g, ''));
}

/**
 * Validate French phone number
 */
export function validateFrenchPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // French phone formats:
  // - 10 digits starting with 0 (domestic)
  // - 12 digits starting with 33 (international without +)
  // - Various mobile and overseas formats
  
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return /^0[1-9]\d{8}$/.test(cleaned);
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('33')) {
    return /^33[1-9]\d{8}$/.test(cleaned);
  }
  
  return false;
}

/**
 * Comprehensive French business data validation
 */
export function validateFrenchBusinessData(data: {
  siren?: string;
  siret?: string;
  vat_number?: string;
  postal_code?: string;
  phone?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // SIREN validation
  if (data.siren) {
    const sirenResult = validateSiren(data.siren);
    if (!sirenResult.is_valid) {
      errors.push({
        field: 'siren',
        code: 'INVALID_SIREN',
        message: sirenResult.error || 'Invalid SIREN',
        severity: 'error'
      });
    }
  }

  // SIRET validation
  if (data.siret) {
    const siretResult = validateSiret(data.siret);
    if (!siretResult.is_valid) {
      errors.push({
        field: 'siret',
        code: 'INVALID_SIRET',
        message: siretResult.error || 'Invalid SIRET',
        severity: 'error'
      });
    }
    
    // Cross-validate SIREN and SIRET
    if (data.siren && siretResult.is_valid) {
      const cleanSiren = data.siren.replace(/\D/g, '');
      if (cleanSiren !== siretResult.siren) {
        errors.push({
          field: 'siret',
          code: 'SIRET_SIREN_MISMATCH',
          message: 'SIRET must contain the same SIREN number',
          severity: 'error'
        });
      }
    }
  }

  // VAT number validation
  if (data.vat_number) {
    const vatResult = validateFrenchVat(data.vat_number);
    if (!vatResult.is_valid) {
      errors.push({
        field: 'vat_number',
        code: 'INVALID_VAT',
        message: vatResult.error || 'Invalid VAT number',
        severity: 'error'
      });
    }
    
    // Cross-validate SIREN and VAT
    if (data.siren && vatResult.is_valid) {
      const cleanSiren = data.siren.replace(/\D/g, '');
      if (cleanSiren !== vatResult.siren) {
        errors.push({
          field: 'vat_number',
          code: 'VAT_SIREN_MISMATCH',
          message: 'VAT number must contain the same SIREN number',
          severity: 'error'
        });
      }
    }
  }

  // Postal code validation
  if (data.postal_code && !validateFrenchPostalCode(data.postal_code)) {
    errors.push({
      field: 'postal_code',
      code: 'INVALID_POSTAL_CODE',
      message: 'Invalid French postal code format',
      severity: 'error'
    });
  }

  // Phone validation
  if (data.phone && !validateFrenchPhone(data.phone)) {
    warnings.push({
      field: 'phone',
      code: 'INVALID_PHONE',
      message: 'Phone number format may not be valid for France',
      severity: 'warning'
    });
  }

  return {
    is_valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format SIREN with spaces for display
 */
export function formatSiren(siren: string): string {
  const cleaned = siren.replace(/\D/g, '');
  if (cleaned.length !== 9) return siren;
  
  return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
}

/**
 * Format SIRET with spaces for display
 */
export function formatSiret(siret: string): string {
  const cleaned = siret.replace(/\D/g, '');
  if (cleaned.length !== 14) return siret;
  
  return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9)}`;
}

/**
 * Format French VAT number for display
 */
export function formatFrenchVat(vat: string): string {
  const cleaned = vat.replace(/\s/g, '').toUpperCase();
  if (!cleaned.startsWith('FR') || cleaned.length !== 13) return vat;
  
  return `FR ${cleaned.substring(2, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 10)} ${cleaned.substring(10)}`;
}

/**
 * Get validation rules for French business data
 */
export function getFrenchValidationRules() {
  return {
    siren: {
      required: false,
      pattern: /^[0-9]{9}$/,
      checksum: true,
      formatter: formatSiren
    },
    siret: {
      required: false,
      pattern: /^[0-9]{14}$/,
      checksum: true,
      formatter: formatSiret
    },
    vat_number: {
      required: false,
      pattern: /^FR[0-9A-Z]{2}[0-9]{9}$/,
      checksum: true,
      formatter: formatFrenchVat
    },
    postal_code: {
      required: true,
      pattern: /^(?:0[1-9]|[1-8]\d|9[0-5]|9[78]\d{3})\d{2}$/,
      checksum: false
    },
    phone: {
      required: false,
      pattern: /^(?:0[1-9]\d{8}|33[1-9]\d{8})$/,
      checksum: false
    }
  };
}