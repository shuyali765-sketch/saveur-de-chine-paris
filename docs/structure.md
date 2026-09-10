# Structure du projet

Le code suit une séparation simple des responsabilités.

| Dossier | Rôle |
|---|---|
| `app/pages` | Pages et routes (`/`, `/recherche`, `/restaurants/[id]`, `/favoris`, `/login`, `/signup`) |
| `app/components` | Interface réutilisable (cartes, carousel, commentaires, navbar, footer, boutons) |
| `app/composables` | Logique métier et accès Supabase (restaurants, favoris, avis, auth, profil) |
| `app/stores` | État partagé Pinia (`user`) |
| `app/types` | Types de la base (`database.types.ts`) |
| `app/utils` | Petites fonctions d’aide (validation e-mail, classes de formulaire) |
| `app/middleware` | Protection de routes (`auth` pour `/favoris`) |
| `app/plugins` | Initialisation client (Supabase, profil) |
| `public/images` | Images publiques du site |
| `supabase` | Scripts SQL à relire et exécuter à la main dans l’éditeur SQL |
| `docs` | Documentation du projet |

Les pages ne font plus les requêtes Supabase directement : elles appellent les composables.
