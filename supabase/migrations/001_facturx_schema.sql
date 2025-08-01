-- Factur-X Database Schema for French E-Invoicing Compliance
-- EN16931 compliant invoice data model with French business rules

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Invoice status enumeration
CREATE TYPE invoice_status AS ENUM (
  'draft',
  'validated',
  'sent',
  'paid',
  'cancelled',
  'archived'
);

-- Factur-X level enumeration (EN16931 profiles)
CREATE TYPE facturx_level AS ENUM (
  'minimum',
  'basicwl', 
  'basic',
  'en16931',
  'extended'
);

-- VAT category codes (EN16931 standard)
CREATE TYPE vat_category AS ENUM (
  'S',  -- Standard rate
  'Z',  -- Zero rated
  'E',  -- Exempt
  'AE', -- Reverse charge
  'K',  -- Intra-community supply
  'G',  -- Free export
  'O',  -- Services outside scope
  'L',  -- Canary Islands
  'M'   -- Ceuta and Melilla
);

-- Companies table (suppliers and customers)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic company information
  name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  company_type VARCHAR(50), -- SA, SARL, SAS, etc.
  
  -- French business identifiers
  siren VARCHAR(9) UNIQUE,
  siret VARCHAR(14),
  vat_number VARCHAR(20), -- TVA intracommunautaire
  
  -- Address information (EN16931 compliant)
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country_code CHAR(2) DEFAULT 'FR',
  
  -- Contact information
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Validation status
  siren_validated BOOLEAN DEFAULT FALSE,
  siret_validated BOOLEAN DEFAULT FALSE,
  vat_validated BOOLEAN DEFAULT FALSE,
  validation_date TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_siren CHECK (siren ~ '^[0-9]{9}$'),
  CONSTRAINT valid_siret CHECK (siret ~ '^[0-9]{14}$'),
  CONSTRAINT valid_country CHECK (country_code ~ '^[A-Z]{2}$'),
  CONSTRAINT valid_postal_code CHECK (
    CASE 
      WHEN country_code = 'FR' THEN postal_code ~ '^[0-9]{5}$'
      ELSE TRUE
    END
  )
);

-- Invoice sequences for French compliance (no gaps allowed)
CREATE TABLE invoice_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  sequence_name VARCHAR(100) NOT NULL, -- e.g., 'FACT-2024', 'DEV-2024'
  current_number INTEGER NOT NULL DEFAULT 0,
  prefix VARCHAR(20),
  suffix VARCHAR(20),
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  reset_annually BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(company_id, sequence_name, year)
);

-- Main invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Invoice identification
  invoice_number VARCHAR(100) NOT NULL,
  invoice_sequence_id UUID REFERENCES invoice_sequences(id),
  
  -- Party information
  supplier_id UUID NOT NULL REFERENCES companies(id),
  customer_id UUID NOT NULL REFERENCES companies(id),
  
  -- Invoice dates (EN16931 required)
  issue_date DATE NOT NULL,
  due_date DATE,
  tax_point_date DATE, -- Date when VAT becomes chargeable
  
  -- Amounts (stored as integers to avoid floating point issues)
  -- All amounts in cents (EUR * 100)
  net_amount BIGINT NOT NULL DEFAULT 0,
  tax_amount BIGINT NOT NULL DEFAULT 0,
  total_amount BIGINT NOT NULL DEFAULT 0,
  paid_amount BIGINT NOT NULL DEFAULT 0,
  
  -- Currency (ISO 4217)
  currency_code CHAR(3) NOT NULL DEFAULT 'EUR',
  
  -- Invoice metadata
  description TEXT,
  payment_terms TEXT,
  payment_reference VARCHAR(100),
  project_reference VARCHAR(100),
  contract_reference VARCHAR(100),
  
  -- Factur-X specific
  facturx_level facturx_level NOT NULL DEFAULT 'en16931',
  xml_data JSONB, -- Cached XML data for generation
  pdf_file_path VARCHAR(500), -- Path in Supabase Storage
  pdf_file_hash VARCHAR(64), -- SHA-256 hash for integrity
  
  -- Status and validation
  status invoice_status NOT NULL DEFAULT 'draft',
  validation_errors JSONB,
  compliance_validated BOOLEAN DEFAULT FALSE,
  compliance_validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints for French compliance
  CONSTRAINT valid_invoice_number CHECK (LENGTH(invoice_number) > 0),
  CONSTRAINT valid_dates CHECK (
    issue_date <= COALESCE(due_date, issue_date + INTERVAL '365 days')
  ),
  CONSTRAINT valid_amounts CHECK (
    net_amount >= 0 AND 
    tax_amount >= 0 AND 
    total_amount >= 0 AND
    paid_amount >= 0 AND
    total_amount = net_amount + tax_amount
  ),
  CONSTRAINT valid_currency CHECK (currency_code ~ '^[A-Z]{3}$'),
  
  UNIQUE(supplier_id, invoice_number)
);

