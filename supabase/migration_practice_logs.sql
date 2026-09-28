-- 一人回しのプレイログ（匿名・要点イベント）。分析/将来のCPU学習用。
-- 適用：Supabase SQL Editor で実行。

create table if not exists public.practice_logs (
    id         uuid primary key default gen_random_uuid(),
    session_id text not null,            -- ランダム。同一セッションのチャンクを束ねる
    deck_code  text,
    events     jsonb not null default '[]'::jsonb,  -- [{t, ...}]
    meta       jsonb,                    -- {ua_kind, w, ...}（個人情報なし）
    created_at timestamptz not null default now()
);
create index if not exists practice_logs_session_idx on public.practice_logs(session_id);
create index if not exists practice_logs_created_idx on public.practice_logs(created_at);
create index if not exists practice_logs_deck_idx on public.practice_logs(deck_code);

-- RLS 有効・公開ポリシーなし＝anon からは読めない（書き込みは API が service-role で実行）。
alter table public.practice_logs enable row level security;
