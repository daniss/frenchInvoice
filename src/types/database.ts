export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          user_id: string
          siren: string
          siret: string | null
          name: string
          legal_form: string | null
          vat_number: string | null
          address: string
          postal_code: string
          city: string
          phone: string | null
          email: string
          pdp_id: string | null
          subscription_tier: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          siren: string
          siret?: string | null
          name: string
          legal_form?: string | null
          vat_number?: string | null
          address: string
          postal_code: string
          city: string
          phone?: string | null
          email: string
          pdp_id?: string | null
          subscription_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          siren?: string
          siret?: string | null
          name?: string
          legal_form?: string | null
          vat_number?: string | null
          address?: string
          postal_code?: string
          city?: string
          phone?: string | null
          email?: string
          pdp_id?: string | null
          subscription_tier?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          company_id: string
          siren: string | null
          siret: string | null
          name: string
          vat_number: string | null
          address: string
          postal_code: string
          city: string
          country: string
          phone: string | null
          email: string | null
          payment_terms: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          siren?: string | null
          siret?: string | null
          name: string
          vat_number?: string | null
          address: string
          postal_code: string
          city: string
          country?: string
          phone?: string | null
          email?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          siren?: string | null
          siret?: string | null
          name?: string
          vat_number?: string | null
          address?: string
          postal_code?: string
          city?: string
          country?: string
          phone?: string | null
          email?: string | null
          payment_terms?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          company_id: string
          customer_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          currency: string
          total_amount_excl_vat: number
          total_vat_amount: number
          total_amount_incl_vat: number
          vat_rate: number
          payment_terms: number
          description: string
          notes: string | null
          status: 'draft' | 'generated' | 'submitted' | 'delivered' | 'paid' | 'failed'
          facturx_level: 'minimum' | 'basic' | 'comfort' | 'extended'
          xml_content: string | null
          pdf_url: string | null
          facturx_url: string | null
          pdp_submission_id: string | null
          pdp_status: string | null
          submitted_at: string | null
          delivered_at: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          customer_id: string
          invoice_number: string
          issue_date: string
          due_date: string
          currency?: string
          total_amount_excl_vat: number
          total_vat_amount: number
          total_amount_incl_vat: number
          vat_rate: number
          payment_terms: number
          description: string
          notes?: string | null
          status?: 'draft' | 'generated' | 'submitted' | 'delivered' | 'paid' | 'failed'
          facturx_level?: 'minimum' | 'basic' | 'comfort' | 'extended'
          xml_content?: string | null
          pdf_url?: string | null
          facturx_url?: string | null
          pdp_submission_id?: string | null
          pdp_status?: string | null
          submitted_at?: string | null
          delivered_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          customer_id?: string
          invoice_number?: string
          issue_date?: string
          due_date?: string
          currency?: string
          total_amount_excl_vat?: number
          total_vat_amount?: number
          total_amount_incl_vat?: number
          vat_rate?: number
          payment_terms?: number
          description?: string
          notes?: string | null
          status?: 'draft' | 'generated' | 'submitted' | 'delivered' | 'paid' | 'failed'
          facturx_level?: 'minimum' | 'basic' | 'comfort' | 'extended'
          xml_content?: string | null
          pdf_url?: string | null
          facturx_url?: string | null
          pdp_submission_id?: string | null
          pdp_status?: string | null
          submitted_at?: string | null
          delivered_at?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_archive: {
        Row: {
          id: string
          invoice_id: string
          file_hash: string
          retention_until: string
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          file_hash: string
          retention_until: string
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          file_hash?: string
          retention_until?: string
          created_at?: string
        }
      }
      pdp_providers: {
        Row: {
          id: string
          name: string
          api_url: string
          oauth_url: string
          min_volume: number
          price_per_invoice: number
          is_active: boolean
          supports_facturx: boolean
          certification_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          api_url: string
          oauth_url: string
          min_volume?: number
          price_per_invoice: number
          is_active?: boolean
          supports_facturx?: boolean
          certification_status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          api_url?: string
          oauth_url?: string
          min_volume?: number
          price_per_invoice?: number
          is_active?: boolean
          supports_facturx?: boolean
          certification_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      pdp_connections: {
        Row: {
          id: string
          company_id: string
          provider_id: string
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          is_active: boolean
          last_health_check: string | null
          health_status: 'healthy' | 'warning' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          provider_id: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          last_health_check?: string | null
          health_status?: 'healthy' | 'warning' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          provider_id?: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          is_active?: boolean
          last_health_check?: string | null
          health_status?: 'healthy' | 'warning' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
      compliance_audit_log: {
        Row: {
          id: string
          company_id: string
          event_type: string
          event_data: Json
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          event_type: string
          event_data: Json
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          event_type?: string
          event_data?: Json
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      performance_metrics: {
        Row: {
          id: string
          invoice_id: string | null
          metric_type: string
          value: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          metric_type: string
          value: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string | null
          metric_type?: string
          value?: number
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      invoice_status: 'draft' | 'generated' | 'submitted' | 'delivered' | 'paid' | 'failed'
      facturx_level: 'minimum' | 'basic' | 'comfort' | 'extended'
      subscription_tier: 'free' | 'starter' | 'professional' | 'business'
      health_status: 'healthy' | 'warning' | 'error'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}