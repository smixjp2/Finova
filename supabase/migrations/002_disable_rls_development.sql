-- ─────────────────────────────────────────────────────────────
--  Finova — Disable RLS for Development
--  Exécute ceci dans Supabase → SQL Editor → Run
--  ⚠️  NEVER disable RLS in production!
-- ─────────────────────────────────────────────────────────────

-- Disable RLS on all tables for development testing
alter table transactions disable row level security;
alter table budgets disable row level security;
alter table savings disable row level security;
alter table investments disable row level security;
alter table subscriptions disable row level security;

-- To re-enable RLS later:
--
-- alter table transactions enable row level security;
-- alter table budgets enable row level security;
-- alter table savings enable row level security;
-- alter table investments enable row level security;
-- alter table subscriptions enable row level security;
