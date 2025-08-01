-- Batch Processing Tables for Factur-X Generation
-- Supports background processing and status tracking

-- Batch process status enumeration
CREATE TYPE batch_status AS ENUM (
  'pending',
  'processing', 
  'completed',
  'failed',
  'cancelled'
);

-- Main batch processes table
CREATE TABLE batch_processes (
  id VARCHAR(100) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status tracking
  status batch_status NOT NULL DEFAULT 'pending',
  processing_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Progress tracking
  total_invoices INTEGER NOT NULL DEFAULT 0,
  processed_invoices INTEGER NOT NULL DEFAULT 0,
  successful_invoices INTEGER NOT NULL DEFAULT 0,
  failed_invoices INTEGER NOT NULL DEFAULT 0,
  
  -- Timing and performance
  estimated_completion TIMESTAMP WITH TIME ZONE,
  processing_time_ms BIGINT,
  
  -- Request data and configuration
  request_data JSONB NOT NULL,
  webhook_url VARCHAR(500),
  
  -- Error tracking
  error_message TEXT,
  
  -- Constraints
  CONSTRAINT valid_progress CHECK (
    processed_invoices >= 0 AND
    successful_invoices >= 0 AND
    failed_invoices >= 0 AND
    processed_invoices = successful_invoices + failed_invoices AND
    processed_invoices <= total_invoices
  )
);

-- Individual batch results table
CREATE TABLE batch_process_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id VARCHAR(100) NOT NULL REFERENCES batch_processes(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Result data
  success BOOLEAN NOT NULL,
  result_data JSONB NOT NULL,
  error_details JSONB,
  
  -- Timing
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate processing
  UNIQUE(batch_id, invoice_id)
);

-- Performance monitoring table
CREATE TABLE edge_function_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  function_name VARCHAR(100) NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  memory_usage_mb INTEGER,
  success BOOLEAN NOT NULL,
  error_type VARCHAR(100),
  error_message TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional metadata
  invoice_id UUID REFERENCES invoices(id),
  batch_id VARCHAR(100) REFERENCES batch_processes(id),
  user_id UUID, -- Reference to auth.users if needed
  request_metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_batch_processes_status ON batch_processes(status);
CREATE INDEX idx_batch_processes_created_at ON batch_processes(created_at);
CREATE INDEX idx_batch_process_results_batch_id ON batch_process_results(batch_id);
CREATE INDEX idx_batch_process_results_invoice_id ON batch_process_results(invoice_id);
CREATE INDEX idx_batch_process_results_success ON batch_process_results(success);
CREATE INDEX idx_edge_function_metrics_function_name ON edge_function_metrics(function_name);
CREATE INDEX idx_edge_function_metrics_created_at ON edge_function_metrics(created_at);
CREATE INDEX idx_edge_function_metrics_success ON edge_function_metrics(success);

-- Triggers for updated_at
CREATE TRIGGER update_batch_processes_updated_at BEFORE UPDATE ON batch_processes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE batch_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_process_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_function_metrics ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your auth requirements)
CREATE POLICY "Users can view their batch processes" ON batch_processes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their batch results" ON batch_process_results
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Function to clean up old batch data (for cost management)
CREATE OR REPLACE FUNCTION cleanup_old_batch_data()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
  retention_days INTEGER := 30; -- Keep data for 30 days
BEGIN
  -- Delete old completed batch processes and their results
  DELETE FROM batch_processes 
  WHERE status IN ('completed', 'failed') 
    AND created_at < NOW() - INTERVAL '1 day' * retention_days;
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  -- Delete old metrics data (keep for 7 days)
  DELETE FROM edge_function_metrics 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get batch processing statistics
CREATE OR REPLACE FUNCTION get_batch_processing_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_batches BIGINT,
  successful_batches BIGINT,
  failed_batches BIGINT,
  total_invoices_processed BIGINT,
  average_processing_time_ms NUMERIC,
  average_batch_size NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_batches,
    COUNT(*) FILTER (WHERE status = 'completed') as successful_batches,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_batches,
    SUM(processed_invoices) as total_invoices_processed,
    AVG(processing_time_ms) as average_processing_time_ms,
    AVG(total_invoices::NUMERIC) as average_batch_size
  FROM batch_processes
  WHERE created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get function performance metrics
