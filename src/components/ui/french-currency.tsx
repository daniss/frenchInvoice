'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Euro, Calculator, Info } from 'lucide-react'
import { formatFrenchCurrency } from '@/lib/utils/french-formatting'

interface CurrencyInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  required?: boolean
  className?: string
  showVAT?: boolean
  vatRate?: number
  disabled?: boolean
}

export function FrenchCurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0,00",
  required = false,
  className = "",
  showVAT = false,
  vatRate = 20,
  disabled = false
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [vatAmount, setVatAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    // Format display value with French decimal separator
    setDisplayValue(value > 0 ? formatNumberForInput(value) : '')
    
    if (showVAT) {
      const vat = (value * vatRate) / 100
      setVatAmount(vat)
      setTotalAmount(value + vat)
    }
  }, [value, vatRate, showVAT])

  const formatNumberForInput = (num: number): string => {
    return num.toFixed(2).replace('.', ',')
  }

  const parseNumberFromInput = (str: string): number => {
    // Convert French format (123,45) to JavaScript number
    const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleInputChange = (inputValue: string) => {
    setDisplayValue(inputValue)
    const numericValue = parseNumberFromInput(inputValue)
    onChange(numericValue)
  }

  const handleBlur = () => {
    // Reformat on blur for consistency
    if (value > 0) {
      setDisplayValue(formatNumberForInput(value))
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={`currency-${label}`} className="text-sm font-medium flex items-center gap-2">
        <Euro className="h-4 w-4 text-french-blue-600" />
        {label}
        {required && <span className="text-urgent-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={`currency-${label}`}
          type="text"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pl-8 pr-12 text-right font-mono"
        />
        <Euro className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
        <span className="absolute right-2.5 top-2.5 text-sm text-gray-400">€</span>
      </div>

      {value > 0 && (
        <div className="text-xs text-gray-600">
          <span className="font-medium">Montant: </span>
          {formatFrenchCurrency(value)}
        </div>
      )}

      {showVAT && value > 0 && (
        <div className="bg-gray-50 rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Calcul TVA</span>
            <Badge variant="outline" className="text-xs">
              {vatRate}%
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-gray-500">HT</div>
              <div className="font-mono font-medium">
                {formatFrenchCurrency(value)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">TVA ({vatRate}%)</div>
              <div className="font-mono font-medium text-french-blue-600">
                {formatFrenchCurrency(vatAmount)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">TTC</div>
              <div className="font-mono font-semibold text-gray-900 border-t pt-1">
                {formatFrenchCurrency(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface PricingCardProps {
  title: string
  description?: string
  price: number
  period?: string
  features: string[]
  highlighted?: boolean
  vatIncluded?: boolean
  className?: string
  onSelect?: () => void
  badge?: string
}

export function FrenchPricingCard({
  title,
  description,
  price,
  period = "mois",
  features,
  highlighted = false,
  vatIncluded = true,
  className = "",
  onSelect,
  badge
}: PricingCardProps) {
  const vatRate = 20
  const priceExcludingVAT = vatIncluded ? price / (1 + vatRate / 100) : price
  const vatAmount = vatIncluded ? price - priceExcludingVAT : (price * vatRate) / 100
  const priceIncludingVAT = vatIncluded ? price : price + vatAmount

  return (
    <div className={`
      relative rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md
      ${highlighted ? 'border-french-blue-500 ring-2 ring-french-blue-500 ring-opacity-20' : 'border-gray-200'}
      ${className}
    `}>
      {badge && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
          <Badge variant={highlighted ? "default" : "secondary"} className="px-3 py-1">
            {badge}
          </Badge>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}

        <div className="mt-4 mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {Math.floor(priceIncludingVAT)}
            </span>
            <span className="text-lg text-gray-600">
              ,{String(Math.round((priceIncludingVAT % 1) * 100)).padStart(2, '0')} €
            </span>
            <span className="text-sm text-gray-500">/ {period}</span>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            {formatFrenchCurrency(priceExcludingVAT)} HT + {formatFrenchCurrency(vatAmount)} TVA
          </div>
        </div>

        <ul className="space-y-2 text-sm text-left mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-compliance-green-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-compliance-green-600" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>

        {onSelect && (
          <button
            onClick={onSelect}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors
              ${highlighted
                ? 'bg-french-blue-600 text-white hover:bg-french-blue-700'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }
            `}
          >
            {highlighted ? 'Choisir ce plan' : 'Sélectionner'}
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          <span>Prix TTC • Facturation française • RGPD conforme</span>
        </div>
      </div>
    </div>
  )
}