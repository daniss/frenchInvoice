# Stratégie UI/UX Française Complète - Plateforme de Facturation Électronique

## 🎯 Vue d'ensemble stratégique

### Positionnement différenciant
- **Configuration ultra-rapide** : 5 minutes vs 30+ minutes concurrents
- **Prix leader** : À partir de 9€/mois vs 14-35€/mois concurrence
- **100% français** : Optimisé pour la culture d'entreprise française et l'échéance 2026

### Cible prioritaire
- **PME** (1-50 salariés) : 159 000 entreprises en France
- **TPE & microentreprises** : Millions d'entreprises concernées
- **Freelancers** : Travailleurs indépendants cherchant la simplicité

## 🎨 Système de design français

### Palette de couleurs professionnelle
```css
:root {
  /* Couleurs principales - Confiance et autorité française */
  --primary-blue: #1e3a8a;      /* Bleu institutionnel français */
  --primary-light: #3b82f6;     /* Bleu d'action */
  --secondary-navy: #1e293b;    /* Bleu marine professionnel */
  
  /* Couleurs de conformité */
  --success-green: #059669;     /* Vert validation */
  --warning-amber: #d97706;     /* Orange attention */
  --error-red: #dc2626;         /* Rouge erreur */
  --urgent-red: #b91c1c;        /* Rouge urgence 2026 */
  
  /* Couleurs neutres françaises */
  --grey-50: #f8fafc;
  --grey-100: #f1f5f9;
  --grey-200: #e2e8f0;
  --grey-500: #64748b;
  --grey-700: #334155;
  --grey-900: #0f172a;
  
  /* Couleurs spécifiques métier */
  --invoice-blue: #0ea5e9;      /* Bleu facture */
  --payment-green: #10b981;     /* Vert paiement */
  --pdp-purple: #8b5cf6;        /* Violet PDP */
}
```

### Typographie française professionnelle
```css
/* Hiérarchie typographique optimisée pour le français */
.font-heading {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.font-body {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  font-weight: 400;
  line-height: 1.6;
}

/* Tailles adaptées au contenu français */
.text-h1 { font-size: 2.25rem; font-weight: 700; }
.text-h2 { font-size: 1.875rem; font-weight: 600; }
.text-h3 { font-size: 1.5rem; font-weight: 600; }
.text-body { font-size: 1rem; line-height: 1.6; }
.text-small { font-size: 0.875rem; line-height: 1.5; }
.text-caption { font-size: 0.75rem; line-height: 1.4; }
```

## 🚀 Flux d'onboarding français optimisé

### Étape 1 : Sélection du type d'entreprise

```tsx
// components/onboarding/BusinessTypeSelector.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, User, Users } from "lucide-react"

export function BusinessTypeSelector({ onSelect }: { onSelect: (type: string) => void }) {
  const businessTypes = [
    {
      id: 'freelance',
      title: 'Freelance / Auto-entrepreneur',
      description: 'Travailleur indépendant, consultant, profession libérale',
      icon: User,
      features: ['Facturation simplifiée', 'TVA automatique', 'Suivi paiements'],
      badge: 'Plus populaire',
      urgency: 'Obligatoire dès septembre 2026'
    },
    {
      id: 'tpe',
      title: 'TPE (1-10 salariés)',
      description: 'Petite entreprise, commerce local, artisan',
      icon: Building2,
      features: ['Multi-utilisateurs', 'Gestion clients', 'Reporting avancé'],
      badge: null,
      urgency: 'Obligatoire dès septembre 2026'
    },
    {
      id: 'pme',
      title: 'PME (11-50 salariés)',
      description: 'Moyenne entreprise, société établie',
      icon: Users,
      features: ['API intégration', 'Multi-PDP', 'Support prioritaire'],
      badge: 'Fonctionnalités avancées',
      urgency: 'Obligatoire dès septembre 2026'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-grey-900">
          Quel type d'entreprise décrit le mieux la vôtre ?
        </h1>
        <p className="text-grey-600 text-lg">
          Nous personnaliserons votre expérience en fonction de vos besoins spécifiques
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {businessTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card 
              key={type.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary-blue relative"
              onClick={() => onSelect(type.id)}
            >
              {type.badge && (
                <Badge className="absolute -top-2 left-4 bg-primary-blue text-white">
                  {type.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-blue" />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <p className="text-grey-600 text-sm">{type.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {type.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-grey-700">
                      <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-grey-200">
                  <div className="flex items-center text-sm text-urgent-red font-medium">
                    <div className="w-2 h-2 bg-urgent-red rounded-full mr-2 animate-pulse" />
                    {type.urgency}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
```

