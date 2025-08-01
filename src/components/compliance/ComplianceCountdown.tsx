'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Calendar, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function ComplianceCountdown() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const targetDate = new Date('2026-09-01T00:00:00') // Official French e-invoicing deadline
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown() // Initial call
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <Card className="border-l-4 border-l-french-blue-500 bg-french-blue-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-800">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-french-blue-500" />
                Facturation électronique obligatoire
              </div>
            </CardTitle>
            <Badge variant="default">À PRÉPARER</Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">---</div>
              <div className="text-xs text-gray-600">jours</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-xs text-gray-600">heures</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-xs text-gray-600">minutes</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-800">--</div>
              <div className="text-xs text-gray-600">secondes</div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700">
              <Calendar className="inline h-4 w-4 mr-1" />
              Échéance : 1er septembre 2026
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const urgencyLevel = timeLeft.days < 365 ? 'high' : timeLeft.days < 500 ? 'medium' : 'low'

  return (
    <Card className={`border-l-4 ${
      urgencyLevel === 'high' ? 'border-l-urgent-red-500 bg-urgent-red-50/50' :
      urgencyLevel === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50' :
      'border-l-french-blue-500 bg-french-blue-50/50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-5 w-5 ${
                urgencyLevel === 'high' ? 'text-urgent-red-500' : 
                urgencyLevel === 'medium' ? 'text-yellow-500' : 
                'text-french-blue-500'
              }`} />
              Facturation électronique obligatoire
            </div>
          </CardTitle>
          <Badge variant={urgencyLevel === 'high' ? 'destructive' : urgencyLevel === 'medium' ? 'warning' : 'default'}>
            {urgencyLevel === 'high' ? 'URGENT' : urgencyLevel === 'medium' ? 'IMPORTANT' : 'À PRÉPARER'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
              urgencyLevel === 'high' ? 'text-urgent-red-600' : 
              urgencyLevel === 'medium' ? 'text-yellow-600' : 
              'text-french-blue-600'
            }`}>
              {timeLeft.days}
            </div>
            <div className="text-xs text-gray-600">jours</div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
              urgencyLevel === 'high' ? 'text-urgent-red-600' : 
              urgencyLevel === 'medium' ? 'text-yellow-600' : 
              'text-french-blue-600'
            }`}>
              {timeLeft.hours}
            </div>
            <div className="text-xs text-gray-600">heures</div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
              urgencyLevel === 'high' ? 'text-urgent-red-600' : 
              urgencyLevel === 'medium' ? 'text-yellow-600' : 
              'text-french-blue-600'
            }`}>
              {timeLeft.minutes}
            </div>
            <div className="text-xs text-gray-600">minutes</div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${
              urgencyLevel === 'high' ? 'text-urgent-red-600' : 
              urgencyLevel === 'medium' ? 'text-yellow-600' : 
              'text-french-blue-600'
            }`}>
              {timeLeft.seconds}
            </div>
            <div className="text-xs text-gray-600">secondes</div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-700">
            <Calendar className="inline h-4 w-4 mr-1" />
            Échéance : 1er septembre 2026
          </p>
          <p className="text-xs text-gray-600">
            Votre entreprise devra obligatoirement recevoir ses factures au format électronique
          </p>
        </div>

        {urgencyLevel === 'high' && (
          <div className="bg-urgent-red-100 border border-urgent-red-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-urgent-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-urgent-red-700">
                <p className="font-medium">Action urgente requise !</p>
                <p>Moins d'un an avant l'échéance. Commencez votre mise en conformité dès maintenant pour éviter les pénalités.</p>
              </div>
            </div>
          </div>
        )}

        <Button asChild className={`w-full ${
          urgencyLevel === 'high' ? 'bg-urgent-red-600 hover:bg-urgent-red-700' :
          urgencyLevel === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
          'bg-french-blue-600 hover:bg-french-blue-700'
        }`}>
          <Link href="/auth/register">
            {urgencyLevel === 'high' ? 'Commencer MAINTENANT' : 'Commencer ma mise en conformité'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            ✓ Essai gratuit • ✓ Configuration en 5 minutes • ✓ Support français
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for dashboard widgets
 */
export function ComplianceCountdownCompact() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const targetDate = new Date('2026-09-01T00:00:00')
    
    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-gray-500" />
        <span>Échéance 2026 : chargement...</span>
      </div>
    )
  }

  const urgencyLevel = timeLeft.days < 365 ? 'high' : timeLeft.days < 500 ? 'medium' : 'low'

  return (
    <div className="flex items-center gap-2 text-sm">
      <AlertTriangle className={`h-4 w-4 ${
        urgencyLevel === 'high' ? 'text-urgent-red-500' : 
        urgencyLevel === 'medium' ? 'text-yellow-500' : 
        'text-french-blue-500'
      }`} />
      <span className="font-medium">
        Échéance 2026 : {timeLeft.days} jours restants
      </span>
      <Badge variant={urgencyLevel === 'high' ? 'destructive' : urgencyLevel === 'medium' ? 'warning' : 'default'} className="text-xs">
        {urgencyLevel === 'high' ? 'URGENT' : urgencyLevel === 'medium' ? 'IMPORTANT' : 'OK'}
      </Badge>
    </div>
  )
}