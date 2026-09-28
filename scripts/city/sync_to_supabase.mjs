#!/usr/bin/env node
/**
 * ローカルの収集データを Supabase に同期。
 *   data/city/city_results_*.json  -> city_events
 *   data/city/deck_cache.json      -> city_decks
 * 実行: node scripts/city/sync_to_supabase.mjs
 * 要: .env.local の NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 */
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = fs.readFileSync('.env.local', 'utf8')
const get = k => { const m = env.match(new RegExp('^' + k + '=(.*)$', 'm')); return m ? m[1].trim().replace(/^"|"$/g, '') : '' }
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'))

const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o }

async function main() {
    // --- events ---
    const files = fs.readdirSync('data/city').filter(f => /^city_results_.*\.json$/.test(f))
    let events = []
    for (const f of files) events = events.concat(JSON.parse(fs.readFileSync('data/city/' + f, 'utf8')))
    // 同一 event_holding_id は最後を採用
    const evMap = new Map()
    for (const e of events) evMap.set(e.event_holding_id, {
        event_holding_id: e.event_holding_id, date: e.date, shop: e.shop,
        prefecture: e.prefecture, league: e.league, entrants_count: e.entrants_count,
        results: e.results,
    })
    const evRows = [...evMap.values()]
    let evOk = 0
    for (const c of chunk(evRows, 200)) {
        const { error } = await sb.from('city_events').upsert(c)
        if (error) { console.error('events upsert error:', error.message); process.exit(1) }
        evOk += c.length
    }
    console.log('city_events upsert:', evOk)

    // --- decks ---
    const cache = JSON.parse(fs.readFileSync('data/city/deck_cache.json', 'utf8'))
    const deckRows = Object.entries(cache)
        .filter(([, v]) => Array.isArray(v))
        .map(([deck_code, cards]) => ({ deck_code, cards }))
    let dkOk = 0
    for (const c of chunk(deckRows, 200)) {
        const { error } = await sb.from('city_decks').upsert(c)
        if (error) { console.error('decks upsert error:', error.message); process.exit(1) }
        dkOk += c.length
        process.stdout.write(`  city_decks ${dkOk}/${deckRows.length}\r`)
    }
    console.log('\ncity_decks upsert:', dkOk)
}
main()
