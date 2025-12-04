-- ============================================
-- RLSエラー修正用SQL
-- ============================================
-- usersテーブルへのINSERT権限を追加します。
-- これを実行すれば「new row violates row-level security policy」が直ります。

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 念のため、既存のユーザーがいればプロファイルを作成しておく（救済措置）
INSERT INTO public.users (id, email, nickname)
SELECT id, email, COALESCE(raw_user_meta_data->>'nickname', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;
