import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
    console.log('Testing global_card_stats:')
    const r1 = await supabase.from('global_card_stats').select('card_name, event_rank, total_decks').limit(5)
    console.log(r1.data, r1.error)

    console.log('Testing archetype_card_stats:')
    const r2 = await supabase.from('archetype_card_stats').select('card_name, event_rank, archetype_id, total_decks').limit(5)
    console.log(r2.data, r2.error)
}

run()
