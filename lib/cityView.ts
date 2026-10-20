// /city の表示データを組み立てる共有ビルダー（サーバー専用）。
// ページ本体（既定ビューを静的SSR）と /api/city/view（絞り込み時のみ・CDNキャッシュ）の双方から使う。
// 集計は lib/city（fs依存＝サーバー専用）で行い、クライアントには結果(JSON)だけを渡す。
import {
    loadWatchlist, autoArchetype, monthOf,
    buildAdoption, buildDistributionFromReps, buildDistributionByPrefecture, REGIONS,
    type ArchetypeMap, type DeckCache, type EventRec, type PrefDistribution,
} from '@/lib/city'
import {
    loadArchetypeMapDB, loadEventsDB, loadCompositionsForDate,
    loadExistingArchetypesDB, loadDeckIndex, loadWatchlistDB,
} from '@/lib/cityStore'

export type CityParams = { month?: string; date?: string; dist?: string; sort?: string }

export type DistRow = { name: string; count: number; wins: number; rate: number }
export type CityView = {
    isAll: boolean
    selMonth: string
    selDate: string
    dates: string[]
    dayEvents: EventRec[]
    cache: DeckCache
    autoMap: Record<string, string | null>
    dist: { resolved: number; totalWins: number; list: DistRow[] }
    distList: DistRow[]
    distScope: 'day' | 'month' | 'all'
    distSort: 'use' | 'win'
    maxWins: number
    adoption: { total: number; list: { name: string; decks: number; rate: number }[] }
    totalDecks: number
    introMeta: string
}

// 絞り込みに依存しない静的データ（ページ本体で一度だけ使う）
export type CityStatic = {
    months: string[]
    cardNames: string[]
    cardCounts: Record<string, number>
    total: number
    existing: string[]
    watchlist: string[]
    autoOptions: string[]
    overrides: Record<string, string>
}

export async function loadCityStatic(): Promise<CityStatic> {
    const events = (await loadEventsDB()).filter(e => e.league === 'オープン')
    const deckIndex = await loadDeckIndex()
    const archMap = await loadArchetypeMapDB()
    const existing = await loadExistingArchetypesDB()
    const wlDb = await loadWatchlistDB()
    const watchlist = wlDb.length ? wlDb : loadWatchlist()
    const months = [...new Set(events.map(e => monthOf(e.date)))].sort((a, b) => b.localeCompare(a))
    // 区分ドロップダウン候補：日付非依存（ルール値＋上書き値＋既存名）で固定する
    const existingSet = new Set(existing)
    const autoOptions = [...new Set([
        ...Object.values(archMap.rules), ...Object.values(archMap.overrides),
    ].filter(Boolean))].filter(n => !existingSet.has(n)).sort((a, b) => a.localeCompare(b, 'ja'))
    return {
        months, cardNames: deckIndex.cardNames, cardCounts: deckIndex.cardCounts, total: deckIndex.total,
        existing, watchlist, autoOptions, overrides: archMap.overrides,
    }
}

export async function buildCityView(sp: CityParams): Promise<CityView> {
    const events = (await loadEventsDB()).filter(e => e.league === 'オープン')
    const wlDb = await loadWatchlistDB()
    const watchlist = wlDb.length ? wlDb : loadWatchlist()
    const deckIndex = await loadDeckIndex()
    const archMap: ArchetypeMap = await loadArchetypeMapDB()
    const repMap = deckIndex.reps

    const months = [...new Set(events.map(e => monthOf(e.date)))].sort((a, b) => b.localeCompare(a))
    const isAll = sp.month === 'all'
    const selMonth = (sp.month && months.includes(sp.month)) ? sp.month : (months[0] || '')
    const monthEvents = events.filter(e => monthOf(e.date) === selMonth)
    const dates = [...new Set(monthEvents.map(e => e.date))].sort((a, b) => b.localeCompare(a))
    const selDate = (sp.date && dates.includes(sp.date)) ? sp.date : (dates[0] || '')
    const dayEvents = monthEvents.filter(e => e.date === selDate)
        .sort((a, b) => a.shop.localeCompare(b.shop, 'ja'))

    const dayCodes = [...new Set(dayEvents.flatMap(e => e.results.map(r => r.deck_id)))]
    const cache = await loadCompositionsForDate(selDate, dayCodes)

    const distScope: 'day' | 'month' | 'all' = isAll ? 'all' : (sp.dist === 'month' ? 'month' : 'day')
    const distEvents = distScope === 'all' ? events : distScope === 'month' ? monthEvents : dayEvents
    const dist = buildDistributionFromReps(distEvents, repMap, archMap)
    const distSort: 'use' | 'win' = sp.sort === 'win' ? 'win' : 'use'
    const distList = distSort === 'win'
        ? [...dist.list].sort((a, b) => b.wins - a.wins || b.count - a.count)
        : dist.list
    const maxWins = Math.max(1, ...dist.list.map(d => d.wins))

    const adoption = buildAdoption(dayEvents, cache, watchlist)
    const totalDecks = dayEvents.reduce((s, e) => s + e.results.length, 0)

    // DeckArchetypeSelect 用に、表示デッキの自動区分を事前計算（クライアントに map を渡さない）
    const autoMap: Record<string, string | null> = {}
    for (const ev of dayEvents) for (const r of ev.results) {
        if (!(r.deck_id in autoMap)) autoMap[r.deck_id] = autoArchetype(cache[r.deck_id], archMap)
    }
    // listArchetypeOptions は現状ページ本体では autoOptions に合算していたが、
    // 区分候補は日付非依存（loadCityStatic 側）に固定したためここでは不要。

    const topArch = dist.list.slice(0, 3)
    const introMeta = topArch.length
        ? `現在のポケカ環境で使用率が高いのは ${topArch.map(d => `${d.name}（${d.rate}%）`).join('・')} など。`
        : ''

    return {
        isAll, selMonth, selDate, dates, dayEvents, cache, autoMap,
        dist, distList, distScope, distSort, maxWins, adoption, totalDecks, introMeta,
    }
}

// ===== 都道府県別デッキ分布（/city/prefectures 用の共有ビルダー） =====
export type PrefParams = { period?: string; region?: string }
export type PrefView = {
    months: string[]
    regions: { key: string; label: string }[]
    period: string          // 'all' or YYYYMM
    regionKey: string       // 'all' or region key
    prefDist: PrefDistribution[]
    totalDecks: number
}

export async function buildPrefectureView(sp: PrefParams): Promise<PrefView> {
    const events = (await loadEventsDB()).filter(e => e.league === 'オープン')
    const deckIndex = await loadDeckIndex()
    const archMap = await loadArchetypeMapDB()

    const months = [...new Set(events.map(e => monthOf(e.date)))].sort((a, b) => b.localeCompare(a))
    const period = (sp.period && months.includes(sp.period)) ? sp.period : 'all'
    const periodEvents = period === 'all' ? events : events.filter(e => monthOf(e.date) === period)

    const regionKey = REGIONS.some(r => r.key === sp.region) ? sp.region! : 'all'
    const region = REGIONS.find(r => r.key === regionKey)

    const allPref = buildDistributionByPrefecture(periodEvents, deckIndex.reps, archMap)
    const prefDist = region ? allPref.filter(p => region.prefs.includes(p.prefecture)) : allPref
    const totalDecks = prefDist.reduce((s, p) => s + p.total, 0)

    return {
        months,
        regions: REGIONS.map(r => ({ key: r.key, label: r.label })),
        period, regionKey, prefDist, totalDecks,
    }
}