### Étape 2 : Informations entreprise avec validation française

```tsx
// components/onboarding/CompanyInfoForm.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

// Schéma de validation français
const companySchema = z.object({
  siren: z.string()
    .length(9, "Le numéro SIREN doit contenir exactement 9 chiffres")
    .regex(/^\d+$/, "Le SIREN ne doit contenir que des chiffres"),
  companyName: z.string()
    .min(2, "La raison sociale doit contenir au moins 2 caractères")
    .max(100, "La raison sociale ne peut pas dépasser 100 caractères"),
  vatNumber: z.string()
    .optional()
    .refine((val) => !val || /^FR\d{11}$/.test(val), "Format TVA invalide (ex: FR12345678901)"),
  address: z.string()
    .min(5, "L'adresse doit contenir au moins 5 caractères"),
  postalCode: z.string()
    .length(5, "Le code postal doit contenir 5 chiffres")
    .regex(/^\d+$/, "Le code postal ne doit contenir que des chiffres"),
  city: z.string()
    .min(2, "La ville doit contenir au moins 2 caractères"),
  email: z.string()
    .email("Format d'email invalide"),
  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, "Format de téléphone français invalide")
})

export function CompanyInfoForm({ onSubmit, businessType }: { 
  onSubmit: (data: any) => void, 
  businessType: string 
}) {
  const [sirenStatus, setSirenStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle')
  
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(companySchema)
  })

  const sirenValue = watch('siren')

  // Validation SIREN en temps réel
  const validateSiren = async (siren: string) => {
    if (siren.length === 9) {
      setSirenStatus('loading')
      try {
        // Appel API INSEE pour validation
        const response = await fetch(`/api/validate-siren?siren=${siren}`)
        const data = await response.json()
        setSirenStatus(data.valid ? 'valid' : 'invalid')
      } catch {
        setSirenStatus('invalid')
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-grey-900">
          Informations de votre entreprise
        </h2>
        <p className="text-grey-600">
          Ces informations apparaîtront sur vos factures électroniques
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* SIREN avec validation en temps réel */}
        <div className="space-y-2">
          <Label htmlFor="siren" className="text-sm font-medium text-grey-700">
            Numéro SIREN <span className="text-error-red">*</span>
          </Label>
          <div className="relative">
            <Input
              id="siren"
              {...register('siren')}
              placeholder="123456789"
              className={`pr-10 ${errors.siren ? 'border-error-red' : ''}`}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                e.target.value = value
                if (value.length === 9) validateSiren(value)
              }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {sirenStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-grey-500" />}
              {sirenStatus === 'valid' && <CheckCircle className="w-4 h-4 text-success-green" />}
              {sirenStatus === 'invalid' && <AlertCircle className="w-4 h-4 text-error-red" />}
            </div>
          </div>
          {errors.siren && (
            <p className="text-sm text-error-red">{errors.siren.message}</p>
          )}
          {sirenStatus === 'valid' && (
            <Alert className="border-success-green bg-success-green/5">
              <CheckCircle className="w-4 h-4 text-success-green" />
              <AlertDescription className="text-success-green">
                SIREN validé auprès de l'INSEE
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Raison sociale */}
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-sm font-medium text-grey-700">
            Raison sociale <span className="text-error-red">*</span>
          </Label>
          <Input
            id="companyName"
            {...register('companyName')}
            placeholder="Nom de votre entreprise"
            className={errors.companyName ? 'border-error-red' : ''}
          />
          {errors.companyName && (
            <p className="text-sm text-error-red">{errors.companyName.message}</p>
          )}
        </div>

        {/* TVA intracommunautaire */}
        <div className="space-y-2">
          <Label htmlFor="vatNumber" className="text-sm font-medium text-grey-700">
            Numéro de TVA intracommunautaire
          </Label>
          <Input
            id="vatNumber"
            {...register('vatNumber')}
            placeholder="FR12345678901"
            className={errors.vatNumber ? 'border-error-red' : ''}
          />
          {errors.vatNumber && (
            <p className="text-sm text-error-red">{errors.vatNumber.message}</p>
          )}
          <p className="text-xs text-grey-500">
            Optionnel - Nécessaire uniquement pour les échanges intracommunautaires
          </p>
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-grey-700">
              Adresse <span className="text-error-red">*</span>
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 rue de la République"
              className={errors.address ? 'border-error-red' : ''}
            />
            {errors.address && (
              <p className="text-sm text-error-red">{errors.address.message}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-sm font-medium text-grey-700">
                Code postal <span className="text-error-red">*</span>
              </Label>
              <Input
                id="postalCode"
                {...register('postalCode')}
                placeholder="75001"
                className={errors.postalCode ? 'border-error-red' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-error-red">{errors.postalCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-grey-700">
                Ville <span className="text-error-red">*</span>
              </Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Paris"
                className={errors.city ? 'border-error-red' : ''}
              />
              {errors.city && (
                <p className="text-sm text-error-red">{errors.city.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-grey-700">
              Email professionnel <span className="text-error-red">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="contact@entreprise.fr"
              className={errors.email ? 'border-error-red' : ''}
            />
            {errors.email && (
              <p className="text-sm text-error-red">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-grey-700">
              Téléphone <span className="text-error-red">*</span>
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="01 23 45 67 89"
              className={errors.phone ? 'border-error-red' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-error-red">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div className="pt-6">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary-blue hover:bg-primary-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validation en cours...
              </>
            ) : (
              'Valider les informations'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
```

