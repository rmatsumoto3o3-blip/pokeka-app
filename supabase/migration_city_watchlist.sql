-- シティリーグ 注目カード（採用率パネルに出すカード）。管理者が画面から編集。
-- 適用：Supabase SQL Editor で実行。

create table if not exists public.city_watchlist (
    card_name  text primary key,
    sort_order int  not null default 0,
    updated_at timestamptz not null default now()
);

alter table public.city_watchlist enable row level security;

drop policy if exists "city_watchlist_read" on public.city_watchlist;
create policy "city_watchlist_read" on public.city_watchlist for select using (true);

-- 書き込みは API が service-role で実行（RLSバイパス）。