-- Invoice line items
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  
  -- Item information
  item_name VARCHAR(255) NOT NULL,
  item_description TEXT,
  item_code VARCHAR(100), -- SKU or product code
  
  -- Quantity and pricing (using DECIMAL for precision)
  quantity DECIMAL(15,6) NOT NULL DEFAULT 1,
  unit_code VARCHAR(10) DEFAULT 'C62', -- UN/ECE unit codes (C62 = piece)
  unit_price_cents BIGINT NOT NULL, -- Price per unit in cents
  
  -- Line amounts in cents
  net_amount_cents BIGINT NOT NULL,
  tax_amount_cents BIGINT NOT NULL,
  total_amount_cents BIGINT NOT NULL,
  
  -- VAT information
  vat_category vat_category NOT NULL DEFAULT 'S',
  vat_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.2000 for 20%
  vat_exemption_reason TEXT,
  
  -- Discounts and charges
  discount_percentage DECIMAL(5,4) DEFAULT 0,
  discount_amount_cents BIGINT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_line_number CHECK (line_number > 0),
  CONSTRAINT valid_quantity CHECK (quantity > 0),
  CONSTRAINT valid_unit_price CHECK (unit_price_cents >= 0),
  CONSTRAINT valid_vat_rate CHECK (vat_rate >= 0 AND vat_rate <= 1),
  CONSTRAINT valid_discount CHECK (
    discount_percentage >= 0 AND discount_percentage <= 1 AND
    discount_amount_cents >= 0
  ),
  CONSTRAINT valid_line_amounts CHECK (
    net_amount_cents >= 0 AND
    tax_amount_cents >= 0 AND
    total_amount_cents >= 0 AND
    total_amount_cents = net_amount_cents + tax_amount_cents
  ),
  
  UNIQUE(invoice_id, line_number)
);

-- VAT breakdown table (required for Factur-X)
CREATE TABLE invoice_vat_breakdown (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  vat_category vat_category NOT NULL,
  vat_rate DECIMAL(5,4) NOT NULL,
  taxable_amount_cents BIGINT NOT NULL,
  tax_amount_cents BIGINT NOT NULL,
  
  UNIQUE(invoice_id, vat_category, vat_rate)
);

-- Audit trail for compliance
CREATE TABLE invoice_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- created, updated, validated, sent, etc.
  user_id UUID, -- Reference to auth.users if using Supabase Auth
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Validation rules and templates
CREATE TABLE validation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL, -- siren, siret, vat, amount, date, etc.
  rule_expression TEXT NOT NULL, -- JSON or SQL expression
  error_message_fr TEXT NOT NULL,
  error_message_en TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- XML templates for different Factur-X levels
CREATE TABLE facturx_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(100) NOT NULL,
  facturx_level facturx_level NOT NULL,
  template_format VARCHAR(20) NOT NULL, -- 'UBL' or 'CII'
  template_content TEXT NOT NULL, -- Jinja2 template
  schema_version VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_name, facturx_level, template_format)
);

