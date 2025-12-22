-- deck_archetypesテーブルにdisplay_orderカラムを追加
ALTER TABLE public.deck_archetypes 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- 既存のデータに初期値を設定（作成日順など）
WITH sequences AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 as new_order
  FROM deck_archetypes
)
UPDATE deck_archetypes
SET display_order = sequences.new_order
FROM sequences
WHERE deck_archetypes.id = sequences.id;
