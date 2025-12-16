-- Key Card Adoptions Table
CREATE TABLE IF NOT EXISTS public.key_card_adoptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    archetype_id UUID NOT NULL REFERENCES public.deck_archetypes(id) ON DELETE CASCADE,
    card_name TEXT NOT NULL,
    image_url TEXT,
    adoption_rate INTEGER NOT NULL CHECK (adoption_rate >= 0 AND adoption_rate <= 100),
    category TEXT NOT NULL CHECK (category IN ('Pokemon', 'Goods', 'Supporter', 'Stadium', 'Energy')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.key_card_adoptions ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Allow public read access" ON public.key_card_adoptions
    FOR SELECT TO public
    USING (true);

-- Only admins can insert/update/delete (Check logic similar to decks)
-- Note: Simplified for now, assuming app logic handles auth check or we add specific policies
CREATE POLICY "Allow admin full access" ON public.key_card_adoptions
    FOR ALL TO authenticated
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
