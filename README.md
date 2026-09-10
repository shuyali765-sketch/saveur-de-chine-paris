# Saveurs de Chine à Paris

Site personnel de **Shuya**. Il présente les restaurants chinois qu’elle a testés à Paris : adresses, impressions et plats qu’elle recommande.

Le public visé est simple : des personnes à Paris (ou de passage) qui cherchent une adresse chinoise déjà essayée, avec un avis sincère plutôt qu’un classement automatique.

Déploiement : [https://saveur-de-chine-paris.vercel.app/](https://saveur-de-chine-paris.vercel.app/)  
Code : [https://github.com/shuyali765-sketch/saveur-de-chine-paris](https://github.com/shuyali765-sketch/saveur-de-chine-paris)

---

## Objectif

Rassembler au même endroit :

- une liste d’adresses testées
- une recherche par nom, cuisine ou quartier
- une fiche par restaurant
- des avis de la communauté
- des favoris pour les comptes connectés

Ce n’est pas une application de réservation, ni un back-office d’administration.

---

## Fonctionnalités

- Accueil avec texte d’introduction, barre de recherche, carrousel d’images et cartes des restaurants
- Recherche (`/recherche`) à partir des colonnes `name`, `arrondissement`, `adresse` et `cuisine`
- Fiche restaurant (`/restaurants/[id]`) : carte, détails disponibles, lien Google Maps s’il existe
- Avis publics : lecture pour tout le monde ; publication, modification et suppression pour l’auteur connecté
- Favoris (cœur sur les cartes) : réservés aux comptes connectés ; page `/favoris` protégée
- Inscription (`/signup`) et connexion (`/login`) par e-mail et mot de passe Supabase
- Profil `user_profiles` : prénom et e-mail (le prénom sert aussi sous les avis)
- Thème clair / sombre dans la barre de navigation
- États visibles : chargement, message d’erreur en français, liste vide, boutons désactivés pendant l’envoi

Présents à l’inscription, mais **non enregistrés** en base : le choix de cuisine (aperçu en direct seulement) et le champ `foodPreference` du store Pinia.

---

## Stack technique

D’après `package.json` et le code actuel :

| Outil | Usage |
|---|---|
| Nuxt 4, Vue 3, Vue Router | application et pages |
| Tailwind CSS 4 | styles |
| shadcn-vue / Reka UI | boutons et composants UI |
| `@radix-icons/vue` | icônes (cœur, carrousel) |
| Pinia | état du profil connecté |
| `@supabase/supabase-js` | Auth et données (côté client) |
| VueUse | notamment le thème sombre |
| `@nuxt/image` | module Nuxt Image |
| TypeScript | types générés (`app/types/database.types.ts`) |

Le client Supabase n’utilise **pas** la clé `service_role`.

---

## Structure du projet

Le dépôt utile est le dossier `nuxt-shadcn-starter-template`.

```
app/pages          pages et routes
app/components     cartes, carrousel, avis, navbar, footer
app/composables    logique et requêtes Supabase
app/stores         store Pinia (profil)
app/types          types de la base (CLI Supabase)
app/utils          petites fonctions (e-mail, classes de formulaire)
app/middleware     protection de /favoris
app/plugins        client Supabase et synchronisation du profil
public/images      images du site
supabase           scripts SQL à coller dans l’éditeur SQL
docs               documentation (structure, base de données)
```

Les pages n’appellent pas Supabase directement : elles passent par les composables.

Détail : [docs/structure.md](docs/structure.md) · [docs/database.md](docs/database.md)

---

## Installation locale

Prérequis : Node.js et npm.

```bash
cd nuxt-shadcn-starter-template
npm install
```

Créer un fichier `.env` à la racine de ce dossier (voir les noms ci-dessous), puis :

```bash
npm run dev
```

Le site local s’ouvre sur `http://localhost:3000`.

Autres scripts (`package.json`) :

```bash
npm run build      # compilation de production
npm run preview    # aperçu du build
npm run generate   # génération statique Nuxt
```

---

## Variables d’environnement

Noms utilisés par l’application (valeurs **non** indiquées ici) :

| Nom | Rôle |
|---|---|
| `NUXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NUXT_PUBLIC_SUPABASE_KEY` | clé publique (anon / publishable) |

À recopier aussi dans Vercel (Production) sous les **mêmes noms**.  
Ne jamais placer de clé `service_role` dans le front ou dans ce fichier.

---

## Base de données

Quatre tables `public`, d’après `app/types/database.types.ts` :

| Table | Rôle | Clé primaire |
|---|---|---|
| `restaurants` | catalogue des adresses | `restaurant_id` |
| `user_profiles` | prénom et e-mail | `id` |
| `user_favori` | favoris | `id` |
| `user_comments` | avis | `id` |

Clés étrangères **confirmées** par les types générés :

- `user_favori.restaurant_id` → `restaurants.restaurant_id`
- `user_comments.restaurant_id` → `restaurants.restaurant_id`

Colonnes importantes de `restaurants` : `name`, `cuisine` (`text[]`), `arrondissement`, `adresse`, `quartier`, `description_et_recommandations`, `image_url`, `google_maps_url`, `price_range`, `rating`, `recommanded_dishes`, `created_at`.

Scripts SQL du dépôt (à exécuter à la main dans Supabase → SQL Editor) :

- `supabase/supabase-schema-user-interactions.sql`
- `supabase/user_profile_trigger.sql`
- `supabase/schema-and-rls-review.sql`
- `supabase/seed-restaurants.sql`

---

## Auth et RLS

**Auth**

- Compte : e-mail + mot de passe (`signUp` / `signInWithPassword`)
- Session conservée dans le navigateur (`persistSession`, `autoRefreshToken`)
- Après inscription ou connexion, le profil est créé ou mis à jour dans `user_profiles`
- Un trigger SQL (`handle_new_user`) peut aussi créer la ligne de profil à l’inscription
- `/favoris` redirige vers `/login` si l’utilisateur n’est pas connecté
- La réinitialisation du mot de passe n’est pas implémentée dans l’interface ; la page de connexion indique de le faire dans le tableau Supabase

**RLS** (policies écrites dans les SQL du projet ; actives sur le projet distant si ces scripts ont été exécutés) :

| Table | SELECT | INSERT / UPDATE / DELETE |
|---|---|---|
| `restaurants` | public (`anon` et `authenticated`) | pas de policy d’écriture |
| `user_favori` | son propre `user_id` | insert et delete pour soi ; pas d’update |
| `user_comments` | public | insert, update, delete pour soi |
| `user_profiles` | insert et update pour soi ; le SELECT public ou « soi uniquement » dépend du script SQL réellement exécuté |

---

## Déploiement

Le site est déployé sur Vercel :

**https://saveur-de-chine-paris.vercel.app/**

Configurer les deux variables `NUXT_PUBLIC_*` dans le projet Vercel, puis redéployer après un changement d’environnement.

---

## Limites actuelles

- La recherche charge la table `restaurants` puis filtre dans le navigateur ; ce n’est pas une recherche SQL avancée
- Le champ d’avis lu par le code (`description`, etc.) n’est pas le nom exact de la colonne distante (`description_et_recommandations`)
- `recommanded_dishes` est un texte dans la base, pas un tableau
- La préférence de cuisine du formulaire d’inscription n’est pas stockée
- Pas de réservation, pas de carte interactive, pas d’espace administrateur
- Pas de « mot de passe oublié » dans l’application
- La documentation RLS reflète les fichiers SQL du dépôt ; il faut les exécuter pour qu’ils s’appliquent au projet distant

---

## Pistes d’amélioration

- Relier clairement le mapping des cartes à `description_et_recommandations`
- Enregistrer (ou retirer) le champ de préférence culinaire
- Ajouter une récupération de mot de passe via Supabase Auth
- Affiner la recherche côté base si le catalogue grandit
- Harmoniser les policies `user_profiles` (lecture des prénoms pour les avis, sans exposer l’e-mail)
- Générer à nouveau `database.types.ts` après chaque changement de schéma (`npx supabase gen types typescript --project-id … --schema public`)
