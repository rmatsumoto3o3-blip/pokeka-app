-- ============================================
-- データベース修正 - サイドフィールドの修正
-- ============================================
-- side カラムを先攻/後攻の制約から解放し、自由入力可能に変更
-- opponent_name を任意項目に変更

-- 1. side カラムの制約を削除
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_side_check;

-- 2. opponent_name を任意項目に変更
ALTER TABLE public.matches ALTER COLUMN opponent_name DROP NOT NULL;

-- 3. going_first カラムの型を変更（boolean → text）
ALTER TABLE public.matches DROP COLUMN IF EXISTS going_first;
ALTER TABLE public.matches ADD COLUMN going_first TEXT CHECK (going_first IN ('先攻', '後攻') OR going_first IS NULL);

-- ============================================
-- 修正完了
-- ============================================
-- これで以下が可能になります:
-- - side: 自由入力（例: "3-6", "自分3 相手6"）
-- - opponent_name: 任意入力
-- - going_first: 先攻/後攻の選択
