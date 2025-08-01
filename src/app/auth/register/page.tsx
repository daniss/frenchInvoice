'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Building, Mail, Lock, User, Phone, MapPin, Shield, CheckCircle } from 'lucide-react'
import { register } from '@/lib/auth/actions'
import { validateSIREN, validateFrenchVAT } from '@/lib/validations/french-business'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    siren: '',
    vatNumber: '',
    address: '',
    postalCode: '',
    city: '',
    contactName: '',
    phone: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'L\'adresse email est requise'
    if (!formData.email.includes('@')) newErrors.email = 'Format d\'email invalide'
    
    if (!formData.password) newErrors.password = 'Le mot de passe est requis'
    if (formData.password.length < 8) newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    if (!formData.companyName) newErrors.companyName = 'Le nom de l\'entreprise est requis'
    
    if (!formData.siren) {
      newErrors.siren = 'Le numéro SIREN est requis'
    } else if (!validateSIREN(formData.siren)) {
      newErrors.siren = 'Format SIREN invalide (9 chiffres)'
    }

    if (formData.vatNumber && !validateFrenchVAT(formData.vatNumber)) {
      newErrors.vatNumber = 'Format TVA invalide (FR + 11 chiffres)'
    }

    if (!formData.address) newErrors.address = 'L\'adresse est requise'
    if (!formData.postalCode) newErrors.postalCode = 'Le code postal est requis'
    if (!formData.city) newErrors.city = 'La ville est requise'
    if (!formData.contactName) newErrors.contactName = 'Le nom du contact est requis'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const result = await register(formData)

      if (result?.error) {
        setErrors({ general: result.error })
      } else if (result?.success) {
        setSuccess(result.message || 'Compte créé avec succès !')
      }
    } catch (err) {
      setErrors({ general: 'Une erreur inattendue s\'est produite. Veuillez réessayer.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-compliance-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-compliance-green-600" />
            </div>
            <CardTitle className="text-xl text-compliance-green-800">
              Compte créé avec succès !
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{success}</p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-french-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">FactureFrance</h1>
              <p className="text-sm text-gray-600">Facturation électronique</p>
            </div>
          </div>
          
          <Badge variant="warning" className="mb-4">
            Conformité 2026 - Préparez-vous dès maintenant
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Créer votre compte entreprise
            </CardTitle>
            <CardDescription className="text-center">
              Rejoignez les entreprises qui anticipent la réglementation 2026
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-urgent-red-50 border border-urgent-red-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-urgent-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-urgent-red-700">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  <Mail className="inline h-5 w-5 mr-2" />
                  Informations de connexion
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email">Adresse email professionnelle *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@votreentreprise.fr"
                      className={errors.email ? 'border-urgent-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-urgent-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Mot de passe *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="••••••••"
                        className={errors.password ? 'border-urgent-red-500' : ''}
                      />
                      {errors.password && <p className="text-sm text-urgent-red-600 mt-1">{errors.password}</p>}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="••••••••"
                        className={errors.confirmPassword ? 'border-urgent-red-500' : ''}
                      />
                      {errors.confirmPassword && <p className="text-sm text-urgent-red-600 mt-1">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  <Building className="inline h-5 w-5 mr-2" />
                  Informations entreprise
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Votre Entreprise SARL"
                      className={errors.companyName ? 'border-urgent-red-500' : ''}
                    />
                    {errors.companyName && <p className="text-sm text-urgent-red-600 mt-1">{errors.companyName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siren">Numéro SIREN *</Label>
                      <Input
                        id="siren"
                        value={formData.siren}
                        onChange={(e) => handleInputChange('siren', e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="123456789"
                        maxLength={9}
                        className={errors.siren ? 'border-urgent-red-500' : ''}
                      />
                      {errors.siren && <p className="text-sm text-urgent-red-600 mt-1">{errors.siren}</p>}
                    </div>

                    <div>
                      <Label htmlFor="vatNumber">Numéro de TVA (optionnel)</Label>
                      <Input
                        id="vatNumber"
                        value={formData.vatNumber}
                        onChange={(e) => handleInputChange('vatNumber', e.target.value.toUpperCase())}
                        placeholder="FR12345678901"
                        className={errors.vatNumber ? 'border-urgent-red-500' : ''}
                      />
                      {errors.vatNumber && <p className="text-sm text-urgent-red-600 mt-1">{errors.vatNumber}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  <MapPin className="inline h-5 w-5 mr-2" />
                  Adresse de l'entreprise
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 rue de la République"
                      className={errors.address ? 'border-urgent-red-500' : ''}
                    />
                    {errors.address && <p className="text-sm text-urgent-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                        placeholder="75001"
                        maxLength={5}
                        className={errors.postalCode ? 'border-urgent-red-500' : ''}
                      />
                      {errors.postalCode && <p className="text-sm text-urgent-red-600 mt-1">{errors.postalCode}</p>}
                    </div>

                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Paris"
                        className={errors.city ? 'border-urgent-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-urgent-red-600 mt-1">{errors.city}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  <User className="inline h-5 w-5 mr-2" />
                  Contact principal
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Nom du contact *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange('contactName', e.target.value)}
                        placeholder="Jean Dupont"
                        className={errors.contactName ? 'border-urgent-red-500' : ''}
                      />
                      {errors.contactName && <p className="text-sm text-urgent-red-600 mt-1">{errors.contactName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone (optionnel)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="01 23 45 67 89"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-french-blue-600 hover:bg-french-blue-700"
              >
                {isLoading ? 'Création du compte...' : 'Créer mon compte entreprise'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-french-blue-600 hover:text-french-blue-700 hover:underline"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                En créant un compte, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                <br />
                🔒 Données sécurisées • 🇫🇷 Hébergement France • ✓ RGPD conforme
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}