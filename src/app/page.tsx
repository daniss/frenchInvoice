'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, CheckCircle2, Clock, ArrowRight, Shield, Zap, Users } from 'lucide-react'

export default function HomePage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0
  })

  useEffect(() => {
    const targetDate = new Date('2026-09-01') // Official French e-invoicing deadline
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft({ days, hours, minutes })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const urgencyLevel = timeLeft.days < 365 ? 'high' : timeLeft.days < 500 ? 'medium' : 'low'

  return (
    <div className="bg-gradient-to-br from-french-blue-50 to-white min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-french-blue-800">
                Facture-X Pro
              </h1>
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-compliance-green-100 text-compliance-green-800">
                Conforme 2026
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-french-blue-600 transition-colors">
                Fonctionnalités
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-french-blue-600 transition-colors">
                Tarifs
              </Link>
              <Link href="/compliance" className="text-gray-600 hover:text-french-blue-600 transition-colors">
                Conformité
              </Link>
              <Link
                href="/auth/login"
                className="bg-french-blue-600 text-white px-4 py-2 rounded-md hover:bg-french-blue-700 transition-colors"
              >
                Se connecter
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="text-center">
            {/* Compliance Countdown */}
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 ${
              urgencyLevel === 'high' ? 'bg-urgent-red-100 text-urgent-red-800' :
              urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              <Calendar className="h-4 w-4 mr-2" />
              Facturation électronique obligatoire dans {timeLeft.days} jours
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Préparez votre entreprise à la{' '}
              <span className="text-french-blue-600">facturation électronique</span>{' '}
              de 2026
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Solution française complète pour TPE, PME et micro-entreprises. 
              Génération automatique de factures Factur-X, intégration PDP certifiée, 
              et réduction des délais de paiement de 40%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/auth/register"
                className="bg-french-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-french-blue-700 transition-colors inline-flex items-center"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="border border-french-blue-600 text-french-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-french-blue-50 transition-colors"
              >
                Voir la démo
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-compliance-green-600" />
                Conforme RGPD
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-compliance-green-600" />
                Certifié DGFiP
              </div>
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-compliance-green-600" />
                Setup en 5 minutes
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-compliance-green-600" />
                +500 entreprises
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-urgent-red-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              82% des entreprises françaises subissent des retards de paiement
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En plus de l'obligation réglementaire 2026, la facturation électronique 
              résout le problème critique des délais de paiement qui impacte votre trésorerie.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-urgent-red-600 text-4xl font-bold mb-4">2026</div>
              <h3 className="text-xl font-semibold mb-2">Obligation légale</h3>
              <p className="text-gray-600">
                À partir de septembre 2026, toutes les entreprises devront recevoir 
                leurs factures au format électronique.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-urgent-red-600 text-4xl font-bold mb-4">40%</div>
              <h3 className="text-xl font-semibold mb-2">Réduction des délais</h3>
              <p className="text-gray-600">
                La facturation électronique réduit les délais de paiement 
                de 40% en moyenne selon les études sectorielles.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="text-urgent-red-600 text-4xl font-bold mb-4">€€€</div>
              <h3 className="text-xl font-semibold mb-2">Économies importantes</h3>
              <p className="text-gray-600">
                Réduction des coûts administratifs, amélioration de la trésorerie, 
                et optimisation des process comptables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              La solution française la plus simple et abordable
            </h2>
            <p className="text-xl text-gray-600">
              Conçue spécifiquement pour les TPE, PME et micro-entreprises françaises
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-french-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-french-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Factur-X Automatique</h3>
              <p className="text-gray-600">
                Génération automatique de factures conformes au standard européen EN16931
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-french-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-french-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Intégration PDP</h3>
              <p className="text-gray-600">
                Connexion directe avec les Plateformes de Dématérialisation Partenaires certifiées
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-french-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-french-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Archivage 10 ans</h3>
              <p className="text-gray-600">
                Archivage légal automatique avec chiffrement et conformité RGPD
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-french-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Commencez dès aujourd'hui, sans engagement
          </h2>
          <p className="text-xl text-french-blue-100 mb-8">
            Essai gratuit de 30 jours • Setup en 5 minutes • Support français inclus
          </p>
          
          <div className="space-y-4">
            <Link
              href="/auth/register"
              className="bg-white text-french-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center"
            >
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <div className="text-french-blue-100 text-sm">
              ✓ Aucune carte bancaire requise • ✓ Annulation à tout moment
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Facture-X Pro</h3>
              <p className="text-gray-600 text-sm">
                Solution française de facturation électronique pour la conformité 2026.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/features">Fonctionnalités</Link></li>
                <li><Link href="/pricing">Tarifs</Link></li>
                <li><Link href="/demo">Démonstration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Conformité</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/compliance">Guide 2026</Link></li>
                <li><Link href="/rgpd">RGPD</Link></li>
                <li><Link href="/security">Sécurité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help">Centre d'aide</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/status">Statut</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 Facture-X Pro. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/legal/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Confidentialité
              </Link>
              <Link href="/legal/terms" className="text-sm text-gray-600 hover:text-gray-900">
                CGU
              </Link>
              <Link href="/legal/cookies" className="text-sm text-gray-600 hover:text-gray-900">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}