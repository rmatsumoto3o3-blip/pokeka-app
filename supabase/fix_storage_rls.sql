-- ============================================
-- Storage (画像保存) の権限修正SQL (修正版)
-- ============================================
-- エラー "must be owner of table objects" を回避するため
-- ALTER TABLE文を削除しました。

-- 1. 既存のポリシーを削除 (重複エラー防止)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- 2. 新しいポリシーを作成 (deck-imagesバケット用)

-- アップロード許可 (INSERT)
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'deck-images');

-- 閲覧許可 (SELECT)
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT USING (bucket_id = 'deck-images');

-- 更新許可 (UPDATE)
CREATE POLICY "Allow public update" ON storage.objects
FOR UPDATE USING (bucket_id = 'deck-images');

-- 削除許可 (DELETE)
CREATE POLICY "Allow public delete" ON storage.objects
FOR DELETE USING (bucket_id = 'deck-images');
