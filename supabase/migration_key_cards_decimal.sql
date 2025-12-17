-- Change adoption_rate from INTEGER to NUMERIC(5,2) to allow decimals (e.g. 99.99)
ALTER TABLE public.key_card_adoptions 
  ALTER COLUMN adoption_rate TYPE NUMERIC(5,2);

-- Update check constraint
ALTER TABLE public.key_card_adoptions 
  DROP CONSTRAINT IF EXISTS key_card_adoptions_adoption_rate_check;

ALTER TABLE public.key_card_adoptions 
  ADD CONSTRAINT key_card_adoptions_adoption_rate_check 
  CHECK (adoption_rate >= 0 AND adoption_rate <= 100);
