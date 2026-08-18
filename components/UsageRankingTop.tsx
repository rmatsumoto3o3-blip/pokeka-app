'use client'

import { useState } from 'react'
import Link from 'next/link'

// 使用率ランキング（deckArchive集計・Supabase不使用）。直近2週間／2ヶ月の窓を切替。

type RankRow = { archetype: string; total: number; win: number }

export default function UsageRankingTop({ r2w, r2m, total2w, total2m }: { r2w: RankRow[]; r2m: RankRow[]; total2w: number; total2m: number }) {
    const [mode, setMode] = useState<'2w' | '2m'>('2w')
    const ranking = mode === '2w' ? r2w : r2m
    const total = mode === '2w' ? total2w : total2m
    if ((r2w.length + r2m.length) === 0) return null

    const top = ranking.slice(0, 12)
    const max = top[0]?.total || 1

    return (
        <section className="bg-white border-b border-[#eef1f6]">
            <div className="max-w-[1080px] mx-auto px-5 py-5">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-blue-500 rounded-full" />使用率ランキング
                    </h2>
                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                        <button onClick={() => setMode('2w')} className={`px-2.5 py-1 rounded-md text-xs font-bold ${mode === '2w' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>直近2週間</button>
                        <button onClick={() => setMode('2m')} className={`px-2.5 py-1 rounded-md text-xs font-bold ${mode === '2m' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}>直近2ヶ月</button>
                    </div>
                </div>
                <p className="text-[11px] text-gray-500 mb-3">{mode === '2w' ? '直近2週間' : '直近2ヶ月'}の大会入賞デッキでの使用数（多い順・全{total.toLocaleString()}デッキ）。数字はデッキ数／うち優勝数。</p>

                {top.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center">この期間のデータがまだありません。</p>
                ) : (
                    <div className="space-y-1.5">
                        {top.map((r, i) => {
                            const rate = total > 0 ? (r.total / total) * 100 : 0
                            return (
                                <div key={r.archetype} className="flex items-center gap-3">
                                    <span className={`w-6 text-right text-sm font-black ${i < 3 ? 'text-blue-600' : 'text-gray-400'}`}>{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-bold text-gray-900 truncate">{r.archetype}</span>
                                            <span className="text-xs text-gray-500 shrink-0">
                                                {r.total.toLocaleString()}件<span className="text-gray-300"> / </span><span className="text-amber-600 font-bold">優勝{r.win}</span>
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(2, (r.total / max) * 100)}%` }} />
                                        </div>
                                    </div>
                                    <span className="w-12 text-right text-[11px] text-gray-400 shrink-0">{rate.toFixed(1)}%</span>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div className="mt-3 text-right">
                    <Link href="/env" className="text-sm text-blue-600 font-semibold">環境デッキを見る ›</Link>
                </div>
            </div>
        </section>
    )
}
