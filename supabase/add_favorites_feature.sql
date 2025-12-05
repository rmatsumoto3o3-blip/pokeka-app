-- ============================================
-- お気に入り機能とデッキ削除機能の実装
-- ============================================

-- 1. 管理者を3名に拡張
DROP POLICY IF EXISTS "Only admin can insert reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can update reference decks" ON public.reference_decks;
DROP POLICY IF EXISTS "Only admin can delete reference decks" ON public.reference_decks;

CREATE POLICY "Only admin can insert reference decks" ON public.reference_decks
  FOR INSERT WITH CHECK (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"', '"player3@pokeka.local"')
  );

CREATE POLICY "Only admin can update reference decks" ON public.reference_decks
  FOR UPDATE USING (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"', '"player3@pokeka.local"')
  );

CREATE POLICY "Only admin can delete reference decks" ON public.reference_decks
  FOR DELETE USING (
    (auth.jwt() -> 'email')::text IN ('"player1@pokeka.local"', '"player2@pokeka.local"', '"player3@pokeka.local"')
  );

-- 2. お気に入りテーブルの作成
CREATE TABLE IF NOT EXISTS public.reference_deck_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.reference_decks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, deck_id)  -- 同じユーザーが同じデッキを複数回お気に入りできないように
);

-- 3. お気に入りテーブルのRLS設定
ALTER TABLE public.reference_deck_favorites ENABLE ROW LEVEL SECURITY;

-- 誰でも自分のお気に入りを閲覧可能
CREATE POLICY "Users can view own favorites" ON public.reference_deck_favorites
  FOR SELECT USING (auth.uid() = user_id);

-- 誰でも自分のお気に入りを追加可能
CREATE POLICY "Users can add own favorites" ON public.reference_deck_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 誰でも自分のお気に入りを削除可能
CREATE POLICY "Users can delete own favorites" ON public.reference_deck_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 4. インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.reference_deck_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_deck_id ON public.reference_deck_favorites(deck_id);

-- 5. お気に入り数を取得するビューの作成（オプション）
CREATE OR REPLACE VIEW public.reference_decks_with_favorites AS
SELECT 
  rd.*,
  COUNT(rdf.id) as favorite_count
FROM public.reference_decks rd
LEFT JOIN public.reference_deck_favorites rdf ON rd.id = rdf.deck_id
GROUP BY rd.id;

-- ビューの権限設定
GRANT SELECT ON public.reference_decks_with_favorites TO authenticated;

-- ============================================
-- 実装完了
-- ============================================
-- これで以下が可能になります:
-- - player1, player2, player3 が参考デッキを管理（削除含む）
-- - 全ユーザーが参考デッキをお気に入り登録/解除
-- - 各デッキのお気に入り数を表示
