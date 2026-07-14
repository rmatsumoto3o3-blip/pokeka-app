-- ユニアリのデッキ情報を公式サイトに依存せず永続化するための列追加。
-- ・card_list: スクレイピング時に取得したカード構成（名前・枚数など）をJSONで保存し、
--   詳細ページは公式APIへのリアルタイムアクセスをやめてここから読む（deck_code失効に耐える）。
-- ・画像（thumbnail_url / image_url / logo_url）は Supabase Storage に保存した
--   自前URLで上書きするため列の追加は不要（既存列をそのまま使う）。

ALTER TABLE unionarena_deck_records
    ADD COLUMN IF NOT EXISTS card_list JSONB;

ALTER TABLE unionarena_recommended_decks
    ADD COLUMN IF NOT EXISTS card_list JSONB;
