import { createClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'
import { representativeCard, resolveArchetypeFromRep } from './city'
import type { ArchetypeMap, EventRec, DeckCache, Card } from './city'

// City（オープン）を環境デッキ形式に変換。既存の環境デッキ(Firebase)と合体して各セクションに流す用。
export type EnvDeckLike = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }
export async function buildCityEnvDecks(): Promise<EnvDeckLike[]> {
    const [events, idx, map] = await Promise.all([loadEventsDB(), loadDeckIndex(), loadArchetypeMapDB()])
    const rankLabel = (r: number) => r === 1 ? '優勝' : r === 2 ? '準優勝' : r <= 4 ? 'TOP4' : r <= 8 ? 'TOP8' : 'ベスト16'
    const fmt = (d: string) => /^\d{8}$/.test(d) ? `${+d.slice(4, 6)}/${+d.slice(6, 8)}` : d
    const out: EnvDeckLike[] = []
    const seen = new Set<string>()
    for (const ev of events) {
        if (ev.league !== 'オープン') continue
        for (const r of ev.results) {
            if (!r.deck_id || seen.has(r.deck_id)) continue
            seen.add(r.deck_id)
            const arch = resolveArchetypeFromRep(r.deck_id, idx.reps[r.deck_id], map)
            if (!arch) continue
            out.push({ deckCode: r.deck_id, archetype: arch, eventName: `シティリーグ ${ev.shop || ''}`.trim(), eventDate: fmt(ev.date), rank: rankLabel(r.rank) })
        }
    }
    return out
}

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
    }, ['city-comps-v3', date], { revalidate: 3600, tags: ['city-data'] })()
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

// 全デッキを1回だけ読み、代表カード / 全カード名 / カード別採用数 / 総数 をまとめて返す。
// 個別に何度も全件読むのを避けて負荷を抑える。結果は軽量なのでキャッシュに載る。1時間キャッシュ。
export const loadDeckIndex = unstable_cache(async (): Promise<{
    reps: Record<string, string | null>; cardNames: string[]; cardCounts: Record<string, number>; total: number
}> => {
    const reps: Record<string, string | null> = {}
    const cardCounts: Record<string, number> = {}
    const nameSet = new Set<string>()
    let total = 0
    try {
        const sb = anon()
        let from = 0
        const size = 1000
        for (;;) {
            const { data } = await sb.from('city_decks').select('deck_code, cards').range(from, from + size - 1)
            const rows = (data || []) as { deck_code: string; cards: Card[] }[]
            for (const r of rows) {
                reps[r.deck_code] = representativeCard(r.cards)
                total++
                const uniq = new Set<string>()
                for (const c of (r.cards || [])) if (c?.name) { nameSet.add(c.name); uniq.add(c.name) }
                for (const n of uniq) cardCounts[n] = (cardCounts[n] || 0) + 1
            }
            if (rows.length < size) break
            from += size
        }
    } catch { /* 空を返す */ }
    return { reps, cardNames: [...nameSet].sort((a, b) => a.localeCompare(b, 'ja')), cardCounts, total }
}, ['city-deck-index-v2'], { revalidate: 3600, tags: ['city-data'] })

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
