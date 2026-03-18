import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing keys. Cannot connect.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  // First, find the archetype ID for "ガポンバレット"
  const { data: archData, error: archError } = await supabase
    .from('deck_archetypes')
    .select('id, name')
  
  if (archError) {
    console.error("Archetype fetch error:", archError)
    return
  }

  const gapon = archData.find(a => a.name.includes('バレット') || a.name.includes('オーガポン')) // Adjust if exact name is known
  
  // Try exact match or partial match
  let targetArchId = null;
  const exact = archData.find(a => a.name === 'ガポンバレット');
  if(exact) {
      targetArchId = exact.id;
  } else {
      console.log("Available archetypes:", archData.map(a => a.name).join(', '));
      return;
  }

  console.log(`Found Archetype ID for ガポンバレット: ${targetArchId}`);

  // Fetch all analyzed decks for this archetype
  const { data: decks, error: decksError } = await supabase
    .from('analyzed_decks')
    .select('id, deck_code, cards_json')
    .eq('archetype_id', targetArchId)
  
  if (decksError) {
    console.error("Decks fetch error:", decksError)
    return
  }

  console.log(`Found ${decks.length} decks for this archetype.`);

  // Search for the specific cards
  const targetCards = ['カミッチュ', 'カジッチュ', 'バチンキー']
  
  for (const deck of decks) {
      const cards = deck.cards_json;
      if (!cards) continue;
      
      const foundCards = cards.filter(c => targetCards.some(target => c.name.includes(target)));
      
      if (foundCards.length > 0) {
          console.log(`\n=== SUSPECT DECK FOUND ===`);
          console.log(`Deck Code: ${deck.deck_code}`);
          console.log(`Deck ID: ${deck.id}`);
          console.log(`Found Target Cards:`, foundCards.map(c => c.name));
      }
  }
}

check()
