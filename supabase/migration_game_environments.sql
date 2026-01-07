-- 環境管理テーブル
CREATE TABLE IF NOT EXISTS public.game_environments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_game_environments_start_date ON public.game_environments(start_date);
CREATE INDEX IF NOT EXISTS idx_game_environments_end_date ON public.game_environments(end_date);

-- RLS（全員が読み取り可能、管理者のみ編集可能）
ALTER TABLE public.game_environments ENABLE ROW LEVEL SECURITY;

-- 全員が閲覧可能
CREATE POLICY "Everyone can view environments"
  ON public.game_environments FOR SELECT
  USING (true);

-- 管理者のみ追加・編集・削除可能
CREATE POLICY "Admins can manage environments"
  ON public.game_environments FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'player1@pokeka.local',
      'player2@pokeka.local', 
      'player3@pokeka.local',
      'r.matsumoto.3o3@gmail.com',
      'nexpure.event@gmail.com',
      'admin@pokeka.local'
    )
  );

-- 初期データ（例）
INSERT INTO public.game_environments (name, start_date, description) VALUES
  ('Hレギュ', '2024-01-26', 'Hレギュレーション開始'),
  ('ワイルドフォース環境', '2024-03-22', 'ワイルドフォース発売')
ON CONFLICT DO NOTHING;
