/**
 * TypeScript definitions for Factur-X implementation
 * EN16931 compliant data models with French business rules
 */

// Database enums
export type InvoiceStatus = 'draft' | 'validated' | 'sent' | 'paid' | 'cancelled' | 'archived';
export type FacturxLevel = 'minimum' | 'basicwl' | 'basic' | 'en16931' | 'extended';
export type VatCategory = 'S' | 'Z' | 'E' | 'AE' | 'K' | 'G' | 'O' | 'L' | 'M';
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | string;
export type CountryCode = 'FR' | 'DE' | 'ES' | 'IT' | string;

// Company/Party information
export interface Company {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Basic information
  name: string;
  legal_name?: string;
  company_type?: string; // SA, SARL, SAS, etc.
  
  // French identifiers
  siren?: string;
  siret?: string;
  vat_number?: string;
  
  // Address (EN16931 postal address)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code: CountryCode;
  
  // Contact
  email?: string;
  phone?: string;
  website?: string;
  
  // Validation status
  siren_validated: boolean;
  siret_validated: boolean;
  vat_validated: boolean;
  validation_date?: string;
}

// Invoice sequence for French compliance
export interface InvoiceSequence {
  id: string;
  company_id: string;
  sequence_name: string;
  current_number: number;
  prefix?: string;
  suffix?: string;
  year: number;
  reset_annually: boolean;
  created_at: string;
  updated_at: string;
}

// Main invoice structure
export interface Invoice {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Identification
  invoice_number: string;
  invoice_sequence_id?: string;
  
  // Parties
  supplier_id: string;
  customer_id: string;
  supplier?: Company;
  customer?: Company;
  
  // Dates
  issue_date: string; // ISO date string
  due_date?: string;
  tax_point_date?: string;
  
  // Amounts (in cents to avoid floating point issues)
  net_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  currency_code: CurrencyCode;
  
  // Metadata
  description?: string;
  payment_terms?: string;
  payment_reference?: string;
  project_reference?: string;
  contract_reference?: string;
  
  // Factur-X specific
  facturx_level: FacturxLevel;
  xml_data?: any; // JSONB data
  pdf_file_path?: string;
  pdf_file_hash?: string;
  
  // Status
  status: InvoiceStatus;
  validation_errors?: ValidationError[];
  compliance_validated: boolean;
  compliance_validated_at?: string;
  
  // Related data
  lines?: InvoiceLine[];
  vat_breakdown?: InvoiceVatBreakdown[];
}

// Invoice line item
export interface InvoiceLine {
  id: string;
  invoice_id: string;
  line_number: number;
  
  // Item information
  item_name: string;
  item_description?: string;
  item_code?: string;
  
  // Quantity and pricing
  quantity: number;
  unit_code: string; // UN/ECE codes
  unit_price_cents: number;
  
  // Amounts in cents
  net_amount_cents: number;
  tax_amount_cents: number;
  total_amount_cents: number;
  
  // VAT
  vat_category: VatCategory;
  vat_rate: number; // Decimal (e.g., 0.2 for 20%)
  vat_exemption_reason?: string;
  
  // Discounts
  discount_percentage: number;
  discount_amount_cents: number;
  
  created_at: string;
}

// VAT breakdown
export interface InvoiceVatBreakdown {
  id: string;
  invoice_id: string;
  vat_category: VatCategory;
  vat_rate: number;
  taxable_amount_cents: number;
  tax_amount_cents: number;
}

// Validation structures
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  details?: any;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// French business validation
export interface SirenValidationResult {
  is_valid: boolean;
  formatted_siren: string;
  checksum_valid: boolean;
  error?: string;
}

export interface SiretValidationResult {
  is_valid: boolean;
  formatted_siret: string;
  siren: string;
  establishment_number: string;
  checksum_valid: boolean;
  error?: string;
}

export interface FrenchVatValidationResult {
  is_valid: boolean;
  formatted_vat: string;
  country_code: string;
  check_digits: string;
  siren: string;
  error?: string;
}

// Factur-X generation request
export interface FacturxGenerationRequest {
  invoice_id: string;
  facturx_level?: FacturxLevel;
  format?: 'UBL' | 'CII';
  validate_only?: boolean;
  include_attachments?: boolean;
}

// Factur-X generation response
export interface FacturxGenerationResponse {
  success: boolean;
  invoice_id: string;
  pdf_url?: string;
  pdf_file_path?: string;
  pdf_file_hash?: string;
  xml_content?: string;
  validation_result: ValidationResult;
  processing_time_ms: number;
  file_size_bytes?: number;
}

// XML template configuration
export interface FacturxTemplate {
  id: string;
  template_name: string;
  facturx_level: FacturxLevel;
  template_format: 'UBL' | 'CII';
  template_content: string;
  schema_version: string;
  is_active: boolean;
  created_at: string;
}

// Edge Function request/response types
export interface EdgeFunctionRequest {
  method: string;
  headers: Record<string, string>;
  body?: any;
  url: string;
}

export interface EdgeFunctionResponse {
  status: number;
  headers?: Record<string, string>;
  body: any;
}

// Batch processing
export interface BatchProcessRequest {
  invoice_ids: string[];
  facturx_level?: FacturxLevel;
  format?: 'UBL' | 'CII';
  webhook_url?: string;
}

export interface BatchProcessResponse {
  batch_id: string;
  total_invoices: number;
  estimated_completion_time: string;
  status_url: string;
}

export interface BatchProcessStatus {
  batch_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_invoices: number;
  processed_invoices: number;
  successful_invoices: number;
  failed_invoices: number;
  results: FacturxGenerationResponse[];
  created_at: string;
  completed_at?: string;
}

