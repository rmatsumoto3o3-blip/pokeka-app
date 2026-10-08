import fs from 'fs'
import path from 'path'

export type ResultRow = { rank: number; deck_id: string }
export type EventRec = {
    event_holding_id: number
    date: string
    shop: string
    prefecture: string
    league: string
    entrants_count: number
    results: ResultRow[]
}
export type Card = { name: string; quantity: number; supertype: string; image: string | null }
export type DeckCache = Record<string, Card[] | null>

function readJSON<T>(rel: string, fallback: T): T {
    try {
        return JSON.parse(fs.readFileSync(path.join(process.cwd(), rel), 'utf8')) as T
    } catch {
        return fallback
    }
}

export function loadEvents(): EventRec[] {
    return readJSON<EventRec[]>('data/city/city_results_20260926-27.json', [])
        .filter(e => e.league === 'オープン')
}
export function loadCache(): DeckCache {
    return readJSON<DeckCache>('data/city/deck_cache.json', {})
}
export function loadWatchlist(): string[] {
    return readJSON<{ cards: string[] }>('data/city/watchlist.json', { cards: [] }).cards
}

// アーキタイプ区分マップ（管理者だけが編集）。
//  rules:     代表カード名 -> 正式アーキタイプ名（束ね・改名）
//  overrides: deck_id     -> 正式アーキタイプ名（個別上書き）
export type ArchetypeMap = { rules: Record<string, string>; overrides: Record<string, string> }
export function loadArchetypeMap(): ArchetypeMap {
    const m = readJSON<Partial<ArchetypeMap>>('data/city/archetype_map.json', {})
    return { rules: m.rules || {}, overrides: m.overrides || {} }
}

export const monthOf = (d: string) => d.slice(0, 6)          // "20260927" -> "202609"
export function fmtMonth(m: string) {
    return `${+m.slice(0, 4)}年${+m.slice(4, 6)}月`
}
export function fmtDate(d: string) {
    if (!/^\d{8}$/.test(d)) return d
    const y = +d.slice(0, 4), mo = +d.slice(4, 6), day = +d.slice(6, 8)
    const w = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, mo - 1, day).getDay()]
    return `${mo}/${day}(${w})`
}
export const deckUrl = (code: string) =>
    `https://www.pokemon-card.com/deck/confirm.html/deckID/${code}`

// デッキ構成 → 代表カード（最多枚数のex、無ければ最多ポケモン）。区分の基準点。
export function representativeCard(cards: Card[] | null | undefined): string | null {
    if (!cards) return null
    const pokes = cards.filter(c => c.supertype === 'Pokémon')
    if (pokes.length === 0) return 'その他'
    const exs = pokes.filter(c => /ex$/i.test(c.name) || c.name.includes('ex'))
    const pool = exs.length ? exs : pokes
    pool.sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, 'ja'))
    return pool[0].name
}

// 最終アーキタイプ = 個別上書き ▷ 代表カードのルール ▷ 代表カードそのもの
export function resolveArchetype(deckId: string, cards: Card[] | null | undefined, map: ArchetypeMap): string | null {
    if (map.overrides[deckId]) return map.overrides[deckId]
    const rep = representativeCard(cards)
    if (!rep) return null
    return map.rules[rep] || rep
}

// 互換用（自動分類のみ）
export function classifyArchetype(cards: Card[] | null | undefined): string | null {
    return representativeCard(cards)
}

// 代表カード名から最終アーキタイプを解決（構成データ不要・集計用）
export function resolveArchetypeFromRep(deckId: string, rep: string | null | undefined, map: ArchetypeMap): string | null {
    if (map.overrides[deckId]) return map.overrides[deckId]
    if (!rep) return null
    return map.rules[rep] || rep
}

