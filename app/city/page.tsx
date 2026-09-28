import type { Metadata } from 'next'
import {
    loadWatchlist, autoArchetype, listArchetypeOptions,
    monthOf, fmtMonth, fmtDate, deckUrl,
    buildAdoption, buildDistributionFromReps, type ArchetypeMap, type DeckCache, type EventRec, type ResultRow,
} from '@/lib/city'
import { loadArchetypeMapDB, loadEventsDB, loadCompositionsForDate, loadExistingArchetypesDB, loadDeckIndex, loadWatchlistDB } from '@/lib/cityStore'
import DeckGrid from '@/components/city/DeckGrid'
import CityAdminProvider from '@/components/city/CityAdminContext'
import DeckArchetypeSelect from '@/components/city/DeckArchetypeSelect'
import WatchlistAdmin from '@/components/city/WatchlistAdmin'
import CardAdoptionSearch from '@/components/city/CardAdoptionSearch'
import PublicHeader from '@/components/PublicHeader'

// 公開ページは静的ISR（cookie非依存）。データはSupabaseからキャッシュ読み。
export const revalidate = 3600
export const metadata: Metadata = {
    title: 'シティリーグ結果 | PokéLix',
    description: 'シティリーグの入賞デッキを月・日付別に。1〜4位はデッキ一覧、5位以下はアコーディオン。注目カード採用率とデッキ分布つき。',
    robots: { index: false, follow: false },
}

function rankBadge(rank: number) {
    const base = 'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black shrink-0'
    if (rank === 1) return `${base} bg-yellow-400 text-yellow-950`
    if (rank === 2) return `${base} bg-gray-300 text-gray-800`
    if (rank === 3) return `${base} bg-amber-600 text-amber-50`
    if (rank === 4) return `${base} bg-orange-200 text-orange-900`
    return `${base} bg-gray-100 text-gray-600 border border-gray-200`
}

function ResultBlock({ r, cache, map }: { r: ResultRow; cache: DeckCache; map: ArchetypeMap }) {
    return (
        <div className="py-2">
            <div className="flex items-center gap-2 mb-1.5">
                <span className={rankBadge(r.rank)}>{r.rank}</span>
                <span className="font-mono text-[11px] text-gray-400 truncate flex-1">{r.deck_id}</span>
                <a href={deckUrl(r.deck_id)} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:underline shrink-0">公式 ↗</a>
            </div>
            <DeckGrid cards={cache[r.deck_id]} deckId={r.deck_id} />
            <DeckArchetypeSelect deckId={r.deck_id} auto={autoArchetype(cache[r.deck_id], map)} />
        </div>
    )
}

function EventCard({ ev, cache, map }: { ev: EventRec; cache: DeckCache; map: ArchetypeMap }) {
    const top = ev.results.filter(r => r.rank <= 4)
    const rest = ev.results.filter(r => r.rank > 4)
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="font-bold text-gray-900 leading-tight">{ev.shop}</div>
                <div className="text-xs text-gray-500 mt-0.5">{ev.prefecture}・{ev.league}・{ev.entrants_count}人</div>
            </div>
            <div className="px-4 divide-y divide-gray-50">
                {top.map((r, i) => <ResultBlock key={i} r={r} cache={cache} map={map} />)}
            </div>
            {rest.length > 0 && (
                <details className="group border-t border-gray-100">
                    <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                        <span>5位以下を表示（{rest.length}）</span>
                        <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="px-4 pb-2 divide-y divide-gray-50">
                        {rest.map((r, i) => <ResultBlock key={i} r={r} cache={cache} map={map} />)}
                    </div>
                </details>
            )}
        </div>
    )
}

