'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Lock, Shield, CheckCircle } from 'lucide-react'
import { updatePassword } from '@/lib/auth/actions'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (error) {
      setError(errorDescription || 'Lien de réinitialisation invalide ou expiré')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!password) {
      setError('Veuillez saisir un nouveau mot de passe')
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePassword(password)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message || 'Mot de passe mis à jour avec succès')
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
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
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Nouveau mot de passe
            </CardTitle>
            <CardDescription className="text-center">
              Choisissez un mot de passe sécurisé pour votre compte
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-compliance-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-compliance-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-compliance-green-800 mb-2">
                    Mot de passe mis à jour !
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{success}</p>
                  <p className="text-xs text-gray-500">
                    Redirection vers la page de connexion...
                  </p>
                </div>
              </div>
            ) : (
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
                  <Label htmlFor="password">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="transition-colors focus:border-french-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 8 caractères recommandés
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    <Lock className="inline h-4 w-4 mr-1" />
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="transition-colors focus:border-french-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-french-blue-600 hover:bg-french-blue-700"
                >
                  {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                </Button>

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <Link 
                    href="/auth/login" 
                    className="text-sm text-french-blue-600 hover:text-french-blue-700 hover:underline"
                  >
                    Retour à la connexion
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Connexion sécurisée • 🇫🇷 Données protégées
                  </p>
                </div>
              </form>
            )}
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