// 代表カードマップから分布を集計（デッキ単位・重複コードは1回）。日/月/全期間の切替に使う。
export function buildDistributionFromReps(
    events: EventRec[], repMap: Record<string, string | null>, map: ArchetypeMap,
) {
    const seen = new Set<string>()
    const tally: Record<string, number> = {}
    const winTally: Record<string, number> = {} // 優勝数（rank===1）。大会ごとの優勝を数えるため deck_id 重複排除しない。
    let resolved = 0
    for (const ev of events) for (const r of ev.results) {
        const arch = resolveArchetypeFromRep(r.deck_id, repMap[r.deck_id], map)
        if (!arch) continue
        if (r.rank === 1) winTally[arch] = (winTally[arch] || 0) + 1
        if (seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        resolved++
        tally[arch] = (tally[arch] || 0) + 1
    }
    const totalWins = Object.values(winTally).reduce((a, b) => a + b, 0)
    const list = Object.entries(tally)
        .map(([name, count]) => ({ name, count, wins: winTally[name] || 0, rate: resolved ? +(count / resolved * 100).toFixed(1) : 0 }))
        .sort((a, b) => b.count - a.count)
    return { resolved, totalWins, list }
}

// 上と同じ集計を「開催都道府県ごと」に束ねる。分類ロジック(rep+別名map)は共通で、
// 集計タイミングの区分をそのまま都道府県別に反映する。1年分溜まっても同じ経路で動く。
export type PrefDistribution = {
    prefecture: string
    total: number
    list: { name: string; count: number; rate: number }[]
}
export function buildDistributionByPrefecture(
    events: EventRec[], repMap: Record<string, string | null>, map: ArchetypeMap,
): PrefDistribution[] {
    const seen = new Set<string>() // デッキコードはユニーク→全体で1回だけ数える
    const byPref: Record<string, { tally: Record<string, number>; total: number }> = {}
    for (const ev of events) {
        const pref = ev.prefecture || '不明'
        for (const r of ev.results) {
            if (seen.has(r.deck_id)) continue
            seen.add(r.deck_id)
            const arch = resolveArchetypeFromRep(r.deck_id, repMap[r.deck_id], map)
            if (!arch) continue
            const bucket = byPref[pref] || (byPref[pref] = { tally: {}, total: 0 })
            bucket.tally[arch] = (bucket.tally[arch] || 0) + 1
            bucket.total++
        }
    }
    return Object.entries(byPref)
        .map(([prefecture, { tally, total }]) => ({
            prefecture,
            total,
            list: Object.entries(tally)
                .map(([name, count]) => ({ name, count, rate: +(count / total * 100).toFixed(1) }))
                .sort((a, b) => b.count - a.count),
        }))
        .sort((a, b) => b.total - a.total)
}

// 八地方区分（都道府県→地方）。都道府県別ページの「地方」フィルタ用。
export const REGIONS: { key: string; label: string; prefs: string[] }[] = [
    { key: 'hokkaido', label: '北海道', prefs: ['北海道'] },
    { key: 'tohoku', label: '東北', prefs: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
    { key: 'kanto', label: '関東', prefs: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
    { key: 'chubu', label: '中部', prefs: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'] },
    { key: 'kinki', label: '近畿', prefs: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
    { key: 'chugoku', label: '中国', prefs: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
    { key: 'shikoku', label: '四国', prefs: ['徳島県', '香川県', '愛媛県', '高知県'] },
    { key: 'kyushu', label: '九州沖縄', prefs: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
]
export function regionOfPrefecture(pref: string): string | null {
    for (const r of REGIONS) if (r.prefs.includes(pref)) return r.key
    return null
}

// 指定イベント群の解決済みデッキで分布を集計（デッキ単位・重複デッキコードは1回）
export function buildDistribution(events: EventRec[], cache: DeckCache, map?: ArchetypeMap) {
    const m = map || { rules: {}, overrides: {} }
    const seen = new Set<string>()
    const tally: Record<string, number> = {}
    let resolved = 0
    for (const ev of events) for (const r of ev.results) {
        if (seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        const arch = resolveArchetype(r.deck_id, cache[r.deck_id], m)
        if (!arch) continue
        resolved++
        tally[arch] = (tally[arch] || 0) + 1
    }
    const list = Object.entries(tally)
        .map(([name, count]) => ({ name, count, rate: resolved ? +(count / resolved * 100).toFixed(1) : 0 }))
        .sort((a, b) => b.count - a.count)
    return { resolved, list }
}

// 個別上書きを無視した自動ラベル（ルール適用済み代表カード）
export function autoArchetype(cards: Card[] | null | undefined, map: ArchetypeMap): string | null {
    const rep = representativeCard(cards)
    if (!rep) return null
    return map.rules[rep] || rep
}

// 区分ドロップダウンの選択肢＝すでに存在するアーキタイプ（代表名＋ルール値＋上書き値）
export function listArchetypeOptions(events: EventRec[], cache: DeckCache, map: ArchetypeMap): string[] {
    const set = new Set<string>()
    const seen = new Set<string>()
    for (const ev of events) for (const r of ev.results) {
        if (seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        const rep = representativeCard(cache[r.deck_id])
        if (rep) set.add(map.rules[rep] || rep)
    }
    for (const v of Object.values(map.rules)) if (v) set.add(v)
    for (const v of Object.values(map.overrides)) if (v) set.add(v)
    return [...set].sort((a, b) => a.localeCompare(b, 'ja'))
}

// 代表カード一覧（区分の編集対象）。解決済みデッキを代表カードで束ねて件数集計。
export function listRepresentatives(events: EventRec[], cache: DeckCache, map: ArchetypeMap) {
    const seen = new Set<string>()
    const agg: Record<string, { count: number; sample: string[] }> = {}
    for (const ev of events) for (const r of ev.results) {
        if (seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        const cards = cache[r.deck_id]
        const rep = representativeCard(cards)
        if (!rep) continue
        if (!agg[rep]) agg[rep] = { count: 0, sample: [] }
        agg[rep].count++
        if (agg[rep].sample.length < 3) agg[rep].sample.push(r.deck_id)
    }
    return Object.entries(agg)
        .map(([rep, v]) => ({ rep, count: v.count, sample: v.sample, archetype: map.rules[rep] || '' }))
        .sort((a, b) => b.count - a.count)
}

// 注目カードの採用率（指定イベント群の解決済みデッキ母数）
export function buildAdoption(events: EventRec[], cache: DeckCache, watchlist: string[]) {
    const seen = new Set<string>()
    const has: Record<string, number> = {}
    let total = 0
    for (const ev of events) for (const r of ev.results) {
        if (seen.has(r.deck_id)) continue
        seen.add(r.deck_id)
        const cards = cache[r.deck_id]
        if (!cards) continue
        total++
        const names = new Set(cards.map(c => c.name))
        for (const w of watchlist) if (names.has(w)) has[w] = (has[w] || 0) + 1
    }
    const list = watchlist.map(name => ({
        name, decks: has[name] || 0, rate: total ? +((has[name] || 0) / total * 100).toFixed(1) : 0,
    })).sort((a, b) => b.rate - a.rate)
    return { total, list }
}

// アーキタイプ別カード採用率。deckCards: deck_code -> Card[]。monthFilter 指定で月(YYYYMM)に絞る。
// 返り値：[{archetype, total(デッキ数), cards:[{name,supertype,image,decks,rate(%),avg(平均採用枚数)}]}]（デッキ数降順）
export function buildArchetypeCardAdoption(
    events: EventRec[],
    deckCards: Record<string, Card[]>,
    map: ArchetypeMap,
    monthFilter?: string,
) {
    const archDecks = new Map<string, string[]>()
    const seen = new Set<string>()
    for (const ev of events) {
        if (monthFilter && monthOf(ev.date) !== monthFilter) continue
        for (const r of ev.results) {
            if (!r.deck_id || seen.has(r.deck_id)) continue
            seen.add(r.deck_id)
            const cards = deckCards[r.deck_id]
            if (!cards) continue
            const arch = resolveArchetypeFromRep(r.deck_id, representativeCard(cards), map) || 'その他'
            if (!archDecks.has(arch)) archDecks.set(arch, [])
            archDecks.get(arch)!.push(r.deck_id)
        }
    }
    const out: {
        archetype: string; total: number
        cards: { name: string; supertype: string; image: string | null; decks: number; rate: number; avg: number }[]
    }[] = []
    for (const [arch, codes] of archDecks) {
        const total = codes.length
        const agg = new Map<string, { name: string; supertype: string; image: string | null; decks: number; qty: number }>()
        for (const code of codes) {
            const cards = deckCards[code] || []
            const uniqQty = new Map<string, number>()
            const sup = new Map<string, string>()
            const img = new Map<string, string | null>()
            for (const c of cards) {
                if (!c?.name) continue
                uniqQty.set(c.name, (uniqQty.get(c.name) || 0) + (c.quantity || 0))
                sup.set(c.name, c.supertype)
                img.set(c.name, c.image ?? null)
            }
            for (const [name, qty] of uniqQty) {
                let e = agg.get(name)
                if (!e) { e = { name, supertype: sup.get(name) || '', image: img.get(name) ?? null, decks: 0, qty: 0 }; agg.set(name, e) }
                e.decks++; e.qty += qty
            }
        }
        const cards = [...agg.values()]
            .map(c => ({ name: c.name, supertype: c.supertype, image: c.image, decks: c.decks, rate: +(c.decks / total * 100).toFixed(1), avg: +(c.qty / c.decks).toFixed(1) }))
            .filter(c => c.rate > 0.9) // 採用率0.9%以下(誤差・ノイズ)は除外
            .sort((a, b) => b.rate - a.rate || b.avg - a.avg)
        out.push({ archetype: arch, total, cards })
    }
    out.sort((a, b) => b.total - a.total)
    return out
}
export type ArchetypeAdoption = ReturnType<typeof buildArchetypeCardAdoption>
