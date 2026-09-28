-- シティリーグ アーキタイプ区分（本番＝Supabase保存）
-- 適用：Supabase ダッシュボードの SQL Editor でこのファイルを実行。

-- デッキ単位の区分（手動上書き）
create table if not exists public.city_deck_archetypes (
    deck_code  text primary key,
    archetype  text not null,
    updated_at timestamptz not null default now()
);

-- 代表カード → 既存アーキタイプ のエイリアス（自動名を既存名へ寄せる）
create table if not exists public.city_archetype_rules (
    representative text primary key,
    archetype      text not null,
    updated_at     timestamptz not null default now()
);

alter table public.city_deck_archetypes enable row level security;
alter table public.city_archetype_rules enable row level security;

-- 表示用に公開読み取りを許可（/city は静的に読む）。
drop policy if exists "city_deck_archetypes_read" on public.city_deck_archetypes;
create policy "city_deck_archetypes_read" on public.city_deck_archetypes for select using (true);

drop policy if exists "city_archetype_rules_read" on public.city_archetype_rules;
create policy "city_archetype_rules_read" on public.city_archetype_rules for select using (true);

-- 書き込みは API が service-role で実行（RLSをバイパス）。anon/auth 用の write policy は作らない＝一般は書けない。
