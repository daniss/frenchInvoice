-- French E-Invoicing Compliance Database Schema
-- RGPD-compliant with Row Level Security (RLS)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE invoice_status AS ENUM ('draft', 'generated', 'submitted', 'delivered', 'paid', 'failed');
CREATE TYPE facturx_level AS ENUM ('minimum', 'basic', 'comfort', 'extended');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'professional', 'business');
CREATE TYPE health_status AS ENUM ('healthy', 'warning', 'error');

-- Companies table (French businesses using the platform)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- French business identifiers
    siren VARCHAR(9) UNIQUE NOT NULL CHECK (siren ~ '^\d{9}$'),
    siret VARCHAR(14) CHECK (siret ~ '^\d{14}$'),
    name TEXT NOT NULL CHECK (length(name) >= 2),
    legal_form VARCHAR(50), -- SARL, SAS, EURL, etc.
    vat_number VARCHAR(20), -- FR + 2 digits + SIREN or EU format
    
    -- Address information
    address TEXT NOT NULL CHECK (length(address) >= 5),
    postal_code VARCHAR(5) NOT NULL CHECK (postal_code ~ '^\d{5}$'),
    city TEXT NOT NULL,
    phone VARCHAR(20),
    email TEXT NOT NULL CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    
    -- Platform configuration
    pdp_id VARCHAR(50), -- Preferred PDP provider
    subscription_tier subscription_tier DEFAULT 'free',
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table (clients of the companies)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Business identifiers (optional for customers)
    siren VARCHAR(9) CHECK (siren ~ '^\d{9}$'),
    siret VARCHAR(14) CHECK (siret ~ '^\d{14}$'),
    name TEXT NOT NULL CHECK (length(name) >= 2),
    vat_number VARCHAR(30), -- EU VAT numbers can be longer
    
    -- Address information
    address TEXT NOT NULL,
    postal_code VARCHAR(10) NOT NULL, -- Support international codes
    city TEXT NOT NULL,
    country VARCHAR(2) DEFAULT 'FR', -- ISO 3166-1 alpha-2
    phone VARCHAR(20),
    email TEXT CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$'),
    
    -- Payment configuration
    payment_terms INTEGER DEFAULT 30 CHECK (payment_terms > 0), -- Days
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table (core Factur-X compliant invoices)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    
    -- Invoice identification
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency CHAR(3) DEFAULT 'EUR',
    
    -- Financial information (precise decimal for French accounting)
    total_amount_excl_vat DECIMAL(15,2) NOT NULL CHECK (total_amount_excl_vat >= 0),
    total_vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK (total_vat_amount >= 0),
    total_amount_incl_vat DECIMAL(15,2) NOT NULL CHECK (total_amount_incl_vat >= 0),
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 20.00 CHECK (vat_rate >= 0), -- French VAT rates
    payment_terms INTEGER NOT NULL DEFAULT 30,
    
    -- Invoice content
    description TEXT NOT NULL CHECK (length(description) >= 1),
    notes TEXT,
    
    -- Status tracking
    status invoice_status DEFAULT 'draft',
    facturx_level facturx_level DEFAULT 'minimum',
    
    -- File storage
    xml_content TEXT, -- Factur-X XML content
    pdf_url TEXT, -- Supabase storage URL
    facturx_url TEXT, -- Final Factur-X PDF URL
    
    -- PDP integration
    pdp_submission_id VARCHAR(100),
    pdp_status VARCHAR(50),
    submitted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_due_date CHECK (due_date >= issue_date),
    CONSTRAINT valid_vat_calculation CHECK (
        total_amount_incl_vat = total_amount_excl_vat + total_vat_amount
    ),
    CONSTRAINT unique_invoice_number_per_company UNIQUE (company_id, invoice_number)
);

-- Invoice archive table (10-year retention compliance)
CREATE TABLE invoice_archive (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for integrity
    retention_until DATE NOT NULL, -- 10 years from archive date
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDP providers configuration
CREATE TABLE pdp_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    api_url TEXT NOT NULL,
    oauth_url TEXT NOT NULL,
    min_volume INTEGER DEFAULT 0,
    price_per_invoice DECIMAL(8,4) NOT NULL, -- Euros per invoice
    is_active BOOLEAN DEFAULT true,
    supports_facturx BOOLEAN DEFAULT true,
    certification_status VARCHAR(50) DEFAULT 'certified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PDP connections (OAuth2 tokens)
CREATE TABLE pdp_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES pdp_providers(id) ON DELETE CASCADE,
    
    -- OAuth2 tokens (encrypted)
    access_token TEXT, -- Will be encrypted at application level
    refresh_token TEXT, -- Will be encrypted at application level
    token_expires_at TIMESTAMPTZ,
    
    -- Connection health
    is_active BOOLEAN DEFAULT true,
    last_health_check TIMESTAMPTZ,
    health_status health_status DEFAULT 'healthy',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(company_id, provider_id)
);

