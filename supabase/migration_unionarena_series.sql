-- ユニオンアリーナ シリーズ（参加タイトル）マスター & 公式おすすめデッキ

-- 1. シリーズマスター（タグコード -> シリーズ名・ロゴ画像）
CREATE TABLE IF NOT EXISTS unionarena_series (
    tag_code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. 公式おすすめデッキ（大会結果とは別。タイトル別おすすめデッキページ由来）
CREATE TABLE IF NOT EXISTS unionarena_recommended_decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_code TEXT NOT NULL UNIQUE,
    tag_code TEXT REFERENCES unionarena_series(tag_code) ON DELETE SET NULL,
    deck_name TEXT,
    image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_unionarena_recommended_decks_tag ON unionarena_recommended_decks(tag_code);

ALTER TABLE unionarena_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE unionarena_recommended_decks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON unionarena_series FOR SELECT USING (true);
CREATE POLICY "Public read access" ON unionarena_recommended_decks FOR SELECT USING (true);
