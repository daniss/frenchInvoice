'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Mail, Lock, ArrowRight, Shield } from 'lucide-react'
import { login } from '@/lib/auth/actions'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login({
        email,
        password,
        redirectTo: redirectTo || undefined
      })

      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
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
            Conformité 2026 - Mise en route dès aujourd'hui
          </Badge>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Connexion à votre compte
            </CardTitle>
            <CardDescription className="text-center">
              Accédez à votre espace de facturation électronique sécurisé
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-urgent-red-50 border border-urgent-red-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-urgent-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-urgent-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Adresse email professionnelle
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.fr"
                  className="transition-colors focus:border-french-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="transition-colors focus:border-french-blue-500"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-french-blue-600 hover:text-french-blue-700 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-french-blue-600 hover:bg-french-blue-700"
              >
                {isLoading ? (
                  'Connexion en cours...'
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-french-blue-600 hover:text-french-blue-700 hover:underline"
                >
                  Créer un compte entreprise
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Connexion sécurisée • 🇫🇷 Données hébergées en France • ✓ RGPD conforme
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
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