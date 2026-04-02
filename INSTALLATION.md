# GUIDE D'INSTALLATION - Finova

## 🚨 PROBLÈME PRINCIPAL : Variables d'environnement manquantes

Les transactions et autres fonctionnalités ne fonctionnent PAS car les clés Supabase ne sont pas configurées.

## ✅ Solution :

### Étape 1 : Créer un projet Supabase

1. Va sur https://supabase.com
2. Clique "New Project"
3. Rentre les informations (nom: "finova", région: ta zone, etc.)
4. Attends 2-3 minutes que le projet se crée

### Étape 2 : Récupérer les clés API

1. Dans Supabase → **Settings** → **API**
2. Copie :
   - **Project URL** (exemple: `https://abcdef123.supabase.co`)
   - **anon public** key (commence par `eyJ...`)

### Étape 3 : Créer les tables

1. Dans Supabase → **SQL Editor** → **New query**
2. Copie le contenu de `supabase/migrations/001_initial.sql`
3. Clique **Run**

### Étape 4 : Configurer .env.local

Édite le fichier `.env.local` à la racine du projet :

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-key
```

Remplace :
- `your-project.supabase.co` par ta vraie URL Supabase
- `votre-clé-anon-key` par ta vraie clé anon

### Étape 5 : Redémarre le serveur

```bash
npm run dev
```

## 🧪 Test rapide

1. Va sur http://localhost:3000/dashboard
2. Essaye d'ajouter une transaction
3. Tu devrais voir un message de succès ou d'erreur (pas juste rien)

## ❌ Si ça ne marche toujours pas

Regarde la **Console du navigateur** (F12 → Console) pour voir les erreurs.
Si tu vois "Unauthorized" ou "401", c'est que la clé Supabase est mauvaise.

---

**Note** : J'ai ajouté une meilleure gestion d'erreur partout.
Maintenant tu verras des alertes explicites si quelque chose ne va pas ! 🎯
