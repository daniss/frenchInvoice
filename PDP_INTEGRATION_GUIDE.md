# PDP Integration Architecture Guide

## Complete Multi-PDP Integration System for French E-Invoicing SaaS

This guide covers the comprehensive PDP integration system designed for your French e-invoicing MVP, optimized for the €30-40/month PDP budget and Supabase ecosystem.

## Architecture Overview

### 1. Database Schema (`supabase/migrations/003_pdp_integration.sql`)

**Core Tables:**
- `pdp_providers` - Certified PDP provider configurations
- `customer_pdp_settings` - Company OAuth2 tokens and preferences
- `pdp_submissions` - Invoice submission tracking with status
- `pdp_health_logs` - Health monitoring and incident tracking
- `pdp_cost_budgets` - Budget management and alerts

**Key Features:**
- Row Level Security (RLS) for data isolation
- Encrypted OAuth2 token storage
- Automatic cost tracking and budget alerts
- Health metrics with success rate calculation

### 2. OAuth2 Authentication (`lib/pdp/oauth2-client.ts`)

**Capabilities:**
- Secure OAuth2 flow for all 4 PDP partners
- Automatic token refresh with 5-minute buffer
- Encrypted token storage using AES-256-GCM
- Connection testing and token validation
- State parameter verification for security

**Supported PDPs:**
- **Docaposte**: €0.15-0.30/invoice, 100 min volume
- **e-Dune**: €0.10-0.25/invoice, 0 min volume (SME focused)
- **Generix**: €0.20-0.40/invoice, 50 min volume (EDI expertise)
- **Tenor**: €0.15-0.35/invoice, 0 min volume (Multi-country)

### 3. Multi-PDP Routing Engine (`lib/pdp/routing-engine.ts`)

**Smart Selection Algorithm:**
- Health score (40% weight): Success rate × availability
- Cost score (30% weight): Price competitiveness
- Volume compatibility (20% weight): Minimum volume requirements
- Priority adjustment (10% weight): User preferences

**Automatic Failover:**
- Circuit breaker pattern for failed providers
- Maximum 3 failover attempts with different providers
- Health status tracking for intelligent routing
- Fallback to degraded but functional providers in emergencies

### 4. Invoice Submission Workflow (`supabase/functions/submit-invoice-to-pdp/index.ts`)

**Process Flow:**
1. **Factur-X Generation**: Create compliant PDF with embedded XML
2. **PDP Selection**: Use routing engine for optimal provider
3. **OAuth2 Authentication**: Get/refresh valid access token
4. **Submission**: POST to PDP API with retry logic
5. **Status Tracking**: Real-time status updates via webhooks/polling
6. **Error Handling**: Comprehensive error classification and recovery

**Status States:**
- `pending` → `submitted` → `processing` → `delivered`
- Failed states: `failed`, `rejected` with detailed error context

### 5. Error Handling & Retry System (`lib/pdp/error-handler.ts`)

**Error Classification:**
- **Authentication**: `INVALID_TOKEN`, `TOKEN_EXPIRED`, `INSUFFICIENT_SCOPE`
- **Business**: `DUPLICATE_INVOICE`, `COMPLIANCE_ERROR`, `INSUFFICIENT_BALANCE`
- **Network**: `TIMEOUT`, `CONNECTION_ERROR`, `RATE_LIMITED`
- **System**: `API_UNAVAILABLE`, `MAINTENANCE_MODE`

**Retry Strategies:**
- **Exponential Backoff**: Network/availability errors (max 30s delay)
- **Linear Backoff**: Rate limiting with custom delay
- **Immediate**: Token refresh scenarios
- **No Retry**: Business logic errors, duplicates

### 6. Health Monitoring (`supabase/functions/pdp-health-monitor/index.ts`)

**Monitoring Features:**
- API health checks every 5 minutes
- Success rate tracking (24-hour rolling window)
- Response time monitoring with SLA tracking
- Automatic status updates: `healthy` → `degraded` → `down`
- Slack webhook alerts for critical issues

**Cost Optimization:**
- Budget threshold alerts (75%, 90%, 100%)
- Cost spike detection (>50% increase month-over-month)
- Automatic recommendations for cheaper providers
- Volume optimization suggestions

## Budget Optimization Strategy

### Cost Allocation Within €30-40/month

**Recommended Distribution:**
- **e-Dune** (Primary): €15-20/month (~100-150 invoices)
- **Tenor** (Backup): €10-15/month (~40-75 invoices) 
- **Reserve Buffer**: €5-10/month for overages

**Volume-Based Routing:**
```typescript
const selectPDP = (volume: number, budget: number) => {
  if (volume < 50) return 'edune'      // €0.25/invoice max
  if (volume < 100) return 'tenor'     // €0.35/invoice max
  if (budget > 35) return 'docaposte'  // €0.30/invoice, better reliability
  return 'edune' // Default cost-effective option
}
```

### Cost Monitoring & Alerts

**Automated Budget Management:**
- Real-time cost tracking per submission
- Projected monthly spend calculations
- Automatic provider switching when approaching budget limits
- Customer notifications before budget overruns

## Security Implementation

### Data Protection
- **Encryption**: AES-256-GCM for OAuth2 tokens
- **Access Control**: Row Level Security (RLS) policies
- **Audit Trail**: Complete submission and authentication logs
- **RGPD Compliance**: 10-year invoice retention with automated deletion

### API Security
- **Rate Limiting**: Respect PDP limits with client-side throttling
- **Timeout Handling**: 30-second maximum request timeout
- **Input Validation**: Comprehensive data sanitization
- **Error Handling**: No sensitive data exposure in error messages