## ⏰ Composant de compte à rebours 2026

```tsx
// components/compliance/ComplianceCountdown.tsx
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react"

export function ComplianceCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const targetDate = new Date('2026-09-01').getTime()
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate - now
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="border-urgent-red bg-urgent-red/5">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-urgent-red rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-grey-900">
                Facturation électronique obligatoire
              </h3>
              <p className="text-sm text-grey-600">
                Toutes les entreprises françaises devront recevoir leurs factures au format électronique
              </p>
            </div>

            {/* Compte à rebours */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Jours', value: timeLeft.days },
                { label: 'Heures', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes },
                { label: 'Secondes', value: timeLeft.seconds }
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="bg-white rounded-lg p-3 border border-grey-200">
                    <div className="text-2xl font-bold text-urgent-red">
                      {value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-grey-600 uppercase tracking-wide">
                      {label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center text-sm text-grey-600">
                <Calendar className="w-4 h-4 mr-2" />
                Date limite : 1er septembre 2026
              </div>
              
              <Button size="sm" className="bg-urgent-red hover:bg-urgent-red/90">
                Préparer ma conformité
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

## 📝 Formulaire de création de facture français

```tsx
// components/invoice/InvoiceForm.tsx
import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Calculator } from "lucide-react"

const TVA_RATES = [
  { value: '0', label: '0% (Exonéré)' },
  { value: '5.5', label: '5,5% (Taux réduit)' },
  { value: '10', label: '10% (Taux intermédiaire)' },
  { value: '20', label: '20% (Taux normal)' }
]

