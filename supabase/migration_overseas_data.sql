-- PokeLix overseas Pokemon TCG schema proposal.
-- IMPORTANT: this file is intentionally NOT applied by the application.
-- Apply in Supabase SQL Editor only after explicit user approval and API recovery.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS overseas_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  source_tournament_id TEXT NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  event_date_start DATE NOT NULL,
  event_date_end DATE,
  city TEXT,
  country_code TEXT,
  region TEXT NOT NULL DEFAULT 'Other'
    CHECK (region IN ('North America', 'Europe', 'Oceania', 'Latin America', 'Asia', 'Other')),
  player_count INTEGER CHECK (player_count IS NULL OR player_count >= 0),
  format TEXT,
  division TEXT,
  source_url TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT overseas_tournaments_source_unique UNIQUE (source, source_tournament_id),
  CONSTRAINT overseas_tournaments_date_order CHECK (event_date_end IS NULL OR event_date_end >= event_date_start)
);

CREATE TABLE IF NOT EXISTS overseas_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL UNIQUE,
  name_ja TEXT,
  cover_image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS overseas_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES overseas_tournaments(id) ON DELETE CASCADE,
  archetype_id UUID REFERENCES overseas_archetypes(id) ON DELETE SET NULL,
  source_result_id TEXT NOT NULL UNIQUE,
  placing INTEGER NOT NULL CHECK (placing > 0),
  rank_label TEXT,
  player_name TEXT NOT NULL,
  country_code TEXT,
  wins INTEGER CHECK (wins IS NULL OR wins >= 0),
  losses INTEGER CHECK (losses IS NULL OR losses >= 0),
  ties INTEGER CHECK (ties IS NULL OR ties >= 0),
  decklist_public BOOLEAN NOT NULL DEFAULT FALSE,
  source_url TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS overseas_deck_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES overseas_results(id) ON DELETE CASCADE,
  card_key TEXT NOT NULL,
  tcgdex_card_id TEXT,
  card_name_en TEXT NOT NULL,
  card_name_ja TEXT,
  set_code TEXT,
  collector_number TEXT,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 60),
  category TEXT CHECK (category IS NULL OR category IN ('Pokemon', 'Trainer', 'Energy')),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT overseas_deck_cards_result_card_unique UNIQUE (result_id, card_key)
);

CREATE TABLE IF NOT EXISTS overseas_archetype_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  region TEXT NOT NULL DEFAULT 'All',
  format TEXT NOT NULL DEFAULT 'All',
  archetype_id UUID NOT NULL REFERENCES overseas_archetypes(id) ON DELETE CASCADE,
  deck_count INTEGER NOT NULL DEFAULT 0 CHECK (deck_count >= 0),
  total_decks INTEGER NOT NULL DEFAULT 0 CHECK (total_decks >= 0),
  share NUMERIC(7, 4) NOT NULL DEFAULT 0 CHECK (share BETWEEN 0 AND 100),
  wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  top_cut_count INTEGER NOT NULL DEFAULT 0 CHECK (top_cut_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT overseas_archetype_stats_period_order CHECK (period_end >= period_start),
  CONSTRAINT overseas_archetype_stats_scope_unique UNIQUE (snapshot_date, period_start, period_end, region, format, archetype_id)
);

CREATE TABLE IF NOT EXISTS overseas_collection_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed', 'partial')),
  fetched_count INTEGER NOT NULL DEFAULT 0 CHECK (fetched_count >= 0),
  inserted_count INTEGER NOT NULL DEFAULT 0 CHECK (inserted_count >= 0),
  updated_count INTEGER NOT NULL DEFAULT 0 CHECK (updated_count >= 0),
  skipped_count INTEGER NOT NULL DEFAULT 0 CHECK (skipped_count >= 0),
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS overseas_tournaments_date_idx ON overseas_tournaments (event_date_start DESC);
CREATE INDEX IF NOT EXISTS overseas_tournaments_region_date_idx ON overseas_tournaments (region, event_date_start DESC);
CREATE INDEX IF NOT EXISTS overseas_results_tournament_placing_idx ON overseas_results (tournament_id, placing);
CREATE INDEX IF NOT EXISTS overseas_results_archetype_idx ON overseas_results (archetype_id);
CREATE INDEX IF NOT EXISTS overseas_deck_cards_result_idx ON overseas_deck_cards (result_id);
CREATE INDEX IF NOT EXISTS overseas_archetype_stats_scope_idx ON overseas_archetype_stats (snapshot_date DESC, region, format);
CREATE INDEX IF NOT EXISTS overseas_collection_runs_source_started_idx ON overseas_collection_runs (source, started_at DESC);

ALTER TABLE overseas_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_archetype_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_collection_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read overseas tournaments" ON overseas_tournaments;
CREATE POLICY "Public read overseas tournaments" ON overseas_tournaments FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public read overseas archetypes" ON overseas_archetypes;
CREATE POLICY "Public read overseas archetypes" ON overseas_archetypes FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public read overseas results" ON overseas_results;
CREATE POLICY "Public read overseas results" ON overseas_results FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public read overseas deck cards" ON overseas_deck_cards;
CREATE POLICY "Public read overseas deck cards" ON overseas_deck_cards FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public read overseas archetype stats" ON overseas_archetype_stats;
CREATE POLICY "Public read overseas archetype stats" ON overseas_archetype_stats FOR SELECT TO anon, authenticated USING (TRUE);

-- No policy is created for overseas_collection_runs. It remains service-role only.
-- No INSERT/UPDATE/DELETE policy is created for public roles.

COMMENT ON TABLE overseas_archetype_stats IS 'Daily precomputed metagame shares; pages must not aggregate all result rows at request time.';
COMMENT ON TABLE overseas_collection_runs IS 'Private collector health log; not readable by anon/authenticated roles.';
