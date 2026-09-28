import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { representativeCard } from './city'
import type { ArchetypeMap, EventRec, DeckCache, Card } from './city'

// 読み取り用（公開SELECT・anonキー）
function anon() {
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

const chunk = <T>(a: T[], n: number): T[][] => { const o: T[][] = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o }

// 大会一覧（全件・小さい）。1時間キャッシュ。
export const loadEventsDB = unstable_cache(async (): Promise<EventRec[]> => {
    try {
        const sb = anon()
        const { data } = await sb.from('city_events')
            .select('event_holding_id, date, shop, prefecture, league, entrants_count, results')
            .order('date', { ascending: false })
        return (data || []) as EventRec[]
    } catch { return [] }
}, ['city-events-v2'], { revalidate: 3600, tags: ['city-data'] })

// 指定日付の deck_code 群だけデッキ構成を読む（負荷対策）。日付キーで1時間キャッシュ。
export function loadCompositionsForDate(date: string, codes: string[]): Promise<DeckCache> {
    return unstable_cache(async (): Promise<DeckCache> => {
        try {
            const sb = anon()
            const map: DeckCache = {}
            for (const part of chunk(codes, 150)) {
                const { data } = await sb.from('city_decks').select('deck_code, cards').in('deck_code', part)
                for (const r of (data || []) as { deck_code: string; cards: Card[] }[]) map[r.deck_code] = r.cards
            }
            return map
        } catch { return {} }
    }, ['city-comps-v2', date], { revalidate: 3600, tags: ['city-data'] })()
}

// 全デッキの代表カード名マップ（deck_code -> 代表カード）。月間・全期間の分布集計用。
// 構成データ全件を1回だけ読み、結果は軽量(文字列マップ)なのでキャッシュに載る。1時間キャッシュ。
export const loadRepresentativesMap = unstable_cache(async (): Promise<Record<string, string | null>> => {
    try {
        const sb = anon()
        const map: Record<string, string | null> = {}
        let from = 0
        const size = 1000
        for (;;) {
            const { data } = await sb.from('city_decks').select('deck_code, cards').range(from, from + size - 1)
            const rows = (data || []) as { deck_code: string; cards: Card[] }[]
            for (const r of rows) map[r.deck_code] = representativeCard(r.cards)
            if (rows.length < size) break
            from += size
        }
        return map
    } catch { return {} }
}, ['city-repmap-v1'], { revalidate: 3600, tags: ['city-data'] })

// 収集済みデッキに実在する全カード名（注目カードの選択候補）。1時間キャッシュ。
export const loadAllCardNames = unstable_cache(async (): Promise<string[]> => {
    try {
        const sb = anon()
        const set = new Set<string>()
        let from = 0
        const size = 1000
        for (;;) {
            const { data } = await sb.from('city_decks').select('cards').range(from, from + size - 1)
            const rows = (data || []) as { cards: Card[] }[]
            for (const r of rows) for (const c of (r.cards || [])) if (c?.name) set.add(c.name)
            if (rows.length < size) break
            from += size
        }
        return [...set].sort((a, b) => a.localeCompare(b, 'ja'))
    } catch { return [] }
}, ['city-cardnames-v1'], { revalidate: 3600, tags: ['city-data'] })

// 既存アーキタイプ（公開：deck_archetypes の名前）。1時間キャッシュ。
export const loadExistingArchetypesDB = unstable_cache(async (): Promise<string[]> => {
    try {
        const sb = anon()
        const { data } = await sb.from('deck_archetypes').select('name')
        return [...new Set(((data || []) as { name: string }[]).map(a => (a.name || '').trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'ja'))
    } catch { return [] }
}, ['city-existing-arch-v1'], { revalidate: 3600, tags: ['city-data'] })
// 書き込み用（service-role・RLSバイパス）
function admin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
    return createClient(url, key)
}

// 区分マップを Supabase から読む（本番・ローカル共通）。60秒キャッシュ＝アクセス毎の負荷を排除。
// 管理者の保存時は API 側で revalidateTag('city-map') して即時反映する。失敗時は空。
export const loadArchetypeMapDB = unstable_cache(async (): Promise<ArchetypeMap> => {
    try {
        const sb = anon()
        const [ov, rl] = await Promise.all([
            sb.from('city_deck_archetypes').select('deck_code, archetype'),
            sb.from('city_archetype_rules').select('representative, archetype'),
        ])
        const overrides: Record<string, string> = {}
        for (const r of (ov.data || []) as { deck_code: string; archetype: string }[]) overrides[r.deck_code] = r.archetype
        const rules: Record<string, string> = {}
        for (const r of (rl.data || []) as { representative: string; archetype: string }[]) rules[r.representative] = r.archetype
        return { rules, overrides }
    } catch {
        return { rules: {}, overrides: {} }
    }
}, ['city-arch-map-v1'], { revalidate: 60, tags: ['city-map'] })

// 注目カード（採用率パネル用）。60秒キャッシュ。空なら [] を返す。
export const loadWatchlistDB = unstable_cache(async (): Promise<string[]> => {
    try {
        const sb = anon()
        const { data } = await sb.from('city_watchlist').select('card_name').order('sort_order', { ascending: true })
        return ((data || []) as { card_name: string }[]).map(r => r.card_name).filter(Boolean)
    } catch { return [] }
}, ['city-watchlist-v1'], { revalidate: 60, tags: ['city-watchlist'] })

// 注目カードを全置き換え（順序＝配列順）
export async function saveWatchlistDB(cards: string[]): Promise<void> {
    const sb = admin()
    const clean = [...new Set(cards.map(c => (c || '').trim()).filter(Boolean))]
    await sb.from('city_watchlist').delete().neq('card_name', '')
    if (clean.length) {
        await sb.from('city_watchlist').insert(clean.map((card_name, i) => ({ card_name, sort_order: i })))
    }
}

// デッキ1件の区分を upsert（archetype 空なら削除）
export async function saveOverrideDB(deckCode: string, archetype: string): Promise<void> {
    const sb = admin()
    if (archetype) {
        await sb.from('city_deck_archetypes').upsert({ deck_code: deckCode, archetype, updated_at: new Date().toISOString() })
    } else {
        await sb.from('city_deck_archetypes').delete().eq('deck_code', deckCode)
    }
}

// 代表カードのエイリアスを upsert（archetype 空なら削除）
export async function saveRuleDB(representative: string, archetype: string): Promise<void> {
    const sb = admin()
    if (archetype) {
        await sb.from('city_archetype_rules').upsert({ representative, archetype, updated_at: new Date().toISOString() })
    } else {
        await sb.from('city_archetype_rules').delete().eq('representative', representative)
    }
}
