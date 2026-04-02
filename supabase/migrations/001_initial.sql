-- ─────────────────────────────────────────────────────────────
--  Finova — Migration initiale
--  Coller dans Supabase → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────

-- Active Row Level Security sur toutes les tables
-- Chaque utilisateur ne voit QUE ses propres données

-- ── Transactions ─────────────────────────────────────────────
create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('income', 'expense')),
  amount      numeric(12,2) not null check (amount > 0),
  category    text not null,
  description text,
  date        date not null,
  created_at  timestamptz default now()
);
alter table transactions enable row level security;
create policy "own transactions" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on transactions(user_id, date desc);

-- ── Budgets ──────────────────────────────────────────────────
create table if not exists budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  category     text not null,
  limit_amount numeric(12,2) not null check (limit_amount > 0),
  color        text not null default '#00d4aa',
  created_at   timestamptz default now(),
  unique(user_id, category)
);
alter table budgets enable row level security;
create policy "own budgets" on budgets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Épargne Cornet ───────────────────────────────────────────
create table if not exists savings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('deposit', 'withdrawal')),
  amount      numeric(12,2) not null check (amount > 0),
  description text,
  date        date not null,
  created_at  timestamptz default now()
);
alter table savings enable row level security;
create policy "own savings" on savings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index on savings(user_id, date desc);

-- ── Investissements Bourse ───────────────────────────────────
create table if not exists investments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  symbol        text not null,
  name          text,
  sector        text not null default 'Actions',
  buy_price     numeric(12,4) not null check (buy_price > 0),
  quantity      numeric(16,6) not null check (quantity > 0),
  current_price numeric(12,4) not null check (current_price > 0),
  date          date not null,
  created_at    timestamptz default now()
);
alter table investments enable row level security;
create policy "own investments" on investments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Abonnements Annuels ──────────────────────────────────────
create table if not exists subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  amount       numeric(12,2) not null check (amount > 0),
  category     text not null default 'Autre',
  renewal_date date not null,
  auto_save    boolean not null default true,
  created_at   timestamptz default now()
);
alter table subscriptions enable row level security;
create policy "own subscriptions" on subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
--  Pour ajouter un futur module, ajouter une nouvelle table ici
--  en suivant le même pattern : user_id + RLS policy
-- ─────────────────────────────────────────────────────────────