export default async function CityPage({ searchParams }: { searchParams: Promise<{ month?: string; date?: string; dist?: string }> }) {
    const sp = await searchParams
    const events = (await loadEventsDB()).filter(e => e.league === 'オープン')
    const wlDb = await loadWatchlistDB()
    const watchlist = wlDb.length ? wlDb : loadWatchlist() // DB優先・未設定時はファイル
    const deckIndex = await loadDeckIndex() // 代表カード・全カード名・カード別採用数・総数（全件1回ロード）
    const cardNames = deckIndex.cardNames

    const months = [...new Set(events.map(e => monthOf(e.date)))].sort((a, b) => b.localeCompare(a))
    const selMonth = (sp.month && months.includes(sp.month)) ? sp.month : months[0]
    const monthEvents = events.filter(e => monthOf(e.date) === selMonth)
    const dates = [...new Set(monthEvents.map(e => e.date))].sort((a, b) => b.localeCompare(a))
    const selDate = (sp.date && dates.includes(sp.date)) ? sp.date : (dates[0] || '')
    const dayEvents = monthEvents.filter(e => e.date === selDate)
        .sort((a, b) => a.shop.localeCompare(b.shop, 'ja'))

    // 表示中の日付のデッキ構成だけを読む（負荷対策・日付キーでキャッシュ）
    const dayCodes = [...new Set(dayEvents.flatMap(e => e.results.map(r => r.deck_id)))]
    const cache = await loadCompositionsForDate(selDate, dayCodes)

    const archMap = await loadArchetypeMapDB()
    const existing = await loadExistingArchetypesDB()

    // 分布は代表カードマップから集計（日/今月/全期間を切替）。全期間・今月も軽量に出せる。
    const repMap = deckIndex.reps
    const distScope = (sp.dist === 'month' || sp.dist === 'all') ? sp.dist : 'day'
    const distEvents = distScope === 'all' ? events : distScope === 'month' ? monthEvents : dayEvents
    const dist = buildDistributionFromReps(distEvents, repMap, archMap)

    // 区分の選択肢：既存アーキタイプ（Supabase）と、表示日付の自動検出名を分けて渡す
    const existingSet = new Set(existing)
    const autoOptions = [...new Set([
        ...listArchetypeOptions(dayEvents, cache, archMap),
        ...Object.values(archMap.rules), ...Object.values(archMap.overrides),
    ].filter(Boolean))].filter(n => !existingSet.has(n)).sort((a, b) => a.localeCompare(b, 'ja'))
    const adoption = buildAdoption(dayEvents, cache, watchlist)
    const totalDecks = dayEvents.reduce((s, e) => s + e.results.length, 0)

    const tabCls = (active: boolean) =>
        `px-3 py-1.5 rounded-lg text-sm font-bold border ${active
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <PublicHeader />
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-black text-gray-900">シティリーグ結果</h1>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">入賞デッキを月・日付別に。1〜4位はデッキ一覧を表示、5位以下はアコーディオンで開けます。</p>
                </div>

                {/* Month select */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-bold text-gray-500">月</span>
                    {months.map(m => (
                        <a key={m} href={`/city?month=${m}`} className={tabCls(m === selMonth)}>{fmtMonth(m)}</a>
                    ))}
                </div>
                {/* Date tabs */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                    <span className="text-xs font-bold text-gray-500">日付</span>
                    {dates.map(d => (
                        <a key={d} href={`/city?month=${selMonth}&date=${d}`} className={tabCls(d === selDate)}>{fmtDate(d)}</a>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">大会 {dayEvents.length}／入賞 {totalDecks}</span>
                </div>

                {/* 管理者ログイン時のみ、結果ページ内で各デッキを区分（公開側には一切出さない） */}
                <CityAdminProvider existing={existing} auto={autoOptions} initialOverrides={archMap.overrides}>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {/* Distribution */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2 gap-2">
                            <h2 className="text-base font-black text-gray-900">デッキ分布</h2>
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-2 py-0.5 shrink-0">{dist.resolved}デッキ</span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                            {([['day', 'この日付'], ['month', '今月'], ['all', '全期間']] as const).map(([k, label]) => (
                                <a key={k} href={`/city?month=${selMonth}&date=${selDate}&dist=${k}`}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${distScope === k
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{label}</a>
                            ))}
                        </div>
                        {dist.list.length ? (
                            <div className="space-y-1">
                                {dist.list.slice(0, 12).map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                                        <span className="flex-1 text-sm text-gray-800 truncate">{d.name}</span>
                                        <div className="w-20 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                                            <div className="h-full bg-indigo-500" style={{ width: `${d.rate}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-indigo-700 w-14 text-right shrink-0">{d.rate}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">データが集まると分布が表示されます。</p>}
                    </section>

                    {/* Adoption watchlist */}
                    <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-base font-black text-gray-900">注目カード採用率</h2>
                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-2 py-0.5">{adoption.total}デッキ</span>
                        </div>
                        {adoption.total ? (
                            <div className="space-y-1">
                                {adoption.list.map(c => (
                                    <div key={c.name} className="flex items-center gap-2">
                                        <span className="flex-1 text-sm text-gray-800 truncate">{c.name}</span>
                                        <div className="w-20 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                                            <div className="h-full bg-emerald-500" style={{ width: `${c.rate}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-emerald-700 w-14 text-right shrink-0">{c.rate}%</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-gray-500">データが集まると採用率が表示されます。</p>}
                        <datalist id="city-card-names">{cardNames.map(n => <option key={n} value={n} />)}</datalist>
                        <CardAdoptionSearch counts={deckIndex.cardCounts} total={deckIndex.total} cardNames={cardNames} />
                        <WatchlistAdmin initial={watchlist} cardNames={cardNames} />
                    </section>
                </div>

                {/* Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dayEvents.map(ev => <EventCard key={ev.event_holding_id} ev={ev} cache={cache} map={archMap} />)}
                </div>
                {dayEvents.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">この日付の大会はありません。</div>
                )}

                </CityAdminProvider>
            </div>
        </div>
    )
}