export function InvoiceForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      customer: {
        name: '',
        email: '',
        siren: '',
        address: ''
      },
      items: [
        { designation: '', quantity: 1, unitPrice: 0, tvaRate: '20' }
      ],
      paymentTerms: '30',
      notes: ''
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const watchedItems = watch('items')
  
  // Calculs automatiques
  const totals = watchedItems.reduce((acc, item) => {
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0)
    const tvaAmount = subtotal * ((item.tvaRate || 0) / 100)
    
    return {
      subtotal: acc.subtotal + subtotal,
      tva: acc.tva + tvaAmount,
      total: acc.subtotal + subtotal + acc.tva + tvaAmount
    }
  }, { subtotal: 0, tva: 0, total: 0 })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-6">
      {/* En-tête facture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-primary-blue" />
            Nouvelle facture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Numéro de facture</Label>
              <Input
                id="invoiceNumber"
                {...register('invoiceNumber', { required: 'Numéro obligatoire' })}
                placeholder="FAC-2024-001"
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-error-red">{errors.invoiceNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date d'émission</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Date obligatoire' })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate', { required: 'Date d\'échéance obligatoire' })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations client */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Nom / Raison sociale</Label>
              <Input
                id="customerName"
                {...register('customer.name', { required: 'Nom du client obligatoire' })}
                placeholder="Nom du client"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                {...register('customer.email')}
                placeholder="client@entreprise.fr"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerSiren">SIREN (optionnel)</Label>
              <Input
                id="customerSiren"
                {...register('customer.siren')}
                placeholder="123456789"
                maxLength={9}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress">Adresse</Label>
              <Textarea
                id="customerAddress"
                {...register('customer.address')}
                placeholder="Adresse complète du client"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lignes de facture */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prestations / Produits</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ designation: '', quantity: 1, unitPrice: 0, tvaRate: '20' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une ligne
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start p-4 border border-grey-200 rounded-lg">
                {/* Désignation */}
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label className="text-sm">Désignation</Label>
                  <Textarea
                    {...register(`items.${index}.designation`, { required: 'Désignation obligatoire' })}
                    placeholder="Description du produit/service"
                    rows={2}
                  />
                </div>

                {/* Quantité */}
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label className="text-sm">Quantité</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`items.${index}.quantity`, { 
                      required: 'Quantité obligatoire',
                      min: { value: 0, message: 'Quantité >= 0' }
                    })}
                  />
                </div>

                {/* Prix unitaire */}
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label className="text-sm">Prix unitaire (€)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`items.${index}.unitPrice`, { 
                      required: 'Prix obligatoire',
                      min: { value: 0, message: 'Prix >= 0' }
                    })}
                  />
                </div>

                {/* Taux TVA */}
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label className="text-sm">Taux TVA</Label>
                  <Select
                    value={watchedItems[index]?.tvaRate || '20'}
                    onValueChange={(value) => {
                      // Mise à jour via register
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TVA_RATES.map(rate => (
                        <SelectItem key={rate.value} value={rate.value}>
                          {rate.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total ligne */}
                <div className="col-span-6 md:col-span-1 space-y-2">
                  <Label className="text-sm">Total HT</Label>
                  <div className="h-10 flex items-center text-sm font-medium">
                    {((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0)).toFixed(2)} €
                  </div>
                </div>

                {/* Supprimer */}
                <div className="col-span-12 md:col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-error-red hover:text-error-red hover:bg-error-red/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="mt-6 border-t border-grey-200 pt-4">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">Total HT :</span>
                  <span className="font-medium">{totals.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-grey-600">TVA :</span>
                  <span className="font-medium">{totals.tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between border-t border-grey-200 pt-2">
                  <span className="font-semibold">Total TTC :</span>
                  <span className="font-bold text-lg text-primary-blue">
                    {totals.total.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Conditions de paiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Délai de paiement</Label>
            <Select
              value={watch('paymentTerms')}
              onValueChange={(value) => {
                // Mise à jour via register
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Paiement comptant</SelectItem>
                <SelectItem value="15">15 jours</SelectItem>
                <SelectItem value="30">30 jours (standard)</SelectItem>
                <SelectItem value="45">45 jours</SelectItem>
                <SelectItem value="60">60 jours (maximum légal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Conditions particulières</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Conditions de paiement, pénalités de retard, escompte..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button">
          Enregistrer en brouillon
        </Button>
        <Button type="submit" className="bg-primary-blue hover:bg-primary-blue/90">
          Créer la facture
        </Button>
      </div>
    </form>
  )
}
```

## 📱 Design responsive mobile-first

```css
/* Breakpoints français adaptés aux usages mobiles */
@media (max-width: 640px) {
  /* Navigation mobile pour entreprises */
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--grey-200);
    padding: 12px 0;
    z-index: 50;
  }

  .mobile-nav-items {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .mobile-nav-item:hover {
    background-color: var(--grey-100);
  }

  .mobile-nav-icon {
    width: 20px;
    height: 20px;
    color: var(--grey-600);
  }

  .mobile-nav-item.active .mobile-nav-icon {
    color: var(--primary-blue);
  }

  .mobile-nav-label {
    font-size: 11px;
    color: var(--grey-600);
    font-weight: 500;
  }

  .mobile-nav-item.active .mobile-nav-label {
    color: var(--primary-blue);
  }

  /* Formulaires mobiles optimisés */
  .mobile-form-section {
    padding: 16px;
    background: white;
    margin-bottom: 8px;
    border-radius: 12px;
  }

  .mobile-input {
    height: 48px; /* Touch-friendly */
    font-size: 16px; /* Évite le zoom iOS */
  }

  .mobile-button {
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
  }

  /* Tables responsives pour factures */
  .invoice-table-mobile {
    display: block;
    width: 100%;
  }

  .invoice-row-mobile {
    display: block;
    background: white;
    margin-bottom: 12px;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--grey-200);
  }

  .invoice-cell-mobile {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px solid var(--grey-100);
  }

  .invoice-cell-mobile:last-child {
    border-bottom: none;
    font-weight: 600;
    padding-top: 8px;
  }
}
```

## ♿ Accessibilité RGAA complète

```tsx
// components/accessibility/AccessibilityProvider.tsx
import { createContext, useContext, useState } from "react"

const AccessibilityContext = createContext({
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  setFontSize: (size: string) => {},
  toggleHighContrast: () => {},
  toggleReducedMotion: () => {}
})

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    document.documentElement.classList.toggle('high-contrast', !highContrast)
  }

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
    document.documentElement.classList.toggle('reduced-motion', !reducedMotion)
  }

  return (
    <AccessibilityContext.Provider value={{
      fontSize,
      highContrast,
      reducedMotion,
      setFontSize,
      toggleHighContrast,
      toggleReducedMotion
    }}>
      <div className={`font-size-${fontSize}`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

// Hook d'utilisation
export const useAccessibility = () => useContext(AccessibilityContext)
```

```css
/* Styles d'accessibilité RGAA */
.high-contrast {
  --primary-blue: #000000;
  --secondary-navy: #000000;
  --success-green: #000000;
  --error-red: #000000;
  --grey-700: #000000;
  --grey-500: #666666;
  --grey-200: #cccccc;
  --grey-100: #eeeeee;
  --grey-50: #ffffff;
}

.reduced-motion * {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.font-size-small { font-size: 0.875rem; }
.font-size-normal { font-size: 1rem; }
.font-size-large { font-size: 1.125rem; }
.font-size-xl { font-size: 1.25rem; }

/* Focus visible amélioré */
*:focus-visible {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Liens d'évitement */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}

/* Indicateurs visuels pour lecteur d'écran */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 🚨 Gestion d'erreurs française

```tsx
// components/errors/ErrorBoundary.tsx
import { Component, ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo)
    
    // Envoi à un service de monitoring
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert className="border-error-red">
              <AlertTriangle className="w-4 h-4 text-error-red" />
              <AlertTitle className="text-error-red">
                Une erreur inattendue s'est produite
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-4">
                <p className="text-grey-700">
                  Nous nous excusons pour ce désagrément. Notre équipe technique a été automatiquement notifiée.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => window.location.reload()}
                    className="flex-1"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recharger la page
                  </Button>
                  
                  <Button
                    onClick={() => window.open('mailto:support@facture-electronique.fr?subject=Erreur technique')}
                    className="flex-1"
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contacter le support
                  </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-grey-600">
                      Détails techniques (développement)
                    </summary>
                    <pre className="mt-2 text-xs bg-grey-100 p-2 rounded overflow-auto">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

```tsx
// components/errors/ErrorMessages.tsx
export const FRENCH_ERROR_MESSAGES = {
  // Erreurs SIREN/SIRET
  'INVALID_SIREN': {
    title: 'Numéro SIREN invalide',
    message: 'Le numéro SIREN doit contenir exactement 9 chiffres.',
    action: 'Vérifiez votre extrait Kbis ou contactez votre comptable.'
  },
  'SIREN_NOT_FOUND': {
    title: 'SIREN non trouvé',
    message: 'Ce numéro SIREN n\'existe pas dans la base INSEE.',
    action: 'Vérifiez la saisie ou utilisez votre numéro SIRET à la place.'
  },
  
  // Erreurs TVA
  'INVALID_VAT_NUMBER': {
    title: 'Numéro de TVA invalide',
    message: 'Le format du numéro de TVA intracommunautaire est incorrect.',
    action: 'Format attendu : FR + 11 chiffres (ex: FR12345678901)'
  },
  
  // Erreurs facture
  'INVOICE_NUMBER_EXISTS': {
    title: 'Numéro de facture déjà utilisé',
    message: 'Ce numéro de facture existe déjà dans votre système.',
    action: 'Utilisez un numéro de facture unique (ex: FAC-2024-002)'
  },
  'INVALID_DUE_DATE': {
    title: 'Date d\'échéance invalide',
    message: 'La date d\'échéance ne peut pas être antérieure à la date d\'émission.',
    action: 'Sélectionnez une date d\'échéance postérieure à aujourd\'hui.'
  },
  
  // Erreurs PDP
  'PDP_CONNECTION_ERROR': {
    title: 'Erreur de connexion PDP',
    message: 'Impossible de se connecter à la Plateforme de Dématérialisation Partenaire.',
    action: 'Vérifiez votre connexion internet ou réessayez dans quelques minutes.'
  },
  'PDP_SUBMISSION_FAILED': {
    title: 'Échec de transmission PDP',
    message: 'La facture n\'a pas pu être transmise à votre PDP.',
    action: 'Contactez le support technique ou réessayez la transmission.'
  },
  
  // Erreurs système
  'NETWORK_ERROR': {
    title: 'Problème de connexion',
    message: 'Une erreur réseau s\'est produite.',
    action: 'Vérifiez votre connexion internet et réessayez.'
  },
  'SERVER_ERROR': {
    title: 'Erreur serveur temporaire',
    message: 'Nos serveurs rencontrent actuellement des difficultés.',
    action: 'Nous travaillons à résoudre le problème. Réessayez dans quelques minutes.'
  }
}

export function ErrorAlert({ errorCode, className = '' }: { 
  errorCode: keyof typeof FRENCH_ERROR_MESSAGES, 
  className?: string 
}) {
  const error = FRENCH_ERROR_MESSAGES[errorCode]
  
  if (!error) return null

  return (
    <Alert className={`border-error-red bg-error-red/5 ${className}`}>
      <AlertTriangle className="w-4 h-4 text-error-red" />
      <AlertTitle className="text-error-red">{error.title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-grey-700">{error.message}</p>
        <p className="text-sm text-grey-600 mt-2 font-medium">{error.action}</p>
      </AlertDescription>
    </Alert>
  )
}
```

## 📊 Dashboard de conformité

```tsx
// components/dashboard/ComplianceDashboard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Euro,
  Calendar,
  Target
} from "lucide-react"

interface ComplianceData {
  complianceScore: number
  invoiceCount: number
  complianceRate: number
  avgPaymentDelay: number
  savedDays: number
  nextDeadline: string
}

export function ComplianceDashboard({ data }: { data: ComplianceData }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success-green'
    if (score >= 70) return 'text-warning-amber'
    return 'text-error-red'
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-success-green'
    if (score >= 70) return 'bg-warning-amber'
    return 'bg-error-red'
  }

  return (
    <div className="space-y-6">
      {/* Score de conformité principal */}
      <Card className="border-2 border-primary-blue/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Score de conformité 2026</CardTitle>
            <Badge className={`${getScoreBadgeColor(data.complianceScore)} text-white`}>
              {data.complianceScore >= 90 ? 'Excellent' : 
               data.complianceScore >= 70 ? 'Bien' : 'À améliorer'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-grey-600">Progression</span>
                <span className={`text-2xl font-bold ${getScoreColor(data.complianceScore)}`}>
                  {data.complianceScore}%
                </span>
              </div>
              <Progress 
                value={data.complianceScore} 
                className="h-3"
              />
            </div>
            <div className="w-16 h-16 rounded-full bg-primary-blue/10 flex items-center justify-center">
              {data.complianceScore >= 90 ? (
                <CheckCircle className="w-8 h-8 text-success-green" />
              ) : (
                <Target className="w-8 h-8 text-primary-blue" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grey-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-grey-900">{data.invoiceCount}</div>
              <div className="text-sm text-grey-600">Factures conformes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-green">{data.complianceRate}%</div>
              <div className="text-sm text-grey-600">Taux de réussite</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Délais de paiement */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Délais de paiement moyens</CardTitle>
            <Clock className="w-4 h-4 text-grey-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-grey-900">
              {data.avgPaymentDelay} jours
            </div>
            <div className="flex items-center text-sm text-success-green mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              -{data.savedDays} jours vs avant
            </div>
            <p className="text-xs text-grey-600 mt-2">
              Réduction grâce à la facturation électronique
            </p>
          </CardContent>
        </Card>

        {/* Économies réalisées */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Économies mensuelles</CardTitle>
            <Euro className="w-4 h-4 text-grey-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success-green">
              +{Math.round(data.savedDays * 50)}€
            </div>
            <div className="text-sm text-grey-600 mt-1">
              Gain de trésorerie estimé
            </div>
            <p className="text-xs text-grey-600 mt-2">
              Basé sur vos délais de paiement actuels
            </p>
          </CardContent>
        </Card>

        {/* Prochaine échéance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochaine échéance</CardTitle>
            <Calendar className="w-4 h-4 text-grey-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-blue">
              {data.nextDeadline}
            </div>
            <div className="text-sm text-grey-600 mt-1">
              Réception obligatoire
            </div>
            <p className="text-xs text-grey-600 mt-2">
              Toutes entreprises françaises
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions recommandées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-warning-amber" />
            Actions recommandées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.complianceScore < 100 && (
            <div className="space-y-3">
              {data.complianceScore < 90 && (
                <div className="flex items-start space-x-3 p-3 bg-warning-amber/5 rounded-lg border border-warning-amber/20">
                  <div className="w-2 h-2 bg-warning-amber rounded-full mt-2" />
                  <div className="flex-1">
                    <h4 className="font-medium text-grey-900">
                      Configurer un PDP de secours
                    </h4>
                    <p className="text-sm text-grey-600 mt-1">
                      Ajoutez une Plateforme de Dématérialisation Partenaire de secours pour assurer la continuité de service.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Configurer maintenant
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-3 bg-primary-blue/5 rounded-lg border border-primary-blue/20">
                <div className="w-2 h-2 bg-primary-blue rounded-full mt-2" />
                <div className="flex-1">
                  <h4 className="font-medium text-grey-900">
                    Tester l'envoi de factures
                  </h4>
                  <p className="text-sm text-grey-600 mt-1">
                    Effectuez des tests d'envoi pour valider votre configuration avant l'échéance.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Lancer un test
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-success-green/5 rounded-lg border border-success-green/20">
                <div className="w-2 h-2 bg-success-green rounded-full mt-2" />
                <div className="flex-1">
                  <h4 className="font-medium text-grey-900">
                    Former votre équipe
                  </h4>
                  <p className="text-sm text-grey-600 mt-1">
                    Programmez une session de formation pour vos collaborateurs sur la facturation électronique.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Planifier une formation
                  </Button>
                </div>
              </div>
            </div>
          )}

          {data.complianceScore === 100 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-success-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-grey-900 mb-2">
                Félicitations ! Vous êtes prêt pour 2026
              </h3>
              <p className="text-grey-600">
                Votre configuration est optimale pour la facturation électronique obligatoire.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 📱 Navigation mobile française

```tsx
// components/layout/MobileNavigation.tsx
import { useState } from "react"
import { useRouter } from "next/router"
import { 
  Home, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    id: 'dashboard',
    label: 'Accueil',
    icon: Home,
    href: '/dashboard',
    badge: null
  },
  {
    id: 'invoices',
    label: 'Factures',
    icon: FileText,
    href: '/factures',
    badge: null
  },
  {
    id: 'create',
    label: 'Créer',
    icon: Plus,
    href: '/factures/nouvelle',
    badge: null,
    isAction: true
  },
  {
    id: 'customers',
    label: 'Clients',
    icon: Users,
    href: '/clients',
    badge: null
  },
  {
    id: 'reports',
    label: 'Rapports',
    icon: BarChart3,
    href: '/rapports',
    badge: null
  }
]

export function MobileNavigation() {
  const router = useRouter()
  const [activeItem, setActiveItem] = useState('dashboard')

  const handleNavigation = (item: typeof navItems[0]) => {
    if (item.isAction) {
      router.push(item.href)
      return
    }
    
    setActiveItem(item.id)
    router.push(item.href)
  }

  return (
    <div className="mobile-nav md:hidden">
      <div className="mobile-nav-items">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.id || router.pathname === item.href
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`mobile-nav-item ${isActive ? 'active' : ''} ${
                item.isAction ? 'bg-primary-blue text-white rounded-full' : ''
              }`}
            >
              <Icon className={`mobile-nav-icon ${
                item.isAction ? 'text-white' : ''
              }`} />
              <span className={`mobile-nav-label ${
                item.isAction ? 'text-white' : ''
              }`}>
                {item.label}
              </span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-error-red text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

Cette stratégie UI/UX complète fournit tout ce dont vous avez besoin pour créer une expérience française native et accessible pour votre plateforme de facturation électronique. Elle met l'accent sur la conformité 2026, la simplicité d'utilisation et la réduction des délais de paiement - les trois piliers de votre proposition de valeur.