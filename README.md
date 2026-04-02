# 🟢 Finova — Guide de déploiement complet

## Architecture

```
finova/
├── app/
│   ├── (app)/                  ← Routes protégées (auth requise)
│   │   ├── layout.tsx          ← Layout partagé avec Sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── budgets/page.tsx
│   │   ├── savings/page.tsx
│   │   ├── bourse/page.tsx
│   │   └── abonnements/page.tsx
│   ├── login/page.tsx          ← Page publique
│   ├── auth/callback/route.ts  ← Handler Supabase
│   ├── layout.tsx              ← Root layout
│   └── globals.css
├── components/
│   ├── ui/                     ← Composants réutilisables
│   └── modules/                ← Un fichier par module
├── lib/
│   ├── supabase-browser.ts     ← Client côté navigateur
│   └── supabase-server.ts      ← Client côté serveur
├── types/index.ts              ← Types TypeScript globaux
├── middleware.ts               ← Protection des routes
└── supabase/migrations/        ← SQL à exécuter une seule fois
```

---

## Étape 1 — Créer le projet Supabase (5 min)

1. Va sur **https://supabase.com** → "New project"
2. Choisis un nom : `finova`
3. Génère un mot de passe fort (garde-le quelque part)
4. Région : choisis la plus proche (ex: Europe West)
5. Attends ~2 minutes que le projet se crée

### Créer les tables

1. Dans Supabase → **SQL Editor** → "New query"
2. Colle tout le contenu de `supabase/migrations/001_initial.sql`
3. Clique **Run**

Tu devrais voir : `Success. No rows returned`

### Récupérer les clés

Dans Supabase → **Settings** → **API** :
- Copie `Project URL` → c'est `NEXT_PUBLIC_SUPABASE_URL`
- Copie `anon public` → c'est `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Activer l'auth par lien magique

Dans Supabase → **Authentication** → **Providers** → **Email** :
- ✅ Enable Email provider
- ✅ Confirm email : désactive si tu veux tester vite
- "Magic Link" est activé par défaut ✓

---

## Étape 2 — Tester en local (3 min)

```bash
# Cloner / aller dans le dossier
cd finova

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local

# Édite .env.local et mets tes vraies clés Supabase
nano .env.local   # ou ouvre avec VS Code

# Lancer le serveur de dev
npm run dev
```

Ouvre **http://localhost:3000** → tu arrives sur `/login` 🎉

---

## Étape 3 — Déployer sur Vercel (5 min)

### Option A : Via GitHub (recommandé)

```bash
# Initialise Git
git init
git add .
git commit -m "🚀 Initial Finova commit"

# Crée un repo sur github.com, puis :
git remote add origin https://github.com/TON_USER/finova.git
git push -u origin main
```

1. Va sur **https://vercel.com** → "Add New Project"
2. Connecte ton GitHub → importe `finova`
3. Dans **Environment Variables**, ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = ton URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ta clé anon
4. Clique **Deploy** → attends ~2 minutes

### Option B : Via CLI Vercel

```bash
npm install -g vercel
vercel
# Suis les instructions, ajoute les env vars quand demandé
```

---

## Étape 4 — Configurer le domaine Supabase

Après le déploiement, Vercel te donne une URL comme `finova-xxx.vercel.app`.

Dans Supabase → **Authentication** → **URL Configuration** :
- **Site URL** : `https://finova-xxx.vercel.app`
- **Redirect URLs** : `https://finova-xxx.vercel.app/auth/callback`

Clique **Save** ✓

---

## Ajouter un nouveau module (futur)

1. **Créer la table** dans `supabase/migrations/002_mon_module.sql`
2. **Ajouter le type** dans `types/index.ts`
3. **Créer la page** dans `app/(app)/mon-module/page.tsx`
4. **Créer le client** dans `components/modules/MonModuleClient.tsx`
5. **Ajouter le lien** dans `components/ui/Sidebar.tsx` (tableau `NAV`)

C'est tout ! La protection auth est automatique grâce au layout `(app)/layout.tsx`.

---

## Stack technique

| Technologie | Rôle | Gratuit |
|-------------|------|---------|
| Next.js 14  | Framework React + routing | ✅ |
| Supabase    | Base de données PostgreSQL + Auth | ✅ (500MB, 50k users) |
| Vercel      | Hébergement + déploiement auto | ✅ (hobby plan) |
| TypeScript  | Typage statique | ✅ |
| Chart.js    | Graphiques | ✅ |

**Coût total : 0€/mois** tant que tu restes dans les limites gratuites.

---

## Commandes utiles

```bash
npm run dev      # Développement local
npm run build    # Build de production (teste avant de déployer)
npm run lint     # Vérification du code
```