CREATE OR REPLACE FUNCTION get_function_performance_stats(
  function_name_param VARCHAR DEFAULT NULL,
  hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
  function_name VARCHAR,
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  success_rate NUMERIC,
  avg_execution_time_ms NUMERIC,
  p95_execution_time_ms NUMERIC,
  avg_memory_usage_mb NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.function_name,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE success = true) as successful_executions,
    COUNT(*) FILTER (WHERE success = false) as failed_executions,
    (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*) * 100) as success_rate,
    AVG(execution_time_ms) as avg_execution_time_ms,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY execution_time_ms) as p95_execution_time_ms,
    AVG(memory_usage_mb) as avg_memory_usage_mb
  FROM edge_function_metrics m
  WHERE created_at > NOW() - INTERVAL '1 hour' * hours_back
    AND (function_name_param IS NULL OR m.function_name = function_name_param)
  GROUP BY m.function_name;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy batch monitoring
CREATE VIEW batch_processing_summary AS
SELECT 
  id,
  status,
  total_invoices,
  processed_invoices,
  successful_invoices,
  failed_invoices,
  CASE 
    WHEN total_invoices > 0 THEN (processed_invoices::NUMERIC / total_invoices * 100)
    ELSE 0 
  END as completion_percentage,
  CASE
    WHEN status = 'processing' AND processing_started_at IS NOT NULL THEN
      EXTRACT(EPOCH FROM (NOW() - processing_started_at)) * 1000
    ELSE processing_time_ms
  END as elapsed_time_ms,
  created_at,
  processing_started_at,
  completed_at,
  estimated_completion
FROM batch_processes
ORDER BY created_at DESC;

-- Create materialized view for performance dashboards (refresh periodically)
CREATE MATERIALIZED VIEW daily_facturx_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_invoices_generated,
  COUNT(*) FILTER (WHERE status = 'validated') as successful_generations,
  AVG(CASE WHEN pdf_file_path IS NOT NULL THEN 1 ELSE 0 END) as generation_success_rate,
  AVG(net_amount) / 100 as avg_invoice_amount_euros,
  SUM(net_amount) / 100 as total_invoice_value_euros
FROM invoices
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Index for materialized view
CREATE INDEX idx_daily_facturx_stats_date ON daily_facturx_stats(date);

-- Function to refresh stats (call this periodically via cron or similar)
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY daily_facturx_stats;
END;
$$ LANGUAGE plpgsql;

-- Insert sample batch processing configuration
INSERT INTO validation_rules (rule_name, rule_type, rule_expression, error_message_fr, error_message_en) VALUES
('batch_size_limit', 'batch', '{"max_size": 100}', 'La taille du lot ne peut pas dépasser 100 factures', 'Batch size cannot exceed 100 invoices'),
('concurrent_batches_limit', 'batch', '{"max_concurrent": 5}', 'Maximum 5 lots peuvent être traités simultanément', 'Maximum 5 batches can be processed concurrently'),
('processing_timeout', 'batch', '{"timeout_minutes": 10}', 'Le traitement du lot a expiré après 10 minutes', 'Batch processing timed out after 10 minutes');

-- Comments for documentation
COMMENT ON TABLE batch_processes IS 'Tracks batch processing jobs for Factur-X generation';
COMMENT ON TABLE batch_process_results IS 'Individual results for each invoice in a batch process';
COMMENT ON TABLE edge_function_metrics IS 'Performance monitoring for Edge Functions';
COMMENT ON VIEW batch_processing_summary IS 'Easy-to-use view for monitoring batch processing status';
COMMENT ON MATERIALIZED VIEW daily_facturx_stats IS 'Daily aggregated statistics for Factur-X invoice generation';

-- Grant necessary permissions (adjust based on your RLS setup)
-- These would typically be handled by your application's service role
GRANT SELECT, INSERT, UPDATE ON batch_processes TO authenticated;
GRANT SELECT, INSERT ON batch_process_results TO authenticated;
GRANT SELECT, INSERT ON edge_function_metrics TO authenticated;