## Integration Setup Guide

### 1. Environment Variables

```bash
# OAuth2 Credentials (obtain from each PDP)
DOCAPOSTE_CLIENT_ID=your_docaposte_client_id
DOCAPOSTE_CLIENT_SECRET=your_docaposte_secret
EDUNE_CLIENT_ID=your_edune_client_id
EDUNE_CLIENT_SECRET=your_edune_secret
GENERIX_CLIENT_ID=your_generix_client_id
GENERIX_CLIENT_SECRET=your_generix_secret
TENOR_CLIENT_ID=your_tenor_client_id
TENOR_CLIENT_SECRET=your_tenor_secret

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Monitoring
SLACK_WEBHOOK_URL=https://hooks.slack.com/your/webhook/url
```

### 2. Database Migration

```bash
# Apply PDP integration schema
supabase db reset
# Run migration: 003_pdp_integration.sql
```

### 3. Edge Functions Deployment

```bash
# Deploy all PDP-related functions
supabase functions deploy submit-invoice-to-pdp
supabase functions deploy pdp-health-monitor

# Set up cron job for health monitoring
SELECT cron.schedule('pdp-health-check', '*/5 * * * *', 
  'SELECT net.http_post(url := ''https://your-project.supabase.co/functions/v1/pdp-health-monitor'', headers := ''{"Authorization": "Bearer ' || :service_role_key || '"}''::jsonb, body := ''{}''::jsonb);'
);
```

### 4. PDP Partner Registration

**For each PDP provider:**
1. Register application in PDP developer portal
2. Configure OAuth2 redirect URI: `https://your-domain.com/api/auth/pdp/callback`
3. Request production API access and certification
4. Set up webhook endpoints (if supported)
5. Configure rate limiting and monitoring

## Usage Examples

### Frontend Integration

```typescript
import { PDPApiClient } from '@/lib/pdp/api-client'

const pdpClient = new PDPApiClient()

// Authenticate with PDP
const { authUrl } = await pdpClient.initiatePDPAuth('edune', companyId)
window.location.href = authUrl

// Submit invoice
const result = await pdpClient.submitInvoice(invoiceId, companyId, {
  priority: 'cost',
  preferred_pdp_slug: 'edune'
})

if (result.success) {
  console.log(`Invoice submitted to ${result.pdp_provider}`)
  console.log(`Submission ID: ${result.submission_id}`)
  console.log(`Cost: €${result.cost}`)
}
```

### Health Monitoring Dashboard

```typescript
// Get health report for admin dashboard
const healthReport = await pdpClient.getHealthReport()

console.log(`${healthReport.overview.healthy_providers}/${healthReport.overview.total_providers} PDPs healthy`)
console.log(`Average success rate: ${(healthReport.overview.avg_success_rate * 100).toFixed(1)}%`)
```

### Cost Optimization

```typescript
// Get cost recommendations
const recommendations = await pdpClient.getCostOptimizationRecommendations(companyId)

console.log(`Current month: €${recommendations.current_month_cost}`)
console.log(`Projected: €${recommendations.projected_monthly_cost}`)

recommendations.recommendations.forEach(rec => {
  console.log(`${rec.type}: ${rec.description} (Save €${rec.potential_saving})`)
})
```

## Compliance & Certification

### French E-Invoicing Requirements
- **Factur-X Format**: EN16931 compliant XML embedded in PDF/A-3
- **PDP Certification**: All integrated providers are government-certified
- **Data Residency**: Invoice data stored in EU-compliant Supabase regions
- **Audit Trail**: Complete submission logs for regulatory inspection

### RGPD Compliance
- **Data Minimization**: Only essential business data collected
- **Consent Management**: Clear opt-in for PDP authentication
- **Right to Erasure**: Automated data deletion after retention period
- **Data Portability**: API access for data export

## Performance Optimization

### Caching Strategy
- **Provider Health**: 5-minute cache for health status
- **OAuth2 Tokens**: Secure memory cache with automatic refresh
- **Cost Calculations**: Daily cache for budget projections

### Database Optimization
- **Indexes**: Optimized for submission queries and health logs
- **Partitioning**: Monthly partitions for submission history
- **Cleanup**: Automated cleanup of expired OAuth states

## Monitoring & Alerting

### Key Metrics
- **Submission Success Rate**: Target >95% across all PDPs
- **Average Response Time**: Target <5 seconds for submissions
- **Cost Per Invoice**: Track against €0.30 target average
- **Failover Rate**: Monitor automatic failover frequency

### Alert Scenarios
- **PDP Down**: Immediate Slack notification
- **Budget 90% Reached**: Email to company admin
- **Authentication Expired**: In-app notification
- **Cost Spike**: Email alert with optimization suggestions

## Troubleshooting Guide

### Common Issues

**OAuth2 Authentication Fails:**
```bash
# Check environment variables
echo $EDUNE_CLIENT_ID
# Verify redirect URI in PDP console
# Check network connectivity to PDP auth servers
```

**Submission Timeouts:**
```bash
# Check PDP health status
curl https://api.e-dune.com/health
# Review submission logs in pdp_submissions table
# Check for rate limiting in error logs
```

**High Costs:**
```bash
# Analyze cost breakdown by PDP
SELECT pdp_providers.name, SUM(cost), COUNT(*) 
FROM pdp_submissions 
JOIN pdp_providers ON pdp_provider_id = pdp_providers.id 
WHERE submitted_at >= date_trunc('month', now()) 
GROUP BY pdp_providers.name;
```

This comprehensive PDP integration system ensures reliable, cost-effective invoice submission while maintaining compliance with French e-invoicing regulations and staying within your €30-40/month PDP budget.