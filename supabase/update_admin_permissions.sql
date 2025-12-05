-- ============================================
-- 参考デッキRLSポリシーの更新（管理者2名対応）
-- ============================================
-- player1@pokeka.local と player2@pokeka.local の2名を管理者に設定

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Only admin can insert reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can update reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can delete reference decks" ON public.reference_decks;

-- 新しいポリシーを作成（2名の管理者対応）
CREATE POLICY "Only admin can insert reference decks" ON public.reference_decks
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"')
  );

CREATE POLICY "Only admin can update reference decks" ON public.reference_decks
  FOR UPDATE USING (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"')
  );

CREATE POLICY "Only admin can delete reference decks" ON public.reference_decks
  FOR DELETE USING (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"')
  );

-- ============================================
-- 修正完了
-- ============================================
-- player1@pokeka.local と player2@pokeka.local が参考デッキを管理できます
