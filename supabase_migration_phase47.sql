-- Phase 47: Featured Card Trends

-- 1. Create table for daily snapshots of card usage
CREATE TABLE IF NOT EXISTS public.card_trend_snapshots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    recorded_at date NOT NULL DEFAULT CURRENT_DATE,
    card_name text NOT NULL,
    adoption_rate float NOT NULL, -- Percentage (0-100)
    avg_quantity float DEFAULT 0, -- Average quantity per deck
    total_decks_analyzed int DEFAULT 0, -- Sample size
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(recorded_at, card_name) -- Ensure one record per card per day
);

-- 2. Create table for admin-selected featured cards
CREATE TABLE IF NOT EXISTS public.featured_cards (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    card_name text NOT NULL UNIQUE,
    display_order int DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.card_trend_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_cards ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Public Read Access
CREATE POLICY "Enable read access for all users" ON public.card_trend_snapshots FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.featured_cards FOR SELECT USING (true);

-- Admin Write Access (Service Role bypasses RLS, but if using authenticated client)
-- Assuming Service Role is used for writes in actions.ts, so no specific policy needed for Insert/Update/Delete unless authenticated user (admin) does it directly.
-- But let's add authenticated policy for safety if Admin uses client-side auth.
CREATE POLICY "Enable write access for authenticated users only" ON public.featured_cards FOR ALL USING (auth.role() = 'authenticated');
-- Snapshots are written by System/Admin action
CREATE POLICY "Enable write access for authenticated users only" ON public.card_trend_snapshots FOR ALL USING (auth.role() = 'authenticated');
