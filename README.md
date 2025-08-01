# FactureFrance - French E-Invoicing Compliance SaaS

## 🇫🇷 Vue d'ensemble

FactureFrance est une solution SaaS complète de facturation électronique conçue spécifiquement pour les PME, TPE et auto-entrepreneurs français. L'application anticipe et facilite la conformité à la réglementation française de facturation électronique obligatoire d'ici 2026-2027.

### 🎯 Objectifs Principaux

- **Conformité 2026** : Préparation complète à la réglementation française
- **Simplicité** : Configuration en 5 minutes vs 30+ minutes chez la concurrence
- **Prix compétitif** : À partir de €9/mois vs €14-35/mois chez la concurrence
- **100% Français** : Interface, support et hébergement en France
- **RGPD Compliant** : Sécurité et confidentialité des données garanties

## 🚀 Fonctionnalités Clés

### ✅ Phase 1 (Implémentée)
- [x] Authentification sécurisée avec Supabase Auth
- [x] Enregistrement d'entreprise avec validation SIREN/SIRET
- [x] Interface utilisateur française native
- [x] Tableau de bord de conformité avec compte à rebours 2026
- [x] Composants UI français (dates, devises, adresses)
- [x] Validation française (SIREN, SIRET, TVA, codes postaux)
- [x] Middleware de protection des routes
- [x] Base de données RGPD-compliant avec Row Level Security

### 🔜 Phase 2 (À venir)
- [ ] Génération PDF Factur-X/ZUGFeRD conforme EN16931
- [ ] Intégration multi-PDP avec basculement automatique
- [ ] Système de création et gestion de factures
- [ ] Archivage légal 10 ans
- [ ] Dashboard de conformité avancé
- [ ] Gestion d'erreurs en français

## 🛠 Stack Technique

### Frontend
- **Next.js 14** avec App Router et TypeScript
- **Tailwind CSS** avec palette française personnalisée
- **Shadcn/ui** pour les composants de base
- **React Hook Form** + **Zod** pour la validation

### Backend
- **Supabase** (PostgreSQL, Auth, Edge Functions, Storage)
- **Row Level Security (RLS)** pour la conformité RGPD
- **TypeScript** pour la sécurité des types

### Intégrations Prévues
- **Factur-X/ZUGFeRD** pour la génération de factures conformes
- **Plateformes PDP** certifiées pour la transmission
- **APIs françaises** (INSEE pour SIREN/SIRET)

## 📦 Installation Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (gratuit)

### Configuration

