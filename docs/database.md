# Base de données

Ce document décrit les tables `public` utilisées par le site.

**Sources confirmées :**

- colonnes et clés étrangères visibles : `app/types/database.types.ts` (généré par la CLI Supabase depuis le schéma distant)
- requêtes de l’application : `app/composables/`
- policies SQL du dépôt : `supabase/supabase-schema-user-interactions.sql`, `supabase/user_profile_trigger.sql`, `supabase/schema-and-rls-review.sql`

Les policies ci-dessous sont celles **écrites dans les fichiers SQL du projet**. Elles sont actives sur le projet distant seulement si ces scripts ont été exécutés dans l’éditeur SQL. Ce fichier ne suppose pas de colonne ou de policy absente de ces sources.

---

## restaurants

### 1. Rôle

Catalogue des restaurants chinois recommandés. L’accueil, la recherche et la fiche lisent cette table. L’application ne l’écrit pas.

### 2. Propriétés importantes

Confirmées par `database.types.ts` :

| Colonne | Type | Notes |
|---|---|---|
| `restaurant_id` | `string` | identifiant |
| `name` | `string \| null` | nom |
| `cuisine` | `string[] \| null` | tableau de textes |
| `arrondissement` | `string \| null` | |
| `adresse` | `string \| null` | |
| `quartier` | `string \| null` | |
| `description_et_recommandations` | `string \| null` | texte de présentation |
| `image_url` | `string \| null` | |
| `google_maps_url` | `string \| null` | |
| `price_range` | `string \| null` | |
| `rating` | `number \| null` | |
| `recommanded_dishes` | `string \| null` | orthographe de la base |
| `created_at` | `string` | |

Requêtes de l’app : `select('*')` dans `useRestaurants` et `useFavorites`.

### 3. Clé primaire

`restaurant_id` (colonne obligatoire en lecture ; optionnelle à l’insertion, donc générée par la base).

### 4. Clés étrangères

Aucune dans `database.types.ts` (`Relationships: []`). Cette table est référencée par d’autres tables.

### 5. Relations

Un restaurant peut avoir plusieurs favoris et plusieurs avis (`user_favori` et `user_comments` pointent vers `restaurant_id`).

### 6. RLS

D’après `supabase-schema-user-interactions.sql` et `schema-and-rls-review.sql` :

| Action | Qui | Condition |
|---|---|---|
| SELECT | `anon`, `authenticated` | `USING (true)` — lecture publique |
| INSERT | — | pas de policy dans ces fichiers |
| UPDATE | — | pas de policy dans ces fichiers |
| DELETE | — | pas de policy dans ces fichiers |

Sans policy, RLS refuse l’écriture pour `anon` et `authenticated`.

---

## user_profiles

### 1. Rôle

Profil public lié au compte : prénom et e-mail. Sert à saluer l’utilisateur connecté et à afficher le prénom sous un avis.

### 2. Propriétés importantes

Confirmées par `database.types.ts` :

| Colonne | Type |
|---|---|
| `id` | `string` |
| `first_name` | `string \| null` |
| `email` | `string` |
| `created_at` | `string` |

Requêtes de l’app :

- `select('id, first_name, email')` pour le compte connecté (`useAuthProfile`)
- `select('id, first_name')` pour les auteurs d’avis (`useComments`)
- `upsert({ id, first_name, email })` à l’inscription / connexion

### 3. Clé primaire

`id`.

### 4. Clés étrangères

`database.types.ts` n’en liste aucune (`Relationships: []`).  
Le SQL du projet (`user_profile_trigger.sql`, `schema-and-rls-review.sql`) prévoit `id → auth.users(id)`, mais cette FK n’apparaît pas dans les types générés.

### 5. Relations

L’application relie `user_comments.user_id` à `user_profiles.id` dans le code, pour lire le prénom. Ce n’est pas une FK déclarée dans les types.

### 6. RLS

Deux fichiers SQL du dépôt ne disent pas la même chose pour SELECT.

**`user_profile_trigger.sql` :**

| Action | Qui | Condition |
|---|---|---|
| SELECT | `authenticated` | `USING (auth.uid() = id)` — seulement sa ligne |
| INSERT | `authenticated` | `WITH CHECK (auth.uid() = id)` |
| UPDATE | `authenticated` | `USING` et `WITH CHECK (auth.uid() = id)` |
| DELETE | — | pas de policy |

**`supabase-schema-user-interactions.sql` et `schema-and-rls-review.sql` :**

| Action | Qui | Condition |
|---|---|---|
| SELECT | `anon`, `authenticated` | `USING (true)` — lecture de toutes les lignes |
| INSERT | `authenticated` | `WITH CHECK (auth.uid() = id)` |
| UPDATE | `authenticated` | `USING` et `WITH CHECK (auth.uid() = id)` |
| DELETE | — | pas de policy |

L’affichage des prénoms dans les avis a besoin d’un SELECT qui n’est pas limité à sa propre ligne. Si seule la policy « own » est active, les noms des autres auteurs peuvent manquer.

