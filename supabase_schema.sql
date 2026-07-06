-- ============================================================================
-- Auverra Watches — Full Supabase SQL Schema (MongoDB fully retired)
-- Run this in Supabase Dashboard → SQL Editor (or via `supabase db push`)
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE guards.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1) PROFILES — mirrors auth.users, adds role for admin gating
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when new.email = 'admin@auverra.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'admin');
$$;

-- ----------------------------------------------------------------------------
-- 2) CATALOG — categories, collections, products, testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text
);

create table if not exists public.collections (
  id text primary key,
  name text not null,
  slug text unique not null,
  tagline text,
  image text
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text,
  price numeric not null default 0,
  compare_at_price numeric,
  currency text not null default 'INR',
  category text references public.categories(slug),
  collection text references public.collections(slug),
  brand text default 'Auverra',
  images jsonb not null default '[]',
  description text,
  features jsonb not null default '[]',
  specs jsonb not null default '{}',
  variants jsonb not null default '{}',
  stock int not null default 0,
  rating numeric not null default 0,
  review_count int not null default 0,
  featured boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  limited_edition boolean not null default false,
  badges jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_collection on public.products(collection);
create index if not exists idx_products_featured on public.products(featured);

create table if not exists public.testimonials (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  title text,
  rating int not null default 5,
  text text not null
);

-- ----------------------------------------------------------------------------
-- 3) SHOPPING — carts, wishlists, orders, reviews
-- ----------------------------------------------------------------------------
create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  items jsonb not null default '[]',
  shipping jsonb,
  subtotal numeric not null default 0,
  shipping_cost numeric not null default 0,
  tax numeric not null default 0,
  total numeric not null default 0,
  payment_method text default 'cod',
  coupon_code text,
  discount numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders(user_id);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  user_name text,
  product_slug text references public.products(slug) on delete cascade,
  rating int not null check (rating between 1 and 5),
  title text,
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text default 'Home',
  full_name text,
  phone text,
  line1 text,
  line2 text,
  city text,
  state text,
  postal_code text,
  country text default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_addresses_user on public.addresses(user_id);

-- ----------------------------------------------------------------------------
-- 4) MARKETING & CONTENT — newsletter, contacts, coupons, blog
-- ----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  email text primary key,
  subscribed_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  subject text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text not null default 'percent' check (type in ('percent','flat')),
  value numeric not null,
  min_subtotal numeric not null default 0,
  usage_limit int not null default 0,
  usage_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  cover_image text,
  author text default 'Auverra Editorial',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5) SETTINGS — payment gateway configuration (admin panel)
-- ----------------------------------------------------------------------------
create table if not exists public.payment_settings (
  gateway text primary key,
  enabled boolean not null default false,
  mode text not null default 'test' check (mode in ('test','live')),
  fields jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payment_settings_updated_at on public.payment_settings;
create trigger trg_payment_settings_updated_at
  before update on public.payment_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6) ROW LEVEL SECURITY
-- All reads/writes from the Next.js app go through the server-side API using
-- the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS entirely. RLS below is a
-- defense-in-depth layer in case the anon/public key is ever queried directly
-- (e.g. from client components) — it only allows safe, narrow access.
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.testimonials enable row level security;
alter table public.carts enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;
alter table public.addresses enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contacts enable row level security;
alter table public.coupons enable row level security;
alter table public.blog_posts enable row level security;
alter table public.payment_settings enable row level security;

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner" on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

drop policy if exists "Public catalog read" on public.categories;
create policy "Public catalog read" on public.categories for select using (true);
drop policy if exists "Public catalog read" on public.collections;
create policy "Public catalog read" on public.collections for select using (true);
drop policy if exists "Public catalog read" on public.products;
create policy "Public catalog read" on public.products for select using (true);
drop policy if exists "Public catalog read" on public.testimonials;
create policy "Public catalog read" on public.testimonials for select using (true);

drop policy if exists "Published posts are public" on public.blog_posts;
create policy "Published posts are public" on public.blog_posts for select using (published = true);

drop policy if exists "Users manage own cart" on public.carts;
create policy "Users manage own cart" on public.carts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own wishlist" on public.wishlists;
create policy "Users manage own wishlist" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users view own orders" on public.orders;
create policy "Users view own orders" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Users create own orders" on public.orders;
create policy "Users create own orders" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select using (true);
drop policy if exists "Users create own reviews" on public.reviews;
create policy "Users create own reviews" on public.reviews for insert with check (auth.uid() = user_id);

drop policy if exists "Users manage own addresses" on public.addresses;
create policy "Users manage own addresses" on public.addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- newsletter_subscribers, contacts, coupons, payment_settings: no public
-- policies — only the service-role key (server-side API) may read/write these.

-- ----------------------------------------------------------------------------
-- 7) Promote a user to admin manually:
--    update public.profiles set role = 'admin' where email = 'you@example.com';
-- ----------------------------------------------------------------------------