// Utility types for amounts (handling cents/euros conversion)
export interface AmountUtils {
  fromCents(cents: number): number;
  toCents(euros: number): number;
  formatCurrency(cents: number, currency?: CurrencyCode): string;
  formatCurrencyFrench(cents: number): string;
}

// EN16931 semantic model types
export interface EN16931Invoice {
  // Business Group (BG-1): Invoice document references
  invoice_number: string; // BT-1
  invoice_type_code: string; // BT-3, typically "380" for commercial invoice
  invoice_issue_date: string; // BT-2
  due_date?: string; // BT-9
  invoice_period?: {
    start_date: string; // BT-73
    end_date: string; // BT-74
  };
  
  // Business Group (BG-2): Process control
  business_process_type?: string; // BT-23
  
  // Business Group (BG-4): Seller
  seller: {
    name: string; // BT-27
    legal_name?: string; // BT-28
    identifier?: string; // BT-29 (SIREN for France)
    vat_identifier?: string; // BT-31
    address: {
      line1?: string; // BT-35
      line2?: string; // BT-36  
      line3?: string; // BT-162
      city: string; // BT-37
      postal_code: string; // BT-38
      country_code: string; // BT-40
      country_subdivision?: string; // BT-39
    };
    electronic_address?: {
      identifier: string; // BT-34
      scheme_identifier: string; // BT-34-1
    };
    contact?: {
      name?: string; // BT-41
      telephone?: string; // BT-42
      email?: string; // BT-43
    };
  };
  
  // Business Group (BG-7): Buyer
  buyer: {
    name: string; // BT-44
    legal_name?: string; // BT-45
    identifier?: string; // BT-46
    vat_identifier?: string; // BT-48
    address: {
      line1?: string; // BT-50
      line2?: string; // BT-51
      line3?: string; // BT-163
      city: string; // BT-52
      postal_code: string; // BT-53
      country_code: string; // BT-55
      country_subdivision?: string; // BT-54
    };
    electronic_address?: {
      identifier: string; // BT-49
      scheme_identifier: string; // BT-49-1
    };
    contact?: {
      name?: string; // BT-56
      telephone?: string; // BT-57
      email?: string; // BT-58
    };
  };
  
  // Business Group (BG-22): Document totals
  totals: {
    net_amount: number; // BT-109
    allowance_total?: number; // BT-107
    charge_total?: number; // BT-108
    tax_exclusive_amount: number; // BT-109
    tax_inclusive_amount: number; // BT-112
    payable_amount: number; // BT-115
    paid_amount?: number; // BT-113
    rounding_amount?: number; // BT-114
  };
  
  // Business Group (BG-23): VAT breakdown
  vat_breakdown: Array<{
    category_code: VatCategory; // BT-118
    rate?: number; // BT-119
    taxable_amount: number; // BT-116
    tax_amount: number; // BT-117
    exemption_reason?: string; // BT-120
    exemption_reason_code?: string; // BT-121
  }>;
  
  // Business Group (BG-25): Invoice lines
  lines: Array<{
    line_identifier: string; // BT-126
    note?: string; // BT-127
    object_identifier?: {
      identifier: string; // BT-128
      scheme_identifier: string; // BT-128-1
    };
    quantity: number; // BT-129
    unit_code: string; // BT-130
    net_amount: number; // BT-131
    
    // Item information (BG-31)
    item: {
      name: string; // BT-153
      description?: string; // BT-154
      seller_identifier?: string; // BT-155
      buyer_identifier?: string; // BT-156
      standard_identifier?: {
        identifier: string; // BT-157
        scheme_identifier: string; // BT-157-1
      };
      classification?: Array<{
        identifier: string; // BT-158
        scheme_identifier: string; // BT-158-1
        scheme_version?: string; // BT-158-2
      }>;
      country_of_origin?: string; // BT-159
    };
    
    // Price details (BG-29)
    price: {
      unit_price: number; // BT-146
      base_quantity?: number; // BT-149
      base_quantity_unit_code?: string; // BT-150
      price_discount?: number; // BT-147
    };
    
    // VAT information (BG-30)
    vat: {
      category_code: VatCategory; // BT-151
      rate?: number; // BT-152
    };
  }>;
  
  // Additional references and notes
  payment_instructions?: {
    payment_terms?: string; // BT-20
    payment_means_code?: string; // BT-81
    payment_means_text?: string; // BT-82
    remittance_information?: string; // BT-83
    
    // Credit transfer (BG-17)
    credit_transfer?: {
      account_identifier: string; // BT-84
      account_name?: string; // BT-85
      service_provider_identifier?: string; // BT-86
    };
    
    // Payment card (BG-18)
    payment_card?: {
      account_identifier: string; // BT-87
      network_identifier?: string; // BT-88
      holder_name?: string; // BT-89
    };
    
    // Direct debit (BG-19)
    direct_debit?: {
      mandate_reference: string; // BT-89
      bank_assigned_creditor_identifier?: string; // BT-90
      debited_account_identifier: string; // BT-91
    };
  };
  
  // Additional document references
  preceding_invoice_reference?: {
    identifier: string; // BT-25
    issue_date?: string; // BT-26
  };
  
  contract_reference?: string; // BT-12
  purchase_order_reference?: string; // BT-13
  sales_order_reference?: string; // BT-14
  receiving_advice_reference?: string; // BT-15
  despatch_advice_reference?: string; // BT-16
  tender_reference?: string; // BT-17
  project_reference?: string; // BT-11
  
  // Additional information
  invoice_note?: string; // BT-22
  subject_code?: string; // BT-21
}