'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { validateSIREN, validateFrenchVAT } from '@/lib/validations/french-business'

interface LoginFormData {
  email: string
  password: string
  redirectTo?: string
}

interface RegisterFormData {
  email: string
  password: string
  companyName: string
  siren: string
  vatNumber?: string
  address: string
  postalCode: string
  city: string
  contactName: string
  phone?: string
}

export async function login(formData: LoginFormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(formData.redirectTo || '/dashboard')
}

export async function register(formData: RegisterFormData) {
  const supabase = await createClient()

  // Validate SIREN
  if (!validateSIREN(formData.siren)) {
    return { error: 'Numéro SIREN invalide. Veuillez vérifier le format.' }
  }

  // Validate VAT number if provided
  if (formData.vatNumber && !validateFrenchVAT(formData.vatNumber)) {
    return { error: 'Numéro de TVA invalide. Format attendu : FR + 11 chiffres.' }
  }

  // Create user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        company_name: formData.companyName,
        contact_name: formData.contactName,
      }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Erreur lors de la création du compte utilisateur.' }
  }

  // Create company record
  const { error: companyError } = await supabase
    .from('companies')
    .insert({
      id: authData.user.id,
      name: formData.companyName,
      siren: formData.siren,
      vat_number: formData.vatNumber || null,
      address: formData.address,
      postal_code: formData.postalCode,
      city: formData.city,
      country: 'FR',
      contact_name: formData.contactName,
      contact_email: formData.email,
      phone: formData.phone || null,
      compliance_status: 'setup_required',
      subscription_tier: 'starter',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (companyError) {
    // If company creation fails, we should clean up the auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: 'Erreur lors de la création de l\'entreprise. Veuillez réessayer.' }
  }

  return { success: true, message: 'Compte créé avec succès. Veuillez vérifier votre email pour confirmer votre inscription.' }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Instructions de réinitialisation envoyées par email.' }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Mot de passe mis à jour avec succès.' }
}