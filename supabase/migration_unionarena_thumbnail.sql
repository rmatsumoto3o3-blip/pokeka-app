-- 大会結果ページの各デッキごとのサムネイル画像（decksthumbnail）を保存する。
-- シリーズのロゴ（横長ワードマーク）を正方形に無理やり当てはめると潰れて読めないため、
-- デッキ一覧・詳細では本来こちらを優先して使う。

ALTER TABLE unionarena_deck_records
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
