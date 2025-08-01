'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { validateSIREN, validateSIRET, validateFrenchVAT } from '@/lib/validations/french-business'

interface BusinessInfo {
  companyName: string
  siren: string
  siret?: string
  vatNumber?: string
  activityCode?: string
  legalForm?: string
}

interface FrenchBusinessFormProps {
  value?: BusinessInfo
  onChange: (info: BusinessInfo) => void
  required?: boolean
  className?: string
  showSiret?: boolean
  showActivityCode?: boolean
}

export function FrenchBusinessForm({ 
  value = { companyName: '', siren: '', siret: '', vatNumber: '' }, 
  onChange, 
  required = false,
  className = '',
  showSiret = false,
  showActivityCode = false
}: FrenchBusinessFormProps) {
  const [businessInfo, setBusinessInfo] = useState(value)
  const [validation, setValidation] = useState({
    siren: { isValid: false, message: '' },
    siret: { isValid: false, message: '' },
    vat: { isValid: false, message: '' }
  })
  const [isLookingUp, setIsLookingUp] = useState(false)

  useEffect(() => {
    onChange(businessInfo)
  }, [businessInfo, onChange])

  useEffect(() => {
    // Validate SIREN
    if (businessInfo.siren) {
      const isValidSiren = validateSIREN(businessInfo.siren)
      setValidation(prev => ({
        ...prev,
        siren: {
          isValid: isValidSiren,
          message: isValidSiren ? 'SIREN valide' : 'SIREN invalide (9 chiffres requis)'
        }
      }))

      // Auto-generate SIRET from SIREN (would typically lookup from API)
      if (isValidSiren && !businessInfo.siret) {
        // Mock SIRET generation - in production, lookup from API
        const mockSiret = businessInfo.siren + '00012'
        setBusinessInfo(prev => ({ ...prev, siret: mockSiret }))
      }
    } else {
      setValidation(prev => ({
        ...prev,
        siren: { isValid: false, message: '' }
      }))
    }

    // Validate SIRET
    if (businessInfo.siret) {
      const isValidSiret = validateSIRET(businessInfo.siret)
      setValidation(prev => ({
        ...prev,
        siret: {
          isValid: isValidSiret,
          message: isValidSiret ? 'SIRET valide' : 'SIRET invalide (14 chiffres requis)'
        }
      }))
    }

    // Validate VAT
    if (businessInfo.vatNumber) {
      const isValidVat = validateFrenchVAT(businessInfo.vatNumber)
      setValidation(prev => ({
        ...prev,
        vat: {
          isValid: isValidVat,
          message: isValidVat ? 'N° TVA valide' : 'Format invalide (FR + 11 chiffres)'
        }
      }))
    } else {
      setValidation(prev => ({
        ...prev,
        vat: { isValid: false, message: '' }
      }))
    }
  }, [businessInfo.siren, businessInfo.siret, businessInfo.vatNumber])

  const handleSirenChange = async (siren: string) => {
    // Only allow digits and limit to 9 characters
    const cleaned = siren.replace(/\D/g, '').slice(0, 9)
    setBusinessInfo(prev => ({ ...prev, siren: cleaned }))

    // Auto-lookup company information
    if (cleaned.length === 9 && validateSIREN(cleaned)) {
      setIsLookingUp(true)
      try {
        const companyInfo = await lookupCompanyBySiren(cleaned)
        if (companyInfo) {
          setBusinessInfo(prev => ({
            ...prev,
            companyName: companyInfo.name || prev.companyName,
            siret: companyInfo.siret || prev.siret,
            activityCode: companyInfo.activityCode || prev.activityCode,
            legalForm: companyInfo.legalForm || prev.legalForm
          }))
        }
      } catch (error) {
        console.error('Error looking up company:', error)
      } finally {
        setIsLookingUp(false)
      }
    }
  }

  const handleVatNumberChange = (vat: string) => {
    // Format VAT number: FR + digits
    let formatted = vat.toUpperCase()
    if (!formatted.startsWith('FR') && formatted.length > 0) {
      formatted = 'FR' + formatted.replace(/[^0-9]/g, '')
    }
    if (formatted.length > 13) {
      formatted = formatted.slice(0, 13)
    }
    setBusinessInfo(prev => ({ ...prev, vatNumber: formatted }))
  }

  const getValidationIcon = (field: 'siren' | 'siret' | 'vat') => {
    const val = validation[field]
    if (!val.message) return null
    
    return val.isValid ? (
      <CheckCircle className="h-4 w-4 text-compliance-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-urgent-red-600" />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Building className="h-5 w-5 text-french-blue-600" />
        <Label className="text-base font-medium">Identification entreprise</Label>
        {required && <span className="text-urgent-red-500">*</span>}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="companyName" className="text-sm">
            Raison sociale {required && <span className="text-urgent-red-500">*</span>}
          </Label>
          <Input
            id="companyName"
            value={businessInfo.companyName}
            onChange={(e) => setBusinessInfo(prev => ({ ...prev, companyName: e.target.value }))}
            placeholder="Votre Entreprise SARL"
            required={required}
            className="mt-1"
            disabled={isLookingUp}
          />
        </div>

        <div>
          <Label htmlFor="siren" className="text-sm flex items-center gap-2">
            Numéro SIREN {required && <span className="text-urgent-red-500">*</span>}
            {getValidationIcon('siren')}
          </Label>
          <Input
            id="siren"
            value={businessInfo.siren}
            onChange={(e) => handleSirenChange(e.target.value)}
            placeholder="123456789"
            maxLength={9}
            required={required}
            className={`mt-1 ${
              businessInfo.siren && !validation.siren.isValid 
                ? 'border-urgent-red-500' 
                : businessInfo.siren && validation.siren.isValid
                ? 'border-compliance-green-500'
                : ''
            }`}
          />
          {validation.siren.message && (
            <p className={`text-xs mt-1 ${
              validation.siren.isValid ? 'text-compliance-green-600' : 'text-urgent-red-600'
            }`}>
              {validation.siren.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            <Info className="inline h-3 w-3 mr-1" />
            Le SIREN identifie votre entreprise de manière unique (9 chiffres)
          </p>
        </div>

        {showSiret && (
          <div>
            <Label htmlFor="siret" className="text-sm flex items-center gap-2">
              Numéro SIRET
              {getValidationIcon('siret')}
            </Label>
            <Input
              id="siret"
              value={businessInfo.siret || ''}
              onChange={(e) => setBusinessInfo(prev => ({ 
                ...prev, 
                siret: e.target.value.replace(/\D/g, '').slice(0, 14) 
              }))}
              placeholder="12345678900012"
              maxLength={14}
              className={`mt-1 ${
                businessInfo.siret && !validation.siret.isValid 
                  ? 'border-urgent-red-500' 
                  : businessInfo.siret && validation.siret.isValid
                  ? 'border-compliance-green-500'
                  : ''
              }`}
            />
            {validation.siret.message && (
              <p className={`text-xs mt-1 ${
                validation.siret.isValid ? 'text-compliance-green-600' : 'text-urgent-red-600'
              }`}>
                {validation.siret.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Le SIRET identifie votre établissement (SIREN + 5 chiffres)
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="vatNumber" className="text-sm flex items-center gap-2">
            Numéro de TVA (optionnel)
            {getValidationIcon('vat')}
          </Label>
          <Input
            id="vatNumber"
            value={businessInfo.vatNumber || ''}
            onChange={(e) => handleVatNumberChange(e.target.value)}
            placeholder="FR12345678901"
            className={`mt-1 ${
              businessInfo.vatNumber && !validation.vat.isValid 
                ? 'border-urgent-red-500' 
                : businessInfo.vatNumber && validation.vat.isValid
                ? 'border-compliance-green-500'
                : ''
            }`}
          />
          {validation.vat.message && (
            <p className={`text-xs mt-1 ${
              validation.vat.isValid ? 'text-compliance-green-600' : 'text-urgent-red-600'
            }`}>
              {validation.vat.message}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Requis si votre entreprise est assujettie à la TVA
          </p>
        </div>

        {showActivityCode && businessInfo.activityCode && (
          <div>
            <Label className="text-sm">Code d'activité APE/NAF</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="font-mono">
                {businessInfo.activityCode}
              </Badge>
            </div>
          </div>
        )}

        {businessInfo.legalForm && (
          <div>
            <Label className="text-sm">Forme juridique</Label>
            <div className="mt-1">
              <Badge variant="outline">
                {businessInfo.legalForm}
              </Badge>
            </div>
          </div>
        )}

        {isLookingUp && (
          <div className="bg-french-blue-50 border border-french-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-french-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-french-blue-700">
                Recherche des informations de l'entreprise...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock function - in production, this would call the INSEE Sirene API
async function lookupCompanyBySiren(siren: string): Promise<{
  name: string
  siret: string
  activityCode: string
  legalForm: string
} | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock company data
  const mockData: Record<string, any> = {
    '123456789': {
      name: 'ENTREPRISE EXEMPLE SARL',
      siret: '12345678900012',
      activityCode: '6201Z',
      legalForm: 'SARL'
    },
    '987654321': {
      name: 'SOCIÉTÉ TEST SAS',
      siret: '98765432100015',
      activityCode: '7022Z',
      legalForm: 'SAS'
    }
  }

  return mockData[siren] || null
}