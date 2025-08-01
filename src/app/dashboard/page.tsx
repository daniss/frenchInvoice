import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ComplianceCountdown } from '@/components/compliance/ComplianceCountdown'
import { 
  FileText, 
  Users, 
  Euro, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  ArrowRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardMetrics {
  totalInvoices: number
  monthlyRevenue: number
  totalCustomers: number
  pendingInvoices: number
  complianceStatus: 'compliant' | 'setup_required' | 'non_compliant'
}

async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const supabase = await createClient()

  // Get invoice metrics
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount_excl_vat, status, created_at')
    .eq('company_id', userId)

  // Get customer count
  const { count: customerCount } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', userId)

  // Get company compliance status
  const { data: company } = await supabase
    .from('companies')
    .select('compliance_status')
    .eq('id', userId)
    .single()

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyRevenue = invoices
    ?.filter(invoice => {
      const invoiceDate = new Date(invoice.created_at)
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear
    })
    .reduce((sum, invoice) => sum + parseFloat(invoice.total_amount_excl_vat.toString()), 0) || 0

  const pendingInvoices = invoices?.filter(invoice => invoice.status === 'draft').length || 0

  return {
    totalInvoices: invoices?.length || 0,
    monthlyRevenue,
    totalCustomers: customerCount || 0,
    pendingInvoices,
    complianceStatus: company?.compliance_status || 'setup_required'
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name, created_at')
    .eq('id', user.id)
    .single()

  const metrics = await getDashboardMetrics(user.id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge variant="success">Conforme</Badge>
      case 'setup_required':
        return <Badge variant="warning">Configuration requise</Badge>
      case 'non_compliant':
        return <Badge variant="destructive">Non conforme</Badge>
      default:
        return <Badge variant="secondary">Statut inconnu</Badge>
    }
  }

  const quickActions = [
    {
      title: 'Créer une facture',
      description: 'Nouvelle facture électronique',
      href: '/dashboard/invoices/new',
      icon: Plus,
      variant: 'default' as const
    },
    {
      title: 'Ajouter un client',
      description: 'Nouveau client à votre carnet',
      href: '/dashboard/customers/new',
      icon: Users,
      variant: 'outline' as const
    },
    {
      title: 'Vérifier la conformité',
      description: 'Statut réglementation 2026',
      href: '/dashboard/compliance',
      icon: Shield,
      variant: 'outline' as const
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, {company?.name || 'Votre entreprise'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {getComplianceStatusBadge(metrics.complianceStatus)}
        </div>
      </div>

      {/* Compliance Alert */}
      <ComplianceCountdown />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Factures ce mois
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalInvoices}</div>
            <p className="text-xs text-gray-600">
              {metrics.pendingInvoices} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires
            </CardTitle>
            <Euro className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.monthlyRevenue)}
            </div>
            <p className="text-xs text-gray-600">
              Ce mois-ci (HT)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clients
            </CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
            <p className="text-xs text-gray-600">
              Total dans le carnet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conformité 2026
            </CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.complianceStatus === 'compliant' ? (
                <CheckCircle className="h-8 w-8 text-compliance-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">
              {metrics.complianceStatus === 'compliant' ? 'Prêt' : 'À configurer'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-french-blue-100 rounded-lg flex items-center justify-center">
                  <action.icon className="h-5 w-5 text-french-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4">{action.description}</p>
              <Button asChild variant={action.variant} className="w-full">
                <Link href={action.href}>
                  Accéder
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-french-blue-600 rounded-full" />
                <span className="text-gray-600">Compte créé</span>
                <span className="text-gray-400 ml-auto">
                  {company?.created_at ? new Date(company.created_at).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
                </span>
              </div>
              
              {metrics.complianceStatus !== 'compliant' && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-gray-600">Configuration de conformité en attente</span>
                  <span className="text-gray-400 ml-auto">En cours</span>
                </div>
              )}
              
              {metrics.totalInvoices === 0 && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">Aucune facture créée</span>
                  <Button asChild variant="link" className="p-0 h-auto ml-auto text-french-blue-600">
                    <Link href="/dashboard/invoices/new">Créer maintenant</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Prochaines étapes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.complianceStatus !== 'compliant' && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-yellow-700">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Finaliser la conformité 2026</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Configurez votre système pour la réglementation
                    </p>
                    <Button asChild variant="link" className="p-0 h-auto text-french-blue-600 text-xs mt-1">
                      <Link href="/dashboard/compliance">Configurer →</Link>
                    </Button>
                  </div>
                </div>
              )}
              
              {metrics.totalCustomers === 0 && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-french-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-xs font-medium text-french-blue-700">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">Ajouter vos premiers clients</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Importez votre carnet d'adresses existant
                    </p>
                    <Button asChild variant="link" className="p-0 h-auto text-french-blue-600 text-xs mt-1">
                      <Link href="/dashboard/customers">Gérer les clients →</Link>
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-compliance-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-medium text-compliance-green-700">3</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Créer votre première facture</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Testez la génération Factur-X
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto text-french-blue-600 text-xs mt-1">
                    <Link href="/dashboard/invoices/new">Créer une facture →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}