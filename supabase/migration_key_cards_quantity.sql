-- Rename column adoption_rate to adoption_quantity
ALTER TABLE public.key_card_adoptions 
  RENAME COLUMN adoption_rate TO adoption_quantity;

-- Drop the old constraint which was for rate (0-100)
ALTER TABLE public.key_card_adoptions 
  DROP CONSTRAINT IF EXISTS key_card_adoptions_adoption_rate_check;

-- Add new constraint for quantity? 
-- Assuming quantity is between 0 and 60 (max deck size) but usually 0-4. 
-- Let's set a safe upper bound like 60, or just leave it open but positive.
ALTER TABLE public.key_card_adoptions 
  ADD CONSTRAINT key_card_adoptions_adoption_quantity_check 
  CHECK (adoption_quantity >= 0);
