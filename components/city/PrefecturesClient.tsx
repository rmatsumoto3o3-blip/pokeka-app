'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PrefView, PrefParams } from '@/lib/cityView'

const fmtMonth = (m: string) => `${+m.slice(0, 4)}年${+m.slice(4, 6)}月`

const tab = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm font-bold border ${active
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`

function keyOf(p: PrefParams): string {
    const parts: string[] = []
    if (p.period && p.period !== 'all') parts.push(`period=${p.period}`)
    if (p.region && p.region !== 'all') parts.push(`region=${p.region}`)
    return parts.join('&')
}

export default function PrefecturesClient({ initial }: { initial: PrefView }) {
    const [view, setView] = useState<PrefView>(initial)
    const [loading, setLoading] = useState(false)
    const cacheRef = useRef<Map<string, PrefView>>(new Map([['', initial]]))
    const reqId = useRef(0)

    const go = useCallback(async (p: PrefParams, replaceUrl = true) => {
        const q = keyOf(p)
        if (replaceUrl && typeof window !== 'undefined') {
            window.history.replaceState(null, '', q ? `/city/prefectures?${q}` : '/city/prefectures')
        }
        const hit = cacheRef.current.get(q)
        if (hit) { setView(hit); return }
        const id = ++reqId.current
        setLoading(true)
        try {
            const res = await fetch(`/api/city/prefectures${q ? `?${q}` : ''}`, { cache: 'force-cache' })
            if (!res.ok) throw new Error(String(res.status))
            const data = await res.json() as PrefView
            cacheRef.current.set(q, data)
            if (id === reqId.current) setView(data)
        } catch { /* 現状維持 */ }
        finally { if (id === reqId.current) setLoading(false) }
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const sp = new URLSearchParams(window.location.search)
        const p: PrefParams = { period: sp.get('period') ?? undefined, region: sp.get('region') ?? undefined }
        if (keyOf(p)) go(p, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { months, regions, period, regionKey, prefDist, totalDecks } = view
    const regionLabel = regions.find(r => r.key === regionKey)?.label

    return (
        <>
            {/* 期間フィルタ */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs font-bold text-gray-500 w-10">期間</span>
                <button onClick={() => go({ period: 'all', region: regionKey })} className={tab(period === 'all')}>全期間</button>
                {months.map(m => (
                    <button key={m} onClick={() => go({ period: m, region: regionKey })} className={tab(period === m)}>{fmtMonth(m)}</button>
                ))}
            </div>
            {/* 地域フィルタ */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="text-xs font-bold text-gray-500 w-10">地域</span>
                <button onClick={() => go({ period, region: 'all' })} className={tab(regionKey === 'all')}>全国</button>
                {regions.map(r => (
                    <button key={r.key} onClick={() => go({ period, region: r.key })} className={tab(regionKey === r.key)}>{r.label}</button>
                ))}
            </div>

            <div className="text-xs text-gray-500 mb-4">
                {period === 'all' ? '全期間' : fmtMonth(period)}・{regionLabel ?? '全国'}
                ／{prefDist.length}都道府県・{totalDecks}デッキ
            </div>

            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                {prefDist.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {prefDist.map(p => (
                            <div key={p.prefecture} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex items-baseline justify-between mb-3">
                                    <span className="font-black text-gray-900">{p.prefecture}</span>
                                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 rounded px-2 py-0.5 shrink-0">{p.total}デッキ</span>
                                </div>
                                <div className="space-y-1.5">
                                    {p.list.slice(0, 5).map((d, i) => (
                                        <div key={d.name} className="flex items-center gap-1.5">
                                            <span className="text-[10px] text-gray-400 w-3 text-right shrink-0">{i + 1}</span>
                                            <span className="flex-1 min-w-0 text-xs text-gray-800 truncate">{d.name}</span>
                                            <div className="w-14 h-1.5 bg-gray-100 rounded overflow-hidden shrink-0">
                                                <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, d.rate)}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-indigo-700 w-9 text-right shrink-0">{d.rate}%</span>
                                        </div>
                                    ))}
                                    {p.list.length > 5 && <div className="text-[10px] text-gray-400 pl-4">ほか{p.list.length - 5}型</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
                        この条件のデータがありません。期間や地域を変えてお試しください。
                    </div>
                )}
            </div>
        </>
    )
}
