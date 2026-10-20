'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import DeckGrid from '@/components/city/DeckGrid'
import CopyDeckCode from '@/components/CopyDeckCode'
import DeckArchetypeSelect from '@/components/city/DeckArchetypeSelect'
import WatchlistAdmin from '@/components/city/WatchlistAdmin'
import CardAdoptionSearch from '@/components/city/CardAdoptionSearch'
import type { CityView, CityStatic, CityParams } from '@/lib/cityView'
import type { DeckCache, EventRec, ResultRow } from '@/lib/city'

// lib/city は fs 依存（サーバー専用）のため、小さなヘルパーはここにインライン化する
const deckUrl = (code: string) => `https://www.pokemon-card.com/deck/confirm.html/deckID/${code}`
const fmtMonth = (m: string) => `${+m.slice(0, 4)}年${+m.slice(4, 6)}月`
function fmtDate(d: string) {
    if (!/^\d{8}$/.test(d)) return d
    const y = +d.slice(0, 4), mo = +d.slice(4, 6), day = +d.slice(6, 8)
    const w = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, mo - 1, day).getDay()]
    return `${mo}/${day}(${w})`
}

function rankBadge(rank: number) {
    const base = 'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-black shrink-0'
    if (rank === 1) return `${base} bg-yellow-400 text-yellow-950`
    if (rank === 2) return `${base} bg-gray-300 text-gray-800`
    if (rank === 3) return `${base} bg-amber-600 text-amber-50`
    if (rank === 4) return `${base} bg-orange-200 text-orange-900`
    return `${base} bg-gray-100 text-gray-600 border border-gray-200`
}

function ResultBlock({ r, cache, auto }: { r: ResultRow; cache: DeckCache; auto: string | null }) {
    return (
        <div className="py-2">
            <div className="flex items-center gap-2 mb-1.5">
                <span className={rankBadge(r.rank)}>{r.rank}</span>
                <CopyDeckCode code={r.deck_id} className="text-[11px] text-gray-400 flex-1 text-left" />
                <a href={deckUrl(r.deck_id)} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:underline shrink-0">公式 ↗</a>
            </div>
            <DeckGrid cards={cache[r.deck_id]} deckId={r.deck_id} />
            <DeckArchetypeSelect deckId={r.deck_id} auto={auto} />
        </div>
    )
}

function EventCard({ ev, cache, autoMap }: { ev: EventRec; cache: DeckCache; autoMap: Record<string, string | null> }) {
    const top = ev.results.filter(r => r.rank <= 4)
    const rest = ev.results.filter(r => r.rank > 4)
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="font-bold text-gray-900 leading-tight">{ev.shop}</div>
                <div className="text-xs text-gray-500 mt-0.5">{ev.prefecture}・{ev.league}・{ev.entrants_count}人</div>
            </div>
            <div className="px-4 divide-y divide-gray-50">
                {top.map((r, i) => <ResultBlock key={i} r={r} cache={cache} auto={autoMap[r.deck_id] ?? null} />)}
            </div>
            {rest.length > 0 && (
                <details className="group border-t border-gray-100">
                    <summary className="cursor-pointer list-none px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                        <span>5位以下を表示（{rest.length}）</span>
                        <span className="text-gray-400 group-open:rotate-180 transition">▼</span>
                    </summary>
                    <div className="px-4 pb-2 divide-y divide-gray-50">
                        {rest.map((r, i) => <ResultBlock key={i} r={r} cache={cache} auto={autoMap[r.deck_id] ?? null} />)}
                    </div>
                </details>
            )}
        </div>
    )
}

const tabCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-bold border ${active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`

// CityParams → クエリ文字列（既定値は省略し、既存URLと互換に保つ）
function toQuery(p: CityParams): string {
    const parts: string[] = []
    if (p.month) parts.push(`month=${p.month}`)
    if (p.date) parts.push(`date=${p.date}`)
    if (p.dist) parts.push(`dist=${p.dist}`)
    if (p.sort) parts.push(`sort=${p.sort}`)
    return parts.join('&')
}

export default function CityClient({ initial, s }: { initial: CityView; s: CityStatic }) {
    const [view, setView] = useState<CityView>(initial)
    const [loading, setLoading] = useState(false)
    const cacheRef = useRef<Map<string, CityView>>(new Map())
    const reqId = useRef(0)

    const fetchView = useCallback(async (p: CityParams, replaceUrl = true) => {
        const q = toQuery(p)
        if (replaceUrl && typeof window !== 'undefined') {
            window.history.replaceState(null, '', q ? `/city?${q}` : '/city')
        }
        const hit = cacheRef.current.get(q)
        if (hit) { setView(hit); return }
        const id = ++reqId.current
        setLoading(true)
        try {
            const res = await fetch(`/api/city/view${q ? `?${q}` : ''}`, { cache: 'force-cache' })
            if (!res.ok) throw new Error(String(res.status))
            const data = (await res.json()) as CityView
            cacheRef.current.set(q, data)
            if (id === reqId.current) setView(data)
        } catch {
            /* 失敗時は現状維持 */
        } finally {
            if (id === reqId.current) setLoading(false)
        }
    }, [])

    // 深いリンク（?month=... 等）で開かれた場合、静的HTMLは既定ビューなので一度だけ正しい条件を取得
    useEffect(() => {
        if (typeof window === 'undefined') return
        const sp = new URLSearchParams(window.location.search)
        const p: CityParams = {
            month: sp.get('month') ?? undefined, date: sp.get('date') ?? undefined,
            dist: sp.get('dist') ?? undefined, sort: sp.get('sort') ?? undefined,
        }
        const q = toQuery(p)
        // 既定（クエリ無し）なら初期SSRのまま。差異があれば取得。
        cacheRef.current.set('', initial)
        if (q) fetchView(p, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { isAll, selMonth, selDate, dates, distScope, distSort, dist, distList, maxWins, adoption, dayEvents, cache, autoMap, totalDecks } = view

    return (
        <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            {/* Month select */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold text-gray-500">月</span>
                <button onClick={() => fetchView({ month: 'all' })} className={tabCls(isAll)}>全期間</button>
                {s.months.map(m => (
                    <button key={m} onClick={() => fetchView({ month: m })} className={tabCls(!isAll && m === selMonth)}>{fmtMonth(m)}</button>
                ))}
            </div>
            {/* Date tabs */}
            <div className="flex items-center gap-2 flex-wrap mb-5">
                <span className="text-xs font-bold text-gray-500">日付</span>
                {dates.map(d => (
                    <button key={d} onClick={() => fetchView({ month: selMonth, date: d })} className={tabCls(!isAll && d === selDate)}>{fmtDate(d)}</button>
                ))}
                {isAll
                    ? <span className="text-xs text-gray-400 ml-1">全期間のデッキ分布を表示中（日付を選ぶとその日の大会結果）</span>
                    : <span className="text-xs text-gray-500 ml-1">大会 {dayEvents.length}／入賞 {totalDecks}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Distribution */}
                <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                        <h2 className="text-base font-black text-gray-900">デッキ分布</h2>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-2 py-0.5 shrink-0">{dist.resolved}デッキ</span>
                    </div>
                    {isAll ? (
                        <div className="flex items-center gap-1 mb-3 flex-wrap">
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold border bg-indigo-600 text-white border-indigo-600">全期間</span>
                            {([['use', '使用率'], ['win', '優勝数']] as const).map(([k, label]) => (
                                <button key={k} onClick={() => fetchView({ month: 'all', sort: k })}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${distSort === k
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{label}</button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mb-3 flex-wrap">
                            {([['day', 'この日付'], ['month', '今月']] as const).map(([k, label]) => (
                                <button key={k} onClick={() => fetchView({ month: selMonth, date: selDate, dist: k, sort: distSort })}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${distScope === k
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{label}</button>
                            ))}
                            <span className="w-px h-4 bg-gray-200 mx-0.5" />
                            {([['use', '使用率'], ['win', '優勝数']] as const).map(([k, label]) => (
                                <button key={k} onClick={() => fetchView({ month: selMonth, date: selDate, dist: distScope, sort: k })}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${distSort === k
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{label}</button>
                            ))}
                        </div>
                    )}
                    {distList.length ? (
                        <div className="space-y-1">
                            {distList.slice(0, 12).map((d, i) => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 w-4 text-right shrink-0">{i + 1}</span>
                                    <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{d.name}</span>
                                    {distSort === 'win' ? (
                                        <>
                                            <div className="w-20 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                                                <div className="h-full bg-amber-500" style={{ width: `${(d.wins / maxWins) * 100}%` }} />
                                            </div>
                                            <span className="text-sm font-black text-amber-600 w-14 text-right shrink-0">{d.wins}<span className="text-[10px] font-bold ml-0.5">優勝</span></span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                                                <div className="h-full bg-indigo-500" style={{ width: `${d.rate}%` }} />
                                            </div>
                                            <span className="text-sm font-black text-indigo-700 w-14 text-right shrink-0">{d.rate}%</span>
                                        </>
                                    )}
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
                                    <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{c.name}</span>
                                    <div className="w-20 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                                        <div className="h-full bg-emerald-500" style={{ width: `${c.rate}%` }} />
                                    </div>
                                    <span className="text-sm font-black text-emerald-700 w-14 text-right shrink-0">{c.rate}%</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-sm text-gray-500">データが集まると採用率が表示されます。</p>}
                    <datalist id="city-card-names">{s.cardNames.map(n => <option key={n} value={n} />)}</datalist>
                    <CardAdoptionSearch counts={s.cardCounts} total={s.total} cardNames={s.cardNames} />
                    <WatchlistAdmin initial={s.watchlist} cardNames={s.cardNames} />
                </section>
            </div>

            {/* Events */}
            {isAll ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                    全期間のデッキ分布を表示中です。個別の大会結果を見るには、上の<span className="font-bold text-gray-700">「日付」</span>を選択してください。
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayEvents.map(ev => <EventCard key={ev.event_holding_id} ev={ev} cache={cache} autoMap={autoMap} />)}
                    </div>
                    {dayEvents.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">この日付の大会はありません。</div>
                    )}
                </>
            )}
        </div>
    )
}
