-- 1. アーキタイプ用テーブルを作成（存在しない場合）
create table if not exists deck_archetypes (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  -- 画像URLカラムも最初から追加
  cover_image_url text, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. 既存テーブル（reference_decks）との紐付けを追加
do $$
begin
    -- reference_decks に event_type カラムを追加
    if not exists (select 1 from information_schema.columns where table_name = 'reference_decks' and column_name = 'event_type') then
        alter table reference_decks 
        add column event_type text check (event_type in ('City League', 'Championship', 'Worldwide', 'Gym Battle'));
    end if;

    -- reference_decks に archetype_id カラムを追加
    if not exists (select 1 from information_schema.columns where table_name = 'reference_decks' and column_name = 'archetype_id') then
        alter table reference_decks 
        add column archetype_id uuid references deck_archetypes(id);
    end if;
end $$;

-- 3. セキュリティ設定（RLS）を有効化
alter table deck_archetypes enable row level security;

-- 読み取り許可（全員）
drop policy if exists "Allow public read access" on deck_archetypes;
create policy "Allow public read access" on deck_archetypes for select using (true);

-- 書き込み許可（全員許可にしてアプリ側で制御）
drop policy if exists "Allow internal insert access" on deck_archetypes;
create policy "Allow internal insert access" on deck_archetypes for insert with check (true);

-- 更新許可（全員許可にしてアプリ側で制御）
drop policy if exists "Allow internal update access" on deck_archetypes;
create policy "Allow internal update access" on deck_archetypes for update using (true);
