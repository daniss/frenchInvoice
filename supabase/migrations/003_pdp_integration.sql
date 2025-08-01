-- PDP Integration Schema for French E-Invoicing SaaS
-- Handles multiple certified PDP providers with OAuth2 authentication

-- Table for managing PDP provider configurations
CREATE TABLE pdp_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- e.g., 'Docaposte', 'e-Dune', 'Generix', 'Tenor'
  slug VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'docaposte', 'edune'
  pricing_per_invoice DECIMAL(4,3) NOT NULL, -- e.g., 0.150 for €0.15
  minimum_volume INTEGER DEFAULT 0, -- minimum monthly volume requirement
  is_active BOOLEAN DEFAULT true,
  is_certified BOOLEAN DEFAULT true, -- government certification status
  priority_order INTEGER DEFAULT 0, -- for routing logic (lower = higher priority)
  
  -- OAuth2 Configuration
  oauth_client_id VARCHAR(255),
  oauth_client_secret_encrypted TEXT, -- encrypted with app secret
  oauth_authorization_url TEXT,
  oauth_token_url TEXT,
  oauth_scopes TEXT[], -- array of required scopes
  
  -- API Configuration
  api_base_url TEXT NOT NULL,
  api_version VARCHAR(20) DEFAULT 'v1',
  api_rate_limit INTEGER DEFAULT 100, -- requests per minute
  
  -- Health monitoring
  health_status VARCHAR(20) DEFAULT 'unknown', -- 'healthy', 'degraded', 'down'
  last_health_check TIMESTAMP,
  success_rate DECIMAL(5,4) DEFAULT 1.0000, -- rolling 24h success rate
  average_response_time INTEGER DEFAULT 0, -- in milliseconds
  
  -- Cost tracking
  monthly_volume INTEGER DEFAULT 0,
  monthly_cost DECIMAL(10,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for customer PDP preferences and configurations
CREATE TABLE customer_pdp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  preferred_pdp_id UUID REFERENCES pdp_providers(id),
  backup_pdp_ids UUID[], -- array of fallback PDP IDs
  max_cost_per_invoice DECIMAL(4,3) DEFAULT 0.300, -- maximum acceptable cost
  
  -- OAuth tokens for this customer-PDP relationship
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP,
  token_scope TEXT,
  
  is_authenticated BOOLEAN DEFAULT false,
  last_sync TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_id, preferred_pdp_id)
);

-- Table for tracking invoice submissions to PDPs
CREATE TABLE pdp_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  pdp_provider_id UUID REFERENCES pdp_providers(id),
  company_id UUID REFERENCES companies(id),
  
  -- Submission details
  submission_id VARCHAR(255), -- PDP's internal submission ID
  external_reference VARCHAR(255), -- PDP's reference number
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'submitted', 'processing', 'delivered', 'failed', 'rejected'
  
  -- Request/Response tracking
  request_payload JSONB,
  response_data JSONB,
  error_details JSONB,
  
  -- Performance metrics
  request_duration INTEGER, -- milliseconds
  retry_count INTEGER DEFAULT 0,
  cost DECIMAL(6,3), -- actual cost for this submission
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_status_check TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for PDP health monitoring and incident tracking
CREATE TABLE pdp_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdp_provider_id UUID REFERENCES pdp_providers(id),
  
  check_type VARCHAR(50) NOT NULL, -- 'api_health', 'oauth_test', 'submission_test'
  status VARCHAR(20) NOT NULL, -- 'success', 'failure', 'timeout'
  response_time INTEGER, -- milliseconds
  error_message TEXT,
  
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Table for managing PDP cost budgets and alerts
CREATE TABLE pdp_cost_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  monthly_budget DECIMAL(8,2) NOT NULL, -- e.g., 40.00 for €40
  current_month_spend DECIMAL(8,2) DEFAULT 0.00,
  budget_period DATE NOT NULL, -- first day of the budget month
  
  -- Alert thresholds
  alert_threshold_75 BOOLEAN DEFAULT true,
  alert_threshold_90 BOOLEAN DEFAULT true,
  alert_threshold_100 BOOLEAN DEFAULT true,
  
  -- Alert status
  alert_75_sent BOOLEAN DEFAULT false,
  alert_90_sent BOOLEAN DEFAULT false,
  alert_100_sent BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(company_id, budget_period)
);

-- Indexes for performance
CREATE INDEX idx_pdp_submissions_invoice_id ON pdp_submissions(invoice_id);
CREATE INDEX idx_pdp_submissions_status ON pdp_submissions(status);
CREATE INDEX idx_pdp_submissions_company_id ON pdp_submissions(company_id);
CREATE INDEX idx_pdp_submissions_submitted_at ON pdp_submissions(submitted_at);
CREATE INDEX idx_pdp_providers_active ON pdp_providers(is_active, priority_order);
CREATE INDEX idx_pdp_health_logs_provider_time ON pdp_health_logs(pdp_provider_id, checked_at);
CREATE INDEX idx_customer_pdp_settings_company ON customer_pdp_settings(company_id);

