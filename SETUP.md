# FactureFrance - Configuration Setup

## Quick Setup Guide

### 1. Environment Variables

Copy the example environment file and configure your values:

```bash
cp .env.example .env.local
```

### 2. Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update `.env.local` with your Supabase credentials
4. Run the database migrations:

```bash
# Install Supabase CLI if not already installed
npm install -g @supabase/cli

# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-id

# Push the schema
supabase db push
```

### 3. Required Environment Variables

**Essential for development:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (for admin operations)
- `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for dev)

**Optional for production:**
- PDP configuration for invoice transmission
- Email service configuration
- Monitoring and analytics

### 4. Database Setup

The database schema is automatically created with the migration files in `supabase/migrations/`.

Key tables:
- `companies`: Company information with SIREN validation
- `invoices`: Invoice storage with Factur-X compliance
- `customers`: Customer management
- `pdp_connections`: PDP provider configurations

### 5. Run Development Server

```bash
npm run dev
```

Your application will be available at http://localhost:3000

### 6. Testing the Authentication Flow

1. Go to http://localhost:3000
2. Click "Créer un compte entreprise"
3. Fill in the company registration form with:
   - Valid SIREN number (9 digits)
   - French address
   - Contact information
4. Verify email confirmation works
5. Test login flow

## Production Deployment Checklist

- [ ] Configure PDP provider credentials
- [ ] Set up email service (Resend recommended)
- [ ] Configure file storage bucket
- [ ] Add monitoring (Sentry)
- [ ] Set up SSL certificates
- [ ] Configure domain and DNS
- [ ] Test RGPD compliance features
- [ ] Validate Factur-X generation
- [ ] Test invoice archival (10-year requirement)

## French Compliance Features

This application includes:
- ✅ SIREN/SIRET validation
- ✅ French VAT number validation
- ✅ RGPD-compliant data storage
- ✅ French business address validation
- ✅ 10-year invoice archival
- ✅ Factur-X/ZUGFeRD generation
- ✅ Multi-PDP integration support
- ✅ French user interface and messaging

## Support

For technical support or questions about French e-invoicing compliance, refer to the documentation or contact the development team.