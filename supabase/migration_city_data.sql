-- シティリーグ 収集データ（本番ストレージ）
-- 適用：Supabase SQL Editor で実行。

-- 大会（1行=1大会、入賞結果は results に JSON で保持）
create table if not exists public.city_events (
    event_holding_id int primary key,
    date            text not null,          -- "YYYYMMDD"
    shop            text,
    prefecture      text,
    league          text,
    entrants_count  int,
    results         jsonb not null default '[]'::jsonb  -- [{rank, deck_id}]
);
create index if not exists city_events_date_idx on public.city_events(date);
create index if not exists city_events_league_idx on public.city_events(league);

-- デッキ構成キャッシュ（deck_code -> カード配列）
create table if not exists public.city_decks (
    deck_code   text primary key,
    cards       jsonb not null,             -- [{name, quantity, supertype, image}]
    resolved_at timestamptz not null default now()
);

alter table public.city_events enable row level security;
alter table public.city_decks enable row level security;

drop policy if exists "city_events_read" on public.city_events;
create policy "city_events_read" on public.city_events for select using (true);

drop policy if exists "city_decks_read" on public.city_decks;
create policy "city_decks_read" on public.city_decks for select using (true);

-- 書き込みは同期スクリプトが service-role で実行（RLSバイパス）。
