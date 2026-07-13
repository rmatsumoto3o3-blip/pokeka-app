-- ユニオンアリーナのデッキは「シリーズ + 色」で構築が変わるため、
-- 大会結果デッキにも色タグとフル表記のデッキ名を持たせる

ALTER TABLE unionarena_deck_records
    ADD COLUMN IF NOT EXISTS color TEXT,
    ADD COLUMN IF NOT EXISTS deck_name TEXT; -- 例: 【紫】アイドルマスター シャイニーカラーズ
