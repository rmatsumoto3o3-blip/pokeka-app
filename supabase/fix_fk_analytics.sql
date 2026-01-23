
-- Fix Foreign Key for analyzed_decks
ALTER TABLE public.analyzed_decks
DROP CONSTRAINT IF EXISTS analyzed_decks_archetype_id_fkey;

ALTER TABLE public.analyzed_decks
ADD CONSTRAINT analyzed_decks_archetype_id_fkey
FOREIGN KEY (archetype_id)
REFERENCES public.deck_archetypes(id)
ON DELETE CASCADE;
