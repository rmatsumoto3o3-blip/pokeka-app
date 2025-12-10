-- Function to check deck limits
CREATE OR REPLACE FUNCTION check_deck_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  current_count integer;
  limit_count integer := 5; -- Beta Limit: 5 Decks
BEGIN
  -- Get user email from JWT
  user_email := auth.jwt() ->> 'email';

  -- Bypass for Admins
  IF user_email IN ('player1@pokeka.local', 'player2@pokeka.local', 'player3@pokeka.local') THEN
    RETURN NEW;
  END IF;

  -- Check current count
  SELECT count(*) INTO current_count FROM public.decks WHERE user_id = auth.uid();

  IF current_count >= limit_count THEN
    RAISE EXCEPTION 'Beta limit reached: You can only create up to % decks.', limit_count;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check match limits
CREATE OR REPLACE FUNCTION check_match_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  current_count integer;
  limit_count integer := 100; -- Beta Limit: 100 Matches
BEGIN
  -- Get user email from JWT
  user_email := auth.jwt() ->> 'email';

  -- Bypass for Admins
  IF user_email IN ('player1@pokeka.local', 'player2@pokeka.local', 'player3@pokeka.local') THEN
    RETURN NEW;
  END IF;

  -- Check current count
  SELECT count(*) INTO current_count FROM public.matches WHERE user_id = auth.uid();

  IF current_count >= limit_count THEN
    RAISE EXCEPTION 'Beta limit reached: You can only create up to % matches.', limit_count;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS enforce_deck_limit ON public.decks;
CREATE TRIGGER enforce_deck_limit
  BEFORE INSERT ON public.decks
  FOR EACH ROW
  EXECUTE FUNCTION check_deck_limit();

DROP TRIGGER IF EXISTS enforce_match_limit ON public.matches;
CREATE TRIGGER enforce_match_limit
  BEFORE INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION check_match_limit();
