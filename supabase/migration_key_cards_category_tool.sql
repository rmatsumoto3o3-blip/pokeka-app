-- Drop existing check constraint for category
ALTER TABLE public.key_card_adoptions 
  DROP CONSTRAINT IF EXISTS key_card_adoptions_category_check;

-- Add new check constraint including 'Tool'
ALTER TABLE public.key_card_adoptions 
  ADD CONSTRAINT key_card_adoptions_category_check 
  CHECK (category IN ('Pokemon', 'Goods', 'Tool', 'Supporter', 'Stadium', 'Energy'));
