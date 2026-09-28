'use client'
import { useMemo, useState } from 'react'

// 任意カードの採用率を検索して表示（全期間・全デッキが母数）。誰でも使える。
export default function CardAdoptionSearch({ counts, total, cardNames }: {
    counts: Record<string, number>; total: number; cardNames: string[]
}) {
    const [q, setQ] = useState('')
    const kw = q.trim()

    // 入力に一致する候補（前方/部分一致、上位8件）
    const suggestions = useMemo(() => {
        if (!kw) return []
        return cardNames.filter(n => n.includes(kw)).slice(0, 8)
    }, [kw, cardNames])

    const exact = counts[kw] !== undefined ? kw : (suggestions.length === 1 ? suggestions[0] : '')
    const shown = exact || (suggestions.includes(kw) ? kw : '')
    const cnt = shown ? (counts[shown] || 0) : 0
    const rate = shown && total ? +(cnt / total * 100).toFixed(1) : 0

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-gray-700">カード採用率を検索</span>
                <span className="text-[10px] text-gray-400">全期間 {total}デッキ中</span>
            </div>
            <input value={q} onChange={e => setQ(e.target.value)} list="city-card-names"
                placeholder="カード名を入力（例：ネストボール）"
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-900" />
            {kw && (
                shown ? (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="flex-1 text-sm font-bold text-gray-800 truncate">{shown}</span>
                        <div className="w-24 h-2 bg-gray-100 rounded overflow-hidden shrink-0">
                            <div className="h-full bg-emerald-500" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-sm font-black text-emerald-700 w-16 text-right shrink-0">{rate}%</span>
                        <span className="text-[10px] text-gray-400 w-14 text-right shrink-0">{cnt}デッキ</span>
                    </div>
                ) : (
                    suggestions.length > 0
                        ? <div className="mt-2 flex flex-wrap gap-1">
                            {suggestions.map(s => (
                                <button key={s} onClick={() => setQ(s)} className="text-[11px] bg-gray-100 hover:bg-gray-200 rounded px-2 py-0.5 text-gray-700">{s}</button>
                            ))}
                        </div>
                        : <p className="mt-2 text-[11px] text-gray-400">該当するカードがありません。</p>
                )
            )}
        </div>
    )
}