-- Indexes for performance
CREATE INDEX idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_companies_siren ON companies(siren) WHERE siren IS NOT NULL;
CREATE INDEX idx_companies_siret ON companies(siret) WHERE siret IS NOT NULL;
CREATE INDEX idx_companies_vat_number ON companies(vat_number) WHERE vat_number IS NOT NULL;
CREATE INDEX idx_audit_log_invoice_id ON invoice_audit_log(invoice_id);
CREATE INDEX idx_audit_log_created_at ON invoice_audit_log(created_at);

-- GIN indexes for JSONB fields
CREATE INDEX idx_invoices_xml_data ON invoices USING GIN(xml_data);
CREATE INDEX idx_invoices_validation_errors ON invoices USING GIN(validation_errors);

-- Full-text search indexes
CREATE INDEX idx_companies_name_search ON companies USING GIN(to_tsvector('french', name));
CREATE INDEX idx_invoices_description_search ON invoices USING GIN(to_tsvector('french', description));

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_sequences_updated_at BEFORE UPDATE ON invoice_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_vat_breakdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_audit_log ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your auth requirements)
CREATE POLICY "Users can view their own company data" ON companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view invoices for their companies" ON invoices
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM companies WHERE /* user access logic */) OR
    customer_id IN (SELECT id FROM companies WHERE /* user access logic */)
  );

-- Insert sample validation rules
INSERT INTO validation_rules (rule_name, rule_type, rule_expression, error_message_fr, error_message_en) VALUES
('siren_checksum', 'siren', '{"algorithm": "luhn_mod9"}', 'Numéro SIREN invalide (erreur de somme de contrôle)', 'Invalid SIREN number (checksum error)'),
('siret_checksum', 'siret', '{"algorithm": "luhn_mod14"}', 'Numéro SIRET invalide (erreur de somme de contrôle)', 'Invalid SIRET number (checksum error)'),
('french_vat_format', 'vat', '{"pattern": "^FR[0-9A-Z]{2}[0-9]{9}$"}', 'Format de TVA intracommunautaire français invalide', 'Invalid French VAT number format'),
('positive_amount', 'amount', '{"min": 0}', 'Les montants doivent être positifs', 'Amounts must be positive'),
('due_date_after_issue', 'date', '{"field1": "issue_date", "field2": "due_date", "operator": "<="}', 'La date d\'échéance doit être postérieure à la date d\'émission', 'Due date must be after issue date');

-- Insert basic Factur-X templates (simplified examples)
INSERT INTO facturx_templates (template_name, facturx_level, template_format, template_content, schema_version) VALUES
('basic_ubl_template', 'basic', 'UBL', '<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2">
  <cbc:ID>{{ invoice.invoice_number }}</cbc:ID>
  <cbc:IssueDate>{{ invoice.issue_date }}</cbc:IssueDate>
  <!-- Template continues... -->
</Invoice>', '2.1'),

('en16931_cii_template', 'en16931', 'CII', '<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
                          xmlns:qdt="urn:un:unece:uncefact:data:standard:QualifiedDataType:100"
                          xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
                          xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <!-- Template continues... -->
</rsm:CrossIndustryInvoice>', '100');

-- Comments for documentation
COMMENT ON TABLE companies IS 'Stores supplier and customer company information with French business identifiers';
COMMENT ON TABLE invoices IS 'Main invoice table compliant with EN16931 semantic model';
COMMENT ON TABLE invoice_lines IS 'Invoice line items with VAT breakdown and unit pricing';
COMMENT ON TABLE invoice_sequences IS 'Manages sequential invoice numbering for French compliance';
COMMENT ON TABLE validation_rules IS 'Configurable validation rules for French business compliance';
COMMENT ON TABLE facturx_templates IS 'XML templates for different Factur-X profiles and formats';