'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import { resetPassword } from '@/lib/auth/actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!email) {
      setError('Veuillez saisir votre adresse email')
      setIsLoading(false)
      return
    }

    try {
      const result = await resetPassword(email)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message || 'Instructions envoyées par email')
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
              Mot de passe oublié
            </CardTitle>
            <CardDescription className="text-center">
              Saisissez votre email pour recevoir les instructions de réinitialisation
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
                    Email envoyé !
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{success}</p>
                  <p className="text-xs text-gray-500">
                    Vérifiez votre boîte de réception et vos spams. 
                    Le lien est valide pendant 24 heures.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/auth/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            ) : (
              <>
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
                      Adresse email de votre compte
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-french-blue-600 hover:bg-french-blue-700"
                  >
                    {isLoading ? 'Envoi en cours...' : 'Envoyer les instructions'}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                  <Link 
                    href="/auth/login" 
                    className="inline-flex items-center text-sm text-french-blue-600 hover:text-french-blue-700 hover:underline"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" />
                    Retour à la connexion
                  </Link>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Besoin d'aide ? Contactez notre support technique français
                  </p>
                </div>
              </>
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