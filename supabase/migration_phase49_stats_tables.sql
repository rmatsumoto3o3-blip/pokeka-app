-- Phase 49: Pre-calculated Stats Tables for Egress Optimization

-- Table for Archetype-specific Card Statistics
CREATE TABLE IF NOT EXISTS archetype_card_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    archetype_id UUID NOT NULL REFERENCES deck_archetypes(id) ON DELETE CASCADE,
    event_rank TEXT, -- NULL means 'All Ranks', otherwise '優勝', '準優勝', etc.
    card_name TEXT NOT NULL,
    supertype TEXT,
    subtypes JSONB,
    image_url TEXT,
    total_qty INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    total_decks INTEGER DEFAULT 0, -- the denominator for calculating rates
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(archetype_id, event_rank, card_name)
);

-- Table for Global Card Statistics (across all archetypes)
CREATE TABLE IF NOT EXISTS global_card_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_rank TEXT, -- NULL means 'All Ranks'
    card_name TEXT NOT NULL,
    supertype TEXT,
    subtypes JSONB,
    image_url TEXT,
    total_qty INTEGER DEFAULT 0,
    adoption_count INTEGER DEFAULT 0,
    total_decks INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_rank, card_name)
);

-- Enable RLS
ALTER TABLE archetype_card_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_card_stats ENABLE ROW LEVEL SECURITY;

-- Public can read all stats
CREATE POLICY "Public read stats in archetype_card_stats" ON archetype_card_stats FOR SELECT USING (true);
CREATE POLICY "Public read stats in global_card_stats" ON global_card_stats FOR SELECT USING (true);

-- Indexes for fast querying
CREATE INDEX idx_archetype_card_stats_archetype_rank ON archetype_card_stats(archetype_id, event_rank);
CREATE INDEX idx_global_card_stats_rank ON global_card_stats(event_rank);