---

## user_favori

### 1. Rôle

Favoris : une ligne = un utilisateur a mis un restaurant dans ses favoris.

### 2. Propriétés importantes

Confirmées par `database.types.ts` :

| Colonne | Type |
|---|---|
| `id` | `string` |
| `user_id` | `string` |
| `restaurant_id` | `string` |
| `created_at` | `string` |

Requêtes de l’app (`useFavorites`) :

- SELECT `user_id, restaurant_id, created_at` filtré par `user_id`
- INSERT `{ user_id, restaurant_id }`
- DELETE selon `user_id` et `restaurant_id`
- pas d’UPDATE

Le SQL du projet définit aussi `UNIQUE (user_id, restaurant_id)`. Cette contrainte n’est pas visible dans `database.types.ts`. Le code traite l’erreur Postgres `23505` (doublon) si elle se produit.

### 3. Clé primaire

`id`.

### 4. Clés étrangères

Confirmée par `database.types.ts` :

- `restaurant_id` → `restaurants.restaurant_id` (`user_favori_restaurant_id_fkey`)

Le SQL du projet prévoit aussi `user_id → auth.users(id) ON DELETE CASCADE`. Cette FK n’apparaît pas dans les types générés.

### 5. Relations

Plusieurs favoris par utilisateur. Plusieurs favoris par restaurant. Un couple utilisateur + restaurant est prévu unique dans le SQL.

### 6. RLS

D’après `supabase-schema-user-interactions.sql` et `schema-and-rls-review.sql` :

| Action | Qui | Condition |
|---|---|---|
| SELECT | `authenticated` | `USING (auth.uid() = user_id)` |
| INSERT | `authenticated` | `WITH CHECK (auth.uid() = user_id)` |
| UPDATE | — | pas de policy |
| DELETE | `authenticated` | `USING (auth.uid() = user_id)` |

`anon` n’a pas de policy : un visiteur non connecté ne lit ni n’écrit les favoris.

---

## user_comments

### 1. Rôle

Avis publiés sur la fiche d’un restaurant.

### 2. Propriétés importantes

Confirmées par `database.types.ts` :

| Colonne | Type |
|---|---|
| `id` | `string` |
| `user_id` | `string` |
| `restaurant_id` | `string` |
| `content` | `string` |
| `created_at` | `string` |
| `updated_at` | `string` |

Requêtes de l’app (`useComments`) :

- SELECT des colonnes ci-dessus, filtrées par `restaurant_id`
- INSERT `{ user_id, restaurant_id, content }`
- UPDATE `{ content, updated_at }` sur sa propre ligne
- DELETE de sa propre ligne

### 3. Clé primaire

`id`.

### 4. Clés étrangères

Confirmée par `database.types.ts` :

- `restaurant_id` → `restaurants.restaurant_id` (`user_comments_restaurant_id_fkey`)

Le SQL du projet prévoit aussi `user_id → auth.users(id) ON DELETE CASCADE`. Cette FK n’apparaît pas dans les types générés.

### 5. Relations

Plusieurs avis par restaurant. Un avis appartient à un `user_id`. Le prénom affiché vient d’une seconde requête vers `user_profiles`.

### 6. RLS

D’après `supabase-schema-user-interactions.sql` et `schema-and-rls-review.sql` :

| Action | Qui | Condition |
|---|---|---|
| SELECT | `anon`, `authenticated` | `USING (true)` — lecture publique |
| INSERT | `authenticated` | `WITH CHECK (auth.uid() = user_id)` |
| UPDATE | `authenticated` | `USING` et `WITH CHECK (auth.uid() = user_id)` |
| DELETE | `authenticated` | `USING (auth.uid() = user_id)` |

On ne peut modifier ou supprimer que ses propres avis.

---

## Trajet d’une donnée : ajouter un restaurant aux favoris

1. **RestaurantCard**  
   L’utilisatrice clique sur le cœur. Le composant appelle `toggleFavorite(restaurant.id)`.

2. **Composable `useFavorites`**  
   Si personne n’est connecté, le composable s’arrête et la carte affiche un message pour aller à `/login`.  
   Sinon il envoie la requête Supabase (insert si le restaurant n’est pas encore favori, delete s’il l’est déjà).

3. **Supabase (client JS)**  
   Exemple d’ajout :

   `from('user_favori').insert({ user_id, restaurant_id })`

4. **Table `user_favori`**  
   Une ligne est créée : qui a favorisé quel restaurant, et `created_at`.

5. **RLS**  
   La policy `user_favori_insert_own` vérifie `auth.uid() = user_id`.  
   On ne peut pas insérer un favori pour un autre compte. Sans session, l’insert est refusé.

6. **Interface**  
   Si la base accepte la ligne, le composable recharge les favoris (`select` sur `user_favori`, puis `select` sur `restaurants`).  
   Le cœur se remplit sur la carte. La page `/favoris` affiche la même liste.
