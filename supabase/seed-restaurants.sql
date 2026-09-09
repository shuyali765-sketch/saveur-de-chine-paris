-- À coller dans Supabase → SQL Editor → New query → Run.
-- Ajoute les 3 restaurants du site dans public.restaurants.
-- Ne supprime aucune table. Réutilise les colonnes déjà présentes.

do $$
declare
  cols text[];
  pk_col text;
  pk_type text;
  name_col text;
  cuisine_col text;
  place_col text;
  review_col text;
  image_col text;
  alt_col text;
  insert_cols text := '';
  insert_vals text;
  rec record;
begin
  select coalesce(array_agg(column_name), '{}')
  into cols
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'restaurants';

  if cols = '{}' then
    raise exception 'La table public.restaurants est introuvable.';
  end if;

  select a.attname, format_type(a.atttypid, a.atttypmod)
  into pk_col, pk_type
  from pg_index i
  join pg_attribute a
    on a.attrelid = i.indrelid
   and a.attnum = any (i.indkey)
  join pg_class c on c.oid = i.indrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'restaurants'
    and i.indisprimary
  limit 1;

  if 'name' = any (cols) then
    name_col := 'name';
  elsif 'nom' = any (cols) then
    name_col := 'nom';
  end if;

  if 'cuisine' = any (cols) then
    cuisine_col := 'cuisine';
  elsif 'category' = any (cols) then
    cuisine_col := 'category';
  end if;

  if 'neighborhood' = any (cols) then
    place_col := 'neighborhood';
  elsif 'quartier' = any (cols) then
    place_col := 'quartier';
  elsif 'arrondissement' = any (cols) then
    place_col := 'arrondissement';
  end if;

  if 'review' = any (cols) then
    review_col := 'review';
  elsif 'description' = any (cols) then
    review_col := 'description';
  elsif 'avis' = any (cols) then
    review_col := 'avis';
  end if;

  if 'image' = any (cols) then
    image_col := 'image';
  elsif 'image_url' = any (cols) then
    image_col := 'image_url';
  elsif 'photo' = any (cols) then
    image_col := 'photo';
  end if;

  if 'alt' = any (cols) then
    alt_col := 'alt';
  end if;

  if name_col is null then
    raise exception 'Impossible de trouver une colonne nom/name dans restaurants. Envoie-moi une capture des colonnes.';
  end if;

  for rec in
    select *
    from (
      values
        (
          'Le Bourgeon 花杞厨',
          'Cuisine du Yunnan',
          '3e arrondissement',
          'Les nouilles de riz « traversant le pont » sont incontournables. Le bouillon est particulièrement frais et savoureux.',
          '/images/huaqichu.jpg',
          'Nouilles de riz traversant le pont du restaurant Le Bourgeon 花杞厨, dans le 3e arrondissement'
        ),
        (
          'Le Panier de Dim Sum',
          'Cuisine cantonaise',
          'Opéra, 9e arrondissement',
          'Des har gau délicats. Une bonne adresse pour un déjeuner.',
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80',
          'Panier de dim sum cantonais servis à Paris'
        ),
        (
          'Table de Shanghai',
          'Cuisine de Shanghai',
          'Belleville, 20e arrondissement',
          'Les xiao long bao valent le détour. Cadre un peu bruyant, mais sincère.',
          'https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1000&q=80',
          'Xiao long bao de Shanghai dans un restaurant à Belleville'
        )
    ) as t(name, cuisine, neighborhood, review, image, alt)
  loop
    insert_cols := format('%I', name_col);
    insert_vals := quote_literal(rec.name);

    if cuisine_col is not null then
      insert_cols := insert_cols || ', ' || format('%I', cuisine_col);
      insert_vals := insert_vals || ', ' || quote_literal(rec.cuisine);
    end if;

    if place_col is not null then
      insert_cols := insert_cols || ', ' || format('%I', place_col);
      insert_vals := insert_vals || ', ' || quote_literal(rec.neighborhood);
    end if;

    if review_col is not null then
      insert_cols := insert_cols || ', ' || format('%I', review_col);
      insert_vals := insert_vals || ', ' || quote_literal(rec.review);
    end if;

    if image_col is not null then
      insert_cols := insert_cols || ', ' || format('%I', image_col);
      insert_vals := insert_vals || ', ' || quote_literal(rec.image);
    end if;

    if alt_col is not null then
      insert_cols := insert_cols || ', ' || format('%I', alt_col);
      insert_vals := insert_vals || ', ' || quote_literal(rec.alt);
    end if;

    if pk_col is not null and pk_type like '%uuid%' then
      execute format(
        'insert into public.restaurants (%s, %I) select %s, gen_random_uuid() where not exists (select 1 from public.restaurants r where r.%I = %L)',
        insert_cols,
        pk_col,
        insert_vals,
        name_col,
        rec.name
      );
    else
      execute format(
        'insert into public.restaurants (%s) select %s where not exists (select 1 from public.restaurants r where r.%I = %L)',
        insert_cols,
        insert_vals,
        name_col,
        rec.name
      );
    end if;
  end loop;
end
$$;

select * from public.restaurants;
