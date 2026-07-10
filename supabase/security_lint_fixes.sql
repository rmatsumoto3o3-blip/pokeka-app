-- =====================================================================
-- PokéLix セキュリティ Lint 対応マイグレーション
-- 実行方法: Supabase ダッシュボード → SQL Editor に貼り付けて Run
-- 作成日: 2026-07-08
--
-- 事前判定（コード調査済み）:
--   check_deck_limit / check_match_limit ... トリガー（EXECUTE剥奪しても発火）
--   handle_new_user .................. トリガー（同上）
--   sync_key_cards ................... アプリ内で未使用
--   get_archetype_deck_counts ........ service_role から呼び出し
--   update_archetype_order ........... 管理画面(authenticated)から呼び出し
--                                      → authenticated は維持し、関数内で管理者ガード
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 関数の search_path を固定（Lint: function_search_path_mutable）
--    挙動は変わらないので安全。
-- ---------------------------------------------------------------------
ALTER FUNCTION public.update_updated_at_column()    SET search_path = public, pg_temp;
ALTER FUNCTION public.check_deck_limit()            SET search_path = public, pg_temp;
ALTER FUNCTION public.check_match_limit()           SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_key_cards(text, jsonb)   SET search_path = public, pg_temp;
ALTER FUNCTION public.get_archetype_deck_counts()   SET search_path = public, pg_temp;
-- update_archetype_order は下の 4 で CREATE OR REPLACE 時に SET する。


-- ---------------------------------------------------------------------
-- 2. 匿名(anon)からの EXECUTE を全て剥奪
--    （Lint: anon_security_definer_function_executable）
-- ---------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.update_archetype_order(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_key_cards(text, jsonb)   FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()             FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_deck_limit()            FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_match_limit()           FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_archetype_deck_counts()   FROM anon;


-- ---------------------------------------------------------------------
-- 3. authenticated からの EXECUTE を剥奪（安全と判定したものだけ）
--    （Lint: authenticated_security_definer_function_executable）
-- ---------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.sync_key_cards(text, jsonb)   FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()            FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_deck_limit()           FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_match_limit()          FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_archetype_deck_counts()  FROM authenticated;
-- update_archetype_order は管理画面が authenticated で呼ぶため維持（下の 4 でガード追加）。


-- ---------------------------------------------------------------------
-- 4. update_archetype_order に管理者ガードを追加
--    authenticated のままでも、管理者メール以外は実行不可にする。
--    ※ 管理者メールは app/admin/layout.tsx の ADMIN_EMAILS と一致させること。
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_archetype_order(orders JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    order_record JSONB;
    caller_email TEXT;
BEGIN
    caller_email := auth.jwt() ->> 'email';
    IF caller_email IS NULL OR caller_email NOT IN (
        'player1@pokeka.local',
        'r.matsumoto.3o3@gmail.com',
        'nexpure.event@gmail.com',
        'admin@pokeka.local'
    ) THEN
        RAISE EXCEPTION 'not authorized';
    END IF;

    FOR order_record IN SELECT * FROM jsonb_array_elements(orders)
    LOOP
        UPDATE deck_archetypes
        SET display_order = (order_record->>'new_order')::INTEGER
        WHERE id = (order_record->>'id')::UUID;
    END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_archetype_order(jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.update_archetype_order(jsonb) TO authenticated;


-- ---------------------------------------------------------------------
-- 5.（任意・要検証）公開バケットの listing ポリシー削除
--    Lint: public_bucket_allows_listing
--    公開URL直アクセス（/storage/v1/object/public/...）は維持されます。
--    list API はアプリ内未使用と確認済みだが、実行後に画像表示を必ず確認。
--    もし画像が出なくなったら、この2行をロールバック（元のポリシーを再作成）。
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "public can read archetype images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public viewing"             ON storage.objects;


-- =====================================================================
-- 6. 手動対応（SQLでは不可）:
--    Leaked Password Protection を有効化
--    → ダッシュボード → Authentication → Sign In / Providers →
--      "Leaked password protection" を ON（HaveIBeenPwned照合）
-- =====================================================================
