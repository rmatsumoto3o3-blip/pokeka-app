-- 追加のDiscord情報を保存するためのカラムを追加
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS discord_avatar TEXT,
  ADD COLUMN IF NOT EXISTS discord_name TEXT;

-- トリガー関数をさらに強化（名前とアバターも取得）
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_discord_id TEXT;
  v_nickname TEXT;
  v_email TEXT;
  v_avatar TEXT;
BEGIN
  v_discord_id := NEW.raw_user_meta_data->>'provider_id';
  v_avatar := NEW.raw_user_meta_data->>'avatar_url';
  v_nickname := COALESCE(
    NEW.raw_user_meta_data->>'nickname',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    CASE WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1) ELSE 'プレイヤー' END
  );
  v_email := NEW.email;
  
  INSERT INTO public.users (id, email, nickname, discord_id, discord_avatar, discord_name)
  VALUES (NEW.id, v_email, v_nickname, v_discord_id, v_avatar, v_nickname)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nickname = EXCLUDED.nickname,
    discord_id = EXCLUDED.discord_id,
    discord_avatar = EXCLUDED.discord_avatar,
    discord_name = EXCLUDED.discord_name;
    
  RETURN NEW;
END;
$$;