-- Compliance audit log (RGPD requirement)
CREATE TABLE compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance metrics (cost tracking and optimization)
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_siren ON companies(siren);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoice_archive_retention ON invoice_archive(retention_until);
CREATE INDEX idx_pdp_connections_company ON pdp_connections(company_id);
CREATE INDEX idx_audit_log_company_event ON compliance_audit_log(company_id, event_type);
CREATE INDEX idx_audit_log_created_at ON compliance_audit_log(created_at);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type, created_at);

-- Enable Row Level Security (RLS) for RGPD compliance
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_archive ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Companies: Users can only access their own company
CREATE POLICY "users_own_company" ON companies
    FOR ALL USING (auth.uid() = user_id);

-- Customers: Users can only access customers of their companies
CREATE POLICY "users_own_customers" ON customers
    FOR ALL USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- Invoices: Users can only access invoices from their companies
CREATE POLICY "users_own_invoices" ON invoices
    FOR ALL USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- Invoice archive: Users can only access their archived invoices
CREATE POLICY "users_own_invoice_archive" ON invoice_archive
    FOR ALL USING (
        invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN companies c ON i.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- PDP connections: Users can only manage their company's PDP connections
CREATE POLICY "users_own_pdp_connections" ON pdp_connections
    FOR ALL USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- Audit log: Users can only view their company's audit logs
CREATE POLICY "users_own_audit_log" ON compliance_audit_log
    FOR SELECT USING (
        company_id IN (
            SELECT id FROM companies WHERE user_id = auth.uid()
        )
    );

-- Performance metrics: Users can only view metrics related to their invoices
CREATE POLICY "users_own_performance_metrics" ON performance_metrics
    FOR SELECT USING (
        invoice_id IS NULL OR invoice_id IN (
            SELECT i.id FROM invoices i
            JOIN companies c ON i.company_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Functions for automated tasks

-- Function to automatically calculate retention date (10 years)
CREATE OR REPLACE FUNCTION calculate_retention_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.retention_until = CURRENT_DATE + INTERVAL '10 years';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set retention date on invoice archive
CREATE TRIGGER set_invoice_archive_retention
    BEFORE INSERT ON invoice_archive
    FOR EACH ROW
    EXECUTE FUNCTION calculate_retention_date();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER update_companies_timestamp
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_timestamp
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pdp_providers_timestamp
    BEFORE UPDATE ON pdp_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pdp_connections_timestamp
    BEFORE UPDATE ON pdp_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to audit invoice operations (RGPD compliance)
CREATE OR REPLACE FUNCTION audit_invoice_operation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO compliance_audit_log (
        company_id,
        event_type,
        event_data,
        user_id
    ) VALUES (
        COALESCE(NEW.company_id, OLD.company_id),
        TG_OP || '_INVOICE',
        jsonb_build_object(
            'invoice_id', COALESCE(NEW.id, OLD.id),
            'invoice_number', COALESCE(NEW.invoice_number, OLD.invoice_number),
            'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
            'new_status', CASE WHEN TG_OP != 'DELETE' THEN NEW.status ELSE NULL END
        ),
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for invoice audit logging
CREATE TRIGGER audit_invoice_changes
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION audit_invoice_operation();

-- Insert initial PDP providers
INSERT INTO pdp_providers (name, api_url, oauth_url, min_volume, price_per_invoice, certification_status) VALUES
('e-Dune', 'https://api.e-dune.com/v1', 'https://auth.e-dune.com/oauth2', 0, 0.1500, 'certified'),
('Tenor', 'https://api.tenor.com/v1', 'https://auth.tenor.com/oauth2', 0, 0.2000, 'certified'),
('Docaposte', 'https://api.docaposte.com/v1', 'https://auth.docaposte.com/oauth2', 100, 0.2500, 'certified'),
('Generix', 'https://api.generix.com/v1', 'https://auth.generix.com/oauth2', 50, 0.3000, 'certified');

-- Create view for invoice statistics
CREATE VIEW invoice_statistics AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(i.id) as total_invoices,
    COUNT(CASE WHEN i.status = 'delivered' THEN 1 END) as delivered_invoices,
    SUM(i.total_amount_incl_vat) as total_revenue,
    AVG(EXTRACT(days FROM (i.delivered_at - i.created_at))) as avg_delivery_time_days
FROM companies c
LEFT JOIN invoices i ON c.id = i.company_id
GROUP BY c.id, c.name;

-- Comments for documentation
COMMENT ON TABLE companies IS 'French businesses using the e-invoicing platform';
COMMENT ON TABLE customers IS 'Customers/clients of the French businesses';
COMMENT ON TABLE invoices IS 'Factur-X compliant invoices with full audit trail';
COMMENT ON TABLE invoice_archive IS '10-year invoice retention for French legal compliance';
COMMENT ON TABLE pdp_providers IS 'Certified Plateformes de Dématérialisation Partenaires';
COMMENT ON TABLE pdp_connections IS 'OAuth2 connections to PDP providers';
COMMENT ON TABLE compliance_audit_log IS 'RGPD-compliant audit log for all operations';
COMMENT ON TABLE performance_metrics IS 'Performance tracking for cost optimization';