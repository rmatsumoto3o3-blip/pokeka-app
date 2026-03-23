-- Phase 48: Add event_rank to support ranking-based filtering and analytics

DO $$
BEGIN
    -- Add event_rank to reference_decks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reference_decks' AND column_name = 'event_rank') THEN
        ALTER TABLE public.reference_decks 
        ADD COLUMN event_rank TEXT CHECK (event_rank IN ('優勝', '準優勝', 'TOP4', 'TOP8'));
    END IF;

    -- Add event_rank to analyzed_decks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analyzed_decks' AND column_name = 'event_rank') THEN
        ALTER TABLE public.analyzed_decks 
        ADD COLUMN event_rank TEXT CHECK (event_rank IN ('優勝', '準優勝', 'TOP4', 'TOP8'));
    END IF;
END $$;
