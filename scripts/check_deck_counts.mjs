
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Read .env.local manually
let env = {}
try {
    const envPath = path.join(rootDir, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            const val = parts.slice(1).join('=').trim().replace(/"/g, '') // simple parse
            if (key && val && !key.startsWith('#')) {
                env[key] = val
            }
        }
    })
} catch (e) {
    console.error('Could not read .env.local', e.message)
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Checked .env.local')
    console.log('Keys found:', Object.keys(env))
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCounts() {
    console.log('Checking deck counts...')

    // 1. Reference Decks Count
    const { count: refCount, error: refError } = await supabase
        .from('reference_decks')
        .select('*', { count: 'exact', head: true })

    if (refError) {
        console.error('Error fetching reference_decks:', refError)
    } else {
        console.log(`Reference Decks Total: ${refCount}`)
    }

    // 2. Analyzed Decks Count
    const { count: anaCount, error: anaError } = await supabase
        .from('analyzed_decks')
        .select('*', { count: 'exact', head: true })

    if (anaError) {
        console.error('Error fetching analyzed_decks:', anaError)
    } else {
        console.log(`Analyzed Decks Total: ${anaCount}`)
    }

    // 3. Find Missing Decks (Reference but not Analyzed)
    // Fetch all deck codes
    const { data: refDecks } = await supabase.from('reference_decks').select('deck_code')
    const { data: anaDecks } = await supabase.from('analyzed_decks').select('deck_code')

    if (refDecks && anaDecks) {
        const anaCodes = new Set(anaDecks.map(d => d.deck_code))
        const missingFromAna = refDecks.filter(d => !anaCodes.has(d.deck_code))

        console.log(`\nDecks in Reference but NOT Analyzed: ${missingFromAna.length}`)
        if (missingFromAna.length > 0) {
            console.log('Sample Missing Codes (Ref -> Ana):', missingFromAna.slice(0, 5).map(d => d.deck_code))
        }

        const refCodes = new Set(refDecks.map(d => d.deck_code))
        const missingFromRef = anaDecks.filter(d => !refCodes.has(d.deck_code))
        console.log(`\nDecks in Analyzed but NOT Reference: ${missingFromRef.length}`)
        if (missingFromRef.length > 0) {
            console.log('Sample Missing Codes (Ana -> Ref):', missingFromRef.slice(0, 5).map(d => d.deck_code))
        }
    }
}

checkCounts()
