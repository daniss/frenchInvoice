'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'

interface FrenchAddress {
  address: string
  postalCode: string
  city: string
  country: string
}

interface FrenchAddressFormProps {
  value?: FrenchAddress
  onChange: (address: FrenchAddress) => void
  required?: boolean
  className?: string
}

export function FrenchAddressForm({ 
  value = { address: '', postalCode: '', city: '', country: 'FR' }, 
  onChange, 
  required = false,
  className = '' 
}: FrenchAddressFormProps) {
  const [address, setAddress] = useState(value)
  const [isValidating, setIsValidating] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    onChange(address)
  }, [address, onChange])

  const validatePostalCode = (postalCode: string) => {
    // French postal codes: 5 digits, first 2 digits correspond to department
    const regex = /^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/
    return regex.test(postalCode)
  }

  const handlePostalCodeChange = async (postalCode: string) => {
    // Only allow digits and limit to 5 characters
    const cleaned = postalCode.replace(/\D/g, '').slice(0, 5)
    setAddress(prev => ({ ...prev, postalCode: cleaned }))

    // Auto-suggest cities based on postal code
    if (cleaned.length === 5 && validatePostalCode(cleaned)) {
      setIsValidating(true)
      try {
        // This would typically call a French postal code API
        // For now, we'll use a simple mock
        const mockCities = await getMockCitiesForPostalCode(cleaned)
        setSuggestions(mockCities)
      } catch (error) {
        console.error('Error fetching cities:', error)
      } finally {
        setIsValidating(false)
      }
    } else {
      setSuggestions([])
    }
  }

  const formatFrenchAddress = (addr: FrenchAddress) => {
    return `${addr.address}, ${addr.postalCode} ${addr.city}, France`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-french-blue-600" />
        <Label className="text-base font-medium">Adresse française</Label>
        {required && <span className="text-urgent-red-500">*</span>}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="address" className="text-sm">
            Numéro et rue {required && <span className="text-urgent-red-500">*</span>}
          </Label>
          <Input
            id="address"
            value={address.address}
            onChange={(e) => setAddress(prev => ({ ...prev, address: e.target.value }))}
            placeholder="123 rue de la République"
            required={required}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2">
            <Label htmlFor="postalCode" className="text-sm">
              Code postal {required && <span className="text-urgent-red-500">*</span>}
            </Label>
            <Input
              id="postalCode"
              value={address.postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="75001"
              maxLength={5}
              required={required}
              className={`mt-1 ${
                address.postalCode && !validatePostalCode(address.postalCode) 
                  ? 'border-urgent-red-500' 
                  : ''
              }`}
            />
            {address.postalCode && !validatePostalCode(address.postalCode) && (
              <p className="text-xs text-urgent-red-600 mt-1">
                Code postal invalide (format: 75001)
              </p>
            )}
          </div>

          <div className="col-span-3">
            <Label htmlFor="city" className="text-sm">
              Ville {required && <span className="text-urgent-red-500">*</span>}
            </Label>
            <div className="relative mt-1">
              <Input
                id="city"
                value={address.city}
                onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Paris"
                required={required}
                className={isValidating ? 'pr-8' : ''}
              />
              {isValidating && (
                <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </div>
            
            {suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {suggestions.map((city, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-french-blue-50 focus:outline-none first:rounded-t-md last:rounded-b-md"
                    onClick={() => {
                      setAddress(prev => ({ ...prev, city }))
                      setSuggestions([])
                    }}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>Adresse formatée :</strong> {formatFrenchAddress(address)}
        </div>
      </div>
    </div>
  )
}

// Mock function - in production, this would call a real API
async function getMockCitiesForPostalCode(postalCode: string): Promise<string[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Mock data based on common French postal codes
  const mockData: Record<string, string[]> = {
    '75001': ['Paris 1er'],
    '75002': ['Paris 2e'],
    '75003': ['Paris 3e'],
    '69001': ['Lyon 1er'],
    '69002': ['Lyon 2e'],
    '13001': ['Marseille 1er'],
    '13002': ['Marseille 2e'],
    '33000': ['Bordeaux'],
    '59000': ['Lille'],
    '31000': ['Toulouse'],
    '44000': ['Nantes'],
    '67000': ['Strasbourg'],
    '34000': ['Montpellier'],
    '06000': ['Nice'],
  }

  return mockData[postalCode] || []
}