-- Enable Row Level Security
ALTER TABLE pdp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_pdp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdp_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdp_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdp_cost_budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- PDP providers are readable by all authenticated users, manageable by service role only
CREATE POLICY "PDP providers are viewable by authenticated users" ON pdp_providers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Customer PDP settings are private to each company
CREATE POLICY "Users can manage their company PDP settings" ON customer_pdp_settings
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- PDP submissions are private to each company
CREATE POLICY "Users can view their company PDP submissions" ON pdp_submissions
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Cost budgets are private to each company
CREATE POLICY "Users can manage their company cost budgets" ON pdp_cost_budgets
  FOR ALL USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Health logs are viewable by authenticated users for transparency
CREATE POLICY "Health logs are viewable by authenticated users" ON pdp_health_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert initial PDP provider configurations based on the plan
INSERT INTO pdp_providers (name, slug, pricing_per_invoice, minimum_volume, priority_order, api_base_url, oauth_authorization_url, oauth_token_url, oauth_scopes) VALUES
  ('Docaposte', 'docaposte', 0.225, 100, 1, 'https://api.docaposte.com', 'https://auth.docaposte.com/oauth/authorize', 'https://auth.docaposte.com/oauth/token', ARRAY['invoices:write', 'invoices:read']),
  ('e-Dune', 'edune', 0.175, 0, 2, 'https://api.e-dune.com', 'https://auth.e-dune.com/oauth/authorize', 'https://auth.e-dune.com/oauth/token', ARRAY['invoice_submission', 'status_tracking']),
  ('Generix', 'generix', 0.300, 50, 3, 'https://api.generix.com', 'https://oauth.generix.com/authorize', 'https://oauth.generix.com/token', ARRAY['edi:write', 'edi:read']),
  ('Tenor', 'tenor', 0.250, 0, 4, 'https://api.tenor-einvoice.com', 'https://auth.tenor-einvoice.com/oauth2/authorize', 'https://auth.tenor-einvoice.com/oauth2/token', ARRAY['invoice:submit', 'invoice:track']);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_pdp_providers_updated_at BEFORE UPDATE ON pdp_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_pdp_settings_updated_at BEFORE UPDATE ON customer_pdp_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pdp_submissions_updated_at BEFORE UPDATE ON pdp_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pdp_cost_budgets_updated_at BEFORE UPDATE ON pdp_cost_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate optimal PDP routing based on cost, volume, and health
CREATE OR REPLACE FUNCTION get_optimal_pdp_for_submission(
  p_company_id UUID,
  p_invoice_amount DECIMAL DEFAULT NULL
)
RETURNS TABLE (
  pdp_id UUID,
  pdp_name VARCHAR(100),
  estimated_cost DECIMAL(6,3),
  reasoning TEXT
) AS $$
DECLARE
  current_month_volume INTEGER;
  company_settings RECORD;
BEGIN
  -- Get company PDP settings
  SELECT * INTO company_settings
  FROM customer_pdp_settings cs
  WHERE cs.company_id = p_company_id
  LIMIT 1;

  -- Get current month submission volume for the company
  SELECT COUNT(*) INTO current_month_volume
  FROM pdp_submissions ps
  WHERE ps.company_id = p_company_id
    AND DATE_TRUNC('month', ps.submitted_at) = DATE_TRUNC('month', NOW());

  RETURN QUERY
  WITH pdp_evaluation AS (
    SELECT 
      pp.id,
      pp.name,
      pp.pricing_per_invoice,
      pp.minimum_volume,
      pp.health_status,
      pp.success_rate,
      pp.priority_order,
      -- Check if company meets minimum volume
      CASE 
        WHEN pp.minimum_volume <= current_month_volume THEN true
        ELSE false
      END as meets_minimum,
      -- Check if within budget
      CASE 
        WHEN company_settings.max_cost_per_invoice IS NULL THEN true
        WHEN pp.pricing_per_invoice <= company_settings.max_cost_per_invoice THEN true
        ELSE false
      END as within_budget,
      -- Health score (0-100)
      CASE 
        WHEN pp.health_status = 'healthy' THEN pp.success_rate * 100
        WHEN pp.health_status = 'degraded' THEN pp.success_rate * 60
        ELSE 0
      END as health_score
    FROM pdp_providers pp
    WHERE pp.is_active = true
      AND pp.is_certified = true
  )
  SELECT 
    pe.id,
    pe.name,
    pe.pricing_per_invoice,
    CASE 
      WHEN NOT pe.meets_minimum THEN 'Volume below minimum (' || pe.minimum_volume || ')'
      WHEN NOT pe.within_budget THEN 'Cost exceeds budget'
      WHEN pe.health_score < 50 THEN 'Poor health status'
      ELSE 'Optimal choice - ' || pe.health_score::TEXT || '% health score'
    END as reasoning
  FROM pdp_evaluation pe
  WHERE pe.meets_minimum = true
    AND pe.within_budget = true
    AND pe.health_score >= 50
  ORDER BY 
    pe.health_score DESC,
    pe.pricing_per_invoice ASC,
    pe.priority_order ASC
  LIMIT 1;
  
  -- If no optimal PDP found, return the best available option
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      pe.id,
      pe.name,
      pe.pricing_per_invoice,
      'Fallback option - ' || 
      CASE 
        WHEN NOT pe.meets_minimum THEN 'volume issue'
        WHEN NOT pe.within_budget THEN 'budget issue'
        ELSE 'health issue'
      END as reasoning
    FROM pdp_evaluation pe
    WHERE pe.health_score > 0
    ORDER BY pe.health_score DESC, pe.pricing_per_invoice ASC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;