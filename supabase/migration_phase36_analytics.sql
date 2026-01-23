-- Phase 36: Deck Analytics Automation

CREATE TABLE IF NOT EXISTS public.analyzed_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  deck_code TEXT NOT NULL,
  archetype_id UUID NOT NULL REFERENCES public.user_deck_archetypes(id) ON DELETE CASCADE,
  cards_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_analyzed_decks_archetype_id ON public.analyzed_decks(archetype_id);
CREATE INDEX IF NOT EXISTS idx_analyzed_decks_deck_code ON public.analyzed_decks(deck_code);

-- RLS (Admin Only for now, though technically user_id check is enough for personal analytics)
ALTER TABLE public.analyzed_decks ENABLE ROW LEVEL SECURITY;

-- Allow Users to view/manage their OWN analyzed decks
CREATE POLICY "Users can manage their own analyzed decks"
  ON public.analyzed_decks FOR ALL
  USING (auth.uid() = user_id);

-- (Optional) If we want global admins to see all, we can add that policy later.