1. **Cloner le projet**
```bash
git clone https://github.com/votre-compte/frenchInvoice.git
cd frenchInvoice
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

4. **Configurer Supabase**
- Créer un projet sur [supabase.com](https://supabase.com)
- Copier l'URL et les clés dans `.env.local`
- Appliquer les migrations de base de données

5. **Lancer en développement**
```bash
npm run dev
```

6. **Accéder à l'application**
Ouvrir [http://localhost:3000](http://localhost:3000)

## 🏗 Architecture

### Structure des Dossiers
```
src/
├── app/                 # Routes Next.js App Router
│   ├── auth/           # Pages d'authentification
│   ├── dashboard/      # Interface principale
│   └── page.tsx        # Page d'accueil
├── components/         # Composants React
│   ├── ui/             # Composants UI de base
│   ├── forms/          # Formulaires français
│   ├── compliance/     # Composants de conformité
│   └── layout/         # Layout et navigation
├── lib/                # Utilitaires et configuration
│   ├── supabase/       # Clients Supabase
│   ├── validations/    # Validations métier françaises
│   ├── utils/          # Fonctions utilitaires
│   └── auth/           # Actions d'authentification
└── types/              # Types TypeScript
```

### Base de Données
- **companies** : Informations des entreprises avec SIREN/SIRET
- **invoices** : Factures avec archivage 10 ans
- **customers** : Carnet d'adresses clients
- **pdp_connections** : Configurations des plateformes PDP

## 🎨 Design System Français

### Palette de Couleurs
```css
--french-blue: #1E3A8A    /* Bleu France officiel */
--urgent-red: #DC2626     /* Rouge d'urgence conformité */
--compliance-green: #059669 /* Vert de validation */
--admin-gray: #6B7280     /* Gris administratif */
```

### Composants Spécialisés
- **ComplianceCountdown** : Compte à rebours vers 2026
- **FrenchAddressForm** : Formulaire d'adresse française
- **FrenchBusinessForm** : Formulaire entreprise avec SIREN
- **FrenchCurrencyInput** : Saisie de montants en euros
- **FrenchDateInput** : Calendrier français DD/MM/YYYY

## 📊 Marché Cible

### Segments Principaux
- **159,000 PME/TPE** concernées par la réglementation 2026
- **Auto-entrepreneurs** et micro-entreprises
- **Cabinets comptables** gérant plusieurs clients
- **Secteurs prioritaires** : Commerce, Services, BTP

### Avantage Concurrentiel
- **Temps de setup** : 5 min vs 30+ min (concurrence)
- **Prix débutant** : €9/mois vs €14-35/mois (concurrence)
- **100% français** : Interface, support, hébergement
- **Anticipation 2026** : Prêt avant l'obligation légale

## 🔐 Conformité et Sécurité

### RGPD
- ✅ Hébergement données en France/UE
- ✅ Row Level Security sur toutes les tables
- ✅ Consentement explicite utilisateur
- ✅ Droit à l'oubli et portabilité des données

### Sécurité Technique
- ✅ Authentification Supabase Auth
- ✅ HTTPS obligatoire
- ✅ Validation côté client et serveur
- ✅ Protection CSRF/XSS

### Conformité Réglementaire
- ✅ Validation SIREN/SIRET française
- ✅ Formats de facture Factur-X/ZUGFeRD (en cours)
- ✅ Archivage légal 10 ans (prévu)
- ✅ Transmission PDP certifiée (prévu)

## 🧪 Tests et Déploiement

### Tests
```bash
npm run type-check    # Vérification TypeScript
npm run lint          # Linting ESLint
npm run build         # Build de production
```

### Déploiement
L'application est conçue pour être déployée sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- **Railway**
- **Serveur VPS** français

## 📈 Roadmap

### Q1 2024 (Phase 1 - ✅ Terminée)
- [x] MVP avec authentification et dashboard
- [x] Interface française complète
- [x] Validations métier françaises

### Q2 2024 (Phase 2 - En cours)
- [ ] Génération Factur-X/ZUGFeRD
- [ ] Intégration première PDP
- [ ] Système de facturation complet

### Q3 2024 (Phase 3 - Planifiée)
- [ ] Multi-PDP avec failover
- [ ] API publique pour intégrations
- [ ] Application mobile

### Q4 2024 (Phase 4 - Croissance)
- [ ] Marketplace d'extensions
- [ ] Intégrations comptables
- [ ] Programme partenaires

## 🤝 Contribution

### Guides de Contribution
1. Fork du projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commits descriptifs en français
4. Tests et type-checking
5. Pull Request avec description détaillée

### Standards de Code
- **TypeScript strict** activé
- **Conventions françaises** pour les noms de variables métier
- **Tests unitaires** pour les validations françaises
- **Documentation** en français pour les fonctionnalités métier

## 📞 Support

### Canaux de Support
- **Documentation** : [docs.facturefrance.fr](https://docs.facturefrance.fr)
- **Support technique** : support@facturefrance.fr
- **Questions réglementaires** : conformite@facturefrance.fr

### Communauté
- **Discord** : Communauté des utilisateurs
- **Newsletter** : Actualités réglementaires mensuelles
- **Webinaires** : Formation gratuite sur la réglementation 2026

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**FactureFrance** - Votre partenaire pour la conformité e-facturing 2026
Made with ❤️ in France 🇫🇷