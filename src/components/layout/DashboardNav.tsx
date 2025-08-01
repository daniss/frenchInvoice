'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ComplianceCountdownCompact } from '@/components/compliance/ComplianceCountdown'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Shield, 
  HelpCircle, 
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Building
} from 'lucide-react'
import { logout } from '@/lib/auth/actions'

interface NavigationItem {
  name: string
  href: string
  icon: any
  badge?: string
  description?: string
}

const navigation: NavigationItem[] = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble de votre activité'
  },
  {
    name: 'Factures',
    href: '/dashboard/invoices',
    icon: FileText,
    description: 'Créer et gérer vos factures électroniques'
  },
  {
    name: 'Clients',
    href: '/dashboard/customers',
    icon: Users,
    description: 'Gérer votre carnet d\'adresses'
  },
  {
    name: 'Conformité',
    href: '/dashboard/compliance',
    icon: Shield,
    badge: 'Important',
    description: 'Statut de conformité 2026'
  },
  {
    name: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Configuration entreprise et compte'
  }
]

const supportNavigation: NavigationItem[] = [
  {
    name: 'Centre d\'aide',
    href: '/help',
    icon: HelpCircle,
    description: 'Documentation et support'
  }
]

interface DashboardNavProps {
  companyName?: string
  userEmail?: string
}

export function DashboardNav({ companyName, userEmail }: DashboardNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
  }

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-2">
            <div className="w-8 h-8 bg-french-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">FactureFrance</h1>
              <p className="text-xs text-gray-600">Facturation électronique</p>
            </div>
          </div>

          {/* Compliance Countdown */}
          <div className="mb-4">
            <ComplianceCountdownCompact />
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors
                          ${isActiveRoute(item.href)
                            ? 'bg-french-blue-50 text-french-blue-700'
                            : 'text-gray-700 hover:text-french-blue-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge variant="warning" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                      {isActiveRoute(item.href) && item.description && (
                        <p className="text-xs text-gray-500 ml-9 mt-1">{item.description}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </li>

              {/* Support Section */}
              <li className="mt-auto">
                <ul role="list" className="-mx-2 space-y-1">
                  {supportNavigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-gray-700 hover:text-french-blue-700 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {companyName || 'Votre Entreprise'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 hover:text-urgent-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
          className="-m-2.5 p-2.5"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
        
        <div className="flex-1 flex items-center gap-2">
          <div className="w-6 h-6 bg-french-blue-600 rounded flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold">FactureFrance</span>
        </div>

        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <X className="h-6 w-6 text-white" />
                  <span className="sr-only">Fermer le menu</span>
                </Button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                {/* Mobile Logo */}
                <div className="flex h-16 shrink-0 items-center gap-2">
                  <div className="w-8 h-8 bg-french-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">FactureFrance</h1>
                    <p className="text-xs text-gray-600">Facturation électronique</p>
                  </div>
                </div>

                {/* Mobile Compliance Countdown */}
                <div className="mb-4">
                  <ComplianceCountdownCompact />
                </div>

                {/* Mobile Navigation */}
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`
                                group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                ${isActiveRoute(item.href)
                                  ? 'bg-french-blue-50 text-french-blue-700'
                                  : 'text-gray-700 hover:text-french-blue-700 hover:bg-gray-50'
                                }
                              `}
                            >
                              <item.icon className="h-6 w-6 shrink-0" />
                              <span className="flex-1">{item.name}</span>
                              {item.badge && (
                                <Badge variant="warning" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>

                    <li className="mt-auto">
                      <ul role="list" className="-mx-2 space-y-1">
                        {supportNavigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-gray-700 hover:text-french-blue-700 hover:bg-gray-50 group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                            >
                              <item.icon className="h-6 w-6 shrink-0" />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </nav>

                {/* Mobile User Profile */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {companyName || 'Votre Entreprise'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-gray-700 hover:text-urgent-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}