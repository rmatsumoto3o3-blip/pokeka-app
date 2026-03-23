
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(url, key)

function detectRankFromName(name) {
    if (!name) return null
    if (name.includes('準優勝')) return '準優勝'
    if (name.includes('優勝')) return '優勝'
    if (name.match(/ベスト4|TOP4|Top 4/i)) return 'TOP4'
    if (name.match(/ベスト8|TOP8|Top 8/i)) return 'TOP8'
    return null
}

async function runCorrection() {
    console.log('Starting data correction...')
    let updatedCount = 0

    // 1. Correct reference_decks
    const { data: refDecks, error: refError } = await supabase
        .from('reference_decks')
        .select('id, deck_name, event_rank')
    
    if (refError) throw refError

    for (const deck of refDecks) {
        const correctRank = detectRankFromName(deck.deck_name || '')
        if (correctRank && correctRank !== deck.event_rank) {
            console.log(`Updating reference_deck ${deck.id}: ${deck.event_rank} -> ${correctRank} (${deck.deck_name})`)
            const { error: updError } = await supabase
                .from('reference_decks')
                .update({ event_rank: correctRank })
                .eq('id', deck.id)
            if (!updError) updatedCount++
        }
    }

    // 2. Correct analyzed_decks
    const { data: analyzedDecks, error: anaError } = await supabase
        .from('analyzed_decks')
        .select('id, deck_name, event_rank')
    
    if (anaError) throw anaError

    for (const deck of analyzedDecks) {
        const correctRank = detectRankFromName(deck.deck_name || '')
        if (correctRank && correctRank !== deck.event_rank) {
            console.log(`Updating analyzed_deck ${deck.id}: ${deck.event_rank} -> ${correctRank} (${deck.deck_name})`)
            const { error: updError } = await supabase
                .from('analyzed_decks')
                .update({ event_rank: correctRank })
                .eq('id', deck.id)
            if (!updError) updatedCount++
        }
    }

    console.log(`Correction complete! Updated ${updatedCount} records.`)
}

runCorrection().catch(console.error)
