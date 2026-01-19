-- Add custom_cards column to decks table to store JSON card data
-- This allows saving decks that don't have an official deck code (e.g. locally modified decks)

ALTER TABLE decks 
ADD COLUMN custom_cards JSONB DEFAULT NULL;

COMMENT ON COLUMN decks.custom_cards IS 'JSON array of card data for decks without official codes';
