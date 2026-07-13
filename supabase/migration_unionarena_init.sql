-- ユニオンアリーナ専用テーブル群
-- ポケカ用テーブル（deck_archetypes, deck_records, archetype_card_stats など）とは完全に独立させる。
-- 構成はポケカ側のテーブルをミラーリングしている。

-- 1. デッキタイプ（アーキタイプ）
CREATE TABLE IF NOT EXISTS unionarena_deck_archetypes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    cover_image_url TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 大会入賞デッキ記録（GASスクレイピングの書き込み先）
CREATE TABLE IF NOT EXISTS unionarena_deck_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_code TEXT,
    archetype_id UUID REFERENCES unionarena_deck_archetypes(id) ON DELETE SET NULL,
    event_rank TEXT, -- '優勝' / '準優勝' / 'TOP4' / 'TOP8' 等、フリーテキスト
    event_date TEXT,
    event_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. アーキタイプ別カード採用統計（Egress対策用の事前集計テーブル）
CREATE TABLE IF NOT EXISTS unionarena_archetype_card_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archetype_id UUID NOT NULL REFERENCES unionarena_deck_archetypes(id) ON DELETE CASCADE,
    event_rank TEXT, -- NULL = 'ALL'
    card_name TEXT NOT NULL,
    supertype TEXT,
    subtypes JSONB,
    image_url TEXT,
    total_qty INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    total_decks INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(archetype_id, event_rank, card_name)
);

-- 4. 全体カード採用統計
CREATE TABLE IF NOT EXISTS unionarena_global_card_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_rank TEXT,
    card_name TEXT NOT NULL,
    supertype TEXT,
    subtypes JSONB,
    image_url TEXT,
    total_qty INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    total_decks INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_rank, card_name)
);

-- 5. 直近2ヶ月の採用カード（アーキタイプページ表示用）
CREATE TABLE IF NOT EXISTS unionarena_archetype_cards_recent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archetype_id UUID NOT NULL REFERENCES unionarena_deck_archetypes(id) ON DELETE CASCADE,
    card_name TEXT NOT NULL,
    supertype TEXT,
    subtypes JSONB,
    image_url TEXT,
    total_qty INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    total_decks INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(archetype_id, card_name)
);

-- 6. 注目カード（TOPページ表示用の手動選定リスト）
CREATE TABLE IF NOT EXISTS unionarena_featured_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. カード採用率の推移スナップショット
CREATE TABLE IF NOT EXISTS unionarena_card_trend_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorded_at DATE NOT NULL,
    card_name TEXT NOT NULL,
    adoption_rate NUMERIC,
    avg_quantity NUMERIC,
    total_decks_analyzed INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_unionarena_deck_records_archetype ON unionarena_deck_records(archetype_id);
CREATE INDEX IF NOT EXISTS idx_unionarena_deck_records_created_at ON unionarena_deck_records(created_at);
CREATE INDEX IF NOT EXISTS idx_unionarena_archetype_card_stats_archetype_rank ON unionarena_archetype_card_stats(archetype_id, event_rank);
CREATE INDEX IF NOT EXISTS idx_unionarena_global_card_stats_rank ON unionarena_global_card_stats(event_rank);
CREATE INDEX IF NOT EXISTS idx_unionarena_archetype_cards_recent_archetype ON unionarena_archetype_cards_recent(archetype_id);
CREATE INDEX IF NOT EXISTS idx_unionarena_card_trend_snapshots_recorded_at ON unionarena_card_trend_snapshots(recorded_at);

-- RLS: 全テーブルとも「全員が読み取り可能・書き込みはアプリ側（service role / admin判定）で制御」というポケカ側の既存方針を踏襲
ALTER TABLE unionarena_deck_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_deck_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_archetype_card_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_global_card_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_archetype_cards_recent ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_featured_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_card_trend_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON unionarena_deck_archetypes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_deck_records FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_archetype_card_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_global_card_stats FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_archetype_cards_recent FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_featured_cards FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_card_trend_snapshots FOR SELECT USING (true);

-- 書き込みは service role キー（GAS/管理画面経由）のみを想定し、anon向けの insert/update ポリシーはあえて作らない。
-- 管理画面から一般ユーザー権限で書き込む必要が出た場合は、ポケカ側の
-- "Allow internal insert access" ... USING (true) 方式を個別に追加すること。
